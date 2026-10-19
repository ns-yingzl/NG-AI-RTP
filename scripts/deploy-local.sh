#!/usr/bin/env bash
#
# deploy-local.sh — "Manual" deploy mode: build the prototype on YOUR machine and
# publish it to GitHub Pages. No token, no CI, no cross-repo snapshot fetch.
#
# This is the counterpart to the "Automatic" CI workflow
# (.github/workflows/deploy-pages.yml). The CI path needs a PAT only because its
# runner is off-VPN and can't install @netskope-ui/*. Your machine is on-VPN and
# already has the design system installed (from bootstrap), so it can just build
# and push the result — sidestepping the PAT entirely. See DEPLOYMENT.md.
#
# What it does:
#   1. Static-exports the app to ./out (BUILD_STATIC_EXPORT + PAGES_BASE_PATH).
#   2. Adds .nojekyll so GitHub Pages serves Next's _next/ assets.
#   3. Force-pushes ./out to the gh-pages branch (via a throwaway git worktree).
#   4. Best-effort points Pages "Source" at the gh-pages branch (needs repo admin).
#   5. Prints your live URL.
#
# Usage:  yarn deploy   (or: ./scripts/deploy-local.sh)

set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$PWD"

red() { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
cyan() { printf '\033[36m%s\033[0m\n' "$*"; }

# --- preflight -------------------------------------------------------------
command -v git >/dev/null 2>&1 || { red "git is required."; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { red "Not a git repo."; exit 1; }

if [ ! -d node_modules ]; then
    red "Dependencies aren't installed yet."
    echo "  Run ./bootstrap.sh first (installs the design system), then retry."
    exit 1
fi

PKG_MGR=$(command -v yarn >/dev/null 2>&1 && echo yarn || echo npm)

# --- figure out where this deploys ----------------------------------------
REMOTE="$(git remote get-url origin 2>/dev/null || true)"
if [ -z "$REMOTE" ]; then
    red "No 'origin' remote — push this repo to GitHub first, then retry."
    exit 1
fi
# owner/repo from either git@github.com:owner/repo.git or https://github.com/owner/repo.git
SLUG="$(printf '%s' "$REMOTE" | sed -E 's#^.*github\.com[:/]##; s#\.git$##')"
OWNER="${SLUG%%/*}"
REPO="${SLUG##*/}"
OWNER_LC="$(printf '%s' "$OWNER" | tr '[:upper:]' '[:lower:]')"
if [ -z "$OWNER" ] || [ -z "$REPO" ] || [ "$OWNER" = "$SLUG" ]; then
    red "Couldn't parse owner/repo from origin: $REMOTE"
    exit 1
fi
URL="https://${OWNER_LC}.github.io/${REPO}/"

# --- 1 + 2. build the static export ---------------------------------------
cyan "Building static site for ${OWNER}/${REPO} (base path /${REPO})…"
BUILD_STATIC_EXPORT=true PAGES_BASE_PATH="/${REPO}" "$PKG_MGR" run build
[ -d out ] || { red "Build finished but ./out doesn't exist — check the build output above."; exit 1; }
touch out/.nojekyll

# --- 3. publish ./out to the gh-pages branch ------------------------------
cyan "Publishing ./out to the gh-pages branch…"
git worktree prune
TMP="$(mktemp -d)"
cleanup() { git worktree remove --force "$TMP" >/dev/null 2>&1 || rm -rf "$TMP"; }
trap cleanup EXIT

# -B resets gh-pages to HEAD; we then replace its contents with ./out and
# force-push, so the branch always reflects exactly the latest build.
if ! git worktree add -B gh-pages "$TMP" >/dev/null 2>&1; then
    red "Couldn't create the gh-pages worktree (a stale one may exist)."
    echo "  Try: git worktree prune && git worktree list"
    exit 1
fi

(
    cd "$TMP"
    # Drop whatever gh-pages currently tracks, then lay down the fresh build.
    # git rm (not raw rm -rf) stays limited to tracked files and stages the
    # removals in one step; '|| true' tolerates an already-empty branch.
    git rm -rfq . >/dev/null 2>&1 || true
    cp -R "$ROOT/out/." .
    touch .nojekyll
    git add -A
    git commit -q -m "Deploy prototype $(date -u +%Y-%m-%dT%H:%M:%SZ)" --allow-empty
    git push -f origin gh-pages
)
green "  ✓ Pushed to gh-pages."

# --- 4. point Pages at the branch (best-effort; needs repo admin) ---------
if command -v gh >/dev/null 2>&1; then
    if gh api "repos/${OWNER}/${REPO}/pages" >/dev/null 2>&1; then
        gh api -X PUT "repos/${OWNER}/${REPO}/pages" \
            -f 'source[branch]=gh-pages' -f 'source[path]=/' >/dev/null 2>&1 \
            && green "  ✓ Pages source set to branch gh-pages." || true
    elif gh api -X POST "repos/${OWNER}/${REPO}/pages" \
            -f 'source[branch]=gh-pages' -f 'source[path]=/' >/dev/null 2>&1; then
        green "  ✓ Enabled Pages (source: branch gh-pages)."
    else
        yellow "  Couldn't set Pages source automatically. Do it once by hand:"
        echo "    repo Settings → Pages → Source: Deploy from a branch → gh-pages / (root)"
    fi
else
    yellow "  (gh CLI not found — set Pages source once by hand:)"
    echo "    repo Settings → Pages → Source: Deploy from a branch → gh-pages / (root)"
fi

# --- 5. done ---------------------------------------------------------------
echo
green "✓ Deployed."
cat <<EOF
  Live URL:  ${URL}
  (First deploy can take ~1 minute to go live. Re-run 'yarn deploy' to update it.)
EOF
