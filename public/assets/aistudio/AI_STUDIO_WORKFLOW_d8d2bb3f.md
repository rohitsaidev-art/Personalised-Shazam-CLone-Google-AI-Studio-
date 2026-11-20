# Google AI Studio — how to use this pack

## Before implementation
Attach/provide:
1. `SKILL.md`
2. `MUSIC_PLAYER_DESIGN_GUIDE.md`
3. The chosen final music-player reference image.
4. The current app screenshots or project files only if the agent needs to inspect existing styles/components.

## Ask the agent to follow this order
1. Read `SKILL.md` and `MUSIC_PLAYER_DESIGN_GUIDE.md` completely.
2. Treat the design guide's confirmed decisions as fixed product requirements.
3. Inspect the existing React implementation and identify the current typography tokens, icon package, color tokens, spacing, and player component.
4. Compare the current implementation against the final reference image.
5. Make a short, concrete refinement plan before editing.
6. Implement only the music-player screen and the minimum shared tokens/components required for visual consistency.
7. Verify the result at the target mobile viewport and at a short viewport height.
8. Report what changed and any remaining mismatches.

## Important implementation constraint
This is a React web/PWA, not a native iOS application. Apply HIG principles and familiar iOS interaction conventions in web-appropriate ways. Do not attempt to call UIKit/SwiftUI APIs or assume SF Symbols are available as a web icon font.

## Do not let the agent
- Rebuild the whole app.
- Change existing Home or Library layouts.
- Add unapproved controls or features.
- Replace the chosen reference with its own redesign.
- install multiple icon libraries or introduce unnecessary dependencies.
- claim that a visual effect or animation is implemented if it is only a static mockup.

## Suggested final instruction
“Use the attached Apple Design skill as the review method and the Music Player Design Guide as the project-specific source of truth. Use the final reference image for visual fidelity. First inspect the existing implementation and report the exact mismatches in typography, icon consistency, spacing, hierarchy, artwork sizing, colors, and controls. Then implement the music-player screen only. Do not change any other app screen or add features outside the approved guide. Use the existing stack and dependencies wherever possible.”
