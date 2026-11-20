# Prioritized Improvements & Refinement Roadmap

This document consolidates all remaining opportunities identified across the current codebase after completing the 5-pass Design Refinement, the SongCard Heart integration, and the Explore Clear button alignment fix.

All items respect existing locked decisions:
- **Dual-context colour**: Apple Blue (`#0A84FF`) for navigation, filters, selection, and Settings; Pink-Red (`#FA2D55`) for Music Player playback and favourite hearts.
- **Locked iconography & player copy**: Heart icon for Favorites everywhere; strictly 2 metadata lines (Title + Artist) in the Music Player.
- **Strict Phase 1 vs. Phase 2 separation**: Fixes and craft polish (P0–P2) stay inside Phase 1 scope; net-new product features are isolated in P3 and require explicit approval.

---

## Priority Matrix Overview

| Tier | Focus | Items |
| :--- | :--- | :--- |
| **P0 — Fix Immediately** | Real CSS cascade bugs, layout clipping, and ARIA nesting defects currently in the live build | 3 items |
| **P1 — High-Impact UX & Accessibility** | Undo safety, keyboard menu navigation, carousel feel, and bulk-action polish | 5 items |
| **P2 — Performance, Persistence & Hygiene** | Viewport-lazy procedural rendering, local persistence, edge-case guards, dead-field cleanup | 5 items |
| **P3 — Optional Phase 2 Roadmap** | Net-new capabilities strictly outside Phase 1 scope | 4 items |

---

## P0 — Immediate Structural & Visual Fixes (Highest ROI)

### 1. Move Remaining Unlayered Utility/Component Classes into `@layer components`
- **Where**: `src/index.css` (`.glass-pill`, `.glass-popover`, `.glass-circle`, `.card-surface`, `.pressable`, `.pressable-strong`, `.player-control-surface`)
- **Current Issue**: Just as `.hit-target-44` previously overrode Tailwind's `absolute` utility, the remaining unlayered surface classes currently outrank Tailwind v4 `@layer utilities`. As a result, state overrides written with Tailwind utilities are silently ignored:
  - Selected multi-select `SongCard` tint (`bg-[#181D27] border-[var(--accent-blue)]/45`) is overridden by `.card-surface`.
  - Pressed `SongCard` tint (`bg-[var(--surface-card-pressed)]`) is overridden by `.card-surface`.
  - Open `SortPopover` trigger highlight (`bg-white/[0.18]`) is overridden by `.glass-circle`.
- **Proposed Fix**: Wrap all custom component classes in `src/index.css` inside `@layer components { ... }` so Tailwind state/override utilities always win cleanly.
- **Impact**: High | **Effort**: Very Low (5 min)

### 2. Eliminate Nested Interactive Elements Inside `SongCard`
- **Where**: `src/components/SongCard.tsx`
- **Current Issue**: The card container uses `role="button"` / `role="checkbox"` with `tabIndex={0}` while wrapping two inner `<button>` elements (`MoreHorizontal` and `Heart`). HTML/ARIA specifications disallow interactive descendants inside an interactive role; screen readers (VoiceOver/NVDA) can announce conflicting controls or drop inner button announcements.
- **Proposed Fix**: Refactor the card layout to use a non-interactive container with a stretched primary action button (or sibling hit layer) alongside independent sibling `<button>` elements for `MoreHorizontal` and `Heart`. Preserves exact visual geometry, long-press, and keyboard focus order without ARIA nesting violations.
- **Impact**: High (Accessibility / VoiceOver) | **Effort**: Low (15 min)

### 3. Reduce Over-Aggressive Chip Truncation in `ExploreFilterSheet`
- **Where**: `src/components/ExploreFilterSheet.tsx`, `src/components/FilterChip.tsx`
- **Current Issue**: The 3-row horizontal grids for `Artists` and `Genres` force a uniform `164px` column width (`auto-cols-[164px]` and `w-[164px]`), clipping standard names (`"Adult Alternative"`, `"Alternative Rap"`, `"Anirudh Ravichander"`, `"Amitabh Bhattacharya"`) into `"Adult Alternati..."`, `"Alternati..."`, etc.
- **Proposed Fix**: Widen multi-row chip columns (`auto-cols-[192px]` or intrinsic-width flex rows with `max-w-[216px]`) so common artist and genre names read cleanly without ellipsis clutter while preserving horizontal rhythm.
- **Impact**: High (Readability & Visual Craft) | **Effort**: Low (10 min)

---

## P1 — High-Impact UX, Accessibility & Interaction Craft

