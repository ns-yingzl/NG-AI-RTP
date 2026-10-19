#!/usr/bin/env bash
#
# bootstrap.sh — one-shot setup for a fresh Periskope prototype.
#
# Idempotent: safe to re-run. Pulls vendored AI docs at the pinned mf-app-core
# SHA, installs @netskope-ui/* dependencies, and prints a "you're ready" message.
#
# Requires:
#   - node 18+
#   - yarn (or npm)
#   - gh CLI, authenticated to github.com/netSkope (for vendoring AI docs)
#   - To install @netskope-ui/* packages: corp VPN access OR a configured corp
#     npm registry token. If neither is available, install-ds.sh automatically
#     falls back to the off-VPN snapshot (a prebuilt mirror on GitHub Releases) —
#     this needs public internet + gh access, not the corp network.

set -euo pipefail

cd "$(dirname "$0")"

PINNED_SHA="$(cat PINNED_SHA | tr -d '[:space:]')"

cyan() { printf '\033[36m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
red() { printf '\033[31m%s\033[0m\n' "$*"; }

# Ensure a Yarn Classic (1.x) is the active `yarn`. The off-VPN offline-mirror
# install (scripts/install-ds.sh) uses Yarn Classic's `--use-yarnrc`, which Yarn
# 2+/Berry rejects ("Unknown Syntax Error: --use-yarnrc is not supported"). We
# only step in when the active yarn is Berry (or missing) so a working Classic
# setup is never disturbed: corepack + the pinned `packageManager` field in
# package.json then provide Classic 1.22.x.
ensure_yarn() {
    if command -v yarn >/dev/null 2>&1; then
        local major
        major="$(yarn --version 2>/dev/null | cut -d. -f1)"
        [ "${major:-}" = "1" ] && return 0
        yellow "Detected Yarn ${major:-?} (Berry). The off-VPN install needs Yarn Classic (1.x)."
    fi
    if command -v corepack >/dev/null 2>&1 && corepack enable >/dev/null 2>&1; then
        hash -r 2>/dev/null || true
        green "  Enabled corepack — 'yarn' now uses the pinned Classic version (see package.json)."
    else
        yellow "  Couldn't set up Yarn Classic automatically. Fix it with:"
        yellow "    corepack enable      (or: npm i -g yarn@1.22.22)"
        yellow "  then re-run ./bootstrap.sh. See README → Troubleshooting."
    fi
}

# Automatic-mode setup: set the DEPLOY_MODE repo variable to "automatic" and point
# Pages at GitHub Actions. No token needed — CI installs @netskope-ui/* on
# Netskope's internal ARC runner, which already has corp Artifactory access.
# Best-effort — the Pages step needs repo admin, so it always falls back to a
# printed instruction.
setup_automatic_deploy() {
    if ! gh variable set DEPLOY_MODE --body automatic; then
        yellow "  Skipped/failed. Set it later:  gh variable set DEPLOY_MODE --body automatic   (see DEPLOYMENT.md)"
        return 0
    fi
    green "  ✓ DEPLOY_MODE set to 'automatic'."

    # Point Pages "Source" at GitHub Actions (best-effort; needs repo admin).
    local slug owner repo
    slug="$(git remote get-url origin 2>/dev/null | sed -E 's#^.*github\.com[:/]##; s#\.git$##')"
    owner="${slug%%/*}"; repo="${slug##*/}"
    if [ -n "$owner" ] && [ -n "$repo" ] && [ "$owner" != "$slug" ]; then
        if gh api "repos/$owner/$repo/pages" >/dev/null 2>&1; then
            gh api -X PUT "repos/$owner/$repo/pages" -f build_type=workflow >/dev/null 2>&1 \
                && green "  ✓ Pages source set to GitHub Actions." \
                || yellow "  Last step by hand: Settings -> Pages -> Source: GitHub Actions."
        elif gh api -X POST "repos/$owner/$repo/pages" -f build_type=workflow >/dev/null 2>&1; then
            green "  ✓ Enabled Pages (source: GitHub Actions)."
        else
            yellow "  Last step by hand: Settings -> Pages -> Source: GitHub Actions."
        fi
    else
        yellow "  Last step by hand: Settings -> Pages -> Source: GitHub Actions."
    fi
    green "  Done — push to main (or run the workflow) to deploy."
}

# First-run: let the designer pick how to publish their prototype to GitHub Pages.
#   Automatic — CI deploys on every push to main. Zero setup beyond flipping a repo
#               variable: CI installs @netskope-ui/* on Netskope's internal ARC
#               runner, which already has corp Artifactory access (see DEPLOYMENT.md).
#   Manual    — `yarn deploy` builds + publishes from this machine.
# Best-effort and skippable — never blocks bootstrap, never prompts in CI/pipes.
choose_deploy_mode() {
    [ -f .github/workflows/deploy-pages.yml ] || return 0

    # Don't nag in the template repo itself.
    case "$(git remote get-url origin 2>/dev/null || true)" in
        *ux-starter-periskope*) return 0 ;;
    esac

    # Already set up? Automatic = DEPLOY_MODE=automatic; Manual = gh-pages branch exists.
    [ "$(gh variable get DEPLOY_MODE 2>/dev/null || true)" = "automatic" ] && return 0
    git ls-remote --exit-code --heads origin gh-pages >/dev/null 2>&1 && return 0

    # Only prompt on an interactive terminal (skipped in CI / pipes).
    [ -t 0 ] && [ -t 1 ] || return 0

    echo
    yellow "🌐 Publish your prototype to a shareable link (GitHub Pages)?"
    cat <<'EOF'

  [1] Automatic  (recommended) — publishes on every 'git push'
      No token needed — CI builds on Netskope's internal runner. One
      repo variable to flip (I'll do it now), then it's fully hands-off.

  [2] Manual — you publish with 'yarn deploy'
      No setup, but you run a command each time.

  [3] Not now — decide later (see DEPLOYMENT.md)

EOF
    printf "  Pick 1 / 2 / 3 [1]: "
    local ans=""
    read -r ans || true
    case "$ans" in
        "" | 1)
            setup_automatic_deploy
            ;;
        2)
            echo
            green "  Manual mode. Whenever you want to publish, run:"
            echo "    yarn deploy"
            echo "  The first run builds the site, creates the link, and prints the URL."
            echo "  (The CI workflow stays dormant until DEPLOY_MODE is set to 'automatic'.)"
            ;;
        3)
            echo "  Skipped. Set up either option later — see DEPLOYMENT.md."
            ;;
        *)
            echo "  Unrecognized choice — skipped. See DEPLOYMENT.md to set up later."
            ;;
    esac
}

