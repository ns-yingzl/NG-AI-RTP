---
name: find-component
description: Search the @netskope-ui design system for a component matching a query. Returns import path, key props, and Storybook URL.
---

# /find-component

When the user invokes `/find-component <query>`, search the vendored design-system catalog for matching components.

## Steps

1. **Grep `.ai-context/llms.txt`** for the query string (case-insensitive). This is the fastest index.
2. **For each match,** grep `.ai-context/llms-full.txt` and `.ai-context/registry/index.json` for the full prop signature and at least one usage example.
3. **Return a short summary** in this format:

```
**<ComponentName>** — from `@netskope-ui/<package>`

What it does: <one-sentence description>

Key props: <comma-separated list, e.g. `sentiment`, `styleType`, `label`>

Import:
```tsx
import { <ComponentName> } from '@netskope-ui/<package>';
```

Example:
```tsx
<ComponentExample />
```

Storybook: https://shiny-doodle-qlemrp8.pages.github.io/?path=/docs/<slug>
```

4. **If multiple components match**, list the top 3 with one-line descriptions and ask the user which they want details on.

5. **If nothing matches**, suggest the closest alternatives by category (Input Controls, Layout & Structure, Display & Status, Data Display, Feedback, Navigation). Do NOT suggest components that aren't in the registry.

## Reminders

- Never recommend a non-`@netskope-ui` component (e.g. shadcn, MUI, Radix directly). The DS wraps Radix where needed.
- Don't fabricate props. If a prop isn't in the registry, say so.
- Don't fabricate Storybook URLs — only return URLs you've verified in `.ai-context/llms.txt`.
