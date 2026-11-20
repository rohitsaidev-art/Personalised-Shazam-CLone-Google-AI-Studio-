import {
  ArtworkSpec,
  CandidateCorrection,
  ExploreFilters,
  FilterCategoryKey,
  Song,
  SortConfig,
} from '../types/music';
import { HERO_COVERS_BY_TITLE } from '../lib/heroArtwork';

// Anchored to the flow-board reference date: Fri, 20 Nov 2026 at 4:35 AM
export const REFERENCE_NOW = new Date(2026, 10, 20, 4, 35, 0).getTime();

function dt(
  year: number,
  month1to12: number,
  day: number,
  hour: number,
  minute: number
): number {
  return new Date(year, month1to12 - 1, day, hour, minute, 0).getTime();
}

const ANNE_AMIE_HYDERABAD_ALT_TRACKS: Array<{
  title: string;
  artist?: string;
  extraArtists?: string[];
  extraGenres?: string[];
  foundAt: number;
  moods: string[];
  decade: string;
  artwork: ArtworkSpec;
}> = [
  {
    title: 'Uyiril Thodum (From "Kumbalangi Nights")',
    foundAt: dt(2026, 11, 2, 16, 30),
    moods: ['Romantic', 'Chill'],
    decade: "'10s",
    extraGenres: ['Alternative Folk', 'Soundtrack'],
    artwork: { primary: '#2D1436', secondary: '#E85D75', accent: '#F4C95D', pattern: 'kumbalangi' },
  },
  {
    title: 'Aararo (Acoustic Alt Session)',
    foundAt: dt(2026, 10, 29, 21, 14),
    moods: ['Chill', 'Melancholic'],
    decade: "'20s",
    extraGenres: ['Acoustic'],
    artwork: { primary: '#13262F', secondary: '#3B8EA5', accent: '#F5EE9E', pattern: 'waves' },
  },
  {
    title: 'Kinaavinte Vazhi',
    foundAt: dt(2026, 10, 24, 19, 45),
    moods: ['Chill', 'Focus'],
    decade: "'20s",
    extraGenres: ['Adult Alternative'],
    artwork: { primary: '#1B1F3B', secondary: '#454ADE', accent: '#E15A97', pattern: 'prism' },
  },
  {
    title: 'Nilaave Vaa (Unplugged)',
    foundAt: dt(2026, 10, 18, 22, 10),
    moods: ['Romantic', 'Chill'],
    decade: "'10s",
    extraGenres: ['Alternative Folk'],
    artwork: { primary: '#0F2027', secondary: '#2C5364', accent: '#A8DADC', pattern: 'horizon' },
  },
  {
    title: 'Mazha Paattu',
    foundAt: dt(2026, 10, 12, 17, 5),
    moods: ['Melancholic', 'Chill'],
    decade: "'20s",
    extraGenres: ['Indie Pop'],
    artwork: { primary: '#1A1A2E', secondary: '#16213E', accent: '#0F9B8E', pattern: 'rings' },
  },
  {
    title: 'Kaathil Thenmazhai',
    foundAt: dt(2026, 10, 6, 13, 22),
    moods: ['Romantic', 'Upbeat'],
    decade: "'20s",
    extraGenres: ['Adult Alternative'],
    artwork: { primary: '#2B193D', secondary: '#C54B6C', accent: '#F6D186', pattern: 'bloom' },
  },
  {
    title: 'Vaanam Thazhe',
    foundAt: dt(2026, 9, 28, 20, 48),
    moods: ['Focus', 'Chill'],
    decade: "'10s",
    extraGenres: ['Acoustic'],
    artwork: { primary: '#102542', secondary: '#F87060', accent: '#CDD7D6', pattern: 'horizon' },
  },
  {
    title: 'Cherathukal (Midnight Reprise)',
    foundAt: dt(2026, 9, 22, 23, 15),
    moods: ['Melancholic', 'Chill'],
    decade: "'10s",
    extraGenres: ['Alternative Folk'],
    artwork: { primary: '#191308', secondary: '#9E6240', accent: '#DEA47E', pattern: 'vinyl' },
  },
  {
    title: 'Pularikalo',
    foundAt: dt(2026, 9, 17, 8, 40),
    moods: ['Upbeat', 'Energetic'],
    decade: "'20s",
    extraGenres: ['Indie Pop'],
    artwork: { primary: '#241E4E', secondary: '#960200', accent: '#FFD046', pattern: 'prism' },
  },
  {
    title: 'Ee Kaattu (Hyderabad Live)',
    foundAt: dt(2026, 9, 10, 19, 30),
    moods: ['Energetic', 'Upbeat'],
    decade: "'20s",
    extraGenres: ['Adult Alternative'],
    artwork: { primary: '#14213D', secondary: '#FCA311', accent: '#E5E5E5', pattern: 'monolith' },
  },
  {
    title: 'Manassinullil',
    foundAt: dt(2026, 9, 3, 16, 12),
    moods: ['Romantic', 'Focus'],
    decade: "'10s",
    extraGenres: ['Adult Contemporary'],
    artwork: { primary: '#231942', secondary: '#5E548E', accent: '#E0B1CB', pattern: 'bloom' },
  },
  {
    title: 'Neeyilla Neram',
    foundAt: dt(2026, 8, 27, 21, 50),
    moods: ['Melancholic', 'Chill'],
    decade: "'20s",
    extraGenres: ['Acoustic'],
    artwork: { primary: '#0D1B2A', secondary: '#415A77', accent: '#E0E1DD', pattern: 'waves' },
  },
  {
    title: 'Thoomanjin',
    foundAt: dt(2026, 8, 21, 7, 15),
    moods: ['Chill', 'Focus'],
    decade: "'10s",
    extraGenres: ['Alternative Folk'],
    artwork: { primary: '#1B4332', secondary: '#40916C', accent: '#D8F3DC', pattern: 'rings' },
  },
  {
    title: 'Irulil Oru Deepam',
    foundAt: dt(2026, 8, 14, 22, 3),
    moods: ['Focus', 'Melancholic'],
    decade: "'20s",
    extraGenres: ['Adult Alternative'],
    artwork: { primary: '#1D1128', secondary: '#514F59', accent: '#E5D4ED', pattern: 'monolith' },
  },
  {
    title: 'Kanmani Anbodu (Alt Cover)',
    foundAt: dt(2026, 8, 9, 18, 28),
    moods: ['Romantic', 'Chill'],
    decade: "'90s",
    extraGenres: ['Acoustic'],
    artwork: { primary: '#3C1642', secondary: '#086375', accent: '#1DD3B0', pattern: 'vinyl' },
  },
  {
    title: 'Melle Melle',
    foundAt: dt(2026, 8, 2, 15, 44),
    moods: ['Chill', 'Romantic'],
    decade: "'10s",
    extraGenres: ['Indie Pop'],
    artwork: { primary: '#2B2D42', secondary: '#8D99AE', accent: '#EF233C', pattern: 'horizon' },
  },
  {
    title: 'Aakasham Poley',
    foundAt: dt(2026, 7, 29, 19, 18),
    moods: ['Upbeat', 'Energetic'],
    decade: "'20s",
    extraGenres: ['Adult Alternative'],
    artwork: { primary: '#0B132B', secondary: '#3A506B', accent: '#5BC0BE', pattern: 'prism' },
  },
  {
    title: 'Kadaloram',
    foundAt: dt(2026, 7, 16, 17, 37),
    moods: ['Chill', 'Focus'],
    decade: "'20s",
    extraGenres: ['Alternative Folk'],
    artwork: { primary: '#132A13', secondary: '#31572C', accent: '#ECF39E', pattern: 'waves' },
  },
  {
    title: 'Oru Raathri Koodi (Strings)',
    foundAt: dt(2026, 6, 22, 23, 5),
    moods: ['Melancholic', 'Romantic'],
    decade: "'00s",
    extraGenres: ['Acoustic'],
    artwork: { primary: '#2D00F7', secondary: '#8900F2', accent: '#F20089', pattern: 'rings' },
  },
  {
    title: 'Swara Ragam',
    foundAt: dt(2026, 6, 11, 14, 20),
    moods: ['Focus', 'Chill'],
    decade: "'10s",
    extraGenres: ['Adult Contemporary'],
    artwork: { primary: '#370617', secondary: '#9D0208', accent: '#FFBA08', pattern: 'bloom' },
  },
  {
    title: 'Thira Nura',
    foundAt: dt(2026, 5, 24, 20, 12),
    moods: ['Energetic', 'Upbeat'],
    decade: "'20s",
    extraGenres: ['Indie Pop'],
    artwork: { primary: '#03045E', secondary: '#0077B6', accent: '#90E0EF', pattern: 'waves' },
  },
  {
    title: 'Sandhya Ragam',
    foundAt: dt(2026, 4, 28, 18, 55),
    moods: ['Romantic', 'Chill'],
    decade: "'80s",
    extraGenres: ['Alternative Folk'],
    artwork: { primary: '#3D1E26', secondary: '#B56576', accent: '#EAAC8B', pattern: 'horizon' },
  },
  {
    title: 'Poonkattu',
    foundAt: dt(2026, 4, 5, 11, 30),
    moods: ['Upbeat', 'Chill'],
    decade: "'20s",
    extraGenres: ['Adult Alternative'],
    artwork: { primary: '#1F2421', secondary: '#216869', accent: '#9CC5A1', pattern: 'prism' },
  },
  {
    title: 'Nizhalukal',
    foundAt: dt(2026, 3, 19, 21, 40),
    moods: ['Melancholic', 'Focus'],
    decade: "'10s",
    extraGenres: ['Acoustic'],
    artwork: { primary: '#161925', secondary: '#23395B', accent: '#8EA8C3', pattern: 'monolith' },
  },
];

