# Music Library App — Phase 1 implementation brief

**Status:** Approved to implement  
**Platform:** React app in Google AI Studio  
**Scope:** Home, Settings, Library, quick filters, advanced filters, song actions and multi-select.  
**Not in scope:** Full music playback experience (Phase 2).

---

## 1. Product and implementation boundaries

Build the app shown in the supplied Figma flow-board exports. This is a focused music-identification history and library experience, not a full streaming service.

### Phase 1 must include

- Home screen with the primary identify action and Recently Found songs.
- Settings bottom sheet with only Location and Haptic Feedback.
- Library with search, sorting, quick filters and date-grouped song history.
- Quick-filter category and value states.
- Advanced multi-filter Explore flow and its results state.
- Song long-press contextual menu.
- Multi-select mode and bulk actions.
- Shared bottom navigation: Home, Library, Now Playing, plus a separate Search action.

### Explicitly exclude

- Concerts tab or any concerts functionality.
- Full Now Playing/player design, queue, lyrics, streaming, playback engine or external provider integrations. These belong to Phase 2.
- Apple Music / YouTube “Listen On” actions and iTunes purchase actions.
- Apple Music promotional card, iCloud Sync, Notifications, microphone selector, identify-on-app-start, Autoplay Videos, Stay in Touch and Support settings.
- User accounts, cloud sync, backend, database, recommendation engine, onboarding or any other unlisted features.

Do not add extra tabs, routes, features or settings because they seem useful.

---

## 2. Shared visual and interaction rules

- Treat the user's flow-board exports as the primary target design references. Match the screen proportions, layout, dark visual language, typography hierarchy, spacing, rounded cards, chips, icon sizes, bottom navigation and overlay placement closely.
- Do not turn the interface into a bento dashboard or wrap every control in a new container.
- Preserve the floating bottom navigation pill and the **separate circular Search button** beside it. Do not absorb Search into the pill or remove it on filtered/selection states.
- Bottom navigation labels and order: **Home · Library · Now Playing**. Concerts must not appear anywhere.
- The Library's **Search in Library** field must remain visible in the Library layout. The separate global Search icon must also remain consistently accessible on the main app screens. Do not treat one as a replacement for the other.
- Use the Apple Design skill for interaction quality: immediate press feedback, direct manipulation, interruptible motion, natural spring transitions, anchored sheets/menus, appropriate translucency, reduced-motion support and legible typography. Avoid gratuitous bounce or animation.
- Long lists and chip rows must scroll in the direction shown by the references. Horizontal rows should visibly communicate that more content is available when the board shows a clipped next chip/column.
- Keep controls consistent across default, filtered and selection states.

---

## 3. Navigation model

```text
Home
 ├─ Settings icon → Settings bottom sheet → close → Home
 ├─ Library tab → Library
 └─ Now Playing tab → Phase 1 Now Playing destination only (full player deferred)

Library
 ├─ Sort control → Sort popover → choose sort → Library
 ├─ Quick-filter icon/category → category values → choose one value → filtered Library
 ├─ Search in Library field / global Search action → search entry point (do not invent a broader search product)
 ├─ Long-press song → Song action menu
 │   ├─ Select → Multi-select mode
 │   ├─ Remove from Library → remove song
 │   ├─ Wrong Song? Tell Shazam → report mismatch and show candidate corrections
 │   ├─ Go to Artist → artist-focused Library view
 │   ├─ Go to Genre → genre-focused Library view
 │   └─ Share → native share action where supported
 └─ Advanced filter icon → Explore multi-select sheet
     └─ Show N Songs → Advanced-filter results
         └─ X/back → Explore with all previous selections preserved
```

The advanced-filter results X must **not** send the user to Library root.

---

## 4. Screen-by-screen requirements

### 4.1 Home

- Keep the uncluttered, dark Shazam-inspired composition shown in the flow board.
- Central Tap to Shazam control is the dominant action.
- Settings icon remains at the top-right.
- Recently Found section remains near the bottom, with horizontally scrollable song cards.
- Bottom navigation: Home, Library, Now Playing, plus the separate circular Search action.
- No Concerts tab.

