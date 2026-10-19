# .ai-context/

Vendored AI-friendly docs from `netSkope/mf-app-core` at the SHA in `/PINNED_SHA`.
Populated by `scripts/vendor-ai-docs.sh` (runs on bootstrap and on `yarn refresh-ds`).

**Files (all gitignored — pulled fresh per environment):**

| File | Source path in mf-app-core | Purpose |
|------|---------------------------|---------|
| `llms.txt` | `/llms.txt` | llmstxt.org-format index of the library |
| `llms-full.txt` | `/llms-full.txt` | Self-contained reference with every component, prop, and example |
| `LIBRARY_REFERENCE.md` | `/LIBRARY_REFERENCE.md` | Component catalog with imports and descriptions |
| `TAILWIND_CHEATSHEET.md` | `/TAILWIND_CHEATSHEET.md` | Design token reference |
| `INTENT_KEYWORDS_GUIDE.md` | `/INTENT_KEYWORDS_GUIDE.md` | When-to-use / when-not-to-use per component |
| `REACT_HOOK_FORM_GUIDE.md` | `/REACT_HOOK_FORM_GUIDE.md` | Form integration patterns |
| `CLAUDE.mf-app-core.md` | `/CLAUDE.md` | mf-app-core's own Claude guidance (useful context, but written for *library* work, not prototype work — our `/CLAUDE.md` is the rules for prototypes) |
| `registry/index.json` | `/public/registry/index.json` | Machine-readable component registry (117+ entries) |

**Subdirectories (also gitignored, vendored/generated on bootstrap):**

| Path | Source | Purpose |
|------|--------|---------|
| `stories/` | `packages/**/*.stories.{js,jsx,ts,tsx,mdx}` | Storybook stories — **source of truth for composition** (how components fit together). `.mdx` carry the real prop docs/examples for untyped packages like `filter`. |
| `code-connect/` | `packages/**/*.figma.{ts,tsx}` | Code Connect templates — the Figma→component **name** mapping. |
| `generated/index.json` | derived from `node_modules` + `stories/` + `code-connect/` | Machine-built map of every component → its `.d.ts`, registry, render dir, stories, and Code Connect files, plus a flat export→package index. Built by `scripts/generate-component-index.mjs`. **Do not hand-edit.** Powers the `/find-usage` skill. |

> **Why summaries can be wrong:** `llms-full.txt`/`registry` are summarized and have drifted from the real API (notably `@netskope-ui/filter`). When in doubt, read the primary artifacts in this precedence: `.d.ts` → `stories/` → `code-connect/` → compiled `dist/es` → summaries. See `/CLAUDE.md` rule #7 and run `/find-usage`.

## Why these aren't committed

They snapshot a moving target. Each environment pulls the version matching `/PINNED_SHA` so designers stay aligned without us committing 400KB of generated reference material that goes stale.

## Updating

```bash
# Edit /PINNED_SHA to a newer mf-app-core commit, then:
yarn refresh-ds
```

This re-pulls all files, runs `yarn install` to grab any new component versions, and stamps `.ai-context/.pulled-at`.
