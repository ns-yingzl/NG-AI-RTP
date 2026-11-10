'use client';

import { useMemo, useState } from 'react';
import { ButtonV2 } from '@netskope-ui/core';
import { AngleDownIcon, AngleLeftIcon, AngleRightIcon, PlusIcon } from '@netskope-ui/icons';
import { POLICY_SECTIONS, type PolicyGroup } from './data';

type Props = {
  groups: PolicyGroup[];
  /** `null` = "All Groups"; otherwise a group id or a section id. */
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Closes the panel. While it is open the "Policy Groups" button in the action row is hidden. */
  onClose: () => void;
};

type Entry =
  | { kind: 'group'; group: PolicyGroup }
  | { kind: 'section'; id: string; name: string; children: PolicyGroup[] };

const rowBase = 'flex h-8 w-full items-center rounded-md text-left text-sm text-neutral-text';

export function PolicyGroupsPanel({ groups, selectedId, onSelect, onClose }: Props) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Sections appear where their first group would, with their groups nested underneath.
  const entries = useMemo<Entry[]>(() => {
    const out: Entry[] = [];
    const seen = new Set<string>();
    for (const group of groups) {
      if (!group.sectionId) {
        out.push({ kind: 'group', group });
      } else if (!seen.has(group.sectionId)) {
        seen.add(group.sectionId);
        const section = POLICY_SECTIONS.find((s) => s.id === group.sectionId);
        out.push({
          kind: 'section',
          id: group.sectionId,
          name: section?.name ?? group.sectionId,
          children: groups.filter((g) => g.sectionId === group.sectionId),
        });
      }
    }
    return out;
  }, [groups]);

  function toggleSection(id: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderGroup(group: PolicyGroup, nested = false) {
    const selected = selectedId === group.id;
    return (
      <button
        type="button"
        aria-current={selected}
        onClick={() => onSelect(group.id)}
        title={`${group.index}. ${group.name}`}
        className={[
          rowBase,
          nested ? 'pl-9 pr-3' : 'px-3',
          selected ? 'bg-action-bg-weak text-action-text' : 'hover:bg-neutral-bg-base-hover',
        ].join(' ')}
      >
        <span className="truncate">
          {group.index}. {group.name}
        </span>
      </button>
    );
  }

  return (
    <aside
      id="policy-groups-panel"
      aria-label="Policy Group"
      className="relative z-10 flex w-[250px] shrink-0 flex-col border-r border-neutral-border-weak bg-neutral-bg-base"
    >
      {/* Collapse control straddles the panel's right edge. */}
      <ButtonV2
        aria-label="Collapse policy groups"
        aria-controls="policy-groups-panel"
        aria-expanded
        className="absolute -right-4 top-4 z-10 !rounded-full bg-neutral-bg-base"
        EndIcon={AngleLeftIcon}
        sentiment="NEUTRAL"
        styleType="REGULAR"
        onClick={onClose}
      />

      <div className="flex shrink-0 items-center justify-between py-4 pl-4 pr-6">
        <span className="text-sm font-bold text-neutral-text">Policy Group</span>
        <ButtonV2
          label="New"
          StartIcon={PlusIcon}
          sentiment="ACTION"
          styleType="NO_BORDER"
          size="SMALL"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        <ul className="flex flex-col gap-0.5">
          <li>
            <button
              type="button"
              aria-current={selectedId === null}
              onClick={() => onSelect(null)}
              className={[
                'flex h-9 w-full items-center rounded-full px-3 text-left text-sm text-neutral-text',
                selectedId === null ? 'bg-neutral-bg-base-active' : 'hover:bg-neutral-bg-base-hover',
              ].join(' ')}
            >
              All Groups ({groups.length})
            </button>
          </li>
          <li aria-hidden className="h-3" />
          {entries.map((entry) => {
            if (entry.kind === 'group') {
              return (
                <li key={entry.group.id}>
                  {renderGroup(entry.group)}
                </li>
              );
            }
            const collapsed = collapsedSections.has(entry.id);
            const Chevron = collapsed ? AngleRightIcon : AngleDownIcon;
            const selected = selectedId === entry.id;
            return (
              <li key={entry.id}>
                <div
                  className={[
                    'flex h-8 items-center rounded-md',
                    selected ? 'bg-action-bg-weak text-action-text' : 'hover:bg-neutral-bg-base-hover',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    aria-expanded={!collapsed}
                    aria-label={`${collapsed ? 'Expand' : 'Collapse'} section ${entry.name}`}
                    onClick={() => toggleSection(entry.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center"
                  >
                    <Chevron aria-hidden className="h-3 w-3 fill-neutral-icon" />
                  </button>
                  <button
                    type="button"
                    aria-current={selected}
                    onClick={() => onSelect(entry.id)}
                    className="h-8 min-w-0 flex-1 truncate pr-3 text-left text-sm font-bold"
                  >
                    {entry.name}
                  </button>
                </div>
                {!collapsed && (
                  <ul className="flex flex-col gap-0.5">
                    {entry.children.map((group) => (
                      <li key={group.id}>
                        {renderGroup(group, true)}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
