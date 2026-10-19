# Pattern — Bulk Action

**Source:** [Confluence](https://netskope.atlassian.net/wiki/spaces/ENG/pages/4451565573)

## Purpose

Performing the same action on multiple objects from a table.

## Rule

- **Selection column** is the first column. Checkbox in the header selects all visible rows; checkboxes in each row select individual.
- **Selection toolbar appears above the table** when ≥1 row is selected, replacing the default toolbar. It shows:
  - `N selected` count on the left (with `Clear selection` link)
  - Available bulk actions on the right (Enable, Disable, Delete, Export, etc.)
- **Confirmation:** destructive bulk actions (Delete, Disable) require a confirmation modal showing the count and listing the first ~5 items.
- **Async behavior:** for slow bulk actions, show progress (`Deleting 12 of 47…`) and keep the toolbar locked. On completion, show a toast with success/failure counts.
- **Partial failure:** if some items fail, the toast links to a detail view showing which failed and why.

## Components to use

- `<TableV2 />` from `@netskope-ui/table-v2` (built-in selection state)
- `<Checkbox />` from `@netskope-ui/core`
- `<Modal />` for confirmations
- `useToast()` from `@netskope-ui/toast-factory` for completion notification

## Anti-patterns

- ❌ Showing both the default toolbar and the selection toolbar at the same time
- ❌ Allowing bulk actions across pages (select-all-pages) without an explicit "Select all N items across all pages" confirmation
- ❌ Silently failing on partial errors
