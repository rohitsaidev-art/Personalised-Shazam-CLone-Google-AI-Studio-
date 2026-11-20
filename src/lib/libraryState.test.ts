import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SONGS } from '../data/songs.ts';
import { INITIAL_PLAYLISTS } from '../data/playlists.ts';
import {
  addIdsToSet,
  removeIdsFromSet,
  removeSongsWithSnapshot,
  resolveMultiSelectCategoryNav,
  restoreSongsFromSnapshot,
} from './libraryState.ts';

test('Single destructive delete + Undo restores song at exact index and playlist memberships', () => {
  const target = INITIAL_SONGS[0];
  const { nextSongs, nextPlaylists, snapshot } = removeSongsWithSnapshot(
    INITIAL_SONGS,
    INITIAL_PLAYLISTS,
    [target.id]
  );

  assert.equal(nextSongs.length, INITIAL_SONGS.length - 1);
  assert.ok(!nextSongs.some((s) => s.id === target.id));
  assert.ok(nextPlaylists.every((pl) => !pl.songIds.includes(target.id)));

  const { restoredSongs, restoredPlaylists } = restoreSongsFromSnapshot(
    nextSongs,
    nextPlaylists,
    snapshot
  );

  assert.equal(restoredSongs.length, INITIAL_SONGS.length);
  assert.equal(restoredSongs[0].id, target.id);
  // song-001 was in pl-late-night initially
  const lateNight = restoredPlaylists.find((p) => p.id === 'pl-late-night');
  assert.ok(lateNight?.songIds.includes(target.id));
});

test('Bulk destructive delete + Undo restores multiple songs in original order', () => {
  const ids = [INITIAL_SONGS[0].id, INITIAL_SONGS[2].id, INITIAL_SONGS[4].id];
  const { nextSongs, nextPlaylists, snapshot } = removeSongsWithSnapshot(
    INITIAL_SONGS,
    INITIAL_PLAYLISTS,
    ids
  );

  assert.equal(nextSongs.length, INITIAL_SONGS.length - 3);

  const { restoredSongs } = restoreSongsFromSnapshot(nextSongs, nextPlaylists, snapshot);
  assert.equal(restoredSongs.length, INITIAL_SONGS.length);
  assert.equal(restoredSongs[0].id, ids[0]);
  assert.equal(restoredSongs[2].id, ids[1]);
  assert.equal(restoredSongs[4].id, ids[2]);
});

test('Archive and Unarchive are immediate reversible Set transitions', () => {
  const initial = new Set<string>();
  const archived = addIdsToSet(initial, ['song-001', 'song-003']);
  assert.equal(archived.size, 2);
  assert.ok(archived.has('song-001'));
  assert.ok(archived.has('song-003'));

  const undone = removeIdsFromSet(archived, ['song-001']);
  assert.equal(undone.size, 1);
  assert.ok(!undone.has('song-001'));
  assert.ok(undone.has('song-003'));
});

test('Recommend Less flags tracks and supports Undo cleanly', () => {
  const initial = new Set<string>();
  const flagged = addIdsToSet(initial, ['song-002']);
  assert.ok(flagged.has('song-002'));
  const reverted = removeIdsFromSet(flagged, ['song-002']);
  assert.equal(reverted.size, 0);
});

test('Multi-select Go to Artist / Go to Genre resolves context-sensitively (0, 1, 2+ unique)', () => {
  assert.deepEqual(resolveMultiSelectCategoryNav([], 'artists'), { mode: 'empty' });

  // Two songs by the same artist -> direct navigation
  const anneSongs = INITIAL_SONGS.filter((s) => s.artists[0] === 'Anne Amie').slice(0, 2);
  assert.equal(anneSongs.length, 2);
  assert.deepEqual(resolveMultiSelectCategoryNav(anneSongs, 'artists'), {
    mode: 'direct',
    value: 'Anne Amie',
  });

  // Two songs by distinct artists -> Explore OR-filter with BOTH artists (never arbitrary 1)
  const mixed = [INITIAL_SONGS[0], INITIAL_SONGS[1]];
  const nav = resolveMultiSelectCategoryNav(mixed, 'artists');
  assert.equal(nav.mode, 'explore');
  if (nav.mode === 'explore') {
    assert.deepEqual(nav.values, ['Laufey', 'JAY-Z & Kanye West']);
  }

  // Distinct genres -> Explore OR-filter with ALL unique genres
  const genreNav = resolveMultiSelectCategoryNav(mixed, 'genres');
  assert.equal(genreNav.mode, 'explore');
  if (genreNav.mode === 'explore') {
    assert.deepEqual(genreNav.values, ['Jazz Pop', 'Alternative Rap']);
  }
});
