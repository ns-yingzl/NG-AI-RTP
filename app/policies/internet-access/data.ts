/**
 * Mock data for the Internet Access policies page.
 * Group names mirror the Figma mockup (NG – RTP Policy Framework, "Page Content" 3842:102090);
 * policy counts are adjusted so the totals match the "123 Policies | 45 Groups" stat.
 */

export type Policy = {
  id: string;
  /** Display number within the group, e.g. "1.1". */
  number: string;
  name: string;
  type: string;
  enabled: boolean;
  alertCount: number;
  users: string;
  destination: string;
  action: 'Block' | 'Allow' | 'Alert';
  template: string;
};

/** What the New Policy side panel hands back on Save. */
export type PolicyDraft = {
  name: string;
  description: string;
  groupName: string;
  /** Policy goal title, e.g. "Access", "DLP". */
  goal: string;
  enabled: boolean;
  users: string;
  destination: string;
  action: 'Block' | 'Allow' | 'Alert';
};

export type PolicySection = { id: string; name: string };

export type PolicyGroup = {
  id: string;
  index: number;
  name: string;
  /** Sections only exist in the Policy Group panel; the policy list shows groups. */
  sectionId?: string;
  /** Label colors rendered by GlobalLabels. */
  labels: string[];
  policies: Policy[];
};

const GROUP_NAMES = [
  'Global 1',
  'Global 2',
  'Global 3',
  'Global 4',
  'Global 5',
  'Group 6',
  'Argentina - DLP',
  'Argentina - SWG - Proveedores',
  'Argentina - SWG - users',
  'Argentina - SWG - servers',
  'Argentina - SWG - apps',
  'Brazil - CISO',
  'Brazil - Corporitivo - DLP',
  'Brazil - Sucursales - DLP',
  'Brazil - Negocio - DLP',
  'Brazil - SWG - users',
  'Brazil - SWG - GESNET',
  'BraSIL - SWG - apps',
  'Spain - DLP',
  'Spain - SWG - users',
  'Spain - SWG - servers',
  'Spain - SWG - apps',
  'Italy - DLP',
  'Italy - SWG - users',
  'Italy - SWG - servers',
  'Italy - SWG - apps',
  'France - DLP',
  'France - SWG - users',
  'France - SWG - servers',
  'France - SWG - apps',
  'Belgium - DLP',
  'Belgium - SWG - users',
  'Belgium - SWG - servers',
  'Belgium - SWG - apps',
  'Germany - DLP',
  'Germany - SWG - users',
  'Germany - SWG - servers',
  'Germany - SWG - apps',
  'Poland - DLP',
  'Poland - SWG - users',
  'Poland - SWG - servers',
  'Poland - SWG - apps',
  'Custom Group',
  'Contractors',
  'Executives',
];

const TOTAL_POLICIES = 123;

export const POLICY_SECTIONS: PolicySection[] = [
  { id: 'section-latam', name: 'Latin America' },
  { id: 'section-europe', name: 'Europe' },
];

function sectionFor(name: string): string | undefined {
  if (/^(Argentina|Brazil|BraSIL)/.test(name)) return 'section-latam';
  if (/^(Spain|Italy|France|Belgium|Germany|Poland)/.test(name)) return 'section-europe';
  return undefined;
}

const POLICY_TYPES = ['Cloud App Access', 'Cloud App Access', 'Web Access', 'Firewall', 'DNS'];
const DESTINATIONS = ['Generative AI', 'Generative AI', 'Cloud Storage', 'Social', 'Webmail'];

const LABEL_COLORS = ['#00a3d7', '#26c6da', '#4caf50', '#fbc02d', '#5e35b1', '#e91e63'];

function policyCounts(): number[] {
  const counts = GROUP_NAMES.map((_, i) => (i < 5 ? 4 : i % 3 === 0 ? 2 : 3));
  let excess = counts.reduce((a, b) => a + b, 0) - TOTAL_POLICIES;
  for (let i = counts.length - 1; excess > 0 && i >= 0; i--) {
    const take = Math.min(excess, counts[i] - 1);
    counts[i] -= take;
    excess -= take;
  }
  return counts;
}

export const POLICY_GROUPS: PolicyGroup[] = (() => {
  const counts = policyCounts();
  return GROUP_NAMES.map((name, g) => {
    const index = g + 1;
    return {
      id: `group-${index}`,
      index,
      name,
      sectionId: sectionFor(name),
      labels: LABEL_COLORS.slice(0, 5 + (g % 2)),
      policies: Array.from({ length: counts[g] }, (_, p) => ({
        id: `policy-${index}-${p + 1}`,
        number: `${index}.${p + 1}`,
        name: 'Policy',
        type: POLICY_TYPES[(g + p) % POLICY_TYPES.length],
        enabled: (g * 7 + p) % 9 !== 4,
        alertCount: (g + p) % 5 === 3 ? 12 : 0,
        users: 'nithesh.chandra@netskope.com, szaidi@netskope.com',
        destination: DESTINATIONS[(g + p) % DESTINATIONS.length],
        action: (g + p) % 4 === 2 ? ('Alert' as const) : ('Block' as const),
        template: (g + p) % 4 === 2 ? '' : 'Default Template',
      })),
    };
  });
})();



export const GROUP_NAME_LIST = POLICY_GROUPS.map((g) => g.name);
