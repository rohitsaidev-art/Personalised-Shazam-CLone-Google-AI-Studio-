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
  onSelectSong?: (song: Song) => void;
  onToggleSelect: (songId: string) => void;
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
  onSelectSong,
  onToggleSelect,
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

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('[data-song-more-btn="true"]')) {
      return;
    }

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

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startPosRef.current) return;
    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);
    if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) {
      clearLongPress();
    }
  };

  const handlePointerUp = () => clearLongPress();
  const handlePointerCancel = () => clearLongPress();

  const activateCard = () => {
    if (isMultiSelectMode) {
      onTriggerHaptic?.();
      onToggleSelect(song.id);
    } else if (onSelectSong) {
      onTriggerHaptic?.();
      onSelectSong(song);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-song-more-btn="true"]')) {
      return;
    }
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    activateCard();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateCard();
    } else if (
      !isMultiSelectMode &&
      (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10'))
    ) {
      e.preventDefault();
      onTriggerHaptic?.();
      openMenuForCard();
    }
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMultiSelectMode) return;
    e.preventDefault();
    clearLongPress();
    onTriggerHaptic?.();
    openMenuForCard();
  };

  const handleMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isMultiSelectMode) {
      onToggleSelect(song.id);
      return;
    }
    onTriggerHaptic?.();
    openMenuForCard();
  };

  return (
    <div className="flex items-center">
      <AnimatePresence initial={false}>
        {isMultiSelectMode && (
          <motion.button
            key="select-radio"
            type="button"
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
            aria-label={isSelected ? `Deselect ${song.title}` : `Select ${song.title}`}
            aria-pressed={isSelected}
            className="pressable-strong flex h-[44px] shrink-0 items-center justify-start overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] rounded-full"
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
          </motion.button>
        )}
      </AnimatePresence>

      <div
        ref={cardRef}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        role={isMultiSelectMode ? 'checkbox' : 'button'}
        aria-checked={isMultiSelectMode ? isSelected : undefined}
        aria-label={
          isMultiSelectMode
            ? `${song.title} by ${song.artist}`
            : `Play ${song.title} by ${song.artist}`
        }
        className={cn(
          'card-surface relative flex min-w-0 flex-1 items-center gap-[12px] rounded-[22px] p-[10px] select-none transition-transform duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-black',
          isPressing && !prefersReducedMotion && 'scale-[0.978] bg-[var(--surface-card-pressed)]',
          isMultiSelectMode &&
            isSelected &&
            'border-[var(--accent-blue)]/45 bg-[#181D27]'
        )}
      >
        <AlbumCover
          artwork={song.artwork}
          seedKey={song.id}
          titleHint={song.title}
          size={70}
          showPlayOverlay
          rounded="md"
        />

        {/* Optically centered vertical stack so 1-line and 2-line titles share balanced gravity */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-[3px] pr-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold leading-[1.22] tracking-[-0.012em] text-white line-clamp-2">
                <span>{song.title}</span>
                {song.explicit && <ExplicitBadge />}
              </h3>
              <p className="mt-[2px] truncate text-[13px] leading-[1.3] text-[var(--text-secondary)]">
                {song.artist}
              </p>
            </div>

            <button
              type="button"
              data-song-more-btn="true"
              onClick={handleMoreClick}
              aria-label={`Actions for ${song.title}`}
              className="hit-target-44 pressable -mr-1.5 -mt-1 flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-white/75 hover:bg-white/[0.08] hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
            >
              <MoreHorizontal size={18} {...UI_ICON_PROPS} />
            </button>
          </div>

          <div className="mt-[2px] flex items-center gap-1.5 text-[11.5px] leading-[1.25] tracking-[0.005em] text-[var(--text-tertiary)] tabular-nums">
            <span className="truncate">{formatSongTimestamp(song.foundAt)}</span>
            {isFavorite && (
              <Heart
                size={11.5}
                {...UI_ICON_PROPS}
                aria-label="Favourited"
                className="shrink-0 fill-[var(--player-accent)] text-[var(--player-accent)]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
