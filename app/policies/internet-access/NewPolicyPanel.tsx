'use client';

import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  ButtonV2,
  InputV2,
  MessageBlock,
  MessageBlockContent,
  Radio,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  Toggle,
} from '@netskope-ui/core';
import { Dropdown } from '@netskope-ui/dropdown';
import {
  AngleDownIcon,
  CheckmarkCircleIcon,
  ClockIcon,
  CloseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@netskope-ui/icons';
import * as Select from '@netskope-ui/select';
import { SidePanelV2 } from '@netskope-ui/side-panel-v2';
import { TopBar } from '@netskope-ui/top-bar';
import type { PolicyDraft } from './data';
import { AI_MODES, GOALS, GoalTiles, type AiMode, type Goal } from './GoalTiles';
import type { HighlightProposal } from './highlight';

type Props = {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  groupNames: string[];
  onSave: (draft: PolicyDraft) => void;
  /** Prototype switch: how the new AI capabilities are highlighted on the goal tiles. */
  highlight: HighlightProposal;
};



const DESTINATION_MODES = [
  { value: 'application', label: 'Application', sample: 'Box' },
  { value: 'category', label: 'Category', sample: 'Cloud Storage' },
  { value: 'instance', label: 'App Instance', sample: 'Box Instance 1' },
  { value: 'any', label: 'Any Web Traffic', sample: '' },
] as const;
type DestinationMode = (typeof DESTINATION_MODES)[number]['value'];

const SOURCE_CRITERIA: Record<string, string> = {
  User: 'jiaqi@netskope.com',
  'User Group': 'Engineering',
  'Organizational Unit': 'Netskope/Product',
  'Access Method': 'Client',
};

const ACTIONS = ['Allow', 'Block', 'User Alert', 'Alert'];

/** One policy, one goal, one type of profile: the goal fixes which profile type applies. */
const PROFILES = {
  dlp: { label: 'DLP Profile', options: ['PCI-DSS', 'PII', 'Source Code'] },
  threat: { label: 'Threat Protection Profile', options: ['Default Threat Profile', 'Strict Threat Profile'] },
  dns: { label: 'DNS Profile', options: ['Default DNS Profile', 'Security DNS Profile'] },
  guardrails: { label: 'AI Guardrail Profile', options: ['Default AI Guardrails', 'Strict AI Guardrails'] },
  action: { label: 'Agent Action Control Profile', options: ['Read-only Agents', 'Approved Actions Only'] },
} as const;
type ProfileKind = keyof typeof PROFILES;

/** Agentic Access under the AI tile can use a DLP, Threat or AI Guardrail profile. */
const AGENTIC_PROFILE_TYPES: { value: ProfileKind; label: string }[] = [
  { value: 'dlp', label: 'DLP' },
  { value: 'threat', label: 'Threat Protection' },
  { value: 'guardrails', label: 'AI Guardrails' },
];

function profileKindFor(goal: Goal, aiMode: AiMode, agenticType: ProfileKind): ProfileKind | null {
  if (goal === 'access') return null;
  if (goal === 'ai') return aiMode === 'agentic' ? agenticType : aiMode;
  return goal;
}

/** Hosts for a goal: which enforcement points would evaluate the policy. */
function evaluatedBy(goal: Goal): { label: string; on: boolean }[] {
  if (goal === 'dns') {
    return [
      { label: 'DNS', on: true },
      { label: 'SWG', on: false },
      { label: 'Firewall', on: false },
    ];
  }
  return [
    { label: 'SWG', on: true },
    { label: 'Firewall', on: false },
  ];
}

type Criterion = { id: string; label: string; value: string };

/** Select's onChange hands back the selected values array (typed as a union with the DOM event). */
function firstValue(selected: unknown, fallback: string): string {
  return Array.isArray(selected) ? String(selected[0] ?? fallback) : fallback;
}

function SectionRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded bg-neutral-bg-base @2xl:flex-row @2xl:items-start">
      <div className="flex min-h-[28px] items-center text-lg text-neutral-text @2xl:w-[240px] @2xl:min-w-[160px] @2xl:max-w-[240px] @2xl:shrink-0">
        {label}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

function CriteriaBox({
  label,
  value,
  onRemove,
  children,
}: {
  label: string;
  value?: string;
  onRemove: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-2 rounded border border-neutral-border-weak bg-neutral-bg-base px-3 py-2 text-sm text-neutral-text">
        {children}
        <div className="flex flex-wrap items-center gap-1.5">
          <span>{label} =</span>
          {value && (
            <Tag sentiment="action">
              <TagLabel>{value}</TagLabel>
              <TagCloseButton onRemove={onRemove} />
            </Tag>
          )}
        </div>
      </div>
      <ButtonV2
        aria-label={`Remove ${label}`}
        EndIcon={CloseIcon}
        sentiment="NEUTRAL"
        styleType="NO_BORDER"
        onClick={onRemove}
      />
    </div>
  );
}

function AddMenu({
  label,
  sentiment = 'ACTION',
  items,
  onPick,
}: {
  label: string;
  sentiment?: 'ACTION' | 'WARNING';
  items: string[];
  onPick: (item: string) => void;
}) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <ButtonV2 label={label} EndIcon={AngleDownIcon} sentiment={sentiment} styleType="NO_BORDER" />
      </Dropdown.Trigger>
      {items.map((item) => (
        <Dropdown.Item key={item} value={item} onClick={() => onPick(item)}>
          <Text>{item}</Text>
        </Dropdown.Item>
      ))}
    </Dropdown.Root>
  );
}

