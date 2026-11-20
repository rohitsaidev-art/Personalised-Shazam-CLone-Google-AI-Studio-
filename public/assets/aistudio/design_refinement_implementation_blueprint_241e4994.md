# Design Refinement — Implementation Blueprint

> **Pre-Implementation Note & Document Check**
> - **Zero source code has been modified in this step.**
> - **Reference alignment:** Built directly from `visual_design_and_interaction_audit.md`, the attached Apple HIG pack (`APPLE-DESIGN-SKILL.md`, `SKILL.md`, `MUSIC_PLAYER_DESIGN_GUIDE.md`, `AI_STUDIO_WORKFLOW.md`), `PHASE-1-IMPLEMENTATION.md`, and approved Figma boards `01`–`06` plus the Music Player reference (`image.png`).
> - **Missing file transparency:** No separate `DESIGN.md` exists in the repository root or `/public/assets/aistudio/`; Section 2 below establishes the single shared design system derived strictly from the existing app tokens, approved Figma boards, and Apple HIG specifications.
> - **Evidence constraint:** Because no headless browser is installed in this sandbox, rendered before/after visual verification during implementation will require visual inspection on the live dev preview or browser screenshots; no visual improvements will be claimed as verified without rendered before/after evidence.

---

## 1. Artwork Direction (83-Song Library & Circular Category Avatars)

### Why Simply Adding SVG Effects Over Current Primitives Fails
Adding `<feTurbulence>` noise or extra gradients onto the current `ProceduralArtwork.tsx` patterns (`clock` tick lines, `crimson-poster` shoulder blob, `bloom` 3-circle Venn diagram, identical `artists` stick-bust, 4-bar `cities` skyline) still reads as geometric vector clipart at `304–324px` in the Music Player—and running 83 simultaneous SVG filter pipelines (`<feTurbulence>`) causes heavy mobile GPU rasterization lag while scrolling `LibraryScreen`.

### Proposed Art Direction: Editorial Record-Sleeve System
Replace primitive icon-clipart with **real record-sleeve design grammar** inspired by editorial music catalogs (Blue Note, ECM, A24 Soundtracks, Warp/Hyperdub, Swiss typographic pressings):

#### A. Two-Tier Cover Architecture (Recommended Hybrid)
1. **Tier 1 — Hero Editorial Raster Covers (Top 6–8 Flagship Tracks):**
   - Generate 6–8 bespoke square (`1:1`) editorial raster covers stored locally as optimized assets for the tracks that dominate above-the-fold impressions across `HomeScreen` (`Recently Found`), `LibraryScreen` (`Today` & top Pritam/Anne Amie demos), and `MusicPlayerSheet`:
     - *Lover Girl* (vintage surrealist blue-slate clockwork jazz sleeve, matching Board `02`)
     - *No Church in the Wild* (embossed antique baroque gold architectural relief, matching Board `02`)
     - *Putaapu Gang* (high-contrast crimson-and-graphite illustrated cinema poster, matching `image.png` & Board `02`)
     - *Indecisive (Is It A Crime)* (moody obsidian minimal typographic sleeve with soft film halation, matching Board `02`)
     - *Uyiril Thodum* (nocturnal indigo-and-amber Kerala twilight soundtrack still, matching Board `04`)
     - *Mehrama* / *Dil Ye Bekarar Kyun Hai* / *Kahani* (warm Indian indie cinema sleeves, matching Board `03`)
   - **Asset Budget:** `~30–45 KB` per optimized `512×512` asset (`~280–340 KB` total across 6–8 hero covers), loaded lazily with `decoding="async"` and instant blurred gradient placeholder so there is zero layout shift or flash.

2. **Tier 2 — Deterministic Editorial Canvas Engine (Remaining ~75 Songs):**
   - Replace the 12 primitive SVG patterns in `ProceduralArtwork.tsx` with a **cached offscreen HTML5 `<canvas>` editorial sleeve renderer** (`src/lib/artworkRenderer.ts`) producing `256×256` (`512×512` on demand for Music Player) raster bitmaps cached once in a module-level `Map<string, string>` (ObjectURL / WebP data URL).
   - **6 Authentic Sleeve Compositions** (each deterministically seeded by `song.id` + `title` + `artist` + `artwork` palette, so no two tracks look identical):
     1. **Atmospheric Color-Field Photography (`colorfield`)**: Multi-point organic blurred light fields, asymmetric horizon falloff, soft lens halation, and fine per-pixel monochrome analog grain.
     2. **ECM / Swiss Editorial Grid (`editorial-grid`)**: Asymmetric duotone matte blocks, hairline architectural rules, subtle rotated micro-catalog index (`CAT. 014`), and high-contrast cropped title monogram.
     3. **Risograph Duotone Halftone (`risograph`)**: Deliberate angled dot-screen tonal field + organic ink overprint offset + bold cropped serif/sans sleeve typography.
     4. **Noir Cinema Still (`cinema-noir`)**: Widescreen atmospheric vignette, subtle anamorphic light streak, desaturated film shadow lift, and refined bottom-corner soundtrack titling.
     5. **Acoustic / Vinyl Pressing (`vinyl-edition`)**: Matte textured jacket sleeve with recessed tonal circle/ring embossing and warm offset studio lighting (never cartoonish black discs).
     6. **Botanical / Organic Chromatic Wash (`chromatic-wash`)**: Soft fluid overlapping pigment washes with natural paper tooth and gentle top-left directional lighting.
   - **Consistent Surface Treatment on Every Cover:**
     - Unified subtle inner specular frame (`inset 0 0 0 1px rgba(255,255,255,0.08)` + `inset 0 1px 0 rgba(255,255,255,0.12)`).
     - Refined play-indicator badge (`showPlayOverlay`): `26×26px` frosted circle (`bg-black/42 backdrop-blur-[6px] border border-white/18`) with optically centered (`+1.5px` X) `10px` crisp white play triangle.
     - Single consistent luminance floor so `MusicPlayerSheet` ambient backdrop extraction (`primary`, `secondary`) always reads harmoniously with the artwork.

