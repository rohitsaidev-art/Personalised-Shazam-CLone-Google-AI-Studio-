import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Heart, SquarePlus, Trash2 } from 'lucide-react';
import { UI_ICON_PROPS } from '../lib/iconConfig';
import { cn } from '../lib/utils';

interface MultiSelectActionControlsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkFavorite: () => void;
  onBulkAddToCollection: () => void;
}

export const MultiSelectActionControls: React.FC<MultiSelectActionControlsProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkFavorite,
  onBulkAddToCollection,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const hasSelection = selectedCount > 0;

  return (
    // Subtle bottom-up gradient fade ONLY — NO enclosing toolbar/bar/card container
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0.14 }
          : { type: 'spring', bounce: 0, duration: 0.24 }
      }
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-between px-4 pb-6 pt-12 bg-gradient-to-t from-black via-black/78 to-transparent"
    >
      {/* Left: Standalone circular Delete button — WHITE at 0 selected, RED at >= 1 selected */}
      <button
        type="button"
        onClick={onBulkDelete}
        aria-label={
          hasSelection
            ? `Delete ${selectedCount} selected songs`
            : 'Delete selected songs'
        }
        className={cn(
          'pointer-events-auto glass-circle pressable-strong flex h-[46px] w-[46px] items-center justify-center rounded-full cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]',
          hasSelection ? 'text-[var(--accent-red)]' : 'text-white'
        )}
      >
        <Trash2 size={20} {...UI_ICON_PROPS} />
      </button>

      {/* Center: Translucent live count pill matched at exact 46px height */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto glass-circle flex h-[46px] min-w-[122px] items-center justify-center rounded-full px-5 text-[14px] font-semibold tracking-[-0.01em] text-white tabular-nums select-none"
      >
        {selectedCount} selected
      </div>

      {/* Right: Standalone circular Favorite (Heart) and Add to Playlist (SquarePlus) buttons */}
      <div className="pointer-events-auto flex items-center gap-2.5">
        <button
          type="button"
          onClick={onBulkFavorite}
          aria-label="Add selected songs to Favorites"
          className={cn(
            'glass-circle pressable-strong flex h-[46px] w-[46px] items-center justify-center rounded-full cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]',
            hasSelection ? 'text-white' : 'text-white/80'
          )}
        >
          <Heart size={20} {...UI_ICON_PROPS} />
        </button>

        <button
          type="button"
          onClick={onBulkAddToCollection}
          aria-label="Add selected songs to Playlist"
          className={cn(
            'glass-circle pressable-strong flex h-[46px] w-[46px] items-center justify-center rounded-full cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]',
            hasSelection ? 'text-white' : 'text-white/80'
          )}
        >
          <SquarePlus size={20} {...UI_ICON_PROPS} />
        </button>
      </div>
    </motion.div>
  );
};
