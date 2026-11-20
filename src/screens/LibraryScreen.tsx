import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Archive, ArrowLeft, MoreHorizontal, Search, X } from 'lucide-react';
import {
  ExploreFilters,
  FilterCategoryKey,
  QuickFilterState,
  Song,
  SortConfig,
} from '../types/music';
import {
  applyExploreFilters,
  applyQuickFilter,
  applySearchQuery,
  getCategoryValues,
  groupSongsForDisplay,
  hasActiveExploreFilters,
  sortSongs,
} from '../data/songs';
import { SortPopover } from '../components/SortPopover';
import { QuickFilterRow } from '../components/QuickFilterRow';
import { SongCard } from '../components/SongCard';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../components/ui/popover';
import { UI_ICON_PROPS } from '../lib/iconConfig';
import { useMenuKeyboardNav } from '../lib/useMenuKeyboardNav';

interface LibraryScreenProps {
  songs: Song[];
  sort: SortConfig;
  onChangeSort: (sort: SortConfig) => void;
  searchQuery: string;
  onChangeSearchQuery: (q: string) => void;
  quickFilter: QuickFilterState;
  onOpenQuickCategory: (category: FilterCategoryKey) => void;
  onSelectQuickValue: (value: string) => void;
  onCloseQuickFilter: () => void;
  isAdvancedResultsActive: boolean;
  appliedExploreFilters: ExploreFilters;
  onOpenExplore: () => void;
  onReturnToExploreFromResults: () => void;
  onRemoveExploreChip: (category: FilterCategoryKey, value: string) => void;
  onClearAllFilters: () => void;
  isMultiSelectMode: boolean;
  selectedSongIds: Set<string>;
  favoriteIds: Set<string>;
  currentSongId: string | null;
  isPlaying: boolean;
  archivedCount: number;
  viewingArchived: boolean;
  scrollToTopSignal: number;
  onToggleViewingArchived: (next: boolean) => void;
  onExitMultiSelect: () => void;
  onToggleSongSelect: (songId: string) => void;
  onToggleFavorite: (songId: string) => void;
  onSelectSong: (song: Song, queue: Song[]) => void;
  onOpenSongActionMenu: (song: Song, rect: DOMRect) => void;
  portalContainer: HTMLElement | null;
  onTriggerHaptic?: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  songs,
  sort,
  onChangeSort,
  searchQuery,
  onChangeSearchQuery,
  quickFilter,
  onOpenQuickCategory,
  onSelectQuickValue,
  onCloseQuickFilter,
  isAdvancedResultsActive,
  appliedExploreFilters,
  onOpenExplore,
  onReturnToExploreFromResults,
  onRemoveExploreChip,
  onClearAllFilters,
  isMultiSelectMode,
  selectedSongIds,
  favoriteIds,
  currentSongId,
  isPlaying,
  archivedCount,
  viewingArchived,
  scrollToTopSignal,
  onToggleViewingArchived,
  onExitMultiSelect,
  onToggleSongSelect,
  onToggleFavorite,
  onSelectSong,
  onOpenSongActionMenu,
  portalContainer,
  onTriggerHaptic,
}) => {
  const [moreMenuOpen, setMoreMenuOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { menuRef: filterMenuRef, handleMenuKeyDown: handleFilterMenuKeyDown } =
    useMenuKeyboardNav(moreMenuOpen, () => setMoreMenuOpen(false));

  useEffect(() => {
    if (scrollToTopSignal > 0 && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  }, [scrollToTopSignal, prefersReducedMotion]);

  const filterBarMode: 'default' | 'quick' | 'advanced-results' =
    isAdvancedResultsActive && hasActiveExploreFilters(appliedExploreFilters)
      ? 'advanced-results'
      : quickFilter.openCategory
      ? 'quick'
      : 'default';

  const quickCategoryValues = useMemo(() => {
    if (!quickFilter.openCategory) return [];
    return getCategoryValues(songs, quickFilter.openCategory, 'quick');
  }, [songs, quickFilter.openCategory]);

  // Single derived pipeline: filters -> search -> sort -> group
  const displayedSongs = useMemo(() => {
    let list = songs;

    if (filterBarMode === 'advanced-results') {
      list = applyExploreFilters(list, appliedExploreFilters);
    } else if (quickFilter.selectedCategory && quickFilter.selectedValue) {
      list = applyQuickFilter(
        list,
        quickFilter.selectedCategory,
        quickFilter.selectedValue
      );
    }

    list = applySearchQuery(list, searchQuery);
    return sortSongs(list, sort);
  }, [
    songs,
    filterBarMode,
    appliedExploreFilters,
    quickFilter.selectedCategory,
    quickFilter.selectedValue,
    searchQuery,
    sort,
  ]);

  const groupedSongs = useMemo(
    () => groupSongsForDisplay(displayedSongs, sort),
    [displayedSongs, sort]
  );

  const showFilterMoreButton = !isMultiSelectMode && filterBarMode !== 'default';

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--bg-library)] overflow-hidden">
      {/* Minimal status-bar translucent fade cap on mobile so scrolling cards never clash with iOS status icons */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[calc(var(--safe-top)+6px)] bg-gradient-to-b from-black/92 via-black/70 to-transparent md:hidden"
      />

      {/* Single full-height scroll container: entire header including Search & Quick Filters scrolls naturally */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar pb-[calc(var(--safe-bottom)+128px)] md:pb-32"
      >
        <header className="pt-[calc(var(--safe-top)+8px)] md:pt-1.5 pb-1.5">
          {/* Title + Count + Right Controls */}
          <div className="flex items-start justify-between px-4 pt-0.5 pb-2.5">
            <div>
              <h1 className="text-[34px] md:text-[31px] font-bold leading-[1.08] tracking-[-0.03em] text-white">
                {viewingArchived ? 'Archived' : 'Library'}
              </h1>
              <div className="mt-[2px] flex items-center gap-2">
                <p className="text-[14px] md:text-[13px] font-medium text-[var(--text-secondary)] tabular-nums">
                  {displayedSongs.length}{' '}
                  {displayedSongs.length === 1 ? 'song' : 'songs'}
                </p>

                {!isMultiSelectMode && viewingArchived && (
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerHaptic?.();
                      onToggleViewingArchived(false);
                    }}
                    className="pressable inline-flex items-center gap-1 rounded-full bg-[var(--surface-elevated)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--accent-blue)] border border-[var(--border-hairline)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                  >
                    <ArrowLeft size={12} {...UI_ICON_PROPS} />
                    <span>Back to Library</span>
                  </button>
                )}

                {!isMultiSelectMode && !viewingArchived && archivedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerHaptic?.();
                      onToggleViewingArchived(true);
                    }}
                    className="pressable inline-flex items-center gap-1 rounded-full bg-[var(--surface-elevated)] px-2.5 py-0.5 text-[12px] font-medium text-[var(--text-secondary)] hover:text-white border border-[var(--border-hairline)] cursor-pointer tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                  >
                    <Archive size={12} {...UI_ICON_PROPS} />
                    <span>Archived ({archivedCount})</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              {isMultiSelectMode ? (
                <button
                  type="button"
                  onClick={() => {
                    onTriggerHaptic?.();
                    onExitMultiSelect();
                  }}
                  className="glass-circle hit-target-44 pressable-strong flex h-[40px] md:h-[38px] items-center justify-center rounded-full px-4 text-[14.5px] md:text-[14px] font-semibold text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                >
                  Done
                </button>
              ) : (
                <>
                  <SortPopover
                    sort={sort}
                    onChangeSort={onChangeSort}
                    portalContainer={portalContainer}
                    onTriggerHaptic={onTriggerHaptic}
                  />

                  {showFilterMoreButton && (
                    <Popover open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label="Filter view options"
                          aria-haspopup="menu"
                          aria-expanded={moreMenuOpen}
                          className="glass-circle hit-target-44 pressable-strong flex h-[38px] w-[38px] items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                        >
                          <MoreHorizontal size={18} {...UI_ICON_PROPS} />
                        </button>
                      </PopoverTrigger>

                      <AnimatePresence>
                        {moreMenuOpen && (
                          <PopoverPortal
                            forceMount
                            container={portalContainer ?? undefined}
                          >
                            <PopoverContent
                              asChild
                              forceMount
                              useOwnPortal={false}
                              align="end"
                              sideOffset={8}
                              className="w-[202px] origin-top-right"
                            >
                              <motion.div
                                ref={filterMenuRef}
                                onKeyDown={handleFilterMenuKeyDown}
                                role="menu"
                                aria-label="Filter view options"
                                initial={
                                  prefersReducedMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, scale: 0.92, y: -4 }
                                }
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={
                                  prefersReducedMotion
                                    ? { opacity: 0 }
                                    : { opacity: 0, scale: 0.94, y: -4 }
                                }
                                transition={
                                  prefersReducedMotion
                                    ? { duration: 0.12 }
                                    : { type: 'spring', bounce: 0, duration: 0.22 }
                                }
                                className="glass-popover overflow-hidden rounded-[18px] py-1 text-[14.5px] text-white"
                              >
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setMoreMenuOpen(false);
                                    onTriggerHaptic?.();
                                    onOpenExplore();
                                  }}
                                  className="pressable flex min-h-[44px] w-full items-center px-4 py-2.5 text-left hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                                >
                                  Open Explore Filters
                                </button>
                                <div
                                  role="separator"
                                  className="mx-3 h-px bg-[var(--border-divider)]"
                                />
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    setMoreMenuOpen(false);
                                    onTriggerHaptic?.();
                                    onClearAllFilters();
                                  }}
                                  className="pressable flex min-h-[44px] w-full items-center px-4 py-2.5 text-left text-[var(--accent-red)] hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                                >
                                  Clear Filters
                                </button>
                              </motion.div>
                            </PopoverContent>
                          </PopoverPortal>
                        )}
                      </AnimatePresence>
                    </Popover>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Persistent Search in Library field — full pill matching Board 02 & GlobalSearchOverlay */}
          <div className="px-4 pb-2.5">
            <div className="relative flex items-center">
              <Search
                size={16}
                {...UI_ICON_PROPS}
                className="pointer-events-none absolute left-3.5 text-[var(--text-tertiary)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onChangeSearchQuery(e.target.value)}
                placeholder="Search in Library"
                aria-label="Search in Library"
                className="h-[44px] md:h-[40px] w-full rounded-full bg-[var(--surface-elevated)] pl-9 pr-10 text-[16px] md:text-[14.5px] text-white placeholder:text-[var(--text-tertiary)] border border-[var(--border-hairline)] focus:border-[var(--accent-blue)]/65 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onChangeSearchQuery('')}
                  aria-label="Clear Library search"
                  className="absolute right-0 flex h-[44px] md:h-[40px] w-[44px] items-center justify-center text-white/80 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] rounded-full"
                >
                  <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white/16">
                    <X size={12} {...UI_ICON_PROPS} />
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Row / Category Values / Active Explore Chips (strictly 5 discovery categories; hidden inside Archived view) */}
          {!isMultiSelectMode && !viewingArchived && (
            <QuickFilterRow
              songs={songs}
              mode={filterBarMode}
              quickFilter={quickFilter}
              categoryValues={quickCategoryValues}
              activeExploreFilters={appliedExploreFilters}
              onOpenExplore={onOpenExplore}
              onOpenQuickCategory={onOpenQuickCategory}
              onSelectQuickValue={onSelectQuickValue}
              onCloseQuickFilter={onCloseQuickFilter}
              onRemoveExploreChip={onRemoveExploreChip}
              onReturnToExploreFromResults={onReturnToExploreFromResults}
              onTriggerHaptic={onTriggerHaptic}
            />
          )}
        </header>

        {/* Date-grouped SongCard list */}
        <div className="px-4 pt-2">
          {groupedSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[16px] font-semibold text-white">No matching songs</p>
              <p className="mt-1.5 max-w-[240px] text-[13.5px] text-[var(--text-secondary)]">
                Adjust your search or active filters to see songs from your Library.
              </p>
              <button
                type="button"
                onClick={() => {
                  onTriggerHaptic?.();
                  onChangeSearchQuery('');
                  onClearAllFilters();
                }}
                className="pressable mt-4 min-h-[44px] rounded-full bg-[var(--surface-elevated)] px-5 py-2 text-[14px] font-medium text-[var(--accent-blue)] border border-[var(--border-hairline)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {groupedSongs.map((group) => (
                <section key={group.label} aria-label={group.label}>
                  <h2 className="mb-2.5 px-0.5 text-[17px] font-bold md:text-[14px] md:font-semibold tracking-[-0.015em] md:tracking-[-0.01em] text-white">
                    {group.label}
                  </h2>
                  <div className="flex flex-col gap-2.5">
                    {group.songs.map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        isMultiSelectMode={isMultiSelectMode}
                        isSelected={selectedSongIds.has(song.id)}
                        isFavorite={favoriteIds.has(song.id)}
                        isActiveTrack={currentSongId === song.id}
                        isPlaying={isPlaying && currentSongId === song.id}
                        onSelectSong={(s) => onSelectSong(s, displayedSongs)}
                        onToggleSelect={onToggleSongSelect}
                        onToggleFavorite={onToggleFavorite}
                        onOpenActionMenu={onOpenSongActionMenu}
                        onTriggerHaptic={onTriggerHaptic}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