#### B. Circular Category Avatars (`CircularChipAvatar` — `26×26px`)
Stop repeating one generic silhouette per category. Instead, derive category avatars authentically:
- **Artists:** Pull directly from that artist's primary track cover in `songs` (using the exact same cached cover image cropped into a `26×26px` circle)—matching how real Shazam/Apple Music surfaces real release imagery for artist chips on Boards `02`–`04`.
- **Genres:** Curated genre-specific tonal abstract tiles (e.g., warm amber brass wash for Jazz/Acoustic, deep cobalt-violet light field for Alternative/Indie, crimson-gold nocturnal wash for Soundtrack, monochrome high-contrast grid for Hip-Hop/Rap) rendered via the same cached canvas engine.
- **Cities:** Distinct atmospheric dusk/dawn regional sky washes paired with minimal geometric architectural horizon silhouettes unique to each city name seed.
- **Moods:** Pure expressive chromatic aura gradients (cool mist for Chill, warm coral-amber for Upbeat/Energetic, deep twilight indigo for Melancholic/Focus, rose-gold dusk for Romantic) — zero clipart suns or waves.
- **Decades:** Era-styled micro typographic badges (`'70s`, `'80s`, `'90s`, `'00s`, `'10s`, `'20s`) on rich matte vinyl-inspired tonal discs with crisp high-contrast `10.5px` bold figures.

#### C. Performance & Memory Accounting
- **Zero scroll jank:** Replacing 83 inline `<svg>` DOM subtrees (~1,200+ live SVG nodes) with cached raster `<img>` bitmaps cuts Library DOM node count by **>60%** and eliminates per-frame SVG repainting.
- **Memory footprint:** 83 cached `256×256` WebP/PNG data URLs ≈ `~0.6–0.9 MB` total in memory; rendered lazily as cards enter viewport or on demand, with `MusicPlayerSheet` requesting a single `512×512` crisp render for the active song only.
- **Zero external URLs:** 100% self-contained local bundle + deterministic client canvas; zero CORS or 404 risk.

---

## 2. Shared Design System

Unify Phase 1 screens and the Music Player onto one coherent semantic token layer in `src/index.css`—eliminating all 12+ drifting raw hex colors (`#141416`, `#141518`, `#16171B`, `#16171C`, `#161920`, `#1B1C21`, `#1C1D22`, `#1D1E23`, `#1E1E21`, `#202229`).

### A. Canvas, Elevated Surfaces, Borders & Specular Highlights
| Token | Value | Usage |
| :--- | :--- | :--- |
| `--bg-canvas` | `#05070B` | Desktop viewport backdrop outside `MobileFrame` |
| `--bg-library` | `#000000` | Pure OLED black canvas for `LibraryScreen` & `NowPlayingScreen` |
| `--bg-home-radial` | `radial-gradient(ellipse at 50% 22%, #0C2034 0%, #06101B 48%, #03060A 100%)` | `HomeScreen` midnight canvas |
| `--surface-sheet` | `#141519` | Modal sheets (`SettingsSheet`, `ExploreFilterSheet`, `GlobalSearchOverlay`, `WrongSongDialog`, `PlaylistPickerSheet`) |
| `--surface-card` | `#16171C` | Default `SongCard` & grouped settings/playlist containers |
| `--surface-card-pressed` | `#1E2027` | Active/pressed card & list row highlight |
| `--surface-elevated` | `#1D1F26` | Search inputs, unselected chips, grouped rows inside sheets, action-menu preview card |
| `--surface-home-card` | `rgba(22, 27, 36, 0.84)` | `HomeScreen` `Recently Found` cards blended with navy backdrop |
| `--surface-glass-pill` | `rgba(26, 28, 34, 0.78)` | Floating bottom nav pill, Search circle, standalone multi-select controls |
| `--surface-glass-popover` | `rgba(34, 36, 43, 0.88)` | `SortPopover`, `LibraryScreen` more menu, `SongActionMenu`, transient toast |
| `--surface-glass-circle` | `rgba(34, 36, 43, 0.80)` | Header circular icon buttons (Settings, Sort, More, Close `X`, Filter) |
| `--border-hairline` | `rgba(255, 255, 255, 0.075)` | Card & input outer hairlines |
| `--border-divider` | `rgba(255, 255, 255, 0.08)` | Internal hairline row separators |
| `--border-glass` | `rgba(255, 255, 255, 0.11)` | Glass pill, circle, and popover rims |
| `--highlight-specular` | `inset 0 1px 0 rgba(255, 255, 255, 0.10)` | Top-edge directional light catch on cards, sheets, and glass pills |
| `--accent-blue` | `#0A84FF` | Primary active tab, Explore selection, Play progress, active Switch/Checkbox |
| `--accent-red` | `#FF453A` | Destructive actions (`Remove from Library`, active bulk Delete, `Clear Filters`) |
| `--accent-amber` | `#D9A441` | Quick-filter active value highlight (Board `03`) |

### B. Typography Scale & Accessible Contrast Tokens
All text tokens are verified against `--surface-card` (`#16171C`) and `--surface-elevated` (`#1D1F26`) for WCAG AA (`>= 4.5:1`):

