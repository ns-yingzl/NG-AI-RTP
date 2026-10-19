'use client';

import { useMemo, useState } from 'react';
import { NAV, NAV_FOOTER, type NavItem } from './nav-config';
import { ICON_MAP, ChevronRight, ChevronLeft } from './icon-map';

/**
 * SideNav — visual stand-in for webui's v2 navbar (the "mini-splash" sliding
 * panel). Ported from:
 *   webui/src/webui/neo/src/app/components/nav-bar/navbar-v2.component.{html,less}
 *
 * Visual model (v2):
 *   - Single fixed-width column (~200px), light background, border-right.
 *   - First level: vertical list of icon+label items with pill hover/active.
 *   - Click a parent with children → first level slides LEFT, submenu slides
 *     in from the right with a back-arrow header showing the parent's title.
 *   - Footer pinned to the bottom (Settings, SkoPilot) with a top fade.
 *   - Active leaf gets a colored left border indicator inside the pill.
 *
 * No @netskope-ui/side-nav exists yet — this is the stand-in until one ships.
 * Glyphs are unicode placeholders for the Netskope icon font; swap for
 * @netskope-ui/icons for higher fidelity.
 */

type Props = {
  activeNavId?: string;
};

function NavIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = name ? ICON_MAP[name] : undefined;
  if (!Icon) {
    return <span aria-hidden className="inline-block h-4 w-4" />;
  }
  return <Icon className={className} />;
}

function SpacerRow({ label }: { label: string }) {
  // Section divider — matches webui v2's `_spacer` pattern: label centered
  // in a thin horizontal rule, uppercase, subtle color.
  return (
    <div className="relative my-2 flex items-center px-2 pt-2" aria-hidden="true">
      <div className="absolute inset-x-2 top-1/2 h-px bg-neutral-border-weak" />
      <span className="relative bg-neutral-bg-base px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-text-subtle">
        {label}
      </span>
    </div>
  );
}

/** A single item rendered as a row in either the first-level or submenu view. */
function NavRow({
  item,
  active,
  onClick,
  hasChildrenChevron,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
  hasChildrenChevron?: boolean;
}) {
  return (
    <a
      href={item.href ?? '#'}
      role="menuitem"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={[
        'group relative flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
        active
          ? 'bg-action-bg-weak text-action-text font-medium'
          : 'text-neutral-text hover:bg-neutral-bg-base-hover',
      ].join(' ')}
    >
      {active && (
        <span aria-hidden className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r bg-action-bg" />
      )}
      <NavIcon
        name={item.iconName}
        className={[
          'h-4 w-4 shrink-0',
          active ? 'fill-action-icon' : 'fill-neutral-icon group-hover:fill-neutral-icon-hover',
        ].join(' ')}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.tag && (
        <span className="rounded bg-action-bg-weak px-1 py-px text-[10px] font-medium uppercase text-action-text">
          {item.tag}
        </span>
      )}
      {hasChildrenChevron && (
        <ChevronRight aria-hidden className="h-3 w-3 shrink-0 fill-neutral-icon-weak group-hover:fill-neutral-icon" />
      )}
    </a>
  );
}

function isInTree(item: NavItem, activeId?: string): boolean {
  if (!activeId) return false;
  if (item.id === activeId) return true;
  return !!item.children?.some((c) => c.id === activeId);
}

export function SideNav({ activeNavId }: Props) {
  // submenu state — when set, the submenu view is showing
  const [submenu, setSubmenu] = useState<NavItem | null>(null);

  // Auto-open the submenu if the active item is a child of a parent
  const initialOpenParent = useMemo(() => {
    if (!activeNavId) return null;
    return NAV.find((item) => item.children?.some((c) => c.id === activeNavId)) ?? null;
  }, [activeNavId]);

  const [hasInteracted, setHasInteracted] = useState(false);
  const activeSubmenu = hasInteracted ? submenu : (submenu ?? initialOpenParent);
  const submenuActive = activeSubmenu !== null;

  function openSubmenu(item: NavItem) {
    setHasInteracted(true);
    setSubmenu(item);
  }
  function closeSubmenu() {
    setHasInteracted(true);
    setSubmenu(null);
  }

  return (
    <aside
      className="relative flex h-full w-56 shrink-0 flex-col overflow-hidden border-r border-neutral-border-weak bg-neutral-bg-base"
      aria-label="Primary"
    >
      {/* Sliding views container */}
      <div className="relative flex-1 overflow-hidden">
        {/* First-level view */}
        <div
          className={[
            'absolute inset-0 flex flex-col transition-transform duration-300 ease-out',
            submenuActive ? '-translate-x-full' : 'translate-x-0',
          ].join(' ')}
          aria-hidden={submenuActive}
        >
          <nav className="flex flex-col gap-px overflow-y-auto px-2 py-3" role="menu">
            {NAV.map((item) => {
              const inTree = isInTree(item, activeNavId);
              const hasChildren = !!item.children?.length;
              return (
                <NavRow
                  key={item.id}
                  item={item}
                  active={inTree}
                  hasChildrenChevron={hasChildren}
                  onClick={hasChildren ? () => openSubmenu(item) : undefined}
                />
              );
            })}
          </nav>
        </div>

        {/* Submenu view */}
        <div
          className={[
            'absolute inset-0 flex flex-col transition-transform duration-300 ease-out',
            submenuActive ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
          aria-hidden={!submenuActive}
        >
          {/* Submenu header — back button + parent title */}
          <div className="flex shrink-0 items-center gap-1 border-b border-neutral-border-weak px-2 py-2">
            <button
              type="button"
              aria-label="Back to main menu"
              onClick={closeSubmenu}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-bg-base-hover"
            >
              <ChevronLeft aria-hidden className="h-4 w-4 fill-neutral-icon" />
            </button>
            <span className="truncate text-sm font-medium text-neutral-text">
              {activeSubmenu?.label}
            </span>
          </div>

          <nav className="flex flex-col gap-px overflow-y-auto px-2 py-3" role="menu">
            {activeSubmenu?.children?.map((child) =>
              child.type === 'spacer' ? (
                <SpacerRow key={child.id} label={child.label} />
              ) : (
                <NavRow key={child.id} item={child} active={child.id === activeNavId} />
              ),
            )}
          </nav>
        </div>
      </div>

      {/* Top fade above footer */}
      <div
        aria-hidden
        className="pointer-events-none h-10 bg-gradient-to-t from-neutral-bg-base to-transparent"
      />

      {/* Footer */}
      <div className="shrink-0 border-t border-neutral-border-weak px-2 py-3">
        <nav className="flex flex-col gap-px" role="menu" aria-label="Footer navigation">
          {NAV_FOOTER.map((item) => {
            const inTree = isInTree(item, activeNavId);
            const hasChildren = !!item.children?.length;
            return (
              <NavRow
                key={item.id}
                item={item}
                active={inTree}
                hasChildrenChevron={hasChildren}
                onClick={hasChildren ? () => openSubmenu(item) : undefined}
              />
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
