# Master prompt — design and interaction refinement

**Use this only after the current audit-only pass has returned. Attach its report, this pack, the Apple HIG reference pack, the approved Figma exports, and current screenshots.**

---

We are entering a dedicated design-engineering refinement phase. Feature development is paused.

Read these project documents first:
- `DESIGN.md`
- `SKILL_SELECTION.md`
- `DESIGN_ENGINEERING_WORKFLOW.md`
- `MUSIC_PLAYER_DESIGN_GUIDE.md` and the Apple `SKILL.md` / HIG reference pack
- the audit-only report from the previous pass

Use the relevant Emil Kowalski skills as distinct methods, not as vague inspiration:
- `emil-design-eng` for overall interaction/design-engineering judgement;
- `apple-design` for Apple-like interaction principles, materials, depth, typography and fluidity;
- `improve-animations` and `find-animation-opportunities` for the read-only motion audit;
- `animate`, `gestures`, and `choreograph` for implementation;
- `animation-performance` for measured jank/performance problems;
- `mobile-native` for phone web-app behaviour;
- `review-animations` as a blocking final review;
- `break-ui` for worst-case content;
- `learn-taste` at the end to retain confirmed design corrections.

Use Vercel `web-design-guidelines` for web accessibility/interaction implementation checks and `vercel-react-best-practices` for React performance/engineering checks. These are complementary to Apple HIG and Emil's design/motion skills; they do not replace them.

## Non-negotiable constraints
1. Do not add product features.
2. Do not redesign the app's visual identity.
3. Do not alter approved Figma decisions.
4. Do not modify unrelated screens or flows.
5. Do not claim a change is complete unless it is visible in the running app and the relevant interaction has been tested.
6. Do not add dependencies unless the audit identifies a specific requirement and explains why the existing stack cannot meet it.
7. Do not use generic “premium”, “Apple-like”, or “polish” instructions as substitutes for measurable design decisions.

## First: reconcile the audit
Compare the audit-only report with the actual running app and supplied screenshots. Identify:
- findings that are correct;
- findings that are unsupported or mistaken;
- findings the audit missed;
- interactions that are still broken;
- differences between claimed changes and visible output.

If the current report does not identify concrete file/component locations and reproducible states, improve the audit before editing.

## Second: produce a prioritised plan, no code edits yet
Create a table with:
- priority;
- screen/component;
- current issue and evidence;
- exact intended change;
- skill/reference informing the change;
- files likely to change;
- acceptance test.

Separate visual refinements from interaction bugs. Do not bundle unrelated fixes.

## Third: wait for approval before implementation
Do not implement until the plan is presented. After approval, implement P0/P1 first, then P2. P3 remains deferred.

## Fourth: implement with proof
For every change group:
- show which files changed;
- explain the visible difference expected;
- run the app at the exact target viewport;
- capture before/after screenshots;
- test the interaction end-to-end;
- report any limitation honestly.

For animation, state the trigger, property, duration, easing/spring, origin, interruption behaviour, reduced-motion fallback, and why motion is useful. Avoid `transition: all`, animating layout properties unnecessarily, gratuitous stagger, hover effects on touch-only devices, and non-interruptible gesture animations.

For visual design, inspect the actual typeface rendered, type scale, icon family, stroke weight, optical alignment, spacing, radii, surface layering, contrast, artwork crop, and safe-area placement. Do not merely rename CSS variables and claim the design is refined.

## Fifth: blocking review
Run:
- `review-animations`;
- `web-design-guidelines`;
- relevant Apple HIG review pages;
- `break-ui`;
- TypeScript and production build.

A passing build is necessary but not sufficient. If the rendered screen still looks materially unchanged or an interaction still fails, mark the work incomplete.

## Scope for this refinement pass
Use the audit report to determine the exact scope. The immediate focus is the music player and its playlist sheet, plus any genuinely shared design tokens required for visual consistency. Do not alter Home, Library, Settings, navigation, filters or song cards unless explicitly approved.

End with:
1. verified changes;
2. before/after screenshots;
3. interaction test results;
4. unresolved issues;
5. exact next recommended step.