| Role | Size / Weight / Line-Height / Tracking | Color Token (Contrast vs `#16171C`) | Usage |
| :--- | :--- | :--- | :--- |
| **Display Title** | `31px` / `700` / `1.08` / `-0.03em` | `--text-primary: #FFFFFF` (17.9:1) | `Library` header |
| **Sheet Hero Title** | `24px` / `700` / `1.15` / `-0.025em` | `--text-primary: #FFFFFF` | `Explore` title, `MusicPlayerSheet` song title |
| **Screen Prompt** | `19px` / `600` / `1.2` / `-0.015em` | `--text-primary: #FFFFFF` | `HomeScreen` `"Tap to Shazam"` |
| **Sheet Nav Title** | `16.5px` / `600` / `1.25` / `-0.015em` | `--text-primary: #FFFFFF` | `Settings`, `Add to Playlist`, `Wrong Song?` |
| **Row / Card Primary** | `15px` / `600` / `1.24` / `-0.012em` | `--text-primary: #FFFFFF` | `SongCard` title, `Recently Found` title, menu rows (`font-normal`) |
| **Section Header** | `14px` / `600` / `1.25` / `-0.01em` | `--text-primary` (Library dates/Explore) · `--text-secondary` (Home `Recently Found`) | `Today`, `Artists`, `Recently Found` |
| **Body / Secondary** | `13px` / `400` / `1.3` / `-0.005em` | `--text-secondary: #A1A2AA` (7.1:1) | `SongCard` artist, song count (`13px` `font-medium` `tabular-nums`), subtitles |
| **Caption / Timestamp** | `11.5px` / `400` / `1.25` / `+0.005em` | `--text-tertiary: #8E9099` (5.6:1 on `#16171C`, 5.1:1 on `#1D1F26`) | `SongCard` timestamp (replaces failing `10.5px #75757D`), `MusicPlayerSheet` timestamps (`12px` `tabular-nums`) |
| **Tab Label (HIG Floor)** | `11px` / `500` / `1.0` / `+0.01em` | Active `#0A84FF` / Inactive `rgba(255,255,255,0.86)` | `BottomNavigation` labels (raised from `10px` to HIG `11pt` minimum) |

### C. Spacing & Concentric Corner Radii
| Primitive | Radius Token | Padding / Concentric Rule |
| :--- | :--- | :--- |
| **All Modal Sheets** | `--radius-sheet: 32px` (top corners) | Unified across Settings, Explore, Global Search, Wrong Song, Playlist Picker, Music Player |
| **Song Card** | `--radius-card: 22px` | `p-[10px]` + inner artwork `--radius-art-card: 12px` (`22 - 10 = 12px` exact concentric math) |
| **Recently Found Card** | `--radius-card: 22px` | `p-[12px]` + inner `56×56` artwork `rounded-[10px]` (`22 - 12 = 10px` exact concentric math) |
| **Grouped List Container** | `--radius-group: 20px` | Settings & Playlist Picker containers |
| **Popover / Context Menu** | `--radius-popover: 18px` | `SortPopover`, `LibraryScreen` More popover, `SongActionMenu` |
| **Music Player Artwork** | `--radius-art-hero: 20px` | `w-[min(100%,324px,40dvh)]` square hero anchor |
| **Search Inputs & Pills** | `rounded-full` (`9999px`) | Unified across `LibraryScreen` (`Search in Library`), `GlobalSearchOverlay`, `FilterChip`, `BottomNavigation`, primary CTAs |

### D. Icon Family, Stroke Weights & Sizes
- **Primary UI Icon Family:** `lucide-react` exclusively for standard actions, plus custom geometric brand marks in `ShazamIcons.tsx` (`ShazamMark`, `ShazamCircleIcon`, `LibraryTabIcon`, `NowPlayingTabIcon`, `FilterLinesIcon`).
- **Standardized Stroke Rules (shared constant `src/lib/iconConfig.ts`):**
  - `UI_ICON_STROKE = 1.9` (`strokeLinecap="round"`, `strokeLinejoin="round"`) for all `17–22px` outline UI icons (`X`, `Search`, `Settings`, `ArrowUpDown`, `MoreHorizontal`, `ChevronRight`, `Shuffle`, `Heart`, `ListPlus`, `Trash2`, `Star`/`Heart`, `SquarePlus`, contextual menu icons).
  - `CHECK_ICON_STROKE = 2.4` for compact `13–15px` checkmarks (`SortPopover`, `FilterChip`, `SongCard` multi-select checkbox, `PlaylistPickerSheet`).
  - `TRANSPORT_ICON_STROKE = 1.75` (`fill="currentColor"`) for `MusicPlayerSheet` `Play`, `Pause`, `SkipBack`, `SkipForward`.
- **Standardized Sizes:**
  - Header circular icon buttons: `18px` glyph inside `38px` visual circle (`44×44px` hit box).
  - Nav bar icons: `22px` glyph.
  - Menu row icons: `18px` glyph.
  - Card ellipsis (`MoreHorizontal`): `18px` glyph.
  - `NowPlayingTabIcon` waveform bars: exact uniform `3.4px` horizontal intervals centered at `x = 12` (`3.5, 6.9, 10.3, 13.7, 17.1, 20.5`).

### E. Touch Target Dimensions (Strict `>= 44×44px` Mobile Rule)
- **Visual size vs. Hit target:** Where approved Figma boards call for sleeker `36–38px` circular chrome buttons (Sort, More, Filter, Sheet Close `X`, Search Clear `X`, SongCard `...`), keep the visual chrome crisp while enforcing a minimum **`44×44px` interactive hit box** via a reusable `.hit-target-44` CSS utility (`position: relative;` + `::after { content: ""; position: absolute; inset: -4px; }` or explicit `44×44px` transparent wrapper).
- **Row heights:** Settings rows `>= 54px`, Playlist rows `>= 58px`, Contextual menu rows `>= 46px`, Sort popover rows `>= 44px`, Filter chips `38px` visual pill with `py-[3px]` vertical hit buffer (`44px` effective tap band).

