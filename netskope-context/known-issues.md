# Known issues & runtime gotchas

Things that are **not** visible in component types/stories/registry and only
surface when you actually build or run the prototype. Storybook runs client-only
and never hits Next's SSR path, so it can't reveal the SSR ones. Check this file
before finalizing a page; **append** to it whenever a new gotcha bites you.

## SSR / Next.js

- **`@netskope-ui/filter` `AdvancedFilter` crashes SSR** with `window is not defined` — it touches `window` at module load. Import it client-only:
  ```tsx
  import dynamic from 'next/dynamic';
  const AdvancedFilter = dynamic(
    () => import('@netskope-ui/filter').then((m) => m.AdvancedFilter),
    { ssr: false },
  );
  ```
  Symptom: route returns 500/502 with `window is not defined` in the dev log. Other `window`-at-import components need the same treatment.

## `@netskope-ui/filter`

- **Ships no TypeScript types.** Ambient declarations live in `types/netskope-ui-untyped.d.ts`.
- **The summarized docs are WRONG about it.** `llms-full.txt`/`registry` describe `def={{ fields:[{type:'select'}] }}`. The real `def` is a **name-keyed object** with **UPPERCASE** types (`SINGLE_SELECT`, `MULTI_SELECT`, `TEXT_SEARCH`, `DATE_RANGE_SELECT`). Source of truth: `.ai-context/stories/filter/src/storybook/FilterDef.stories.mdx`.
- **`BasicFilter` requires `groups`** even in `isSimple` mode (it maps over `groups` internally and throws on `undefined`). Pass `groups={[{ filters: Object.keys(def) }]}`.
- **`isSimple` defeats hover-X removal** — it pins every filter to the dashboard, so the remove-X is a no-op. To show all pills *and* keep them removable, drop `isSimple` and use `defaults={Object.keys(def)}`.
- **Pills stretch full-width** unless you set `standalone` + `standaloneContainerClassName="flex-wrap"`. Per-pill width comes from `def[name].dashboard.trigger.className` (e.g. `'w-[240px]'`) — it sizes the inner control; the pill grows to fit.
- **Single-select empty state shows a hardcoded "Select"** — not customizable. Only `TEXT_SEARCH` honors `dashboard.trigger.placeholder`.
- **Dashboard never renders group headers.** `groups` only labels the Add-Filter dropdown. For visible "Source"/"Destination" sections, render your own header + one `BasicFilter` per group.
- **The Basic/Advanced toggle** is not in `BasicFilter`; it's rendered by `FilterContainer.Root` and only appears when both `FilterContainer.Basic` and `.Advanced` are mounted.

## `@netskope-ui/tabs`

- **`TabsTrigger`/`TabsContent` are raw, unstyled Radix re-exports.** The styled tab is **`SimpleTabButton`**, used inside `TabsTrigger asChild` with controlled `value` + `isSelected`:
  ```tsx
  <Tabs value={tab}>
    <TabsList className="sticky top-0 z-10 bg-neutral-bg-base px-8 shadow-[rgba(0,0,0,0.1)_0px_3px_4px_0px]">
      <TabsTrigger value="a" asChild>
        <SimpleTabButton onClick={() => setTab('a')} isSelected={tab === 'a'}>A</SimpleTabButton>
      </TabsTrigger>
    </TabsList>
    <TabsContent value="a" className="px-8 py-8">…</TabsContent>
  </Tabs>
  ```
  See `top-bar`'s `Page.stories.js` (`TopBarWithStickyTabs`) for the canonical sticky-tabs layout.

## `@netskope-ui/top-bar`

- **Renders only `TopBar.Title`, `TopBar.Actions`, and `Breadcrumbs` children — any other child (e.g. `<Tabs>`) is silently dropped.** Tabs go in a separate component below it (see Tabs above and `composite-recognizer.md`).

## `@netskope-ui/core`

- **`Accordion` has no card border by default** — `Accordion.Header` styles only itself. For the boxed look, wrap the `Accordion` in `rounded-md border border-neutral-border-weak overflow-hidden`.

## Dev experience

- **First compile of a filter-heavy route takes ~80s** (the filter package pulls in 7,000+ modules). It's not hung. Subsequent loads are instant.
- A sandbox may block `localhost`, so `curl http://localhost:3000/...` can return `000`/timeout. Retry unsandboxed.
