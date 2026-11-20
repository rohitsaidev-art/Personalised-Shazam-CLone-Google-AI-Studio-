# Design engineering workflow

## Phase 0 — freeze and establish truth
- Pause feature work.
- Keep the approved Figma boards, selected player reference and current app behaviour as the source of truth.
- Read the current AI Studio audit-only report before making changes.
- Capture current screenshots at fixed viewports and record the exact route/state used.
- Do not infer success from a build log or the agent's summary.

## Phase 1 — evidence-based audit (read-only)
Use `improve-animations`, `find-animation-opportunities`, `web-design-guidelines`, `apple-design`, and the Apple HIG reference pack.

Audit:
1. Visual hierarchy and typography.
2. Icon family, weight, sizing and optical alignment.
3. Spacing, alignment, radii, borders, shadows and surfaces.
4. Color, contrast and artwork/background treatment.
5. Navigation and component consistency.
6. Every interaction state and its transition.
7. Gesture tracking, interruption, dismissal and scroll conflicts.
8. Mobile viewport/safe-area behaviour.
9. Accessibility and reduced motion/transparency.
10. Runtime and animation performance.

Every finding must include:
- severity;
- exact screen/component/state;
- evidence (screenshot or file:line);
- expected behaviour/appearance;
- specific recommended change;
- how it will be verified.

No source edits in this phase.

## Phase 2 — prioritised implementation plan
Group fixes into:
- P0: broken interactions, inaccessible/obstructed controls, severe layout defects.
- P1: obvious visual mismatch, typography/icon inconsistency, incorrect motion/gesture behaviour.
- P2: micro-polish, subtle material/feedback refinement.
- P3: optional ideas (not implemented without approval).

For each fix, list exact files/components and acceptance criteria. Avoid broad claims like “make it feel premium”.

## Phase 3 — controlled implementation
- Implement one coherent group at a time.
- Preserve Home, Library, Settings, navigation, filters and song cards unless the audit proves a shared token change is necessary and the user approves it.
- Use `animate` for individual motion and `choreograph` for multi-element sequences.
- Use `gestures` for drag/sheet behaviour.
- Use `animation-performance` when a measurable performance issue exists.
- Use `mobile-native` for phone-specific web details.
- Use the existing dependency stack unless a concrete gap justifies a new dependency.
- Keep a before/after screenshot for every visual change group.

## Phase 4 — verification
- Run the app, not just TypeScript and Vite build.
- Test real interactions at the target mobile viewport.
- Test a short viewport and long content.
- Check reduced motion, keyboard operation, focus visibility and touch hit areas.
- Use `review-animations` as a blocking gate.
- Use `break-ui` for long track/artist names, missing artwork, empty playlists, large counts and non-Latin text.
- Compare screenshots against the chosen reference at the same viewport and state.
- Report what is visibly different, not just what code was edited.

## Phase 5 — retain taste
Run `learn-taste` and update `DESIGN.md` with confirmed corrections and reasons. Do not turn inferred preferences into permanent rules without asking.
