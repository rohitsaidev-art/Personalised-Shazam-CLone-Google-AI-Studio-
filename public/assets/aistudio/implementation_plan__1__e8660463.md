# Music Library App — Phase 1 Implementation Plan

Build **Phase 1** of the dark, iOS-crafted music identification history and library prototype faithful to the six supplied Figma flow boards and Phase 1 brief: Home, Settings bottom sheet, Library (83 seeded songs), Sort popover, Quick Filters, Advanced Explore multi-filter with live AND logic, Song long-press contextual menu, Multi-select mode, and shared floating navigation (`Home · Library · Now Playing`) paired with a separate circular Search action.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The four clarifying choices below were confirmed and locked in before implementation, alongside strict Phase 1 scope boundaries (no Concerts tab, no extra settings, and full Now Playing playback deferred to Phase 2).

- **Viewport Framing (Confirmed)**: Render inside a centered iPhone-proportioned mobile frame (`393 × 852` aspect with dark bezel, status bar, and Dynamic Island styling) on desktop viewports, expanding seamlessly edge-to-edge full-screen on mobile screens.
- **Tap to Shazam Behavior (Confirmed)**: Tapping the central button triggers an interruptible concentric listening pulse animation with simulated audio-recognition states that identifies a deterministic demo track and adds it to the top of Recently Found & Library (with a subtle feedback banner and optional haptic vibration when Haptic Feedback is enabled).
- **Separate Circular Search Button (Confirmed)**: Preserved beside the floating bottom navigation pill across main screens; tapping it opens a lightweight translucent search overlay that filters the local 83-song Library in real time without removing the persistent `Search in Library` field on the Library screen.
- **Artwork & Category Visuals (Confirmed)**: Deterministic, rich procedural SVG album covers (distinct palettes, layered geometric/editorial compositions, and bespoke motifs matching the board references like *Lover Girl*, *No Church in the Wild*, *Putaapu Gang*, *Indecisive*, and *Uyiril Thodum*) plus circular artist/genre/city/mood/decade emblems—zero external image URLs that can break or 404.
- **Phase 2 Boundary (Locked)**: The `Now Playing` tab exists in the bottom navigation bar and routes to a restrained Phase 1 placeholder screen noting that full playback, queue, and lyrics arrive in Phase 2.

---

## 1. Overview & Core Concept

- **What It Does**: A tactile, dark-mode music identification history and personal library app where users identify songs from Home, browse and sort their chronological Shazam history, slice their collection via single-tap Quick Filters or multi-category Explore filters (`AND` logic), and manage tracks via long-press actions and multi-select bulk operations.
- **Target Audience / Persona**: Music listeners who regularly identify tracks in the wild and want fast, calm, thumb-friendly ways to rediscover songs by date, artist, genre, city, mood, or decade.
- **Key Value**: Transforms a flat recognition history into a fluid, directly manipulable library where sorting, quick filtering, multi-dimensional Explore combinations, and bulk organization respond instantaneously with zero layout shift.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Home → Identify & Settings**
   - User lands on the dark, uncluttered Home screen with the top-right Settings gear, central **Tap to Shazam** button, horizontally scrollable **Recently Found** cards (`Just now · Lover Girl · Laufey`, with partial next card peeking to signal scrollability), and the floating bottom navigation pill + separate circular Search button.
   - Tapping **Tap to Shazam** launches a fluid concentric listening state (interruptible by tapping again to cancel) and surfaces a matched track tagged with the active Location city preference (when enabled).
   - Tapping the top-right Settings gear presents the dark **Settings** bottom sheet with top-left circular `X`, centered `Settings` title, `Preferences` section, and **only** two controls: **Location** (opens a compact inline permission/city selector for tagging found songs, e.g., Hyderabad / Always / While Using / Never) and **Haptic Feedback** (blue iOS switch).

2. **Library → Search & Sort**
   - Tapping **Library** displays the bold `Library` header, live song count (`83 songs` initially), top-right circular Sort (`↑↓`) trigger, persistent `Search in Library` rounded search bar, quick-filter row, and date-grouped song cards (`Today`, `Last Week`, `November 2026`, `July 2026`, `June 2026`, `May 2026`, etc.).
   - Tapping `↑↓` opens a translucent **Sort By** popover anchored directly to the trigger with **Sort field** (`Date Found`, `Song Title`, `Artist Name`) and **Order** (`Newest First`, `Oldest First`), defaulting to `Date Found` + `Newest First`. Selecting any option immediately reorders and regroups the list.
   - Typing in `Search in Library` filters songs instantaneously across title, artist, genre, and city; `Search in Library` remains visible across Library default, quick-filter, advanced-filter results, and multi-select states.

