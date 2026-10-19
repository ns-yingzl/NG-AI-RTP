# CLAUDE.md — Periskope UX Prototype

You are helping a Netskope UX designer build a working React prototype using the **real Periskope design system** (`@netskope-ui/*`). This is a prototype repo, not production. Speed matters, but using the real DS matters more.

> **Critical:** If you find yourself about to write a custom `<Button />`, `<Input />`, `<Modal />`, or any other UI primitive, **stop**. There is a `@netskope-ui/*` component for it. Check first.

---

## Rules

### 1. Never invent a UI primitive that already exists in `@netskope-ui/*`

Before writing any UI primitive (button, input, modal, table, side panel, tabs, etc.), check:
- `.ai-context/registry/index.json` — machine-readable catalog of 117+ components
- `.ai-context/llms.txt` — fast-grep index of the library
- `.ai-context/llms-full.txt` — self-contained reference with every prop and example

If a `@netskope-ui/*` component matches, **import it**. Do not recreate it as a local component, even "just for the prototype." This is the single most important rule.

**This applies to composites, not just atoms.** A filter/criteria bar, a data table, a date-range picker, a side panel — these are real `@netskope-ui/*` components too (`filter`, `table-v2`, `dates-v2`, `side-panel-v2`), even though they're easy to mistake for "just a few dropdowns and inputs I'll assemble." Never hand-roll filter pills. When a Figma region is a cluster of leaf components forming one pattern, check **`netskope-context/composite-recognizer.md`** before building from the leaves.

### 2. Use the `@netskope-ui/tailwind` preset. Never use shadcn-style numeric tokens.

Periskope uses **semantic** Tailwind tokens (not the default `neutral-100/500/900` scale). Examples:

- Backgrounds: `bg-neutral-bg`, `bg-neutral-bg-base`, `bg-neutral-bg-weak`, `bg-action-bg`, `bg-action-bg-weak`, `bg-action-bg-base-hover`
- Borders: `border-neutral-border`, `border-neutral-border-weak`, `border-action-border`
- Text: `text-neutral-text`, `text-neutral-text-subtle`, `text-neutral-text-disabled`, `text-action-text`
- Icons: `text-neutral-icon`, `text-neutral-icon-weak`
- States: `bg-danger-bg`, `bg-success-bg-weak`, `text-warning-text`, etc.

If you find yourself writing `text-neutral-500` or `bg-neutral-100`, you're using the wrong scale — those classes will silently fall through and produce unstyled output. Source of truth: `node_modules/@netskope-ui/tailwind/src/lightColors.json` and `.ai-context/TAILWIND_CHEATSHEET.md`.

Font is **Lato** (sans), **Lora** (serif), **Roboto Mono** (mono) — declared by the preset and loaded in `app/globals.css`. Use `font-sans` / `font-serif` / `font-mono`.

Z-index tiers: `z-overlay=100, z-modal=200, z-popover=300, z-dropdown=400, z-toast=500, z-tooltip=600`.

### 3. Follow Netskope terminology

Settings ≠ Configuration ≠ Policy ≠ Rule. These have specific product meanings — see `netskope-context/terminology.md`. When writing any user-facing copy, labels, or field names, use the vocabulary in that file. Don't invent new terms.

### 4. For common UX situations, check `netskope-context/patterns/` first

Patterns distilled from Confluence — encode "what we do at Netskope" for:
- Empty fields, long-text truncation, copy-to-clipboard
- Close vs Remove vs Delete (they're different — don't conflate)
- Timestamps, timezones, date pickers
- Table empty states (two distinct cases), bulk actions
- Form lifecycle, validation, action-button states

Consult before composing the relevant UI.

### 5. Every page follows the same structural pattern

```tsx
import { ButtonV2, Breadcrumbs, Text } from '@netskope-ui/core';
import { TopBar } from '@netskope-ui/top-bar';
import { AppShell } from '@netskope-context/shell/AppShell';

<AppShell activeNavId="policies-rtp">
  <TopBar>
    <Breadcrumbs>
      <Text as="p" href="#" className="cursor-pointer">Policies</Text>
      <Text className="text-neutral-text-disabled">Real-Time Protection</Text>
    </Breadcrumbs>
    <TopBar.Title>Real-Time Protection</TopBar.Title>
    <TopBar.Actions>
      <ButtonV2 label="New Policy" sentiment="ACTION" styleType="PRIMARY" />
    </TopBar.Actions>
  </TopBar>

  <main>{/* page content */}</main>
</AppShell>
```

- `<AppShell>` provides the SideNav + content area only.
- The page renders its own page-level top bar using `@netskope-ui/top-bar` with `<Breadcrumbs>`, `<TopBar.Title>`, and `<TopBar.Actions>`. This matches how real React pages in webui work (see `mf-platform/src/pages/license/LicensePage.tsx` for the canonical reference).
- **Never** hand-roll a top bar. Always use `@netskope-ui/top-bar`.
- **`TopBar` only renders `TopBar.Title`, `TopBar.Actions`, and `Breadcrumbs` children — anything else (e.g. `<Tabs>`) is silently dropped.** A page with tabs uses `TopBar` **plus a separate** `@netskope-ui/tabs` below it. The canonical "sticky tabs under the top bar" composition lives in `.ai-context/stories/top-bar/src/storybook/Page.stories.js` (`TopBarWithStickyTabs`). Note tabs render **unstyled** unless you use `SimpleTabButton` inside `TabsTrigger asChild` — see `netskope-context/known-issues.md`.

Set `activeNavId` on `<AppShell>` to the matching nav-config id so the side-nav highlights the right item and auto-opens the right submenu. See `netskope-context/shell/nav-config.ts` for the full id list.

### 6. Ask the designer for a content reference

