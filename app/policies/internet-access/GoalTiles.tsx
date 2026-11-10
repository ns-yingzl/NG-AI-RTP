'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ButtonV2,
  Checkbox,
  Chip,
  MessageBlock,
  MessageBlockContent,
  Radio,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@netskope-ui/core';
import { AngleLeftIcon, AngleRightIcon, InfoIcon } from '@netskope-ui/icons';
import { ALSO_IN_AI, ALSO_IN_AI_SHORT, NEW_CAPABILITIES, TILE_BADGE_LABEL, TOUR_ORDER, type HighlightProposal } from './highlight';

/**
 * Top row of the New Policy editor (FigJam "RTP Framework for AI Policies", Direction 3):
 * Access, DLP, Threat Protection, one AI tile, DNS. AI Guardrails now lives under the AI tile.
 */
export const GOALS = [
  { value: 'access', title: 'Access', description: 'Pure access control, no content inspection' },
  { value: 'dlp', title: 'DLP', description: 'Scan for sensitive data like DLP-PCI, etc.' },
  { value: 'threat', title: 'Threat Protection', description: 'Scan for Malicious content in files' },
  {
    value: 'ai',
    title: 'AI',
    description: 'Guardrails and controls for AI apps and agents',
  },
  { value: 'dns', title: 'DNS', description: 'Scan risky destinations in DNS traffic' },
] as const;
export type Goal = (typeof GOALS)[number]['value'];

/**
 * The "additional layer" under the AI tile. Each mode works with its own profile type (picked later in
 * the Action section), and that type cannot be switched (one policy, one goal, one type of profile).
 * The descriptions here say what the mode does, in terms users know, not which profile it uses.
 */
export const AI_MODES = [
  {
    value: 'guardrails',
    title: 'AI Guardrails',
    short: 'AI Guardrails',
    description: 'Scan AI prompts and responses for unsafe content.',
  },
  {
    value: 'action',
    title: 'Agent Action Control',
    short: 'Agent Action Control',
    description: 'Allow or block what AI agents can do.',
  },
  {
    value: 'agentic',
    title: 'Agentic Access',
    short: 'Agentic Access',
    description: 'Control access to AI agents and MCP servers.',
  },
] as const;
export type AiMode = (typeof AI_MODES)[number]['value'];

/** One tile in the row. Only the baseline's split AI tiles carry an `aiMode`. */
type Tile = { id: string; value: Goal; title: string; description: string; aiMode?: AiMode };

type Props = {
  goal: Goal;
  onSelect: (goal: Goal) => void;
  aiMode: AiMode;
  onAiMode: (mode: AiMode) => void;
  highlight: HighlightProposal;
  /** Bumped whenever the panel opens, to reset tour / dismissed state. */
  resetKey: number;
  /** The question above the tiles. Rendered here so proposal A can put its "Show what's new" checkbox on the same line. */
  heading: string;
};

const TOUR_STEP_MS = 1700;
/** The AI step shows three options and their descriptions, so it stays up a second longer. */
const TOUR_AI_EXTRA_MS = 1000;
const FLYOUT_WIDTH = 320;