### 4.2 Settings bottom sheet

Only these two settings are present:

1. **Location** — permission / location preference entry. Retain the ability to associate an identified song with the city/place where it was found, enabling later city filtering.
2. **Haptic Feedback** — on/off toggle.

Remove every other setting or promotional/support section listed in the exclusions. Do not add new settings.

### 4.3 Library — default state

- Show Library title and total song count (reference example: 83 songs).
- Keep the visible **Search in Library** field.
- Keep the sort control.
- Keep the quick-filter row with filter icon and horizontally scrollable category chips: Artists, Genres, Cities, Moods and Decades.
- Keep date-grouped song cards with artwork, title, artist, date/time found and the existing compact source badge where shown.
- Keep the list vertically scrollable.
- Preserve the separate circular global Search action beside the floating bottom navigation.

### 4.4 Sort popover

Match the compact popover anchored to the sort control. Options must be exactly:

**Sort field**
- Date Found
- Song Title
- Artist Name

**Order**
- Newest First
- Oldest First

One field and one order direction are active at a time. Use Date Found + Newest First as the initial default, matching the supplied reference. Sorting must reorder the displayed songs, not just change a visual checkmark.

### 4.5 Library quick filters

- The horizontal quick-filter row contains only Artists, Genres, Cities, Moods and Decades (plus the filter icon).
- Opening a category shows that category's values as horizontally scrollable chips and replaces the filter icon with an X/back control.
- Selecting a value applies a quick filter to the Library and updates the result count.
- Quick-filter results retain the Library layout, Search access, sort control, date groupings, song cards and bottom navigation.
- Quick filters are the lightweight Library filter interaction; keep them distinct from the advanced multi-filter Explore flow.

### 4.6 Advanced Explore filters

- Open from the Library filter control as shown in the flow board.
- This is a separate advanced-filter sheet/screen, not the quick-filter chip row.
- It contains **exactly five categories**: Artists, Genres, Cities, Moods and Decades. Do not add categories.
- Preserve the grouped category layout and horizontally scrollable rows/columns. Where the reference shows part of the next column, keep that partial visibility to signal horizontal scrolling.
- All category thumbnails/avatars must be circular for visual consistency.
- On selection, replace the thumbnail/avatar with a white checkmark inside the same circular image area. Do not change chip dimensions or reflow the layout.
- Allow multiple selections within and across categories.
- Combine selected filters using **AND logic**: a result must match every active selected criterion.
- Show a live result count in the bottom CTA, e.g. **Show 24 Songs**. Update it immediately as selections change.
- This filters only the user's own identified/saved Library. It is not a global music catalogue search.

### 4.7 Advanced-filter results

- Display the matching count (reference example: 24 songs).
- Show all active filter chips across the top in a horizontally scrollable row, with clear selected styling.
- Keep the Library's sort control, date-grouped song list, card treatment and bottom navigation.
- Use the same chronological grouping and sorting behaviour as the main Library. Default to Date Found + Newest First.
- When a filter chip is removed, immediately recompute the matching songs and count.
- X/back returns to Explore and restores every previous selection and scroll position where practical. It must not return to Library root.
- Seed the local demo data so the documented example combination (Anne Amie + Alternative + Hyderabad) returns **24 songs**, as shown in the flow board.

### 4.8 Song long-press action menu

Long-pressing a song opens a contextual menu. The action order is:

1. Select
2. Remove from Library
3. Wrong Song? Tell Shazam
4. Go to Artist
5. Go to Genre
6. Share

- Remove “Listen On” Apple Music / YouTube and “Buy on iTunes”.
- Select must be the first action.
- Remove from Library must be second.
- Wrong Song? Tell Shazam should allow the user to report a mismatch and choose from candidate/corrected matches. Keep this as a focused, minimal interaction; do not create an unrelated discovery flow.
- Go to Artist and Go to Genre should open the corresponding Library-focused view.
- Share should use the platform share capability where available, with a simple fallback if unavailable.

### 4.9 Multi-select mode

