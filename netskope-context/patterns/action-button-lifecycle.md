# Pattern — Action Button / Menu Item Lifecycle

**Source:** [Confluence](https://netskope.atlassian.net/wiki/spaces/ENG/pages/5328044033)

## Purpose

The interactive states for any UI element that executes a command on the user's behalf.

## Rule

| State | When | UI |
|-------|------|----|
| **Default** | Idle | Visible, full color per sentiment |
| **Hover** | Mouse over | Background lightens (REGULAR) or darkens (PRIMARY); cursor `pointer` |
| **Focus** | Keyboard focus | Focus ring visible (DS handles this) |
| **Active / Pressed** | Mouse/key down | Slight darken |
| **Disabled** | Not actionable | Lowered opacity; cursor `not-allowed`; **tooltip explains why** (don't make the user guess) |
| **Loading / In-progress** | After click, before result | Spinner replaces the icon; label stays or changes to a verb form (`Saving…`). Button stays disabled. |
| **Success transient** | Operation just succeeded | Optional brief checkmark + green tint for ~1.5s before returning to Default. Pair with a toast for confirmation. |
| **Confirmation required** | Destructive primary action | Click opens confirmation modal first; don't perform the action on the button itself |

## Why disabled needs a reason

Disabled buttons without explanation make users feel stuck. **Every disabled button must answer "why?"** — either via tooltip on hover or inline help text near the button.

## Components to use

- `<ButtonV2 />` for primary/secondary actions
- `<AsyncButton />` from `@netskope-ui/core` when loading state matters
- `<Tooltip />` to explain disabled states

## Anti-patterns

- ❌ Buttons that flicker between enabled/disabled during typing — debounce validation
- ❌ Loading state without disabling — user can click again and trigger duplicate requests
- ❌ Disabled with no explanation
