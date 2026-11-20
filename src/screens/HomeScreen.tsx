import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Settings } from 'lucide-react';
import { Song } from '../types/music';
import { REFERENCE_NOW, formatShortTimestamp } from '../data/songs';
import { ShazamMark } from '../components/ShazamIcons';
import { AlbumCover } from '../components/ProceduralArtwork';
import { UI_ICON_PROPS } from '../lib/iconConfig';
import { cn } from '../lib/utils';

interface HomeScreenProps {
  recentSongs: Song[];
  onOpenSettings: () => void;
  onIdentifyDemoTrack: () => Song;
  onSelectRecentSong: (song: Song) => void;
  onTriggerHaptic?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  recentSongs,
  onOpenSettings,
  onIdentifyDemoTrack,
  onSelectRecentSong,
  onTriggerHaptic,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isListening, setIsListening] = useState(false);
  const [statusLabel, setStatusLabel] = useState<
    'Tap to Shazam' | 'Listening...' | 'Searching for a match...'
  >('Tap to Shazam');
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const handleTapShazam = () => {
    onTriggerHaptic?.();
    // Interruptible: tapping while listening cancels immediately
    if (isListening) {
      clearTimers();
      setIsListening(false);
      setStatusLabel('Tap to Shazam');
      return;
    }

    setIsListening(true);
    setStatusLabel('Listening...');

    const t1 = window.setTimeout(() => {
      setStatusLabel('Searching for a match...');
    }, 900);

    const t2 = window.setTimeout(() => {
      onIdentifyDemoTrack();
      onTriggerHaptic?.();
      setIsListening(false);
      setStatusLabel('Tap to Shazam');
    }, 1850);

    timersRef.current = [t1, t2];
  };

  return (
    <div className="relative flex h-full w-full flex-col justify-between bg-[radial-gradient(ellipse_at_50%_22%,#0C2034_0%,#06101B_48%,#03060A_100%)] overflow-hidden">
      {/* Top-right Settings button (44px expanded hit target) */}
      <div className="flex items-center justify-end px-4 pt-3">
        <button
          type="button"
          onClick={() => {
            onTriggerHaptic?.();
            onOpenSettings();
          }}
          aria-label="Open Settings"
          className="glass-circle hit-target-44 pressable-strong flex h-[40px] w-[40px] items-center justify-center rounded-full text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
        >
          <Settings size={20} {...UI_ICON_PROPS} />
        </button>
      </div>

      {/* Center dominant Tap to Shazam anchor */}
      <div className="flex flex-1 flex-col items-center justify-center -mt-8 px-6">
        <AnimatePresence mode="wait">
          <motion.h1
            key={statusLabel}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="mb-8 text-[19px] font-semibold tracking-[-0.015em] text-white select-none"
          >
            {statusLabel}
          </motion.h1>
        </AnimatePresence>

        <div className="relative flex items-center justify-center">
          {/* Soft ambient halo behind hero orb */}
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute h-[224px] w-[224px] rounded-full transition-opacity duration-300',
              isListening
                ? 'bg-[radial-gradient(circle,rgba(10,132,255,0.28)_0%,rgba(10,132,255,0)_70%)] opacity-100'
                : 'bg-[radial-gradient(circle,rgba(56,112,176,0.14)_0%,rgba(10,20,35,0)_70%)] opacity-100'
            )}
          />

          {/* Concentric listening rings when active (disabled under reduced motion) */}
          <AnimatePresence>
            {isListening && !prefersReducedMotion && (
              <>
                <motion.span
                  initial={{ scale: 0.92, opacity: 0.55 }}
                  animate={{ scale: 1.52, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.45,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="pointer-events-none absolute h-[174px] w-[174px] rounded-full border border-[var(--accent-blue)]/65 bg-[var(--accent-blue)]/10"
                />
                <motion.span
                  initial={{ scale: 0.92, opacity: 0.45 }}
                  animate={{ scale: 1.78, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1.45,
                    delay: 0.48,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  className="pointer-events-none absolute h-[174px] w-[174px] rounded-full border border-white/25"
                />
              </>
            )}
          </AnimatePresence>

          {/* Primary circular Shazam orb (refined smoked-glass depth & 59% mark ratio matching Board 01) */}
          <motion.button
            type="button"
            onClick={handleTapShazam}
            aria-label={isListening ? 'Cancel Shazam listening' : 'Tap to Shazam'}
            aria-pressed={isListening}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
            animate={
              isListening && !prefersReducedMotion
                ? { scale: [1, 1.035, 1] }
                : { scale: 1 }
            }
            transition={
              isListening && !prefersReducedMotion
                ? { duration: 1.15, repeat: Infinity, ease: 'easeInOut' }
                : { type: 'spring', bounce: 0, duration: 0.28 }
            }
            className={cn(
              'relative z-10 flex h-[172px] w-[172px] items-center justify-center rounded-full cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#050C14]',
              'bg-[radial-gradient(circle_at_35%_26%,#29313D_0%,#181D26_58%,#10141B_100%)]',
              'border border-white/[0.13]',
              isListening
                ? 'shadow-[0_0_52px_rgba(10,132,255,0.44),inset_0_1px_1px_rgba(255,255,255,0.24)]'
                : 'shadow-[0_22px_50px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.18)]'
            )}
          >
            <ShazamMark className="h-[102px] w-[102px] text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.38)]" />
          </motion.button>
        </div>
      </div>

      {/* Recently Found horizontal carousel sitting cleanly above floating bottom nav */}
      <div className="pb-[98px]">
        <h2 className="mb-3 px-5 text-[14px] font-semibold tracking-[-0.01em] text-[var(--text-secondary)]">
          Recently Found
        </h2>

        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
          {recentSongs.slice(0, 6).map((song, idx) => {
            const timeLabel =
              idx === 0 && song.foundAt >= REFERENCE_NOW - 10 * 60 * 1000
                ? 'Just now'
                : formatShortTimestamp(song.foundAt);

            return (
              <button
                key={song.id}
                type="button"
                aria-label={`Play ${song.title} by ${song.artist}`}
                onClick={() => {
                  onTriggerHaptic?.();
                  onSelectRecentSong(song);
                }}
                className="pressable flex w-[306px] shrink-0 items-center gap-3 rounded-[22px] bg-[var(--surface-home-card)] p-[12px] text-left border border-white/[0.065] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
              >
                <AlbumCover
                  artwork={song.artwork}
                  seedKey={song.id}
                  titleHint={song.title}
                  size={56}
                  rounded="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-medium text-[var(--text-tertiary)] tabular-nums">
                    {timeLabel}
                  </p>
                  <p className="mt-0.5 truncate text-[15px] font-semibold tracking-[-0.012em] text-white">
                    {song.title}
                  </p>
                  <p className="truncate text-[13px] text-[var(--text-secondary)]">
                    {song.artist}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
