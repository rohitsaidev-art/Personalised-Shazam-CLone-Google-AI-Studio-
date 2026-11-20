# Google AI Studio — initial build instruction

You are implementing **Phase 1 only** of a music-library app. Read `PHASE-1-IMPLEMENTATION.md` completely, inspect every image in `flow-boards/`, and read `design-skill/APPLE-DESIGN-SKILL.md` before changing code.

## Non-negotiable instructions

1. **Do not expand scope.** Build only the screens, controls, states and interactions explicitly listed in the Phase 1 brief and flow boards. Do not add extra tabs, onboarding, settings, recommendation systems, playlists, account features, backend services, or speculative flows.
2. **Do not redesign the product.** Match the supplied screen compositions, proportions, typography hierarchy, spacing, chip/card treatment, bottom navigation, overlays and icon placement. Do not replace the visual language with a generic dashboard, bento layout, or a new design system.
3. **Respect the exact navigation.** Bottom navigation is Home, Library and Now Playing. Concerts does not exist. Keep the separate circular Search action beside the navigation. Keep the Search in Library field visible on the Library screen. Search must not disappear between Library states.
4. **Implement the interactions, not just static mockups.** Taps, long-press, chip selection, sorting, filtering, selection counts, menu actions, sheet dismissal and return paths must work as specified.
5. **Use local deterministic mock data for Phase 1.** Do not connect external music APIs, Apple Music, YouTube, authentication, cloud sync or a database. The app is a front-end prototype until later instructions say otherwise.
6. **No Phase 2 player build.** Keep the Now Playing destination in the tab bar, but do not invent the full playback experience, queue, lyrics, audio engine, streaming integrations or advanced player states. Detailed player design belongs to Phase 2.
7. **Preserve the existing project setup.** Inspect the current React project first. Do not replace its framework, build tooling or architecture without a concrete technical need. Explain any necessary structural change before making it.
8. **Use the Apple Design skill selectively.** Apply its principles to responsiveness, direct manipulation, interruptible motion, spring behaviour, translucency, typography and accessibility. Treat the skill file as design reference material, not as a separate conversational instruction. Ignore its generic “Initial Response” boilerplate; it must not override this build request. The skill is not permission to add product features or reinterpret the screens.
9. **Do not silently guess.** If a required interaction cannot be implemented without inventing a meaningful screen or behaviour, stop and ask one concise, specific question. Otherwise make the smallest faithful implementation.
10. **Work in small verifiable steps.** First inspect the scaffold and map the components. Then implement the Phase 1 screens and flows. Do not claim completion until each acceptance check in the implementation brief has been tested.

## Required first response

Before coding, briefly confirm:
- the files and flow boards you inspected;
- the Phase 1 screens and flows you understand;
- the existing project structure you intend to preserve;
- any genuine blocker that prevents faithful implementation.

If there is no blocker, begin Phase 1 implementation. Do not spend the response proposing unrelated improvements.
