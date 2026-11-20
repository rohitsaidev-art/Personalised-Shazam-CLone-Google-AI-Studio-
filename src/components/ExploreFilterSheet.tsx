import React, { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from './ui/dialog';
import { ExploreFilters, FilterCategoryKey, Song } from '../types/music';
import {
  applyExploreFilters,
  getArtistCoverArtwork,
  getCategoryValues,
  hasActiveExploreFilters,
} from '../data/songs';
import { FilterChip } from './FilterChip';
import { UI_ICON_PROPS } from '../lib/iconConfig';
import { useSheetDrag } from '../lib/useSheetDrag';
import { cn } from '../lib/utils';

interface ExploreFilterSheetProps {
  open: boolean;
  songs: Song[];
  draftFilters: ExploreFilters;
  savedScrollTop: number;
  onSaveScrollTop: (scrollTop: number) => void;
  onToggleFilter: (category: FilterCategoryKey, value: string) => void;
  onClearDraftFilters: () => void;
  onClose: () => void;
  onShowResults: () => void;
  portalContainer: HTMLElement | null;
  onTriggerHaptic?: () => void;
}

const EXPLORE_SECTIONS: Array<{
  key: FilterCategoryKey;
  title: string;
  rows: 1 | 2 | 3;
}> = [
  { key: 'artists', title: 'Artists', rows: 3 },
  { key: 'genres', title: 'Genres', rows: 3 },
  { key: 'cities', title: 'Cities', rows: 1 },
  { key: 'moods', title: 'Moods', rows: 1 },
  { key: 'decades', title: 'Decades', rows: 1 },
];

export const ExploreFilterSheet: React.FC<ExploreFilterSheetProps> = ({
  open,
  songs,
  draftFilters,
  savedScrollTop,
  onSaveScrollTop,
  onToggleFilter,
  onClearDraftFilters,
  onClose,
  onShowResults,
  portalContainer,
  onTriggerHaptic,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = savedScrollTop;
    }
  }, [open, savedScrollTop]);

  const categoryOptions = useMemo(() => {
    return {
      artists: getCategoryValues(songs, 'artists', 'explore'),
      genres: getCategoryValues(songs, 'genres', 'explore'),
      cities: getCategoryValues(songs, 'cities', 'explore'),
      moods: getCategoryValues(songs, 'moods', 'explore'),
      decades: getCategoryValues(songs, 'decades', 'explore'),
    };
  }, [songs]);

  const hasSelection = hasActiveExploreFilters(draftFilters);
  const matchingCount = useMemo(
    () =>
      hasSelection
        ? applyExploreFilters(songs, draftFilters).length
        : songs.length,
    [songs, draftFilters, hasSelection]
  );

  const handleClose = () => {
    if (scrollRef.current) {
      onSaveScrollTop(scrollRef.current.scrollTop);
    }
    onClose();
  };

  const handleShow = () => {
    if (scrollRef.current) {
      onSaveScrollTop(scrollRef.current.scrollTop);
    }
    onTriggerHaptic?.();
    onShowResults();
  };

  // Grabber + header only: vertical/horizontal chip grids never trigger sheet drag
  const { prefersReducedMotion, startDrag, sheetMotionDragProps } = useSheetDrag({
    onDismiss: handleClose,
    thresholdPx: 110,
    projectedThresholdPx: 180,
    elasticTop: 0.05,
    elasticBottom: 0.5,
    onTriggerHaptic,
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <AnimatePresence>
        {open && (
          <DialogPortal forceMount container={portalContainer}>
            <DialogOverlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-40 bg-black/60 backdrop-blur-[4px]"
              />
            </DialogOverlay>

            <DialogContent asChild forceMount>
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
                animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.16 }
                    : { type: 'spring', bounce: 0, duration: 0.36 }
                }
                {...sheetMotionDragProps}
                className="absolute inset-x-0 bottom-0 top-[46px] z-50 flex flex-col rounded-t-[32px] bg-[var(--surface-sheet)] border-t border-[var(--border-glass)] shadow-[0_-18px_50px_rgba(0,0,0,0.8)] overflow-hidden"
              >
                {/* Dedicated Grabber + Header Drag Region */}
                <div
                  onPointerDown={startDrag}
                  className="relative px-4 pt-2.5 pb-3 text-center shrink-0 touch-none cursor-grab active:cursor-grabbing"
                >
                  <div className="mb-1 flex justify-center">
                    <div
                      aria-hidden="true"
                      className="h-[4px] w-[38px] rounded-full bg-white/25"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close Explore"
                    className="glass-circle hit-target-44 pressable-strong absolute left-4 top-4 flex h-[38px] w-[38px] items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                  >
                    <X size={18} {...UI_ICON_PROPS} />
                  </button>

                  {hasSelection && (
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerHaptic?.();
                        onClearDraftFilters();
                      }}
                      className="pressable absolute right-3 top-3 flex h-[44px] items-center justify-center rounded-full px-3 text-[14px] font-medium text-[var(--accent-blue)] hover:text-[var(--accent-blue-hover)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                    >
                      Clear
                    </button>
                  )}

                  <DialogTitle className="mt-5 text-[24px] font-bold tracking-[-0.025em] text-white">
                    Explore
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
                    Your top artists, genres and more
                  </DialogDescription>
                </div>

                {/* Scrollable 5-category body (strictly drag-free) */}
                <div
                  ref={scrollRef}
                  data-no-sheet-drag="true"
                  onScroll={(e) => onSaveScrollTop(e.currentTarget.scrollTop)}
                  className={cn(
                    'flex-1 overflow-y-auto no-scrollbar pt-2',
                    hasSelection ? 'pb-28' : 'pb-10'
                  )}
                >
                  <div className="flex flex-col gap-5">
                    {EXPLORE_SECTIONS.map((section) => {
                      const values = categoryOptions[section.key];
                      const selectedList = draftFilters[section.key];
                      const isMultiRow = section.rows === 3 && values.length > 3;

                      return (
                        <section key={section.key} aria-label={section.title}>
                          <h3 className="mb-2.5 px-4 text-[14.5px] font-semibold tracking-[-0.01em] text-white">
                            {section.title}
                          </h3>

                          {isMultiRow ? (
                            <div className="overflow-x-auto no-scrollbar px-4">
                              <div className="grid grid-flow-col grid-rows-3 auto-cols-[164px] gap-x-2.5 gap-y-2.5 w-max pr-4">
                                {values.map((val) => {
                                  const selected = selectedList.includes(val);
                                  const artistCover =
                                    section.key === 'artists'
                                      ? getArtistCoverArtwork(songs, val)
                                      : undefined;
                                  return (
                                    <FilterChip
                                      key={val}
                                      label={val}
                                      category={section.key}
                                      variant="explore"
                                      selected={selected}
                                      coverArtwork={artistCover?.artwork}
                                      coverSeedKey={artistCover?.seedKey}
                                      onClick={() => {
                                        onTriggerHaptic?.();
                                        onToggleFilter(section.key, val);
                                      }}
                                      className="w-[164px] justify-start"
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="overflow-x-auto no-scrollbar px-4">
                              <div className="flex items-center gap-2.5 w-max pr-4">
                                {values.map((val) => {
                                  const selected = selectedList.includes(val);
                                  return (
                                    <FilterChip
                                      key={val}
                                      label={val}
                                      category={section.key}
                                      variant="explore"
                                      selected={selected}
                                      onClick={() => {
                                        onTriggerHaptic?.();
                                        onToggleFilter(section.key, val);
                                      }}
                                      className="min-w-[136px] justify-start"
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                </div>

                {/* Live AND-filtered CTA bar with smooth bottom scrim */}
                <AnimatePresence>
                  {hasSelection && (
                    <motion.div
                      initial={
                        prefersReducedMotion ? { opacity: 0 } : { y: 36, opacity: 0 }
                      }
                      animate={{ y: 0, opacity: 1 }}
                      exit={
                        prefersReducedMotion ? { opacity: 0 } : { y: 36, opacity: 0 }
                      }
                      transition={
                        prefersReducedMotion
                          ? { duration: 0.14 }
                          : { type: 'spring', bounce: 0, duration: 0.24 }
                      }
                      className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-6 pt-10 bg-gradient-to-t from-[var(--surface-sheet)] via-[var(--surface-sheet)]/92 to-transparent"
                    >
                      <button
                        type="button"
                        disabled={matchingCount === 0}
                        onClick={handleShow}
                        className={cn(
                          'pointer-events-auto pressable flex h-[50px] w-full items-center justify-center rounded-full text-[15.5px] font-semibold tracking-[-0.01em] text-white tabular-nums transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                          matchingCount > 0
                            ? 'bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] shadow-[0_8px_24px_rgba(10,132,255,0.38)]'
                            : 'bg-[#2C2D33] text-white/45 cursor-not-allowed'
                        )}
                      >
                        {matchingCount === 0
                          ? 'No Matching Songs'
                          : `Show ${matchingCount} ${matchingCount === 1 ? 'Song' : 'Songs'}`}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
