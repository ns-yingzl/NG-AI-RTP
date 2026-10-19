# Deploying your prototype to GitHub Pages

There are **two ways** to publish your prototype to a shareable web link. You pick
one when you run `./bootstrap.sh` (you can also set up or switch later — read on).

**No VPN required for either path, for any repo made from this template.** CI
builds on Netskope's internal ARC runner (`arc-default-ub20-s-set`), which every
repo in the `netSkope` org can use — there's no per-repo access request, no PAT,
and nothing that only works on the template repo itself.

| | **Automatic** (recommended) | **Manual** |
|---|---|---|
| How you deploy | `git push` to `main` | run `yarn deploy` |
| One-time setup | Flip a repo variable (~30 sec) | None |
| Where it builds | GitHub Actions, on Netskope's internal runner | Your machine |
| Best for | Sharing updates often, hands-off | Occasional deploys, or if you'd rather not have CI running at all |
| Pages "Source" | GitHub Actions | Deploy from a branch (`gh-pages`) |

The two are **mutually exclusive** at the GitHub Pages "Source" setting — a repo
uses one or the other at a time. Bootstrap sets the right one for the mode you pick.

> **Why no VPN/token is needed:** Automatic builds on Netskope's internal ARC
> runner, which has the same network access to corp Artifactory as a
> VPN-connected laptop — so it installs `@netskope-ui/*` directly, no cross-repo
> fetch, no PAT. Manual builds on **your** machine, which is on-VPN and already
> has the design system installed. The only one-time step for Automatic is
> telling the workflow to actually run: setting the `DEPLOY_MODE` repo variable
> to `automatic` (Manual leaves it unset).

---

## Option A — Automatic (deploy on `git push`)

Your prototype ships with a workflow (`.github/workflows/deploy-pages.yml`) that
builds the app as a static site and publishes it to GitHub Pages on every push to
`main`. After a ~3-minute one-time setup, deploying is just `git push`.

### One-time setup

#### 1. Set the `DEPLOY_MODE` repo variable

In **your prototype repo**: **Settings** → **Secrets and variables** → **Actions**
→ **Variables** tab → **New repository variable**.
- **Name:** `DEPLOY_MODE`
- **Value:** `automatic`

This is what tells the workflow to actually run instead of skipping — there's no
token to create, because the workflow's install step runs on Netskope's internal
ARC runner (`arc-default-ub20-s-set`), which already has corp Artifactory access.

> `bootstrap.sh` offers to do steps 1–2 for you (it runs `gh variable set` and sets
> the Pages source). This section is the manual/click-by-click version.

#### 2. Turn on Pages (GitHub Actions source)

**Settings** → **Pages** → **Build and deployment** → **Source: GitHub Actions**.

### Deploy

Push to `main` (or **Actions** tab → *Deploy prototype to GitHub Pages* → **Run
workflow**). When it finishes, the deploy step prints the URL — typically:

```
https://<owner>.github.io/<your-repo>/
```

> The workflow only runs when `DEPLOY_MODE` is `automatic`. If it isn't (e.g. you
> chose Manual mode), pushes to `main` **skip** this workflow cleanly — a green
> check, not a failure — so the two modes never collide.

### How it works (for the curious)

All three jobs run on `arc-default-ub20-s-set` (Netskope's internal runner), per
internal practice:

```
push to main
  └─ check job                        # runs only if DEPLOY_MODE == 'automatic'
  └─ build job
       ├─ setup-node (+ yarn)
       ├─ yarn install --frozen-lockfile   # straight from corp Artifactory —
       │                                   # this runner has the same network
       │                                   # access as a VPN-connected laptop
       └─ yarn build                  # BUILD_STATIC_EXPORT=true → static site in ./out,
                                      # PAGES_BASE_PATH=/<repo> so asset URLs resolve
  └─ deploy job → GitHub Pages
```

The static export is **opt-in via env**, so your local `yarn dev` and `yarn build`
behave exactly as before — only the workflow turns on export + base path.

### Turning it off

Set `DEPLOY_MODE` back to anything other than `automatic` (or delete it):
`gh variable delete DEPLOY_MODE`. No token to rotate or revoke.

---

## Option B — Manual (`yarn deploy`, no token)

Build the prototype on your own machine and publish the result. No token, no CI, no
cross-repo fetch. Whenever you want to publish (or update) your live link:

```bash
yarn deploy
```

That's it. The script (`scripts/deploy-local.sh`) does everything for you:

1. Static-exports the app to `./out` (sets `BUILD_STATIC_EXPORT` + `PAGES_BASE_PATH`
   from your repo name for you — no need to remember the flags).
2. Adds `.nojekyll` so Pages serves Next's `_next/` assets (without it, Pages'
   Jekyll step strips `_`-prefixed folders and every asset 404s).
3. Force-pushes `./out` to the **`gh-pages`** branch.
4. Points Pages **Source** at the `gh-pages` branch (best-effort via `gh`; if it
   can't, it prints the one manual step).
5. Prints your live URL: `https://<owner>.github.io/<your-repo>/`.

The first deploy can take ~1 minute to go live. Re-run `yarn deploy` to update it.

### One manual step, only if the script couldn't set it

If you don't have the `gh` CLI or lack admin on the repo, set the Pages source once
by hand: **Settings** → **Pages** → **Source: Deploy from a branch** →
**`gh-pages`** / **`/ (root)`**. After that, `yarn deploy` just updates the branch.

---

## Troubleshooting

**(Automatic) The workflow is queued forever / "Waiting for a runner to pick up this job".**
- `arc-default-ub20-s-set` isn't assigned to this repo's runner group, or the ARC
  runner pool is saturated/down. Confirm the repo is in the `netSkope` org (runner
  groups are usually org-wide) and check with whoever administers the ARC runners.
  As a stopgap, switch to Manual mode (`yarn deploy`) until it's resolved.

**(Automatic) `yarn install` fails on the runner with a 404 / ENOTFOUND for `@netskope-ui/*`.**
- The ARC runner itself can't reach `artifactory-rd.netskope.io` — a runner
  network-policy or DNS issue, not something this repo controls. Report it to
  whoever administers `arc-default-ub20-s-set`.

**(Either) Page loads but CSS/JS is missing / links 404.**
- Base-path mismatch. Project pages live under `/<repo>/`. Both paths set
  `PAGES_BASE_PATH` to your repo name automatically. If you deploy to a **user/org
  root** page (`<owner>.github.io`), Automatic: edit the workflow's `PAGES_BASE_PATH`
  to `''`; Manual: this is the project-page case only.
- Also confirm `.nojekyll` is present at the site root (Manual adds it automatically).

**(Either) `next build` fails with a static-export error.**
- Static export can't use server-only features (API routes, server actions,
  runtime `next/image` optimization, dynamic SSR). Prototypes are normally static;
  if you added something dynamic, make it client-side (`'use client'`) or drop it.

**(Automatic) The workflow didn't run on push.**
- Confirm the `DEPLOY_MODE` repo variable is set to `automatic` (without it the
  workflow skips by design), that Pages **Source** is *GitHub Actions*, and that
  you pushed to `main`.

**(Manual) `Couldn't create the gh-pages worktree`.**
- A stale worktree from an interrupted run. Run `git worktree prune` and retry.

---

## Switching modes later

- **Manual → Automatic:** set the `DEPLOY_MODE` repo variable to `automatic`
  (Option A) and set Pages **Source: GitHub Actions**. The next push to `main`
  deploys.
- **Automatic → Manual:** unset the variable (`gh variable delete DEPLOY_MODE`) so
  CI stops, then run `yarn deploy` (it flips Pages **Source** to the branch).
