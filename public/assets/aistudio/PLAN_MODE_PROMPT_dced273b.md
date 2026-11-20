# Google AI Studio — Plan Mode Prompt

You have been given a consolidated Music PWA planning bundle. Read the documents in the bundle and inspect the current project repository before proposing changes.

## Your task

Perform a comprehensive **audit and implementation plan only**. Do not edit files, install packages, refactor code, alter styles or implement any feature during this pass.

## Source hierarchy

1. The existing project and its currently working functionality establish the implementation baseline.
2. Approved Figma boards and the user's explicit product decisions establish product intent.
3. `01_MASTER_BRIEF/MASTER_UX_AND_IMPLEMENTATION_BRIEF.md` contains the latest consolidated requests.
4. `04_PROJECT_CONTEXT/prioritized_improvements_roadmap.md` preserves the existing P0–P3 backlog and order. Reconcile new requests with it; do not silently discard earlier work.
5. Apple Design/HIG and design-engineering references are craft, accessibility, motion and implementation guidance. They do not authorise product redesign or scope expansion.
6. The visual references are evidence and examples for the exact issues described. Do not copy Shazam branding or infer unrelated features from screenshots.

## Mandatory review areas

### A. Current application audit
- Inspect the actual framework, dependencies, routes/screens, component tree, CSS architecture, state model, data model, storage, animations, gestures and PWA configuration.
- Verify actual package versions from the repository. Do not assume versions mentioned in old notes are still current.
- Identify existing implementation of every item in the brief and roadmap. Mark each as implemented, partially implemented, missing, regressed or needs runtime verification.

### B. Mobile PWA and physical-device issues
Compare the original Shazam iPhone screenshot with the installed PWA screenshot. Specifically audit:
- Status bar / Dynamic Island overlap.
- Top safe-area inset and Library header/sort placement.
- Bottom safe-area and home-indicator clearance.
- Bottom navigation positioning and scroll-content bottom padding.
- Search and filter visibility/placement.
- Mobile typography, song-card dimensions, artwork size, filter chips, icon scale, tap targets and vertical rhythm.
- Installed Home Screen PWA versus Safari browser mode.
- Dynamic viewport and browser chrome behaviour.

Do not solve this with a blanket CSS scale or arbitrary padding. Identify the root layout/viewport issue and propose robust acceptance tests.

### C. Functional and interaction requests
Audit and plan all requirements in the master brief, including:
- OR-within-category and AND-across-category filter semantics.
- Library context-menu additions: Recommend Less and Archive.
- Confirmation for permanent delete/remove actions.
- Music Player sheet clipping and top-right anchored overflow popover.
- Player menu wording, grouping and scope restrictions.
- White/neutral selected Shuffle and Repeat; white outline unselected Favorite; pink-red filled selected Favorite; optical heart sizing.
- Library scroll behaviour.
- Light Theme as a separately designed future theme pass.
- Further Apple HIG-informed interaction, gesture, motion and accessibility audit.

### D. Existing roadmap reconciliation
Review all P0, P1, P2 and P3 items in the prioritised roadmap. Keep P3 Phase 2 items out of implementation unless explicitly approved. Flag any conflicts or duplicate work between the new brief and the roadmap.

### E. Apple and design-engineering guidance
Use the supplied Apple Design skill, Apple HIG review skill, music-player guide, reference index and Emil/Vercel skill-selection workflow. For each relevant audit area, name which specific guidance is applicable and how it informs the recommendation. Do not claim to have read external pages or full upstream skills that are not actually included or accessed. The Apple pack is curated, not a complete offline copy of the HIG.

### F. QA strategy
Propose a verification strategy that combines:
- Static/source audit.
- TypeScript and production build checks.
- Unit tests for filter logic and state transitions.
- Playwright browser tests for interactions and responsive viewports, if the environment supports them.
- Screenshot capture and visual comparison at realistic iPhone viewport dimensions.
- Physical iPhone checks in installed PWA and Safari modes.
- Reduced-motion, keyboard, touch and accessibility checks.

A successful build is not visual QA. Clearly separate code verification from rendered UI verification and physical-device verification.

## Required output

Return a structured plan with:

1. Executive summary and current project health.
2. Requirement-by-requirement status matrix: requirement, current status, evidence/file/component, severity, proposed action.
3. Root-cause analysis for the mobile safe-area and sizing defects.
4. Filter logic specification with test cases covering OR within category and AND across categories.
5. Component/file impact map.
6. State/data/storage changes required, if any.
7. Reconciled P0–P3 backlog, preserving existing priorities and explicitly identifying new work.
8. Recommended implementation passes, dependencies and rollback points.
9. Apple HIG / design-engineering guidance relevant to each pass.
10. QA matrix with device sizes, browser modes, interaction tests and acceptance criteria.
11. Risks, ambiguities and decisions requiring user approval.
12. Explicit list of features that must remain deferred.

## Strict boundaries

- Plan only. No file edits, package installs or implementation.
- Do not redesign unrelated screens.
- Do not change approved product identity or Figma flows.
- Do not introduce new features because a guideline or screenshot suggests them.
- Do not implement queue, lyrics, full playback, backend, recognition service or other deferred Phase 2 functionality without explicit approval.
- Preserve the locked colour system, Heart for Favorites and exactly two player metadata lines (Title + Artist).
- Do not assume the live screenshot's song count is the canonical data count; inspect the current project data and report any discrepancy.
- If a requirement is ambiguous, list the exact question instead of guessing.

Finish with a clear statement confirming that no code or project files were modified.
