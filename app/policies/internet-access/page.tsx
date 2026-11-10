'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Breadcrumbs, ButtonV2, Text } from '@netskope-ui/core';
import { MoreIcon, PanelIcon } from '@netskope-ui/icons';
import { SimpleTabButton, Tabs, TabsContent, TabsList, TabsTrigger } from '@netskope-ui/tabs';
import { TopBar } from '@netskope-ui/top-bar';
import { AppShell } from '@netskope-context/shell/AppShell';
import { POLICY_GROUPS, type Policy, type PolicyDraft, type PolicyGroup } from './data';
import type { HighlightProposal } from './highlight';
import { NewPolicyPanel } from './NewPolicyPanel';
import { PolicyGroupsPanel } from './PolicyGroupsPanel';
import { PolicyList } from './PolicyList';
import { ProposalSwitcher } from './ProposalSwitcher';

// The filter's advanced query input touches `window` at import — client-only.
const PolicyFilters = dynamic(() => import('./PolicyFilters'), { ssr: false });

const TABS = [
  { value: 'fast-path', label: 'Fast Path' },
  { value: 'ssl-decryption', label: 'SSL Decryption' },
  { value: 'cloud-web-firewall-dns', label: 'Cloud, Web, Firewall & DNS' },
  { value: 'fallback', label: 'Fallback' },
] as const;

type TabValue = (typeof TABS)[number]['value'];

function DefaultAction() {
  return (
    <p className="text-sm text-neutral-text">
      <strong>Default Action:</strong> When none of the policies match, non-web traffic would be{' '}
      <span className="inline-flex items-center gap-1 align-middle">
        <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-full bg-danger-bg" />
        <a href="#" className="text-action-text hover:underline">
          Blocked
        </a>
      </span>
      , cloud &amp; web traffic would be{' '}
      <span className="inline-flex items-center gap-1 align-middle">
        <span aria-hidden className="inline-block h-3.5 w-3.5 rounded-full bg-success-bg" />
        <strong>Allowed</strong>
      </span>
    </p>
  );
}

const AI_POLICY_TYPES = ['AI Guardrails', 'Agent Action Control', 'Agentic Access'];

function policyTypeFor(goal: string): string {
  if (goal === 'DNS') return 'DNS';
  return AI_POLICY_TYPES.includes(goal) ? goal : 'Cloud App Access';
}

function draftToPolicy(draft: PolicyDraft, group: PolicyGroup): Policy {
  return {
    id: `policy-${group.index}-${Date.now()}`,
    number: `${group.index}.${group.policies.length + 1}`,
    name: draft.name,
    type: policyTypeFor(draft.goal),
    enabled: draft.enabled,
    alertCount: 0,
    users: draft.users,
    destination: draft.destination,
    action: draft.action,
    template: draft.action === 'Block' ? 'Default Template' : '',
  };
}