### F. Component Migration Matrix
| File / Component | Current Raw Values / Drift | Target Shared Token / Convention Migration |
| :--- | :--- | :--- |
| `src/index.css` | Partial tokens; missing sheet/elevated/hairline/hit-target utilities | Add complete semantic surface, ink, radius, specular, and `.hit-target-44` tokens |
| `src/components/ProceduralArtwork.tsx` | 12 primitive SVG patterns + 8-color generic avatars + heavy `28px` play circle | Split into Hero Raster + Cached Canvas Editorial Renderer (`src/lib/artworkRenderer.ts`) + Cover-derived Artist avatars |
| `src/components/ShazamIcons.tsx` | Uneven `NowPlayingTabIcon` spacing (`18→21`); unused `AppleMusicBadge` | Fix bar spacing to `3.4px` uniform; remove dead `AppleMusicBadge` |
| `src/components/BottomNavigation.tsx` | `62px` pill vs `58px` Search button; `10px` labels; harsh black fade on Home; `350ms` spring | Align both to `58px`; `11px` labels; adaptive bottom fade; `240ms` spring; `useReducedMotion()` |
| `src/components/SongCard.tsx` | `18px` radius + `11px` pad + `12px` art; `66px` cover; `10.5px #75757D`; `32×32` `...`; no keyboard handler; `stroke-[3]` | `22px` card / `10px` pad / `12px` art (`70×70`); centered text stack; `11.5px` `--text-tertiary`; `44×44` `...`; `tabIndex={0}` + `onKeyDown`; `strokeWidth={2.4}` |
| `src/screens/HomeScreen.tsx` | Heavy gray-blue orb (`116/174` mark); `#161920` card; un-gated infinite pulse | Sleeker smoked-glass orb (`102/172` mark); `--surface-home-card` concentric `22/12/10`; `useReducedMotion()` |
| `src/screens/LibraryScreen.tsx` | `rounded-[13px]` search input; `#1C1D22`/`#84848C`; opaque tall sticky header; `20×20` clear `X`; unanimated More popover | `rounded-full h-[40px]` search; tightened translucent sticky header (`bg-black/82 backdrop-blur-xl`); `44px` hit areas; animated More popover |
| `src/components/QuickFilterRow.tsx` | `38×38` buttons; `stroke-[2.1]` | `.hit-target-44`; `UI_ICON_STROKE (1.9)` |
| `src/components/FilterChip.tsx` | `#1B1C21`; `stroke-[2.6]`; `38px` height | `--surface-elevated` / `--border-hairline`; `CHECK_ICON_STROKE (2.4)`; tighter `34px` active-result styling (Board `04`) |
| `src/components/SortPopover.tsx` | Missing exit animation; `menuitemradio` inside `radiogroup`; `38×38` trigger | `AnimatePresence` + `forceMount`; fix ARIA roles; `.hit-target-44`; `CHECK_ICON_STROKE (2.4)` |
| `src/components/SettingsSheet.tsx` | `#141416`, `#1E1E21`, `#6E6E75` chevron (3.2:1); raw whole-sheet `drag="y"`; `rounded-t-[30px]`; no `useReducedMotion()` | `--surface-sheet`, `--surface-elevated`, `--text-tertiary` chevron; shared `useSheetDrag` + grabber; `rounded-t-[32px]`; `useReducedMotion()` |
| `src/components/ExploreFilterSheet.tsx` | `#141518`; `rounded-t-[30px]`; no drag-to-dismiss; no `useReducedMotion()`; no Reset when multiple chips active | `--surface-sheet`; `rounded-t-[32px]`; shared `useSheetDrag` + grabber; `useReducedMotion()`; conditional `"Clear"` button |
| `src/components/SongActionMenu.tsx` | Hardcoded center positioning (`justify-center`); `#1D1E23`, `#16171C`, `#202229`; `34×34` close button; no `useReducedMotion()` | Anchor vertically to `cardRect` (clamped inside frame, Board `05`); shared tokens; `rounded-t-[32px]` on `WrongSongDialog`; `44px` hit targets; `useReducedMotion()` |
| `src/components/MultiSelectActionControls.tsx` | Mismatched `46px / 42px / 46px` heights; `1.85/1.9` strokes; no `useReducedMotion()` | Uniform `46px` height across all standalone controls (preserving zero enclosing container rule); `UI_ICON_STROKE (1.9)`; `useReducedMotion()` |
| `src/components/GlobalSearchOverlay.tsx` | `rounded-t-[28px]`; `#0C0D10`, `#1C1D22`, `#7E7E86`; no drag-to-dismiss; no `useReducedMotion()` | `rounded-t-[32px]`; `--surface-sheet`/`--surface-elevated`/`--text-tertiary`; grabber drag-to-dismiss; `useReducedMotion()` |
| `src/components/MusicPlayerSheet.tsx` | `max-w-[304px]` artwork; `22px` title; over-damped `0.36` ambient wash; `rounded-t-[34px]` | `max-w-[324px]` artwork; `24px font-bold` title; richer `0.52` balanced ambient wash; `rounded-t-[32px]`; optional 3rd metadata line pending approval |
| `src/components/PlaylistPickerSheet.tsx` | `rounded-t-[28px]`; `#16171C`/`#1E1F25`; `stroke-[2.8]` | `rounded-t-[32px]`; `--surface-sheet`/`--surface-elevated`; shared `useSheetDrag`; `CHECK_ICON_STROKE (2.4)` |
| `src/App.tsx` | Hard tab cuts; discarded `cardRect` argument; orphaned `collectionIds`; un-gated toast motion | Subtle `150ms` tab cross-fade; pass `{ song, rect }` to `SongActionMenu`; connect bulk Add to Collection to real `PlaylistPickerSheet` (or confirm behavior); `useReducedMotion()` on toast |

