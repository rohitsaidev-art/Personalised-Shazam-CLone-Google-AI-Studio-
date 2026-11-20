import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Heart,
  ListPlus,
  Music,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
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
import { Song } from '../types/music';
import { formatDuration, getSongDurationSeconds } from '../data/playlists';
import { AlbumCover } from './ProceduralArtwork';
import { TRANSPORT_ICON_PROPS, UI_ICON_PROPS } from '../lib/iconConfig';
import { useSheetDrag } from '../lib/useSheetDrag';
import { cn } from '../lib/utils';

interface MusicPlayerSheetProps {
  open: boolean;
  song: Song | null;
  isPlaying: boolean;
  isShuffled: boolean;
  isFavorite: boolean;
  isInAnyPlaylist: boolean;
  elapsedSeconds: number;
  onClose: () => void;
  onTogglePlay: () => void;
  onToggleShuffle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onToggleFavorite: (songId: string) => void;
  onOpenPlaylistPicker: () => void;
  portalContainer: HTMLElement | null;
  onTriggerHaptic?: () => void;
}

export const MusicPlayerSheet: React.FC<MusicPlayerSheetProps> = ({
  open,
  song,
  isPlaying,
  isShuffled,
  isFavorite,
  isInAnyPlaylist,
  elapsedSeconds,
  onClose,
  onTogglePlay,
  onToggleShuffle,
  onPrevious,
  onNext,
  onSeek,
  onToggleFavorite,
  onOpenPlaylistPicker,
  portalContainer,
  onTriggerHaptic,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubSeconds, setScrubSeconds] = useState(0);

  const { prefersReducedMotion, startDrag, sheetMotionDragProps } = useSheetDrag({
    onDismiss: onClose,
    thresholdPx: 105,
    projectedThresholdPx: 175,
    elasticTop: 0.04,
    elasticBottom: 0.52,
    onTriggerHaptic,
  });

  const durationSeconds = song ? getSongDurationSeconds(song.id) : 180;
  const displayedElapsed = isScrubbing
    ? scrubSeconds
    : Math.min(elapsedSeconds, durationSeconds);
  const progressRatio =
    durationSeconds > 0
      ? Math.min(1, Math.max(0, displayedElapsed / durationSeconds))
      : 0;

  useEffect(() => {
    setIsScrubbing(false);
  }, [song?.id, open]);

  const computeTimeFromClientX = useCallback(
    (clientX: number): number => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return 0;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      return ratio * durationSeconds;
    },
    [durationSeconds]
  );

  const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const nextSec = computeTimeFromClientX(e.clientX);
    setIsScrubbing(true);
    setScrubSeconds(nextSec);
    onTriggerHaptic?.();
  };

  const handleSliderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    setScrubSeconds(computeTimeFromClientX(e.clientX));
  };

  const handleSliderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    const finalSec = computeTimeFromClientX(e.clientX);
    setIsScrubbing(false);
    onSeek(finalSec);
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onSeek(Math.min(durationSeconds, displayedElapsed + 5));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onSeek(Math.max(0, displayedElapsed - 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      onSeek(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      onSeek(durationSeconds);
    }
  };

  // Ambient artwork wash tinted from cover palette, held behind a bottom-weighted contrast veil
  const ambientTintPrimary = song?.artwork?.primary ?? '#151922';
  const ambientTintSecondary = song?.artwork?.secondary ?? '#222836';

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
                transition={{ duration: 0.22 }}
                className="absolute inset-0 z-40 bg-black/72 backdrop-blur-[8px]"
              />
            </DialogOverlay>

            <DialogContent asChild forceMount>
              <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
                animate={prefersReducedMotion ? { opacity: 1 } : { y: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { y: '100%' }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0.2 }
                    : { type: 'spring', bounce: 0, duration: 0.36 }
                }
                {...sheetMotionDragProps}
                className="absolute inset-x-0 bottom-0 top-0 md:top-[44px] z-50 flex flex-col overflow-hidden bg-[var(--player-bg)] md:rounded-t-[32px] border-t border-[var(--player-border)] shadow-[0_-24px_64px_rgba(0,0,0,0.86)] select-none"
              >
                {/* Screen reader context only */}
                <DialogTitle className="sr-only">
                  {song.title} by {song.artist}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Playback controls, favorites, and playlist actions for {song.title}
                </DialogDescription>

                {/* Rebalanced artwork-derived ambient wash */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 transition-colors duration-500"
                  style={{
                    background: `radial-gradient(ellipse 118% 58% at 50% 18%, ${ambientTintSecondary} 0%, ${ambientTintPrimary} 44%, #090A0E 86%)`,
                    opacity: 0.52,
                  }}
                />
                {/* Bottom-weighted charcoal veil guaranteeing WCAG AA contrast on lower controls */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#08090C]/28 via-[#0A0B0F]/68 to-[#090A0E]"
                />

                {/* Foreground Layout */}
                <div className="relative z-10 flex h-full flex-col justify-between overflow-y-auto no-scrollbar px-6 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+28px)] md:pb-8">
                  {/* Dedicated Drag Region 1: Sheet Grabber + Top Dismiss Affordance */}
                  <div
                    onPointerDown={startDrag}
                    className="shrink-0 touch-none cursor-grab active:cursor-grabbing"
                  >
                    <div
                      aria-hidden="true"
                      className="mx-auto mb-2 h-[4.5px] w-[40px] rounded-full bg-white/30"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          onTriggerHaptic?.();
                          onClose();
                        }}
                        aria-label="Close Player"
                        className="player-control-surface pressable-strong flex h-[44px] w-[44px] items-center justify-center rounded-full text-[var(--player-text-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--player-accent)]"
                      >
                        <X size={20} {...UI_ICON_PROPS} />
                      </button>
                    </div>
                  </div>

                  {/* Dedicated Drag Region 2: Main Visual Anchor — Large Square Album Artwork */}
                  <div
                    onPointerDown={startDrag}
                    className="my-auto flex items-center justify-center py-2.5 touch-none"
                  >
                    <motion.div
                      key={song.id}
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0.78 }
                          : { opacity: 0.88, scale: 0.94 }
                      }
                      animate={{
                        opacity: 1,
                        scale: prefersReducedMotion ? 1 : isPlaying ? 1 : 0.93,
                      }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.36 }}
                      className="w-[min(100%,324px,40dvh)] aspect-square rounded-[22px] overflow-hidden bg-[var(--surface-card)] shadow-[0_24px_56px_rgba(0,0,0,0.66)]"
                    >
                      {song.artwork ? (
                        <AlbumCover
                          artwork={song.artwork}
                          seedKey={song.id}
                          titleHint={song.title}
                          size={512}
                          rounded="lg"
                          className="!h-full !w-full !rounded-[22px]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[var(--surface-elevated)] text-[var(--player-text-tertiary)]">
                          <Music size={56} strokeWidth={1.5} />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Lower Interactive Stack — guarded so controls/scrubber never trigger sheet drag */}
                  <div
                    data-no-sheet-drag="true"
                    className="shrink-0 flex flex-col gap-[clamp(14px,2.4dvh,22px)]"
                  >
                    {/* Strictly 2 Metadata Lines (Track Title + Artist) + Pink-Red Heart Toggle */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-2 text-[24px] font-bold leading-[1.18] tracking-[-0.024em] text-[var(--player-text-primary)]">
                          {song.title}
                        </h2>
                        <p className="mt-1 truncate text-[16px] font-normal leading-[1.3] tracking-[-0.01em] text-[var(--player-text-secondary)]">
                          {song.artist}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onTriggerHaptic?.();
                          onToggleFavorite(song.id);
                        }}
                        aria-label={
                          isFavorite ? 'Remove from Favorites' : 'Add to Favorites'
                        }
                        aria-pressed={isFavorite}
                        className={cn(
                          'pressable-strong flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--player-accent)]',
                          isFavorite
                            ? 'bg-[var(--player-accent-soft)] border border-[var(--player-accent-border)] text-[var(--player-accent)]'
                            : 'player-control-surface text-[var(--player-text-primary)]'
                        )}
                      >
                        <motion.span
                          key={isFavorite ? 'fav-on' : 'fav-off'}
                          initial={prefersReducedMotion ? false : { scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.28 }}
                          className="flex items-center justify-center"
                        >
                          <Heart
                            size={20}
                            {...UI_ICON_PROPS}
                            className={cn(
                              'transition-colors duration-150',
                              isFavorite
                                ? 'fill-[var(--player-accent)] text-[var(--player-accent)]'
                                : 'fill-transparent text-[var(--player-text-primary)]'
                            )}
                          />
                        </motion.span>
                      </button>
                    </div>

                    {/* Playback Progress Slider (Pink-Red Fill, 44px touch target + keyboard focus ring) */}
                    <div className="flex flex-col">
                      <div
                        ref={trackRef}
                        role="slider"
                        tabIndex={0}
                        aria-label="Playback Progress"
                        aria-valuemin={0}
                        aria-valuemax={durationSeconds}
                        aria-valuenow={Math.round(displayedElapsed)}
                        aria-valuetext={`${formatDuration(displayedElapsed)} of ${formatDuration(durationSeconds)}`}
                        onPointerDown={handleSliderPointerDown}
                        onPointerMove={handleSliderPointerMove}
                        onPointerUp={handleSliderPointerUp}
                        onPointerCancel={() => setIsScrubbing(false)}
                        onKeyDown={handleSliderKeyDown}
                        className="relative -my-2 flex h-[44px] w-full items-center rounded-lg cursor-pointer touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--player-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--player-bg)]"
                      >
                        {/* Track Rail */}
                        <div className="relative h-[4px] w-full rounded-full bg-[var(--player-track-rail)] overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-[var(--player-accent)]"
                            style={{ width: `${progressRatio * 100}%` }}
                          />
                        </div>

                        {/* Scrubber Thumb */}
                        <div
                          className={cn(
                            'pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.55)] transition-transform duration-150',
                            isScrubbing ? 'h-[15px] w-[15px] scale-110' : 'h-[12px] w-[12px]'
                          )}
                          style={{ left: `${progressRatio * 100}%` }}
                        />
                      </div>

                      {/* Elapsed Time & Total Duration */}
                      <div className="mt-0.5 flex items-center justify-between text-[12px] font-medium tracking-[0.01em] text-[var(--player-text-tertiary)] tabular-nums">
                        <span>{formatDuration(displayedElapsed)}</span>
                        <span>{formatDuration(durationSeconds)}</span>
                      </div>
                    </div>

                    {/* Transport Controls — Shuffle | Previous | Play/Pause | Next */}
                    <div className="flex items-center justify-between px-1">
                      {/* 1. Shuffle (Pink-Red active state with fill, border, dot & aria-pressed) */}
                      <button
                        type="button"
                        onClick={() => {
                          onTriggerHaptic?.();
                          onToggleShuffle();
                        }}
                        aria-label={isShuffled ? 'Shuffle On' : 'Shuffle'}
                        aria-pressed={isShuffled}
                        className={cn(
                          'pressable-strong relative flex h-[44px] w-[44px] items-center justify-center rounded-full transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--player-accent)]',
                          isShuffled
                            ? 'bg-[var(--player-accent-soft)] border border-[var(--player-accent-border)] text-[var(--player-accent)]'
                            : 'player-control-surface text-[var(--player-text-secondary)] hover:text-[var(--player-text-primary)]'
                        )}
                      >
                        <Shuffle size={19} {...UI_ICON_PROPS} />
                        {isShuffled && (
                          <span
                            aria-hidden="true"
                            className="absolute -bottom-1.5 h-[4px] w-[4px] rounded-full bg-[var(--player-accent)]"
                          />
                        )}
                      </button>

                      {/* 2. Previous Track */}
                      <button
                        type="button"
                        onClick={() => {
                          onTriggerHaptic?.();
                          onPrevious();
                        }}
                        aria-label="Previous Track"
                        className="pressable-strong flex h-[48px] w-[48px] items-center justify-center rounded-full text-[var(--player-text-primary)]/90 hover:text-[var(--player-text-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--player-accent)]"
                      >
                        <SkipBack size={26} {...TRANSPORT_ICON_PROPS} className="fill-current" />
                      </button>

                      {/* 3. Dominant Play / Pause */}
                      <button
                        type="button"
                        onClick={() => {
                          onTriggerHaptic?.();
                          onTogglePlay();
                        }}
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                        className="pressable-strong flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white text-[#0A0B0E] shadow-[0_10px_28px_rgba(0,0,0,0.48)] hover:bg-white/95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--player-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--player-bg)]"
                      >
                        {isPlaying ? (
                          <Pause size={28} {...TRANSPORT_ICON_PROPS} className="fill-current" />
                        ) : (
                          <Play
                            size={28}
                            {...TRANSPORT_ICON_PROPS}
                            className="translate-x-[2px] fill-current"
                          />
                        )}
                      </button>

                      {/* 4. Next Track */}
                      <button
                        type="button"
                        onClick={() => {
                          onTriggerHaptic?.();
                          onNext();
                        }}
                        aria-label="Next Track"
                        className="pressable-strong flex h-[48px] w-[48px] items-center justify-center rounded-full text-[var(--player-text-primary)]/90 hover:text-[var(--player-text-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--player-accent)]"
                      >
                        <SkipForward size={26} {...TRANSPORT_ICON_PROPS} className="fill-current" />
                      </button>

                      {/* Optical balancing spacer keeping Play/Pause centered beneath square artwork */}
                      <div className="h-[44px] w-[44px] shrink-0" aria-hidden="true" />
                    </div>

                    {/* Add to Playlist Action */}
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerHaptic?.();
                        onOpenPlaylistPicker();
                      }}
                      className={cn(
                        'pressable flex h-[50px] w-full items-center justify-center gap-2.5 rounded-full text-[15.5px] font-semibold tracking-[-0.01em] text-[var(--player-text-primary)] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--player-accent)]',
                        isInAnyPlaylist
                          ? 'bg-[var(--player-accent-soft)] border border-[var(--player-accent-border)]'
                          : 'player-control-surface'
                      )}
                    >
                      <ListPlus
                        size={20}
                        {...UI_ICON_PROPS}
                        className={
                          isInAnyPlaylist
                            ? 'text-[var(--player-accent)]'
                            : 'text-[var(--player-text-primary)]/90'
                        }
                      />
                      <span>Add to Playlist</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </DialogContent>
          </DialogPortal>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
