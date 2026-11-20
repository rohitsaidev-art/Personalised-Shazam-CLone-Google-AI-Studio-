export type AppTab = 'home' | 'library' | 'now-playing';

export type SortField = 'dateFound' | 'title' | 'artist';
export type SortOrder = 'newest' | 'oldest';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export type FilterCategoryKey = 'artists' | 'genres' | 'cities' | 'moods' | 'decades';

export interface QuickFilterState {
  openCategory: FilterCategoryKey | null;
  selectedCategory: FilterCategoryKey | null;
  selectedValue: string | null;
}

export interface ExploreFilters {
  artists: string[];
  genres: string[];
  cities: string[];
  moods: string[];
  decades: string[];
}

export type ArtworkPattern =
  | 'clock'
  | 'gold-baroque'
  | 'crimson-poster'
  | 'noir-type'
  | 'kumbalangi'
  | 'vinyl'
  | 'prism'
  | 'waves'
  | 'horizon'
  | 'rings'
  | 'monolith'
  | 'bloom';

export interface ArtworkSpec {
  primary: string;
  secondary: string;
  accent: string;
  pattern: ArtworkPattern;
  monogram?: string;
  imageUrl?: string;
  imageScale?: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artists: string[];
  explicit?: boolean;
  foundAt: number; // Epoch ms
  genres: string[];
  city: string;
  moods: string[];
  decade: string;
  artwork: ArtworkSpec;
  hasAppleMusicBadge?: boolean;
}

export interface CandidateCorrection {
  id: string;
  title: string;
  artist: string;
  artists: string[];
  genres: string[];
  decade: string;
  artwork: ArtworkSpec;
}
