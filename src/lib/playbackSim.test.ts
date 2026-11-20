import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPlaybackOrder,
  cycleRepeatMode,
  resolveManualNext,
  resolveManualPrevious,
  resolveSimulatedTrackEnd,
  syncPlaybackOrder,
} from './playbackSim';

// Deterministic linear congruential generator for repeatable shuffle tests
function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

test('cycleRepeatMode cycles cleanly: off -> all -> one -> off', () => {
  assert.equal(cycleRepeatMode('off'), 'all');
  assert.equal(cycleRepeatMode('all'), 'one');
  assert.equal(cycleRepeatMode('one'), 'off');
});

test('Repeat Off: advances normally through sequence and stops cleanly at the end', () => {
  const queue = ['s1', 's2', 's3'];
  const order = buildPlaybackOrder(queue, 's1', false);
  assert.deepEqual(order, ['s1', 's2', 's3']);

  const step1 = resolveSimulatedTrackEnd({
    currentSongId: 's1',
    activeSequence: order,
    repeatMode: 'off',
    currentDurationSeconds: 180,
  });
  assert.deepEqual(step1, {
    nextSongId: 's2',
    nextElapsed: 0,
    nextIsPlaying: true,
  });

  const step2 = resolveSimulatedTrackEnd({
    currentSongId: 's2',
    activeSequence: order,
    repeatMode: 'off',
    currentDurationSeconds: 195,
  });
  assert.deepEqual(step2, {
    nextSongId: 's3',
    nextElapsed: 0,
    nextIsPlaying: true,
  });

  const step3 = resolveSimulatedTrackEnd({
    currentSongId: 's3',
    activeSequence: order,
    repeatMode: 'off',
    currentDurationSeconds: 210,
  });
  assert.deepEqual(step3, {
    nextSongId: 's3',
    nextElapsed: 210,
    nextIsPlaying: false,
  });
});

test('Repeat All: advances through sequence and wraps back to index 0', () => {
  const order = buildPlaybackOrder(['s1', 's2', 's3'], 's1', false);

  const atEnd = resolveSimulatedTrackEnd({
    currentSongId: 's3',
    activeSequence: order,
    repeatMode: 'all',
    currentDurationSeconds: 200,
  });

  assert.deepEqual(atEnd, {
    nextSongId: 's1',
    nextElapsed: 0,
    nextIsPlaying: true,
  });
});

test('Repeat One: restarts current track at 0s regardless of queue position', () => {
  const order = buildPlaybackOrder(['s1', 's2', 's3'], 's2', false);

  const midTrack = resolveSimulatedTrackEnd({
    currentSongId: 's2',
    activeSequence: order,
    repeatMode: 'one',
    currentDurationSeconds: 170,
  });
  assert.deepEqual(midTrack, {
    nextSongId: 's2',
    nextElapsed: 0,
    nextIsPlaying: true,
  });

  const lastTrack = resolveSimulatedTrackEnd({
    currentSongId: 's3',
    activeSequence: order,
    repeatMode: 'one',
    currentDurationSeconds: 220,
  });
  assert.deepEqual(lastTrack, {
    nextSongId: 's3',
    nextElapsed: 0,
    nextIsPlaying: true,
  });
});

test('Shuffle + Repeat All: traverses deterministic shuffled sequence and wraps cleanly', () => {
  const queue = ['s1', 's2', 's3', 's4', 's5'];
  const shuffled = buildPlaybackOrder(queue, 's2', true, createSeededRng(42));

  // Current song anchored first, all 5 unique tracks preserved
  assert.equal(shuffled[0], 's2');
  assert.equal(shuffled.length, 5);
  assert.deepEqual([...shuffled].sort(), [...queue].sort());

  // Walk the entire shuffled sequence until wrap
  let curr = shuffled[0];
  const visited: string[] = [curr];
  for (let i = 0; i < shuffled.length; i += 1) {
    const res = resolveSimulatedTrackEnd({
      currentSongId: curr,
      activeSequence: shuffled,
      repeatMode: 'all',
      currentDurationSeconds: 180,
    });
    assert.equal(res.nextIsPlaying, true);
    assert.equal(res.nextElapsed, 0);
    curr = res.nextSongId!;
    visited.push(curr);
  }

  // First 5 entries match shuffled order, 6th wraps back to shuffled[0]
  assert.deepEqual(visited.slice(0, 5), shuffled);
  assert.equal(visited[5], shuffled[0]);
});

test('Shuffle + Repeat Off: traverses deterministic shuffled sequence and stops at the end', () => {
  const queue = ['s1', 's2', 's3', 's4'];
  const shuffled = buildPlaybackOrder(queue, 's3', true, createSeededRng(99));

  assert.equal(shuffled[0], 's3');
  assert.equal(shuffled.length, 4);

  let curr = shuffled[0];
  for (let i = 0; i < shuffled.length - 1; i += 1) {
    const res = resolveSimulatedTrackEnd({
      currentSongId: curr,
      activeSequence: shuffled,
      repeatMode: 'off',
      currentDurationSeconds: 160,
    });
    assert.equal(res.nextIsPlaying, true);
    assert.equal(res.nextSongId, shuffled[i + 1]);
    curr = res.nextSongId!;
  }

  // Final track in shuffled sequence ends playback cleanly
  const finalStep = resolveSimulatedTrackEnd({
    currentSongId: curr,
    activeSequence: shuffled,
    repeatMode: 'off',
    currentDurationSeconds: 160,
  });
  assert.deepEqual(finalStep, {
    nextSongId: shuffled[shuffled.length - 1],
    nextElapsed: 160,
    nextIsPlaying: false,
  });
});

test('Single-track queue edge cases and manual next/previous helpers', () => {
  const single = ['only'];
  assert.equal(
    resolveSimulatedTrackEnd({
      currentSongId: 'only',
      activeSequence: single,
      repeatMode: 'off',
      currentDurationSeconds: 150,
    }).nextIsPlaying,
    false
  );
  assert.equal(
    resolveSimulatedTrackEnd({
      currentSongId: 'only',
      activeSequence: single,
      repeatMode: 'all',
      currentDurationSeconds: 150,
    }).nextIsPlaying,
    true
  );
  assert.equal(
    resolveSimulatedTrackEnd({
      currentSongId: 'only',
      activeSequence: single,
      repeatMode: 'one',
      currentDurationSeconds: 150,
    }).nextElapsed,
    0
  );

  // Manual previous past 3s restarts current track
  assert.deepEqual(resolveManualPrevious('s2', ['s1', 's2', 's3'], 5.5), {
    nextSongId: 's2',
    nextElapsed: 0,
  });
  // Manual previous within 3s goes to previous track
  assert.deepEqual(resolveManualPrevious('s2', ['s1', 's2', 's3'], 1.2), {
    nextSongId: 's1',
    nextElapsed: 0,
  });
  // Manual next advances and wraps
  assert.deepEqual(resolveManualNext('s3', ['s1', 's2', 's3']), {
    nextSongId: 's1',
    nextElapsed: 0,
  });

  // Sync removes deleted/archived IDs without scrambling surviving order
  assert.deepEqual(syncPlaybackOrder(['s3', 's1', 's2'], ['s1', 's2', 's4']), [
    's1',
    's2',
    's4',
  ]);
});