---

## 3. Component Refinement Plan (Mapped to Audit Findings #1–#7)

1. **Finding #1 (Artwork & Chip Avatars):** Replace primitive SVG shapes in `ProceduralArtwork.tsx` with the Two-Tier Editorial Record-Sleeve System (Section 1), cover-derived artist avatars, and refined `26px` frosted play badge.
2. **Finding #2 (Surface Depth & Ambient Blending):** Apply `--border-hairline` + `--highlight-specular` across cards/glass chrome; replace `BottomNavigation`'s opaque black fade on `HomeScreen` with a screen-aware soft fade; tune `HomeScreen` hero orb (`#262D38 → #11151C`, softer `border-white/[0.13]`, `102px` `ShazamMark` inside `172px`); rebalance `MusicPlayerSheet` radial wash (`opacity: 0.52`) + bottom-weighted contrast veil so dark/bright covers alike give rich mood with `>= 7:1` lower-half legibility.
3. **Finding #3 (Height, Radius & Token Consistency):** Lock `BottomNavigation` pill and Search circle to identical `58px` height; enforce concentric `SongCard` geometry (`rounded-[22px]`, `p-[10px]`, `70×70` `rounded-[12px]` cover); change Library `Search in Library` to `rounded-full h-[40px]`; unify all sheet top radii to `rounded-t-[32px]`; align `MultiSelectActionControls` standalone elements to uniform `46px` height.
4. **Finding #4 (Typography Scale & Vertical Rhythm):** Raise `SongCard` timestamp to `11.5px` `--text-tertiary` and switch the card metadata column from `justify-between` to optically centered `justify-center gap-[3px]` so 1-line and 2-line titles share balanced gravity; raise `BottomNavigation` labels to `11px`; trim `LibraryScreen` sticky header height by `~18px` with `bg-black/82 backdrop-blur-xl` so list cards glide smoothly underneath; bump `MusicPlayerSheet` title to `24px font-bold` and artwork max width to `324px`.
5. **Finding #5 (Icon Consistency & Optical Alignment):** Apply `UI_ICON_STROKE (1.9)` / `CHECK_ICON_STROKE (2.4)` across every screen; equalize `NowPlayingTabIcon` bar intervals to `3.4px`; optically align `SongCard`'s `MoreHorizontal` glyph with the title cap-height inside a `44×44px` hit box; resolve `Star` vs `Heart` in `MultiSelectActionControls` per approval decision.
6. **Finding #6 (Motion, Easing & Gestures):** Implement the full Interaction Matrix in Section 4 (including `cardRect`-anchored `SongActionMenu`, shared `useSheetDrag`, popover exit animations, subtle tab cross-fade, and `240ms` nav pill spring).
7. **Finding #7 (Board-by-Board Reference Fidelity):** Blend `HomeScreen` `Recently Found` cards into the midnight canvas (`--surface-home-card` + concentric `22/12/10`); tighten Library Advanced Results active chips to sleek `34px` pills matching Board `04`; add smooth spring reveal for multi-select checkboxes on `SongCard` when entering selection mode (Board `05`).

---

## 4. Motion & Interaction Matrix

All interactive sheets share one hook (`src/lib/useSheetDrag.ts`) combining grabber/header-scoped `useDragControls()`, `dragListener={false}`, rubber-band resistance (`top: 0.04–0.06, bottom: 0.50`), and Apple's deceleration momentum projection (`projectedY = offset.y + ((velocity.y / 1000) * 0.992) / (1 - 0.992)`).

