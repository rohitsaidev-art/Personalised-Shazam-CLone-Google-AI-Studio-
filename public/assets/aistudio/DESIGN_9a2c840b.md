# Project Design Rules

These rules are grounded in decisions already made for this music app. Add new rules only when the user confirms them or repeatedly corrects the same issue.

## Product identity
- This is a Shazam-inspired music discovery and personal library app, not a Shazam-branded clone.
- Approved Figma flows and selected screen references are the visual/product source of truth.
- Apple HIG informs quality, interaction conventions and accessibility; it must not erase the app's own identity.
- Prefer precise refinement over redesigning established screens.

## Scope discipline
- Do not add features, labels, actions or screens that have not been approved.
- Do not change Home, Library, Settings, navigation, filters or song cards during a focused player refinement unless a shared token correction is necessary and explicitly documented.
- A successful build is not proof of visual quality or interaction correctness.

## Music player decisions
- Full-screen draggable player sheet; drag down returns to the previous screen.
- Dragging should begin only from intended drag regions, not indiscriminately from interactive controls.
- Favorite uses a heart, not a star.
- Playlist action is labelled “Add to Playlist”.
- Shuffle is available directly on the player.
- No sharing action, Shazam branding, volume/sound bar, “Now Playing” label or kebab menu on the player.
- Play/Pause is the dominant transport action.
- Artwork is the visual focal point; title and artist remain clear and readable.

## Craft
- Use one coherent icon family and consistent optical sizing/stroke treatment.
- Typography must have deliberate hierarchy, scale, weight, line-height and truncation behaviour.
- Use spacing rhythm and alignment consistently; do not patch every issue with arbitrary margins.
- Avoid gratuitous glass, gradients, borders, rings and decorative effects.
- Artwork may influence ambient colour but must not compromise legibility.
- Motion must explain state, preserve spatial continuity or provide direct feedback. Do not animate for decoration.
- Gestures should track the finger, be interruptible and settle naturally.
- Respect reduced motion and accessibility preferences.

## Evidence
- Validate the rendered app at the target viewport.
- Keep before/after screenshots for visual changes.
- Verify every interactive state manually or with a reproducible test.
- Do not report a fix as complete based only on source edits or successful compilation.
