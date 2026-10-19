# Pattern — Long Text Truncation

**Source:** [Confluence](https://netskope.atlassian.net/wiki/x/KQCDEQE)

## Purpose

Handle long strings in constrained spaces (table cells, dropdown items, tag sequences) without breaking layout.

## Rule

- **Truncate with ellipsis at the end:** CSS `text-overflow: ellipsis; white-space: nowrap; overflow: hidden`.
- **Show the full text in a tooltip on hover** — use `@netskope-ui/core`'s `<Tooltip />` with the full string.
- **For tag sequences** (e.g., a list of group memberships), truncate at N visible items (typically 3) and show `+N more` — clicking opens a Popover with the full list.
- **Never truncate values critical for action** (e.g., a delete-confirmation dialog must show the full object name).
- **Domain-aware truncation:** for URLs, prefer truncating the path, not the host. For emails, never truncate the `@` portion.

## Components to use

- `<Tooltip />` / `<TooltipTrigger />` / `<TooltipContent />` from `@netskope-ui/core`
- `<Popover />` from `@netskope-ui/core` for `+N more` expansion