- Enter only through long-press → Select.
- Show Done at the top to exit selection mode.
- Show a selection circle beside each song.
- Selected songs show a blue selected state/checkmark.
- Bottom controls sit over a subtle bottom-up gradient/fade. **Do not place the controls inside a large enclosing bar/card/container.**
- Each action icon has its own circular treatment, matching the reference: Delete on the left; Add to Favorites (star) and Add to Collection (plus-in-a-square) on the right.
- In the zero-selected state, the delete/bin icon is **white**. Once one or more songs are selected, it becomes **red**.
- Show a central selected-count pill. The count must be derived from the actual selected song IDs and update immediately on every select/deselect.
- Example validation: if two songs have blue checks, the count must read **2 selected**. It must never display 0 when two songs are selected.
- Bulk Delete, Add to Favorites and Add to Collection apply to all currently selected songs.
- Done exits selection mode and returns to the normal Library state.
- Do not add a separate bulk-action toolbar container.

---

## 5. Local demo data and state

Use deterministic local fixture data only. The app should demonstrate the flows without network calls.

- Initial Library count: **83 songs**.
- Include the visible example tracks from the flow boards where possible, preserving their displayed title/artist text and artwork references when supplied.
- Ensure the quick-filter examples can be demonstrated (including the shown artist/genre result examples).
- Ensure the advanced example **Anne Amie + Alternative + Hyderabad = 24 songs**.
- Use real state, not hard-coded labels: sort order changes the list; filters change the list/count; selection checkboxes change the selected IDs/count; menu actions mutate the local library/favorites/collections state.
- Keep state local to the prototype. Do not add persistence or a backend unless explicitly requested later.

---

## 6. Component and code quality expectations

Build reusable components for the shared UI rather than duplicating slightly different versions:

- `BottomNavigation` + separate `SearchAction`
- `SongCard`
- `SortPopover`
- `QuickFilterRow` / `QuickFilterValues`
- `ExploreFilterSheet`
- `FilterChip`
- `SongActionMenu`
- `MultiSelectActionControls`
- `SettingsSheet`

Use a single source of truth for songs, active sort, quick filter, advanced filters and selected song IDs. Keep derived counts/list results computed from state. Avoid independent counters that can drift out of sync.

Preserve the existing React scaffold and use the project's current styling/build conventions. Do not introduce unnecessary dependencies. Keep controls accessible, with sensible touch targets and keyboard semantics where appropriate.

---

## 7. Acceptance checklist — do not call Phase 1 complete until these pass

- [ ] Home matches the flow board; Settings opens and closes as a bottom sheet.
- [ ] Settings contains only Location and Haptic Feedback.
- [ ] Bottom navigation is Home / Library / Now Playing; Concerts is absent.
- [ ] Separate circular Search action remains visible beside bottom navigation on main screens.
- [ ] Search in Library field remains visible in Library states; search access is not lost during filtering or selection.
- [ ] Library begins with 83 songs and shows date-grouped song cards.
- [ ] Sort field and order both work and match the exact options.
- [ ] Quick-filter categories and values scroll horizontally and update the Library list/count.
- [ ] Advanced Explore has exactly five categories and supports multi-select.
- [ ] All Explore thumbnails are circular; selection replaces the thumbnail with a white checkmark without changing chip dimensions.
- [ ] Advanced filters use AND logic and the Anne Amie + Alternative + Hyderabad example returns 24 songs.
- [ ] Removing one active filter updates results/count; X returns to Explore with selections preserved.
- [ ] Long-press opens the six-item song menu in the exact order.
- [ ] Select enters multi-select mode; Done exits it.
- [ ] Two checked songs display **2 selected**.
- [ ] Delete is white at zero selection and red when at least one song is selected.
- [ ] Delete, Favorite and Add to Collection controls each have their own circular treatment over a bottom gradient; there is no enclosing toolbar container.
- [ ] No unrequested tabs, settings, screens, APIs, streaming integrations or Phase 2 player features have been added.

---

## 8. Phase 2 boundary

The Now Playing tab must exist in Phase 1 because it is part of the agreed navigation. The detailed music player experience is **not** part of this implementation. Do not invent playback controls, queue, lyrics, waveform, audio engine, streaming provider links or advanced player states. The user will provide the Phase 2 design and flow separately.