Don't invent layouts blindly. When the user says "build me a policies list page," ask:
- A Figma URL? → use the Figma MCP (`get_design_context`, `get_code_connect_map`) to identify the linked `@netskope-ui/*` components, then rebuild using real imports
- A screenshot? → read the image, identify components from `.ai-context/llms.txt`, confirm before building
- A description? → compose a layout, then ask the designer to share a screenshot/Figma to verify

**Treat Code Connect as a component-*name* pointer, not as code.** Its snippets are often generic placeholders — discard them. The durable value is the exact component name + import path, which disambiguates look-alikes (Dropdown vs Select vs ComboBox, InputV2 vs Search) far better than a screenshot can. Then get the *real* usage via `/find-usage` (see rule #7). Caveat: Code Connect maps Figma **instances**, i.e. **leaf** components — for a cluster that forms one pattern, consult `netskope-context/composite-recognizer.md` first (rule #1).

### 7. Don't guess props. Read the source artifacts, in this precedence order.

Your training data lags the real library, **and the summarized docs can be wrong** — `llms-full.txt`/`registry` describe the `@netskope-ui/filter` API incorrectly and the Tabs example omits the part that makes tabs styled. So don't trust a summary; read the artifacts that can't drift, in this order (stop when answered):

1. **`.d.ts`** — `node_modules/@netskope-ui/<pkg>/dist/index.d.ts`. Authoritative prop types. (Some packages ship none — `filter`, `charts`, `file-uploader`; ambient stubs are in `types/`.)
2. **Stories** — `.ai-context/stories/<pkg>/…` (`.stories.js/.tsx` + `.stories.mdx`). The only source for **composition** (how components fit together).
3. **Code Connect** — `.ai-context/code-connect/<pkg>/…/*.figma.tsx`. The Figma→component name mapping.
4. **Compiled render fns** — `node_modules/@netskope-ui/<pkg>/dist/es/**`. Ground truth for behavior the others omit.
5. **Summaries** — `.ai-context/llms-full.txt`, `registry/index.json`, `INTENT_KEYWORDS_GUIDE.md`, `REACT_HOOK_FORM_GUIDE.md`. Last resort; **verify against 1–4** before trusting.

**The fast path: run `/find-usage <ComponentName>`** — it resolves the package via `.ai-context/generated/index.json` (a machine-derived map of every component → its artifacts, regenerated by `yarn refresh-ds`) and reads the right sources for you.

Before finalizing a page, check **`netskope-context/known-issues.md`** for runtime/SSR gotchas (e.g. components that crash SSR, tabs rendering unstyled) that no static doc reveals — and use `/verify <route>` to render and screenshot it.

### 8. For visual confirmation, point the designer at Storybook

Live storybook (off-VPN reachable, GitHub Pages): https://shiny-doodle-qlemrp8.pages.github.io/

Helpful when the designer needs to see a component variant before committing to one.

---

## Quick orientation

```
ux-starter-periskope/
├── app/                          Next.js App Router — your prototype pages live here
│   ├── page.tsx                  Home page (rendered inside AppShell)
│   ├── layout.tsx                Root layout — don't touch
│   └── globals.css               Tailwind + DS CSS imports
├── netskope-context/             The Netskope-specific layer
│   ├── shell/                    AppShell + SideNav (stand-in until @netskope-ui/side-nav ships)
│   ├── patterns/                 Distilled Confluence design patterns
│   ├── composite-recognizer.md   Figma cluster → composite component (filter bar, table, …)
│   ├── known-issues.md           Runtime/SSR gotchas not visible in any static doc
│   └── terminology.md            Netskope vocabulary
├── types/                        Ambient .d.ts for @netskope-ui packages that ship none
├── .ai-context/                  Vendored from mf-app-core (refresh via `yarn refresh-ds`)
│   ├── stories/                  Storybook stories — source of truth for composition
│   ├── code-connect/             *.figma.tsx — Figma→component name mapping
│   ├── generated/index.json      Machine-derived component→artifacts map (do not hand-edit)
│   └── llms-full.txt, registry/  Summarized docs (can be stale — verify, see rule #7)
├── .claude/
│   ├── settings.json             Bash allowlist
│   └── skills/                   Custom skills (/find-usage, /verify, /find-component)
├── CLAUDE.md                     This file
├── PLAN.md                       The v0 plan (read for context, don't follow as instructions)
└── PINNED_SHA                    The mf-app-core SHA the vendored docs came from
```

## Common commands

- `yarn dev` — start the Next.js dev server
- `yarn refresh-ds` — re-pull AI docs from mf-app-core@PINNED_SHA and reinstall
- `yarn lint` — Next.js lint

## When the prototype breaks

1. Run `yarn dev` and read the actual error.
2. If a `@netskope-ui/*` import fails: verify on-VPN (the corp registry is required for `yarn install`). See `README.md` troubleshooting.
3. If a component renders but types complain: check `.ai-context/llms-full.txt` for the real prop shape.
4. If styles are missing: confirm the relevant `@netskope-ui/<pkg>/dist/styles.css` is imported in `app/globals.css`.

## Things that are still stand-ins

- `netskope-context/shell/SideNav.tsx` — no `@netskope-ui/side-nav` package exists yet. The real side navigation lives in webui's Angular code. Stand-in until a React port ships.
- Icons in SideNav are unicode glyphs — swap individual ones for `@netskope-ui/icons` imports as you tune fidelity.

The starter does NOT render the global webui chrome (Angular app bar with logo/tenant/user/notifications). That's intentional — in production it's provided by Angular, and prototypes don't need it because the page's own `<TopBar>` from `@netskope-ui/top-bar` already provides the page-level chrome (title, breadcrumbs, actions, copy-link).