// Build canonical 83-song dataset
const RAW_INITIAL_SONGS: Song[] = [
  // === TODAY (4 songs — exact match to flow boards 01, 02, 03, 05) ===
  {
    id: 'song-001',
    title: 'Lover Girl',
    artist: 'Laufey',
    artists: ['Laufey'],
    foundAt: dt(2026, 11, 20, 4, 32),
    genres: ['Jazz Pop', 'Acoustic'],
    city: 'Hyderabad',
    moods: ['Romantic', 'Chill'],
    decade: "'20s",
    artwork: { primary: '#243547', secondary: '#607B96', accent: '#C8D6E5', pattern: 'clock' },
  },
  {
    id: 'song-002',
    title: 'No Church in the Wild (feat. Frank Ocean & The-Dream)',
    artist: 'JAY-Z & Kanye West',
    artists: ['JAY-Z & Kanye West'],
    explicit: true,
    foundAt: dt(2026, 11, 20, 4, 20),
    genres: ['Alternative Rap', 'Hip-Hop'],
    city: 'London',
    moods: ['Energetic'],
    decade: "'10s",
    artwork: { primary: '#473311', secondary: '#C89B3C', accent: '#F5DF98', pattern: 'gold-baroque' },
  },
  {
    id: 'song-003',
    title: 'Putaapu Gang',
    artist: 'Anirudh Ravichander & Thaman S',
    artists: ['Anirudh Ravichander', 'Thaman S'],
    foundAt: dt(2026, 11, 20, 4, 5),
    genres: ['Soundtrack', 'Alternative Rap'],
    city: 'Chennai',
    moods: ['Energetic', 'Upbeat'],
    decade: "'20s",
    artwork: { primary: '#7A0C12', secondary: '#D92626', accent: '#F2E9E4', pattern: 'crimson-poster', monogram: 'JAILER' },
  },
  {
    id: 'song-004',
    title: 'Indecisive (Is It A Crime)',
    artist: 'Kidwild',
    artists: ['Kidwild'],
    explicit: true,
    foundAt: dt(2026, 11, 20, 4, 4),
    genres: ['Alternative Rap', 'Hip-Hop'],
    city: 'London',
    moods: ['Melancholic', 'Focus'],
    decade: "'20s",
    artwork: { primary: '#06080D', secondary: '#1B2433', accent: '#9BB4D6', pattern: 'noir-type', monogram: 'CRIME?' },
  },

  // === LAST WEEK (4 songs — matching "Last Week" & "So High" visible at bottom of boards) ===
  {
    id: 'song-005',
    title: 'So High',
    artist: 'Doja Cat',
    artists: ['Doja Cat'],
    explicit: true,
    foundAt: dt(2026, 11, 15, 22, 18),
    genres: ['Indie Pop', 'Alternative'],
    city: 'New York',
    moods: ['Chill', 'Romantic'],
    decade: "'10s",
    artwork: { primary: '#3A1C35', secondary: '#A2487A', accent: '#F3B6D3', pattern: 'bloom' },
  },
  {
    id: 'song-006',
    title: 'From The Start',
    artist: 'Laufey',
    artists: ['Laufey'],
    foundAt: dt(2026, 11, 14, 19, 42),
    genres: ['Jazz Pop', 'Acoustic'],
    city: 'New York',
    moods: ['Romantic', 'Upbeat'],
    decade: "'20s",
    artwork: { primary: '#2B1F2E', secondary: '#7D4F69', accent: '#F5D6BA', pattern: 'vinyl' },
  },
  {
    id: 'song-007',
    title: 'Hukum (Tiger Ka Hukum)',
    artist: 'Anirudh Ravichander',
    artists: ['Anirudh Ravichander'],
    foundAt: dt(2026, 11, 13, 16, 11),
    genres: ['Soundtrack', 'Energetic'].filter((g) => g !== 'Energetic').concat('Alternative'),
    city: 'Chennai',
    moods: ['Energetic', 'Upbeat'],
    decade: "'20s",
    artwork: { primary: '#3D0808', secondary: '#C1121F', accent: '#FDF0D5', pattern: 'monolith' },
  },
  {
    id: 'song-008',
    title: 'Dildaara (Stand By Me)',
    artist: 'Shreya Ghoshal & Aarti Mishra',
    artists: ['Shreya Ghoshal', 'Aarti Mishra'],
    foundAt: dt(2026, 11, 12, 11, 5),
    genres: ['Bollywood', 'Adult Contemporary'],
    city: 'Mumbai',
    moods: ['Romantic', 'Upbeat'],
    decade: "'10s",
    artwork: { primary: '#1B2845', secondary: '#274060', accent: '#FFD166', pattern: 'horizon' },
  },

  // === PRITAM (EXACTLY 5 songs — matches board 03 right screen: 5 songs) ===
  {
    id: 'song-009',
    title: 'Mehrama (Extended)',
    artist: 'Pritam, Darshan Raval & Antara Mitra',
    artists: ['Pritam', 'Darshan Raval', 'Antara Mitra'],
    foundAt: dt(2026, 7, 25, 17, 34),
    genres: ['Bollywood', 'Acoustic'],
    city: 'Mumbai',
    moods: ['Melancholic', 'Romantic'],
    decade: "'20s",
    artwork: { primary: '#2E1420', secondary: '#8E3A59', accent: '#F2B5C4', pattern: 'crimson-poster', monogram: 'LOVE' },
  },
  {
    id: 'song-010',
    title: 'Dil Ye Bekarar Kyun Hai',
    artist: 'Pritam, Mohit Chauhan & Shreya Ghoshal',
    artists: ['Pritam', 'Mohit Chauhan', 'Shreya Ghoshal'],
    foundAt: dt(2026, 6, 30, 16, 58),
    genres: ['Bollywood', 'Adult Contemporary'],
    city: 'Mumbai',
    moods: ['Romantic', 'Chill'],
    decade: "'10s",
    artwork: { primary: '#2C1B0E', secondary: '#C67D2E', accent: '#FCE38A', pattern: 'gold-baroque' },
  },
  {
    id: 'song-011',
    title: 'Kahani (From "Laal Singh Chaddha")',
    artist: 'Pritam, Mohan Kannan & Amitabh Bhattacharya',
    artists: ['Pritam', 'Mohan Kannan', 'Amitabh Bhattacharya'],
    foundAt: dt(2026, 5, 5, 21, 5),
    genres: ['Bollywood', 'Alternative Folk'],
    city: 'Bengaluru',
    moods: ['Chill', 'Focus'],
    decade: "'20s",
    artwork: { primary: '#2B2B30', secondary: '#6D6875', accent: '#E8E4DF', pattern: 'horizon' },
  },
  {
    id: 'song-012',
    title: 'Kesariya (From "Brahmastra")',
    artist: 'Pritam, Arijit Singh & Amitabh Bhattacharya',
    artists: ['Pritam', 'Arijit Singh', 'Amitabh Bhattacharya'],
    foundAt: dt(2026, 4, 19, 20, 15),
    genres: ['Bollywood', 'Adult Contemporary'],
    city: 'Hyderabad',
    moods: ['Romantic', 'Upbeat'],
    decade: "'20s",
    artwork: { primary: '#4D1900', secondary: '#E85D04', accent: '#FFBA08', pattern: 'bloom' },
  },
  {
    id: 'song-013',
    title: 'Shayad (From "Love Aaj Kal")',
    artist: 'Pritam & Arijit Singh',
    artists: ['Pritam', 'Arijit Singh'],
    foundAt: dt(2026, 3, 12, 18, 42),
    genres: ['Bollywood', 'Acoustic'],
    city: 'Mumbai',
    moods: ['Romantic', 'Melancholic'],
    decade: "'20s",
    artwork: { primary: '#1F1A38', secondary: '#7B506F', accent: '#DD99BB', pattern: 'rings' },
  },

  // === ANNE AMIE + ALTERNATIVE + HYDERABAD (EXACTLY 24 songs — matches board 04 right screen) ===
  ...ANNE_AMIE_HYDERABAD_ALT_TRACKS.map((item, idx): Song => ({
    id: `song-aa-${String(idx + 1).padStart(2, '0')}`,
    title: item.title,
    artist: item.artist ?? 'Anne Amie',
    artists: ['Anne Amie', ...(item.extraArtists ?? [])],
    foundAt: item.foundAt,
    genres: ['Alternative', ...(item.extraGenres ?? [])],
    city: 'Hyderabad',
    moods: item.moods,
    decade: item.decade,
    artwork: item.artwork,
  })),

  // === 3 EXTRA ANNE AMIE TRACKS (NOT matching all 3 criteria — verifies live AND delta!) ===
  {
    id: 'song-038',
    title: 'Jeevaamshamaayi (Bengaluru Session)',
    artist: 'Anne Amie',
    artists: ['Anne Amie'],
    foundAt: dt(2026, 10, 2, 18, 12),
    genres: ['Alternative', 'Soundtrack'],
    city: 'Bengaluru',
    moods: ['Romantic', 'Chill'],
    decade: "'10s",
    artwork: { primary: '#16262E', secondary: '#2E4756', accent: '#9FA2B2', pattern: 'waves' },
  },
  {
    id: 'song-039',
    title: 'Pularaan Neram (Acoustic Piano)',
    artist: 'Anne Amie',
    artists: ['Anne Amie'],
    foundAt: dt(2026, 8, 18, 10, 5),
    genres: ['Acoustic', 'Adult Contemporary'],
    city: 'Hyderabad',
    moods: ['Chill', 'Focus'],
    decade: "'20s",
    artwork: { primary: '#232931', secondary: '#4ECCA3', accent: '#EEEEEE', pattern: 'vinyl' },
  },
  {
    id: 'song-040',
    title: 'Ethu Kari Raavilum (Studio Cut)',
    artist: 'Anne Amie',
    artists: ['Anne Amie'],
    foundAt: dt(2026, 7, 8, 22, 19),
    genres: ['Soundtrack', 'Adult Contemporary'],
    city: 'Hyderabad',
    moods: ['Melancholic', 'Romantic'],
    decade: "'10s",
    artwork: { primary: '#1E1B2E', secondary: '#6A4C93', accent: '#F7D08A', pattern: 'prism' },
  },

  // === REMAINING 43 DIVERSE LIBRARY TRACKS (Total: 40 + 43 = 83 songs EXACTLY) ===
  {
    id: 'song-041',
    title: 'Raat Bhar',
    artist: 'Aarti Mishra',
    artists: ['Aarti Mishra'],
    foundAt: dt(2026, 11, 8, 21, 30),
    genres: ['Acoustic', 'Adult Contemporary'],
    city: 'Mumbai',
    moods: ['Chill', 'Romantic'],
    decade: "'20s",
    artwork: { primary: '#291720', secondary: '#D90368', accent: '#FFD400', pattern: 'bloom' },
  },
  {
    id: 'song-042',
    title: 'Saawariya Reprise',
    artist: 'Aarti Mishra',
    artists: ['Aarti Mishra'],
    foundAt: dt(2026, 10, 26, 17, 14),
    genres: ['Bollywood', 'Alternative Folk'],
    city: 'Hyderabad',
    moods: ['Melancholic', 'Chill'],
    decade: "'10s",
    artwork: { primary: '#1B1B3A', secondary: '#693668', accent: '#F896D8', pattern: 'rings' },
  },
  {
    id: 'song-043',
    title: 'Midnight Echoes',
    artist: 'Aksomanic',
    artists: ['Aksomanic'],
    foundAt: dt(2026, 11, 6, 23, 50),
    genres: ['Alternative', 'Alternative Rap'],
    city: 'Bengaluru',
    moods: ['Energetic', 'Focus'],
    decade: "'20s",
    artwork: { primary: '#0C0F1D', secondary: '#3A0CA3', accent: '#4CC9F0', pattern: 'prism' },
  },
  {
    id: 'song-044',
    title: 'Neon Monsoon',
    artist: 'Aksomanic',
    artists: ['Aksomanic'],
    foundAt: dt(2026, 10, 15, 20, 44),
    genres: ['Hip-Hop', 'Alternative Rap'],
    city: 'Hyderabad',
    moods: ['Energetic', 'Upbeat'],
    decade: "'20s",
    artwork: { primary: '#10002B', secondary: '#7B2CBF', accent: '#E0AAFF', pattern: 'monolith' },
  },
  {
    id: 'song-045',
    title: 'Dildarian',
    artist: 'Amrinder Gill',
    artists: ['Amrinder Gill'],
    foundAt: dt(2026, 11, 4, 15, 20),
    genres: ['Alternative Folk', 'Acoustic'],
    city: 'Mumbai',
    moods: ['Romantic', 'Chill'],
    decade: "'00s",
    artwork: { primary: '#283618', secondary: '#606C38', accent: '#DDA15E', pattern: 'horizon' },
  },
  {
    id: 'song-046',
    title: 'Judaa',
    artist: 'Amrinder Gill',
    artists: ['Amrinder Gill'],
    foundAt: dt(2026, 10, 20, 19, 8),
    genres: ['Adult Contemporary', 'Acoustic'],
    city: 'London',
    moods: ['Melancholic', 'Romantic'],
    decade: "'10s",
    artwork: { primary: '#331E36', secondary: '#7B4B94', accent: '#D8B4E2', pattern: 'vinyl' },
  },
  {
    id: 'song-047',
    title: 'Yaarian',
    artist: 'Amrinder Gill',
    artists: ['Amrinder Gill'],
    foundAt: dt(2026, 9, 29, 13, 45),
    genres: ['Alternative Folk', 'Adult Contemporary'],
    city: 'Hyderabad',
    moods: ['Upbeat', 'Chill'],
    decade: "'10s",
    artwork: { primary: '#22223B', secondary: '#4A4E69', accent: '#C9ADA7', pattern: 'waves' },
  },
  {
    id: 'song-048',
    title: 'Why This Kolaveri Di',
    artist: 'Anirudh Ravichander',
    artists: ['Anirudh Ravichander'],
    foundAt: dt(2026, 10, 31, 14, 22),
    genres: ['Soundtrack', 'Indie Pop'],
    city: 'Chennai',
    moods: ['Upbeat', 'Energetic'],
    decade: "'10s",
    artwork: { primary: '#2B2118', secondary: '#A8763E', accent: '#F7F3E3', pattern: 'vinyl' },
  },
  {
    id: 'song-049',
    title: 'Kanave Kanave',
    artist: 'Anirudh Ravichander',
    artists: ['Anirudh Ravichander'],
    foundAt: dt(2026, 9, 25, 22, 16),
    genres: ['Soundtrack', 'Alternative'],
    city: 'Chennai',
    moods: ['Melancholic', 'Focus'],
    decade: "'10s",
    artwork: { primary: '#131515', secondary: '#339989', accent: '#7DE2D1', pattern: 'waves' },
  },
  {
    id: 'song-050',
    title: 'Arabic Kuthu',
    artist: 'Anirudh Ravichander',
    artists: ['Anirudh Ravichander'],
    foundAt: dt(2026, 8, 30, 20, 10),
    genres: ['Soundtrack', 'Upbeat'].filter((g) => g !== 'Upbeat').concat('Indie Pop'),
    city: 'Hyderabad',
    moods: ['Energetic', 'Upbeat'],
    decade: "'20s",
    artwork: { primary: '#4F000B', secondary: '#CE4257', accent: '#FF9B54', pattern: 'prism' },
  },
  {
    id: 'song-051',
    title: 'Gerua (Acoustic Duet)',
    artist: 'Antara Mitra & Arijit Singh',
    artists: ['Antara Mitra', 'Arijit Singh'],
    foundAt: dt(2026, 10, 14, 18, 5),
    genres: ['Bollywood', 'Acoustic'],
    city: 'Mumbai',
    moods: ['Romantic', 'Chill'],
    decade: "'10s",
    artwork: { primary: '#3B1F2B', secondary: '#DB162F', accent: '#F7B538', pattern: 'horizon' },
  },
  {
    id: 'song-052',
    title: 'Janam Janam',
    artist: 'Antara Mitra & Arijit Singh',
    artists: ['Antara Mitra', 'Arijit Singh'],
    foundAt: dt(2026, 9, 14, 21, 12),
    genres: ['Bollywood', 'Adult Contemporary'],
    city: 'Bengaluru',
    moods: ['Romantic', 'Melancholic'],
    decade: "'10s",
    artwork: { primary: '#1D2D44', secondary: '#748CAB', accent: '#F0EBD8', pattern: 'rings' },
  },
  {
    id: 'song-053',
    title: 'Saree Ke Fall Sa',
    artist: 'Antara Mitra',
    artists: ['Antara Mitra'],
    foundAt: dt(2026, 8, 12, 16, 40),
    genres: ['Bollywood', 'Indie Pop'],
    city: 'Mumbai',
    moods: ['Upbeat', 'Energetic'],
    decade: "'10s",
    artwork: { primary: '#3C096C', secondary: '#9D4EDD', accent: '#FF9E00', pattern: 'bloom' },
  },
  {
    id: 'song-054',
    title: 'Sun Raha Hai (Female Version)',
    artist: 'Shreya Ghoshal',
    artists: ['Shreya Ghoshal'],
    foundAt: dt(2026, 11, 1, 20, 48),
    genres: ['Bollywood', 'Adult Alternative'],
    city: 'Mumbai',
    moods: ['Melancholic', 'Romantic'],
    decade: "'10s",
    artwork: { primary: '#0F172A', secondary: '#38BDF8', accent: '#E0F2FE', pattern: 'waves' },
  },
  {
    id: 'song-055',
    title: 'Agar Tum Mil Jao',
    artist: 'Shreya Ghoshal',
    artists: ['Shreya Ghoshal'],
    foundAt: dt(2026, 10, 9, 22, 30),
    genres: ['Bollywood', 'Acoustic'],
    city: 'Hyderabad',
    moods: ['Romantic', 'Chill'],
    decade: "'00s",
    artwork: { primary: '#2D1E2F', secondary: '#A93F55', accent: '#F7E3AF', pattern: 'vinyl' },
  },
  {
    id: 'song-056',
    title: 'Deewani Mastani',
    artist: 'Shreya Ghoshal',
    artists: ['Shreya Ghoshal'],
    foundAt: dt(2026, 9, 19, 19, 5),
    genres: ['Bollywood', 'Soundtrack'],
    city: 'Mumbai',
    moods: ['Romantic', 'Energetic'],
    decade: "'10s",
    artwork: { primary: '#432818', secondary: '#BB9457', accent: '#FFE6A7', pattern: 'gold-baroque' },
  },
  {
    id: 'song-057',
    title: 'Teri Ore',
    artist: 'Shreya Ghoshal',
    artists: ['Shreya Ghoshal'],
    foundAt: dt(2026, 8, 5, 17, 25),
    genres: ['Bollywood', 'Adult Contemporary'],
    city: 'Bengaluru',
    moods: ['Romantic', 'Upbeat'],
    decade: "'00s",
    artwork: { primary: '#1E2A38', secondary: '#4E8098', accent: '#FCF7F8', pattern: 'horizon' },
  },
  {
    id: 'song-058',
    title: 'Barso Re',
    artist: 'Shreya Ghoshal',
    artists: ['Shreya Ghoshal'],
    foundAt: dt(2026, 7, 19, 15, 12),
    genres: ['Bollywood', 'Alternative Folk'],
    city: 'Chennai',
    moods: ['Upbeat', 'Energetic'],
    decade: "'00s",
    artwork: { primary: '#083D77', secondary: '#3DA5D9', accent: '#EBEBD3', pattern: 'waves' },
  },
  {
    id: 'song-059',
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh',
    artists: ['Arijit Singh'],
    foundAt: dt(2026, 10, 22, 23, 2),
    genres: ['Bollywood', 'Adult Contemporary'],
    city: 'Mumbai',
    moods: ['Romantic', 'Melancholic'],
    decade: "'10s",
    artwork: { primary: '#121619', secondary: '#2D4739', accent: '#9AD4D6', pattern: 'monolith' },
  },
  {
    id: 'song-060',
    title: 'Channa Mereya',
    artist: 'Arijit Singh',
    artists: ['Arijit Singh'],
    foundAt: dt(2026, 9, 8, 21, 44),
    genres: ['Bollywood', 'Acoustic'],
    city: 'Hyderabad',
    moods: ['Melancholic', 'Romantic'],
    decade: "'10s",
    artwork: { primary: '#3D2C2E', secondary: '#B07BAC', accent: '#F5D0C5', pattern: 'bloom' },
  },
  {
    id: 'song-061',
    title: 'Bewitched',
    artist: 'Laufey',
    artists: ['Laufey'],
    foundAt: dt(2026, 10, 17, 18, 40),
    genres: ['Jazz Pop', 'Adult Contemporary'],
    city: 'New York',
    moods: ['Romantic', 'Chill'],
    decade: "'20s",
    artwork: { primary: '#1A233A', secondary: '#415A77', accent: '#E0C097', pattern: 'clock' },
  },
  {
    id: 'song-062',
    title: 'Falling Behind',
    artist: 'Laufey',
    artists: ['Laufey'],
    foundAt: dt(2026, 9, 12, 16, 15),
    genres: ['Jazz Pop', 'Acoustic'],
    city: 'London',
    moods: ['Chill', 'Upbeat'],
    decade: "'20s",
    artwork: { primary: '#2F3E46', secondary: '#52796F', accent: '#CAD2C5', pattern: 'rings' },
  },
  {
    id: 'song-063',
    title: 'Promise',
    artist: 'Laufey',
    artists: ['Laufey'],
    foundAt: dt(2026, 8, 23, 21, 5),
    genres: ['Jazz Pop', 'Acoustic'],
    city: 'New York',
    moods: ['Melancholic', 'Romantic'],
    decade: "'20s",
    artwork: { primary: '#22181C', secondary: '#846075', accent: '#F4EAE6', pattern: 'horizon' },
  },
  {
    id: 'song-064',
    title: 'Otis (feat. Otis Redding)',
    artist: 'JAY-Z & Kanye West',
    artists: ['JAY-Z & Kanye West'],
    explicit: true,
    foundAt: dt(2026, 10, 4, 14, 30),
    genres: ['Hip-Hop', 'Alternative Rap'],
    city: 'New York',
    moods: ['Energetic', 'Upbeat'],
    decade: "'10s",
    artwork: { primary: '#3B2F12', secondary: '#B08D2C', accent: '#F7E7A1', pattern: 'gold-baroque' },
  },
  {
    id: 'song-065',
    title: 'Gotta Have It',
    artist: 'JAY-Z & Kanye West',
    artists: ['JAY-Z & Kanye West'],
    explicit: true,
    foundAt: dt(2026, 9, 1, 19, 12),
    genres: ['Hip-Hop', 'Alternative Rap'],
    city: 'London',
    moods: ['Energetic'],
    decade: "'10s",
    artwork: { primary: '#33260F', secondary: '#C59B27', accent: '#FFF1B8', pattern: 'gold-baroque' },
  },
  {
    id: 'song-066',
    title: 'Cold Nights',
    artist: 'Kidwild',
    artists: ['Kidwild'],
    explicit: true,
    foundAt: dt(2026, 10, 11, 23, 45),
    genres: ['Alternative Rap', 'Hip-Hop'],
    city: 'London',
    moods: ['Focus', 'Melancholic'],
    decade: "'20s",
    artwork: { primary: '#090D16', secondary: '#263859', accent: '#6B778D', pattern: 'noir-type', monogram: 'COLD' },
  },
  {
    id: 'song-067',
    title: 'Late Text',
    artist: 'Kidwild',
    artists: ['Kidwild'],
    foundAt: dt(2026, 8, 29, 1, 14),
    genres: ['Hip-Hop', 'Indie Pop'],
    city: 'London',
    moods: ['Chill', 'Focus'],
    decade: "'20s",
    artwork: { primary: '#0B0C10', secondary: '#1F2833', accent: '#66FCF1', pattern: 'monolith' },
  },
  {
    id: 'song-068',
    title: 'Butta Bomma',
    artist: 'Thaman S',
    artists: ['Thaman S'],
    foundAt: dt(2026, 9, 27, 17, 30),
    genres: ['Soundtrack', 'Indie Pop'],
    city: 'Hyderabad',
    moods: ['Upbeat', 'Romantic'],
    decade: "'20s",
    artwork: { primary: '#3D155F', secondary: '#DF678C', accent: '#F7D08A', pattern: 'bloom' },
  },
  {
    id: 'song-069',
    title: 'Samajavaragamana',
    artist: 'Thaman S',
    artists: ['Thaman S'],
    foundAt: dt(2026, 8, 16, 12, 20),
    genres: ['Soundtrack', 'Acoustic'],
    city: 'Hyderabad',
    moods: ['Romantic', 'Chill'],
    decade: "'10s",
    artwork: { primary: '#1E3D59', secondary: '#FF6E40', accent: '#FFC13B', pattern: 'horizon' },
  },
  {
    id: 'song-070',
    title: 'Kalaavathi',
    artist: 'Thaman S',
    artists: ['Thaman S'],
    foundAt: dt(2026, 7, 12, 18, 5),
    genres: ['Soundtrack', 'Adult Contemporary'],
    city: 'Hyderabad',
    moods: ['Romantic', 'Upbeat'],
    decade: "'20s",
    artwork: { primary: '#2A1A1F', secondary: '#A53860', accent: '#FFA5AB', pattern: 'rings' },
  },
  {
    id: 'song-071',
    title: 'Say So',
    artist: 'Doja Cat',
    artists: ['Doja Cat'],
    foundAt: dt(2026, 7, 4, 20, 15),
    genres: ['Indie Pop', 'Adult Contemporary'],
    city: 'New York',
    moods: ['Upbeat', 'Energetic'],
    decade: "'20s",
    artwork: { primary: '#4A1942', secondary: '#D84797', accent: '#FCD5CE', pattern: 'prism' },
  },
  {
    id: 'song-072',
    title: 'Dreams (Remastered)',
    artist: 'Fleetwood Mac',
    artists: ['Fleetwood Mac'],
    foundAt: dt(2026, 6, 18, 19, 30),
    genres: ['Adult Alternative', 'Alternative'],
    city: 'London',
    moods: ['Chill', 'Focus'],
    decade: "'70s",
    artwork: { primary: '#1E1D1B', secondary: '#8C7A6B', accent: '#EAE0D5', pattern: 'vinyl' },
  },
  {
    id: 'song-073',
    title: 'The Chain',
    artist: 'Fleetwood Mac',
    artists: ['Fleetwood Mac'],
    foundAt: dt(2026, 5, 29, 16, 40),
    genres: ['Adult Alternative', 'Alternative Folk'],
    city: 'London',
    moods: ['Energetic', 'Focus'],
    decade: "'70s",
    artwork: { primary: '#1F1B18', secondary: '#6F5E53', accent: '#D9C5B2', pattern: 'monolith' },
  },
  {
    id: 'song-074',
    title: 'Everybody Wants To Rule The World',
    artist: 'Tears for Fears',
    artists: ['Tears for Fears'],
    foundAt: dt(2026, 5, 18, 11, 22),
    genres: ['Alternative', 'Adult Alternative'],
    city: 'London',
    moods: ['Upbeat', 'Focus'],
    decade: "'80s",
    artwork: { primary: '#0E2433', secondary: '#2E8BC0', accent: '#B1D4E0', pattern: 'horizon' },
  },
  {
    id: 'song-075',
    title: 'Running Up That Hill',
    artist: 'Kate Bush',
    artists: ['Kate Bush'],
    foundAt: dt(2026, 5, 10, 22, 5),
    genres: ['Alternative', 'Adult Alternative'],
    city: 'London',
    moods: ['Energetic', 'Melancholic'],
    decade: "'80s",
    artwork: { primary: '#381D2A', secondary: '#A53F2B', accent: '#F39B6D', pattern: 'waves' },
  },
  {
    id: 'song-076',
    title: 'Fade Into You',
    artist: 'Mazzy Star',
    artists: ['Mazzy Star'],
    foundAt: dt(2026, 4, 24, 23, 18),
    genres: ['Alternative', 'Alternative Folk'],
    city: 'New York',
    moods: ['Chill', 'Melancholic'],
    decade: "'90s",
    artwork: { primary: '#1D1A2F', secondary: '#52489C', accent: '#EBEBEB', pattern: 'rings' },
  },
  {
    id: 'song-077',
    title: 'Wonderwall',
    artist: 'Oasis',
    artists: ['Oasis'],
    foundAt: dt(2026, 4, 14, 15, 50),
    genres: ['Alternative', 'Acoustic'],
    city: 'London',
    moods: ['Upbeat', 'Romantic'],
    decade: "'90s",
    artwork: { primary: '#262626', secondary: '#737373', accent: '#E5E5E5', pattern: 'monolith' },
  },
  {
    id: 'song-078',
    title: 'Yellow',
    artist: 'Coldplay',
    artists: ['Coldplay'],
    foundAt: dt(2026, 4, 2, 18, 25),
    genres: ['Adult Alternative', 'Alternative'],
    city: 'Bengaluru',
    moods: ['Romantic', 'Chill'],
    decade: "'00s",
    artwork: { primary: '#2B2100', secondary: '#D4A017', accent: '#FFF3B0', pattern: 'horizon' },
  },
  {
    id: 'song-079',
    title: 'Fix You',
    artist: 'Coldplay',
    artists: ['Coldplay'],
    foundAt: dt(2026, 3, 28, 21, 10),
    genres: ['Adult Alternative', 'Adult Contemporary'],
    city: 'Mumbai',
    moods: ['Melancholic', 'Focus'],
    decade: "'00s",
    artwork: { primary: '#0B132B', secondary: '#1C2541', accent: '#F4A261', pattern: 'prism' },
  },
  {
    id: 'song-080',
    title: 'Electric Feel',
    artist: 'MGMT',
    artists: ['MGMT'],
    foundAt: dt(2026, 3, 21, 20, 5),
    genres: ['Indie Pop', 'Alternative'],
    city: 'New York',
    moods: ['Upbeat', 'Energetic'],
    decade: "'00s",
    artwork: { primary: '#132A13', secondary: '#4F772D', accent: '#F7B801', pattern: 'bloom' },
  },
  {
    id: 'song-081',
    title: 'Sultans of Swing',
    artist: 'Dire Straits',
    artists: ['Dire Straits'],
    foundAt: dt(2026, 3, 15, 14, 15),
    genres: ['Adult Alternative', 'Acoustic'],
    city: 'London',
    moods: ['Upbeat', 'Focus'],
    decade: "'70s",
    artwork: { primary: '#2F1B12', secondary: '#A44A3F', accent: '#F19C79', pattern: 'vinyl' },
  },
  {
    id: 'song-082',
    title: 'Take On Me',
    artist: 'a-ha',
    artists: ['a-ha'],
    foundAt: dt(2026, 3, 8, 12, 40),
    genres: ['Indie Pop', 'Adult Contemporary'],
    city: 'New York',
    moods: ['Energetic', 'Upbeat'],
    decade: "'80s",
    artwork: { primary: '#1B263B', secondary: '#415A77', accent: '#E0E1DD', pattern: 'waves' },
  },
  {
    id: 'song-083',
    title: 'Bitter Sweet Symphony',
    artist: 'The Verve',
    artists: ['The Verve'],
    foundAt: dt(2026, 3, 1, 17, 50),
    genres: ['Alternative', 'Adult Alternative'],
    city: 'London',
    moods: ['Focus', 'Melancholic'],
    decade: "'90s",
    artwork: { primary: '#1B1F23', secondary: '#4E5D6C', accent: '#D3D9DE', pattern: 'rings' },
  },
];

