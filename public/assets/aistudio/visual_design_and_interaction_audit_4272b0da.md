# Visual Design & Interaction Audit

## Audit Scope & Transparency Note
- **Design Frameworks Applied:**
  - Attached Apple Design Skill (`APPLE-DESIGN-SKILL.md` — WWDC Fluid Interfaces)
  - Attached Apple HIG Reviewer & Music Player Pack (`SKILL.md`, `MUSIC_PLAYER_DESIGN_GUIDE.md`, `AI_STUDIO_WORKFLOW.md`)
  - System `frontend-design` Skill
  - Emil Kowalski design-engineering craft principles (note: no separate Emil `.md` skill file was present in `/public/assets/aistudio/` or `/skills/`, so standard craft criteria—optical alignment, concentric radius math, hairline specular lighting, crisp interruptible motion, and fast micro-interaction budgets—were applied directly).
- **Evaluation Limit:** No headless browser (`chromium` / `playwright`) is installed in this sandbox environment. Every finding below was therefore verified from exact computed DOM/CSS geometry, hex contrast math, SVG markup, and Motion configurations across all rendered components, compared directly against the 7 supplied reference boards (`01`–`06` and the Music Player reference `image.png`). **No code has been modified.**

---

## Executive Diagnosis: Why It Still Feels Like a Prototype Instead of a Premium Music App

The functional architecture is solid, and `MusicPlayerSheet` already adopts stronger craft habits (semantic tokens, scoped drag controls, 44px hit targets, `useReducedMotion`). However, the application as a whole falls short of a refined iOS music app for **five structural reasons**:

1. **Flat primitive vector artwork at hero scale** (`AlbumCover` and `CircularChipAvatar`) immediately reads as geometric clipart—especially at `304×304` inside the full-screen Music Player—robbing the app of the photographic depth, tonal richness, and surface contrast that make music apps feel alive.
2. **Two disconnected design systems coexist**: `MusicPlayerSheet` uses semantic CSS variables (`--player-*`), standardized Lucide strokes, and momentum drag physics, while all Phase 1 screens hardcode 12+ drifting near-black hexes, mismatched radii, inconsistent heights (`62px` nav pill vs `58px` Search button), and drifting stroke weights.
3. **Concentric geometry and vertical proportions are slightly off** across `SongCard`, `LibraryScreen` header chrome, and `BottomNavigation`, making cards look pinched at the corners and leaving `Library` crowded at the top while unbalanced at the bottom-right of each song card.
4. **Surface depth is too flat on `#000000`**, with barely visible `border-white/[0.04]` card edges and an abrupt black bottom fade gradient that visibly cuts across `HomeScreen`'s deep navy background.
5. **Motion and gestures are inconsistent outside the Music Player**: hard tab cuts, unanchored long-press menus (even though `cardRect` is already measured), popovers without exit animations, and sheets missing drag-to-dismiss or reduced-motion handling.

---

# Part 1: Visual Design & Interaction Problems (Ranked by Visual Impact)

---

### Rank #1 — Artwork & Circular Chip Avatars Read as Flat Vector Clipart
**Dimension:** Color, surfaces, depth & artwork treatment · Overall visual quality vs. references  
**Affected Screens & Components:** `ProceduralArtwork.tsx` → rendered across `MusicPlayerSheet`, `SongCard`, `HomeScreen` (Recently Found), `QuickFilterRow`, `ExploreFilterSheet`, `SongActionMenu`, `GlobalSearchOverlay`

**What is wrong:**
- `AlbumCover` composes covers from elementary SVG primitives (`<circle>`, `<polygon>`, `<rect>`, flat 2-stop linear gradients) with zero tonal texture, lighting falloff, or specular surface framing. At `66×66` on `SongCard` it reads as schematic; at `304×304` in `MusicPlayerSheet` (compared to the rich editorial portrait in `image.png`), simple silhouettes (`crimson-poster`, `clock`, `bloom`) are the single largest giveaway that this is a prototype.
- `CircularChipAvatar` repeats the exact same generic bust/bar vector across every artist, genre, and city, differing only by an 8-color hash rotation. In reference boards `02`–`04`, distinct photographic/editorial thumbnails give the filter strip immediate scannable identity.
- On `SongCard`, the artwork play overlay (`28px` circle `bg-black/55 border-white/15`) looks visually heavy compared to the sleeker, subtler translucent play icon in boards `02`–`05`.

