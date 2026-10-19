# Pattern — Empty Fields

**Source:** [Confluence](https://netskope.atlassian.net/wiki/spaces/ENG/pages/4363714561)

## Purpose

How to display fields when the backend returns empty, null, or undefined values.

## Rule

- **Use an em-dash (`—`)** for missing scalar values in tables, side panels, and detail views. Not "N/A", not "—" with hyphen, not blank.
- **Distinguish "no value" from "loading."** A loading state shows a skeleton or spinner; an empty state shows the em-dash.
- **For empty lists/arrays**, use `Empty list` or the relevant pattern's empty state (see `table-empty-states.md` for tables).
- **For sensitive fields** (passwords, tokens), show `••••••••` until revealed, not an em-dash.

## Components to use

- Plain text node containing `—` (Unicode U+2014)
- For consistency, use a shared `<EmptyValue />` helper if your prototype shows many of these

## Found in

DLP Incident Details, SkopeIT Side Panel, RTP Policy List, SSPM Inventory Side Panel.
