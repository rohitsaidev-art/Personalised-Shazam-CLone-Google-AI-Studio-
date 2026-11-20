import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_EXPLORE_FILTERS,
  INITIAL_SONGS,
  applyExploreFilters,
  applySearchQuery,
  hasActiveExploreFilters,
  sortSongs,
} from './songs.ts';

test('Canonical dataset starts with exactly 83 songs', () => {
  assert.equal(INITIAL_SONGS.length, 83);
});

test('F1: Empty ExploreFilters returns all active songs', () => {
  const result = applyExploreFilters(INITIAL_SONGS, EMPTY_EXPLORE_FILTERS);
  assert.equal(result.length, INITIAL_SONGS.length);
  assert.equal(hasActiveExploreFilters(EMPTY_EXPLORE_FILTERS), false);
});

test('F2: Artists multi-select uses OR within category (a-ha OR Amitabh Bhattacharya)', () => {
  const onlyAha = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['a-ha'],
  });
  const onlyAmitabh = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['Amitabh Bhattacharya'],
  });
  const combined = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['a-ha', 'Amitabh Bhattacharya'],
  });

  assert.ok(onlyAha.length >= 1, 'Expected at least 1 track for a-ha');
  assert.ok(onlyAmitabh.length >= 1, 'Expected at least 1 track for Amitabh Bhattacharya');

  const expectedIds = new Set([...onlyAha, ...onlyAmitabh].map((s) => s.id));
  assert.equal(combined.length, expectedIds.size);
  assert.ok(
    combined.every(
      (s) => s.artists.includes('a-ha') || s.artists.includes('Amitabh Bhattacharya')
    )
  );
});

test('F3: Artists multi-select union (Amitabh Bhattacharya OR Amrinder Gill)', () => {
  const onlyA = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['Amitabh Bhattacharya'],
  });
  const onlyB = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['Amrinder Gill'],
  });
  const union = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['Amitabh Bhattacharya', 'Amrinder Gill'],
  });

  assert.ok(onlyA.length >= 1);
  assert.ok(onlyB.length >= 1);
  const expectedIds = new Set([...onlyA, ...onlyB].map((s) => s.id));
  assert.equal(union.length, expectedIds.size);
  assert.ok(union.length >= Math.max(onlyA.length, onlyB.length));
});

test('F4: Cross-category AND applies over within-category OR ((Artist A OR B) AND (Genre X OR Y))', () => {
  const disjoint = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['Amitabh Bhattacharya', 'Amrinder Gill'],
    genres: ['Alternative', 'Alternative Rap'],
  });
  assert.equal(disjoint.length, 0);

  const overlapping = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['Laufey', 'JAY-Z & Kanye West'],
    genres: ['Jazz Pop', 'Hip-Hop'],
  });
  assert.ok(overlapping.length >= 2);
  assert.ok(
    overlapping.every(
      (s) =>
        (s.artists.includes('Laufey') || s.artists.includes('JAY-Z & Kanye West')) &&
        (s.genres.includes('Jazz Pop') || s.genres.includes('Hip-Hop'))
    )
  );
});

test('F5: Cities multi-select uses OR within single-valued city field (Hyderabad OR Mumbai)', () => {
  const hyd = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    cities: ['Hyderabad'],
  });
  const mum = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    cities: ['Mumbai'],
  });
  const both = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    cities: ['Hyderabad', 'Mumbai'],
  });

  assert.ok(hyd.length > 0);
  assert.ok(mum.length > 0);
  assert.equal(both.length, hyd.length + mum.length);
  assert.ok(both.every((s) => s.city === 'Hyderabad' || s.city === 'Mumbai'));
});

test("F6: Decades multi-select uses OR within single-valued decade field ('10s OR '20s)", () => {
  const d10s = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    decades: ["'10s"],
  });
  const d20s = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    decades: ["'20s"],
  });
  const both = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    decades: ["'10s", "'20s"],
  });

  assert.ok(d10s.length > 0);
  assert.ok(d20s.length > 0);
  assert.equal(both.length, d10s.length + d20s.length);
});

test('F7: Moods OR combined with Cities AND', () => {
  const result = applyExploreFilters(INITIAL_SONGS, {
    ...EMPTY_EXPLORE_FILTERS,
    moods: ['Chill', 'Energetic'],
    cities: ['Hyderabad'],
  });

  assert.ok(result.length > 0);
  assert.ok(
    result.every(
      (s) =>
        s.city === 'Hyderabad' &&
        (s.moods.includes('Chill') || s.moods.includes('Energetic'))
    )
  );
});

test('F8: Chip removal widens/narrows cleanly and detects empty filter state', () => {
  const twoArtists = {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['a-ha', 'Laufey'],
  };
  const oneArtist = {
    ...twoArtists,
    artists: twoArtists.artists.filter((a) => a !== 'a-ha'),
  };
  const none = {
    ...oneArtist,
    artists: oneArtist.artists.filter((a) => a !== 'Laufey'),
  };

  assert.ok(
    applyExploreFilters(INITIAL_SONGS, twoArtists).length >
      applyExploreFilters(INITIAL_SONGS, oneArtist).length
  );
  assert.equal(hasActiveExploreFilters(oneArtist), true);
  assert.equal(hasActiveExploreFilters(none), false);
});

test('F9: Active-song exclusion (archived) composes cleanly with Explore, Search, and Sort', () => {
  const archivedIds = new Set(['song-001', 'song-002']);
  const activePool = INITIAL_SONGS.filter((s) => !archivedIds.has(s.id));

  const filtered = applyExploreFilters(activePool, {
    ...EMPTY_EXPLORE_FILTERS,
    artists: ['Laufey', 'JAY-Z'],
  });
  const searched = applySearchQuery(filtered, 'Laufey');
  const sorted = sortSongs(searched, { field: 'title', order: 'newest' });

  assert.ok(sorted.every((s) => !archivedIds.has(s.id)));
  assert.ok(sorted.every((s) => s.artists.includes('Laufey')));
});
