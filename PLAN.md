# Periskope UX Starter — Plan

A starter pack for Netskope UX designers using Claude Code, so AI-generated prototypes use **real `@netskope-ui/*` components** instead of ad-hoc shadcn lookalikes.

---

## TL;DR

A git template repo. Designer runs:

```bash
gh repo create my-prototype --template netskope/ux-starter-periskope --clone
cd my-prototype && ./bootstrap.sh
claude
```

…and lands in a working Next.js app with:
- Real `@netskope-ui/*` components installed (npm with GitHub fallback for off-VPN designers)
- A snapshot of mf-app-core's AI docs vendored into `.ai-context/` so Claude has them offline
- A `CLAUDE.md` that aggressively steers Claude toward the real DS
- Netskope copy/terminology rules and design-pattern guidance distilled from Confluence
- **Pre-shipped layouts that mimic the real webui shell** (top-bar + side nav + content area) so prototypes feel native to the product, even though the real shell is Angular
- A reference-driven `/new-page` workflow: designer points Claude at a Figma URL or a screenshot, and Claude builds the *page content* using real DS components — dropping it into one of the pre-shipped shell layouts

---

## Key insight from exploring the repo

`mf-app-core` already has roughly 80% of the AI scaffolding:

| Asset | Lives at | Purpose |
|---|---|---|
| `CLAUDE.md` | repo root | Per-repo Claude guidance, already production-grade |
| `llms.txt` (30K) | repo root | llmstxt.org-format index of the library |
| `llms-full.txt` (162K) | repo root | Self-contained reference — every component, every prop, every example |
| `LIBRARY_REFERENCE.md` (163K) | repo root | Component catalog with imports, descriptions, Storybook links |
| `TAILWIND_CHEATSHEET.md` (17K) | repo root | Design token reference |
| `INTENT_KEYWORDS_GUIDE.md` | repo root | `whenToUse` / `whenNotToUse` reasoning for each component |
| `REACT_HOOK_FORM_GUIDE.md` | repo root | Form integration patterns |
| `public/registry/index.json` | repo root | Machine-readable catalog (117 entries) |
| `packages/*/registry.json` | per package | Per-package registries — easier to grep |
| `.cursorrules` | repo root | Cursor IDE AI rules |
| `figma.config.json` | repo root | Figma Code Connect mappings (already published) |
| Storybook | https://shiny-doodle-qlemrp8.pages.github.io/ | Live component browser (GitHub Pages, off-VPN reachable) |

The starter does **not** need to regenerate any of this. It just needs to:
1. **Vendor a snapshot** of the AI docs into each prototype so Claude reads them locally (handles VPN-off case).
2. **Install the components** with a fallback path that works without the corp registry.
3. **Add the layer that's missing from the component repo**: Netskope copy/terminology rules, design-pattern guidance distilled from Confluence, a CLAUDE.md tuned for *prototype* work (vs. *library development* work, which is what mf-app-core's CLAUDE.md targets), and Figma MCP wiring so Code Connect mappings work out of the box.

This layer lives in the starter, not in mf-app-core — `mf-app-core` is owned by the UI dev side of the org; this is a UX-side initiative and shouldn't require changes there.

---

## The webui shell problem (and why the starter ships its own)

The production app (`netSkope/webui`) is **Angular 14+ in `src/webui/neo/`** with React microfrontends loaded via Webpack Module Federation. The shell — top-bar + side navigation + page chrome — is Angular. `@netskope-ui/top-bar` exists as a published React component, but **there is no `@netskope-ui/side-nav`** — the side navigation only exists in Angular form inside webui itself.

For prototypes, this matters because:

1. **Designers want prototypes that *look like real webui pages***, not generic React apps. A bare `<TopBar />` floating above a blank canvas doesn't feel native.
2. **The prototype is pure React** — we can't trivially boot the Angular shell in a Next.js starter, and we shouldn't try.

So the starter ships `netskope-context/shell/AppShell.tsx`: a thin React reimplementation of the webui shell using `@netskope-ui/top-bar` (real) plus a custom `SideNav.tsx` (stand-in) wired with a nav config that mirrors the real webui menu structure. Every layout in `netskope-context/layouts/` is wrapped in `<AppShell>` by default.

