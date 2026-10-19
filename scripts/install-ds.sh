#!/usr/bin/env bash
#
# install-ds.sh — install Next.js + @netskope-ui/* dependencies.
#
# Default (on VPN / corp token): installs everything from the corp registry.
#
# Off-VPN fallback: for designers whose own machine is off VPN (this is a *local
# dev* fallback — CI doesn't need it; the deploy workflow's ARC runner has native
# Artifactory access, see DEPLOYMENT.md). If the normal install fails (or you pass
# --offline), this downloads a prebuilt snapshot of the private @netskope-ui/*
# tarballs from the template repo's GitHub Releases, seeds a yarn "offline mirror"
# with them, and installs — the private scope resolves from the mirror while public
# deps (React, Next, …) come from public npm. No corp VPN required, just public
# internet + GitHub access. The snapshot is built/published by
# scripts/build-offline-snapshot.sh.
#
# Fetching the snapshot, in priority order:
#   - OFFLINE_SNAPSHOT_FILE : a local snapshot .tgz (for testing without GitHub).
#   - OFFLINE_SNAPSHOT_TOKEN or GH_TOKEN : a token with read access to the template
#       repo — downloads the release asset via the GitHub API with curl (no gh
#       needed). Useful if your local gh isn't authenticated.
#   - otherwise : the gh CLI (local dev, where gh is already authenticated).

set -euo pipefail

cd "$(dirname "$0")/.."

REPO="${OFFLINE_SNAPSHOT_REPO:-netSkope/ux-starter-periskope}"
RELEASE_TAG="ds-offline-mirror"
MIRROR_DIR=".yarn-offline-mirror"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }

FORCE_OFFLINE=0
[ "${1:-}" = "--offline" ] && FORCE_OFFLINE=1

if [ -d node_modules ] && [ -f node_modules/.bootstrap-ok ]; then
    echo "  node_modules already populated; skipping. (Delete node_modules/.bootstrap-ok to force a reinstall.)"
    exit 0
fi

sha256() { if command -v shasum >/dev/null 2>&1; then shasum -a 256 "$1"; else sha256sum "$1"; fi; }

# Download a release asset by name from $REPO/$RELEASE_TAG via the GitHub API,
# authenticating with a token (works for private repos, no gh needed). $1=token
# $2=asset name $3=output path. Returns non-zero if the asset isn't found.
api_download_asset() {
    local token="$1" name="$2" out="$3" api="https://api.github.com" rel id
    rel="$(curl -fsSL -H "Authorization: Bearer $token" -H "Accept: application/vnd.github+json" \
           "$api/repos/$REPO/releases/tags/$RELEASE_TAG" 2>/dev/null)" || return 1
    id="$(printf '%s' "$rel" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const a=(JSON.parse(s).assets||[]).find(x=>x.name===process.argv[1]);process.stdout.write(a?String(a.id):"")}catch{}})' "$name")"
    [ -n "$id" ] || return 1
    curl -fsSL -H "Authorization: Bearer $token" -H "Accept: application/octet-stream" \
         -o "$out" "$api/repos/$REPO/releases/assets/$id" || return 1
}