**Concrete proposed changes:**
1. Upgrade `AlbumCover` compositions with multi-stop layered atmospheric mesh gradients, an inline SVG `<feTurbulence>` subtle analog grain layer (`opacity: 0.06–0.09`), soft radial vignetting, subtle top-edge specular inner highlight (`inset 0 1px 0 rgba(255,255,255,0.14)`), and richer layered editorial geometry/typographic poster layouts (e.g., distinct vinyl sleeves, architectural halftone duotones, embossed emblem textures, atmospheric horizon photography-inspired gradients).
2. Give `CircularChipAvatar` distinct category-authentic compositions (portrait lighting silhouettes with varied framing/accessories for Artists, genre-specific sonic/visual textures for Genres, skyline/landmark silhouettes for Cities, atmospheric color-field washes for Moods, era-specific typographic badges for Decades) plus a crisp hairline inner ring (`ring-1 ring-inset ring-white/12`).
3. Refine `AlbumCover`'s `showPlayOverlay` button from a heavy dark disc to a cleaner frosted translucent badge (`26px`, `bg-black/42 backdrop-blur-[6px] border border-white/18`, optically right-shifted `1.5px` crisp play glyph).

---

### Rank #2 — Surface Depth, Dark Material Layering & Ambient Blending
**Dimension:** Color, surfaces, depth & artwork treatment · Overall visual quality vs. references  
**Affected Screens & Components:** `index.css`, `HomeScreen.tsx`, `LibraryScreen.tsx`, `BottomNavigation.tsx`, `SongCard.tsx`, `MusicPlayerSheet.tsx`, `MobileFrame.tsx`

**What is wrong:**
- **Card separation on pure black (`LibraryScreen` & `SongCard`):** Cards use `#16171B` on `#000000` with `border-white/[0.04]` (essentially invisible) and zero top-edge specular light. On real iOS dark materials, elevated cards derive subtle crispness from a `1px` top/outer specular hairline (`rgba(255,255,255,0.06–0.08)`).
- **Bottom fade clash on `HomeScreen` (`BottomNavigation.tsx`):** The floating nav uses `bg-gradient-to-t from-black/95 via-black/65 to-transparent pt-10`. On `HomeScreen`, whose base canvas is a cool deep navy (`#03060A` / `#06101B`), a pure black gradient creates a noticeable dark band cutting across the bottom edge of the navy gradient and `Recently Found` cards.
- **Tap to Shazam Hero Orb (`HomeScreen.tsx`):** The `174×174px` button uses an opaque slate-gray gradient (`#323944 → #141820`) with a relatively harsh `border-white/[0.18]` stroke, and the `ShazamMark` (`116px`) occupies `66.7%` of the orb diameter. In reference board `01`, the orb has a deeper, sleeker smoked-glass charcoal fill, a softer diffuse radial ambient halo behind it, a subtler hairline rim (`border-white/[0.12]`), and a tighter ~`58–60%` mark proportion (`~102–104px`) with more breathing room inside the circle.
- **Music Player Ambient Wash (`MusicPlayerSheet.tsx`):** Because the ambient radial gradient is clamped to `opacity: 0.36` underneath a second opaque veil (`from-[#08090C]/45 via-[#090A0E]/72 to-[#08090C]`), the artwork tint is over-damped to a barely perceptible tint—noticeably flatter than the deep, moody crimson-charcoal wash in `image.png`.

**Concrete proposed changes:**
1. Unify dark surface tokens in `index.css` (`--surface-canvas`, `--surface-card: #16171C`, `--surface-card-pressed: #1E2027`, `--surface-elevated: #1D1F25`, `--hairline: rgba(255,255,255,0.075)`, `--hairline-strong: rgba(255,255,255,0.12)`) and apply subtle top-edge inner specular highlight on cards and floating glass pills.
2. Replace `BottomNavigation`'s pure-black scrim with a lighter, adaptive soft fade (`from-black/75 via-black/35 to-transparent` on Library, and subtle `from-[#03060A]/80` or transparent on Home where content does not scroll behind the bar).
3. Refine `HomeScreen` hero orb: deeper smoked-glass gradient (`#262D38 → #11151C`), softer rim (`rgba(255,255,255,0.13)` + subtle inner top highlight), gentle ambient navy bloom behind the orb, and reduce `ShazamMark` to `102px` inside `172px` (`59%` ratio) to match board `01`.
4. In `MusicPlayerSheet.tsx`, rebalance the two backdrop layers (`opacity: 0.52` on the artwork radial glow paired with a smoother bottom-weighted charcoal scrim `from-[#08090C]/28 via-[#0A0B0F]/68 to-[#090A0E]`) so every cover casts a rich, unmistakable mood while preserving `>= 7:1` text contrast in the lower half.