export const INITIAL_SONGS: Song[] = RAW_INITIAL_SONGS.map((song) => {
  const hero = HERO_COVERS_BY_TITLE[song.title];
  if (!hero) return song;
  return {
    ...song,
    artwork: {
      ...song.artwork,
      imageUrl: hero.imageUrl,
      imageScale: hero.imageScale,
    },
  };
});

// Resolve flagship release cover for Artist filter chips (prefers hero raster artwork first)
export function getArtistCoverArtwork(
  songs: Song[],
  artistName: string
): { artwork: ArtworkSpec; seedKey: string } | undefined {
  const matching = songs.filter((s) => s.artists.includes(artistName));
  if (matching.length === 0) return undefined;
  const withHero = matching.find((s) => Boolean(s.artwork.imageUrl));
  const chosen = withHero ?? matching[0];
  return { artwork: chosen.artwork, seedKey: chosen.id };
}

// Simulated tracks for "Tap to Shazam" on Home
export const SHAZAM_DEMO_DISCOVERIES: Array<Omit<Song, 'id' | 'foundAt' | 'city'>> = [
  {
    title: 'Midnight City',
    artist: 'M83',
    artists: ['M83'],
    genres: ['Indie Pop', 'Alternative'],
    moods: ['Energetic', 'Upbeat'],
    decade: "'10s",
    artwork: { primary: '#120D31', secondary: '#5E2BFF', accent: '#FF6B9D', pattern: 'prism' },
  },
  {
    title: 'Kun Faya Kun',
    artist: 'A.R. Rahman & Mohit Chauhan',
    artists: ['A.R. Rahman', 'Mohit Chauhan'],
    genres: ['Bollywood', 'Alternative Folk'],
    moods: ['Chill', 'Focus'],
    decade: "'10s",
    artwork: { primary: '#2B1B17', secondary: '#B87333', accent: '#F5DEB3', pattern: 'rings' },
  },
  {
    title: 'Pink + White',
    artist: 'Frank Ocean',
    artists: ['Frank Ocean'],
    genres: ['Alternative', 'Indie Pop'],
    moods: ['Chill', 'Romantic'],
    decade: "'10s",
    artwork: { primary: '#2D1E2F', secondary: '#E07A5F', accent: '#F4F1DE', pattern: 'horizon' },
  },
];

