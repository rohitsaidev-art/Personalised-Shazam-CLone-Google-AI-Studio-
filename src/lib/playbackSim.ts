import { RepeatMode } from '../types/music';

export function cycleRepeatMode(current: RepeatMode): RepeatMode {
  if (current === 'off') return 'all';
  if (current === 'all') return 'one';
  return 'off';
}

/**
 * Deduplicates queue IDs preserving order. When shuffled, places currentSongId
 * at index 0 (if present) and shuffles the remaining IDs with Fisher-Yates so
 * Shuffle + Repeat Off has a well-defined finite end and Shuffle + Repeat All
 * wraps cleanly back to the start of the shuffled sequence.
 */
export function buildPlaybackOrder(
  queueIds: string[],
  currentSongId: string | null,
  isShuffled: boolean,
  rng: () => number = Math.random
): string[] {
  const seen = new Set<string>();
  const uniqueIds: string[] = [];
  for (const id of queueIds) {
    if (!seen.has(id)) {
      seen.add(id);
      uniqueIds.push(id);
    }
  }

  if (!isShuffled || uniqueIds.length <= 1) {
    return uniqueIds;
  }

  const hasCurrent = currentSongId !== null && seen.has(currentSongId);
  const rest = hasCurrent
    ? uniqueIds.filter((id) => id !== currentSongId)
    : [...uniqueIds];

  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = rest[i];
    rest[i] = rest[j];
    rest[j] = tmp;
  }

  return hasCurrent && currentSongId !== null ? [currentSongId, ...rest] : rest;
}

/**
 * Keeps an existing playback sequence in sync when songs are removed or archived.
 */
export function syncPlaybackOrder(
  existingOrder: string[],
  validQueueIds: string[]
): string[] {
  const validSet = new Set(validQueueIds);
  const kept = existingOrder.filter((id) => validSet.has(id));
  const keptSet = new Set(kept);
  const appended = validQueueIds.filter((id) => !keptSet.has(id));
  return [...kept, ...appended];
}

export interface SimulatedTrackEndInput {
  currentSongId: string | null;
  activeSequence: string[];
  repeatMode: RepeatMode;
  currentDurationSeconds: number;
}

export interface SimulatedTrackEndResult {
  nextSongId: string | null;
  nextElapsed: number;
  nextIsPlaying: boolean;
}

/**
 * Pure simulated playback transition invoked when elapsedSeconds reaches
 * currentDurationSeconds on the 250ms timer. Strictly simulated (no audio engine).
 *
 * Covers all 5 required behaviors:
 * - Repeat Off: advances normally, stops at the end of the sequence.
 * - Repeat All: wraps to the start of the sequence.
 * - Repeat One: restarts current track from 0s.
 * - Shuffle + Repeat All: advances through shuffled sequence and wraps to index 0.
 * - Shuffle + Repeat Off: advances through shuffled sequence and stops at the end.
 */
export function resolveSimulatedTrackEnd({
  currentSongId,
  activeSequence,
  repeatMode,
  currentDurationSeconds,
}: SimulatedTrackEndInput): SimulatedTrackEndResult {
  if (!currentSongId || activeSequence.length === 0) {
    return {
      nextSongId: currentSongId,
      nextElapsed: currentDurationSeconds,
      nextIsPlaying: false,
    };
  }

  if (repeatMode === 'one') {
    return {
      nextSongId: currentSongId,
      nextElapsed: 0,
      nextIsPlaying: true,
    };
  }

  const currentIdx = activeSequence.indexOf(currentSongId);
  if (currentIdx === -1) {
    return {
      nextSongId: activeSequence[0],
      nextElapsed: 0,
      nextIsPlaying: true,
    };
  }

  const isLastInSequence = currentIdx >= activeSequence.length - 1;
  if (!isLastInSequence) {
    return {
      nextSongId: activeSequence[currentIdx + 1],
      nextElapsed: 0,
      nextIsPlaying: true,
    };
  }

  if (repeatMode === 'all') {
    return {
      nextSongId: activeSequence[0],
      nextElapsed: 0,
      nextIsPlaying: true,
    };
  }

  // repeatMode === 'off' at the end of activeSequence (unshuffled OR shuffled) -> stop cleanly
  return {
    nextSongId: currentSongId,
    nextElapsed: currentDurationSeconds,
    nextIsPlaying: false,
  };
}

export interface ManualSkipResult {
  nextSongId: string | null;
  nextElapsed: number;
}

export function resolveManualNext(
  currentSongId: string | null,
  activeSequence: string[]
): ManualSkipResult {
  if (activeSequence.length === 0) {
    return { nextSongId: currentSongId, nextElapsed: 0 };
  }
  const currentIdx = currentSongId ? activeSequence.indexOf(currentSongId) : -1;
  const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % activeSequence.length : 0;
  return {
    nextSongId: activeSequence[nextIdx],
    nextElapsed: 0,
  };
}

export function resolveManualPrevious(
  currentSongId: string | null,
  activeSequence: string[],
  elapsedSeconds: number
): ManualSkipResult {
  if (elapsedSeconds > 3) {
    return { nextSongId: currentSongId, nextElapsed: 0 };
  }
  if (activeSequence.length === 0) {
    return { nextSongId: currentSongId, nextElapsed: 0 };
  }
  const currentIdx = currentSongId ? activeSequence.indexOf(currentSongId) : 0;
  const prevIdx = currentIdx > 0 ? currentIdx - 1 : activeSequence.length - 1;
  return {
    nextSongId: activeSequence[prevIdx],
    nextElapsed: 0,
  };
}
