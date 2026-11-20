import React, { useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Archive,
  ArchiveRestore,
  CheckSquare,
  Flag,
  Layers,
  Share,
  ThumbsDown,
  Trash2,
  UserCircle2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from './ui/dialog';
import { CandidateCorrection, Song } from '../types/music';
import { formatShortTimestamp, getCandidateCorrections } from '../data/songs';
import { AlbumCover } from './ProceduralArtwork';
import { UI_ICON_PROPS } from '../lib/iconConfig';
import { useMenuKeyboardNav } from '../lib/useMenuKeyboardNav';
import { useSheetDrag } from '../lib/useSheetDrag';
import { cn } from '../lib/utils';

interface SongActionMenuProps {
  song: Song | null;
  anchorRect: DOMRect | null;
  isArchived?: boolean;
  onClose: () => void;
  onSelectMode: (songId: string) => void;
  onArchiveSong: (songId: string) => void;
  onUnarchiveSong?: (songId: string) => void;
  onRecommendLess: (song: Song) => void;
  onRemoveSong: (songId: string) => void;
  onReportWrongSong: (song: Song) => void;
  onGoToArtist: (artist: string) => void;
  onGoToGenre: (genre: string) => void;
  onShareSong: (song: Song) => void;
  portalContainer: HTMLElement | null;
}

const PREVIEW_CARD_EST_H = 84;
const MENU_EST_H = 368;
const STACK_GAP = 12;
const MARGIN_TOP = 16;
const MARGIN_BOTTOM = 20;

export const SongActionMenu: React.FC<SongActionMenuProps> = ({
  song,
  anchorRect,
  isArchived = false,
  onClose,
  onSelectMode,
  onArchiveSong,
  onUnarchiveSong,
  onRecommendLess,
  onRemoveSong,
  onReportWrongSong,
  onGoToArtist,
  onGoToGenre,
  onShareSong,
  portalContainer,
}) => {
  const open = song !== null;
  const prefersReducedMotion = useReducedMotion();
  const { menuRef, handleMenuKeyDown } = useMenuKeyboardNav(open, onClose);

  // Spatially anchor preview + menu to the source card's Y offset inside MobileFrame (Board 05)
  const layoutPosition = useMemo(() => {
    const containerRect = portalContainer?.getBoundingClientRect();
    const frameHeight = containerRect?.height ?? 852;
    const computed =
      portalContainer && typeof window !== 'undefined'
        ? window.getComputedStyle(portalContainer)
        : null;
    const dynamicSafeTop = computed
      ? parseFloat(computed.getPropertyValue('--safe-top')) || 0
      : 0;
    const dynamicSafeBottom = computed
      ? parseFloat(computed.getPropertyValue('--safe-bottom')) || 0
      : 0;
    const safeTop = Math.max(MARGIN_TOP, dynamicSafeTop + MARGIN_TOP);
    const safeBottom = Math.max(MARGIN_BOTTOM, dynamicSafeBottom + MARGIN_BOTTOM);

    if (!anchorRect || !containerRect) {
      const centeredTop = Math.max(
        safeTop,
        Math.round((frameHeight - (PREVIEW_CARD_EST_H + STACK_GAP + MENU_EST_H)) / 2)
      );
      return { topPx: centeredTop, menuAbove: false };
    }

    const relativeTop = anchorRect.top - containerRect.top;
    const totalHeight = PREVIEW_CARD_EST_H + STACK_GAP + MENU_EST_H;
    const spaceBelow = frameHeight - relativeTop - PREVIEW_CARD_EST_H - safeBottom;

    if (spaceBelow >= MENU_EST_H + STACK_GAP) {
      const clampedTop = Math.max(safeTop, Math.round(relativeTop));
      return { topPx: clampedTop, menuAbove: false };
    }

    // Near bottom of viewport: place menu cleanly above the anchored preview card
    const desiredBottom = Math.min(
      frameHeight - safeBottom,
      relativeTop + PREVIEW_CARD_EST_H
    );
    const flippedTop = Math.max(safeTop, Math.round(desiredBottom - totalHeight));
    return { topPx: flippedTop, menuAbove: true };
  }, [anchorRect, portalContainer]);

  const actions = useMemo(() => {
    if (!song) return [];
    const primaryArtist = song.artists[0] ?? song.artist;
    const primaryGenre = song.genres[0] ?? 'Alternative';

    return [
      {
        id: 'select',
        label: 'Select',
        icon: CheckSquare,
        destructive: false,
        onRun: () => {
          onClose();
          onSelectMode(song.id);
        },
      },
      {
        id: isArchived ? 'unarchive' : 'archive',
        label: isArchived ? 'Unarchive' : 'Archive',
        icon: isArchived ? ArchiveRestore : Archive,
        destructive: false,
        onRun: () => {
          onClose();
          if (isArchived && onUnarchiveSong) {
            onUnarchiveSong(song.id);
          } else {
            onArchiveSong(song.id);
          }
        },
      },
      {
        id: 'recommend-less',
        label: 'Recommend Less',
        icon: ThumbsDown,
        destructive: false,
        onRun: () => {
          onClose();
          onRecommendLess(song);
        },
      },
      {
        id: 'remove',
        label: 'Remove from Library',
        icon: Trash2,
        destructive: true,
        onRun: () => {
          onClose();
          onRemoveSong(song.id);
        },
      },
      {
        id: 'wrong-song',
        label: 'Wrong Song? Tell Shazam',
        icon: Flag,
        destructive: false,
        onRun: () => {
          onClose();
          onReportWrongSong(song);
        },
      },
      {
        id: 'go-artist',
        label: 'Go to Artist',
        icon: UserCircle2,
        destructive: false,
        onRun: () => {
          onClose();
          onGoToArtist(primaryArtist);
        },
      },
      {
        id: 'go-genre',
        label: 'Go to Genre',
        icon: Layers,
        destructive: false,
        onRun: () => {
          onClose();
          onGoToGenre(primaryGenre);
        },
      },
      {
        id: 'share',
        label: 'Share',
        icon: Share,
        destructive: false,
        onRun: () => {
          onClose();
          onShareSong(song);
        },
      },
    ];
  }, [
    song,
    isArchived,
    onClose,
    onSelectMode,
    onArchiveSong,
    onUnarchiveSong,
    onRecommendLess,
    onRemoveSong,
    onReportWrongSong,
    onGoToArtist,
    onGoToGenre,
    onShareSong,
  ]);

  const previewNode = song && (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.14 }
          : { type: 'spring', bounce: 0, duration: 0.24 }
      }
      className="flex items-center gap-3 rounded-[22px] bg-[var(--surface-elevated)]/96 p-[10px] border border-[var(--border-glass)] shadow-[0_18px_42px_rgba(0,0,0,0.62),var(--highlight-specular)]"
    >
      <AlbumCover
        artwork={song.artwork}
        seedKey={song.id}
        titleHint={song.title}
        size={60}
        rounded="md"
      />
      <div className="min-w-0 flex-1 pr-1">
        <p className="truncate text-[15px] font-semibold tracking-[-0.012em] text-white">
          {song.title}
        </p>
        <p className="truncate text-[13px] text-[var(--text-secondary)]">
          {song.artist}
        </p>
        <p className="mt-0.5 truncate text-[11.5px] text-[var(--text-tertiary)] tabular-nums">
          {formatShortTimestamp(song.foundAt)}
        </p>
      </div>
    </motion.div>
  );

  const menuNode = (
    <motion.div
      ref={menuRef}
      onKeyDown={handleMenuKeyDown}
      role="menu"
      aria-label={song ? `Actions for ${song.title}` : 'Song actions'}
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: 0.92,
              y: layoutPosition.menuAbove ? 6 : -6,
            }
      }
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: 0.94,
              y: layoutPosition.menuAbove ? 4 : -4,
            }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0.14 }
          : { type: 'spring', bounce: 0, duration: 0.26 }
      }
      className={cn(
        'glass-popover w-[248px] max-h-[calc(100dvh-168px)] overflow-y-auto no-scrollbar rounded-[18px] py-1',
        layoutPosition.menuAbove ? 'origin-bottom-left' : 'origin-top-left'
      )}
    >
      {actions.map((item, idx) => {
        const Icon = item.icon;
        return (
          <React.Fragment key={item.id}>
            <button
              type="button"
              role="menuitem"
              onClick={item.onRun}
              className={cn(
                'pressable flex min-h-[44px] w-full items-center gap-3 px-4 py-2 text-left text-[15px] leading-snug hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:bg-white/[0.1]',
                item.destructive ? 'text-[var(--accent-red)]' : 'text-white'
              )}
            >
              <Icon
                size={18}
                {...UI_ICON_PROPS}
                className={cn(
                  'shrink-0',
                  item.destructive ? 'text-[var(--accent-red)]' : 'text-white/90'
                )}
              />
              <span className="font-normal tracking-[-0.01em]">{item.label}</span>
            </button>
            {idx < actions.length - 1 && (
              <div role="separator" className="mx-3.5 h-px bg-[var(--border-divider)]" />
            )}
          </React.Fragment>
        );
      })}
    </motion.div>
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AnimatePresence>
        {open && song && (
          <DialogPortal forceMount container={portalContainer}>
            <DialogOverlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 z-40 bg-black/65 backdrop-blur-[10px]"
              />
            </DialogOverlay>

            <DialogContent asChild forceMount>
              <div onClick={onClose} className="absolute inset-0 z-50 px-4">
                <DialogTitle className="sr-only">
                  Actions for {song.title}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Song contextual actions menu
                </DialogDescription>

                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ top: layoutPosition.topPx }}
                  className="absolute inset-x-4 mx-auto flex max-w-[361px] flex-col gap-3"
                >
                  {layoutPosition.menuAbove ? (
                    <>
                      {menuNode}
                      {previewNode}
                    </>
                  ) : (
                    <>
                      {previewNode}
                      {menuNode}
                    </>
                  )}
                </div>
              </div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

