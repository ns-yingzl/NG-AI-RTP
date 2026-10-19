# Pattern — Copy to Clipboard

**Source:** [Confluence](https://netskope.atlassian.net/wiki/spaces/ENG/pages/5009735681)

## Purpose

Letting users copy values (IDs, error codes, hashes) without selecting text manually.

## Rule

- **Hover-revealed copy icon** appears at the end of the copyable value.
- **On click**: copy to clipboard, show a brief toast confirmation `"Copied to clipboard"` (auto-dismiss after ~2s), and briefly swap the icon to a checkmark.
- **Don't** make the value itself the click target — users often want to select-and-read it.
- **Long values** (e.g., a hash): truncate visually with ellipsis, but copy the full value.
- **Sensitive values** (tokens, keys): keep `••••••••` masked but allow copy. Show a tooltip on the copy icon: "Copy hidden value."

## Components to use

- The copy icon: `<CopyIcon />` from `@netskope-ui/icons`
- The toast: `useToast()` from `@netskope-ui/toast-factory` — `toast.success('Copied to clipboard')`
- The clipboard write: `navigator.clipboard.writeText(value)`

## Found in

Breadcrumbs (tenant ID), tables (object IDs), error-message popups (request ID).
