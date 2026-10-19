# Pattern — Close vs Remove vs Delete

**Source:** [Confluence](https://netskope.atlassian.net/wiki/spaces/ENG/pages/3767829448)

## Purpose

These three verbs do very different things. Mislabeling them breaks user trust and causes data loss.

## Rule

| Verb | Use when | Destructive? | Confirmation? |
|------|----------|--------------|---------------|
| **Close** | Dismissing a transient UI element (modal, side panel, toast). The underlying data is unchanged. | No | No |
| **Remove** | Detaching an item from a relationship (remove a tag from a policy, remove a user from a group). The item still exists elsewhere. | No (reversible) | Optional; required if the relationship is hard to recreate |
| **Delete** | Permanently destroying an object. Cannot be undone. | **Yes** | **Always** — use a confirmation modal that requires the user to type the object name for high-impact deletes |

## Visual

- **Close**: icon-only `✕` button, top-right of the surface. Use `sentiment="NEUTRAL"`, `styleType="NO_BORDER"`.
- **Remove**: text button "Remove" — `sentiment="NEUTRAL"`, `styleType="REGULAR"`. Or an icon (`⊖`) in a hover-revealed action column for list rows.
- **Delete**: text button "Delete" — `sentiment="DANGER"`, `styleType="REGULAR"`. Confirmation modal opens with primary button `sentiment="DANGER"`, `styleType="PRIMARY"`, labeled "Delete `<object>`".

## Anti-patterns

- ❌ Labeling a destructive action "Close"
- ❌ "Remove" without indicating where the item goes (always include context: "Remove from group", not just "Remove")
- ❌ "Delete" without confirmation
