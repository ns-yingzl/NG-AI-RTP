/**
 * Side navigation config — mirrors the production webui v2 navbar IA
 * (src/webui/neo/src/app/components/nav-bar/navbar-config.service.ts +
 *  navbar-v2.component.html).
 *
 * Source of truth for SideNav.tsx. Edit this file to add/remove items;
 * styling lives in SideNav.tsx, icon mapping in icon-map.tsx.
 *
 * In production some items are conditional on feature flags (AISecOps,
 * Secure Inference, UDS, Borderless SD-WAN, Device Intelligence, etc.) and
 * RBAC permissions. For the prototype we show them unconditionally so
 * designers have the full surface available.
 *
 * Spacer items (`type: 'spacer'`) render as uppercase section headings
 * inside the submenu — matching the production `_spacer` pattern with the
 * label as a small caps divider.
 */

export type NavItem = {
  id: string;
  label: string;
  iconName?: string;
  href?: string;
  type?: 'spacer';
  tag?: string;
  children?: NavItem[];
};

export const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Home', iconName: 'home', href: '/' },
  { id: 'ai-sec-ops', label: 'AISecOps', iconName: 'ai-ops' },
  { id: 'ai-security-discovery', label: 'AI Command Center', iconName: 'ai' },
  { id: 'uds', label: 'UDS', iconName: 'app-category' },
  {
    id: 'incidents',
    label: 'Incidents',
    iconName: 'alert',
    children: [
      { id: 'incmgmt', label: 'DLP' },
      { id: 'anomalies', label: 'Anomalies' },
      { id: 'compromised-credentials', label: 'Compromised Credentials' },
      { id: 'malware', label: 'Malware' },
      { id: 'malicious-site', label: 'Malicious Sites' },
      { id: 'quarantine', label: 'Quarantine' },
      { id: 'legalhold', label: 'Legal Hold' },
      { id: 'ai-security-incidents', label: 'AI Guardrails Incidents' },
      { id: 'airt', label: 'AI Red Teaming' },
    ],
  },
  {
    id: 'inspection',
    label: 'Policies',
    iconName: 'policy',
    children: [
      { id: '_spacer-policies', label: 'Policies', type: 'spacer' },
      { id: 'fast-path-policy', label: 'Fast Path' },
      { id: 'ssl-decryption', label: 'SSL Decryption' },
      { id: 'internet-access', label: 'Real-time Protection' },
      { id: 'private-app-access', label: 'Private App Access' },
      { id: 'eb-control-policy', label: 'Enterprise Browser Protection' },
      { id: 'breach-detection', label: 'Breach Detection' },
      { id: 'encryption', label: 'Encryption' },
      { id: 'ips-policies', label: 'IPS' },

      { id: '_spacer-profiles', label: 'Profiles', type: 'spacer' },
      { id: 'profiles-dlp', label: 'DLP' },
      { id: 'dns-profiles', label: 'DNS' },
      { id: 'inheritance-groups', label: 'Inheritance Groups' },
      { id: 'custom-categories', label: 'Custom Categories' },
      { id: 'url-list', label: 'URL List' },
      { id: 'service-profile', label: 'Service' },
      { id: 'http-header', label: 'HTTP Header' },
      { id: 'connectedapps-profile', label: 'Connected App/Plugin' },
      { id: 'domain-profile', label: 'Domain' },
      { id: 'user-profile', label: 'User' },
      { id: 'file-filter-profile', label: 'File' },
      { id: 'constraints', label: 'Constraint' },
      { id: 'quarantine-profile', label: 'Quarantine' },
      { id: 'legal-hold-profile', label: 'Legal Hold' },
      { id: 'forensic-profile', label: 'Forensic' },
      { id: 'tunnel-group', label: 'Tunnel' },
      { id: 'profile-network-location', label: 'Network Location' },
      { id: 'ai-security-profile', label: 'AI Guardrails' },
      { id: 'agent-profile', label: 'Agent' },
      { id: 'agent-guardrails-profile', label: 'Agent Guardrails' },

      { id: '_spacer-templates', label: 'Templates', type: 'spacer' },
      { id: 'client-notification', label: 'User Notification' },
      { id: 'email-notification', label: 'Email Notification' },
      { id: 'custom-image', label: 'Custom Image' },
      { id: 'rbi-template', label: 'RBI' },
    ],
  },
  { id: 'public-cloud', label: 'Cloud Infrastructure', iconName: 'cloud' },
  {
    id: 'ski',
    label: 'Skope IT™',
    iconName: 'skopeit',
    children: [
      { id: 'app-riskfactor', label: 'Applications' },
      { id: 'user-riskfactor', label: 'Users' },
      { id: '_spacer-events', label: 'Events & Alerts', type: 'spacer' },
      { id: 'transaction-events', label: 'HTTP Transaction Events' },
      { id: 'page-events', label: 'Page Events' },
      { id: 'network-events', label: 'Network Events' },
      { id: 'alerts', label: 'Alerts' },
    ],
  },
  { id: 'analytics', label: 'Advanced Analytics', iconName: 'chart' },
  { id: 'dem', label: 'Digital Experience Management', iconName: 'network' },
  { id: 'bwan', label: 'Borderless SD-WAN', iconName: 'borderless-wan' },
  { id: 'device-intelligence', label: 'Device Intelligence', iconName: 'device' },
];

/** Pinned to the bottom of the SideNav, visually separated from the main nav. */
export const NAV_FOOTER: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'gear',
    children: [
      { id: 'settings-administration', label: 'Administration' },
      { id: 'settings-tenant', label: 'Tenant' },
      { id: 'settings-integrations', label: 'Integrations' },
      { id: 'settings-forensics', label: 'Forensics' },
    ],
  },
  { id: 'skopilot', label: 'SkoPilot', iconName: 'user-star' },
];
