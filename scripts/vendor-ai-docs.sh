#!/usr/bin/env bash
#
# vendor-ai-docs.sh — fetch AI-friendly docs from mf-app-core@PINNED_SHA into
# .ai-context/. Run on bootstrap and via `yarn refresh-ds`.
#
# Why vendor instead of git-submodule: mf-app-core is ~100MB+ and most of it
# is irrelevant. With a sparse + blob-filtered clone we pull only the docs
# Claude actually reads (~400KB total).
#
# Why SSH+git instead of `gh api` / HTTPS: every designer already has git+SSH
# set up to clone mf-app-core. `gh` may not be installed or authenticated, and
# HTTPS to api.github.com may hit corp MITM issues.

set -euo pipefail

cd "$(dirname "$0")/.."

PINNED_SHA="$(cat PINNED_SHA | tr -d '[:space:]')"
REPO_SSH="git@github.com:netSkope/mf-app-core.git"

# (source-in-repo, dest-in-.ai-context). Same path if only one given.
declare -a FILES=(
    "llms.txt"
    "llms-full.txt"
    "LIBRARY_REFERENCE.md"
    "TAILWIND_CHEATSHEET.md"
    "INTENT_KEYWORDS_GUIDE.md"
    "REACT_HOOK_FORM_GUIDE.md"
    "CLAUDE.md:CLAUDE.mf-app-core.md"
    "public/registry/index.json:registry/index.json"
)

TMP="$(mktemp -d "${TMPDIR:-/tmp}/periskope-vendor.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

echo "  cloning sparse mf-app-core at ${PINNED_SHA:0:8}..."
git clone -q --filter=blob:none --no-checkout "$REPO_SSH" "$TMP"
(
    cd "$TMP"
    git sparse-checkout init --no-cone
    # Sparse paths must be path patterns; one per line via stdin
    {
        for entry in "${FILES[@]}"; do
            echo "/${entry%%:*}"
        done
        # Also vendor Storybook stories + Code Connect (*.figma) sources. These
        # live only in mf-app-core (not in the published dist), and they are the
        # source of truth for *composition* (stories) and Figma→component name
        # mapping (figma). See .ai-context/stories/ and .ai-context/code-connect/.
        echo "/packages/**/*.stories.js"
        echo "/packages/**/*.stories.jsx"
        echo "/packages/**/*.stories.ts"
        echo "/packages/**/*.stories.tsx"
        echo "/packages/**/*.stories.mdx"
        echo "/packages/**/*.figma.ts"
        echo "/packages/**/*.figma.tsx"
    } | git sparse-checkout set --stdin
    git checkout -q "$PINNED_SHA"
)

mkdir -p .ai-context/registry
for entry in "${FILES[@]}"; do
    src="${entry%%:*}"
    dst="${entry##*:}"
    if [ "$src" = "$dst" ]; then
        dst="$src"
    fi
    out=".ai-context/$dst"
    mkdir -p "$(dirname "$out")"
    if [ -f "$TMP/$src" ]; then
        cp "$TMP/$src" "$out"
        echo "  ✓ $src → .ai-context/$dst"
    else
        echo "  ✗ $src not found in repo at $PINNED_SHA"
        exit 1
    fi
done

# Vendor stories + Code Connect sources, preserving the package-relative path
# (e.g. packages/tabs/src/storybook/Page.stories.js → .ai-context/stories/tabs/src/storybook/Page.stories.js).
rm -rf .ai-context/stories .ai-context/code-connect
story_count=0
figma_count=0
while IFS= read -r f; do
    rel="${f#"$TMP"/packages/}"
    mkdir -p ".ai-context/stories/$(dirname "$rel")"
    cp "$f" ".ai-context/stories/$rel"
    story_count=$((story_count + 1))
done < <(find "$TMP/packages" -type f \( -name '*.stories.js' -o -name '*.stories.jsx' -o -name '*.stories.ts' -o -name '*.stories.tsx' -o -name '*.stories.mdx' \) 2>/dev/null)
while IFS= read -r f; do
    rel="${f#"$TMP"/packages/}"
    mkdir -p ".ai-context/code-connect/$(dirname "$rel")"
    cp "$f" ".ai-context/code-connect/$rel"
    figma_count=$((figma_count + 1))
done < <(find "$TMP/packages" -type f \( -name '*.figma.ts' -o -name '*.figma.tsx' \) 2>/dev/null)
echo "  ✓ ${story_count} stories → .ai-context/stories/"
echo "  ✓ ${figma_count} Code Connect files → .ai-context/code-connect/"

echo "$PINNED_SHA" > .ai-context/.pinned-sha
date -u +"%Y-%m-%dT%H:%M:%SZ" > .ai-context/.pulled-at

echo "✓ Vendored ${#FILES[@]} docs + ${story_count} stories + ${figma_count} Code Connect files from netSkope/mf-app-core@${PINNED_SHA:0:8}"
