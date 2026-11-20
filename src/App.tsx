import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  AppTab,
  CandidateCorrection,
  ExploreFilters,
  FilterCategoryKey,
  QuickFilterState,
  RepeatMode,
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
import { ConfirmDialog } from './components/ConfirmDialog';
import {
  addIdsToSet,
  removeIdsFromSet,
  removeSongsWithSnapshot,
  resolveMultiSelectCategoryNav,
  restoreSongsFromSnapshot,
} from './lib/libraryState';
import {
  buildPlaybackOrder,
  cycleRepeatMode,
  resolveManualNext,
  resolveManualPrevious,
  resolveSimulatedTrackEnd,
  syncPlaybackOrder,
} from './lib/playbackSim';
import { loadPersistedState, savePersistedState } from './lib/storage';
import { HomeScreen } from './screens/HomeScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { NowPlayingScreen } from './screens/NowPlayingScreen';

interface ActionMenuTarget {
  song: Song;
  rect: DOMRect;
}

interface ToastState {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

type ConfirmRequest =
  | { kind: 'remove-single'; song: Song }
  | { kind: 'remove-bulk'; songIds: string[] }
  | { kind: 'recommend-less-single'; song: Song }
  | { kind: 'recommend-less-bulk'; songIds: string[] };

export default function App() {
  const prefersReducedMotion = useReducedMotion();
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalContainer(portalContainerRef.current);
  }, []);

  // Hydrate once synchronously from versioned localStorage (music_pwa_state_v1)
  const initialPersistedRef = useRef<ReturnType<typeof loadPersistedState> | undefined>(
    undefined
  );
  if (initialPersistedRef.current === undefined) {
    initialPersistedRef.current = loadPersistedState(INITIAL_SONGS);
  }
  const initialPersisted = initialPersistedRef.current;

  // Single canonical song dataset (starts with exactly 83 records on fresh boot)
  const [songs, setSongs] = useState<Song[]>(
    () => initialPersisted?.songs ?? INITIAL_SONGS
  );
  const demoIndexRef = useRef(0);

  // Navigation & persistent chrome state
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [libraryScrollToTopSignal, setLibraryScrollToTopSignal] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Settings (strictly Location & Haptic Feedback only)
  const [locationEnabled, setLocationEnabled] = useState(
    () => initialPersisted?.locationEnabled ?? true
  );
  const [hapticEnabled, setHapticEnabled] = useState(
    () => initialPersisted?.hapticEnabled ?? true
  );

  // Library sort, search, quick filter & advanced Explore state
  const [sort, setSort] = useState<SortConfig>(
    () =>
      initialPersisted?.sort ?? {
        field: 'dateFound',
        order: 'newest',
      }
  );
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
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(
    () => new Set(initialPersisted?.favoriteIds ?? ['song-001', 'song-003'])
  );
  // Distinct Library-level Archive view/filter (never a 6th Explore category) & Recommend Less flags
  const [archivedIds, setArchivedIds] = useState<Set<string>>(
    () => new Set(initialPersisted?.archivedIds ?? [])
  );
  const [recommendedLessIds, setRecommendedLessIds] = useState<Set<string>>(
    () => new Set(initialPersisted?.recommendedLessIds ?? [])
  );
  const [viewingArchived, setViewingArchived] = useState(false);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);

  // Music Player & local playlists state (100% simulated playback timer)
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [playerQueueIds, setPlayerQueueIds] = useState<string[]>([]);
  const [shuffledOrderIds, setShuffledOrderIds] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(
    () => initialPersisted?.isShuffled ?? false
  );
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(
    () => initialPersisted?.repeatMode ?? 'off'
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const playHistoryRef = useRef<string[]>([]);

  const [playlists, setPlaylists] = useState<Playlist[]>(
    () => initialPersisted?.playlists ?? INITIAL_PLAYLISTS
  );
  const [playlistPickerOpen, setPlaylistPickerOpen] = useState(false);
  const [playlistPickerSongIds, setPlaylistPickerSongIds] = useState<string[]>([]);

  // Debounced versioned persistence to localStorage (graceful fallback on quota/private-mode)
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      savePersistedState({
        version: 1,
        songs,
        favoriteIds: Array.from(favoriteIds),
        archivedIds: Array.from(archivedIds),
        recommendedLessIds: Array.from(recommendedLessIds),
        playlists,
        locationEnabled,
        hapticEnabled,
        sort,
        isShuffled,
        repeatMode,
      });
    }, 150);

    return () => window.clearTimeout(timerId);
  }, [
    songs,
    favoriteIds,
    archivedIds,
    recommendedLessIds,
    playlists,
    locationEnabled,
    hapticEnabled,
    sort,
    isShuffled,
    repeatMode,
  ]);

  // Transient subtle feedback toast (supports actionable Undo pill)
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      options?: { actionLabel?: string; onAction?: () => void; durationMs?: number }
    ) => {
      setToast({
        message,
        actionLabel: options?.actionLabel,
        onAction: options?.onAction,
      });
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      const duration = options?.durationMs ?? (options?.actionLabel ? 4000 : 2400);
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, duration);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const activeSongs = useMemo(
    () => songs.filter((s) => !archivedIds.has(s.id)),
    [songs, archivedIds]
  );

  const archivedSongs = useMemo(
    () => songs.filter((s) => archivedIds.has(s.id)),
    [songs, archivedIds]
  );

  useEffect(() => {
    if (viewingArchived && archivedIds.size === 0) {
      setViewingArchived(false);
    }
  }, [viewingArchived, archivedIds.size]);

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
    setAppliedExploreFilters(EMPTY_EXPLORE_FILTERS);
    setIsAdvancedResultsActive(false);
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

  const requestRemoveSingleSong = useCallback(
    (songId: string) => {
      const target = songs.find((s) => s.id === songId);
      if (!target) return;
      setConfirmRequest({ kind: 'remove-single', song: target });
    },
    [songs]
  );

  const executeRemoveSongs = useCallback(
    (targetIds: string[], exitMultiSelectAfter: boolean) => {
      if (targetIds.length === 0) return;
      const { nextSongs, nextPlaylists, snapshot } = removeSongsWithSnapshot(
        songs,
        playlists,
        targetIds
      );
      if (snapshot.removedEntries.length === 0) return;

      const previouslyArchivedIds = targetIds.filter((id) => archivedIds.has(id));
      triggerHaptic();
      setSongs(nextSongs);
      setPlaylists(nextPlaylists);
      setArchivedIds((prev) => removeIdsFromSet(prev, targetIds));
      setRecommendedLessIds((prev) => removeIdsFromSet(prev, targetIds));
      setSelectedSongIds((prev) => removeIdsFromSet(prev, targetIds));
      if (exitMultiSelectAfter) {
        setIsMultiSelectMode(false);
        setSelectedSongIds(new Set());
      }

      const count = snapshot.removedEntries.length;
      const label =
        count === 1
          ? `Removed "${snapshot.removedEntries[0].song.title}"`
          : `Removed ${count} songs from Library`;

      showToast(label, {
        actionLabel: 'Undo',
        durationMs: 4000,
        onAction: () => {
          setSongs((currSongs) => {
            const { restoredSongs } = restoreSongsFromSnapshot(
              currSongs,
              playlists,
              snapshot
            );
            return restoredSongs;
          });
          setPlaylists((currPlaylists) => {
            const { restoredPlaylists } = restoreSongsFromSnapshot(
              songs,
              currPlaylists,
              snapshot
            );
            return restoredPlaylists;
          });
          if (previouslyArchivedIds.length > 0) {
            setArchivedIds((prev) => addIdsToSet(prev, previouslyArchivedIds));
          }
        },
      });
    },
    [songs, playlists, archivedIds, triggerHaptic, showToast]
  );

  // Archive is immediate and reversible with Undo (no confirmation dialog)
  const handleArchiveSongs = useCallback(
    (targetIds: string[], titleForSingle?: string) => {
      if (targetIds.length === 0) return;
      triggerHaptic();
      setArchivedIds((prev) => addIdsToSet(prev, targetIds));
      setSelectedSongIds((prev) => removeIdsFromSet(prev, targetIds));
      const count = targetIds.length;
      const message =
        count === 1 && titleForSingle
          ? `Archived "${titleForSingle}"`
          : `Archived ${count} ${count === 1 ? 'song' : 'songs'}`;
      showToast(message, {
        actionLabel: 'Undo',
        durationMs: 4000,
        onAction: () => {
          setArchivedIds((prev) => removeIdsFromSet(prev, targetIds));
        },
      });
    },
    [triggerHaptic, showToast]
  );

  const handleUnarchiveSongs = useCallback(
    (targetIds: string[], titleForSingle?: string) => {
      if (targetIds.length === 0) return;
      triggerHaptic();
      setArchivedIds((prev) => removeIdsFromSet(prev, targetIds));
      const count = targetIds.length;
      const message =
        count === 1 && titleForSingle
          ? `Restored "${titleForSingle}" to Library`
          : `Restored ${count} ${count === 1 ? 'song' : 'songs'} to Library`;
      showToast(message, {
        actionLabel: 'Undo',
        durationMs: 4000,
        onAction: () => {
          setArchivedIds((prev) => addIdsToSet(prev, targetIds));
        },
      });
    },
    [triggerHaptic, showToast]
  );

  // Recommend Less requires lightweight confirmation before applying preference, followed by Undo toast
  const requestRecommendLessSingle = useCallback((song: Song) => {
    setConfirmRequest({ kind: 'recommend-less-single', song });
  }, []);

  const executeRecommendLess = useCallback(
    (targetIds: string[], titleForSingle?: string) => {
      if (targetIds.length === 0) return;
      const newlyAdded = targetIds.filter((id) => !recommendedLessIds.has(id));
      triggerHaptic();
      setRecommendedLessIds((prev) => addIdsToSet(prev, targetIds));
      const count = targetIds.length;
      const message =
        count === 1 && titleForSingle
          ? `Recommending less like "${titleForSingle}"`
          : `Recommending less like ${count} ${count === 1 ? 'song' : 'songs'}`;
      showToast(message, {
        actionLabel: 'Undo',
        durationMs: 4000,
        onAction: () => {
          setRecommendedLessIds((prev) =>
            removeIdsFromSet(prev, newlyAdded.length > 0 ? newlyAdded : targetIds)
          );
        },
      });
    },
    [recommendedLessIds, triggerHaptic, showToast]
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
    setConfirmRequest({ kind: 'remove-bulk', songIds: Array.from(selectedSongIds) });
  }, [selectedSongIds, triggerHaptic, showToast]);

  const selectedSongs = useMemo(
    () => songs.filter((s) => selectedSongIds.has(s.id)),
    [songs, selectedSongIds]
  );

  const allSelectedFavorited = useMemo(
    () =>
      selectedSongIds.size > 0 &&
      Array.from(selectedSongIds).every((id) => favoriteIds.has(id)),
    [selectedSongIds, favoriteIds]
  );

  const handleBulkToggleFavorite = useCallback(() => {
    if (selectedSongIds.size === 0) {
      showToast('Select songs to favorite');
      return;
    }
    triggerHaptic();
    const ids = Array.from(selectedSongIds);
    const count = ids.length;
    if (allSelectedFavorited) {
      setFavoriteIds((prev) => removeIdsFromSet(prev, ids));
      showToast(`Removed ${count} ${count === 1 ? 'song' : 'songs'} from Liked Songs`);
    } else {
      setFavoriteIds((prev) => addIdsToSet(prev, ids));
      showToast(`Added ${count} ${count === 1 ? 'song' : 'songs'} to Liked Songs`);
    }
  }, [selectedSongIds, allSelectedFavorited, triggerHaptic, showToast]);

  const handleBulkArchiveOrRestore = useCallback(() => {
    if (selectedSongIds.size === 0) {
      showToast('Select songs first');
      return;
    }
    const ids = Array.from(selectedSongIds);
    const singleTitle = ids.length === 1 ? selectedSongs[0]?.title : undefined;
    if (viewingArchived) {
      handleUnarchiveSongs(ids, singleTitle);
    } else {
      handleArchiveSongs(ids, singleTitle);
    }
    setIsMultiSelectMode(false);
    setSelectedSongIds(new Set());
  }, [
    selectedSongIds,
    selectedSongs,
    viewingArchived,
    handleArchiveSongs,
    handleUnarchiveSongs,
    showToast,
  ]);

  const handleBulkRecommendLess = useCallback(() => {
    if (selectedSongIds.size === 0) {
      showToast('Select songs first');
      return;
    }
    triggerHaptic();
    const ids = Array.from(selectedSongIds);
    if (ids.length === 1 && selectedSongs[0]) {
      setConfirmRequest({ kind: 'recommend-less-single', song: selectedSongs[0] });
    } else {
      setConfirmRequest({ kind: 'recommend-less-bulk', songIds: ids });
    }
  }, [selectedSongIds, selectedSongs, triggerHaptic, showToast]);

  const handleBulkGoToCategory = useCallback(
    (category: 'artists' | 'genres') => {
      const nav = resolveMultiSelectCategoryNav(selectedSongs, category);
      if (nav.mode === 'empty') {
        showToast(
          category === 'artists'
            ? 'Select songs to view artist'
            : 'Select songs to view genre'
        );
        return;
      }

      triggerHaptic();
      setViewingArchived(false);
      setIsMultiSelectMode(false);
      setSelectedSongIds(new Set());

      if (nav.mode === 'direct') {
        if (category === 'artists') {
          handleGoToArtist(nav.value);
        } else {
          handleGoToGenre(nav.value);
        }
        return;
      }

      // Multiple unique values -> open Explore pre-populated with ALL selected values using OR-within-category logic
      setQuickFilter({
        openCategory: null,
        selectedCategory: null,
        selectedValue: null,
      });
      setExploreDraftFilters({
        ...EMPTY_EXPLORE_FILTERS,
        [category]: nav.values,
      });
      setExploreOpen(true);
    },
    [selectedSongs, triggerHaptic, showToast, handleGoToArtist, handleGoToGenre]
  );

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
      if (tab === 'library' && activeTab === 'library') {
        setLibraryScrollToTopSignal((n) => n + 1);
      }
      if (tab !== 'library' && isMultiSelectMode) {
        setIsMultiSelectMode(false);
        setSelectedSongIds(new Set());
      }
      setActiveTab(tab);
    },
    [activeTab, triggerHaptic, isMultiSelectMode]
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

  const validQueueIds = useMemo(() => {
    const existingSongIds = new Set(songs.map((s) => s.id));
    const base =
      playerQueueIds.length > 0 ? playerQueueIds : activeSongs.map((s) => s.id);
    return base.filter((id) => existingSongIds.has(id));
  }, [playerQueueIds, songs, activeSongs]);

  const activePlaybackSequence = useMemo(() => {
    if (!isShuffled) return validQueueIds;
    return syncPlaybackOrder(shuffledOrderIds, validQueueIds);
  }, [isShuffled, shuffledOrderIds, validQueueIds]);

  const handleOpenPlayer = useCallback(
    (song: Song, queue?: Song[]) => {
      const nextQueueIds =
        queue && queue.length > 0 ? queue.map((s) => s.id) : activeSongs.map((s) => s.id);
      setPlayerQueueIds(nextQueueIds);
      if (isShuffled) {
        setShuffledOrderIds(buildPlaybackOrder(nextQueueIds, song.id, true));
      }
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
    [activeSongs, currentSongId, isShuffled]
  );

  const handleToggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const next = !prev;
      if (next) {
        setShuffledOrderIds(buildPlaybackOrder(validQueueIds, currentSongId, true));
      }
      return next;
    });
  }, [validQueueIds, currentSongId]);

  const handleCycleRepeat = useCallback(() => {
    setRepeatMode((prev) => cycleRepeatMode(prev));
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && currentSong) {
        const duration = getSongDurationSeconds(currentSong.id);
        if (elapsedSeconds >= duration) {
          setElapsedSeconds(0);
        }
      }
      return !prev;
    });
  }, [currentSong, elapsedSeconds]);

  const handleNextTrack = useCallback(() => {
    if (activePlaybackSequence.length === 0) return;
    const { nextSongId, nextElapsed } = resolveManualNext(
      currentSongId,
      activePlaybackSequence
    );
    if (!nextSongId) return;
    if (currentSongId && nextSongId !== currentSongId) {
      playHistoryRef.current = [...playHistoryRef.current.slice(-24), currentSongId];
    }
    setCurrentSongId(nextSongId);
    setElapsedSeconds(nextElapsed);
  }, [activePlaybackSequence, currentSongId]);

  const handlePreviousTrack = useCallback(() => {
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

    const { nextSongId, nextElapsed } = resolveManualPrevious(
      currentSongId,
      activePlaybackSequence,
      elapsedSeconds
    );
    if (!nextSongId) return;
    setCurrentSongId(nextSongId);
    setElapsedSeconds(nextElapsed);
  }, [elapsedSeconds, songs, currentSongId, activePlaybackSequence]);

  // Simulated 250ms playback progress ticker (no real audio engine)
  useEffect(() => {
    if (!isPlaying || !currentSong) return;
    const duration = getSongDurationSeconds(currentSong.id);

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((prev) => Math.min(duration, prev + 0.25));
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [isPlaying, currentSong]);

  // Pure end-of-track transition handling Repeat Off / All / One and Shuffle
  useEffect(() => {
    if (!isPlaying || !currentSong) return;
    const duration = getSongDurationSeconds(currentSong.id);
    if (elapsedSeconds < duration) return;

    const outcome = resolveSimulatedTrackEnd({
      currentSongId: currentSong.id,
      activeSequence: activePlaybackSequence,
      repeatMode,
      currentDurationSeconds: duration,
    });

    if (outcome.nextSongId && outcome.nextSongId !== currentSong.id) {
      playHistoryRef.current = [...playHistoryRef.current.slice(-24), currentSong.id];
      setCurrentSongId(outcome.nextSongId);
    }
    setElapsedSeconds(outcome.nextElapsed);
    if (!outcome.nextIsPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentSong, elapsedSeconds, activePlaybackSequence, repeatMode]);

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
                recentSongs={activeSongs}
                onOpenSettings={() => setSettingsOpen(true)}
                onIdentifyDemoTrack={handleIdentifyDemoTrack}
                onSelectRecentSong={(song) => handleOpenPlayer(song, activeSongs)}
                onTriggerHaptic={triggerHaptic}
              />
            )}

            {activeTab === 'library' && (
              <LibraryScreen
                songs={viewingArchived ? archivedSongs : activeSongs}
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
                currentSongId={currentSongId}
                isPlaying={isPlaying}
                archivedCount={archivedIds.size}
                viewingArchived={viewingArchived}
                scrollToTopSignal={libraryScrollToTopSignal}
                onToggleViewingArchived={(next) => {
                  setViewingArchived(next);
                  setIsMultiSelectMode(false);
                  setSelectedSongIds(new Set());
                }}
                onExitMultiSelect={handleExitMultiSelect}
                onToggleSongSelect={handleToggleSongSelect}
                onToggleFavorite={handleToggleSingleFavorite}
                onSelectSong={handleOpenPlayer}
                onOpenSongActionMenu={handleOpenSongActionMenu}
                portalContainer={portalContainer}
                onTriggerHaptic={triggerHaptic}
              />
            )}

            {activeTab === 'now-playing' && <NowPlayingScreen />}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Chrome: Multi-Select glass capsule OR Floating Bottom Navigation + Separate Search */}
        <AnimatePresence mode="wait">
          {activeTab === 'library' && isMultiSelectMode ? (
            <MultiSelectActionControls
              key="multi-select-controls"
              selectedCount={selectedSongIds.size}
              allSelectedFavorited={allSelectedFavorited}
              viewingArchived={viewingArchived}
              onBulkDelete={handleBulkDelete}
              onBulkToggleFavorite={handleBulkToggleFavorite}
              onBulkAddToCollection={handleBulkAddToCollection}
              onBulkArchiveOrRestore={handleBulkArchiveOrRestore}
              onBulkRecommendLess={handleBulkRecommendLess}
              onBulkGoToArtist={() => handleBulkGoToCategory('artists')}
              onBulkGoToGenre={() => handleBulkGoToCategory('genres')}
              onEmptySelectionHint={(msg) => showToast(msg)}
              portalContainer={portalContainer}
              onTriggerHaptic={triggerHaptic}
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

        {/* Subtle transient feedback toast (supports actionable Undo pill) */}
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.message}
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
              className="pointer-events-none absolute inset-x-4 top-[calc(var(--safe-top)+10px)] md:top-3 z-[80] flex justify-center"
            >
              <div className="pointer-events-auto glass-popover flex items-center gap-3 rounded-full px-4 py-2 text-[13px] font-medium text-white shadow-lg">
                <span className="truncate max-w-[230px]">{toast.message}</span>
                {toast.actionLabel && toast.onAction && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      const fn = toast.onAction;
                      dismissToast();
                      fn?.();
                    }}
                    className="pressable shrink-0 rounded-full px-2 py-0.5 text-[13px] font-semibold text-[var(--accent-blue)] hover:bg-white/[0.08] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]"
                  >
                    {toast.actionLabel}
                  </button>
                )}
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

      {/* Advanced Explore Multi-Filter Sheet (strictly 5 discovery categories, OR-within / AND-across logic) */}
      <ExploreFilterSheet
        open={exploreOpen}
        songs={activeSongs}
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

      {/* Song Long-Press Contextual Menu (Spatially anchored, includes Archive & Recommend Less) */}
      <SongActionMenu
        song={actionMenuTarget?.song ?? null}
        anchorRect={actionMenuTarget?.rect ?? null}
        isArchived={
          actionMenuTarget ? archivedIds.has(actionMenuTarget.song.id) : false
        }
        onClose={() => setActionMenuTarget(null)}
        onSelectMode={handleEnterMultiSelectFromMenu}
        onArchiveSong={(id) => {
          const target = songs.find((s) => s.id === id);
          handleArchiveSongs([id], target?.title);
        }}
        onUnarchiveSong={(id) => {
          const target = songs.find((s) => s.id === id);
          handleUnarchiveSongs([id], target?.title);
        }}
        onRecommendLess={requestRecommendLessSingle}
        onRemoveSong={requestRemoveSingleSong}
        onReportWrongSong={(s) => setWrongSongTarget(s)}
        onGoToArtist={(artist) => {
          setViewingArchived(false);
          handleGoToArtist(artist);
        }}
        onGoToGenre={(genre) => {
          setViewingArchived(false);
          handleGoToGenre(genre);
        }}
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
        songs={activeSongs}
        favoriteIds={favoriteIds}
        currentSongId={currentSongId}
        isPlaying={isPlaying}
        onToggleFavorite={handleToggleSingleFavorite}
        onSelectSong={(song) => handleOpenPlayer(song, activeSongs)}
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
        repeatMode={repeatMode}
        isFavorite={currentSong ? favoriteIds.has(currentSong.id) : false}
        isArchived={currentSong ? archivedIds.has(currentSong.id) : false}
        isInAnyPlaylist={isCurrentSongInAnyPlaylist}
        elapsedSeconds={elapsedSeconds}
        onClose={() => setPlayerOpen(false)}
        onTogglePlay={handleTogglePlay}
        onToggleShuffle={handleToggleShuffle}
        onCycleRepeat={handleCycleRepeat}
        onPrevious={handlePreviousTrack}
        onNext={handleNextTrack}
        onSeek={(sec) => setElapsedSeconds(sec)}
        onToggleFavorite={handleToggleSingleFavorite}
        onOpenPlaylistPicker={() => {
          if (!currentSong) return;
          setPlaylistPickerSongIds([currentSong.id]);
          setPlaylistPickerOpen(true);
        }}
        onArchiveSong={(targetSong) => {
          handleArchiveSongs([targetSong.id], targetSong.title);
          setPlayerOpen(false);
          setIsPlaying(false);
        }}
        onUnarchiveSong={(targetSong) => {
          handleUnarchiveSongs([targetSong.id], targetSong.title);
        }}
        onGoToArtist={(artist) => {
          setPlayerOpen(false);
          setViewingArchived(false);
          handleGoToArtist(artist);
        }}
        onRecommendLess={(targetSong) => {
          requestRecommendLessSingle(targetSong);
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

      {/* Apple-HIG Confirmation Dialog for Permanent Destructive Removals & Recommend Less */}
      <ConfirmDialog
        open={confirmRequest !== null}
        title={
          confirmRequest?.kind === 'remove-single'
            ? 'Remove from Library?'
            : confirmRequest?.kind === 'remove-bulk'
              ? `Remove ${confirmRequest.songIds.length} ${confirmRequest.songIds.length === 1 ? 'Song' : 'Songs'}?`
              : 'Recommend less like this?'
        }
        description={
          confirmRequest?.kind === 'remove-single'
            ? `"${confirmRequest.song.title}" by ${confirmRequest.song.artist} will be permanently removed from your Library and playlists.`
            : confirmRequest?.kind === 'remove-bulk'
              ? `${confirmRequest.songIds.length} selected ${confirmRequest.songIds.length === 1 ? 'song' : 'songs'} will be permanently removed from your Library and playlists.`
              : confirmRequest?.kind === 'recommend-less-single'
                ? `Fewer tracks similar to "${confirmRequest.song.title}" will be recommended.`
                : confirmRequest?.kind === 'recommend-less-bulk'
                  ? `Fewer tracks similar to these ${confirmRequest.songIds.length} selected ${confirmRequest.songIds.length === 1 ? 'song' : 'songs'} will be recommended.`
                  : ''
        }
        confirmLabel={
          confirmRequest?.kind === 'recommend-less-single' ||
          confirmRequest?.kind === 'recommend-less-bulk'
            ? 'Recommend Less'
            : 'Remove'
        }
        variant={
          confirmRequest?.kind === 'recommend-less-single' ||
          confirmRequest?.kind === 'recommend-less-bulk'
            ? 'neutral'
            : 'destructive'
        }
        onCancel={() => setConfirmRequest(null)}
        onConfirm={() => {
          const req = confirmRequest;
          setConfirmRequest(null);
          if (!req) return;
          if (req.kind === 'remove-single') {
            executeRemoveSongs([req.song.id], false);
          } else if (req.kind === 'remove-bulk') {
            executeRemoveSongs(req.songIds, true);
          } else if (req.kind === 'recommend-less-single') {
            executeRecommendLess([req.song.id], req.song.title);
          } else if (req.kind === 'recommend-less-bulk') {
            executeRecommendLess(req.songIds);
            setIsMultiSelectMode(false);
            setSelectedSongIds(new Set());
          }
        }}
        portalContainer={portalContainer}
      />
    </MobileFrame>
  );
}
