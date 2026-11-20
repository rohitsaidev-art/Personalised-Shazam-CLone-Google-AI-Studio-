import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Heart, MoreHorizontal } from 'lucide-react';
import { Song } from '../types/music';
import { formatSongTimestamp } from '../data/songs';
import { AlbumCover } from './ProceduralArtwork';
import { ExplicitBadge } from './ShazamIcons';
import { CHECK_ICON_PROPS, UI_ICON_PROPS } from '../lib/iconConfig';
import { cn } from '../lib/utils';

interface SongCardProps {
  song: Song;
  isMultiSelectMode: boolean;
  isSelected: boolean;
  isFavorite?: boolean;
  isActiveTrack?: boolean;
  isPlaying?: boolean;
  onSelectSong?: (song: Song) => void;
  onToggleSelect: (songId: string) => void;
  onToggleFavorite?: (songId: string) => void;
  onOpenActionMenu: (song: Song, cardRect: DOMRect) => void;
  onTriggerHaptic?: () => void;
}

const LONG_PRESS_MS = 420;
const MOVE_CANCEL_PX = 10;

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isMultiSelectMode,
  isSelected,
  isFavorite = false,
  isActiveTrack = false,
  isPlaying = false,
  onSelectSong,
  onToggleSelect,
  onToggleFavorite,
  onOpenActionMenu,
  onTriggerHaptic,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const didLongPressRef = useRef(false);
  const [isPressing, setIsPressing] = useState(false);

  const clearLongPress = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
    startPosRef.current = null;
  };

  const openMenuForCard = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      onOpenActionMenu(song, rect);
    }
  };

  const handlePrimaryPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    didLongPressRef.current = false;
    setIsPressing(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };

    if (!isMultiSelectMode) {
      timerRef.current = window.setTimeout(() => {
        didLongPressRef.current = true;
        setIsPressing(false);
        onTriggerHaptic?.();
        openMenuForCard();
      }, LONG_PRESS_MS);
    }
  };

  const handlePrimaryPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!startPosRef.current) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) {
      clearLongPress();
    }
  };

  const handlePrimaryPointerUp = () => clearLongPress();
  const handlePrimaryPointerCancel = () => clearLongPress();

  const activateCard = () => {
    if (isMultiSelectMode) {
      onTriggerHaptic?.();
      onToggleSelect(song.id);
    } else if (onSelectSong) {
      onTriggerHaptic?.();
      onSelectSong(song);
    }
  };

  const handlePrimaryClick = () => {
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    activateCard();
  };

  const handlePrimaryKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (
      !isMultiSelectMode &&
      (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10'))
    ) {
      e.preventDefault();
      onTriggerHaptic?.();
      openMenuForCard();
    }
  };

  const handlePrimaryContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMultiSelectMode) return;
    e.preventDefault();
    clearLongPress();
    onTriggerHaptic?.();
    openMenuForCard();
  };

  const handleMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isMultiSelectMode) {
      onTriggerHaptic?.();
      onToggleSelect(song.id);
      return;
    }
    onTriggerHaptic?.();
    openMenuForCard();
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onTriggerHaptic?.();
    if (isMultiSelectMode) {
      onToggleSelect(song.id);
      return;
    }
    onToggleFavorite?.(song.id);
  };

  return (
    <div className="flex items-center">
      {/* Visual multi-select radio indicator — clickable on touch, single semantic checkbox lives on card's primary button */}
      <AnimatePresence initial={false}>
        {isMultiSelectMode && (
          <motion.div
            key="select-radio"
            aria-hidden="true"
            initial={
              prefersReducedMotion
                ? { opacity: 0, width: 38 }
                : { opacity: 0, width: 0, scale: 0.75 }
            }
            animate={{ opacity: 1, width: 38, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0, width: 0 }
                : { opacity: 0, width: 0, scale: 0.75 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.12 }
                : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
            }
            onClick={() => {
              onTriggerHaptic?.();
              onToggleSelect(song.id);
            }}
            className="pressable-strong flex h-[44px] shrink-0 items-center justify-start overflow-hidden cursor-pointer"
          >
            <span
              className={cn(
                'flex h-[22px] w-[22px] items-center justify-center rounded-full border transition-colors duration-150',
                isSelected
                  ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)] text-white'
                  : 'border-white/38 bg-transparent'
              )}
            >
              {isSelected && <Check size={13} {...CHECK_ICON_PROPS} />}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-interactive card surface with stretched primary sibling <button> (zero nested interactive roles) */}
      <div
        ref={cardRef}
        className={cn(
          'card-surface relative flex min-w-0 flex-1 items-center gap-[12px] rounded-[22px] p-[12px] md:p-[10px] select-none transition-transform duration-150 ease-out',
          isPressing &&
            !prefersReducedMotion &&
            'scale-[0.978] bg-[var(--surface-card-pressed)]',
          isMultiSelectMode &&
            isSelected &&
            'border-[var(--accent-blue)]/45 bg-[#181D27]',
          !isMultiSelectMode &&
            isActiveTrack &&
            'border-[var(--accent-blue)]/35 bg-[#161922]'
        )}
      >
        {/* Stretched primary sibling button handles tap, long-press, right-click, and keyboard activation */}
        <button
          type="button"
          role={isMultiSelectMode ? 'checkbox' : undefined}
          aria-checked={isMultiSelectMode ? isSelected : undefined}
          aria-label={
            isMultiSelectMode
              ? `${isSelected ? 'Deselect' : 'Select'} ${song.title} by ${song.artist}`
              : `Play ${song.title} by ${song.artist}`
          }
          onPointerDown={handlePrimaryPointerDown}
          onPointerMove={handlePrimaryPointerMove}
          onPointerUp={handlePrimaryPointerUp}
          onPointerLeave={handlePrimaryPointerCancel}
          onPointerCancel={handlePrimaryPointerCancel}
          onClick={handlePrimaryClick}
          onKeyDown={handlePrimaryKeyDown}
          onContextMenu={handlePrimaryContextMenu}
          className="absolute inset-0 z-0 rounded-[22px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-black"
        />

        {/* Responsive Cover: 76px on mobile for balanced iPhone density, 70px inside desktop preview */}
        <div className="pointer-events-none relative z-[1] h-[76px] w-[76px] md:h-[70px] md:w-[70px] shrink-0">
          <AlbumCover
            artwork={song.artwork}
            seedKey={song.id}
            titleHint={song.title}
            size={76}
            showPlayOverlay={!isActiveTrack}
            rounded="md"
            className="!h-full !w-full"
          />

          {/* Active-track subtle 3-bar equalizer badge */}
          {isActiveTrack && (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-black/45"
            >
              <div className="flex h-[28px] w-[28px] items-end justify-center gap-[2.5px] rounded-full bg-black/60 backdrop-blur-[4px] border border-white/20 px-1.5 pb-[7px]">
                {[0, 1, 2].map((bar) => (
                  <motion.span
                    key={bar}
                    animate={
                      isPlaying && !prefersReducedMotion
                        ? {
                            height:
                              bar === 0
                                ? [5, 13, 6, 11, 5]
                                : bar === 1
                                  ? [12, 6, 14, 7, 12]
                                  : [7, 12, 5, 13, 7],
                          }
                        : { height: bar === 1 ? 11 : 7 }
                    }
                    transition={
                      isPlaying && !prefersReducedMotion
                        ? {
                            duration: 0.9 + bar * 0.14,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }
                        : { duration: 0.2 }
                    }
                    className="w-[2.5px] rounded-full bg-[var(--accent-blue)]"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Optically centered vertical stack so 1-line and 2-line titles share balanced gravity */}
        <div className="pointer-events-none relative z-[1] flex min-w-0 flex-1 flex-col justify-center gap-[3px] pr-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  'text-[16px] md:text-[15px] font-semibold leading-[1.22] tracking-[-0.012em] line-clamp-2 transition-colors duration-150',
                  isActiveTrack ? 'text-[var(--accent-blue)]' : 'text-white'
                )}
              >
                <span>{song.title}</span>
                {song.explicit && <ExplicitBadge />}
              </h3>
              <p className="mt-[2px] truncate text-[14px] md:text-[13px] leading-[1.3] text-[var(--text-secondary)]">
                {song.artist}
              </p>
            </div>

            <button
              type="button"
              onClick={handleMoreClick}
              aria-label={`Actions for ${song.title}`}
              className="pointer-events-auto relative z-10 hit-target-44 pressable -mr-1.5 -mt-1 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-white/75 hover:bg-white/[0.08] hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
            >
              <MoreHorizontal size={18} {...UI_ICON_PROPS} />
            </button>
          </div>

          <div className="mt-[2px] flex items-center justify-between gap-2 text-[12.5px] md:text-[11.5px] leading-[1.25] tracking-[0.005em] text-[var(--text-tertiary)] tabular-nums">
            <span className="min-w-0 truncate">{formatSongTimestamp(song.foundAt)}</span>

            <button
              type="button"
              onClick={handleFavoriteClick}
              aria-label={
                isFavorite
                  ? `Remove ${song.title} from Favorites`
                  : `Add ${song.title} to Favorites`
              }
              aria-pressed={isFavorite}
              className="pointer-events-auto relative z-10 hit-target-44 pressable-strong -mr-1.5 -my-1.5 flex h-[30px] w-[34px] shrink-0 items-center justify-center rounded-full hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--player-accent)]"
            >
              <motion.span
                key={isFavorite ? 'liked' : 'unliked'}
                initial={prefersReducedMotion ? false : { scale: 0.78 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.26 }}
                className="flex items-center justify-center"
              >
                <Heart
                  size={16}
                  {...UI_ICON_PROPS}
                  className={cn(
                    'transition-colors duration-150',
                    isFavorite
                      ? 'fill-[var(--player-accent)] text-[var(--player-accent)]'
                      : 'fill-transparent text-white/45 hover:text-white/75'
                  )}
                />
              </motion.span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