---

### Rank #3 — Component Styling Drift: Mismatched Heights, Radii & Design Tokens
**Dimension:** Component styling and consistency · Spacing, proportions & layout  
**Affected Screens & Components:** `BottomNavigation.tsx`, `SongCard.tsx`, `LibraryScreen.tsx`, `GlobalSearchOverlay.tsx`, `ExploreFilterSheet.tsx`, `SettingsSheet.tsx`, `MultiSelectActionControls.tsx`, `SongActionMenu.tsx`

**What is wrong:**
- **4px bottom-bar height mismatch (`BottomNavigation.tsx`):** The 3-tab glass pill is `h-[62px]` while the adjacent circular Search button is `h-[58px] w-[58px]`. Side by side at the bottom of the screen, that `4px` discrepancy breaks horizontal alignment along both the top and bottom edges. In boards `02`–`04`, both elements share the exact same outer height.
- **Broken concentric radius math on `SongCard` (`SongCard.tsx:168,173`):** Outer card is `rounded-[18px]` with `p-[11px]`, while inner artwork is `rounded-[12px]`. Concentric math requires `r_outer = r_inner + padding` (`12 + 10 = 22px`). Having `r_inner = 12` inside `r_outer = 18` with `11px` padding causes the corners to visually pinch. Reference boards `02`–`03` use rounder cards (`~20–22px` outer, `12px` inner, `10px` padding).
- **Inconsistent Search input shape (`LibraryScreen.tsx` vs `GlobalSearchOverlay.tsx` vs Board `02`):** `LibraryScreen` uses a rectangular squircle (`rounded-[13px]`, `h-[39px]`), while `GlobalSearchOverlay` uses `rounded-full` (`h-[40px]`). Reference board `02` uses a fuller pill-capsule search bar in Library as well.
- **Drifting sheet corner radii & scattered raw hexes:** Sheets use three different top corner radii (`rounded-t-[28px]` in `GlobalSearchOverlay`, `rounded-t-[30px]` in `SettingsSheet`/`ExploreFilterSheet`, `rounded-t-[34px]` in `MusicPlayerSheet`), and Phase 1 files hardcode 12+ near-black hexes (`#141416`, `#141518`, `#16171B`, `#16171C`, `#161920`, `#1B1C21`, `#1C1D22`, `#1D1E23`, `#1E1E21`, `#202229`).
- **Multi-select right pill layout vs Board `05` (`MultiSelectActionControls.tsx`):** Ensure proportions match board `05`'s uniform `48px` height across the circular Delete button, center count pill, and right two-icon glass capsule.

