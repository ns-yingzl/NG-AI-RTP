# Shell

React reimplementation of the production webui side navigation, plus the `AppShell` wrapper every prototype page renders inside.

## Why this exists

The production app (`netSkope/webui`) is Angular 14+ with React microfrontends loaded via Module Federation. The **side navigation** is Angular — **there is no `@netskope-ui/side-nav` package yet**. Prototypes need a navigation column that looks like real webui so they pass the squint test.

> **Don't confuse `@netskope-ui/top-bar` with this directory.** `@netskope-ui/top-bar` is the **page-level top bar** (compound `<TopBar>` with `<TopBar.Title>`, `<TopBar.Actions>`, `<Breadcrumbs>` inside it) — pages render their own. This directory provides the **container shell** around the page. The global Angular chrome (logo / tenant / user) lives in webui and is intentionally NOT simulated here.

## What's in here

| File | Purpose | Future |
|------|---------|--------|
| `AppShell.tsx` | Composes SideNav + main content area. Pages render their own `<TopBar>` inside `<AppShell>`. | Keep |
| `SideNav.tsx` | Custom React side-nav | **Stand-in until** `@netskope-ui/side-nav` ships |
| `nav-config.ts` | Hardcoded nav tree mirroring webui | Mirror manually; drift expected |

## How to update

- **Adding/removing nav items:** edit `nav-config.ts` only.
- **Restyling SideNav:** edit `SideNav.tsx`. Use Periskope semantic tokens (`neutral-bg-base`, `action-bg-weak`, `text-neutral-text`, etc.) from `@netskope-ui/tailwind` — never numeric tokens (`neutral-500`, etc.) and never hand-roll hex colors.

## Glyph fallback

`SideNav.tsx` uses unicode glyphs as a placeholder icon set. For higher fidelity, swap to named imports from `@netskope-ui/icons` (317 icons available — see `.ai-context/llms.txt`).

## When to retire

If a React DS package for the side nav ships (and visually matches webui), delete `SideNav.tsx` and import from that package in `AppShell.tsx`. `nav-config.ts` will likely still be useful for per-prototype menu customization regardless.
