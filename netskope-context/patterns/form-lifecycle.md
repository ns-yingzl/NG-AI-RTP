# Pattern — Form Lifecycle

**Source:** [Confluence](https://netskope.atlassian.net/wiki/spaces/ENG/pages/5335449714)

## Purpose

The states a form goes through from load to dismiss, and what UI shows in each.

## Rule

| State | UI |
|-------|----|
| **Loading** | Skeleton for the form fields. Buttons disabled. |
| **Loaded, clean** | Fields populated. Primary button (e.g., "Save") is **disabled** until the form is dirty. Secondary "Cancel" enabled. |
| **Loaded, dirty** | Primary button enabled. Inline message somewhere visible: `You have unsaved changes`. |
| **Validating** | Field-level errors render inline below each invalid field. Form-level summary appears at the top of the form (or near the primary button) if multiple errors exist. |
| **Submitting** | Primary button shows a spinner with text (`Saving…`). Both Save and Cancel disabled. |
| **Submit success** | Toast: `Saved`. Form transitions back to "loaded, clean". |
| **Submit error** | Toast: error category. Inline message at the top of the form: `Something went wrong. Try again.` Buttons re-enabled. |
| **Dismissing with unsaved changes** | Confirmation modal: `Discard unsaved changes?` with `Keep editing` (REGULAR) and `Discard` (DANGER/REGULAR). |

## Stale input

If the form was loaded from data that has since been updated by another user or process, on submit show: `This <object> has been updated since you opened the form. Reload to see the latest.` Don't auto-overwrite. See `stale-input.md` (TODO).

## Components to use

- `<InputV2 />`, `<Checkbox />`, `<Toggle />`, `<Select />`, etc. from `@netskope-ui/core`
- `<ButtonV2 />` for actions
- `<Modal />` for discard-confirmation
- `useToast()` for success/error notifications
- Pair with `react-hook-form` per `.ai-context/REACT_HOOK_FORM_GUIDE.md`

## Found in

Tenant Settings, RTP Policy Editor, Profile Editors — everywhere.