**Concrete proposed changes:**
1. Lock `BottomNavigation` pill and circular Search button to the exact same height (`h-[58px]` pill + `h-[58px] w-[58px]` Search circle) with identical glass border/shadow tokens.
2. Fix `SongCard` concentric geometry: `rounded-[22px]` outer card, `p-[10px]` padding, `rounded-[12px]` inner artwork (`70×70` square to match board `02`'s bolder cover presence).
3. Unify Library `Search in Library` input to `rounded-full h-[40px]` matching board `02` and `GlobalSearchOverlay`.
4. Standardize all modal sheets to a single top corner radius token (`rounded-t-[32px]`) and migrate all Phase 1 hardcoded `#14–#20` hexes to 4 shared CSS surface tokens in `index.css`.

---

### Rank #4 — Typography Scale, Hierarchy & Card Vertical Rhythm
**Dimension:** Typography and visual hierarchy · Spacing, proportions & layout  
**Affected Screens & Components:** `SongCard.tsx`, `LibraryScreen.tsx`, `BottomNavigation.tsx`, `HomeScreen.tsx`, `MusicPlayerSheet.tsx`, `ExploreFilterSheet.tsx`

**What is wrong:**
- **Sub-minimum micro-type (violates Apple HIG `11pt` floor):**
  - `SongCard` timestamp (`SongCard.tsx:201`) is `10.5px` in `#75757D`—too small and too dim.
  - `BottomNavigation` tab labels (`BottomNavigation.tsx`) are `10px` with tight `3px` vertical spacing from the icon, leaving dead vertical margin inside the `62px` pill.
- **Unbalanced vertical rhythm on `SongCard` after Apple Music badge removal (`SongCard.tsx:175-210`):** With `<AppleMusicBadge />` removed, the bottom row holds only the left-aligned timestamp (`10.5px`). On 1-line song titles (`Lover Girl`), `justify-between` pushes the title/artist up and leaves an awkward empty pocket on the bottom-right, making 1-line cards look slightly top-heavy compared to 2-line cards (`No Church in the Wild`).
- **Sticky Library header eats ~20% of viewport height (`LibraryScreen.tsx`):** The combined opaque sticky stack (`Library` `31px` + `83 songs` + `Search` `39px` + `QuickFilterRow` `46px` + paddings = ~`172px`, plus the `54px` status bar = `226px` before the first date header `Today`) exceeds the 15% mobile sticky cap (`frontend-design` §1.I) and compresses the visible song feed to fewer cards than board `02`.
- **Music Player metadata & artwork scale vs `image.png` (`MusicPlayerSheet.tsx`):**
  - In `image.png`, the square album artwork fills wider horizontally (`~326px` on a `393px` viewport, ~`28px` side margins) vs our `max-w-[304px]`.
  - Title is `22px` `font-semibold` vs the punchier `24px` `font-bold` in `image.png`, and there is no subtle tertiary context line (e.g., `Genre · Decade`) beneath the artist name (optional depending on scope preference).

**Concrete proposed changes:**
1. Raise `SongCard` timestamp from `10.5px #75757D` to `11.5px` (or `12px`) `#8E8E96` (passing WCAG AA and Apple HIG's `11pt` minimum) and switch the card text stack from `justify-between` to optically centered vertical flow (`justify-center gap-[3px]`) with `70×70` artwork so both 1-line and 2-line titles sit with balanced visual gravity.
2. Raise `BottomNavigation` tab labels to `11px font-medium` inside the tightened `58px` pill with balanced `4px` icon-to-label spacing.
3. Tighten `LibraryScreen` top sticky stack by `~18px` (compact header vertical padding `pt-2 pb-2`, `Search` `mt-2.5`, `QuickFilterRow` `mt-2.5`) and give the sticky header a translucent blur fade (`bg-black/82 backdrop-blur-xl`) so scrolled cards glide smoothly beneath it instead of hitting a hard opaque wall.
4. In `MusicPlayerSheet.tsx`, allow the square artwork to breathe to `w-[min(100%,324px,40dvh)]` and bump track title to `24px font-bold tracking-[-0.024em]` to match `image.png`'s focal authority.

---

### Rank #5 — Iconography Family Mixing, Stroke Drift & Optical Misalignment
**Dimension:** Icon consistency, sizing & optical alignment  
**Affected Screens & Components:** `ShazamIcons.tsx`, `SongCard.tsx`, `SortPopover.tsx`, `FilterChip.tsx`, `SettingsSheet.tsx`, `ExploreFilterSheet.tsx`, `SongActionMenu.tsx`, `MultiSelectActionControls.tsx`, `PlaylistPickerSheet.tsx`, `MusicPlayerSheet.tsx`

**What is wrong:**
- **Inconsistent Lucide stroke weights across screens:** While `MusicPlayerSheet` carefully standardizes `strokeWidth={2}` (outline) and `1.75` (transport), Phase 1 screens drift across **six different stroke weights**: `1.85` / `1.9` (`MultiSelectActionControls`, `SongActionMenu`), `2.0` (`Settings`, `Search`, `ArrowUpDown`, `WrongSongDialog`), `2.1` (`SettingsSheet`/`ExploreFilterSheet` Close `X`), `2.4` (`SortPopover` `Check`), `2.6` (`FilterChip` `Check`), `2.8` (`PlaylistPickerSheet` `Check`), and `3.0` (`SongCard` multi-select `Check`).
- **Favorites icon conflict (`MultiSelectActionControls.tsx` vs `MusicPlayerSheet.tsx` & `SongCard.tsx`):** `MusicPlayerSheet` and `SongCard` represent Favorites with a `Heart` icon (per `MUSIC_PLAYER_DESIGN_GUIDE.md §9`: *"Do not use a star for the same action; keep the Favorites concept consistent across Library, player, and future Favorites screens"*), whereas `MultiSelectActionControls` still renders a `Star` icon for "Add to Favorites" (matching the original Phase 1 board `05`).
- **Optical alignment of `SongCard` `MoreHorizontal` button (`SongCard.tsx:193`):** Using `-mr-1.5 -mt-1.5` on a `32×32` button shifts the `...` glyph slightly off the right text column axis and pairs a sub-44px hit box with tight corner spacing.
- **Custom SVG weight contrast (`ShazamIcons.tsx`):** `LibraryTabIcon` and `ShazamCircleIcon` are solid/filled shapes while `NowPlayingTabIcon` is `1.9px` stroked bars (`lines 62–67` have `x1/x2` at `4, 7.5, 11, 14.5, 18, 21` — notice `18 → 21` is `3px` while all other gaps are `3.5px`, making the rightmost waveform bar optically cramped).

**Concrete proposed changes:**
1. Create a shared icon stroke convention across the entire app: `strokeWidth={1.9}` for `18–20px` UI icons, `strokeWidth={2.4}` for compact `12–14px` checkmarks, and `strokeLinecap="round"` / `strokeLinejoin="round"` everywhere.
2. Fix `NowPlayingTabIcon` (`ShazamIcons.tsx:62-67`) bar spacing to exact uniform `3.4px` intervals centered at `x = 12` (`3.5, 6.9, 10.3, 13.7, 17.1, 20.5`).
3. Align `SongCard`'s `MoreHorizontal` button cleanly along the card's top-right edge with a `40×40` (or `44×44` negative-margin expanded) tap area so the glyph aligns optically with the song title cap-height.
4. Resolve the `Star` vs `Heart` icon in `MultiSelectActionControls` to match product preference (recommend `Heart` to unify with `MusicPlayerSheet` and `SongCard`, unless strict board `05` fidelity is preferred).

---

### Rank #6 — Animation Timing, Easing & Gesture Inconsistencies
**Dimension:** Animation timing, easing & gesture behaviour  
**Affected Screens & Components:** `App.tsx`, `SettingsSheet.tsx`, `ExploreFilterSheet.tsx`, `GlobalSearchOverlay.tsx`, `SongActionMenu.tsx`, `SortPopover.tsx`, `LibraryScreen.tsx`, `BottomNavigation.tsx`, `HomeScreen.tsx`, `SongCard.tsx`

**What is wrong:**
- **Abrupt tab switching (`App.tsx:572-611`):** Switching between `Home`, `Library`, and `Now Playing` swaps views with zero transition, creating a jarring contrast with the spring-animated `layoutId="active-nav-pill"` below.
- **Unanchored contextual menu (`SongActionMenu.tsx` + `App.tsx:605,729`):** `SongCard` already measures `cardRef.current.getBoundingClientRect()` and passes `cardRect`, yet `App.tsx` discards it (`(song) => setActionMenuSong(song)`). Consequently, `SongActionMenu` always centers the preview card vertically in the viewport (`justify-center`), violating Apple's spatial anchoring principle and board `05` (where `Lover Girl` lifts in-place near the top of the list with the menu dropping directly underneath it).
- **Inconsistent sheet drag-to-dismiss physics:**
  - `MusicPlayerSheet` & `PlaylistPickerSheet` properly scope drag to the grabber/header via `dragListener={false}` + `useDragControls` + velocity momentum projection.
  - `SettingsSheet` (`SettingsSheet.tsx:54`) uses raw whole-sheet `drag="y"` with no momentum projection.
  - `ExploreFilterSheet`, `GlobalSearchOverlay`, and `WrongSongDialog` have **no swipe-down-to-dismiss gesture at all**.
- **Missing exit animations on popovers (`SortPopover.tsx` & `LibraryScreen.tsx`):** `SortPopover` animates in (`scale: 0.92 → 1`) but snaps out instantly on close (missing `AnimatePresence` + `forceMount`), and `LibraryScreen`'s `MoreHorizontal` filter popover has no enter or exit animation at all.
- **Slightly sluggish micro-interactions (Emil Design Engineering lens):**
  - `BottomNavigation` active pill `layoutId` spring (`duration: 0.35`) feels slightly floaty for a frequent navigation tap; `220–240ms` crisp critically damped spring feels unmistakably native.
  - `SongCard` long-press (`420ms`) only applies a flat `scale-[0.975]` press state without a subtle progressive lift/glow cue right before the contextual menu pops.

**Concrete proposed changes:**
1. Add a subtle, zero-layout-shift `160ms` opacity cross-fade when switching tabs in `App.tsx` (instant when reduced motion is active).
2. Wire the already-measured `cardRect` from `SongCard` through `App.tsx` into `SongActionMenu` so the lifted card anchors near its real Y-offset (clamped safely so the 6-item menu always fits within the frame, flipping above the card for rows near the bottom of the screen), matching board `05`.
3. Extract a shared `useSheetDrag` helper (grabber-scoped `useDragControls` + `projectMomentum`) and apply it consistently to `SettingsSheet`, `ExploreFilterSheet`, and `GlobalSearchOverlay`.
4. Add `AnimatePresence` + `forceMount` scale-and-fade (`origin-top-right`, `160ms` ease-out) to both `SortPopover` and `LibraryScreen`'s filter `MoreHorizontal` popover.
5. Tighten `BottomNavigation` `layoutId` spring to `duration: 0.24, bounce: 0` for crisp iOS tab responsiveness.

---

### Rank #7 — Reference Fidelity Deltas (Board-by-Board Comparison)
**Dimension:** Overall visual quality compared with the supplied references  
**Affected Screens & Components:** `ExploreFilterSheet.tsx`, `QuickFilterRow.tsx`, `SongCard.tsx`, `HomeScreen.tsx`, `MobileFrame.tsx`

**Specific visual deltas spotted against Boards `01`–`05` and `image.png`:**
- **Board `01` (`HomeScreen`):** Recently Found card surface in Board `01` has a slightly darker, flatter charcoal-navy blend (`rgba(22, 27, 36, 0.82)`) with a subtler outer border (`border-white/[0.06]`), making the carousel feel integrated into the midnight canvas rather than boxed on top of it.
- **Board `04` (`ExploreFilterSheet` bottom CTA):** The `Show 24 Songs` footer bar currently uses a hard horizontal divider (`border-t border-white/[0.06] bg-[#141416]/95`), whereas Board `04` uses a smooth bottom gradient scrim so scrolling chips melt behind the blue pill button.
- **Board `04` (Advanced Results filter chips):** Selected chips in Library Advanced Results (`Anne Amie`, `Alternative`, `Hyderabad`) in Board `04` are slightly sleeker (`34px` height, tighter `px-2.5` padding, subtle dark-navy fill `#0F1E33` with crisp `1px` `#0A84FF/80` border).
- **Board `05` (Multi-select row transition):** When entering multi-select mode, radio circles appear on the left with no spring slide-in, whereas iOS smoothly shifts cards right as selection circles fade/scale in.

---

# Part 2: Functional & Accessibility Problems (Separated from Visual Problems)

### A. Accessibility Issues

| Severity | Issue | Exact Location & Measurement | Concrete Fix |
| :--- | :--- | :--- | :--- |
| **Critical** | **Keyboard users cannot open songs or toggle multi-select** | `SongCard.tsx:156-172` — interactive `<div onClick role="article/checkbox">` has no `tabIndex={0}` and no `onKeyDown` (`Enter`/`Space`). | Add `tabIndex={0}`, `onKeyDown` handling `Enter` and `Space`, and a visible `focus-visible:ring-2 focus-visible:ring-[#0A84FF]` outline. |
| **High** | **WCAG AA contrast failures on dark surfaces** | `SongCard.tsx:201` `#75757D` on `#16171B` = **3.9:1** (fails 4.5:1); `SettingsSheet.tsx` `#6E6E75` chevron on `#1E1E21` = **3.2:1**; `LibraryScreen.tsx` `#84848C` search placeholder on `#1C1D22` = **4.4:1** (borderline). | Lighten secondary/tertiary ink tokens to `#9A9AA3` (`>= 5.6:1`) and `#8E8E98` (`>= 4.8:1`) on `#16171C` / `#1C1D22`. |
| **High** | **Sub-44px touch targets across Phase 1 controls** | `SongCard` `...` (`32×32px`), `LibraryScreen` search clear `X` (`20×20px`), `WrongSongDialog` close (`34×34px`), `SortPopover`/`More`/filter circles/sheet close buttons (`38×38px`), `FilterChip` (`38px` height). | Expand hit areas to `>= 44×44px` (using transparent hit-area padding where visual circles stay `36–38px`, e.g., `relative after:content-[''] after:absolute after:-inset-1.5`). |
| **High** | **Incomplete `prefers-reduced-motion` support** | Only `MusicPlayerSheet` & `PlaylistPickerSheet` check `useReducedMotion()`. `HomeScreen` infinite pulse rings, `SettingsSheet`, `ExploreFilterSheet`, `SongActionMenu`, `WrongSongDialog`, `GlobalSearchOverlay`, `SortPopover`, `MultiSelectActionControls`, `BottomNavigation` `layoutId`, and `App.tsx` toast still animate transforms unconditionally. | Gate all slide/scale/pulse animations with `useReducedMotion()`, falling back to `150ms` opacity fades and disabling the infinite listening pulse scale on `HomeScreen`. |
| **Medium** | **ARIA role mismatch in `SortPopover`** | `SortPopover.tsx` places `role="menuitemradio"` buttons inside `role="radiogroup"`. | Use `role="radio"` inside `role="radiogroup"` (or `role="menu"` wrapping `role="menuitemradio"`). |

### B. Functional / UX Behavior Issues

1. **Discarded `cardRect` anchor (`App.tsx:605, 729` & `SongActionMenu.tsx`):** `SongCard` already computes and passes `DOMRect` to `onOpenActionMenu`, but `App.tsx` drops the second argument, forcing the menu to open centered instead of anchored to the tapped/pressed song.
2. **`ExploreFilterSheet` lacks a quick reset when multiple filters are active:** If a user selects 3–5 chips across different categories in `Explore` and wants to start fresh inside the sheet, they must scroll through all 5 sections to uncheck them individually. Adding a subtle, conditional `"Clear"` text button on the top-right of the `Explore` sheet header (visible only when `>= 1` draft filter is selected) solves this cleanly without inventing new navigation.
3. **Orphaned `collectionIds` state (`App.tsx:87, 387-400, 566`):** Bulk "Add to Collection" in `MultiSelectActionControls` writes to `collectionIds` (which is never displayed anywhere), whereas `MusicPlayerSheet` writes to `playlists` (which shows real counts in `PlaylistPickerSheet`). Routing bulk "Add to Collection" to either open `PlaylistPickerSheet` or update a real playlist keeps the app's data model honest without adding new screens.

---

# Part 3: Recommended Refinement Order

1. **Tier 1 — High-Impact Visual Craft (Biggest Perceived Leap):**
   - Overhaul `ProceduralArtwork.tsx` (`AlbumCover` & `CircularChipAvatar`) with layered editorial compositions, subtle film grain, vignetting, and specular inner highlights.
   - Unify dark surface tokens, hairline specular borders, concentric `SongCard` geometry (`22px / 10px / 12px`, `70×70` cover, centered vertical rhythm), `58px` aligned `BottomNavigation` + Search circle, pill `Search in Library` input, `HomeScreen` orb proportion, and richer `MusicPlayerSheet` ambient wash + `324px` artwork.
2. **Tier 2 — Motion, Spatial Anchoring & Icon Cohesion:**
   - Wire `cardRect` into `SongActionMenu` for true in-place anchoring (matching Board `05`).
   - Standardize drag-to-dismiss sheets (`SettingsSheet`, `ExploreFilterSheet`, `GlobalSearchOverlay`), add popover exit animations, add subtle tab cross-fade, tighten `BottomNavigation` spring, and standardize icon stroke weights + `NowPlayingTabIcon` bar spacing.
3. **Tier 3 — Accessibility & Functional Hardening:**
   - Fix WCAG contrast tokens, expand sub-44px tap targets, add keyboard support to `SongCard`, complete `useReducedMotion()` coverage across all screens/overlays, fix `SortPopover` ARIA roles, and add conditional `"Clear"` in `ExploreFilterSheet`.

---

### Open Product Decisions Before Implementation
1. **Multi-select Favorites Icon (`MultiSelectActionControls`):** Keep **Star** (matching Board `05`) or switch to **Heart** (matching `MusicPlayerSheet` and `SongCard`)?
2. **Music Player Metadata Lines (`MusicPlayerSheet`):** Keep the 2-line metadata block (Title + Artist) or add the quiet 3rd metadata line (`Genre · Decade`) like `image.png`?