// Deterministic candidate corrections for "Wrong Song? Tell Shazam"
export function getCandidateCorrections(song: Song): CandidateCorrection[] {
  const baseGenre = song.genres[0] ?? 'Alternative';
  return [
    {
      id: `${song.id}-cand-1`,
      title: `${song.title} (Acoustic Session)`,
      artist: song.artist,
      artists: song.artists,
      genres: [baseGenre, 'Acoustic'],
      decade: song.decade,
      artwork: {
        ...song.artwork,
        pattern: 'vinyl',
      },
    },
    {
      id: `${song.id}-cand-2`,
      title: `${song.title.split('(')[0].trim()} — Live Mix`,
      artist: song.artists[0] ?? song.artist,
      artists: [song.artists[0] ?? song.artist],
      genres: [baseGenre, 'Adult Alternative'],
      decade: song.decade,
      artwork: {
        primary: '#162447',
        secondary: '#1F4068',
        accent: '#E43F5A',
        pattern: 'waves',
      },
    },
    {
      id: `${song.id}-cand-3`,
      title: 'Starlight Resonance',
      artist: 'Laufey',
      artists: ['Laufey'],
      genres: ['Jazz Pop', 'Acoustic'],
      decade: "'20s",
      artwork: {
        primary: '#1A1F36',
        secondary: '#4F5D75',
        accent: '#EF8354',
        pattern: 'bloom',
      },
    },
  ];
}

