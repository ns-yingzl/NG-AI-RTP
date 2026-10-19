'use client';

import type { ReactNode } from 'react';
import { SideNav } from './SideNav';

/**
 * AppShell — the visual shell every prototype page renders inside.
 *
 * Structure:
 *   SideNav (left, fixed width) | main content (right, scrollable)
 *
 * The page itself is expected to render its own page-level top bar using
 * `@netskope-ui/top-bar` (with <TopBar>, <TopBar.Title>, <TopBar.Actions>,
 * <Breadcrumbs>). That's how real React pages in webui work — see
 * mf-platform/src/pages/license/LicensePage.tsx for the canonical pattern.
 *
 * The global webui chrome (logo, tenant, user avatar, notifications) is
 * provided by Angular in production. We don't simulate it in the starter —
 * prototypes look correct without it, since each page already has its own
 * TopBar via @netskope-ui/top-bar.
 *
 * Usage:
 *   <AppShell activeNavId="policies-rtp">
 *     <TopBar>
 *       <Breadcrumbs>…</Breadcrumbs>
 *       <TopBar.Title>Real-Time Protection</TopBar.Title>
 *       <TopBar.Actions><ButtonV2 label="New" /></TopBar.Actions>
 *     </TopBar>
 *     <YourPageContent />
 *   </AppShell>
 */

type Props = {
  children: ReactNode;
  activeNavId?: string;
};

export function AppShell({ children, activeNavId }: Props) {
  return (
    <div className="flex h-screen bg-neutral-bg">
      <SideNav activeNavId={activeNavId} />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