interface WrongSongDialogProps {
  song: Song | null;
  onClose: () => void;
  onApplyCorrection: (songId: string, candidate: CandidateCorrection) => void;
  portalContainer: HTMLElement | null;
  onTriggerHaptic?: () => void;
}

export const WrongSongDialog: React.FC<WrongSongDialogProps> = ({
  song,
  onClose,
  onApplyCorrection,
  portalContainer,
  onTriggerHaptic,
}) => {
  const open = song !== null;
  const candidates = useMemo(
    () => (song ? getCandidateCorrections(song) : []),
    [song]
  );

  const { prefersReducedMotion, startDrag, sheetMotionDragProps } = useSheetDrag({
    onDismiss: onClose,
    thresholdPx: 85,
    projectedThresholdPx: 150,
    elasticTop: 0.06,
    elasticBottom: 0.48,
    onTriggerHaptic,
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AnimatePresence>
        {open && song && (
          <DialogPortal forceMount container={portalContainer}>
            <DialogOverlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 z-40 bg-black/65 backdrop-blur-[6px]"
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
                    : { type: 'spring', bounce: 0, duration: 0.32 }
                }
                {...sheetMotionDragProps}
                className="absolute inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-[var(--surface-sheet)] border-t border-[var(--border-glass)] px-4 pt-2.5 pb-[calc(var(--safe-bottom)+24px)] md:pb-8 shadow-[0_-18px_48px_rgba(0,0,0,0.8)]"
              >
                {/* Grabber + Header Drag Region */}
                <div
                  onPointerDown={startDrag}
                  className="touch-none cursor-grab active:cursor-grabbing"
                >
                  <div className="mb-3 flex justify-center">
                    <div
                      aria-hidden="true"
                      className="h-[4px] w-[38px] rounded-full bg-white/25"
                    />
                  </div>

                  <div className="relative flex items-center justify-center pb-4">
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close mismatch correction"
                      className="glass-circle hit-target-44 pressable-strong absolute left-0 flex h-[38px] w-[38px] items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                    >
                      <X size={18} {...UI_ICON_PROPS} />
                    </button>
                    <DialogTitle className="text-[16.5px] font-semibold tracking-[-0.015em] text-white">
                      Wrong Song?
                    </DialogTitle>
                  </div>
                </div>

                <DialogDescription className="mb-4 text-center text-[13px] text-[var(--text-secondary)]">
                  Select a closer match to update{' '}
                  <span className="text-white font-medium">{song.title}</span> in your
                  library.
                </DialogDescription>

                <div className="flex flex-col gap-2.5">
                  {candidates.map((cand) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => {
                        onApplyCorrection(song.id, cand);
                        onClose();
                      }}
                      className="pressable flex min-h-[64px] items-center gap-3 rounded-[18px] bg-[var(--surface-elevated)] p-2.5 text-left border border-[var(--border-hairline)] hover:bg-[var(--surface-elevated-hover)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                    >
                      <AlbumCover
                        artwork={cand.artwork}
                        seedKey={cand.id}
                        titleHint={cand.title}
                        size={48}
                        rounded="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-semibold text-white">
                          {cand.title}
                        </p>
                        <p className="truncate text-[12.5px] text-[var(--text-secondary)]">
                          {cand.artist}
                        </p>
                      </div>
                      <span className="shrink-0 text-[13px] font-medium text-[var(--accent-blue)] pr-1.5">
                        Use
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
