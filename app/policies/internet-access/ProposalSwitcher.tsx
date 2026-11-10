'use client';

import { ButtonV2 } from '@netskope-ui/core';
import { PROPOSALS, type HighlightProposal } from './highlight';

type Props = {
  value: HighlightProposal;
  onChange: (value: HighlightProposal) => void;
};

/**
 * Prototype-only floating bar for flipping between highlight proposals while the
 * New Policy panel is open. Sits above the side panel and its overlay.
 */
export function ProposalSwitcher({ value, onChange }: Props) {
  const active = PROPOSALS.find((p) => p.value === value);
  return (
    <div
      role="toolbar"
      aria-label="Highlight proposals (prototype)"
      style={{ zIndex: 10000 }}
      className="fixed bottom-6 left-1/2 flex max-w-[calc(100vw-32px)] -translate-x-1/2 flex-col items-center gap-2 rounded-2xl border border-neutral-border-weak bg-neutral-bg-base px-3 py-2 shadow-lg"
    >
      <p className="text-center text-xs text-neutral-text-subtle">
        <span className="font-bold text-neutral-text">Proposal: </span>
        {active?.hint}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 [&_button]:whitespace-nowrap">
        {PROPOSALS.map((p) => (
          <ButtonV2
            key={p.value}
            label={p.label}
            size="SMALL"
            sentiment={value === p.value ? 'ACTION' : 'NEUTRAL'}
            styleType={value === p.value ? 'PRIMARY' : 'REGULAR'}
            aria-pressed={value === p.value}
            onClick={() => onChange(p.value)}
          />
        ))}
      </div>
    </div>
  );
}