export const EMPTY_EXPLORE_FILTERS: ExploreFilters = {
  artists: [],
  genres: [],
  cities: [],
  moods: [],
  decades: [],
};

export function hasActiveExploreFilters(filters: ExploreFilters): boolean {
  return (
    filters.artists.length > 0 ||
    filters.genres.length > 0 ||
    filters.cities.length > 0 ||
    filters.moods.length > 0 ||
    filters.decades.length > 0
  );
}

// OR within each category, AND across active (non-empty) categories:
// (Artist A OR Artist B) AND (Genre X OR Genre Y) AND (City M OR City N) ...
export function applyExploreFilters(songs: Song[], filters: ExploreFilters): Song[] {
  return songs.filter((song) => {
    if (filters.artists.length > 0) {
      const matchesAnyArtist = filters.artists.some((artist) =>
        song.artists.includes(artist)
      );
      if (!matchesAnyArtist) return false;
    }
    if (filters.genres.length > 0) {
      const matchesAnyGenre = filters.genres.some((genre) =>
        song.genres.includes(genre)
      );
      if (!matchesAnyGenre) return false;
    }
    if (filters.cities.length > 0) {
      const matchesAnyCity = filters.cities.some((city) => song.city === city);
      if (!matchesAnyCity) return false;
    }
    if (filters.moods.length > 0) {
      const matchesAnyMood = filters.moods.some((mood) =>
        song.moods.includes(mood)
      );
      if (!matchesAnyMood) return false;
    }
    if (filters.decades.length > 0) {
      const matchesAnyDecade = filters.decades.some(
        (decade) => song.decade === decade
      );
      if (!matchesAnyDecade) return false;
    }
    return true;
  });
}

