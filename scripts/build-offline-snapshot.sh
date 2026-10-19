#!/usr/bin/env bash
#
# build-offline-snapshot.sh — (MAINTAINER, ON VPN) build + publish the off-VPN
# install fallback.
#
# What it produces: a yarn "offline mirror" containing only the private
# @netskope-ui/* package tarballs that the current yarn.lock resolves to, packed
# into a single .tgz and uploaded as a GitHub Release asset on the template repo.
# The asset name is keyed to the yarn.lock hash so a designer always downloads
# the snapshot that matches their checked-out lockfile.
#
# Designers OFF VPN consume it via:  ./scripts/install-ds.sh --offline
# (which downloads the asset, seeds the offline mirror, and installs the private
#  scope from the mirror while public deps still come from public npm). The
# corp registry is never contacted.
#
# This is a FALLBACK. The normal on-VPN install path is unchanged.
#
# How it works: it reads the exact tarball URLs + integrity hashes straight from
# yarn.lock and downloads them, naming each file the way yarn expects to find it
# in an offline mirror: "@<scope>-<name>-<version>.tgz" (verified against yarn
# 1.22). We download directly (rather than via `yarn install`) because yarn does
# NOT copy cache-served tarballs into the mirror — so a full install on a warm
# machine yields an incomplete mirror. Direct download is complete by
# construction and lets us verify every tarball's checksum.
#
# Requires: on corp VPN (or a corp registry token), node, curl, and (unless
#           --no-upload) gh authenticated with write access to the template repo.
#
# Usage:
#   ./scripts/build-offline-snapshot.sh              build + upload
#   ./scripts/build-offline-snapshot.sh --no-upload  build + pack locally only (dry run)
#
# Re-run whenever yarn.lock changes (e.g. after `yarn refresh-ds`).

set -euo pipefail
cd "$(dirname "$0")/.."

REPO="${OFFLINE_SNAPSHOT_REPO:-netSkope/ux-starter-periskope}"
RELEASE_TAG="ds-offline-mirror"
MIRROR_DIR=".yarn-offline-mirror"

NO_UPLOAD=0
[ "${1:-}" = "--no-upload" ] && NO_UPLOAD=1

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
cyan() { printf '\033[36m%s\033[0m\n' "$*"; }

# --- preflight -------------------------------------------------------------
for cmd in node curl; do
    command -v "$cmd" >/dev/null 2>&1 || { red "Missing required tool: $cmd"; exit 1; }
done
[ -f yarn.lock ] || { red "No yarn.lock — run an on-VPN install first."; exit 1; }
if [ "$NO_UPLOAD" -eq 0 ]; then
    command -v gh >/dev/null 2>&1 || { red "Missing gh (or pass --no-upload)."; exit 1; }
    gh auth status >/dev/null 2>&1 || { red "gh is not authenticated. Run: gh auth login"; exit 1; }
fi

sha256() { if command -v shasum >/dev/null 2>&1; then shasum -a 256 "$1"; else sha256sum "$1"; fi; }
sha512_b64() { openssl dgst -sha512 -binary "$1" | openssl base64 -A; }
LOCK_HASH="$(sha256 yarn.lock | cut -c1-12)"
ASSET="netskope-ui-mirror-${LOCK_HASH}.tgz"

cyan "Building off-VPN snapshot for yarn.lock@${LOCK_HASH} → ${ASSET}"

# --- 1. parse yarn.lock → (mirror-filename, url, integrity) for @netskope-ui --
# yarn's offline-mirror filename for a scoped registry tarball is
# "@<scope>-<name>-<version>.tgz" (scope's "/" replaced by "-").
ENTRIES="$(node -e '
const fs=require("fs"),path=require("path");
const lines=fs.readFileSync("yarn.lock","utf8").split("\n");
let url=null;
for(const ln of lines){
  const r=ln.match(/^\s+resolved\s+"([^"]+)"/); if(r){url=r[1];continue;}
  const i=ln.match(/^\s+integrity\s+(\S+)/);
  if(i&&url&&url.includes("@netskope-ui")){
    const clean=url.split("#")[0];
    const scope=(clean.match(/@[^/]+/)||[""])[0];          // e.g. @netskope-ui
    const fname=scope+"-"+path.basename(clean);            // @netskope-ui-core-12.2.2.tgz
    console.log([fname,clean,i[1]].join("\t")); url=null;
  }
}')"
[ -n "$ENTRIES" ] || { red "No @netskope-ui entries found in yarn.lock."; exit 1; }

# --- 2. download each tarball into the mirror + verify integrity -----------
rm -rf "$MIRROR_DIR"; mkdir -p "$MIRROR_DIR"
count=0
while IFS=$'\t' read -r fname url integ; do
    [ -n "$fname" ] || continue
    curl -fsSL -m 120 -o "$MIRROR_DIR/$fname" "$url" \
        || { red "Download failed (are you on VPN?): $url"; exit 1; }
    want="${integ#sha512-}"
    got="$(sha512_b64 "$MIRROR_DIR/$fname")"
    [ "$got" = "$want" ] || { red "Integrity mismatch for $fname"; exit 1; }
    count=$((count + 1))
done <<< "$ENTRIES"
green "Downloaded + checksum-verified $count private tarball(s) ($(du -sh "$MIRROR_DIR" | cut -f1))"

# --- 3. pack the mirror ----------------------------------------------------
PACK="$(pwd)/$ASSET"
tar czf "$PACK" -C "$MIRROR_DIR" .
green "Packed snapshot: $PACK ($(du -h "$PACK" | cut -f1))"

if [ "$NO_UPLOAD" -eq 1 ]; then
    echo
    cyan "--no-upload: skipping GitHub release. Inspect the snapshot above, or test the"
    cyan "consume side with:  OFFLINE_SNAPSHOT_FILE=\"$PACK\" ./scripts/install-ds.sh --offline"
    exit 0
fi

# --- 4. upload as a Release asset (keyed by lockfile hash) -----------------
if ! gh release view "$RELEASE_TAG" --repo "$REPO" >/dev/null 2>&1; then
    cyan "Creating release '$RELEASE_TAG' on ${REPO}..."
    gh release create "$RELEASE_TAG" --repo "$REPO" \
        --title "Design-system offline mirror (off-VPN install fallback)" \
        --notes "Private @netskope-ui/* tarball mirrors for off-VPN installs. One asset per yarn.lock hash, named netskope-ui-mirror-<hash>.tgz. Built by scripts/build-offline-snapshot.sh; consumed by scripts/install-ds.sh --offline. Do not edit by hand."
fi
gh release upload "$RELEASE_TAG" "$PACK" --repo "$REPO" --clobber
rm -f "$PACK"

green "✓ Uploaded $ASSET to $REPO (release: $RELEASE_TAG)"
echo
echo "Designers off VPN can now run:  ./scripts/install-ds.sh --offline"