function CloudWebFirewallDnsTab({ highlight }: { highlight: HighlightProposal }) {
  const [groups, setGroups] = useState<PolicyGroup[]>(POLICY_GROUPS);
  // `null` = all groups; otherwise a group id or a section id (see PolicyGroupsPanel).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The panel starts collapsed. The "Policy Groups" button opens it; while open, a circular "<" on its
  // edge collapses it again and the button is hidden.
  const [groupsPanelOpen, setGroupsPanelOpen] = useState(false);
  const [newPolicyOpen, setNewPolicyOpen] = useState(false);

  const visibleGroups = useMemo(() => {
    if (!selectedId) return groups;
    return selectedId.startsWith('section-')
      ? groups.filter((g) => g.sectionId === selectedId)
      : groups.filter((g) => g.id === selectedId);
  }, [groups, selectedId]);
  const groupNames = useMemo(() => groups.map((g) => g.name), [groups]);

  const policyCount = groups.reduce((n, g) => n + g.policies.length, 0);
  const disabledCount = groups.reduce((n, g) => n + g.policies.filter((p) => !p.enabled).length, 0);

  function savePolicy(draft: PolicyDraft) {
    const target = groups.find((g) => g.name === draft.groupName) ?? groups[0];
    const policy = draftToPolicy(draft, target);
    setGroups((prev) =>
      prev.map((g) => (g.id === target.id ? { ...g, policies: [...g.policies, policy] } : g)),
    );
    // Show the new policy: leave any single-group view and scroll to it once it renders.
    setSelectedId(null);
    window.setTimeout(() => {
      document.getElementById(policy.id)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 100);
  }

  return (
    <div className="flex min-h-0 flex-1">
      {groupsPanelOpen && (
        <PolicyGroupsPanel
          groups={groups}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onClose={() => setGroupsPanelOpen(false)}
        />
      )}

      <div className="min-w-0 flex-1 overflow-y-auto bg-neutral-bg-base">
        <div className="flex flex-col gap-4 px-8 py-8">
          <DefaultAction />

          <div className="rounded bg-neutral-bg p-4">
            <PolicyFilters />
          </div>

          <div className="flex min-h-8 flex-wrap items-center gap-x-4 gap-y-2 [&_button]:whitespace-nowrap">
            <div className="flex items-center gap-3">
              {!groupsPanelOpen && (
                <ButtonV2
                  label="Policy Groups"
                  StartIcon={PanelIcon}
                  sentiment="NEUTRAL"
                  styleType="REGULAR"
                  aria-expanded={false}
                  aria-controls="policy-groups-panel"
                  onClick={() => setGroupsPanelOpen(true)}
                />
              )}
              <div className="flex items-center gap-2">
                <ButtonV2
                  label="New Policy"
                  sentiment="ACTION"
                  styleType="PRIMARY"
                  onClick={() => setNewPolicyOpen(true)}
                />
                <ButtonV2 label="Select" sentiment="NEUTRAL" styleType="REGULAR" />
                <ButtonV2
                  aria-label="More actions"
                  EndIcon={MoreIcon}
                  sentiment="NEUTRAL"
                  styleType="REGULAR"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap text-xs font-bold text-neutral-text-subtle">
              <span>
                {policyCount} Policies
                {disabledCount > 0 && (
                  <span className="font-normal"> ({disabledCount} disabled)</span>
                )}
              </span>
              <span aria-hidden>|</span>
              <span>{groups.length} Groups</span>
            </div>
          </div>

          <PolicyList groups={visibleGroups} />
        </div>
      </div>

      <NewPolicyPanel
        show={newPolicyOpen}
        setShow={setNewPolicyOpen}
        groupNames={groupNames}
        onSave={savePolicy}
        highlight={highlight}
      />
    </div>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-sm text-neutral-text-subtle">{label} policies aren’t part of this prototype.</p>
    </div>
  );
}

export default function InternetAccessPoliciesPage() {
  // Default tab is "Cloud, Web, Firewall & DNS".
  const [tab, setTab] = useState<TabValue>('cloud-web-firewall-dns');
  // Prototype: which "new AI capabilities" highlight is shown on the New Policy goal tiles.
  const [highlight, setHighlight] = useState<HighlightProposal>('accent');

  return (
    <AppShell activeNavId="internet-access">
      <div className="shrink-0 bg-neutral-bg-base">
        <TopBar>
          <Breadcrumbs>
            <Text as="p" className="cursor-pointer">
              Policies
            </Text>
            <Text as="p" className="cursor-pointer">
              Real-time
            </Text>
            <Text className="text-neutral-text-disabled">Internet Access</Text>
          </Breadcrumbs>
          <TopBar.Title>Internet Access Policies</TopBar.Title>
        </TopBar>
      </div>

      <Tabs value={tab} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="shrink-0 bg-neutral-bg-base px-8 shadow-[rgba(0,0,0,0.1)_0px_3px_4px_0px]">
          {TABS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value} asChild>
              <SimpleTabButton onClick={() => setTab(value)} isSelected={tab === value}>
                {label}
              </SimpleTabButton>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="cloud-web-firewall-dns" className="flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
          <CloudWebFirewallDnsTab highlight={highlight} />
        </TabsContent>
        {TABS.filter((t) => t.value !== 'cloud-web-firewall-dns').map(({ value, label }) => (
          <TabsContent key={value} value={value} className="flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
            <EmptyTab label={label} />
          </TabsContent>
        ))}
      </Tabs>

      <ProposalSwitcher value={highlight} onChange={setHighlight} />
    </AppShell>
  );
}