### 4. Add "Undo" Action to Destructive Removal Toasts
- **Where**: `src/App.tsx`
- **Current Issue**: Removing a song via `SongActionMenu` ("Remove from Library") or deleting multiple tracks via `MultiSelectActionControls` is permanent until page reload, with no recovery path if tapped accidentally.
- **Proposed Fix**: Snapshot the removed song record(s), their original list indices, and their playlist memberships when deleting; render a crisp inline `"Undo"` pill button inside the toast (extending toast timeout to `4000ms` for destructive actions) to restore them cleanly in one tap.
- **Impact**: High | **Effort**: Low–Medium (20 min)

### 5. Complete Roving Arrow-Key Navigation on Custom Menus
- **Where**: `src/components/SortPopover.tsx`, `src/components/SongActionMenu.tsx`, `src/screens/LibraryScreen.tsx` (Filter More popover)
- **Current Issue**: All three menus now expose accurate WAI-ARIA roles (`role="menu"`, `role="menuitem"`, `role="menuitemradio"`), but keyboard users must use `Tab` instead of standard `ArrowDown` / `ArrowUp` / `Home` / `End` menu navigation.
- **Proposed Fix**: Add a small shared `useMenuKeyboardNav` hook (auto-focusing the first or checked item on open, cycling with Arrow/Home/End keys, closing on `Escape`) and wire it to all three menus.
- **Impact**: Medium–High (Keyboard & WCAG APG Compliance) | **Effort**: Low (15 min)

### 6. Upgrade Multi-Select Bulk Favorite to Smart Toggle + Visual Feedback
- **Where**: `src/App.tsx`, `src/components/MultiSelectActionControls.tsx`
- **Current Issue**: Tapping the bulk Heart button in multi-select currently only *adds* selected songs to Favorites—if all selected tracks are already favourited, tapping Heart repeats `"Added N songs to Favorites"` instead of toggling them off, and the Heart icon does not reflect that the current selection is already liked.
- **Proposed Fix**: Compute `allSelectedFavorited` from `selectedSongIds` and `favoriteIds`. Fill the bulk Heart in `--player-accent` (`#FA2D55`) when all selected tracks are already favourited, and toggle cleanly between bulk-like and bulk-unlike with accurate toast copy.
- **Impact**: Medium–High | **Effort**: Low (10 min)

### 7. Add Scroll-Snap & Right-Edge Scroll Cue to Home `Recently Found` Carousel
- **Where**: `src/screens/HomeScreen.tsx`
- **Current Issue**: The horizontal `Recently Found` carousel scrolls freely without snapping and has a hard clip on the right edge, making swiping feel slightly loose compared to native iOS carousels.
- **Proposed Fix**: Add `snap-x snap-mandatory scroll-px-4` to the carousel container with `snap-start` on each card, plus a subtle right-edge fade mask (`mask-image`) so the next peeking card tapers gracefully.
- **Impact**: Medium | **Effort**: Very Low (5 min)

### 8. Highlight the Currently Playing Track in Library & Search Lists
- **Where**: `src/components/SongCard.tsx`, `src/screens/LibraryScreen.tsx`, `src/components/GlobalSearchOverlay.tsx`, `src/App.tsx`
- **Current Issue**: When a user starts playing a song in `MusicPlayerSheet` and dismisses the player back to Library, playback continues in the background with no cue indicating which song in the list is currently active.
- **Proposed Fix**: Pass `isActiveTrack={song.id === currentSongId}` and `isPlaying` to `SongCard`. Replace the static play triangle on the active cover badge with a subtle animated 3-bar equalizer (or static pause/bars under `prefers-reduced-motion`) and tint the active track title subtly to signal playback state.
- **Impact**: Medium | **Effort**: Low (15 min)

---

## P2 — Performance, Persistence & Code Hygiene

### 9. Defer Off-Screen Procedural Artwork Rendering Until Visible
- **Where**: `src/components/ProceduralArtwork.tsx`, `src/lib/artworkRenderer.ts`
- **Current Issue**: Opening the Library mounts all 83 `SongCard` items simultaneously, triggering synchronous canvas rendering for up to 75 non-hero tracks on initial mount (and cycling past the 36-item thumbnail LRU cap during initial render before the user even scrolls).
- **Proposed Fix**: Gate procedural canvas generation behind a lightweight `IntersectionObserver` (with `rootMargin: '240px'`) while displaying the instant CSS gradient placeholder (`linear-gradient(135deg, primary, secondary)`) until cards approach the viewport, plus `loading="lazy"` on below-the-fold `<img>` tags. Cuts initial Library mount work by ~80% and keeps the 36-item LRU warm for visible tracks.
- **Impact**: High on mobile devices | **Effort**: Low–Medium (20 min)

