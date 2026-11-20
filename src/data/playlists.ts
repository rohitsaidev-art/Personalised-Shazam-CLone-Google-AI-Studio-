export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
}

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-late-night',
    name: 'Late Night Drives',
    songIds: ['song-001', 'song-004', 'song-005'],
  },
  {
    id: 'pl-hyderabad',
    name: 'Hyderabad Indie & Alt',
    songIds: ['song-aa-01', 'song-aa-02', 'song-aa-03'],
  },
  {
    id: 'pl-high-energy',
    name: 'High Energy',
    songIds: ['song-002', 'song-003', 'song-007'],
  },
  {
    id: 'pl-bollywood',
    name: 'Bollywood Acoustics',
    songIds: ['song-009', 'song-010', 'song-011'],
  },
];

// Deterministic prototype track duration (in seconds) derived from song ID
export function getSongDurationSeconds(songId: string): number {
  if (songId === 'song-003') return 85; // 1:25 (Putaapu Gang)
  if (songId === 'song-001') return 194; // 3:14 (Lover Girl)
  if (songId === 'song-002') return 272; // 4:32 (No Church in the Wild)
  if (songId === 'song-004') return 168; // 2:48 (Indecisive)

  let hash = 0;
  for (let i = 0; i < songId.length; i++) {
    hash = (hash * 31 + songId.charCodeAt(i)) >>> 0;
  }
  return 135 + (hash % 145); // 2:15 to 4:40
}

export function formatDuration(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
