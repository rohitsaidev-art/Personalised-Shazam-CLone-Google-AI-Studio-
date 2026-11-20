import React from 'react';
import { Check } from 'lucide-react';
import { ArtworkSpec, FilterCategoryKey } from '../types/music';
import { CircularChipAvatar } from './ProceduralArtwork';
import { CHECK_ICON_PROPS } from '../lib/iconConfig';
import { cn } from '../lib/utils';

interface FilterChipProps {
  label: string;
  category: FilterCategoryKey;
  selected?: boolean;
  variant?: 'category' | 'quick-value' | 'explore' | 'active-result';
  coverArtwork?: ArtworkSpec;
  coverSeedKey?: string;
  onClick: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  category,
  selected = false,
  variant = 'category',
  coverArtwork,
  coverSeedKey,
  onClick,
  className,
}) => {
  const isExplore = variant === 'explore';
  const isQuickValue = variant === 'quick-value';
  const isActiveResult = variant === 'active-result';

  const avatarSize = isActiveResult ? 24 : 26;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'pressable inline-flex items-center rounded-full border text-[14.5px] md:text-[13.5px] font-medium tracking-[-0.005em] whitespace-nowrap shrink-0 cursor-pointer select-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]',
        isActiveResult
          ? 'h-[40px] md:h-[36px] gap-[7px] pl-[5px] pr-[11px] bg-[#132238] border-[var(--accent-blue-border)] text-white hover:bg-[#192D4A]'
          : 'h-[42px] md:h-[38px] gap-[8px] pl-[5px] pr-[13px]',
        !selected &&
          !isActiveResult &&
          'bg-[var(--surface-elevated)] border-[var(--border-hairline)] text-white hover:bg-[var(--surface-elevated-hover)]',
        selected &&
          isQuickValue &&
          'bg-[#2C2417] border-[var(--accent-amber)] text-white shadow-[0_0_0_1px_rgba(217,164,65,0.28)]',
        selected &&
          isExplore &&
          'bg-[#132238] border-[var(--accent-blue-border)] text-white',
        className
      )}
    >
      {/* Fixed circular avatar container so checkmark swap never reflows chip width */}
      <span
        style={{ width: avatarSize, height: avatarSize }}
        className="relative flex shrink-0 items-center justify-center rounded-full"
      >
        {isExplore && selected ? (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-[#1C2E4A] border border-[#60A5FA]/80 text-white">
            <Check size={14} {...CHECK_ICON_PROPS} />
          </span>
        ) : (
          <CircularChipAvatar
            label={label}
            category={category}
            size={avatarSize}
            coverArtwork={coverArtwork}
            coverSeedKey={coverSeedKey}
          />
        )}
      </span>

      <span className={cn('truncate', isExplore ? 'max-w-[148px]' : 'max-w-[152px]')}>
        {label}
      </span>
    </button>
  );
};
