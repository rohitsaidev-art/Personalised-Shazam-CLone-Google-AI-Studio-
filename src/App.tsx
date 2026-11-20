import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AppTab,
  CandidateCorrection,
  ExploreFilters,
  FilterCategoryKey,
  QuickFilterState,
  Song,
  SortConfig,
} from './types/music';
import {
  EMPTY_EXPLORE_FILTERS,
  INITIAL_SONGS,
  SHAZAM_DEMO_DISCOVERIES,
  hasActiveExploreFilters,
} from './data/songs';
import {
  INITIAL_PLAYLISTS,
  Playlist,
  getSongDurationSeconds,
} from './data/playlists';
import { MobileFrame } from './components/MobileFrame';
import { BottomNavigation } from './components/BottomNavigation';
import { SettingsSheet } from './components/SettingsSheet';
import { ExploreFilterSheet } from './components/ExploreFilterSheet';
import { SongActionMenu, WrongSongDialog } from './components/SongActionMenu';
import { MultiSelectActionControls } from './components/MultiSelectActionControls';
import { GlobalSearchOverlay } from './components/GlobalSearchOverlay';
import { MusicPlayerSheet } from './components/MusicPlayerSheet';
import { PlaylistPickerSheet } from './components/PlaylistPickerSheet';
import { HomeScreen } from './screens/HomeScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { NowPlayingScreen } from './screens/NowPlayingScreen';