| Component / Interaction | Trigger | Animation & Gesture Behaviour | Duration & Easing / Spring | Dismissal Behaviour | Reduced-Motion Alternative | Acceptance Test |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tab Transitions** (`Home` / `Library` / `Now Playing`) | Tap tab in `BottomNavigation` | Active glass pill glides via `layoutId="active-nav-pill"`; screen content performs lightweight opacity cross-fade (zero X/Y shift, zero layout thrash) | Pill: spring `bounce: 0, duration: 0.24`; Screen: `150ms` ease-out opacity | N/A (switching tabs cancels active multi-select on Library leave) | Instant swap (`duration: 0.01`) + static active pill highlight | Rapidly tapping all 3 tabs interrupts mid-flight without jump, flicker, or scroll reset glitch |
| **`SettingsSheet`** | Tap Settings gear on `HomeScreen` | Backdrop fades in (`black/55 blur-4px`); sheet slides up from `y: 100%` with top grabber handle; drag scoped to grabber + header (`dragListener={false}`) | Backdrop: `200ms` ease; Sheet: spring `bounce: 0, duration: 0.34` | Tap `X`, tap backdrop, `Escape`, or drag down (`offset.y > 100` or `projectedY > 165`) | `160ms` opacity fade in/out; drag disabled | Dragging sheet header down flicks shut smoothly; tapping Location/Switch never hijacks drag |
| **`ExploreFilterSheet`** | Tap Filter-Lines circle in `QuickFilterRow` or `X` on Advanced Results | Backdrop fades in; sheet rises from `y: 100%`; grabber + header drag-to-dismiss; internal vertical + horizontal chip grids scroll freely without drag conflict; bottom `"Show N Songs"` CTA slides up on first selection | Sheet: spring `bounce: 0, duration: 0.36`; CTA bar: spring `bounce: 0, duration: 0.24` | Tap `X`, tap backdrop, `Escape`, drag header down, or tap `"Show N Songs"` (saves `scrollTop`) | `160ms` opacity fade for sheet and CTA bar; drag disabled | Scrolling vertical categories or horizontal artist rows never triggers accidental sheet dismissal; dragging top header dismisses and preserves scroll position |
| **`GlobalSearchOverlay`** | Tap separate circular Search button beside `BottomNavigation` | Backdrop darkens (`black/70 blur-12px`); sheet rises subtly (`y: 28 → 0, opacity: 0 → 1`) with grabber handle; input focuses at `120ms` | Backdrop: `180ms`; Sheet: spring `bounce: 0, duration: 0.28` | Tap `X`, tap backdrop, `Escape`, drag grabber down, or select a song | `150ms` opacity fade; drag disabled | Opening focuses input cleanly; scrolling 83 results never drags sheet; closing clears query cleanly |
| **`MusicPlayerSheet`** | Tap any `SongCard` or `Recently Found` card | Full-height sheet rises from `y: 100%`; drag scoped to grabber/header/artwork (`dragListener={false}` so scrubber never conflicts); artwork scales `0.93 ↔ 1.0` on pause/play | Sheet: spring `bounce: 0, duration: 0.36`; Artwork play scale: spring `bounce: 0, duration: 0.34`; Heart pop: spring `bounce: 0.2, duration: 0.26` | Tap `X`, `Escape`, or drag grabber/artwork down (`offset.y > 105` or `projectedY > 175`) | `180ms` opacity fade; artwork stays `scale: 1`; drag disabled | Horizontal scrubbing on progress bar never moves the sheet; vertical swipe on artwork dismisses smoothly |
| **`PlaylistPickerSheet`** | Tap `"Add to Playlist"` in `MusicPlayerSheet` | Stacked above player (`z-[70]`); rises from `y: 100%` with grabber-scoped drag | Sheet: spring `bounce: 0, duration: 0.32` | Tap `X`, tap backdrop, `Escape`, or drag grabber down (`offset.y > 85` or `projectedY > 150`) | `160ms` opacity fade; drag disabled | Dismissing picker keeps `MusicPlayerSheet` open underneath; toggling playlist updates count immediately |
| **`WrongSongDialog`** | Tap `"Wrong Song? Tell Shazam"` in `SongActionMenu` | Bottom sheet rises from `y: 100%` with grabber-scoped drag | Sheet: spring `bounce: 0, duration: 0.32` | Tap `X`, tap backdrop, `Escape`, drag grabber down, or choose candidate | `160ms` opacity fade; drag disabled | Picking a candidate updates the song metadata in Library immediately and shows toast |
| **`SortPopover` & `LibraryScreen` More Popover** | Tap Sort (`↑↓`) or Filter More (`•••`) button | Wrapped in `AnimatePresence` + Radix `forceMount`; scales from `0.92 → 1` and `opacity: 0 → 1` anchored at `origin-top-right`; reverses cleanly on exit | Enter: spring `bounce: 0, duration: 0.22`; Exit: `140ms` `cubic-bezier(0.2, 0, 0, 1)` | Tap option, tap trigger, click outside, or `Escape` | `120ms` opacity fade only (no scale) | Closing popover plays smooth exit animation instead of instant unmount snap |
| **`SongActionMenu` (Contextual Menu)** | Long-press `SongCard` (`420ms` with subtle press tension) OR right-click OR tap `•••` button | Backdrop blurs (`black/65 blur-10px`); elevated preview card anchors at source `cardRect.top` relative to `MobileFrame` (clamped safely so 6-item menu fits below—or flips above for bottom-edge rows); 6-item glass menu springs out from card edge | Backdrop: `180ms`; Preview lift: spring `bounce: 0, duration: 0.24`; Menu unfold: spring `bounce: 0, duration: 0.26` | Tap any of 6 items, tap backdrop, or `Escape` | `150ms` opacity fade in-place (no scale/translate) | Long-pressing top row (`Lover Girl`) keeps preview near top with menu below (Board `05`); long-pressing bottom row flips menu cleanly inside frame without clipping |
| **Multi-Select Enter / Toggle / Exit** | Tap `"Select"` in `SongActionMenu` / tap cards or radios / tap `"Done"` | Left radio circles animate in (`width/opacity/scale`, `200ms` ease-out) smoothly shifting cards right; `BottomNavigation` swaps via `AnimatePresence mode="wait"` to standalone `MultiSelectActionControls` rising `y: 20 → 0`; Delete icon transitions white → `#FF453A` at `selectedCount >= 1` | Controls swap: spring `bounce: 0, duration: 0.24`; Radio reveal: `200ms` `cubic-bezier(0.16, 1, 0.3, 1)` | Tap `"Done"`, bulk Delete, or switch tabs | `140ms` opacity fade; no slide/scale | Entering multi-select shows `0 selected` + white Delete; tapping 1st card turns Delete red and updates live count with zero horizontal overflow |
| **`HomeScreen` Listening Pulse & Toast** | Tap Shazam orb / system feedback action | Two concentric rings expand (`0.92 → 1.75`, `1.45s`) + gentle orb breath (`1 → 1.035 → 1`), immediately interruptible on 2nd tap; Toast drops `y: -12 → 0` | Toast: spring `bounce: 0, duration: 0.24` | 2nd tap cancels listening immediately; Toast auto-dismisses after `2400ms` | Listening shows static accent halo + status text swap only (no infinite scale/rings); Toast fades `150ms` | Tapping orb mid-listen cancels cleanly with zero stale timers; reduced motion stops all continuous loops |

---

## 5. Accessibility & Functional Fixes