cyan "Bootstrapping Periskope prototype (mf-app-core @ ${PINNED_SHA:0:8})"
echo

# 1. Sanity: required tools
for cmd in node gh; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        red "Missing required tool: $cmd"
        echo "  - node: https://nodejs.org (v18 or newer)"
        echo "  - gh: https://cli.github.com (then run \`gh auth login\`)"
        exit 1
    fi
done

# Make sure a Yarn Classic (1.x) is active before selecting the package manager.
ensure_yarn

if ! command -v yarn >/dev/null 2>&1 && ! command -v npm >/dev/null 2>&1; then
    red "Missing required tool: yarn or npm"
    exit 1
fi

PKG_MGR=$(command -v yarn >/dev/null 2>&1 && echo yarn || echo npm)
cyan "Using $PKG_MGR"

# 2. Vendor AI docs
cyan "Pulling AI docs from mf-app-core@${PINNED_SHA:0:8}..."
./scripts/vendor-ai-docs.sh

# 3. Install design system + Next.js deps
cyan "Installing dependencies..."
./scripts/install-ds.sh

# 4. Build the machine-derived component→artifacts index (reads node_modules)
cyan "Generating component index..."
node scripts/generate-component-index.mjs

echo
green "✓ Setup complete"
echo
cat <<'EOF'
Next steps:
  1. yarn dev    — start the Next.js prototype server
  2. open http://localhost:3000
  3. claude      — start a Claude Code session in this directory

Example pages already wired up:
  /                      — home with example cards
  /examples/policies     — list+detail layout
  /examples/tenant-settings — settings page layout

In Claude Code, try:
  /find-component table
  /new-page my-feature  (planned in v1; for now describe the layout in prose)

To publish to a shareable link: choose Automatic ('git push') or Manual
('yarn deploy') below, or set it up later — see DEPLOYMENT.md.

If anything broke, see README.md → Troubleshooting.
EOF

choose_deploy_mode
