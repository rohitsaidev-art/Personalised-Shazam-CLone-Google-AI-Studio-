import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from './ui/dialog';
import { Song } from '../types/music';
import { applySearchQuery, sortSongs } from '../data/songs';
import { SongCard } from './SongCard';
import { UI_ICON_PROPS } from '../lib/iconConfig';
import { useSheetDrag } from '../lib/useSheetDrag';

interface GlobalSearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songs: Song[];
  favoriteIds: Set<string>;
  onSelectSong: (song: Song) => void;
  onOpenSongActionMenu: (song: Song, rect: DOMRect) => void;
  portalContainer: HTMLElement | null;
  onTriggerHaptic?: () => void;
}

export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({
  open,
  onOpenChange,
  songs,
  favoriteIds,
  onSelectSong,
  onOpenSongActionMenu,
  portalContainer,
  onTriggerHaptic,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { prefersReducedMotion, startDrag, sheetMotionDragProps } = useSheetDrag({
    onDismiss: () => onOpenChange(false),
    thresholdPx: 95,
    projectedThresholdPx: 160,
    elasticTop: 0.05,
    elasticBottom: 0.48,
    onTriggerHaptic,
  });

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(id);
    } else {
      setQuery('');
    }
  }, [open]);

  const results = useMemo(() => {
    const filtered = applySearchQuery(songs, query);
    return sortSongs(filtered, { field: 'dateFound', order: 'newest' });
  }, [songs, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPortal forceMount container={portalContainer}>
            <DialogOverlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 z-40 bg-black/70 backdrop-blur-[12px]"
              />
            </DialogOverlay>

            <DialogContent asChild forceMount>
              <motion.div
                initial={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }
                }
                animate={
                  prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                }
                exit={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0.15 }
                    : { type: 'spring', bounce: 0, duration: 0.28 }
                }
                {...sheetMotionDragProps}
                className="absolute inset-x-0 bottom-0 top-[52px] z-50 flex flex-col rounded-t-[32px] bg-[var(--surface-sheet)]/96 border-t border-[var(--border-glass)] overflow-hidden"
              >
                <DialogTitle className="sr-only">Search Library Overlay</DialogTitle>
                <DialogDescription className="sr-only">
                  Filter all local songs in your Library
                </DialogDescription>

                {/* Dedicated top grabber strip only — input & list remain drag-free */}
                <div
                  onPointerDown={startDrag}
                  className="flex shrink-0 justify-center pt-2.5 pb-1 touch-none cursor-grab active:cursor-grabbing"
                >
                  <div
                    aria-hidden="true"
                    className="h-[4px] w-[38px] rounded-full bg-white/25"
                  />
                </div>

                {/* Top search input row */}
                <div className="flex items-center gap-2.5 px-4 pt-2 pb-3 border-b border-[var(--border-divider)]">
                  <div className="relative flex flex-1 items-center">
                    <Search
                      size={16}
                      {...UI_ICON_PROPS}
                      className="pointer-events-none absolute left-3.5 text-[var(--text-tertiary)]"
                    />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Search ${songs.length} songs, artists, genres, cities`}
                      className="h-[40px] w-full rounded-full bg-[var(--surface-elevated)] pl-9 pr-10 text-[14.5px] text-white placeholder:text-[var(--text-tertiary)] border border-[var(--border-hairline)] focus:border-[var(--accent-blue)]/65 focus:outline-none"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        aria-label="Clear search"
                        className="absolute right-0 flex h-[40px] w-[44px] items-center justify-center text-white/80 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] rounded-full"
                      >
                        <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white/16">
                          <X size={12} {...UI_ICON_PROPS} />
                        </span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    aria-label="Close search overlay"
                    className="glass-circle hit-target-44 pressable-strong flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                  >
                    <X size={18} {...UI_ICON_PROPS} />
                  </button>
                </div>

                {/* Live count line */}
                <div className="flex items-center justify-between px-4 py-2.5 text-[12.5px] text-[var(--text-secondary)] tabular-nums">
                  <span>
                    {query.trim()
                      ? `${results.length} ${results.length === 1 ? 'result' : 'results'}`
                      : `All ${songs.length} songs in Library`}
                  </span>
                </div>

                {/* Scrollable matches */}
                <div
                  data-no-sheet-drag="true"
                  className="flex-1 overflow-y-auto no-scrollbar px-4 pb-8"
                >
                  {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <p className="text-[15px] font-medium text-white/90">
                        No songs found
                      </p>
                      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                        Try another title, artist, genre, or city.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {results.map((song) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          isMultiSelectMode={false}
                          isSelected={false}
                          isFavorite={favoriteIds.has(song.id)}
                          onSelectSong={(s) => {
                            onOpenChange(false);
                            onSelectSong(s);
                          }}
                          onToggleSelect={() => {}}
                          onOpenActionMenu={(s, rect) => {
                            onOpenChange(false);
                            onOpenSongActionMenu(s, rect);
                          }}
                          onTriggerHaptic={onTriggerHaptic}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