export function NewPolicyPanel({ show, setShow, groupNames, onSave, highlight }: Props) {
  const [openCount, setOpenCount] = useState(0);
  const [goal, setGoal] = useState<Goal>('access');
  const [aiMode, setAiMode] = useState<AiMode>('guardrails');
  const [agenticType, setAgenticType] = useState<ProfileKind>('dlp');
  const [profile, setProfile] = useState('');
  const [source, setSource] = useState<Criterion[]>([
    { id: 'src-0', label: 'User', value: SOURCE_CRITERIA.User },
  ]);
  const [destMode, setDestMode] = useState<DestinationMode>('application');
  const [destValue, setDestValue] = useState('Box');
  const [activity, setActivity] = useState<string | null>('Create');
  const [action, setAction] = useState('User Alert');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [group, setGroup] = useState<string>('');
  const [enabled, setEnabled] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [validated, setValidated] = useState(false);

  // Start every creation flow from a clean form.
  useEffect(() => {
    if (!show) return;
    setOpenCount((n) => n + 1);
    setGoal('access');
    setAiMode('guardrails');
    setAgenticType('dlp');
    setProfile('');
    setSource([{ id: 'src-0', label: 'User', value: SOURCE_CRITERIA.User }]);
    setDestMode('application');
    setDestValue('Box');
    setActivity('Create');
    setAction('User Alert');
    setName('');
    setDescription('');
    setGroup('');
    setEnabled(true);
    setShowErrors(false);
    setValidated(false);
  }, [show]);

  // Prototype: switching proposals (Baseline, A-D) always lands on the first tile, Access.
  useEffect(() => {
    setGoal('access');
    setAiMode('guardrails');
    setAgenticType('dlp');
    setProfile('');
  }, [highlight]);

  const nameError = showErrors && !name.trim() ? 'Policy name is required' : undefined;
  const groupError = showErrors && !group ? 'Select a group for this policy' : undefined;
  const profileKind = profileKindFor(goal, aiMode, agenticType);
  const profileError = showErrors && profileKind && !profile ? 'Select a profile for this policy' : undefined;
  const goalTitle =
    goal === 'ai'
      ? (AI_MODES.find((m) => m.value === aiMode)?.title ?? 'AI')
      : (GOALS.find((g) => g.value === goal)?.title ?? '');

  // A profile belongs to one profile type; changing the goal or type clears the choice.
  useEffect(() => {
    setProfile('');
  }, [goal, aiMode, agenticType]);

  function addSource(label: string) {
    setSource((prev) => [
      ...prev,
      { id: `src-${Date.now()}`, label, value: SOURCE_CRITERIA[label] ?? '' },
    ]);
  }

  function changeDestMode(mode: DestinationMode) {
    setDestMode(mode);
    setDestValue(DESTINATION_MODES.find((m) => m.value === mode)?.sample ?? '');
  }

  function validate(): boolean {
    setShowErrors(true);
    const ok = name.trim().length > 0 && group.length > 0 && (!profileKind || profile.length > 0);
    setValidated(ok);
    return ok;
  }

  function save() {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      groupName: group,
      goal: goalTitle,
      enabled,
      users: source.filter((s) => s.value).map((s) => s.value).join(', ') || 'Any',
      destination: destMode === 'any' ? 'Any Web Traffic' : destValue || 'Any',
      action: action === 'Block' ? 'Block' : action === 'Allow' ? 'Allow' : 'Alert',
    });
    setShow(false);
  }

  return (
    <SidePanelV2 id="new-policy-panel" show={show} setShow={setShow} width="5xl" overlay outsideClick>
      <TopBar sidePanel showClose onClose={() => setShow(false)}>
        <TopBar.Title>
          <span>New Cloud, Web, Firewall &amp; DNS Policy</span>
        </TopBar.Title>
        <TopBar.Actions>
          <ButtonV2 label="Validate" sentiment="NEUTRAL" styleType="REGULAR" onClick={validate} />
          <ButtonV2 label="Save" sentiment="ACTION" styleType="PRIMARY" onClick={save} />
        </TopBar.Actions>
      </TopBar>

      <div className="@container h-[calc(100vh-70px)] overflow-y-auto bg-neutral-bg-base">
        {/* Policy goal */}
        <div className="flex flex-col gap-4 bg-action-bg-base-hover p-8">
          <GoalTiles
            heading="What kind of policy you are trying to create?"
            goal={goal}
            onSelect={setGoal}
            aiMode={aiMode}
            onAiMode={setAiMode}
            highlight={highlight}
            resetKey={openCount}
          />
        </div>

        <div className="px-8 pt-8">
          <MessageBlock className="!rounded-full">
            <MessageBlockContent>
              <span className="flex flex-wrap items-center gap-4">
                <span>This policy would be evaluated by:</span>
                {evaluatedBy(goal).map(({ label, on }) => (
                  <span key={label} className="inline-flex items-center gap-1">
                    {on ? (
                      <CheckmarkCircleIcon aria-hidden className="h-4 w-4 fill-success-icon" />
                    ) : (
                      <CloseIcon aria-hidden className="h-4 w-4 fill-danger-icon" />
                    )}
                    {label}
                  </span>
                ))}
              </span>
            </MessageBlockContent>
          </MessageBlock>
        </div>

        <div className="flex flex-col gap-8 p-8">
          {/* Criteria */}
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl text-neutral-text">Criteria</h2>
            <p className="text-sm text-neutral-text">All criteria sections below are AND’ed together.</p>

            <SectionRow label="Source">
              <p className="flex items-center gap-1 text-sm text-neutral-text-subtle">
                Match <span className="rounded bg-success-bg-weak px-1 text-neutral-text-weak">ALL</span> of
                the following selections
              </p>
              {source.map((c) => (
                <CriteriaBox
                  key={c.id}
                  label={c.label}
                  value={c.value}
                  onRemove={() => setSource((prev) => prev.filter((s) => s.id !== c.id))}
                />
              ))}
              <div>
                <AddMenu
                  label="Add Criteria"
                  items={Object.keys(SOURCE_CRITERIA)}
                  onPick={addSource}
                />
              </div>
            </SectionRow>

            <SectionRow label="Destination">
              <p className="flex items-center gap-1 text-sm text-neutral-text-subtle">
                Match <span className="rounded bg-success-bg-weak px-1 text-neutral-text-weak">ALL</span> of
                the following selections, except that activity constraints are matched when applicable
              </p>
              <div className="flex items-start gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-2 rounded border border-neutral-border-weak bg-neutral-bg-base px-3 py-3">
                  <div role="radiogroup" aria-label="Destination type" className="flex flex-wrap gap-6 text-sm">
                    {DESTINATION_MODES.map((m) => (
                      <label key={m.value} className="flex cursor-pointer items-center gap-1.5 text-neutral-text">
                        <Radio
                          name="destination-mode"
                          value={m.value}
                          checked={destMode === m.value}
                          onChange={() => changeDestMode(m.value)}
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                  {destMode === 'any' ? (
                    <p className="text-sm text-neutral-text-subtle">
                      Any traffic: add criteria to specify your selection.
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5 rounded border border-neutral-border-weak px-3 py-1.5 text-sm text-neutral-text">
                      <span>
                        {DESTINATION_MODES.find((m) => m.value === destMode)?.label} =
                      </span>
                      {destValue && (
                        <Tag sentiment="action">
                          <TagLabel>{destValue}</TagLabel>
                          <TagCloseButton onRemove={() => setDestValue('')} />
                        </Tag>
                      )}
                    </div>
                  )}
                </div>
                <ButtonV2
                  aria-label="Remove destination"
                  EndIcon={CloseIcon}
                  sentiment="NEUTRAL"
                  styleType="NO_BORDER"
                  onClick={() => changeDestMode('any')}
                />
              </div>
              {activity && (
                <CriteriaBox label="Activities" value={activity} onRemove={() => setActivity(null)} />
              )}
              <div>
                <AddMenu
                  label="Add Criteria & Constraints"
                  items={['Activities', 'Constraints']}
                  onPick={(item) => item === 'Activities' && setActivity(activity ?? 'Create')}
                />
              </div>
            </SectionRow>

            <SectionRow label="Exclusions">
              <div>
                <AddMenu
                  label="Add Exclusion"
                  sentiment="WARNING"
                  items={['User', 'User Group', 'Application']}
                  onPick={() => undefined}
                />
              </div>
            </SectionRow>
          </section>

          {/* Action */}
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl text-neutral-text">Action</h2>
            {profileKind && (
              <SectionRow label="Profile">
                {goal === 'ai' && aiMode === 'agentic' && (
                  <div role="radiogroup" aria-label="Profile type" className="flex flex-wrap gap-6 text-sm">
                    {AGENTIC_PROFILE_TYPES.map((t) => (
                      <label key={t.value} className="flex cursor-pointer items-center gap-1.5 text-neutral-text">
                        <Radio
                          name="agentic-profile-type"
                          value={t.value}
                          checked={agenticType === t.value}
                          onChange={() => setAgenticType(t.value)}
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                )}
                <div>
                  <Select.Root
                    key={profileKind}
                    label={PROFILES[profileKind].label}
                    placeholder="Select"
                    width="320px"
                    values={profile ? [profile] : []}
                    error={profileError}
                    onChange={(v) => setProfile(firstValue(v, ''))}
                  >
                    {PROFILES[profileKind].options.map((o) => (
                      <Select.Item key={o} value={o}>
                        <Text>{o}</Text>
                      </Select.Item>
                    ))}
                  </Select.Root>
                </div>
                <p className="text-xs text-neutral-text-subtle">
                  The profile type is set by the goal you picked and can’t be switched inside this policy.
                </p>
              </SectionRow>
            )}
            <SectionRow label="Action">
              <div className="flex items-start gap-2">
                <Select.Root
                  label="Action"
                  width="220px"
                  values={[action]}
                  onChange={(v) => setAction(firstValue(v, action))}
                >
                  {ACTIONS.map((a) => (
                    <Select.Item key={a} value={a}>
                      <Text>{a}</Text>
                    </Select.Item>
                  ))}
                </Select.Root>
                {action === 'User Alert' && (
                  <>
                    <Select.Root label="User Alert Template" placeholder="Select" width="280px">
                      <Select.Item value="default">
                        <Text>Default Template</Text>
                      </Select.Item>
                      <Select.Item value="custom">
                        <Text>Custom Template</Text>
                      </Select.Item>
                    </Select.Root>
                    <ButtonV2
                      aria-label="Preview template"
                      EndIcon={MagnifyingGlassIcon}
                      sentiment="NEUTRAL"
                      styleType="REGULAR"
                    />
                  </>
                )}
              </div>
              <div>
                <ButtonV2 label="Email Notification" StartIcon={PlusIcon} sentiment="ACTION" styleType="NO_BORDER" />
              </div>
            </SectionRow>
          </section>

          {/* General */}
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl text-neutral-text">General</h2>
            <SectionRow label="Name and Position">
              <div className="flex max-w-[784px] flex-col gap-2">
                <InputV2
                  name="policy-name"
                  placeholder="Policy Name"
                  size="DEFAULT"
                  value={name}
                  error={!!nameError}
                  errorMessage={nameError}
                  onChange={(e) => {
                    setName(e.target.value);
                    setValidated(false);
                  }}
                />
                <InputV2
                  name="policy-description"
                  placeholder="Policy Description (optional)"
                  size="DEFAULT"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div>
                  <Select.Root
                    label="Group"
                    placeholder="Select"
                    width="260px"
                    values={group ? [group] : []}
                    error={groupError}
                    withSearch
                    onChange={(v) => setGroup(firstValue(v, ''))}
                  >
                    {groupNames.map((g) => (
                      <Select.Item key={g} value={g}>
                        <Text>{g}</Text>
                      </Select.Item>
                    ))}
                  </Select.Root>
                </div>
              </div>
            </SectionRow>

            <SectionRow label="Status">
              <div className="flex items-center gap-2 text-sm text-neutral-text">
                <Toggle size="regular" on={enabled} onChange={setEnabled} />
                {enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div>
                <ButtonV2 label="Add Schedule" StartIcon={ClockIcon} sentiment="ACTION" styleType="NO_BORDER" />
              </div>
            </SectionRow>

            {validated && (
              <p role="status" className="flex items-center gap-1 text-sm text-success-text">
                <CheckmarkCircleIcon aria-hidden className="h-4 w-4 fill-success-icon" />
                No errors found. This policy is ready to save.
              </p>
            )}
          </section>
        </div>
      </div>
    </SidePanelV2>
  );
}