### 10. Persist Local User State to `localStorage`
- **Where**: `src/App.tsx`
- **Current Issue**: Favorites, playlist edits, newly Shazamed demo tracks, mismatch corrections, deleted songs, and Settings preferences (`Location`, `Haptic Feedback`) reset on browser reload.
- **Proposed Fix**: Add a small versioned `localStorage` persistence layer (safe `try/catch` for sandbox/private-mode storage quotas) for `songs`, `favoriteIds`, `playlists`, `locationEnabled`, `hapticEnabled`, and `sort`.
- **Impact**: Medium–High | **Effort**: Low–Medium (20 min)

### 11. Reset `AlbumCover` Fallback Flag When `imageUrl` Changes
- **Where**: `src/components/ProceduralArtwork.tsx`
- **Current Issue**: `const [imgFailed, setImgFailed] = useState(false)` is never reset if an `AlbumCover` instance is reused across tracks with different `artwork.imageUrl` values (e.g., skipping tracks inside a reused player slot).
- **Proposed Fix**: Reset `imgFailed` in a `useEffect(() => setImgFailed(false), [artwork.imageUrl])` (or key the `<img>` on `artwork.imageUrl`).
- **Impact**: Low–Medium (Reliability) | **Effort**: Very Low (2 min)

### 12. Improve Music Player Ambient Contrast on Bright/High-Key Covers
- **Where**: `src/components/MusicPlayerSheet.tsx`
- **Current Issue**: Increasing the ambient radial wash opacity to `0.52` enriches dark/moody covers, but very bright pastel or white-dominant covers can slightly reduce contrast around the top-left Close button (`X`) and sheet grabber.
- **Proposed Fix**: Add a subtle top-edge dark scrim (`from-black/48 via-transparent` in the top `96px`) and ensure the grabber pill uses `bg-white/35` with a soft dark drop shadow for guaranteed legibility on any cover palette.
- **Impact**: Low–Medium | **Effort**: Very Low (5 min)

### 13. Remove Dead `hasAppleMusicBadge` Field Across Types & Data
- **Where**: `src/types/music.ts`, `src/data/songs.ts`
- **Current Issue**: The Apple Music badge UI was removed per earlier user feedback, leaving `hasAppleMusicBadge?: boolean` unused across `Song` records.
- **Proposed Fix**: Delete the unused property from `Song` and `INITIAL_SONGS` to keep the data schema clean.
- **Impact**: Low (Code Hygiene) | **Effort**: Very Low (5 min)

---

## P3 — Optional Phase 2 Product Extensions *(Out of Phase 1 Scope — Approval Required)*

These are intentionally separated so they are **not** implemented unless you decide to unlock Phase 2:

### 14. Connect `Now Playing` Tab + Optional Floating Mini-Player Bar
- Replace the Phase 1 placeholder on the **Now Playing** tab with the active track view, interactive **Up Next** queue reordering, and synced lyrics view, paired with a compact mini-player pill above the bottom navigation whenever a song is playing on Home or Library.

### 15. Favorites Quick-Filter Chip in Library
- Now that every song card supports one-tap liking/unliking, add a **Favorites** quick filter (or filter toggle) so users can view only their liked songs without scrolling through all 83 tracks.

### 16. Local Playlist Creation & Management
- Add a **"+ New Playlist"** row inside `PlaylistPickerSheet` and allow viewing/playing individual playlists from the Library.

### 17. Web Audio Playback Preview & Automated Visual Regression Checks
- Optionally wire lightweight Web Audio preview playback (or royalty-free audio loops) to the Music Player Play/Pause and scrubber controls, and run headless Chromium visual regression tests outside the sandbox at `393×852`, `375×667`, and desktop breakpoints (`prefers-reduced-motion`, `prefers-contrast: more`, and sheet gesture thresholds).

---

## Recommended Execution Order

1. **Quick Craft & Bug-Fix Pass (P0 #1–#3 + P2 #11–#13)**: ~35 minutes total; eliminates the CSS cascade trap, fixes nested ARIA buttons on `SongCard`, cleans up `ExploreFilterSheet` chip readability, and hardens minor edge cases.
2. **Interaction Polish Pass (P1 #4–#8)**: ~1 hour total; adds Undo safety, full keyboard menu navigation, smart bulk-heart toggle, carousel scroll-snap, and active-track feedback.
3. **Performance & Persistence Pass (P2 #9–#10)**: ~40 minutes total; adds viewport-lazy procedural canvas generation and `localStorage` persistence.
4. **Phase 2 Scope Decision (P3 #14–#17)**: Cherry-pick only the features you want to unlock next.
