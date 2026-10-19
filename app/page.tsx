'use client';

import { Breadcrumbs, Text } from '@netskope-ui/core';
import { TopBar } from '@netskope-ui/top-bar';
import { AppShell } from '@netskope-context/shell/AppShell';

export default function Home() {
  return (
    <AppShell activeNavId="dashboard">
      <TopBar>
        <Breadcrumbs>
          <Text className="text-neutral-text-disabled">Home</Text>
        </Breadcrumbs>
        <TopBar.Title>Periskope UX Starter</TopBar.Title>
      </TopBar>

      <div className="flex-1 overflow-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-10">
          <p className="text-neutral-text">
            This is your blank prototype workspace. The Periskope shell on the left and the
            page <code className="rounded bg-neutral-bg-weak px-1 py-0.5 text-sm">TopBar</code>{' '}
            above are already wired up with real <code className="rounded bg-neutral-bg-weak px-1 py-0.5 text-sm">@netskope-ui/*</code> components.
          </p>

          <section className="rounded-md border border-neutral-border-weak bg-neutral-bg-base p-5">
            <h2 className="text-base font-semibold text-neutral-text">Build your first page with Claude</h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-neutral-text">
              <li>
                In your terminal, run <code className="rounded bg-neutral-bg-weak px-1 py-0.5">claude</code> in this directory.
              </li>
              <li>
                Paste a Figma URL or a screenshot of the screen you want to build.
              </li>
              <li>
                Ask Claude to scaffold it at a new route, e.g. <em>"Build this at <code className="rounded bg-neutral-bg-weak px-1 py-0.5">app/incidents/dlp/page.tsx</code> using <code className="rounded bg-neutral-bg-weak px-1 py-0.5">@netskope-ui/*</code> components inside <code className="rounded bg-neutral-bg-weak px-1 py-0.5">&lt;AppShell&gt;</code>."</em>
              </li>
              <li>
                Refresh the browser at the new URL. Iterate with Claude until it looks right.
              </li>
            </ol>
          </section>

          <section className="rounded-md border border-neutral-border-weak bg-neutral-bg-base p-5">
            <h2 className="text-base font-semibold text-neutral-text">Useful Claude commands</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-text">
              <li>
                <code className="rounded bg-neutral-bg-weak px-1 py-0.5">/find-component table</code> — search the design system catalog
              </li>
              <li>
                Open <code className="rounded bg-neutral-bg-weak px-1 py-0.5">CLAUDE.md</code> to see the rules Claude follows in this prototype
              </li>
              <li>
                Check <code className="rounded bg-neutral-bg-weak px-1 py-0.5">netskope-context/patterns/</code> for distilled design patterns
              </li>
              <li>
                Check <code className="rounded bg-neutral-bg-weak px-1 py-0.5">netskope-context/terminology.md</code> for Netskope-specific vocabulary
              </li>
            </ul>
          </section>

          <p className="text-sm text-neutral-text-subtle">
            Replace this page when you're ready — it lives at <code className="rounded bg-neutral-bg-weak px-1 py-0.5">app/page.tsx</code>.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
