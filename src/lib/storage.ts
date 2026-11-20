import { RepeatMode, Song, SortConfig, SortField, SortOrder } from '../types/music';
import { Playlist } from '../data/playlists';

export const STORAGE_KEY = 'music_pwa_state_v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface PersistedAppStateV1 {
  version: 1;
  songs: Song[];
  favoriteIds: string[];
  archivedIds: string[];
  recommendedLessIds: string[];
  playlists: Playlist[];
  locationEnabled: boolean;
  hapticEnabled: boolean;
  sort: SortConfig;
  isShuffled: boolean;
  repeatMode: RepeatMode;
}

const VALID_SORT_FIELDS = new Set<SortField>(['dateFound', 'title', 'artist']);
const VALID_SORT_ORDERS = new Set<SortOrder>(['newest', 'oldest']);
const VALID_REPEAT_MODES = new Set<RepeatMode>(['off', 'all', 'one']);

function isValidStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function isValidSong(value: unknown): value is Song {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === 'string' &&
    typeof s.title === 'string' &&
    typeof s.artist === 'string' &&
    isValidStringArray(s.artists) &&
    typeof s.foundAt === 'number' &&
    isValidStringArray(s.genres) &&
    typeof s.city === 'string' &&
    isValidStringArray(s.moods) &&
    typeof s.decade === 'string' &&
    Boolean(s.artwork && typeof s.artwork === 'object')
  );
}

function isValidPlaylist(value: unknown): value is Playlist {
  if (!value || typeof value !== 'object') return false;
  const pl = value as Record<string, unknown>;
  return (
    typeof pl.id === 'string' &&
    typeof pl.name === 'string' &&
    isValidStringArray(pl.songIds)
  );
}

function getDefaultStorage(): StorageLike | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Loads and validates versioned localStorage state.
 * Optionally refreshes canonical hero `artwork.imageUrl` values from current build
 * so Vite-hashed static asset paths never go stale across deployments.
 */
export function loadPersistedState(
  canonicalSongs: Song[],
  storage?: StorageLike | null
): Partial<PersistedAppStateV1> | null {
  const store = storage === undefined ? getDefaultStorage() : storage;
  if (!store) return null;

  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const data = parsed as Record<string, unknown>;
    if (data.version !== 1) return null;

    const result: Partial<PersistedAppStateV1> = { version: 1 };

    if (Array.isArray(data.songs) && data.songs.every(isValidSong)) {
      const canonicalMap = new Map(canonicalSongs.map((s) => [s.id, s]));
      result.songs = data.songs.map((song) => {
        const canonical = canonicalMap.get(song.id);
        // Refresh canonical hero asset URL if title wasn't replaced via Wrong Song correction
        if (
          canonical &&
          canonical.title === song.title &&
          canonical.artwork.imageUrl
        ) {
          return {
            ...song,
            artwork: {
              ...song.artwork,
              imageUrl: canonical.artwork.imageUrl,
            },
          };
        }
        return song;
      });
    }

    if (isValidStringArray(data.favoriteIds)) {
      result.favoriteIds = data.favoriteIds;
    }
    if (isValidStringArray(data.archivedIds)) {
      result.archivedIds = data.archivedIds;
    }
    if (isValidStringArray(data.recommendedLessIds)) {
      result.recommendedLessIds = data.recommendedLessIds;
    }
    if (Array.isArray(data.playlists) && data.playlists.every(isValidPlaylist)) {
      result.playlists = data.playlists;
    }
    if (typeof data.locationEnabled === 'boolean') {
      result.locationEnabled = data.locationEnabled;
    }
    if (typeof data.hapticEnabled === 'boolean') {
      result.hapticEnabled = data.hapticEnabled;
    }
    if (data.sort && typeof data.sort === 'object') {
      const sortObj = data.sort as Record<string, unknown>;
      if (
        VALID_SORT_FIELDS.has(sortObj.field as SortField) &&
        VALID_SORT_ORDERS.has(sortObj.order as SortOrder)
      ) {
        result.sort = {
          field: sortObj.field as SortField,
          order: sortObj.order as SortOrder,
        };
      }
    }
    if (typeof data.isShuffled === 'boolean') {
      result.isShuffled = data.isShuffled;
    }
    if (VALID_REPEAT_MODES.has(data.repeatMode as RepeatMode)) {
      result.repeatMode = data.repeatMode as RepeatMode;
    }

    return result;
  } catch {
    return null;
  }
}

export function savePersistedState(
  state: PersistedAppStateV1,
  storage?: StorageLike | null
): boolean {
  const store = storage === undefined ? getDefaultStorage() : storage;
  if (!store) return false;

  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
