import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_SONGS } from '../data/songs';
import { INITIAL_PLAYLISTS } from '../data/playlists';
import {
  PersistedAppStateV1,
  STORAGE_KEY,
  StorageLike,
  loadPersistedState,
  savePersistedState,
} from './storage';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => (map.has(k) ? map.get(k)! : null),
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
}

test('Versioned persistence round-trips all core library, settings, and player states', () => {
  const store = createMemoryStorage();
  const sampleState: PersistedAppStateV1 = {
    version: 1,
    songs: INITIAL_SONGS.slice(0, 5),
    favoriteIds: ['song-001', 'song-004'],
    archivedIds: ['song-002'],
    recommendedLessIds: ['song-003'],
    playlists: INITIAL_PLAYLISTS,
    locationEnabled: false,
    hapticEnabled: false,
    sort: { field: 'artist', order: 'oldest' },
    isShuffled: true,
    repeatMode: 'one',
  };

  assert.equal(savePersistedState(sampleState, store), true);

  const loaded = loadPersistedState(INITIAL_SONGS, store);
  assert.ok(loaded);
  assert.equal(loaded.songs?.length, 5);
  assert.deepEqual(loaded.favoriteIds, ['song-001', 'song-004']);
  assert.deepEqual(loaded.archivedIds, ['song-002']);
  assert.deepEqual(loaded.recommendedLessIds, ['song-003']);
  assert.equal(loaded.playlists?.length, INITIAL_PLAYLISTS.length);
  assert.equal(loaded.locationEnabled, false);
  assert.equal(loaded.hapticEnabled, false);
  assert.deepEqual(loaded.sort, { field: 'artist', order: 'oldest' });
  assert.equal(loaded.isShuffled, true);
  assert.equal(loaded.repeatMode, 'one');
});

test('Rejects unknown schema versions and malformed JSON safely', () => {
  const store = createMemoryStorage();

  store.setItem(STORAGE_KEY, '{invalid-json');
  assert.equal(loadPersistedState(INITIAL_SONGS, store), null);

  store.setItem(STORAGE_KEY, JSON.stringify({ version: 99, songs: [] }));
  assert.equal(loadPersistedState(INITIAL_SONGS, store), null);
});

test('Handles storage quota / private-mode errors gracefully without throwing', () => {
  const throwingStore: StorageLike = {
    getItem: () => {
      throw new Error('SecurityError');
    },
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
  };

  assert.equal(loadPersistedState(INITIAL_SONGS, throwingStore), null);
  assert.equal(
    savePersistedState(
      {
        version: 1,
        songs: INITIAL_SONGS.slice(0, 1),
        favoriteIds: [],
        archivedIds: [],
        recommendedLessIds: [],
        playlists: INITIAL_PLAYLISTS,
        locationEnabled: true,
        hapticEnabled: true,
        sort: { field: 'dateFound', order: 'newest' },
        isShuffled: false,
        repeatMode: 'off',
      },
      throwingStore
    ),
    false
  );
});

test('Refreshes canonical hero artwork imageUrl on hydrate to prevent stale build asset hashes', () => {
  const store = createMemoryStorage();
  const canonicalWithUrl = {
    ...INITIAL_SONGS[0],
    artwork: {
      ...INITIAL_SONGS[0].artwork,
      imageUrl: '/assets/new-build-hash.jpg',
    },
  };
  const persistedWithOldHash = {
    ...INITIAL_SONGS[0],
    artwork: {
      ...INITIAL_SONGS[0].artwork,
      imageUrl: '/assets/stale-old-hash.jpg',
    },
  };

  savePersistedState(
    {
      version: 1,
      songs: [persistedWithOldHash],
      favoriteIds: [],
      archivedIds: [],
      recommendedLessIds: [],
      playlists: INITIAL_PLAYLISTS,
      locationEnabled: true,
      hapticEnabled: true,
      sort: { field: 'dateFound', order: 'newest' },
      isShuffled: false,
      repeatMode: 'off',
    },
    store
  );

  const loaded = loadPersistedState([canonicalWithUrl], store);
  assert.equal(loaded?.songs?.[0].artwork.imageUrl, '/assets/new-build-hash.jpg');
});
