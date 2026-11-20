import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import {
  ExploreFilters,
  FilterCategoryKey,
  QuickFilterState,
  Song,
} from '../types/music';
import { getArtistCoverArtwork } from '../data/songs';
import { FilterLinesIcon } from './ShazamIcons';
import { FilterChip } from './FilterChip';
import { UI_ICON_PROPS } from '../lib/iconConfig';

const QUICK_CATEGORIES: Array<{ key: FilterCategoryKey; label: string }> = [
  { key: 'artists', label: 'Artists' },
  { key: 'genres', label: 'Genres' },
  { key: 'cities', label: 'Cities' },
  { key: 'moods', label: 'Moods' },
  { key: 'decades', label: 'Decades' },
];

interface QuickFilterRowProps {
  songs: Song[];
  mode: 'default' | 'quick' | 'advanced-results';
  quickFilter: QuickFilterState;
  categoryValues: string[];
  activeExploreFilters: ExploreFilters;
  onOpenExplore: () => void;
  onOpenQuickCategory: (category: FilterCategoryKey) => void;
  onSelectQuickValue: (value: string) => void;
  onCloseQuickFilter: () => void;
  onRemoveExploreChip: (category: FilterCategoryKey, value: string) => void;
  onReturnToExploreFromResults: () => void;
  onTriggerHaptic?: () => void;
}

export const QuickFilterRow: React.FC<QuickFilterRowProps> = ({
  songs,
  mode,
  quickFilter,
  categoryValues,
  activeExploreFilters,
  onOpenExplore,
  onOpenQuickCategory,
  onSelectQuickValue,
  onCloseQuickFilter,
  onRemoveExploreChip,
  onReturnToExploreFromResults,
  onTriggerHaptic,
}) => {
  const defaultArtistsCover = useMemo(
    () => getArtistCoverArtwork(songs, 'Pritam') ?? (songs[0] ? { artwork: songs[0].artwork, seedKey: songs[0].id } : undefined),
    [songs]
  );

  // Advanced-filter results mode: X returns to Explore with selections preserved
  if (mode === 'advanced-results') {
    const activePairs: Array<{ category: FilterCategoryKey; value: string }> = [
      ...activeExploreFilters.artists.map((value) => ({
        category: 'artists' as const,
        value,
      })),
      ...activeExploreFilters.genres.map((value) => ({
        category: 'genres' as const,
        value,
      })),
      ...activeExploreFilters.cities.map((value) => ({
        category: 'cities' as const,
        value,
      })),
      ...activeExploreFilters.moods.map((value) => ({
        category: 'moods' as const,
        value,
      })),
      ...activeExploreFilters.decades.map((value) => ({
        category: 'decades' as const,
        value,
      })),
    ];

    return (
      <div className="flex items-center gap-[8px] overflow-x-auto no-scrollbar px-4 py-1">
        <button
          type="button"
          onClick={() => {
            onTriggerHaptic?.();
            onReturnToExploreFromResults();
          }}
          aria-label="Back to Explore filters"
          className="glass-circle hit-target-44 pressable-strong flex h-[40px] w-[40px] md:h-[36px] md:w-[36px] shrink-0 items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
        >
          <X size={17} {...UI_ICON_PROPS} />
        </button>

        {activePairs.map(({ category, value }) => {
          const artistCover =
            category === 'artists' ? getArtistCoverArtwork(songs, value) : undefined;
          return (
            <FilterChip
              key={`${category}:${value}`}
              label={value}
              category={category}
              variant="active-result"
              selected
              coverArtwork={artistCover?.artwork}
              coverSeedKey={artistCover?.seedKey}
              onClick={() => {
                onTriggerHaptic?.();
                onRemoveExploreChip(category, value);
              }}
            />
          );
        })}
      </div>
    );
  }

  // Quick-filter category values state
  if (mode === 'quick' && quickFilter.openCategory) {
    const openCat = quickFilter.openCategory;
    return (
      <div className="flex items-center gap-[8px] overflow-x-auto no-scrollbar px-4 py-1">
        <button
          type="button"
          onClick={() => {
            onTriggerHaptic?.();
            onCloseQuickFilter();
          }}
          aria-label="Clear quick filter"
          className="glass-circle hit-target-44 pressable-strong flex h-[42px] w-[42px] md:h-[38px] md:w-[38px] shrink-0 items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
        >
          <X size={17} {...UI_ICON_PROPS} />
        </button>

        {categoryValues.map((val) => {
          const isSelected =
            quickFilter.selectedCategory === openCat &&
            quickFilter.selectedValue === val;
          const artistCover =
            openCat === 'artists' ? getArtistCoverArtwork(songs, val) : undefined;
          return (
            <FilterChip
              key={val}
              label={val}
              category={openCat}
              variant="quick-value"
              selected={isSelected}
              coverArtwork={artistCover?.artwork}
              coverSeedKey={artistCover?.seedKey}
              onClick={() => {
                onTriggerHaptic?.();
                onSelectQuickValue(val);
              }}
            />
          );
        })}
      </div>
    );
  }

  // Default Library quick-filter categories row: [Filter Icon] Artists · Genres · Cities · Moods · Decades
  return (
    <div className="flex items-center gap-[8px] overflow-x-auto no-scrollbar px-4 py-1">
      <button
        type="button"
        onClick={() => {
          onTriggerHaptic?.();
          onOpenExplore();
        }}
        aria-label="Open advanced Explore filters"
        className="glass-circle hit-target-44 pressable-strong flex h-[42px] w-[42px] md:h-[38px] md:w-[38px] shrink-0 items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
      >
        <FilterLinesIcon className="h-[18px] w-[18px]" />
      </button>

      {QUICK_CATEGORIES.map((cat) => (
        <FilterChip
          key={cat.key}
          label={cat.label}
          category={cat.key}
          variant="category"
          coverArtwork={cat.key === 'artists' ? defaultArtistsCover?.artwork : undefined}
          coverSeedKey={cat.key === 'artists' ? defaultArtistsCover?.seedKey : undefined}
          onClick={() => {
            onTriggerHaptic?.();
            onOpenQuickCategory(cat.key);
          }}
        />
      ))}
    </div>
  );
};
