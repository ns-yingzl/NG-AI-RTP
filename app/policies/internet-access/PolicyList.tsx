'use client';

import { useState } from 'react';
import { ButtonV2, Chip, GlobalLabels } from '@netskope-ui/core';
import {
  AngleDownIcon,
  AngleRightIcon,
  BellSnoozeIcon,
  CheckmarkCircleIcon,
  ClockIcon,
  DragIcon,
  GridIcon,
  HandCircleIcon,
  MoreIcon,
  UserIcon,
} from '@netskope-ui/icons';
import type { Policy, PolicyGroup } from './data';

function PolicyRow({ policy }: { policy: Policy }) {
  return (
    <div id={policy.id} className="flex flex-wrap items-start overflow-hidden rounded bg-neutral-bg-base">
      <div className="flex min-h-[52px] items-start px-4 py-2">
        <DragIcon aria-hidden className="mt-0.5 h-4 w-4 cursor-grab fill-neutral-icon" />
      </div>
      <div className="w-14 shrink-0 p-2 text-right text-sm text-neutral-text">{policy.number}</div>

      <div className="flex w-[240px] shrink-0 flex-col gap-1 px-4 py-2">
        <a href="#" className="text-sm text-action-text hover:underline">
          {policy.name}
        </a>
        <span className="text-xs text-neutral-text-subtle">{policy.type}</span>
        <div className="mt-1 flex items-center gap-2">
          <Chip sentiment={policy.enabled ? 'success' : 'neutral'} variant="filled">
            <span aria-hidden className="mr-1 inline-block h-2 w-2 rounded-full bg-success-bg" />
            {policy.enabled ? 'Enabled' : 'Disabled'}
          </Chip>
          <Chip sentiment="action" variant="filled" aria-label="Scheduled">
            <ClockIcon aria-hidden className="h-3 w-3 fill-action-icon" />
          </Chip>
          <Chip sentiment="neutral" variant="filled" aria-label={`${policy.alertCount} alerts`}>
            <BellSnoozeIcon aria-hidden className="mr-1 h-3 w-3 fill-neutral-icon" />
            {policy.alertCount}
          </Chip>
        </div>
      </div>

      <div className="flex min-w-[280px] flex-1 flex-col gap-2 px-4 py-2 text-sm text-neutral-text">
        <div className="flex items-center gap-1.5">
          <UserIcon aria-hidden className="h-4 w-4 shrink-0 fill-neutral-icon" />
          <span className="truncate">{policy.users}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GridIcon aria-hidden className="h-4 w-4 shrink-0 fill-neutral-icon" />
          <span className="truncate">{policy.destination}</span>
        </div>
        <hr className="my-1 border-0 border-t border-dashed border-neutral-border-weak" />
        <div className="flex items-center gap-1.5">
          {policy.action === 'Block' ? (
            <HandCircleIcon aria-hidden className="h-4 w-4 shrink-0 fill-danger-icon" />
          ) : policy.action === 'Allow' ? (
            <CheckmarkCircleIcon aria-hidden className="h-4 w-4 shrink-0 fill-success-icon" />
          ) : (
            <BellSnoozeIcon aria-hidden className="h-4 w-4 shrink-0 fill-warning-icon" />
          )}
          <span>
            {policy.action}
            {policy.template && (
              <>
                : <span className="text-neutral-text-subtle">{policy.template}</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="px-2 py-2">
        <ButtonV2
          aria-label={`Actions for policy ${policy.number}`}
          EndIcon={MoreIcon}
          sentiment="NEUTRAL"
          styleType="NO_BORDER"
          size="SMALL"
        />
      </div>
    </div>
  );
}

function PolicyGroupCard({ group }: { group: PolicyGroup }) {
  const [open, setOpen] = useState(true);
  const count = group.policies.length;
  const Chevron = open ? AngleDownIcon : AngleRightIcon;

  return (
    <section aria-label={`Policy group ${group.name}`} className="overflow-hidden rounded bg-neutral-bg-base-active">
      <header className="flex h-9 items-center">
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? `Collapse ${group.name}` : `Expand ${group.name}`}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-12 items-center justify-center"
        >
          <Chevron aria-hidden className="h-4 w-4 fill-neutral-icon" />
        </button>
        <h3 className="flex items-center gap-1 text-sm text-neutral-text">
          <span className="font-bold">
            {group.index}. {group.name}
          </span>
          <span className="text-neutral-text-weak">
            ({count} {count === 1 ? 'policy' : 'policies'})
          </span>
        </h3>
        <ButtonV2
          aria-label={`Actions for group ${group.name}`}
          EndIcon={MoreIcon}
          sentiment="NEUTRAL"
          styleType="NO_BORDER"
          size="SMALL"
        />
        <div className="ml-auto px-4">
          <GlobalLabels colors={group.labels} />
        </div>
      </header>
      {open && (
        <div className="flex flex-col gap-2 px-2 pb-2">
          {group.policies.map((policy) => (
            <PolicyRow key={policy.id} policy={policy} />
          ))}
        </div>
      )}
    </section>
  );
}

export function PolicyList({ groups }: { groups: PolicyGroup[] }) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <PolicyGroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