export function applyQuickFilter(
  songs: Song[],
  category: FilterCategoryKey,
  value: string
): Song[] {
  return songs.filter((song) => {
    switch (category) {
      case 'artists':
        return song.artists.includes(value);
      case 'genres':
        return song.genres.includes(value);
      case 'cities':
        return song.city === value;
      case 'moods':
        return song.moods.includes(value);
      case 'decades':
        return song.decade === value;
    }
  });
}

export function applySearchQuery(songs: Song[], query: string): Song[] {
  const q = query.trim().toLowerCase();
  if (!q) return songs;
  return songs.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.genres.some((g) => g.toLowerCase().includes(q)) ||
      s.city.toLowerCase().includes(q) ||
      s.moods.some((m) => m.toLowerCase().includes(q)) ||
      s.decade.toLowerCase().includes(q)
  );
}

export function sortSongs(songs: Song[], sort: SortConfig): Song[] {
  const copy = [...songs];
  const dir = sort.order === 'newest' ? 1 : -1;

  copy.sort((a, b) => {
    if (sort.field === 'dateFound') {
      return (b.foundAt - a.foundAt) * dir;
    }
    if (sort.field === 'title') {
      const cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      // For text fields: "Newest First" = A→Z default ascending; "Oldest First" = Z→A reverse
      return cmp * dir;
    }
    const cmp = a.artist.localeCompare(b.artist, undefined, { sensitivity: 'base' });
    return cmp * dir;
  });

  return copy;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatSongTimestamp(epochMs: number): string {
  const d = new Date(epochMs);
  const weekday = WEEKDAYS[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${weekday}, ${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
}

export function formatShortTimestamp(epochMs: number): string {
  const d = new Date(epochMs);
  const day = d.getDate();
  const month = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
}

export function getDateGroupLabel(epochMs: number): string {
  const d = new Date(epochMs);
  const ref = new Date(REFERENCE_NOW);

  const isSameDay =
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate();

  if (isSameDay || epochMs > REFERENCE_NOW) {
    return 'Today';
  }

  const diffDays = Math.floor((REFERENCE_NOW - epochMs) / (1000 * 60 * 60 * 24));
  if (diffDays >= 1 && diffDays <= 10 && d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear()) {
    return 'Last Week';
  }

  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export interface SongGroup {
  label: string;
  songs: Song[];
}

export function groupSongsForDisplay(songs: Song[], sort: SortConfig): SongGroup[] {
  if (sort.field !== 'dateFound') {
    // Group alphabetically by first letter when sorted by Title or Artist
    const map = new Map<string, Song[]>();
    for (const song of songs) {
      const sourceText = sort.field === 'title' ? song.title : song.artist;
      const firstChar = sourceText.trim().charAt(0).toUpperCase();
      const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
      const existing = map.get(key);
      if (existing) existing.push(song);
      else map.set(key, [song]);
    }
    return Array.from(map.entries()).map(([label, items]) => ({
      label,
      songs: items,
    }));
  }

  const groups: SongGroup[] = [];
  const labelToIndex = new Map<string, number>();

  for (const song of songs) {
    const label = getDateGroupLabel(song.foundAt);
    const existingIdx = labelToIndex.get(label);
    if (existingIdx !== undefined) {
      groups[existingIdx].songs.push(song);
    } else {
      labelToIndex.set(label, groups.length);
      groups.push({ label, songs: [song] });
    }
  }
  return groups;
}

// Ordered category values matching the Figma boards (board 03 quick-filter & board 04 Explore)
export function getCategoryValues(
  songs: Song[],
  category: FilterCategoryKey,
  mode: 'quick' | 'explore' = 'explore'
): string[] {
  const unique = new Set<string>();
  for (const song of songs) {
    if (category === 'artists') song.artists.forEach((a) => unique.add(a));
    else if (category === 'genres') song.genres.forEach((g) => unique.add(g));
    else if (category === 'cities') unique.add(song.city);
    else if (category === 'moods') song.moods.forEach((m) => unique.add(m));
    else if (category === 'decades') unique.add(song.decade);
  }

  const list = Array.from(unique);

  if (category === 'artists') {
    if (mode === 'quick') {
      // Board 03 shows Pritam, Shreya Ghoshal first in Quick Filter Artists
      const priority = ['Pritam', 'Shreya Ghoshal', 'Anne Amie', 'Laufey', 'Anirudh Ravichander'];
      return list.sort((a, b) => {
        const ia = priority.indexOf(a);
        const ib = priority.indexOf(b);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return a.localeCompare(b);
      });
    }
    // Board 04 Explore shows alphabetical starting Aarti Mishra, Aksomanic, Amrinder Gill, Anirudh Ravichander, Anne Amie, Antara Mitra...
    return list.sort((a, b) => a.localeCompare(b));
  }

  if (category === 'genres') {
    // Board 04 Explore shows alphabetical: Acoustic, Adult Alternative, Adult Contemporary, Alternative, Alternative Folk, Alternative Rap...
    return list.sort((a, b) => a.localeCompare(b));
  }

  if (category === 'cities') {
    const priority = ['Hyderabad', 'Mumbai', 'Bengaluru', 'Chennai', 'London', 'New York'];
    return list.sort((a, b) => {
      const ia = priority.indexOf(a);
      const ib = priority.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }

  if (category === 'moods') {
    const priority = ['Chill', 'Energetic', 'Focus', 'Melancholic', 'Romantic', 'Upbeat'];
    return list.sort((a, b) => {
      const ia = priority.indexOf(a);
      const ib = priority.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }

  // Decades: '70s, '80s, '90s, '00s, '10s, '20s
  const decadeOrder = ["'70s", "'80s", "'90s", "'00s", "'10s", "'20s"];
  return list.sort((a, b) => {
    const ia = decadeOrder.indexOf(a);
    const ib = decadeOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    return a.localeCompare(b);
  });
}