3. **Library → Quick Filters**
   - The horizontal quick-filter bar starts with the circular filter icon (three descending lines) followed by horizontally scrollable category chips with circular thumbnails: **Artists**, **Genres**, **Cities**, **Moods**, and **Decades** (clipped edge visibly signals horizontal scroll).
   - Tapping a category (e.g., `Artists`) swaps the filter icon to a circular `X` and reveals that category's value chips (`Pritam`, `Shreya Ghoshal`, `Anne Amie`, etc.).
   - Selecting a value (e.g., `Pritam`) highlights the chip, filters the Library immediately (`5 songs`), and preserves chronological date grouping (`July 2026`, `June 2026`, `May 2026`), sort control, `Search in Library`, and bottom navigation.

4. **Library → Advanced Explore Multi-Filter → Results → Back to Explore**
   - Tapping the circular three-line filter icon opens the full-height **Explore** sheet (`X` top-left, `Explore` / `Your top artists, genres and more`).
   - Displays **exactly five categories**: **Artists**, **Genres**, **Cities**, **Moods**, **Decades**, arranged in multi-row horizontal carousels where the next column peeks on the right edge to communicate scrollability.
   - All chip thumbnails are circular. Tapping any chip toggles selection and swaps the circular artwork in-place for a crisp white checkmark (`✓`) inside the exact same circular bounds (plus blue highlight ring/tint), with zero chip resizing or reflow.
   - Multi-select works within and across categories using strict **AND** logic. The bottom CTA updates live (`Show 24 Songs` for `Anne Amie` + `Alternative` + `Hyderabad`).
   - Tapping **Show N Songs** opens **Advanced-Filter Results**: shows `Library` + live count (`24 songs`), `Search in Library`, top-right Sort control, a horizontal row with circular `X` + active filter chips (`Anne Amie`, `Alternative`, `Hyderabad`), and date-grouped matching songs.
   - Removing any active filter chip immediately recomputes results and count. Tapping the results `X` returns directly to **Explore** with all previous selections and scroll offsets preserved (never dumping the user back to Library root).

