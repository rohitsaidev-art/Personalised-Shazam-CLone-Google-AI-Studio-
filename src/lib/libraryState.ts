import type { Song } from '../types/music';
import type { Playlist } from '../data/playlists';

export interface RemovedSongsSnapshot {
  removedEntries: Array<{ song: Song; index: number }>;
  previousPlaylists: Playlist[];
  removedIds: string[];
}

export function removeSongsWithSnapshot(
  songs: Song[],
  playlists: Playlist[],
  targetIds: string[]
): {
  nextSongs: Song[];
  nextPlaylists: Playlist[];
  snapshot: RemovedSongsSnapshot;
} {
  const removeSet = new Set(targetIds);
  const removedEntries: Array<{ song: Song; index: number }> = [];

  songs.forEach((song, index) => {
    if (removeSet.has(song.id)) {
      removedEntries.push({ song, index });
    }
  });

  const nextSongs = songs.filter((s) => !removeSet.has(s.id));
  const previousPlaylists = playlists.map((pl) => ({
    ...pl,
    songIds: [...pl.songIds],
  }));
  const nextPlaylists = playlists.map((pl) => ({
    ...pl,
    songIds: pl.songIds.filter((id) => !removeSet.has(id)),
  }));

  return {
    nextSongs,
    nextPlaylists,
    snapshot: {
      removedEntries,
      previousPlaylists,
      removedIds: removedEntries.map((e) => e.song.id),
    },
  };
}

export function restoreSongsFromSnapshot(
  currentSongs: Song[],
  currentPlaylists: Playlist[],
  snapshot: RemovedSongsSnapshot
): {
  restoredSongs: Song[];
  restoredPlaylists: Playlist[];
} {
  const existingIds = new Set(currentSongs.map((s) => s.id));
  const restoredSongs = [...currentSongs];

  // Re-insert in ascending original index order so every restored track lands back in place
  const sortedEntries = [...snapshot.removedEntries].sort((a, b) => a.index - b.index);
  for (const { song, index } of sortedEntries) {
    if (existingIds.has(song.id)) continue;
    const clampedIndex = Math.max(0, Math.min(index, restoredSongs.length));
    restoredSongs.splice(clampedIndex, 0, song);
    existingIds.add(song.id);
  }

  const prevMap = new Map(snapshot.previousPlaylists.map((pl) => [pl.id, pl.songIds]));
  const restoredIdsSet = new Set(snapshot.removedIds);

  const restoredPlaylists = currentPlaylists.map((pl) => {
    const prevSongIds = prevMap.get(pl.id);
    if (!prevSongIds) return pl;
    const currentSet = new Set(pl.songIds);
    const toRestore = prevSongIds.filter(
      (id) => restoredIdsSet.has(id) && !currentSet.has(id)
    );
    if (toRestore.length === 0) return pl;
    return { ...pl, songIds: [...pl.songIds, ...toRestore] };
  });

  return { restoredSongs, restoredPlaylists };
}

export function addIdsToSet(prev: Set<string>, ids: string[]): Set<string> {
  const next = new Set(prev);
  ids.forEach((id) => next.add(id));
  return next;
}

export function removeIdsFromSet(prev: Set<string>, ids: string[]): Set<string> {
  const next = new Set(prev);
  ids.forEach((id) => next.delete(id));
  return next;
}

export type MultiSelectCategoryNavResult =
  | { mode: 'empty' }
  | { mode: 'direct'; value: string }
  | { mode: 'explore'; values: string[] };

/**
 * Context-sensitive Multi-Select Go to Artist / Go to Genre resolution:
 * - 0 songs -> empty
 * - 1 unique value -> navigate directly via Quick Filter
 * - 2+ unique values -> open Explore pre-populated with ALL selected unique values (OR-within-category)
 * Never arbitrarily picks one item when multiple unique values are selected.
 */
export function resolveMultiSelectCategoryNav(
  selectedSongs: Song[],
  category: 'artists' | 'genres'
): MultiSelectCategoryNavResult {
  if (selectedSongs.length === 0) return { mode: 'empty' };

  const seen = new Set<string>();
  const unique: string[] = [];

  for (const song of selectedSongs) {
    const primary =
      category === 'artists'
        ? song.artists[0] ?? song.artist
        : song.genres[0];
    if (primary && !seen.has(primary)) {
      seen.add(primary);
      unique.push(primary);
    }
  }

  if (unique.length === 0) return { mode: 'empty' };
  if (unique.length === 1) return { mode: 'direct', value: unique[0] };
  return { mode: 'explore', values: unique };
}
