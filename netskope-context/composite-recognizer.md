# Composite recognizer — when a cluster of atoms is really one component

Code Connect maps Figma **instances**, and instances are **leaf** components. So a
Figma frame built from several dropdowns/inputs/buttons gets labeled as
"Dropdown", "InputV2", "ButtonV2" — never as the single composite component that
actually owns that pattern in code. If you assemble from the leaves you'll
re-implement (often badly) something the design system already ships.

**Rule of thumb:** before building a region out of leaf components, ask *"is this
whole region one named component?"* Use this table.

| If the Figma frame looks like… | Use this composite (not the leaves) |
|---|---|
| A row of "Label = value" filter pills, an "Add filter"/"Clear", or copy like "criteria are AND'ed together" | **`@netskope-ui/filter`** — `BasicFilter`; use `SearchFilter` + `FilterContainer.Root/.Basic/.Advanced` to get the Basic/Advanced **toggle**. (def types are UPPERCASE: `SINGLE_SELECT`, `TEXT_SEARCH`…) |
| A data grid with header row, sortable columns, selection, pagination | **`@netskope-ui/table-v2`** (+ `@netskope-ui/pagination`) |
| A panel that slides in from the right with its own header/close | **`@netskope-ui/side-panel-v2`** (its header is `@netskope-ui/top-bar` with `sidePanel`) |
| A date / date-range picker | **`@netskope-ui/dates-v2`** (the filter variant is `DateRangeContainer` in `@netskope-ui/filter`) |
| A page header = breadcrumb + title + **tabs** | `@netskope-ui/top-bar` (breadcrumb/title/actions) **+ a separate** `@netskope-ui/tabs`. **TopBar has no tabs** and silently drops non-`TopBar.Title`/`Actions`/`Breadcrumbs` children. The canonical "sticky tabs under the top bar" composition is `top-bar`'s `Page.stories.js` → `TopBarWithStickyTabs` (vendored at `.ai-context/stories/top-bar/src/storybook/Page.stories.js`). |
| A searchable / multi-select / async-options select | **`@netskope-ui/combo-box`** or **`@netskope-ui/select`** (not a hand-wired `Dropdown`) |

When unsure, run `/find-usage <intent>` and read the relevant Storybook story — stories are the source of truth for composition.

> This list is a stopgap for composites that don't yet have a dedicated Figma
> component. **The real fix is on the Figma side:** create a library component for
> the composite (e.g. a "Filter Bar" component) and Code-Connect it to the
> composite package. Every composite you map there removes a row from this table.