5. **Song Long-Press → Action Menu → Multi-Select Mode**
   - Long-pressing a song card (supported on both touch and desktop mouse/pointer press-and-hold, plus accessible via the card's `...` button for desktop ergonomics) scales and elevates the target card over a darkened blur scrim and anchors the exact 6-item contextual menu:
     1. **Select**
     2. **Remove from Library** (destructive red)
     3. **Wrong Song? Tell Shazam** (opens a focused mismatch sheet with 3 deterministic candidate corrections that replace the track in-place on tap)
     4. **Go to Artist** (applies Artist Library filter view)
     5. **Go to Genre** (applies Genre Library filter view)
     6. **Share** (invokes Web Share API with clean clipboard/toast fallback)
   - Choosing **Select** enters **Multi-Select Mode**: `Done` pill appears top-right, a circular checkbox sits to the left of each song card (blue fill + white checkmark when selected), and the floating bottom navigation transitions into unboxed bottom controls over a subtle bottom-up dark gradient fade—**no enclosing toolbar container**:
     - Left: standalone circular Delete button (**white** bin icon at `0 selected`, turning **red** when `≥ 1` song is selected).
     - Center: translucent count pill (`0 selected`, updating live to `2 selected`, etc. strictly from the selected song ID set).
     - Right: standalone circular **Add to Favorites** (star) and **Add to Collection** (plus-in-square) buttons with immediate feedback and local state mutation.
   - Tapping **Done** clears selection and returns smoothly to normal Library mode.

### Visual Identity & Theme

- **Aesthetic Direction**: Authentic iOS dark audio-utility craft modeled directly on the flow boards—deep obsidian backgrounds, tactile frosted dark glass surfaces (`backdrop-filter: blur(24px) saturate(180%)`), subtle top specular borders, and high-legibility white/muted-slate type.
- **Color Palette & Tokens**:
  - `--bg-canvas`: `#05070B` (Home radial midnight slate `#0A111A` fading to `#05070B`; Library pure deep black `#000000`)
  - `--surface-card`: `#141619` / `#1C1C1E` (rounded song cards and grouped settings rows, hairline border `rgba(255,255,255,0.06)`)
  - `--surface-glass`: `rgba(28, 28, 32, 0.78)` with `blur(24px)` (floating bottom nav pill, circular Search button, Sort popover, long-press menu)
  - `--accent-primary`: `#0A84FF` / `#1E7BFF` (active tab icon/label, selected filter outline & check circle, Explore primary CTA, Haptic toggle)
  - `--accent-destructive`: `#FF453A` (Remove from Library menu item, active multi-select Delete icon when count `> 0`)
  - `--text-primary`: `#FFFFFF`, `--text-secondary`: `#8E8E93`, `--text-tertiary`: `#636366`
- **Typography & Hierarchy**:
  - Platform-native Apple UI sans stack (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Plus Jakarta Sans", system-ui, sans-serif`) for authentic iOS optical sizing.
  - Size-specific tracking: tight negative tracking (`-0.025em`) on `32px` bold `Library` and `24px` `Explore` headings; neutral (`0em`) on `15px–16px` song titles; slightly open (`+0.01em`) on `11px–12px` timestamps and nav labels.
  - `tabular-nums` applied to all song counts (`83 songs`, `24 songs`, `2 selected`) and timestamps so live updates never jitter horizontally.
- **Component Styling & Layout**:
  - Touch targets meet $\ge 44\text{px}$ ergonomics (`min-h-[44px] min-w-[44px]`), single-line labels with `truncate` / `whitespace-nowrap shrink-0`, horizontal carousels with momentum scrolling and visible right-edge card/column clipping.
  - Floating bottom navigation pill (`Home · Library · Now Playing`) sits beside the **separate** circular Search button with a clean `10px` gap over a soft bottom scroll-edge fade.

### Interactive Feedback & Motion (Apple Design Principles)

- **Zero-Latency Pointer-Down Response**: Immediate subtle press compression (`scale(0.97)`) on `pointerdown` for song cards, filter chips, tab items, and circular controls—never waiting for `click`.
- **Critically Damped Springs (`motion/react`)**: Default UI transitions use critically damped springs (`bounce: 0`, `duration: 0.35–0.4s`) for sheets, popovers, and mode switches; momentum/gesture dismissals on bottom sheets support interactive drag-to-dismiss with velocity handoff and rubber-banding at top bounds.
- **Anchored Origins**: Sort popover scales smoothly from the top-right `↑↓` button (`transform-origin: top right`); song contextual menu anchors directly to the long-pressed card's screen bounds; Settings and Explore sheets rise and dismiss symmetrically along the bottom vertical axis.
- **Accessibility & Reduced Motion**: Full `@media (prefers-reduced-motion: reduce)` fallback to short opacity cross-fades, `prefers-reduced-transparency` solid-surface fallback, visible focus states, and optional `navigator.vibrate` hooks gated strictly by the Settings **Haptic Feedback** toggle.

---

## 3. Key Product Decisions & Trade-Offs

- **Single Source of Truth for Library State & Derived Views**
  - *Chosen Approach*: Maintain one canonical `songs[]` array (seeded to 83 deterministic tracks) alongside independent `sortConfig`, `searchQuery`, `quickFilter`, `exploreSelection`, `activeViewMode`, `selectedSongIds` (`Set<string>`), `favoriteIds`, and `collectionIds`. Compute displayed songs, date groups, and counts via pure memoized selectors.
  - *Why*: Eliminates any possibility of counter drift (guaranteeing e.g. 2 checked songs always displays `2 selected` and removing one Explore chip instantly recalculates the count).
  - *Alternatives Considered*: Separate filtered list copies or manual count state—rejected because mutations (removing a song, correcting a mismatch, bulk deleting) would easily desync counts.

- **Exact Data Seeding for Reference Scenarios**
  - *Chosen Approach*: Seed the 83 tracks deterministically so:
    1. Top `Today` songs exactly match the boards: *Lover Girl* (Laufey), *No Church in the Wild (feat. Frank Ocean & The-Dream)* [E] (JAY-Z & Kanye West), *Putaapu Gang* (Anirudh Ravichander & Thaman S), *Indecisive (Is It A Crime)* [E] (Kidwild), plus *Uyiril Thodum (From "Kumbalangi Nights")* (Anne Amie), *Mehrama (Extended)*, *Dil Ye Bekarar Kyun Hai*, and *Kahani (From "Laal Singh Chaddha")* (Pritam).
    2. Quick-filtering `Artists → Pritam` returns **5 songs** across `July 2026`, `June 2026`, `May 2026`, and earlier dates.
    3. Multi-filtering in Explore with **Anne Amie + Alternative + Hyderabad** matches **exactly 24 songs** under strict **AND** logic (achieved cleanly by supporting multi-artist/featured metadata or seeded tracks attributed to `Anne Amie` with `Alternative` genre and `Hyderabad` city, while preserving the initial top 4 `Today` songs in the default 83-song view).
  - *Why*: Every single visual and numerical acceptance test in the brief works through genuine filtering logic with zero hard-coded overrides.

- **Dual Long-Press + Ellipsis Trigger for Contextual Menu**
  - *Chosen Approach*: Implement true 420ms pointer long-press with movement cancellation threshold (`10px` hysteresis) on every song card, plus wire the card's top-right `...` button to open the exact same contextual menu.
  - *Why*: Makes the long-press flow effortless on both mobile touchscreens and desktop mouse/trackpad testing without adding any extra UI chrome.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        MobileFrame Shell                                │
│         (Centered 393×852 iPhone Frame on Desktop / Full Mobile)        │
├─────────────────────────────────────────────────────────────────────────┤
│                     Central Library State Store                         │
│  songs[83] · sortConfig · searchQuery · quickFilter · exploreFilters    │
│  selectedIds · favorites · collections · settings(location, haptics)    │
│  activeTab('home' | 'library' | 'now-playing') · activeOverlay          │
└───────────┬──────────────────────┬───────────────────────┬──────────────┘
            │                      │                       │
            ▼                      ▼                       ▼
   ┌─────────────────┐   ┌───────────────────┐   ┌────────────────────┐
   │   Home Screen   │   │  Library Screen   │   │ Now Playing Screen │
   │ • Settings Btn  │   │ • Header + Count  │   │ • Phase 1 Minimal  │
   │ • Tap to Shazam │   │ • Sort Trigger    │   │   Destination Only │
   │ • Recently Found│   │ • Search in Lib   │   │   (Phase 2 Note)   │
   └────────┬────────┘   │ • QuickFilterRow  │   └────────────────────┘
            │            │   / Active Chips  │
            ▼            │ • Date-Grouped    │
   ┌─────────────────┐   │   SongCard List   │
   │  SettingsSheet  │   └────┬────┬────┬────┘
   │ • Location      │        │    │    │
   │ • Haptic Toggle │        │    │    └──────────────────┐
   └─────────────────┘        │    ▼                       ▼
                              │  ┌──────────────────┐  ┌──────────────────┐
                              │  │   SortPopover    │  │ ExploreSheet     │
                              │  │ • Field (3)      │  │ • 5 Categories   │
                              │  │ • Order (2)      │  │ • Multi-select   │
                              │  └──────────────────┘  │ • Live AND CTA   │
                              ▼                        └──────────────────┘
                    ┌────────────────────┐
                    │   SongActionMenu   │
                    │ 1. Select ─────────┼──► Multi-Select Mode
                    │ 2. Remove          │    • Per-row blue check circles
                    │ 3. Wrong Song? ────┼──► Mismatch Correction Sheet
                    │ 4. Go to Artist    │    • Floating Gradient Controls:
                    │ 5. Go to Genre     │      [Delete] [N selected] [★][+]
                    │ 6. Share           │
                    └────────────────────┘
├─────────────────────────────────────────────────────────────────────────┤
│               Persistent Floating Bottom Chrome                         │
│    [ Floating Pill: Home · Library · Now Playing ]   +   ( 🔍 Search )  │
│                                                               │         │
│                                                  Lightweight Search     │
│                                                  Overlay (83-song lib)  │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **`Song` Entity**:
  - `id: string`, `title: string`, `artist: string`, `artists: string[]` (supports primary & featured artist matching), `explicit?: boolean`, `foundAt: number` (epoch ms for exact chronological sorting & relative/month date-group labels like `Today`, `Last Week`, `November 2026`, `July 2026`), `genres: string[]`, `city: string`, `moods: string[]`, `decade: string`, `artworkSeed: ArtworkSpec`, `sourceBadge?: 'apple-music'`.
- **`ExploreSelection` State**:
  - Five explicit sets: `artists: string[]`, `genres: string[]`, `cities: string[]`, `moods: string[]`, `decades: string[]`.
  - **Strict AND Evaluation**: Every active selected criterion across and within categories must be satisfied by a song for it to match (e.g., `Anne Amie` + `Alternative` + `Hyderabad` evaluates `matchesArtist('Anne Amie') && matchesGenre('Alternative') && matchesCity('Hyderabad')` → returns **24 songs**).
- **Deterministic Seed Verification**:
  - Total initial library count: **83 songs**.
  - `Artists: Pritam` quick filter → **5 songs** (including *Mehrama (Extended)* in July 2026, *Dil Ye Bekarar Kyun Hai* in June 2026, and *Kahani (From "Laal Singh Chaddha")* in May 2026).
  - `Explore: Anne Amie + Alternative + Hyderabad` → **24 songs** (including *Uyiril Thodum (From "Kumbalangi Nights")* in November 2026 and 23 additional matching records).
  - Additional rich coverage across all 5 Explore categories (`Aarti Mishra`, `Aksomanic`, `Amrinder Gill`, `Anirudh Ravichander`, `Anne Amie`, `Antara Mitra`, `Laufey`, `Pritam`, `Shreya Ghoshal`, `Kidwild`, `JAY-Z & Kanye West`; genres `Acoustic`, `Adult Alternative`, `Adult Contemporary`, `Alternative`, `Alternative Folk`, `Alternative Rap`, `Indie Pop`, `Bollywood`, `Hip-Hop`; cities `Hyderabad`, `Mumbai`, `Bengaluru`, `London`, `New York`; moods `Chill`, `Energetic`, `Melancholic`, `Focus`, `Upbeat`; decades `'70s`, `'80s`, `'90s`, `'00s`, `'10s`, `'20s`).

### Interactive Component & State Mapping

| Component | User Interaction | State Transition & Derived Output |
| :--- | :--- | :--- |
| `TapToShazamButton` | Tap (or tap again mid-listen) | Toggles listening pulse; on completion prepends next demo track (tagged with current Location city if enabled) to `songs`, updates Recently Found & Library count. |
| `SettingsSheet` | Open gear / toggle Haptics / tap Location / drag down or tap `X` | Opens spring sheet; updates `hapticEnabled` boolean; Location row opens sub-view (`While Using`, `Always`, `Never` + active city selector); dismisses cleanly to Home. |
| `SortPopover` | Tap `↑↓` / choose Field or Order / tap outside | Anchored popover toggles; updates `sortField` (`dateFound \| title \| artist`) and `sortOrder` (`newest \| oldest`); immediately re-sorts and regroups visible Library songs. |
| `QuickFilterRow` & `QuickFilterValues` | Tap category chip / tap value chip / tap `X` | Expands category values horizontally; selecting value sets `quickFilter` and updates count & list; tapping `X` clears quick filter and restores category chips. |
| `ExploreFilterSheet` | Tap filter icon / tap multi-category chips / tap `Show N Songs` / tap `X` | Toggles chip membership without resizing chips (circular artwork swaps to white `✓`); live AND-filtered count updates CTA; `Show N Songs` activates `advancedResults` mode; `X` from results reopens Explore with selections & scroll intact. |
| `SongActionMenu` | Long-press song card (420ms) or tap `...` | Elevates preview card + opens 6-item menu (`Select`, `Remove from Library`, `Wrong Song? Tell Shazam`, `Go to Artist`, `Go to Genre`, `Share`); every action executes live state mutation or focused view transition. |
| `MultiSelectActionControls` | Tap song rows / tap Delete, Favorite, Add to Collection / tap `Done` | Updates `selectedIds` Set; live count pill (`N selected`) and Delete icon color (`white` at 0 → `red` at `≥ 1`) derive directly from `selectedIds.size`; bulk actions mutate `songs`, `favoriteIds`, or `collectionIds` with subtle toast feedback; `Done` exits selection mode. |
| `BottomNavigation` & `SearchAction` | Tap tab / tap circular Search button | Switches active tab (`Home`, `Library`, `Now Playing`); circular Search button opens lightweight local search overlay over the 83-song library without disturbing persistent `Search in Library`. |
