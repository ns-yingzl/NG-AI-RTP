/**
 * Ambient type declarations for @netskope-ui/* packages that ship NO .d.ts.
 *
 * As of the pinned SHA these are: `filter`, `charts`, `file-uploader` (their
 * package `types` field points at a file that doesn't exist). Without these
 * stubs, importing them is a TS error ("could not find a declaration file").
 *
 * `filter` is declared in detail because its API is non-obvious and the
 * summarized docs are wrong about it (see netskope-context/known-issues.md).
 * Shapes reconstructed from the compiled source in
 * node_modules/@netskope-ui/filter/dist/es/. The others get permissive stubs —
 * tighten them if a prototype leans on them heavily.
 *
 * NOTE: keep this in sync when the DS publishes real types — delete the entry
 * once a package ships its own `dist/index.d.ts`.
 */

declare module '@netskope-ui/filter' {
  import type { ComponentType, ReactNode } from 'react';

  export type FilterOption = { value: string; label?: string; labelComponent?: ReactNode };

  export type FilterDefinition = {
    /** UPPERCASE — not 'select'/'text'. */
    type: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'TEXT_SEARCH' | 'DATE_RANGE_SELECT' | 'RANGE_SELECT';
    label: string;
    options?: ReadonlyArray<FilterOption>;
    operators?: string[];
    search?: boolean;
    allowEmptyStringValue?: boolean;
    /** trigger.className sizes the inner control; trigger.placeholder works for TEXT_SEARCH. */
    dashboard?: { trigger?: { className?: string; placeholder?: string } };
  };

  export type FilterValue = { operator?: string; value: unknown };
  export type FilterGroup = { label?: string; filters: string[] };

  export type BasicFilterProps = {
    def: Record<string, FilterDefinition> | Readonly<Record<string, FilterDefinition>>;
    /** Required even in isSimple — useDropdown maps over it. */
    groups?: FilterGroup[];
    /** Filter names shown up front (and removable). Prefer this over isSimple. */
    defaults?: string[];
    values?: Record<string, FilterValue>;
    /** WARNING: isSimple pins filters to the dashboard and defeats hover-X removal. */
    isSimple?: boolean;
    hideClear?: boolean;
    /** Wraps pills in a flex container so they size to content; pair with flex-wrap. */
    standalone?: boolean;
    standaloneContainerClassName?: string;
    skipEmitOnEmptyValueOperatorChange?: boolean;
    onChange?: (values: Record<string, FilterValue>) => void;
    onChangeCoarse?: (values: Record<string, FilterValue>) => void;
    onFilterChange?: (lastChange: unknown) => void;
  };

  export const BasicFilter: ComponentType<BasicFilterProps>;

  /** Mode toggle (Basic/Advanced) lives here — render Root + Basic + Advanced. */
  export const FilterContainer: {
    Root: ComponentType<{ children?: ReactNode }>;
    Basic: ComponentType<{ def: BasicFilterProps['def']; groups?: FilterGroup[] } & Record<string, unknown>>;
    Advanced: ComponentType<Record<string, unknown>>;
    AdvancedWithQueryKey: ComponentType<Record<string, unknown>>;
  };
  export const SearchFilter: ComponentType<Record<string, unknown>>;
  /** Touches `window` at import — load via next/dynamic({ ssr: false }). */
  export const AdvancedFilter: ComponentType<{
    query?: string;
    fieldOptions?: Array<{ name: string; label: string; operators?: string[]; values?: unknown[] }>;
    onChange?: (query: string) => void;
    onSubmit?: (query: string) => void;
  } & Record<string, unknown>>;
  export const AdvancedQueryInput: ComponentType<Record<string, unknown>>;
  export const DateRangeContainer: ComponentType<Record<string, unknown>>;
  export const ASYNC_STATUS: Record<string, string>;
  export function useGlobalQueryFieldOptions(...args: unknown[]): unknown;
  export function maskQueryStringWithLabels(...args: unknown[]): string;
}

declare module '@netskope-ui/charts';
declare module '@netskope-ui/file-uploader';
