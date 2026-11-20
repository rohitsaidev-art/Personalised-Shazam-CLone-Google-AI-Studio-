import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ListMusic, Minus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from './ui/dialog';
import { Playlist } from '../data/playlists';
import { Song } from '../types/music';
import { CHECK_ICON_PROPS, UI_ICON_PROPS } from '../lib/iconConfig';
import { useSheetDrag } from '../lib/useSheetDrag';
import { cn } from '../lib/utils';

interface PlaylistPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetSongs: Song[];
  playlists: Playlist[];
  onToggleSongsInPlaylist: (playlistId: string, songIds: string[]) => void;
  portalContainer: HTMLElement | null;
  onTriggerHaptic?: () => void;
}

export const PlaylistPickerSheet: React.FC<PlaylistPickerSheetProps> = ({
  open,
  onOpenChange,
  targetSongs,
  playlists,
  onToggleSongsInPlaylist,
  portalContainer,
  onTriggerHaptic,
}) => {
  const { prefersReducedMotion, startDrag, sheetMotionDragProps } = useSheetDrag({
    onDismiss: () => onOpenChange(false),
    thresholdPx: 85,
    projectedThresholdPx: 150,
    elasticTop: 0.06,
    elasticBottom: 0.48,
    onTriggerHaptic,
  });

  const targetSongIds = targetSongs.map((s) => s.id);
  const subtitle =
    targetSongs.length === 1
      ? `${targetSongs[0].title} — ${targetSongs[0].artist}`
      : `${targetSongs.length} selected songs`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && targetSongs.length > 0 && (
          <DialogPortal forceMount container={portalContainer}>
            <DialogOverlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 z-[60] bg-black/65 backdrop-blur-[6px]"
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
                className="absolute inset-x-0 bottom-0 z-[70] flex flex-col rounded-t-[32px] bg-[var(--surface-sheet)] border-t border-[var(--border-glass)] px-4 pt-2.5 pb-[calc(var(--safe-bottom)+24px)] md:pb-8 shadow-[0_-20px_54px_rgba(0,0,0,0.85)]"
              >
                {/* Dedicated Drag Region: Sheet Grabber + Header */}
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

                  {/* Header */}
                  <div className="relative flex items-center justify-center pb-3.5">
                    <button
                      type="button"
                      onClick={() => onOpenChange(false)}
                      aria-label="Close Playlist Picker"
                      className="glass-circle hit-target-44 pressable-strong absolute left-0 flex h-[38px] w-[38px] items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                    >
                      <X size={18} {...UI_ICON_PROPS} />
                    </button>

                    <DialogTitle className="text-[16.5px] font-semibold tracking-[-0.015em] text-white">
                      Add to Playlist
                    </DialogTitle>
                  </div>
                </div>

                <DialogDescription className="mb-4 truncate px-4 text-center text-[13px] text-[var(--text-secondary)]">
                  {subtitle}
                </DialogDescription>

                {/* Existing Local Playlists */}
                <div
                  data-no-sheet-drag="true"
                  className="overflow-hidden rounded-[20px] bg-[var(--surface-elevated)] border border-[var(--border-hairline)]"
                >
                  {playlists.map((playlist, idx) => {
                    const includedCount = targetSongIds.filter((id) =>
                      playlist.songIds.includes(id)
                    ).length;
                    const allIncluded =
                      targetSongIds.length > 0 && includedCount === targetSongIds.length;
                    const partiallyIncluded =
                      includedCount > 0 && includedCount < targetSongIds.length;
                    const count = playlist.songIds.length;

                    return (
                      <React.Fragment key={playlist.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onTriggerHaptic?.();
                            onToggleSongsInPlaylist(playlist.id, targetSongIds);
                          }}
                          aria-pressed={allIncluded ? true : partiallyIncluded ? 'mixed' : false}
                          className="pressable flex min-h-[58px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--surface-elevated-hover)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-blue)]"
                        >
                          <span
                            className={cn(
                              'flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] border transition-colors duration-150',
                              allIncluded || partiallyIncluded
                                ? 'bg-[var(--accent-blue-soft)] border-[var(--accent-blue-border)] text-[var(--accent-blue)]'
                                : 'bg-white/[0.06] border-[var(--border-hairline)] text-white/75'
                            )}
                          >
                            <ListMusic size={18} {...UI_ICON_PROPS} />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-medium tracking-[-0.01em] text-white">
                              {playlist.name}
                            </p>
                            <p className="text-[12px] text-[var(--text-tertiary)] tabular-nums">
                              {count} {count === 1 ? 'song' : 'songs'}
                              {partiallyIncluded && targetSongs.length > 1
                                ? ` · ${includedCount} of ${targetSongs.length} already added`
                                : ''}
                            </p>
                          </div>

                          <span
                            className={cn(
                              'flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full border transition-all duration-150',
                              allIncluded
                                ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)] text-white'
                                : partiallyIncluded
                                  ? 'border-[var(--accent-blue)] bg-[var(--accent-blue-soft)] text-[var(--accent-blue)]'
                                  : 'border-white/25 bg-transparent'
                            )}
                          >
                            {allIncluded && <Check size={13} {...CHECK_ICON_PROPS} />}
                            {partiallyIncluded && <Minus size={13} {...CHECK_ICON_PROPS} />}
                          </span>
                        </button>
                        {idx < playlists.length - 1 && (
                          <div className="mx-4 h-px bg-[var(--border-divider)]" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
