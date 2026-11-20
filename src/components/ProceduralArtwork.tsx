import React, { useMemo, useState } from 'react';
import { ArtworkSpec, FilterCategoryKey } from '../types/music';
import {
  renderCategoryAvatarDataUrl,
  renderEditorialCoverDataUrl,
} from '../lib/artworkRenderer';
import { cn } from '../lib/utils';

interface AlbumCoverProps {
  artwork: ArtworkSpec;
  seedKey?: string;
  titleHint?: string;
  size?: number;
  className?: string;
  showPlayOverlay?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const AlbumCover: React.FC<AlbumCoverProps> = ({
  artwork,
  seedKey,
  titleHint,
  size = 70,
  className,
  showPlayOverlay = false,
  rounded = 'md',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  const radiusClass =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === 'lg'
      ? 'rounded-[20px]'
      : rounded === 'sm'
      ? 'rounded-[10px]'
      : 'rounded-[12px]';

  const effectiveSeed =
    seedKey ??
    titleHint ??
    `${artwork.primary}-${artwork.secondary}-${artwork.accent}-${artwork.pattern}`;

  const proceduralSrc = useMemo(() => {
    if (artwork.imageUrl && !imgFailed) return null;
    return renderEditorialCoverDataUrl(effectiveSeed, artwork, size, titleHint);
  }, [artwork, effectiveSeed, size, titleHint, imgFailed]);

  const activeSrc = !imgFailed && artwork.imageUrl ? artwork.imageUrl : proceduralSrc;
  const imageScale = !imgFailed && artwork.imageUrl ? artwork.imageScale ?? 1.02 : 1;

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${artwork.primary}, ${artwork.secondary})`,
      }}
      className={cn(
        'relative shrink-0 overflow-hidden select-none',
        radiusClass,
        className
      )}
    >
      {activeSrc && (
        <img
          src={activeSrc}
          alt=""
          aria-hidden="true"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => {
            if (!imgFailed && artwork.imageUrl) setImgFailed(true);
          }}
          style={
            imageScale !== 1
              ? { transform: `scale(${imageScale})` }
              : undefined
          }
          className="block h-full w-full object-cover"
        />
      )}

      {/* Unified subtle top-edge specular & inner hairline frame */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.13)]"
      />

      {/* Refined frosted play badge on Library SongCards */}
      {showPlayOverlay && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-black/44 backdrop-blur-[6px] border border-white/[0.2] shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            <svg viewBox="0 0 12 12" className="h-[10.5px] w-[10.5px] translate-x-[1px] fill-white">
              <path d="M2.4 1.6L10.2 6L2.4 10.4V1.6Z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

interface CircularChipAvatarProps {
  label: string;
  category: FilterCategoryKey;
  size?: number;
  coverArtwork?: ArtworkSpec;
  coverSeedKey?: string;
}

export const CircularChipAvatar: React.FC<CircularChipAvatarProps> = ({
  label,
  category,
  size = 26,
  coverArtwork,
  coverSeedKey,
}) => {
  // For Artists (and any chip with a linked flagship release cover), render real cropped cover artwork
  if (coverArtwork) {
    return (
      <AlbumCover
        artwork={coverArtwork}
        seedKey={coverSeedKey ?? `avatar-${category}-${label}`}
        titleHint={label}
        size={size}
        rounded="full"
        className="ring-1 ring-white/[0.14]"
      />
    );
  }

  const avatarSrc = useMemo(
    () => renderCategoryAvatarDataUrl(category, label),
    [category, label]
  );

  return (
    <div
      style={{ width: size, height: size }}
      className="relative shrink-0 overflow-hidden rounded-full bg-[#1D1F26] ring-1 ring-white/[0.14] select-none"
    >
      {avatarSrc && (
        <img
          src={avatarSrc}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="block h-full w-full object-cover"
        />
      )}
    </div>
  );
};