### A. Accessibility Fixes
1. **Keyboard Access on `SongCard` (Critical):**
   - Add `tabIndex={0}` and `onKeyDown` on the card container (`Enter` or `Space` opens `MusicPlayerSheet`, or toggles selection in multi-select mode; `Shift+F10` / `ContextMenu` key opens `SongActionMenu`).
   - Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] focus-visible:ring-offset-1 focus-visible:ring-offset-black`.
   - Guard `if (e.target !== e.currentTarget) return;` so pressing `Enter` on the inner `MoreHorizontal` button does not also fire the card click.
2. **WCAG AA Contrast Compliance (High):**
   - Replace `#75757D` (`3.9:1` fail) in `SongCard` & `SongActionMenu` preview with `--text-tertiary: #8E9099` (`5.6:1` on `#16171C`).
   - Replace `#6E6E75` (`3.2:1` fail) chevron in `SettingsSheet` with `--text-tertiary: #8E9099` (`5.1:1` on `#1D1F26`).
   - Replace `#84848C` / `#7E7E86` (`4.4:1` borderline) search placeholders in `LibraryScreen` and `GlobalSearchOverlay` with `--text-tertiary: #8E9099` (`5.1:1`).
3. **`>= 44×44px` Touch Targets Across All Controls (High):**
   - Apply `.hit-target-44` to `SortPopover` trigger (`38px`), `LibraryScreen` More button (`38px`) & Search Clear `X` (`20px` visual inside `44×44` flex hit box), `QuickFilterRow` Filter/Close buttons (`38px`), `SettingsSheet`/`ExploreFilterSheet`/`GlobalSearchOverlay`/`WrongSongDialog` Close buttons (`34–38px`), and `SongCard` `MoreHorizontal` (`32px` → `44×44` hit box).
   - Expand `SongCard` multi-select checkbox button from `w-[30px]` to `w-[40px]` (with full card also clickable to toggle).
4. **100% `prefers-reduced-motion` Coverage (High):**
   - Add `useReducedMotion()` to `App.tsx` (tabs + toast), `HomeScreen.tsx` (status text + listening rings/orb), `BottomNavigation.tsx`, `SettingsSheet.tsx`, `ExploreFilterSheet.tsx`, `GlobalSearchOverlay.tsx`, `SongActionMenu.tsx`, `WrongSongDialog.tsx`, `SortPopover.tsx`, `LibraryScreen.tsx` More popover, and `MultiSelectActionControls.tsx`.
5. **ARIA Semantics Audit (Medium):**
   - `SortPopover.tsx`: Change option roles from `role="menuitemradio"` to `role="radio"` inside `role="radiogroup"` (valid WAI-ARIA hierarchy).
   - `HomeScreen.tsx`: Add descriptive `aria-label={`Play ${song.title} by ${song.artist}`}` on `Recently Found` cards.
   - `SongCard.tsx`: Use `role="button"` (when not in multi-select) instead of `role="article"` so screen readers announce it as an interactive playable row, switching to `role="checkbox"` + `aria-checked` in multi-select mode.

### B. Functional Fixes (Strictly Within Existing Scope)
1. **Wire `cardRect` into `SongActionMenu` (`App.tsx` + `SongActionMenu.tsx`):**
   - Change `actionMenuSong` state in `App.tsx` to `actionMenuTarget: { song: Song; rect: DOMRect } | null` and pass both `song` and `anchorRect` into `SongActionMenu`. Compute Y offset relative to `portalContainer.getBoundingClientRect()` with top/bottom viewport clamping so the elevated card sits in-place (Board `05`) and the 6-item menu flips above the card when triggered near the bottom edge.
2. **Conditional `"Clear"` Action in `ExploreFilterSheet` (`ExploreFilterSheet.tsx` + `App.tsx`):**
   - Render a quiet `"Clear"` text button (`text-[14px] font-medium text-[var(--accent-blue)]`, `44px` hit height) top-right in the `Explore` header **only when `>= 1` draft filter is selected**, clearing `exploreDraftFilters` in one tap without scrolling across all 5 categories.
3. **Eliminate Orphaned `collectionIds` State (`App.tsx` + `PlaylistPickerSheet.tsx`):**
   - Allow `PlaylistPickerSheet` to accept either a single `song` (from `MusicPlayerSheet`) or `songIds: string[]` (from bulk `"Add to Collection"` in `MultiSelectActionControls`), so bulk-adding updates real local playlists and song counts cleanly with zero new screens.

---

## 6. Implementation Sequence (5 Independent Passes)

