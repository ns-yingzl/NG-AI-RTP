# Periskope UX Starter

A starter template for Netskope UX designers building AI prototypes with Claude Code, so the prototypes use the **real `@netskope-ui/*` design system** instead of ad-hoc shadcn lookalikes.

> 📋 The full design rationale lives in [`PLAN.md`](./PLAN.md). The instructions Claude follows are in [`CLAUDE.md`](./CLAUDE.md). This README is just the quickstart.

---

## Quickstart

> **Testing this starter?** Follow every step below in order. Each step says what you should expect to see — if reality doesn't match, jump to [Troubleshooting](#troubleshooting) and then tell us (see [Giving feedback](#giving-feedback-while-testing)). The whole flow, first time, takes ~10–15 min (most of it is `bootstrap.sh` installing the design system).

### 0. Before you start — prerequisites

Install these and confirm each works. Run the check commands; if any errors, fix that before continuing.

| Tool | Why | Check it works |
|------|-----|----------------|
| **Node 18+** | Runs Next.js | `node --version` → `v18` or newer |
| **Yarn or npm** | Installs deps | `yarn --version` (or `npm --version`) |
| **gh CLI**, authenticated to netSkope | Used by `bootstrap.sh` to vendor AI docs | `gh auth status` → logged in to github.com |
| **git + SSH access to `github.com:netSkope/*`** | Clone + vendor step | `ssh -T git@github.com` → "Hi `<you>`!" |
| **Claude Code** ([claude.com/code](https://claude.com/code)) | The AI you prototype with | `claude --version` |
| **Corp VPN (or corp npm token)** | Installs `@netskope-ui/*` from corp Artifactory. No VPN? An [off-VPN fallback](#off-vpn-install-fallback) installs from a prebuilt snapshot instead | Reach `artifactory-rd.netskope.io` — or, for the fallback, just GitHub |
| **Figma MCP in Claude Code** *(optional, recommended)* | Enables the paste-a-Figma-URL workflow | `/mcp` inside Claude lists a `figma` server |

This is an **internal** Netskope repo — you must be a member of the `netSkope` GitHub org to use the template.

### 1. Create your own prototype repo from the template

You get a **brand-new, standalone repo** seeded with this starter's files — no shared git history, no link back here. Pick one method:

**Option A — GitHub UI (easiest, no CLI):**
1. Open **https://github.com/netSkope/ux-starter-periskope**
2. Click the green **"Use this template"** → **"Create a new repository"**.
3. Owner: `netSkope` (or your account); name it e.g. `my-prototype`; click **Create**.
4. Clone it locally:
   ```bash
   gh repo clone netSkope/my-prototype   # or: git clone git@github.com:netSkope/my-prototype.git
   cd my-prototype
   ```

**Option B — one command with `gh`:**
```bash
gh repo create my-prototype --template netSkope/ux-starter-periskope --private --clone
cd my-prototype
```

> ⚠️ The fresh repo will **not** contain `node_modules/` or the `.ai-context/` docs — those are intentionally gitignored and get pulled in the next step. That's expected.

### 2. Bootstrap — pull the design-system docs + install deps

```bash
./bootstrap.sh
```

This is idempotent (safe to re-run). It will, in order:
1. Check you have `node` and `gh`,
2. **Vendor AI docs** from `mf-app-core` at the commit in `PINNED_SHA`,
3. **Install** `@netskope-ui/*` + Next.js dependencies (the slow part). On VPN this pulls from the corp registry; off VPN it automatically falls back to a prebuilt snapshot (see [Off-VPN install](#off-vpn-install-fallback)),
4. Build the component→artifacts index Claude uses.

✅ **Success looks like:** a green `✓ Setup complete` followed by a "Next steps" block. If it fails, the error names the failing step — see [Troubleshooting](#troubleshooting).

### 3. Run the dev server

```bash
yarn dev
```
Open **http://localhost:3000**.

✅ **Success looks like:** a home page rendered inside the **Periskope app shell** — left side navigation, and a page-level top bar (title + breadcrumbs) from `@netskope-ui/top-bar`, with example cards. Fonts are **Lato**. If you instead see unstyled text or a stack trace, see [Troubleshooting](#troubleshooting).

There are example pages already wired up to explore:
- `/` — home with example cards
- `/examples/policies` — list + detail layout
- `/examples/tenant-settings` — a settings page layout

### 4. Start Claude Code and build your first page

In a second terminal, from the repo root:
```bash
claude
```

Then try a real prototype task. The highest-quality path is to give Claude a **Figma URL or screenshot**:

> *"Build the screen at `<paste Figma URL>` as a new page in `app/my-feature/`. Use the real `@netskope-ui/*` components."*

…or describe it in prose:

> *"Build a policies list page: a top bar titled 'Real-Time Protection' with a 'New Policy' action, a filter bar, and a data table with columns Name, Status, Action."*

Claude will read its rules (`CLAUDE.md`), find the right components, and compose the page. When the result is ready, ask it to **verify**:

> *"Run `/verify /my-feature`"* — renders the route in a headless browser and screenshots it so you can confirm it looks right.

✅ **You're done testing** once you've gone from a Figma URL/description → a rendered page at a new route. That's the core loop.

---

## What's in this repo

```
ux-starter-periskope/
├── CLAUDE.md                     The rules Claude follows when helping you
├── PLAN.md                       Design rationale for this starter
├── PINNED_SHA                    The mf-app-core commit the AI docs were pulled from
│
├── app/                          Your Next.js prototype
│   ├── page.tsx                  Home (edit this freely)
│   └── globals.css               DS CSS imports + self-hosted Lato fonts
│
├── netskope-context/             Netskope-specific knowledge for Claude
│   ├── terminology.md            Settings vs Configuration vs Policy vs Rule, etc.
│   ├── patterns/                 Distilled Confluence design patterns
│   └── shell/                    AppShell + SideNav (stand-in for the real Angular shell)
│
├── .ai-context/                  Vendored from mf-app-core (gitignored — pulled per env)
│   ├── llms.txt                  Fast component index
│   ├── llms-full.txt             Full reference, every prop, every example
│   ├── registry/index.json       Machine-readable catalog
│   └── …
│
├── .claude/
│   ├── settings.json             Bash allowlist
│   └── skills/                   Custom Claude Code skills
│
└── scripts/
    ├── install-ds.sh             Installs deps; auto off-VPN fallback to the snapshot
    ├── build-offline-snapshot.sh Maintainer (on VPN): publish the off-VPN snapshot
    └── vendor-ai-docs.sh
```

---

## How to prototype with Claude

The shortest, highest-quality path:

1. **Have a Figma URL or screenshot ready** of what you want to build.
2. In Claude, paste the URL and say "build this as a new page in `app/<your-route>/`".
3. Claude reads `.ai-context/generated/index.json` + the vendored stories/Code Connect to find the right `@netskope-ui/*` components, then composes them inside `<AppShell>` with a `<TopBar>` from `@netskope-ui/top-bar`.
4. If the result drifts, point Claude at the relevant pattern: "Apply the table-empty-states pattern" or "Follow form-lifecycle for the save button."

Useful slash commands (custom skills shipped in `.claude/skills/`):

- `/find-component <query>` — search the design-system catalog; returns the import path, key props, and Storybook URL for a matching `@netskope-ui/*` component.
- `/find-usage <ComponentName>` — the **verified** real-world usage of a component (correct props + canonical composition), read from the authoritative source artifacts rather than the summarized docs. Use this before writing any component you're unsure about.
- `/verify <route>` — render a route in a headless browser, screenshot it, and surface SSR/runtime errors. Run this before you call a page "done."

---

## Updating the design system snapshot

The AI docs and component metadata are pinned to a specific `mf-app-core` commit (see `PINNED_SHA`). To pull the latest:

```bash
# Edit PINNED_SHA to a newer commit hash, then:
yarn refresh-ds
```

This re-vendors all `.ai-context/` files and re-runs `yarn install` to grab any new component versions (rewriting `yarn.lock`).

> If you maintain the **off-VPN snapshot** (below), re-publish it after a refresh so off-VPN designers get the new versions too: `yarn build-offline-snapshot` (run on VPN).

---

## Off-VPN install (fallback)

The normal install needs the corp VPN (or a corp registry token) because `@netskope-ui/*` lives on Netskope's private Artifactory. For designers who can't get on VPN, there's a **fallback** that requires only public internet + GitHub access.

**How it works:** a maintainer on VPN publishes a snapshot of just the private `@netskope-ui/*` tarballs (~4 MB — the exact versions the current `yarn.lock` resolves to, checksum-verified) as a GitHub Release asset on the template repo, keyed to the `yarn.lock` hash. Off VPN, the installer downloads the snapshot matching your lockfile, seeds a local **yarn offline mirror** with it, and installs — the private scope resolves from the mirror, public deps (React, Next, …) still come from public npm. The corp registry is never contacted.

**As a designer (off VPN):** nothing special — `./bootstrap.sh` tries the normal install first and falls back automatically if it fails. To force it: `yarn install-offline`.

**As a maintainer (on VPN) — keeping the snapshot current:**

```bash
# whenever @netskope-ui versions change (e.g. after a refresh):
yarn refresh-ds              # pulls latest packages + docs, rewrites yarn.lock
yarn build-offline-snapshot  # rebuilds + uploads the snapshot for the new yarn.lock
```

`build-offline-snapshot` uploads to the `ds-offline-mirror` release on `netSkope/ux-starter-periskope` (overridable via `OFFLINE_SNAPSHOT_REPO`). Only the **current** snapshot matters — designers always pull the one matching their checked-out `yarn.lock`, which is the latest published set. There's no archive of old versions to maintain.

---

## Deploying to GitHub Pages

Publish your prototype to a shareable web link. There are **two ways**, and `./bootstrap.sh` lets you pick one (you can switch later). Neither needs VPN — this works out of the box for any repo made from this template, since Netskope's internal ARC runner (not the generic GitHub-hosted one) has native corp Artifactory access:

- **Automatic** (recommended) — a workflow publishes on every push to `main`; deploying is just `git push`. One-time setup: flip the `DEPLOY_MODE` repo variable to `automatic` — no token, no VPN.
- **Manual** — run `yarn deploy` to build on your machine and publish. No token, no setup; you run one command each time.

Full setup for both, plus troubleshooting and how to switch modes, is in **[`DEPLOYMENT.md`](./DEPLOYMENT.md)**.

---

## Troubleshooting

### `yarn install` fails with 404 on `@netskope-ui/core`

You're either off the corp VPN or your `~/.npmrc` isn't set up with the corp registry token for the `@netskope-ui` scope.

- **On VPN / have a token:** get on VPN (or fix `~/.npmrc`) and re-run.
- **Off VPN:** `install-ds.sh` automatically falls back to the **off-VPN snapshot** — it downloads a prebuilt mirror of the private `@netskope-ui/*` tarballs from the template repo's GitHub Releases and installs the private scope from there, while public deps come from public npm. You only need public internet + `gh` access, not the corp network. To force this path: `yarn install-offline` (or `./scripts/install-ds.sh --offline`).

If the fallback says *"No offline snapshot found matching this repo's yarn.lock"*, nobody has published a snapshot for your lockfile yet — see [Off-VPN install](#off-vpn-install-fallback) below for how a maintainer publishes one.

### `yarn install` fails with `Unknown Syntax Error: Option --use-yarnrc is not supported`

Your active `yarn` is **Yarn 2+ (Berry)**, but the off-VPN install uses a Yarn **Classic (1.x)** feature (`--use-yarnrc`, the offline mirror). `bootstrap.sh` tries to fix this automatically via corepack; if it couldn't (usually because corepack lacked permission to write its shims), do it yourself:

```bash
corepack enable      # makes `yarn` use the Classic version pinned in package.json
yarn --version       # should now print 1.22.x
./bootstrap.sh       # re-run
```

If `corepack enable` reports a permissions error, run it with `sudo`, or install Yarn Classic directly: `npm i -g yarn@1.22.22`.

### `bootstrap.sh` fails with `self-signed certificate in certificate chain` (or `unable to get local issuer certificate`)

The **Netskope client's TLS inspection** is intercepting the HTTPS downloads (npm, yarn, corepack, or git-over-HTTPS) and Node doesn't trust the inspection CA. The quick workaround we use in workshops:

1. Temporarily **pause / disable the Netskope client**.
2. Re-run `./bootstrap.sh`.
3. **Re-enable the Netskope client** when it finishes.

(Yes — it's Netskope's own SSL inspection blocking Netskope's design system. The permanent fix is to point Node at the Netskope CA with `NODE_EXTRA_CA_CERTS=/path/to/netskope-ca.pem`, but pausing the client is the fast path for a prototype.)

### `git clone` or `ssh -T git@github.com` fails (`Permission denied (publickey)`) — or you can't create your repo

Your machine isn't authenticated to GitHub over SSH yet. Easiest fix (no manual key-wrangling), which is what we recommend for designers:

1. Run and follow the prompts — pick **GitHub.com** → **SSH** (let it generate & upload a key for you):
   ```bash
   gh auth login
   ```
2. **Authorize the key for SSO** in the GitHub UI: open **https://github.com/settings/keys**, find your new key, click **Configure SSO** → **Authorize** for **netSkope**. (netSkope enforces SSO, so an un-authorized key is rejected — this step is the one people miss.)
3. Verify, then re-run bootstrap:
   ```bash
   ssh -T git@github.com   # should greet you: "Hi <you>!"
   ./bootstrap.sh
   ```

### The dev server runs but components look unstyled

Check that the relevant `@netskope-ui/<pkg>/dist/styles.css` is imported in `app/globals.css`. Some packages (dates-v2, side-panel-v2, spreadsheet, list-input) ship their own CSS.

### Claude is suggesting shadcn-style components

That means Claude isn't reading `CLAUDE.md` (it should be loaded automatically) or the rules aren't strong enough. Open `CLAUDE.md` directly and tell Claude "follow these rules" — and report this so we can sharpen the rules.

### Side navigation looks wrong / outdated

The `SideNav.tsx` is a stand-in (the real one lives in webui's Angular code; no `@netskope-ui/side-nav` package exists yet). Edit `netskope-context/shell/nav-config.ts` to fix the menu structure for your prototype. Styling tweaks go in `SideNav.tsx`.

---

## Giving feedback while testing

You're an early tester — the most useful thing you can do is tell us where the flow broke or felt wrong. When something doesn't match the "✅ Success looks like" notes above, capture:

1. **Which step** (0–4) you were on.
2. **What you ran** and **what happened** (paste the terminal output or a screenshot).
3. Your environment: `node --version`, on/off VPN, OS, and whether you used the UI or `gh` to create the repo.

Send it via **[open an issue on `netSkope/ux-starter-periskope`](https://github.com/netSkope/ux-starter-periskope/issues)** (preferred — it's searchable) or ping the UX/AI-starter channel. Concrete repros of "Claude suggested a non-`@netskope-ui` component" or "this component rendered unstyled" are especially valuable — they become new rules or `known-issues.md` entries.

---

## Contributing back

The starter improves as designers use it. If you found a pattern, layout, or skill that helped, please open a PR:

- New pattern → `netskope-context/patterns/<name>.md`
- New skill → `.claude/skills/<name>/SKILL.md` (one directory per skill, with `name:` + `description:` frontmatter)
- New runtime gotcha → append to `netskope-context/known-issues.md`
- New composite recognition → row in `netskope-context/composite-recognizer.md`

For non-trivial changes, read `PLAN.md` first to make sure the change fits the v0/v1/v2 phasing.

---

## Roadmap

See [`PLAN.md`](./PLAN.md) → "Phased build order" for what's coming in v1 and v2. The biggest items:

- **v1:** ✅ off-VPN install fallback (shipped — see [Off-VPN install](#off-vpn-install-fallback)); next up: `/new-page` skill, full pattern coverage, AI-pattern layouts (AI Chat, Summarization, NL Filter)
- **v2:** HTML mode, screenshot-as-reference workflow, side-nav sync process
