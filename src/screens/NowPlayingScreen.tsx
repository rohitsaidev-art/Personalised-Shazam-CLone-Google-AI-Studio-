import React from 'react';
import { NowPlayingTabIcon } from '../components/ShazamIcons';

export const NowPlayingScreen: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-[var(--bg-library)] px-8 pt-[var(--safe-top)] pb-[calc(var(--safe-bottom)+96px)] md:pt-0 md:pb-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--surface-card)] border border-[var(--border-hairline)] text-[var(--accent-blue)] shadow-[var(--highlight-specular)]">
        <NowPlayingTabIcon className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-[22px] font-bold tracking-[-0.02em] text-white">
        Now Playing
      </h1>
      <p className="mt-2 max-w-[250px] text-[14px] leading-[1.45] text-[var(--text-secondary)]">
        Playback controls, queue, and lyrics are scheduled for Phase 2.
      </p>
    </div>
  );
};