# ---------------------------------------------------------------------------
# Off-VPN install: seed the offline mirror from the published snapshot, then
# install with --frozen-lockfile (so yarn trusts the lockfile, doesn't re-query
# the corp registry for "latest", and fetches the private scope from the mirror).
# ---------------------------------------------------------------------------
install_offline() {
    if ! command -v yarn >/dev/null 2>&1; then
        red "The off-VPN fallback requires yarn (the offline mirror is a yarn feature)."
        return 1
    fi
    [ -f yarn.lock ] || { red "No yarn.lock in repo — cannot do a frozen offline install."; return 1; }

    local lock_hash asset tmp snapshot
    lock_hash="$(sha256 yarn.lock | cut -c1-12)"
    asset="netskope-ui-mirror-${lock_hash}.tgz"
    tmp="$(mktemp -d)"

    # OFFLINE_SNAPSHOT_FILE lets you point at a locally-built snapshot (e.g. from
    # `build-offline-snapshot.sh --no-upload`) to test the consume side without GitHub.
    local token="${OFFLINE_SNAPSHOT_TOKEN:-${GH_TOKEN:-}}"
    if [ -n "${OFFLINE_SNAPSHOT_FILE:-}" ]; then
        [ -f "$OFFLINE_SNAPSHOT_FILE" ] || { red "OFFLINE_SNAPSHOT_FILE not found: $OFFLINE_SNAPSHOT_FILE"; return 1; }
        yellow "Off-VPN install: using local snapshot $OFFLINE_SNAPSHOT_FILE"
        snapshot="$OFFLINE_SNAPSHOT_FILE"
    elif [ -n "$token" ]; then
        # Token path: pull the asset straight from the GitHub API with curl (no
        # gh CLI needed on this machine).
        yellow "Off-VPN install: downloading snapshot ${asset} from ${REPO} via GitHub API…"
        if ! api_download_asset "$token" "$asset" "$tmp/$asset"; then
            rm -rf "$tmp"
            red "Could not download ${asset} from ${REPO} (${lock_hash})."
            cat <<EOF

Either no snapshot is published for this yarn.lock yet, or the token can't read
${REPO}. Check that:
  - a maintainer has run 'yarn build-offline-snapshot' for this lockfile, and
  - OFFLINE_SNAPSHOT_TOKEN / GH_TOKEN is a PAT with read access to ${REPO}
    (Contents: read is enough). See README → Off-VPN install.
EOF
            return 1
        fi
        snapshot="$tmp/$asset"
    elif command -v gh >/dev/null 2>&1; then
        yellow "Off-VPN install: fetching design-system snapshot ${asset} from ${REPO}…"
        if ! gh release download "$RELEASE_TAG" --repo "$REPO" --pattern "$asset" --dir "$tmp" 2>/dev/null; then
            rm -rf "$tmp"
            red "No offline snapshot found matching this repo's yarn.lock (${lock_hash})."
            cat <<EOF

This means nobody has published a snapshot for the current lockfile yet.
A maintainer on VPN needs to run:

    yarn build-offline-snapshot

…which builds the snapshot for this exact yarn.lock and uploads it to the
'${RELEASE_TAG}' release on ${REPO}. Then re-run this off-VPN install.
EOF
            return 1
        fi
        snapshot="$tmp/$asset"
    else
        rm -rf "$tmp"
        red "Can't fetch the snapshot: need OFFLINE_SNAPSHOT_TOKEN / GH_TOKEN, or the gh CLI."
        return 1
    fi

    mkdir -p "$MIRROR_DIR"
    tar xzf "$snapshot" -C "$MIRROR_DIR"
    rm -rf "$tmp"
    green "Seeded offline mirror with $(ls -1 "$MIRROR_DIR"/@netskope-ui-*.tgz 2>/dev/null | wc -l | tr -d ' ') private tarball(s)."

    # Point yarn at the mirror via a throwaway rc so we don't leave offline-mirror
    # config in the repo (which would make on-VPN installs populate it too).
    local rc="$MIRROR_DIR/.install-yarnrc"
    printf 'yarn-offline-mirror "%s/%s"\n' "$(pwd)" "$MIRROR_DIR" > "$rc"

    yellow "Installing (private scope from mirror, public deps from npm)…"
    yarn install --use-yarnrc "$rc" --frozen-lockfile --non-interactive
    rm -f "$rc"
}

# ---------------------------------------------------------------------------
if [ "$FORCE_OFFLINE" -eq 1 ]; then
    install_offline || exit 1
else
    PKG_MGR=$(command -v yarn >/dev/null 2>&1 && echo yarn || echo npm)
    set +e
    $PKG_MGR install
    INSTALL_STATUS=$?
    set -e

    if [ $INSTALL_STATUS -ne 0 ]; then
        cat <<'EOF'

──────────────────────────────────────────────────────────────────────────────
✗ Normal (corp-registry) install failed — you're likely off the corp VPN.
  (Or, if you saw a "self-signed certificate" TLS error above, the Netskope
   client's SSL inspection is intercepting the download — see the note below.)

Trying the off-VPN fallback: download the prebuilt @netskope-ui snapshot from
GitHub and install the private scope from a local mirror instead.
──────────────────────────────────────────────────────────────────────────────
EOF
        if ! install_offline; then
            cat <<'EOF'

The off-VPN fallback did not complete. Options:
  - If you saw "self-signed certificate in certificate chain" / "unable to get
    local issuer certificate", the Netskope client's TLS inspection is breaking
    HTTPS. Temporarily pause/disable the Netskope client, re-run bootstrap, then
    re-enable it. (See README → Troubleshooting.)
  - Get on the corp VPN (or configure a corp registry token in ~/.npmrc) and
    re-run, OR
  - Ask a maintainer to publish a snapshot for this yarn.lock (see the message
    above), then re-run:  ./scripts/install-ds.sh --offline
──────────────────────────────────────────────────────────────────────────────
EOF
            exit 1
        fi
    fi
fi

touch node_modules/.bootstrap-ok
green "✓ Dependencies installed"