Tradeoffs to be honest about:
- The stand-in side-nav will drift from the real one. We need a process for updating it (probably manual: someone watches webui's nav for changes and bumps `nav-config.ts`).
- This is a v0/v1 stopgap. The right long-term answer is for the side-nav to be ported into `@netskope-ui/side-nav` — but that's UI-dev work and out of scope for this starter.
- The stand-in only needs to be *visually* faithful. It doesn't need real routing, permissions, or feature-flag gating — it's a prototype shell.

---

## Repo layout

```
ux-starter-periskope/
├── README.md                     # Human onboarding, 5-min quickstart
├── CLAUDE.md                     # Prototype-mode rules (see below)
├── bootstrap.sh                  # One-shot setup: install deps + vendor AI docs
│
├── .claude/
│   ├── settings.json             # Allowlist npm, vite, git, gh; wire up Figma MCP
│   └── skills/
│       ├── new-page.md           # /new-page <ref> → builds a route from a Figma URL or screenshot
│       ├── find-component.md     # /find-component <query> → searches .ai-context/registry
│       ├── refresh-ds.md         # /refresh-ds → re-pulls AI docs + bumps pinned SHA
│       └── apply-pattern.md      # /apply-pattern <name> → injects a Confluence pattern
│
├── .ai-context/                  # Vendored at bootstrap, refreshed on /refresh-ds
│   ├── PINNED_SHA                # The mf-app-core SHA these docs were pulled from
│   ├── llms.txt                  # From mf-app-core
│   ├── llms-full.txt             # From mf-app-core
│   ├── LIBRARY_REFERENCE.md      # From mf-app-core
│   ├── TAILWIND_CHEATSHEET.md    # From mf-app-core
│   ├── INTENT_KEYWORDS_GUIDE.md  # From mf-app-core
│   ├── REACT_HOOK_FORM_GUIDE.md  # From mf-app-core
│   └── registry/
│       └── index.json            # From mf-app-core public/registry/
│
├── netskope-context/             # The "layer above components" the starter adds
│   ├── terminology.md            # Settings vs Configuration vs Policy vs Rule vs Object vs
│   │                             # Resource vs Component vs Profile vs Event vs Incident vs
│   │                             # Notification vs Alert vs Log — from Confluence "Common
│   │                             # Mental Model"
│   ├── patterns/                 # Distilled from Confluence "Fantastic Design Patterns"
│   │   ├── empty-fields.md
│   │   ├── long-text-truncation.md
│   │   ├── close-remove-delete.md
│   │   ├── timestamp-timezone.md
│   │   ├── copy-to-clipboard.md
│   │   ├── stacked-side-panels.md
│   │   ├── table-empty-states.md
│   │   ├── bulk-action.md
│   │   ├── data-export-csv.md
│   │   ├── form-lifecycle.md
│   │   ├── form-validation.md
│   │   ├── action-button-lifecycle.md
│   │   ├── stale-input.md
│   │   ├── pending-changes.md
│   │   └── ai/
│   │       ├── ai-tagline.md
│   │       ├── ai-feedback-disclaimer.md
│   │       ├── ai-summarization.md
│   │       ├── ai-natural-language-filter.md
│   │       └── ai-chat.md
│   ├── shell/                    # React reimplementation of the webui app shell
│   │   ├── AppShell.tsx          # Composes TopBar + SideNav + main + breadcrumbs
│   │   ├── SideNav.tsx           # Custom — no @netskope-ui/side-nav exists yet
│   │   ├── nav-config.ts         # Hardcoded nav tree mirroring real webui (SkopeIT,
│   │   │                         # Policies, Settings, etc.) — easy to edit per prototype
│   │   └── README.md             # Explains: why we ship a stand-in, when to update it
│   ├── layouts/                  # Page-level templates, all wrapped in AppShell
│   │   ├── list-detail.tsx       # Table + side-panel-v2 drill-down
│   │   ├── settings-page.tsx     # Tabbed settings with form sections
│   │   ├── crud-wizard.tsx       # Multi-step form (Confluence CRUD wizard pattern)
│   │   ├── dashboard.tsx         # Widget grid + charts
│   │   └── ai-feature.tsx        # AI Tagline + Chat + Summarization pre-wired
│   └── copy-voice.md             # Voice, tone, microcopy do/don'ts
│
├── app/                          # Default mode: Next.js 15 (App Router)
│   ├── tailwind.config.ts        # Uses @netskope-ui/tailwind preset
│   ├── app/layout.tsx            # Imports DS CSS (dates-v2, side-panel-v2, etc.)
│   ├── app/page.tsx              # Blank canvas with one real-component example
│   ├── next.config.mjs           # transpilePackages: ['@netskope-ui/*']
│   └── package.json              # Pins @netskope-ui/* to a known SHA
│
├── html/                         # Lite mode: single-file HTML via esm.sh
│   └── template.html             # React + DS via esm.sh, no build
│
└── scripts/
    ├── install-ds.sh             # Tries corp registry → falls back to GitHub
    ├── vendor-ai-docs.sh         # Curls AI docs from mf-app-core@SHA into .ai-context/
    └── bump-ds-sha.sh            # Updates PINNED_SHA + reinstalls + re-vendors
```

---

## How the VPN gap is handled

The corp npm registry isn't reachable off-VPN, but everyone has GitHub access.

**`scripts/install-ds.sh`:**
1. Try the corp registry (fast path for on-VPN designers).
2. On failure, install directly from GitHub using `npm install git+ssh://git@github.com/netSkope/mf-app-core.git#<pinned-sha>` *or* a tarball generated from a `git archive` of the pinned SHA. This works off-VPN.
3. Pin the SHA in `package.json` so prototypes don't drift unpredictably.

**`scripts/vendor-ai-docs.sh`:**
- Fetches `llms.txt`, `llms-full.txt`, `LIBRARY_REFERENCE.md`, `TAILWIND_CHEATSHEET.md`, `INTENT_KEYWORDS_GUIDE.md`, `REACT_HOOK_FORM_GUIDE.md`, `public/registry/index.json` from `raw.githubusercontent.com/netSkope/mf-app-core/<pinned-sha>/…` and writes them into `.ai-context/`.
- This means **Claude has the full DS knowledge locally** — no live network access needed during prototyping.

**Why vendor instead of git submodule?**
- A submodule is 100MB+ of source the designer doesn't need.
- Raw-URL fetching pulls only what Claude reads (~400K total).
- A pinned SHA makes the snapshot deterministic; `/refresh-ds` bumps it intentionally.

---

## The `CLAUDE.md` contract

mf-app-core's CLAUDE.md is great for **library work** (versioning, registry, tests). The starter's CLAUDE.md is tuned for **prototype work**. The core rules:

1. **Before writing any UI primitive, check `.ai-context/registry/index.json` and `.ai-context/llms.txt`.** If a `@netskope-ui/*` component matches, import it. **Never recreate a primitive** that already exists in the DS (Button, Input, Modal, Table, etc.).
2. **Always use the `@netskope-ui/tailwind` preset.** Never hand-roll colors — use semantic tokens (`action-*`, `neutral-*`, `info-*`, `success-*`, `warning-*`, `danger-*`).
3. **Follow Netskope terminology.** Use the vocabulary in `netskope-context/terminology.md` — `Policy` ≠ `Rule` ≠ `Configuration` ≠ `Settings`. This is non-negotiable.
4. **For common situations (empty fields, truncation, form lifecycle, AI features), check `netskope-context/patterns/` first.** These encode decisions already made by the design org.
5. **Every page renders inside `<AppShell>` from `netskope-context/shell/`.** Never roll your own top-bar / side-nav — the shell is the thing that makes prototypes feel like real webui pages. For the *content* of the page, pick a starting layout from `netskope-context/layouts/` (list-detail, settings-page, crud-wizard, dashboard, ai-feature) that's closest to the designer's reference, then adapt.

6. **Ask the designer for a reference for page content** — a Figma URL, a screenshot of an existing Netskope page, or a description. Don't invent content blindly. If they give a Figma URL, use the Figma MCP (`get_design_context`, `get_code_connect_map`) to pull the linked `@netskope-ui/*` components automatically.
7. **Look up component props in `.ai-context/llms-full.txt` or `.ai-context/registry/index.json`** — these are the source of truth, not your training data.
8. **When unsure, point the designer to `https://shiny-doodle-qlemrp8.pages.github.io/`** for visual confirmation.

CLAUDE.md should be ~150 lines. Anything longer is a sign content belongs in `.ai-context/` or `netskope-context/` and just needs a pointer here.

---

## Skills (Claude Code surface)

Keep this list small. Most value comes from CLAUDE.md + `.ai-context/`; skills are sugar.

- **`/new-page <name> <reference>`** — scaffolds a new route from a reference. Reference can be:
  - A Figma URL → uses Figma MCP + Code Connect to identify components and rebuild the layout with real `@netskope-ui/*` imports
  - A screenshot path → reads the image, identifies components from Storybook, asks the designer to confirm before building
  - A description in prose → composes a layout, then asks the designer to confirm with a screenshot
- **`/find-component <query>`** — greps `.ai-context/registry/index.json` and `.ai-context/llms.txt`, returns matching components with import paths, key props, and Storybook URLs.
- **`/refresh-ds`** — bumps `PINNED_SHA`, re-runs `install-ds.sh` and `vendor-ai-docs.sh`, runs a smoke test.
- **`/apply-pattern <name>`** — reads the matching file in `netskope-context/patterns/` and injects the pattern at the cursor (e.g., `/apply-pattern ai-chat` drops in the standard AI Chat shell).

---

## Output modes — being honest about HTML

| Mode | What works | When to use |
|---|---|---|
| **Next.js (default)** | Full fidelity. Every `@netskope-ui/*` component works. Real interactivity (modals with focus traps, charts, drag-drop, virtualized tables, etc.). Deploys to Vercel. | The 90% case. Any prototype with real interactions. |
| **Single-file HTML** | Lighter. React + DS loaded via esm.sh from a UMD build. Simple components work (Button, Input, Tag, basic Modal). Complex ones (Table, Charts, Spreadsheet, DragGroups) probably won't. | Static layouts, marketing pages, one-off mockups where Next.js is overkill. |

The `/new-page` skill picks the mode and warns the designer when they're about to need something HTML mode can't do — and offers to upgrade them to Next.js.

---

## Phased build order

### v0 — proof of concept (2–3 weeks)
- Next.js mode only
- Bootstrap script with npm + GitHub fallback
- Vendor AI docs at clone time (manual SHA pin)
- CLAUDE.md
- `netskope-context/shell/AppShell.tsx` + `SideNav.tsx` + nav config mirroring webui
- **Two layouts** wrapped in AppShell: `list-detail` and `settings-page` (the most-prototyped shapes)
- Top 10 Confluence patterns distilled into `netskope-context/patterns/`
- Terminology file
- Figma MCP wired into `.claude/settings.json` (designers paste a Figma URL → Claude uses Code Connect to find the right components)
- Test with 1–2 designers on a real prototype task

**Success metric:** A designer can paste a Figma URL or a screenshot and ask Claude "build this as a working prototype" — and the result (a) lives inside the webui-style shell, and (b) uses `Table`/`SidePanelV2`/`ButtonV2` from `@netskope-ui/*`, not a shadcn lookalike. Side-by-side with a real webui page, it should pass the squint test.

### v1 — fill out content
- All Confluence patterns (~25) distilled
- All AI patterns
- Remaining layouts: `crud-wizard`, `dashboard`, `ai-feature`
- Copy/voice guide
- `/find-component`, `/new-page`, `/refresh-ds` skills

### v2 — polish & expansion
- `/apply-pattern` skill
- HTML mode (limited — full AppShell only works in Next.js)
- Reference-from-screenshot path in `/new-page` (when the designer doesn't have Figma handy)
- Process for keeping `SideNav` nav-config in sync with real webui changes

---

## Open questions

1. **SHA bump cadence.** Designer self-serves via `/refresh-ds`, but is there value in a "blessed" SHA the team updates weekly/monthly so most designers don't have to think about it? Could be a simple `LATEST_BLESSED_SHA` env var in the bootstrap.

2. **AI patterns — how prescriptive?** Confluence has AI Chat, Summarization, NL Filter as patterns. Should `/apply-pattern ai-chat` drop in a working React snippet (faster designer ramp-up, harder to keep in sync) or markdown guidance (more flexible, slower)? **Leaning toward working snippets** for AI patterns specifically — they're the highest-value, novel-est patterns where designers most need a head start.

3. **Figma MCP availability.** The plan assumes designers have the Figma MCP installed in Claude Code. If most don't, v0 should include setup instructions in the README (it's one config line). Worth confirming the current install rate before relying on it as the primary `/new-page` path.

4. **`netskope-context` ownership.** Lives in the starter (UX side). Need to nominate an owner / review process for adding patterns + updating terminology. Probably one of the design system designers + a rotating UX reviewer.

5. **Where does the starter live?** A repo under `netskope/` org? Under a personal account for v0? Confirms permissions for designers to use it as a template.

6. **SideNav fidelity.** The stand-in `SideNav.tsx` only needs to be visually faithful (icons, labels, hover/active states, collapse behavior). Do we have screenshots or a Figma source-of-truth for the current side-nav design that I can mirror exactly? Or should I just open the webui Angular component and reverse-engineer the styling?

7. **Long-term:** does the UI dev side have any plans to port the side-nav into `@netskope-ui/side-nav`? If yes, the starter should align with their plan (so v1 or v2 can swap our stand-in for the real package). If no, we own the stand-in indefinitely.

---

## What I'm *not* building

- A new component catalog generator — `registry.json` already exists.
- New AI rules from scratch — `llms.txt`, `LIBRARY_REFERENCE.md`, `.cursorrules` cover this.
- A custom MCP server — the registry as plain JSON files Claude can grep is enough.
- Storybook — designers use the deployed one.
- A package or CLI — git template + bootstrap script is the simplest path that works.
