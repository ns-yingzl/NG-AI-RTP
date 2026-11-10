/**
 * Prototype-only: the ways we could highlight the new AI capabilities on the
 * New Policy goal tiles. Switched with the floating bar at the bottom of the page.
 *
 * Model (FigJam "RTP Framework for AI Policies", Direction 3):
 *  - Agentic Access is blended into Access, DLP and Threat Protection (it is the new
 *    capability to call out on those tiles).
 *  - One extra AI tile covers what cannot live in the other tiles (AI visibility,
 *    AI Guardrails, Agent Action Control) and repeats Agentic Access.
 */
export type HighlightProposal = 'baseline' | 'accent' | 'accentWide' | 'tour' | 'whatsnew';

export const PROPOSALS: { value: HighlightProposal; label: string; hint: string }[] = [
  {
    value: 'baseline',
    label: 'Baseline',
    hint: 'No single AI tile: AI Guardrails, Agent Action Control and Agentic Access are separate tiles, no highlighting',
  },
  {
    value: 'accent',
    label: 'A · Accent + chip',
    hint: 'AI glow and "New" badge; Access, DLP and Threat Protection get an "Agentic Access" chip with its description in a footer zone; AI tile widens to hold its 3 options',
  },
  {
    value: 'accentWide',
    label: 'B · Accent + chip, wide',
    hint: 'Same as A, but the chip and description sit to the right of the selected tile (it widens like the AI tile), so the row stays short',
  },
  {
    value: 'tour',
    label: 'C · Guided tour',
    hint: '"Show me" tour pulses each tile, then the ribbon collapses; click it to widen the tile and read the detail',
  },
  {
    value: 'whatsnew',
    label: 'D · What’s-new detail',
    hint: 'NEW badge and shimmer border on tiles; hover or focus for a flyout; AI options as one slim line',
  },
];

export type NewCapability = {
  /** Short name of the capability, shown as a chip (A, B) or on the footer ribbon (C). */
  chip: string;
  /** One-line summary shown on the tile. */
  line: string;
  /** Longer list for the detail view. */
  items: string[];
};

/** New AI capabilities, keyed by goal value. Goals not listed here have nothing new. */
export const NEW_CAPABILITIES: Record<string, NewCapability> = {
  access: {
    chip: 'Agentic Access',
    line: 'Control access to AI agents and MCP servers',
    items: [
      'Control access to AI agents and MCP servers',
      'Allow or block GenAI apps by risk rating',
      'No profile needed, same as Access today',
    ],
  },
  dlp: {
    chip: 'Agentic Access',
    line: 'Control AI agent and MCP access with your DLP profile',
    items: [
      'Control access to AI agents and MCP servers',
      'Inspect that traffic for sensitive data with a DLP profile',
      'Reuse your existing DLP profiles',
    ],
  },
  threat: {
    chip: 'Agentic Access',
    line: 'Control AI agent and MCP access with your Threat profile',
    items: [
      'Control access to AI agents and MCP servers',
      'Scan that traffic for threats with a Threat Protection profile',
      'Reuse your existing Threat Protection profiles',
    ],
  },
  ai: {
    chip: 'AI',
    line: 'AI visibility, guardrails, agent action control and agentic access',
    items: [
      'AI visibility: see which AI apps, agents and MCP servers are in use',
      'AI Guardrails for prompts and responses',
      'Agent Action Control for what agents are allowed to do',
      'Agentic Access, also available in Access, DLP and Threat Protection',
    ],
  },
};

/** Order the guided tour walks through. */
export const TOUR_ORDER = ['access', 'dlp', 'threat', 'ai'] as const;

/**
 * Wording of the tile-level badge on Access, DLP and Threat Protection (proposal A).
 * The AI tile keeps "New" because the whole tile is new; these tiles are existing ones that gained something.
 */
export const TILE_BADGE_LABEL = 'Boosted';
