# Pattern — Table Empty States

**Source:** [Figma](https://www.figma.com/design/ObCQnIAh9rN4Os9XO7Xxgk/Pattern---Table-Empty-Cases?node-id=0-1&t=XLBVrBOkxzBzlswI-1)

## Purpose

A table has two distinct empty cases that need different UI treatment.

## Rule

### Case A — "No data yet" (the table genuinely has nothing)

- Centered illustration (or icon) + headline + one-line description + a primary CTA.
- Headline form: `No <objects> yet`.
- Description: explains what an `<object>` is and why the user would create one.
- CTA: `Create <object>` — `sentiment="ACTION"`, `styleType="PRIMARY"`.

### Case B — "No results match" (filters/search returned nothing)

- Centered, smaller, no illustration.
- Headline: `No <objects> match your filters` (or search).
- Description: nudges the user to adjust filters.
- CTAs: `Clear filters` (NEUTRAL/REGULAR) and optionally a secondary `Reset search`.

## Anti-patterns

- ❌ A single empty state for both cases ("No data found") — robs the user of context.
- ❌ Hiding the table chrome (headers, toolbar) on empty — the user loses orientation.
- ❌ Using the "no data yet" CTA when filters are active — it's misleading.

## Components to use

- Empty state container — a centered flex column inside the table body
- Icons from `@netskope-ui/icons`
- `<ButtonV2 />` for CTAs

See `layouts/list-detail.tsx` for a working example (search-empty case).