interface ActionMenuTarget {
  song: Song;
  rect: DOMRect;
}

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalContainer(portalContainerRef.current);
  }, []);

  // Single canonical song dataset (starts with exactly 83 records)
  const [songs, setSongs] = useState<Song[]>(() => INITIAL_SONGS);
  const demoIndexRef = useRef(0);

  // Navigation & persistent chrome state
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Settings (strictly Location & Haptic Feedback only)
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  // Library sort, search, quick filter & advanced Explore state
  const [sort, setSort] = useState<SortConfig>({
    field: 'dateFound',
    order: 'newest',
  });
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');

  const [quickFilter, setQuickFilter] = useState<QuickFilterState>({
    openCategory: null,
    selectedCategory: null,
    selectedValue: null,
  });

  const [exploreOpen, setExploreOpen] = useState(false);
  const [exploreDraftFilters, setExploreDraftFilters] = useState<ExploreFilters>(
    EMPTY_EXPLORE_FILTERS
  );
  const [appliedExploreFilters, setAppliedExploreFilters] = useState<ExploreFilters>(
    EMPTY_EXPLORE_FILTERS
  );
  const [isAdvancedResultsActive, setIsAdvancedResultsActive] = useState(false);
  const [exploreScrollTop, setExploreScrollTop] = useState(0);

  // Song contextual menu (spatially anchored), mismatch correction & multi-select state
  const [actionMenuTarget, setActionMenuTarget] = useState<ActionMenuTarget | null>(null);
  const [wrongSongTarget, setWrongSongTarget] = useState<Song | null>(null);

  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState<Set<string>>(() => new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());

  // Music Player & local playlists state
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [playerQueueIds, setPlayerQueueIds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const playHistoryRef = useRef<string[]>([]);

  const [playlists, setPlaylists] = useState<Playlist[]>(() => INITIAL_PLAYLISTS);
  const [playlistPickerOpen, setPlaylistPickerOpen] = useState(false);
  const [playlistPickerSongIds, setPlaylistPickerSongIds] = useState<string[]>([]);

  // Transient subtle feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const triggerHaptic = useCallback(() => {
    if (!hapticEnabled) return;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore unsupported vibration calls
      }
    }
  }, [hapticEnabled]);

  // Tap to Shazam simulated identification
  const handleIdentifyDemoTrack = useCallback((): Song => {
    const template =
      SHAZAM_DEMO_DISCOVERIES[demoIndexRef.current % SHAZAM_DEMO_DISCOVERIES.length];
    demoIndexRef.current += 1;

    const newSong: Song = {
      ...template,
      id: `song-found-${Date.now()}`,
      foundAt: Date.now(),
      city: locationEnabled ? 'Hyderabad' : 'Unknown',
    };

    setSongs((prev) => [newSong, ...prev]);
    showToast(`Found "${newSong.title}" by ${newSong.artist}`);
    return newSong;
  }, [locationEnabled, showToast]);

  // Quick filter handlers
  const handleOpenQuickCategory = useCallback((category: FilterCategoryKey) => {
    setIsAdvancedResultsActive(false);
    setQuickFilter({
      openCategory: category,
      selectedCategory: null,
      selectedValue: null,
    });
  }, []);

  const handleSelectQuickValue = useCallback((value: string) => {
    setQuickFilter((prev) => {
      if (!prev.openCategory) return prev;
      const isSame =
        prev.selectedCategory === prev.openCategory &&
        prev.selectedValue === value;
      return {
        ...prev,
        selectedCategory: isSame ? null : prev.openCategory,
        selectedValue: isSame ? null : value,
      };
    });
  }, []);

  const handleCloseQuickFilter = useCallback(() => {
    setQuickFilter({
      openCategory: null,
      selectedCategory: null,
      selectedValue: null,
    });
  }, []);

  // Advanced Explore handlers
  const handleToggleExploreFilter = useCallback(
    (category: FilterCategoryKey, value: string) => {
      setExploreDraftFilters((prev) => {
        const current = prev[category];
        const exists = current.includes(value);
        return {
          ...prev,
          [category]: exists
            ? current.filter((item) => item !== value)
            : [...current, value],
        };
      });
    },
    []
  );

  const handleClearExploreDraftFilters = useCallback(() => {
    setExploreDraftFilters(EMPTY_EXPLORE_FILTERS);
  }, []);

  const handleOpenExplore = useCallback(() => {
    setExploreOpen(true);
  }, []);

  const handleShowExploreResults = useCallback(() => {
    setAppliedExploreFilters(exploreDraftFilters);
    setIsAdvancedResultsActive(true);
    setQuickFilter({
      openCategory: null,
      selectedCategory: null,
      selectedValue: null,
    });
    setExploreOpen(false);
  }, [exploreDraftFilters]);

  // Critical brief rule: X on Advanced Results returns to Explore with ALL previous selections preserved
  const handleReturnToExploreFromResults = useCallback(() => {
    setExploreDraftFilters(appliedExploreFilters);
    setExploreOpen(true);
  }, [appliedExploreFilters]);

  const handleRemoveExploreChip = useCallback(
    (category: FilterCategoryKey, value: string) => {
      const next: ExploreFilters = {
        ...appliedExploreFilters,
        [category]: appliedExploreFilters[category].filter((v) => v !== value),
      };
      setAppliedExploreFilters(next);
      setExploreDraftFilters(next);
      if (!hasActiveExploreFilters(next)) {
        setIsAdvancedResultsActive(false);
      }
    },
    [appliedExploreFilters]
  );

  const handleClearAllFilters = useCallback(() => {
    setQuickFilter({
      openCategory: null,
      selectedCategory: null,
      selectedValue: null,
    });
    setAppliedExploreFilters(EMPTY_EXPLORE_FILTERS);
    setExploreDraftFilters(EMPTY_EXPLORE_FILTERS);
    setIsAdvancedResultsActive(false);
  }, []);

  // Song contextual menu actions (exact 6 items)
  const handleOpenSongActionMenu = useCallback((song: Song, rect: DOMRect) => {
    setActionMenuTarget({ song, rect });
  }, []);

  const handleEnterMultiSelectFromMenu = useCallback((_songId: string) => {
    // Matches board 05: enters selection mode with 0 selected initially so user sees white Delete -> red Delete on check
    setSelectedSongIds(new Set());
    setIsMultiSelectMode(true);
  }, []);

  const handleRemoveSingleSong = useCallback(
    (songId: string) => {
      const target = songs.find((s) => s.id === songId);
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      setSelectedSongIds((prev) => {
        if (!prev.has(songId)) return prev;
        const next = new Set(prev);
        next.delete(songId);
        return next;
      });
      setPlaylists((prev) =>
        prev.map((pl) =>
          pl.songIds.includes(songId)
            ? { ...pl, songIds: pl.songIds.filter((id) => id !== songId) }
            : pl
        )
      );
      if (target) {
        showToast(`Removed "${target.title}" from Library`);
      }
    },
    [songs, showToast]
  );

  const handleApplyWrongSongCorrection = useCallback(
    (songId: string, candidate: CandidateCorrection) => {
      setSongs((prev) =>
        prev.map((s) =>
          s.id === songId
            ? {
                ...s,
                title: candidate.title,
                artist: candidate.artist,
                artists: candidate.artists,
                genres: candidate.genres,
                decade: candidate.decade,
                artwork: candidate.artwork,
              }
            : s
        )
      );
      showToast(`Updated match to "${candidate.title}"`);
    },
    [showToast]
  );

  const handleGoToArtist = useCallback((artist: string) => {
    setActiveTab('library');
    setIsAdvancedResultsActive(false);
    setIsMultiSelectMode(false);
    setQuickFilter({
      openCategory: 'artists',
      selectedCategory: 'artists',
      selectedValue: artist,
    });
  }, []);

  const handleGoToGenre = useCallback((genre: string) => {
    setActiveTab('library');
    setIsAdvancedResultsActive(false);
    setIsMultiSelectMode(false);
    setQuickFilter({
      openCategory: 'genres',
      selectedCategory: 'genres',
      selectedValue: genre,
    });
  }, []);

  const handleShareSong = useCallback(
    async (song: Song) => {
      const shareText = `${song.title} — ${song.artist}`;
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          await navigator.share({
            title: song.title,
            text: shareText,
          });
          return;
        } catch {
          // User cancelled or share unavailable in iframe — fall through to clipboard
        }
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(shareText);
          showToast(`Copied "${song.title}" to clipboard`);
          return;
        } catch {
          // Fallback toast below
        }
      }
      showToast(`Shared "${song.title}"`);
    },
    [showToast]
  );

  // Multi-select handlers
  const handleToggleSongSelect = useCallback((songId: string) => {
    setSelectedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) next.delete(songId);
      else next.add(songId);
      return next;
    });
  }, []);

  const handleExitMultiSelect = useCallback(() => {
    setIsMultiSelectMode(false);
    setSelectedSongIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selectedSongIds.size === 0) {
      showToast('Select songs to remove');
      return;
    }
    triggerHaptic();
    const count = selectedSongIds.size;
    const removedSet = new Set(selectedSongIds);
    setSongs((prev) => prev.filter((s) => !removedSet.has(s.id)));
    setPlaylists((prev) =>
      prev.map((pl) => ({
        ...pl,
        songIds: pl.songIds.filter((id) => !removedSet.has(id)),
      }))
    );
    setSelectedSongIds(new Set());
    setIsMultiSelectMode(false);
    showToast(`Removed ${count} ${count === 1 ? 'song' : 'songs'} from Library`);
  }, [selectedSongIds, triggerHaptic, showToast]);

  const handleBulkFavorite = useCallback(() => {
    if (selectedSongIds.size === 0) {
      showToast('Select songs to favorite');
      return;
    }
    triggerHaptic();
    const count = selectedSongIds.size;
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      selectedSongIds.forEach((id) => next.add(id));
      return next;
    });
    showToast(`Added ${count} ${count === 1 ? 'song' : 'songs'} to Favorites`);
  }, [selectedSongIds, triggerHaptic, showToast]);

  // Bulk Add to Collection connects directly to the shared PlaylistPickerSheet
  const handleBulkAddToCollection = useCallback(() => {
    if (selectedSongIds.size === 0) {
      showToast('Select songs to add to Playlist');
      return;
    }
    triggerHaptic();
    setPlaylistPickerSongIds(Array.from(selectedSongIds));
    setPlaylistPickerOpen(true);
  }, [selectedSongIds, triggerHaptic, showToast]);

  const handleSelectTab = useCallback(
    (tab: AppTab) => {
      triggerHaptic();
      if (tab !== 'library' && isMultiSelectMode) {
        setIsMultiSelectMode(false);
        setSelectedSongIds(new Set());
      }
      setActiveTab(tab);
    },
    [triggerHaptic, isMultiSelectMode]
  );

  const currentSong = useMemo(
    () => (currentSongId ? songs.find((s) => s.id === currentSongId) ?? null : null),
    [songs, currentSongId]
  );

  const playlistPickerSongs = useMemo(() => {
    const idSet = new Set(playlistPickerSongIds);
    return songs.filter((s) => idSet.has(s.id));
  }, [songs, playlistPickerSongIds]);

  // Close player cleanly if active song is removed from Library
  useEffect(() => {
    if (playerOpen && currentSongId && !currentSong) {
      setPlayerOpen(false);
      setIsPlaying(false);
    }
  }, [playerOpen, currentSongId, currentSong]);

  const handleOpenPlayer = useCallback(
    (song: Song, queue?: Song[]) => {
      const nextQueueIds =
        queue && queue.length > 0 ? queue.map((s) => s.id) : songs.map((s) => s.id);
      setPlayerQueueIds(nextQueueIds);
      if (currentSongId !== song.id) {
        if (currentSongId) {
          playHistoryRef.current = [...playHistoryRef.current.slice(-24), currentSongId];
        }
        setCurrentSongId(song.id);
        setElapsedSeconds(0);
      }
      setIsPlaying(true);
      setPlayerOpen(true);
    },
    [songs, currentSongId]
  );

  const handleNextTrack = useCallback(() => {
    const activeQueue = (playerQueueIds.length > 0 ? playerQueueIds : songs.map((s) => s.id)).filter(
      (id) => songs.some((s) => s.id === id)
    );
    if (activeQueue.length === 0) return;

    const currentIdx = currentSongId ? activeQueue.indexOf(currentSongId) : -1;
    let nextId: string;

    if (isShuffled && activeQueue.length > 1) {
      const candidates = activeQueue.filter((id) => id !== currentSongId);
      nextId = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % activeQueue.length : 0;
      nextId = activeQueue[nextIdx];
    }

    if (currentSongId) {
      playHistoryRef.current = [...playHistoryRef.current.slice(-24), currentSongId];
    }
    setCurrentSongId(nextId);
    setElapsedSeconds(0);
  }, [playerQueueIds, songs, currentSongId, isShuffled]);

  const handlePreviousTrack = useCallback(() => {
    // Standard iOS player behaviour: restart track if past 3 seconds
    if (elapsedSeconds > 3) {
      setElapsedSeconds(0);
      return;
    }

    const validHistory = playHistoryRef.current.filter((id) =>
      songs.some((s) => s.id === id)
    );
    if (validHistory.length > 0) {
      const prevId = validHistory[validHistory.length - 1];
      playHistoryRef.current = validHistory.slice(0, -1);
      setCurrentSongId(prevId);
      setElapsedSeconds(0);
      return;
    }

    const activeQueue = (playerQueueIds.length > 0 ? playerQueueIds : songs.map((s) => s.id)).filter(
      (id) => songs.some((s) => s.id === id)
    );
    if (activeQueue.length === 0) return;

    const currentIdx = currentSongId ? activeQueue.indexOf(currentSongId) : 0;
    const prevIdx =
      currentIdx > 0 ? currentIdx - 1 : activeQueue.length - 1;
    setCurrentSongId(activeQueue[prevIdx]);
    setElapsedSeconds(0);
  }, [elapsedSeconds, playerQueueIds, songs, currentSongId]);

  // Prototype playback progress timer
  useEffect(() => {
    if (!isPlaying || !currentSong) return;
    const duration = getSongDurationSeconds(currentSong.id);

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 0.25;
        if (next >= duration) {
          handleNextTrack();
          return 0;
        }
        return next;
      });
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, currentSong, handleNextTrack]);

  const handleToggleSingleFavorite = useCallback((songId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  }, []);

  // Unified single + bulk local playlist mutation
  const handleToggleSongsInPlaylist = useCallback(
    (playlistId: string, targetIds: string[]) => {
      if (targetIds.length === 0) return;
      const targetPlaylist = playlists.find((pl) => pl.id === playlistId);
      if (!targetPlaylist) return;

      const allPresent = targetIds.every((id) => targetPlaylist.songIds.includes(id));

      setPlaylists((prev) =>
        prev.map((pl) => {
          if (pl.id !== playlistId) return pl;
          if (allPresent) {
            const removeSet = new Set(targetIds);
            return {
              ...pl,
              songIds: pl.songIds.filter((id) => !removeSet.has(id)),
            };
          }
          const existing = new Set(pl.songIds);
          const toAppend = targetIds.filter((id) => !existing.has(id));
          return {
            ...pl,
            songIds: [...pl.songIds, ...toAppend],
          };
        })
      );

      if (targetIds.length === 1) {
        showToast(
          allPresent
            ? `Removed from "${targetPlaylist.name}"`
            : `Added to "${targetPlaylist.name}"`
        );
      } else {
        const addedCount = targetIds.filter(
          (id) => !targetPlaylist.songIds.includes(id)
        ).length;
        showToast(
          allPresent
            ? `Removed ${targetIds.length} songs from "${targetPlaylist.name}"`
            : `Added ${addedCount} ${addedCount === 1 ? 'song' : 'songs'} to "${targetPlaylist.name}"`
        );
      }
    },
    [playlists, showToast]
  );

  const isCurrentSongInAnyPlaylist = useMemo(() => {
    if (!currentSong) return false;
    return playlists.some((pl) => pl.songIds.includes(currentSong.id));
  }, [playlists, currentSong]);

  return (
    <MobileFrame portalContainerRef={portalContainerRef}>
      {/* Active Tab Content with subtle 150ms cross-fade */}
      <div className="relative h-full w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: 'easeOut' }}
            className="h-full w-full"
          >
            {activeTab === 'home' && (
              <HomeScreen
                recentSongs={songs}
                onOpenSettings={() => setSettingsOpen(true)}
                onIdentifyDemoTrack={handleIdentifyDemoTrack}
                onSelectRecentSong={(song) => handleOpenPlayer(song, songs)}
                onTriggerHaptic={triggerHaptic}
              />
            )}

            {activeTab === 'library' && (
              <LibraryScreen
                songs={songs}
                sort={sort}
                onChangeSort={setSort}
                searchQuery={librarySearchQuery}
                onChangeSearchQuery={setLibrarySearchQuery}
                quickFilter={quickFilter}
                onOpenQuickCategory={handleOpenQuickCategory}
                onSelectQuickValue={handleSelectQuickValue}
                onCloseQuickFilter={handleCloseQuickFilter}
                isAdvancedResultsActive={isAdvancedResultsActive}
                appliedExploreFilters={appliedExploreFilters}
                onOpenExplore={handleOpenExplore}
                onReturnToExploreFromResults={handleReturnToExploreFromResults}
                onRemoveExploreChip={handleRemoveExploreChip}
                onClearAllFilters={handleClearAllFilters}
                isMultiSelectMode={isMultiSelectMode}
                selectedSongIds={selectedSongIds}
                favoriteIds={favoriteIds}
                onExitMultiSelect={handleExitMultiSelect}
                onToggleSongSelect={handleToggleSongSelect}
                onSelectSong={handleOpenPlayer}
                onOpenSongActionMenu={handleOpenSongActionMenu}
                portalContainer={portalContainer}
                onTriggerHaptic={triggerHaptic}
              />
            )}

            {activeTab === 'now-playing' && <NowPlayingScreen />}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Chrome: Multi-Select standalone controls OR Floating Bottom Navigation + Separate Search */}
        <AnimatePresence mode="wait">
          {activeTab === 'library' && isMultiSelectMode ? (
            <MultiSelectActionControls
              key="multi-select-controls"
              selectedCount={selectedSongIds.size}
              onBulkDelete={handleBulkDelete}
              onBulkFavorite={handleBulkFavorite}
              onBulkAddToCollection={handleBulkAddToCollection}
            />
          ) : (
            <BottomNavigation
              key="bottom-nav"
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              onOpenGlobalSearch={() => {
                triggerHaptic();
                setGlobalSearchOpen(true);
              }}
            />
          )}
        </AnimatePresence>

        {/* Subtle transient feedback toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -14, scale: 0.96 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -10, scale: 0.96 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0.14 }
                  : { type: 'spring', bounce: 0, duration: 0.26 }
              }
              role="status"
              aria-live="polite"
              className="pointer-events-none absolute inset-x-4 top-3 z-[80] flex justify-center"
            >
              <div className="glass-popover rounded-full px-4 py-2 text-[13px] font-medium text-white shadow-lg">
                {toastMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Bottom Sheet (Location & Haptic Feedback only) */}
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        locationEnabled={locationEnabled}
        onToggleLocation={() => {
          triggerHaptic();
          setLocationEnabled((prev) => {
            const next = !prev;
            showToast(
              next
                ? 'Location set to While Using (Hyderabad)'
                : 'Location tagging turned off'
            );
            return next;
          });
        }}
        hapticEnabled={hapticEnabled}
        onToggleHaptic={(checked) => {
          setHapticEnabled(checked);
          if (checked && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(10);
            } catch {
              // ignore
            }
          }
        }}
        portalContainer={portalContainer}
        onTriggerHaptic={triggerHaptic}
      />

      {/* Advanced Explore Multi-Filter Sheet (5 categories, strict AND logic) */}
      <ExploreFilterSheet
        open={exploreOpen}
        songs={songs}
        draftFilters={exploreDraftFilters}
        savedScrollTop={exploreScrollTop}
        onSaveScrollTop={setExploreScrollTop}
        onToggleFilter={handleToggleExploreFilter}
        onClearDraftFilters={handleClearExploreDraftFilters}
        onClose={() => setExploreOpen(false)}
        onShowResults={handleShowExploreResults}
        portalContainer={portalContainer}
        onTriggerHaptic={triggerHaptic}
      />

      {/* Song Long-Press Contextual Menu (Spatially anchored, exact 6 items) */}
      <SongActionMenu
        song={actionMenuTarget?.song ?? null}
        anchorRect={actionMenuTarget?.rect ?? null}
        onClose={() => setActionMenuTarget(null)}
        onSelectMode={handleEnterMultiSelectFromMenu}
        onRemoveSong={handleRemoveSingleSong}
        onReportWrongSong={(s) => setWrongSongTarget(s)}
        onGoToArtist={handleGoToArtist}
        onGoToGenre={handleGoToGenre}
        onShareSong={handleShareSong}
        portalContainer={portalContainer}
      />

      {/* Focused Wrong Song? Tell Shazam Candidate Correction Dialog */}
      <WrongSongDialog
        song={wrongSongTarget}
        onClose={() => setWrongSongTarget(null)}
        onApplyCorrection={handleApplyWrongSongCorrection}
        portalContainer={portalContainer}
        onTriggerHaptic={triggerHaptic}
      />

      {/* Lightweight Global Search Overlay triggered by separate circular Search button */}
      <GlobalSearchOverlay
        open={globalSearchOpen}
        onOpenChange={setGlobalSearchOpen}
        songs={songs}
        favoriteIds={favoriteIds}
        onSelectSong={(song) => handleOpenPlayer(song, songs)}
        onOpenSongActionMenu={handleOpenSongActionMenu}
        portalContainer={portalContainer}
        onTriggerHaptic={triggerHaptic}
      />

      {/* Full-Screen Music Player Overlay */}
      <MusicPlayerSheet
        open={playerOpen}
        song={currentSong}
        isPlaying={isPlaying}
        isShuffled={isShuffled}
        isFavorite={currentSong ? favoriteIds.has(currentSong.id) : false}
        isInAnyPlaylist={isCurrentSongInAnyPlaylist}
        elapsedSeconds={elapsedSeconds}
        onClose={() => setPlayerOpen(false)}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        onToggleShuffle={() => setIsShuffled((prev) => !prev)}
        onPrevious={handlePreviousTrack}
        onNext={handleNextTrack}
        onSeek={(sec) => setElapsedSeconds(sec)}
        onToggleFavorite={handleToggleSingleFavorite}
        onOpenPlaylistPicker={() => {
          if (!currentSong) return;
          setPlaylistPickerSongIds([currentSong.id]);
          setPlaylistPickerOpen(true);
        }}
        portalContainer={portalContainer}
        onTriggerHaptic={triggerHaptic}
      />

      {/* Unified Local Playlist Picker Sheet (supports single player track & multi-select bulk selection) */}
      <PlaylistPickerSheet
        open={playlistPickerOpen}
        onOpenChange={setPlaylistPickerOpen}
        targetSongs={playlistPickerSongs}
        playlists={playlists}
        onToggleSongsInPlaylist={handleToggleSongsInPlaylist}
        portalContainer={portalContainer}
        onTriggerHaptic={triggerHaptic}
      />
    </MobileFrame>
  );
}