export function GoalTiles({ goal, onSelect, aiMode, onAiMode, highlight, resetKey, heading }: Props) {
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [toured, setToured] = useState(false);
  /**
   * A and C: set when the user unchecks "Show what's new". A hides its badges and footer descriptions; C hides the
   * footer ribbons and their expand interaction.
   * The checkbox starts checked (this is false) every time the panel opens.
   */
  const [hideNew, setHideNew] = useState(false);
  /** B: which Access / DLP / Threat tile has its "what's new" detail open. */
  const [expandedCap, setExpandedCap] = useState<Goal | null>(null);
  /** C: flyout anchored under a tile. */
  const [flyout, setFlyout] = useState<{ goal: Goal; left: number } | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  // The AI tile's divider is one drawn line that bends toward the question, so it needs the question's
  // position (relative to the options group) and the group's height.
  const questionRef = useRef<HTMLSpanElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [divider, setDivider] = useState<{ y: number; h: number } | null>(null);

  // C shows the AI choice as a slim bar; A, B and the baseline widen the AI tile instead.
  const aiInline = highlight !== 'whatsnew';
  // The compact AI tile (smaller text, drawn divider, one description at a time) is part of proposal B only.
  // A, C, D and the baseline keep the earlier, roomier AI tile.
  const wide = highlight === 'accentWide';

  // Fresh state each time the panel opens or the proposal changes.
  useEffect(() => {
    setTourStep(null);
    setToured(false);
    setHideNew(false);
    setExpandedCap(null);
    setFlyout(null);
  }, [resetKey, highlight]);

  // Advance the guided tour and keep the active tile in view.
  useEffect(() => {
    if (tourStep === null) return;
    document
      .getElementById(`goal-tile-${TOUR_ORDER[tourStep]}`)
      ?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
    const stepMs = TOUR_ORDER[tourStep] === 'ai' ? TOUR_STEP_MS + TOUR_AI_EXTRA_MS : TOUR_STEP_MS;
    const timer = window.setTimeout(() => {
      if (tourStep + 1 < TOUR_ORDER.length) {
        setTourStep(tourStep + 1);
      } else {
        setTourStep(null);
        setToured(true);
      }
    }, stepMs);
    return () => window.clearTimeout(timer);
  }, [tourStep]);

  // When the selected tile widens (the AI tile, or any tile in the wide proposal), keep it in view.
  useEffect(() => {
    const previewingAi = tourStep !== null && TOUR_ORDER[tourStep] === 'ai' && aiInline;
    const widens =
      previewingAi ||
      (goal === 'ai' && aiInline) ||
      (highlight === 'accentWide' && !!NEW_CAPABILITIES[goal]);
    if (!widens) return;
    const target = previewingAi ? 'ai' : goal;
    const t = window.setTimeout(
      () =>
        document
          .getElementById(`goal-tile-${target}`)
          ?.scrollIntoView({ inline: 'start', block: 'nearest', behavior: 'smooth' }),
      220,
    );
    return () => window.clearTimeout(t);
  }, [goal, aiInline, highlight, tourStep]);

  useLayoutEffect(() => {
    const q = questionRef.current;
    const g = optionsRef.current;
    if (!wide || !q || !g) {
      setDivider(null);
      return;
    }
    const measure = () => {
      const gr = g.getBoundingClientRect();
      const qr = q.getBoundingClientRect();
      setDivider({ y: qr.top + qr.height / 2 - gr.top, h: gr.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(g);
    ro.observe(q);
    return () => ro.disconnect();
  }, [goal, aiInline, aiMode, highlight, wide]);

  function openFlyout(g: Goal) {
    if (highlight !== 'whatsnew' || !NEW_CAPABILITIES[g]) return;
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    const tile = document.getElementById(`goal-tile-${g}`);
    const wrap = wrapRef.current;
    if (!tile || !wrap) return;
    const t = tile.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const left = Math.max(0, Math.min(t.left - w.left, w.width - FLYOUT_WIDTH));
    setFlyout({ goal: g, left });
  }

  function closeFlyoutSoon() {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setFlyout(null), 160);
  }

  // The baseline has no single AI tile: AI Guardrails, Agent Action Control and Agentic Access are tiles of their
  // own, each selecting the AI goal with its mode. Every other proposal shows one AI tile.
  const tiles: Tile[] = GOALS.flatMap((g): Tile[] =>
    highlight === 'baseline' && g.value === 'ai'
      ? AI_MODES.map((m) => ({
          id: `ai-${m.value}`,
          value: 'ai' as Goal,
          title: m.title,
          description: m.description,
          aiMode: m.value,
        }))
      : [{ id: g.value, value: g.value, title: g.title, description: g.description }],
  );

  // Every proposal with a single AI tile (A, B, C, D) names it "AI & Agentic". The baseline has no single AI tile.
  const aiTitle = 'AI & Agentic';

  const tourGoal = tourStep === null ? null : TOUR_ORDER[tourStep];
  const flyoutCap = flyout ? NEW_CAPABILITIES[flyout.goal] : null;
  const flyoutTitle = flyout
    ? flyout.goal === 'ai'
      ? aiTitle
      : GOALS.find((g) => g.value === flyout.goal)?.title
    : '';

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-base font-bold text-neutral-text">{heading}</p>
        {/* A: opt-out for the "what's new" highlights (badges and the footer descriptions). On by default. */}
        {highlight === 'accent' && (
          <Checkbox checked={!hideNew} onChange={(e) => setHideNew(!e.target.checked)}>
            Show what’s new
          </Checkbox>
        )}
      </div>

      {/* C: "What's new" strip with a guided tour */}
      {highlight === 'tour' && (
        <MessageBlock sentiment="action" className="!rounded-2xl">
          <MessageBlockContent>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Chip sentiment="success" variant="filled">
                New
              </Chip>
              <span>
                {tourGoal && tourGoal !== 'ai'
                  ? NEW_CAPABILITIES[tourGoal].line
                  : 'Agentic Access added to Access, DLP and Threat Protection, plus a new AI tile.'}
              </span>
              {/* First time: "Show me" plays the tour. Once it has played there is no replay; the same slot
                  offers a "Show what's new" checkbox (on by default) that controls the what's-new ribbons. */}
              {!toured && (
                <ButtonV2
                  label={tourGoal ? 'Touring…' : 'Show me'}
                  sentiment="ACTION"
                  styleType="NO_BORDER"
                  size="SMALL"
                  disabled={tourGoal !== null}
                  onClick={() => {
                    setExpandedCap(null);
                    setTourStep(0);
                  }}
                />
              )}
              {toured && !tourGoal && (
                <Checkbox
                  checked={!hideNew}
                  onChange={(e) => {
                    // Checked (the default) shows the what's-new ribbons; unchecking hides them.
                    const hide = !e.target.checked;
                    setHideNew(hide);
                    if (hide) setExpandedCap(null);
                  }}
                >
                  Show what’s new
                </Checkbox>
              )}
            </span>
          </MessageBlockContent>
        </MessageBlock>
      )}

      <div ref={wrapRef} className="relative">
        <div
          role="radiogroup"
          aria-label="Policy goal"
          className="flex items-stretch gap-3 overflow-x-auto px-1 pb-3 pt-3"
          onScroll={() => setFlyout(null)}
        >
          {tiles.map((g) => {
            const selected = goal === g.value && (!g.aiMode || aiMode === g.aiMode);
            const isAi = g.value === 'ai' && !g.aiMode;
            const cap = NEW_CAPABILITIES[g.id];
            const touring = tourGoal === g.id;

            // --- treatments for this tile under the current proposal ---------------------
            // Agentic Access is the new capability blended into Access, DLP and Threat Protection.
            const aiGlow =
              isAi && (highlight === 'accent' || highlight === 'accentWide' || highlight === 'tour');
            // The AI tile is new (green "New"); Access, DLP and Threat Protection are boosted (blue).
            const aOptOut = highlight === 'accent' && hideNew;
            const newBadge = isAi && highlight !== 'baseline' && !aOptOut;
            const boostedBadge =
              !aOptOut &&
              !isAi &&
              !!cap &&
              (highlight === 'accent' ||
                highlight === 'accentWide' ||
                highlight === 'tour' ||
                highlight === 'whatsnew');
            const shimmer = !!cap && highlight === 'whatsnew';
            // Footer ribbon (A always; B during and after the tour).
            const ribbon =
              !!cap &&
              !isAi &&
              (highlight === 'accent' ||
                (highlight === 'tour' && (touring || (toured && !hideNew))));
            const ribbonShowsLine = highlight === 'accent' || touring;
            const ribbonOpenable = highlight === 'tour' && toured && !touring && !hideNew;
            const capOpen = ribbonOpenable && expandedCap === g.value;
            // C: on the tour's AI step the tile widens to preview its three options without being selected.
            // Opening up is self-explanatory, so that step adds no description of its own.
            const aiPreview = isAi && touring && aiInline;
            const aiOpen = isAi && aiInline && (selected || aiPreview);
            // B: the chip and description live to the right of the selected tile instead of in a footer,
            // so the tile widens (like the AI tile) and the row stays short.
            const capWide = highlight === 'accentWide' && !!cap && !isAi && selected;

            const width = aiOpen
              ? wide
                ? 'w-[620px]'
                : 'w-[580px]'
              : capWide
                ? 'w-[460px]'
                : capOpen
                  ? 'w-[440px]'
                  : 'w-[208px]';

            return (
              <div
                key={g.id}
                id={`goal-tile-${g.id}`}
                onMouseEnter={() => openFlyout(g.value)}
                onMouseLeave={closeFlyoutSoon}
                onFocus={() => openFlyout(g.value)}
                onBlur={closeFlyoutSoon}
                className={[
                  'relative isolate flex shrink-0 flex-col rounded bg-neutral-bg-base transition-[width] duration-200',
                  width,
                  aiGlow ? 'border-ai-gradient-shadow' : '',
                  shimmer ? 'border-ai tile-shimmer-intro' : '',
                  touring ? 'tile-ping' : '',
                  selected
                    ? 'border-2 border-action-border'
                    : 'border border-neutral-border-weak hover:border-action-border',
                ].join(' ')}
              >
                {newBadge && (
                  <Chip
                    sentiment="success"
                    variant="filled"
                    className="pointer-events-none absolute -top-2.5 right-3 z-10"
                  >
                    New
                  </Chip>
                )}
                {/* A and C: existing tiles that gained Agentic Access get a different word and tint than the new AI tile. */}
                {boostedBadge && (
                  <Chip
                    sentiment="action"
                    variant="filled"
                    className="pointer-events-none absolute -top-2.5 right-3 z-10"
                  >
                    {TILE_BADGE_LABEL}
                  </Chip>
                )}
                <div className="flex flex-1">
                  <label
                    // C: choosing any tile folds away a detail panel that belongs to another tile.
                    onClick={() => setExpandedCap((open) => (open === g.value ? open : null))}
                    className={[
                      'flex shrink-0 cursor-pointer items-stretch gap-2',
                      // B only: wider and a little tighter while the AI options are open, so the description and
                      // the question take fewer lines and the tile stays close to the height of its neighbours.
                      aiOpen && wide ? 'w-[260px] px-4 py-2.5' : 'w-[206px] p-4',
                    ].join(' ')}
                  >
                    <span className={['flex h-5 items-center self-start', aiOpen ? 'opacity-60' : ''].join(' ')}>
                      <Radio
                        name="policy-goal"
                        value={g.id}
                        checked={selected}
                        onChange={() => {
                          onSelect(g.value);
                          if (g.aiMode) onAiMode(g.aiMode);
                        }}
                      />
                    </span>
                    <span className={['flex min-w-0 flex-1 flex-col text-sm', aiOpen && wide ? 'gap-0' : 'gap-1'].join(' ')}>
                      {/* Once AI is open, the first layer steps back so the second layer takes the focus. */}
                      <span
                        className={[
                          'flex flex-wrap items-center gap-1.5',
                          aiOpen ? 'font-normal text-neutral-text-subtle' : 'font-bold text-neutral-text',
                        ].join(' ')}
                      >
                        {isAi ? aiTitle : g.title}
                      </span>
                      <span className={['text-neutral-text-subtle', aiOpen ? 'text-xs' : ''].join(' ')}>
                        {g.description}
                      </span>
                      {/* Sits left of the divider to save vertical space. The divider bends toward this question,
                          tying it to the options. */}
                      {aiOpen && (
                        <span className={['flex flex-1 items-center', wide ? '' : 'pt-2'].join(' ')}>
                        <span
                          ref={questionRef}
                          className={['relative text-neutral-text', wide ? 'text-xs' : 'text-sm'].join(' ')}
                        >
                          What do you want to do with AI?
                          {/* A, C, D, baseline: the divider bends toward the question with a patch over the straight
                              line and a small "<" in grey. (B draws one continuous line instead.) */}
                          {!wide && (
                            <>
                              <span
                                aria-hidden
                                className="absolute -right-[18px] top-1/2 z-10 h-[11px] w-1 -translate-y-1/2 bg-neutral-bg-base"
                              />
                              <span
                                aria-hidden
                                className="absolute -right-5 top-1/2 z-10 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-neutral-border-weak"
                              />
                            </>
                          )}
                        </span>
                        </span>
                      )}
                    </span>
                  </label>

                  {/* A / B / baseline: the AI tile widens to host its three options. */}
                  {aiOpen && (
                    // The wrapper gives the divider the same top and bottom inset as the tile content.
                    <div className={['flex min-w-0 flex-1 pr-4', wide ? 'py-2' : 'py-4'].join(' ')}>
                      <div
                        ref={optionsRef}
                        role="radiogroup"
                        aria-label="AI goal"
                        className={[
                          'flex min-w-0 flex-1 flex-col pl-4 text-sm',
                          wide
                            ? 'relative gap-1.5'
                            : 'gap-0.5 border-l border-neutral-border-weak',
                        ].join(' ')}
                      >
                        {/* B: one continuous line down the left of the options, out to a point at the question,
                            and on down again. */}
                        {wide && divider && (
                          <svg
                            aria-hidden
                            width={1}
                            height={divider.h}
                            fill="none"
                            className="pointer-events-none absolute left-0 top-0 overflow-visible"
                            style={{ stroke: 'var(--neutral-border-weak, #cccccc)' }}
                          >
                            <path
                              d={`M0.5 0 V${divider.y - 7} L-7.5 ${divider.y} L0.5 ${divider.y + 7} V${divider.h}`}
                              strokeWidth={1}
                              strokeLinejoin="miter"
                            />
                          </svg>
                        )}
                      {AI_MODES.map((m) => (
                        <label
                          key={m.value}
                          className={['flex cursor-pointer items-start gap-2', wide ? '' : 'py-1.5'].join(' ')}
                        >
                          <span className={['flex items-center', wide ? 'h-[18px]' : 'h-5'].join(' ')}>
                            <Radio
                              name="ai-mode"
                              value={m.value}
                              checked={aiMode === m.value}
                              onChange={() => onAiMode(m.value)}
                            />
                          </span>
                          <span className="flex min-w-0 flex-col">
                            {/* B: a touch smaller, and only the selected option explains itself, which keeps the
                                list short and uncrowded. Elsewhere: 14px titles with every description shown. */}
                            <span
                              className={[
                                'font-bold text-neutral-text',
                                wide ? 'text-[13px] leading-[18px]' : '',
                              ].join(' ')}
                            >
                              {m.title}
                            </span>
                            {(!wide || aiMode === m.value) && (
                              <span
                                className={[
                                  'text-neutral-text-weak',
                                  wide ? 'text-[11px] leading-[14px]' : 'text-xs',
                                ].join(' ')}
                              >
                                {m.description}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                      </div>
                    </div>
                  )}

                  {/* B: Agentic Access chip + description to the right of the selected tile. */}
                  {capWide && cap && (
                    <div className="flex min-w-0 flex-1 py-4 pr-4">
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 border-l border-neutral-border-weak pl-4 text-xs">
                        {/* The cross-reference sits on the chip's row (which has spare width) rather than in the
                            description, so DLP and Threat Protection don't wrap onto a third line and grow the tile. */}
                        <span className="flex items-center gap-2">
                          <Chip sentiment="action" variant="outlined">
                            {cap.chip}
                          </Chip>
                          <span className="whitespace-nowrap text-neutral-text-subtle">{ALSO_IN_AI_SHORT}</span>
                        </span>
                        <span className="text-neutral-text">{cap.line}</span>
                      </div>
                    </div>
                  )}

                  {/* C: after the tour, clicking the ribbon widens the tile to show the detail. */}
                  {capOpen && cap && (
                    <div className="flex min-w-0 flex-1 py-4 pr-4">
                      <div className="flex min-w-0 flex-1 flex-col gap-1 border-l border-neutral-border-weak pl-4 text-sm">
                        <p className="text-xs font-bold text-neutral-text">What’s new in {g.title}</p>
                        <ul className="list-disc space-y-0.5 pl-4 text-xs text-neutral-text">
                          {cap.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer ribbon: reads as a label on the tile, not as a button that adds things. */}
                {/* A: the chip and its description share a footer zone, aligned across tiles. */}
                {highlight === 'accent' && !hideNew && cap && !isAi && (
                  <div className="px-4 pb-3">
                    {/* The dashed line stops short of the tile border, keeping the same inset as the content. */}
                    <div className="flex flex-col gap-1.5 border-t border-dashed border-action-border pt-2.5 text-xs">
                      {/* The footer's height is shared by every tile in the row, so the "also available in AI & Agentic"
                          note lives in an info tooltip beside the chip instead of adding a line of text. */}
                      <span className="flex items-center gap-1.5">
                        <Chip sentiment="action" variant="outlined">
                          {cap.chip}
                        </Chip>
                        <Tooltip position="top">
                          <TooltipTrigger asChild>
                            <span
                              tabIndex={0}
                              role="img"
                              aria-label={ALSO_IN_AI}
                              className="inline-flex h-4 w-4 items-center justify-center rounded-full"
                            >
                              <InfoIcon aria-hidden className="h-4 w-4 fill-neutral-icon-weak" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{ALSO_IN_AI}</TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="text-neutral-text">{cap.line}</span>
                    </div>
                  </div>
                )}

                {/* C: footer ribbon that collapses after the tour and expands the tile on click. */}
                {highlight === 'tour' &&
                  ribbon &&
                  cap &&
                  (ribbonOpenable ? (
                    <button
                      type="button"
                      aria-expanded={capOpen}
                      aria-label={`${capOpen ? 'Hide' : 'Show'} what’s new in ${g.title}`}
                      onClick={() => setExpandedCap(capOpen ? null : g.value)}
                      className="flex w-full items-center gap-2 rounded-b-[3px] bg-action-bg-weak px-4 py-1.5 text-left text-xs text-action-text"
                    >
                      <span className="font-bold">{cap.chip}</span>
                      {capOpen ? (
                        <AngleLeftIcon aria-hidden className="ml-auto h-3 w-3 fill-action-icon" />
                      ) : (
                        <AngleRightIcon aria-hidden className="ml-auto h-3 w-3 fill-action-icon" />
                      )}
                    </button>
                  ) : (
                    <div className="flex w-full flex-col gap-0.5 rounded-b-[3px] bg-action-bg-weak px-4 py-1.5 text-xs text-action-text">
                      <span className="font-bold">{cap.chip}</span>
                      {ribbonShowsLine && <span>{cap.line}</span>}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>

        {/* C: flyout anchored under the hovered / focused tile, overlaying instead of pushing content. */}
        {flyout && flyoutCap && (
          <div
            role="region"
            aria-label={`What’s new in ${flyoutTitle}`}
            style={{ left: flyout.left, width: FLYOUT_WIDTH }}
            onMouseEnter={() => hideTimer.current && window.clearTimeout(hideTimer.current)}
            onMouseLeave={closeFlyoutSoon}
            className="absolute top-full z-20 -mt-1 rounded border border-neutral-border-weak bg-neutral-bg-base p-3 text-sm shadow-lg"
          >
            <p className="mb-1 text-xs font-bold text-neutral-text">What’s new in {flyoutTitle}</p>
            <ul className="list-disc space-y-0.5 pl-4 text-xs text-neutral-text">
              {/* D: Access, DLP and Threat Protection show their first two points only; the AI tile keeps all of
                  its points. (Proposal C's expanded detail still lists everything.) */}
              {(flyout?.goal === 'ai' ? flyoutCap.items : flyoutCap.items.slice(0, 2)).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* D: the AI choice as one slim line instead of a second block. */}
      {goal === 'ai' && !aiInline && (
        <div
          role="radiogroup"
          aria-label="Your AI Policy Goal"
          className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded bg-neutral-bg-base px-3 py-2 text-sm"
        >
          <span className="text-xs font-bold text-neutral-text">Your AI Policy Goal:</span>
          {/* The options are grouped so that, when the row is too narrow, they wrap together under the label
              and keep their order: AI Guardrails, Agent Action Control, Agentic Access. */}
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {AI_MODES.map((m) => (
              <label key={m.value} className="flex cursor-pointer items-center gap-1.5 text-neutral-text">
                <Radio
                  name="ai-mode"
                  value={m.value}
                  checked={aiMode === m.value}
                  onChange={() => onAiMode(m.value)}
                />
                {m.short}
              </label>
            ))}
          </span>
          <span className="basis-full text-xs text-neutral-text-subtle">
            {AI_MODES.find((m) => m.value === aiMode)?.description}
          </span>
        </div>
      )}
    </div>
  );
}
