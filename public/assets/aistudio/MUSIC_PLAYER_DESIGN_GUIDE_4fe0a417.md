# Music Player — Apple HIG-informed design and implementation guide

## 1. Product context and screen job

**Product:** a Shazam-inspired music discovery and personal music library app, implemented as a React web app/PWA.

**Screen job:** let someone focus on the identified track, understand what is playing, control playback, save it to Favorites, and add it to a playlist.

The artwork is the emotional focal point. The interface should feel calm, tactile, deliberate, and native-quality without copying Apple Music wholesale or importing Shazam branding.

## 2. Decisions already made for this screen

Treat these as product decisions, not suggestions to reinterpret:

- Full-screen player presented as a draggable sheet over the previous app screen.
- Dragging down dismisses/collapses the player and reveals the previous screen.
- No Shazam branding or “Powered by Shazam”.
- No sharing action.
- No sound/volume bar inside the player.
- No “Now Playing” label.
- No kebab/overflow menu on this screen.
- Favorite action uses a **heart**, not a star.
- Playlist action is explicitly labelled **Add to Playlist**.
- Shuffle is available directly on the player.
- Core transport controls: Previous, Play/Pause, Next.
- Artwork, track title, artist, and playback progress remain the main content.

## 3. Recommended hierarchy

1. System status area / safe area.
2. Subtle sheet grabber and dismiss affordance.
3. Large square album artwork.
4. Track title and artist.
5. Secondary metadata only if useful and reliably available (e.g. album/year). Do not invent metadata.
6. Favorite and Add to Playlist actions.
7. Playback progress with elapsed and total time.
8. Playback controls: Shuffle, Previous, Play/Pause, Next.
9. Home indicator / bottom safe area.

Do not force every control into a row if the device height is constrained. Reflow with available height while preserving the hierarchy.

## 4. Typography

Use a consistent system-first typographic voice for interface controls and utility text. On the web, prefer the platform system UI stack rather than loading a random “Apple-like” font:

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "SF Pro Text",
  "SF Pro Display",
  "Segoe UI",
  sans-serif;