| Pass | Scope & Goal | Exact Files Affected | Dependencies | Risks & Mitigations | Measurable Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pass 1: Shared Design System & Utilities** | Establish single CSS token layer, `.hit-target-44`, shared icon stroke constants, `useSheetDrag` hook, and fix `ShazamIcons` bar spacing | `src/index.css`, `src/lib/iconConfig.ts` *(new)*, `src/lib/useSheetDrag.ts` *(new)*, `src/components/ShazamIcons.tsx` | None (foundation) | Risk: token rename regressions. Mitigation: preserve existing `--accent-blue` & `--player-*` names while unifying base tokens. | `compile_applet` + `lint_applet` pass; zero unused `AppleMusicBadge`; `NowPlayingTabIcon` intervals equal `3.4px` |
| **Pass 2: Editorial Artwork & Category Avatar System** | Generate 6–8 hero raster sleeves (if Option A approved) + build cached offscreen canvas editorial sleeve renderer (`6` design movements) + cover-derived artist avatars | `src/lib/artworkRenderer.ts` *(new)*, `src/components/ProceduralArtwork.tsx`, `src/data/songs.ts` *(hero cover paths/style mapping)*, `src/components/FilterChip.tsx`, `src/components/QuickFilterRow.tsx`, `src/components/ExploreFilterSheet.tsx` | Pass 1 | Risk: canvas rendering flicker on first paint or high memory. Mitigation: synchronous deterministic cache keyed by `song.id + size` + instant gradient fallback background; cap cache at `256px` (cards) / `512px` (active player). | All 83 songs render distinct editorial covers with `0` broken images; DOM SVG node count in Library drops `>60%`; artist filter chips show artist's real cover |
| **Pass 3: Surface, Typography, Proportion & Chrome Refinement** | Migrate all screens & components to shared tokens; fix `SongCard` concentric geometry (`22/10/12`, `70×70`, centered rhythm), `58px` aligned `BottomNavigation`, pill `Search in Library`, `HomeScreen` orb, `MusicPlayerSheet` `324px` art + balanced ambient wash, uniform `46px` multi-select controls | `src/components/BottomNavigation.tsx`, `src/components/SongCard.tsx`, `src/screens/HomeScreen.tsx`, `src/screens/LibraryScreen.tsx`, `src/components/QuickFilterRow.tsx`, `src/components/FilterChip.tsx`, `src/components/MultiSelectActionControls.tsx`, `src/components/MusicPlayerSheet.tsx`, `src/components/SettingsSheet.tsx`, `src/components/ExploreFilterSheet.tsx`, `src/components/GlobalSearchOverlay.tsx`, `src/components/PlaylistPickerSheet.tsx`, `src/components/SongActionMenu.tsx` | Pass 1, Pass 2 | Risk: vertical overflow in `MusicPlayerSheet` on short viewports (`<700px`). Mitigation: keep `w-[min(100%,324px,40dvh)]` and `clamp()` vertical gaps. | Zero raw `#14–#20` hexes left outside `index.css`; `BottomNavigation` pill & Search button both measure `58px`; `SongCard` concentric `22 - 10 = 12px`; all body/caption text `>= 11px` and `>= 4.5:1` contrast |
| **Pass 4: Motion, Spatial Anchoring & Gesture Cohesion** | Wire `cardRect` anchoring into `SongActionMenu`; apply `useSheetDrag` to `SettingsSheet`, `ExploreFilterSheet`, `GlobalSearchOverlay`, `WrongSongDialog`, `PlaylistPickerSheet`, `MusicPlayerSheet`; add `AnimatePresence` + `forceMount` exit animations on both Library popovers; add `150ms` tab cross-fade & `240ms` nav pill spring; smooth multi-select radio entry | `src/App.tsx`, `src/components/SongActionMenu.tsx`, `src/components/SettingsSheet.tsx`, `src/components/ExploreFilterSheet.tsx`, `src/components/GlobalSearchOverlay.tsx`, `src/components/SortPopover.tsx`, `src/screens/LibraryScreen.tsx`, `src/components/BottomNavigation.tsx`, `src/components/SongCard.tsx`, `src/components/MusicPlayerSheet.tsx`, `src/components/PlaylistPickerSheet.tsx` | Pass 1, Pass 3 | Risk: Radix `PopoverContent` + `AnimatePresence` `forceMount` double-mount or focus trap conflict. Mitigation: conditionally render `<PopoverPortal forceMount>` inside `<AnimatePresence>{open && ...}</AnimatePresence>` matching existing Dialog pattern. | Long-pressing top & bottom rows anchors menu within viewport without clipping; every sheet drags shut from grabber only; both popovers animate out cleanly |
| **Pass 5: Accessibility & Functional Hardening** | Keyboard support on `SongCard`, `.hit-target-44` audit, full `useReducedMotion()` sweep across all 11 animated components, `SortPopover` ARIA fix, conditional `"Clear"` in `ExploreFilterSheet`, bulk `"Add to Collection"` wired to `PlaylistPickerSheet` | `src/components/SongCard.tsx`, `src/components/SortPopover.tsx`, `src/components/ExploreFilterSheet.tsx`, `src/components/PlaylistPickerSheet.tsx`, `src/screens/HomeScreen.tsx`, `src/App.tsx` + final sweep of sheets/overlays | Pass 3, Pass 4 | Risk: `Enter`/`Space` on `SongCard` conflicting with inner `•••` button. Mitigation: guard `if (e.target !== e.currentTarget) return;` on card `onKeyDown`. | Full keyboard navigation opens player & toggles multi-select; 100% of interactive controls `>= 44×44px` hit area; `prefers-reduced-motion` stops all slide/scale/infinite pulse animations; `compile_applet` & `lint_applet` pass with 0 errors |

---

## Decisions Requiring Approval Before Implementation

1. **Artwork Strategy (Section 1):**
   - **Option A (Recommended):** Generate **6–8 bespoke editorial raster covers** for the flagship tracks visible on Home / Library `Today` / Music Player showcase + **cached offscreen `<canvas>` editorial sleeve engine** for the remaining ~75 tracks and cover-derived artist avatars (`~300 KB` total assets).
   - **Option B (Zero Raster Assets):** Use the **cached offscreen `<canvas>` editorial sleeve engine** for all 83 tracks (`0 KB` added image assets).
2. **Multi-Select Favorites Icon (`MultiSelectActionControls`, Board `05` vs Music Player Guide):**
   - Keep **Star** (strict Phase 1 Board `05` fidelity), or switch to **Heart** (unified with `MusicPlayerSheet` and `SongCard` per `MUSIC_PLAYER_DESIGN_GUIDE.md §9`)?
3. **Music Player 3rd Metadata Line (`MusicPlayerSheet`, `image.png`):**
   - Keep the current **2-line block** (Title + Artist), or add a quiet **3rd metadata line** (`Genre · Decade`, e.g., `Soundtrack · '20s`) matching the 3-tier hierarchy in `image.png`?
4. **Bulk `"Add to Collection"` Behaviour (`MultiSelectActionControls`):**
   - Connect bulk `"Add to Collection"` to open the existing **`PlaylistPickerSheet`** so selected songs genuinely save into local playlists (recommended—eliminates orphaned `collectionIds` state without adding any new screens), or keep it as a lightweight toast-only confirmation?
