import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Archive,
  ArchiveRestore,
  Heart,
  Layers,
  ListPlus,
  MoreHorizontal,
  ThumbsDown,
  Trash2,
  UserCircle2,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverPortal, PopoverTrigger } from './ui/popover';
import { UI_ICON_PROPS } from '../lib/iconConfig';
import { useMenuKeyboardNav } from '../lib/useMenuKeyboardNav';
import { cn } from '../lib/utils';

interface MultiSelectActionControlsProps {
  selectedCount: number;
  allSelectedFavorited: boolean;
  viewingArchived: boolean;
  onBulkDelete: () => void;
  onBulkToggleFavorite: () => void;
  onBulkAddToCollection: () => void;
  onBulkArchiveOrRestore: () => void;
  onBulkRecommendLess: () => void;
  onBulkGoToArtist: () => void;
  onBulkGoToGenre: () => void;
  onEmptySelectionHint?: (message: string) => void;
  portalContainer: HTMLElement | null;
  onTriggerHaptic?: () => void;
}

export const MultiSelectActionControls: React.FC<MultiSelectActionControlsProps> = ({
  selectedCount,
  allSelectedFavorited,
  viewingArchived,
  onBulkDelete,
  onBulkToggleFavorite,
  onBulkAddToCollection,
  onBulkArchiveOrRestore,
  onBulkRecommendLess,
  onBulkGoToArtist,
  onBulkGoToGenre,
  onEmptySelectionHint,
  portalContainer,
  onTriggerHaptic,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [overflowOpen, setOverflowOpen] = useState(false);
  const { menuRef: overflowMenuRef, handleMenuKeyDown: handleOverflowMenuKeyDown } =
    useMenuKeyboardNav(overflowOpen, () => setOverflowOpen(false));
  const hasSelection = selectedCount > 0;

  useEffect(() => {
    if (!hasSelection && overflowOpen) {
      setOverflowOpen(false);
    }
  }, [hasSelection, overflowOpen]);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.14 }
          : { type: 'spring', bounce: 0, duration: 0.24 }
      }
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(var(--safe-bottom)+12px)] md:pb-6 pt-12 bg-gradient-to-t from-black via-black/78 to-transparent"
    >
      {/* Floating glass capsule matching reference layout: Delete | N Selected | Add to Playlist | More (...) */}
      <div className="pointer-events-auto glass-pill flex w-full max-w-[366px] items-center justify-between gap-2 rounded-full p-[7px] shadow-[0_14px_38px_rgba(0,0,0,0.68)]">
        {/* 1. Circular Delete button — white at 0 selected, red at >= 1 selected */}
        <button
          type="button"
          onClick={onBulkDelete}
          aria-label={
            hasSelection
              ? `Delete ${selectedCount} selected ${selectedCount === 1 ? 'song' : 'songs'}`
              : 'Delete selected songs'
          }
          className={cn(
            'pressable-strong flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.11] cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]',
            hasSelection ? 'text-[var(--accent-red)]' : 'text-white'
          )}
        >
          <Trash2 size={20} {...UI_ICON_PROPS} />
        </button>

        {/* 2. Center live count pill */}
        <div
          role="status"
          aria-live="polite"
          className="flex h-[44px] min-w-[118px] flex-1 items-center justify-center rounded-full bg-white/[0.08] px-4 text-[14.5px] font-semibold tracking-[-0.01em] text-white tabular-nums select-none"
        >
          {selectedCount} Selected
        </div>

        {/* 3. Circular Add to Playlist button */}
        <button
          type="button"
          onClick={onBulkAddToCollection}
          aria-label="Add selected songs to Playlist"
          className={cn(
            'pressable-strong flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.11] cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]',
            hasSelection ? 'text-white' : 'text-white/75'
          )}
        >
          <ListPlus size={20} {...UI_ICON_PROPS} />
        </button>

        {/* 4. Circular Overflow (...) button opening upward-anchored Radix Popover */}
        <Popover
          open={overflowOpen}
          onOpenChange={(next) => {
            if (next && !hasSelection) {
              onTriggerHaptic?.();
              onEmptySelectionHint?.('Select songs for more actions');
              return;
            }
            setOverflowOpen(next);
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={() => onTriggerHaptic?.()}
              aria-label="More bulk actions"
              aria-haspopup="menu"
              aria-expanded={overflowOpen}
              className={cn(
                'pressable-strong flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white/[0.06] hover:bg-white/[0.11] cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]',
                hasSelection ? 'text-white' : 'text-white/75'
              )}
            >
              <MoreHorizontal size={20} {...UI_ICON_PROPS} />
            </button>
          </PopoverTrigger>

          <AnimatePresence>
            {overflowOpen && (
              <PopoverPortal forceMount container={portalContainer ?? undefined}>
                <PopoverContent
                  asChild
                  forceMount
                  useOwnPortal={false}
                  side="top"
                  align="end"
                  sideOffset={14}
                  className="z-[60] w-[248px] origin-bottom-right"
                >
                  <motion.div
                    ref={overflowMenuRef}
                    onKeyDown={handleOverflowMenuKeyDown}
                    role="menu"
                    aria-label="Selected songs actions"
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.94, y: 8 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.95, y: 6 }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0.12 }
                        : { type: 'spring', bounce: 0, duration: 0.22 }
                    }
                    className="glass-popover overflow-hidden rounded-[20px] py-1.5 text-[15px] font-medium text-white shadow-[0_18px_48px_rgba(0,0,0,0.72)]"
                  >
                    {/* Smart Liked Songs Heart toggle */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOverflowOpen(false);
                        onBulkToggleFavorite();
                      }}
                      className="pressable flex min-h-[44px] w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                    >
                      <Heart
                        size={18}
                        {...UI_ICON_PROPS}
                        className={cn(
                          'shrink-0',
                          allSelectedFavorited
                            ? 'fill-[var(--player-accent)] text-[var(--player-accent)]'
                            : 'fill-transparent text-white/85'
                        )}
                      />
                      <span>
                        {allSelectedFavorited
                          ? 'Remove from Liked Songs'
                          : 'Add to Liked Songs'}
                      </span>
                    </button>

                    <div role="separator" className="mx-3 h-px bg-[var(--border-divider)]" />

                    {/* Archive / Restore */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOverflowOpen(false);
                        onBulkArchiveOrRestore();
                      }}
                      className="pressable flex min-h-[44px] w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                    >
                      {viewingArchived ? (
                        <ArchiveRestore
                          size={18}
                          {...UI_ICON_PROPS}
                          className="shrink-0 text-white/85"
                        />
                      ) : (
                        <Archive
                          size={18}
                          {...UI_ICON_PROPS}
                          className="shrink-0 text-white/85"
                        />
                      )}
                      <span>
                        {viewingArchived ? 'Restore from Archive' : 'Add to Archive'}
                      </span>
                    </button>

                    <div role="separator" className="mx-3 h-px bg-[var(--border-divider)]" />

                    {/* Recommend Less Like This (opens lightweight confirmation) */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOverflowOpen(false);
                        onBulkRecommendLess();
                      }}
                      className="pressable flex min-h-[44px] w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                    >
                      <ThumbsDown
                        size={18}
                        {...UI_ICON_PROPS}
                        className="shrink-0 text-white/85"
                      />
                      <span className="leading-[1.2]">Recommend Less Like This</span>
                    </button>

                    <div role="separator" className="mx-3 h-px bg-[var(--border-divider)]" />

                    {/* Context-sensitive Go to Artist */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOverflowOpen(false);
                        onBulkGoToArtist();
                      }}
                      className="pressable flex min-h-[44px] w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                    >
                      <UserCircle2
                        size={18}
                        {...UI_ICON_PROPS}
                        className="shrink-0 text-white/85"
                      />
                      <span>Go to Artist</span>
                    </button>

                    <div role="separator" className="mx-3 h-px bg-[var(--border-divider)]" />

                    {/* Context-sensitive Go to Genre */}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setOverflowOpen(false);
                        onBulkGoToGenre();
                      }}
                      className="pressable flex min-h-[44px] w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]"
                    >
                      <Layers
                        size={18}
                        {...UI_ICON_PROPS}
                        className="shrink-0 text-white/85"
                      />
                      <span>Go to Genre</span>
                    </button>
                  </motion.div>
                </PopoverContent>
              </PopoverPortal>
            )}
          </AnimatePresence>
        </Popover>
      </div>
    </motion.div>
  );
};