```

Notes:
- The stack is a fallback strategy, not a guarantee that SF Pro is installed or licensed for every browser/platform.
- Establish a small, intentional type scale. Avoid arbitrary font sizes and weights.
- Use weight and size to create hierarchy: track title strongest, artist secondary, metadata tertiary, timestamps quiet but readable.
- Avoid ultra-light/thin weights, especially for small labels.
- Do not use excessive bolding. Apple-like typography is as much about restraint, optical balance, and spacing as font choice.
- Keep long artist names from colliding with the favorite control. Use a deliberate truncation/wrapping rule.
- Use consistent capitalization: e.g. “Add to Playlist”, “Shuffle”, “Previous Track” for accessible labels.

## 5. Iconography

The current screen should use **one coherent icon family**.

- Choose one consistent outline/filled icon language and weight. Do not mix icons with visibly different stroke thickness, corner treatment, or optical size.
- Use familiar, simple metaphors: heart for favorite, playlist-plus for adding to a playlist, shuffle for shuffle, previous/next track, play/pause.
- Align icons optically with their hit areas, not just mathematically.
- Avoid putting every icon inside a circle. Use a circular container only when it clarifies an independent action or improves touch affordance.
- Keep the Play/Pause control visually dominant.
- Every icon-only button needs an accessible name (`aria-label`) and visible focus treatment for keyboard users.
- Use SVG icons or a single established React icon package. Do not mix emoji, Unicode glyphs, custom SVGs, and multiple icon libraries.
- If using Lucide, standardize `size`, `strokeWidth`, line caps, and line joins across all icons. Do not claim Lucide is SF Symbols.

## 6. Color and surfaces

- Let the album artwork provide the screen's expressive color.
- Derive a restrained ambient background tint from the artwork, then darken/desaturate it enough to preserve text contrast.
- Use near-black/charcoal surfaces rather than pure black everywhere if that improves depth and hierarchy.
- Use the product's established accent color for progress and selected states. Do not introduce a new accent just for the player.
- Use semantic roles (primary text, secondary text, tertiary text, surface, elevated surface, accent, track rail) rather than scattering raw hex values.
- Ensure text and controls remain legible across bright, dark, and visually busy artwork.
- Do not put blur/glass on every component. Reserve translucency for the functional sheet/control layer; keep artwork itself crisp and unobscured.
- The background blur/tint must remain subtle enough that the underlying screen is context, not competing content.

## 7. Artwork

- Album artwork is the signature visual element. Preserve its original crop and aspect ratio.
- Use a consistent square art container and consistent corner radius across tracks.
- Avoid stretching, over-rounding, unnecessary borders, or decorative frames that compete with the cover.
- The artwork can softly influence the background, but do not let a generated gradient make the track details hard to read.
- Use a graceful fallback when artwork is missing.

## 8. Playback controls and progress

- Play/Pause is the primary action and should be the most visually prominent control.
- Previous and Next should be visually balanced and placed symmetrically around Play/Pause.
- Shuffle is secondary. Its active state must be apparent without relying on color alone (e.g. a selected background plus accessible state).
- Progress uses a familiar horizontal slider: played portion, remaining rail, and a sufficiently large thumb/hit target.
- Show elapsed and total duration in a consistent format (`0:07`, `1:22`).
- Keep slider direction conventional: elapsed at the leading side, total duration at the trailing side.
- The slider must support pointer, touch, and keyboard interaction and expose its current value to assistive technology.
- If playback is simulated in Phase 1, make the behavior internally consistent; do not imply real streaming or audio capabilities that do not exist.

## 9. Favorite and playlist actions

### Favorite
- Label/action concept: **Add to Favorites**.
- Icon: outline heart when inactive; filled heart when active.
- Provide immediate state feedback (fill/color change and optional subtle haptic where supported).
- Expose `aria-pressed` or equivalent toggle state.
- Do not use a star for the same action; keep the Favorites concept consistent across Library, player, and future Favorites screens.

### Add to Playlist
- Use a playlist-plus icon with the visible label **Add to Playlist**.
- Treat it as a separate action from Favorite.
- It should open the future playlist-selection flow. For the current phase, implement the agreed UI/state only; do not invent playlist management features not yet designed.
- The action should remain discoverable, not hidden in an overflow menu.

## 10. Draggable sheet behavior

- The sheet should feel attached to the player entry point and dismiss in the same direction it was presented.
- Show a subtle grabber if the sheet is draggable.
- Support dragging from the grabber/header region; avoid making every control area accidentally dismiss the player.
- Use a clear dismiss affordance as a fallback to dragging.
- Respect safe areas and the home indicator.
- Motion should follow the user's gesture, settle naturally, and be interruptible. Avoid bouncy or theatrical transitions.
- Ensure keyboard and assistive-technology users have a non-gesture way to dismiss the sheet.

## 11. Accessibility and responsive behavior

- Make controls comfortably tappable; aim for 44×44 CSS-pixel hit areas where practical.
- Never rely on accent color alone to communicate favorite/shuffle state.
- Provide accessible names for all icon-only buttons.
- Support keyboard focus and activation on desktop.
- Respect reduced-motion preferences.
- Support text zoom/browser zoom without clipping essential controls.
- Test short screens, not only the ideal iPhone mockup. Artwork may shrink before controls or text become cramped.
- Keep the player usable at narrow widths and on desktop preview; do not hardcode a single device height.

## 12. Craft checklist before calling it done

- Does the screen still look intentional with a different album cover (blue, red, pale, very busy)?
- Is the title/artist hierarchy obvious at a glance?
- Do all icons look like they belong to the same family?
- Is Play/Pause the clear primary action?
- Are Favorite and Add to Playlist distinguishable?
- Does the progress slider look and behave like a real media control?
- Does the sheet feel connected to the app below rather than like a separate generic template?
- Does the screen preserve the app's existing dark visual language and accent color?
- Is there anything decorative that can be removed without losing meaning?

## 13. Do not do these things

- Do not redesign Home, Library, Settings, navigation, filters, or song cards while implementing this screen.
- Do not add lyrics, queue, AirPlay, volume, sharing, Apple Music upsell, “Now Playing”, or kebab actions unless the user explicitly approves them later.
- Do not add an audio visualizer or sound bar.
- Do not invent playback backend functionality. Respect the current Phase 1 simulation scope.
- Do not replace the user's Figma direction with a generic Apple Music clone.
- Do not add Liquid Glass effects to every surface.
