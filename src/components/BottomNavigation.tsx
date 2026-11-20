import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Search } from 'lucide-react';
import { AppTab } from '../types/music';
import { cn } from '../lib/utils';
import { UI_ICON_PROPS } from '../lib/iconConfig';
import {
  LibraryTabIcon,
  NowPlayingTabIcon,
  ShazamCircleIcon,
} from './ShazamIcons';

interface BottomNavigationProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenGlobalSearch: () => void;
}

const TABS: Array<{
  id: AppTab;
  label: string;
  renderIcon: (active: boolean) => React.ReactNode;
}> = [
  {
    id: 'home',
    label: 'Home',
    renderIcon: (active) => (
      <ShazamCircleIcon
        className={cn(
          'h-[22px] w-[22px] transition-colors duration-150',
          active ? 'text-[var(--accent-blue)]' : 'text-white'
        )}
      />
    ),
  },
  {
    id: 'library',
    label: 'Library',
    renderIcon: (active) => (
      <LibraryTabIcon
        className={cn(
          'h-[22px] w-[22px] transition-colors duration-150',
          active ? 'text-[var(--accent-blue)]' : 'text-white'
        )}
      />
    ),
  },
  {
    id: 'now-playing',
    label: 'Now Playing',
    renderIcon: (active) => (
      <NowPlayingTabIcon
        className={cn(
          'h-[22px] w-[22px] transition-colors duration-150',
          active ? 'text-[var(--accent-blue)]' : 'text-white'
        )}
      />
    ),
  },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenGlobalSearch,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center px-4 pb-5 pt-9',
        activeTab === 'home'
          ? 'bg-gradient-to-t from-[#03060A]/80 via-[#03060A]/25 to-transparent'
          : 'bg-gradient-to-t from-black/82 via-black/40 to-transparent'
      )}
    >
      <div className="pointer-events-auto flex w-full items-center gap-[10px]">
        {/* Floating bottom navigation pill: strictly Home · Library · Now Playing (58px matched to Search circle) */}
        <nav
          aria-label="Primary Navigation"
          className="glass-pill relative flex h-[58px] flex-1 items-center rounded-full p-[4px]"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'pressable relative flex h-full flex-1 flex-col items-center justify-center gap-[3.5px] rounded-full cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]',
                  isActive
                    ? 'text-[var(--accent-blue)]'
                    : 'text-white/90 hover:text-white'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={prefersReducedMotion ? undefined : 'active-nav-pill'}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.01 }
                        : { type: 'spring', bounce: 0, duration: 0.24 }
                    }
                    className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/[0.07]"
                  />
                )}
                <span className="relative z-10">{tab.renderIcon(isActive)}</span>
                <span
                  className={cn(
                    'relative z-10 text-[11px] font-medium tracking-[0.005em] whitespace-nowrap leading-none',
                    isActive ? 'text-[var(--accent-blue)]' : 'text-white/86'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Separate circular global Search action — exact 58×58 height match to navigation pill */}
        <button
          type="button"
          onClick={onOpenGlobalSearch}
          aria-label="Search Library"
          className="glass-pill pressable-strong flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
        >
          <Search size={22} {...UI_ICON_PROPS} />
        </button>
      </div>
    </div>
  );
};
