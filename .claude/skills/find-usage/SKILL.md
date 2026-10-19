---
name: find-usage
description: Get the VERIFIED real-world usage of a @netskope-ui/* component — correct props, the canonical composition, and the import — by reading the authoritative source artifacts (types, Storybook stories, Code Connect, compiled render fns) rather than the summarized docs. Use before writing any @netskope-ui/* component you're not 100% sure about, and whenever the summarized docs look wrong or a component renders unstyled/broken.
---

# /find-usage

`/find-usage <ComponentName>` (or a free-text intent like "filter bar", "page with tabs").

Returns how to actually use a `@netskope-ui/*` component, read from primary artifacts. **Why this exists:** the summarized docs (`llms-full.txt`, `registry/index.json`) are model-generated and have drifted from reality — e.g. they describe the `@netskope-ui/filter` `def` shape with lowercase `type: 'select'` when the real API is `SINGLE_SELECT`, and the Tabs example omits `SimpleTabButton` so tabs render unstyled. This skill reads the sources that **cannot** drift.

## Source-of-truth precedence (read in this order, stop when answered)

1. **`.d.ts`** — `dist/index.d.ts`. Authoritative prop names/types. (Some packages ship none — see step 4.)
2. **Stories** — vendored under `.ai-context/stories/<pkg>/…` (`.stories.js/.tsx` for code, `.stories.mdx` for docs+examples). The **only** source for *composition* (how multiple components fit together, e.g. sticky tabs, the filter `def`/`groups` shape).
3. **Code Connect** — vendored under `.ai-context/code-connect/<pkg>/…/*.figma.tsx`. Confirms the Figma→component **name** mapping.
4. **Compiled render fns** — `node_modules/@netskope-ui/<pkg>/dist/es/**`. Ground truth for *behavior* the others omit (which children are rendered, hardcoded strings, the `clsx` class lists, default props). Read these when there's no `.d.ts` (e.g. `filter`, `charts`, `file-uploader`) or when a component behaves unexpectedly.
5. **Summaries** (`llms-full.txt`, `registry/index.json`) — last resort, and **verify against the above** before trusting. If they conflict, the primary artifact wins.

## Steps

1. **Resolve the package.** Open `.ai-context/generated/index.json`. Look up the name in `componentIndex` → package. That package's entry lists exact paths to its `dts`, `registry`, `stories[]`, `codeConnect[]`, and `renderDir`. (If the index is missing, run `node scripts/generate-component-index.mjs`.)
2. **Read props** from `dts` (grep for the component's `Props` type). If `dts` is `null`, read the relevant file under `renderDir` (the destructured `_ref.<prop>` names + `defaultProps`).
3. **Read the canonical example** from the most relevant `stories[]` entry (prefer one whose name matches the intent — e.g. `Page.stories.js` for a page/tabs layout, `FilterDef.stories.mdx` for the filter `def` shape).
4. **Return** the import, the verified prop list, and a copy-pasteable example grounded in the story — citing the file you read.

## Reminders

- **Trust the name, not the snippet, from Code Connect.** Code Connect maps Figma *instances* (leaf components). If a Figma frame is a cluster of leaves that together form one pattern (filters/criteria, data table, date range), check `netskope-context/composite-recognizer.md` for the composite package before assembling from leaves.
- **Check `netskope-context/known-issues.md`** for runtime gotchas that no static artifact reveals (e.g. SSR `window` crashes) before finalizing.
- Never recommend a non-`@netskope-ui` component. Never fabricate a prop — if it's not in the `.d.ts`/render fn, say so.
