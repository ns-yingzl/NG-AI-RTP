'use client';

import { FilterContainer, SearchFilter } from '@netskope-ui/filter';
import { GROUP_NAME_LIST } from './data';

// Filter def is a name-keyed object with UPPERCASE types — see netskope-context/known-issues.md.
const def = {
  policy: {
    field: 'policy',
    label: 'Policy',
    type: 'TEXT_SEARCH',
    dashboard: { trigger: { className: 'w-[200px]', placeholder: 'Search' } },
  },
  policyGroup: {
    field: 'policy_group',
    label: 'Policy Group',
    type: 'MULTI_SELECT',
    options: GROUP_NAME_LIST.map((value) => ({ value })),
  },
  status: {
    field: 'status',
    label: 'Status',
    type: 'SINGLE_SELECT',
    options: [{ value: 'Enabled' }, { value: 'Disabled' }],
  },
  action: {
    field: 'action',
    label: 'Action',
    type: 'MULTI_SELECT',
    options: [{ value: 'Allow' }, { value: 'Block' }, { value: 'Alert' }],
  },
} as const;

const groups = [{ filters: Object.keys(def) }];

/**
 * Policy list filter bar. Loaded client-only (`next/dynamic`, ssr: false) because the
 * advanced query input touches `window` at import time.
 */
export default function PolicyFilters() {
  return (
    <SearchFilter>
      <FilterContainer.Root>
        <FilterContainer.Basic
          def={def}
          groups={groups}
          defaults={['policy', 'policyGroup']}
          standalone
          standaloneContainerClassName="flex-wrap"
        />
        <FilterContainer.Advanced />
      </FilterContainer.Root>
    </SearchFilter>
  );
}
