# Pattern — Form Validation & Error Messages

**Source:** [Confluence](https://netskope.atlassian.net/wiki/spaces/ENG/pages/3449192717)

## Purpose

Common error messages so designers don't reinvent copy every time.

## Rule

### When to validate

- **On blur** for individual fields (`Email is not valid`)
- **On submit** for cross-field rules (`Start date must be before end date`)
- **Never validate on every keystroke** for blocking errors — it's hostile
- **Real-time** is acceptable only for non-blocking hints (e.g., password strength meter)

### Where to show errors

- **Inline below the field** for field-specific errors. Use `error={true}` and `errorMessage="…"` on `<InputV2 />`.
- **Form-level summary** at the top or near the primary button when there are multiple errors, or when the error isn't tied to a specific field.

### Standard messages

| Situation | Copy |
|-----------|------|
| Required field empty | `This field is required` |
| Email format | `Enter a valid email address` |
| URL format | `Enter a valid URL (including https://)` |
| Out of range | `Must be between {min} and {max}` |
| Min length | `Must be at least {n} characters` |
| Max length | `Must be no more than {n} characters` |
| Duplicate value | `A <object> with this name already exists` |
| Server rejected | `Couldn't save — please try again. If this keeps happening, contact support.` |

### Tone

- Direct, no exclamation marks, no apologies in field errors
- Tell the user what to do, not just what's wrong (`Enter a valid email`, not just `Invalid`)

## Components to use

- `<InputV2 error={hasError} errorMessage={msg} />` from `@netskope-ui/core`
- Form-level summary: a `<div role="alert">` with semantic danger styling
