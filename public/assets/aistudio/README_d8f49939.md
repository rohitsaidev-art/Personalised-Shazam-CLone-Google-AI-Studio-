# Apple HIG reference pack — Music player

This is a focused working pack for refining the music-player experience in the Shazam-inspired React web app.

## What's included
- `SKILL.md` — the Apple Design skill supplied by the user. Keep this as the reviewer/agent's operating instructions.
- `MUSIC_PLAYER_DESIGN_GUIDE.md` — a project-specific implementation brief translating relevant Apple HIG principles into actionable React/CSS decisions.
- `AI_STUDIO_WORKFLOW.md` — how to apply the skill and guide in Google AI Studio without allowing it to redesign unrelated screens.
- `REFERENCE_INDEX.md` — the relevant upstream HIG source pages to consult when deeper detail is needed.

## Important
This is a curated implementation pack, not a complete mirror of Apple's 123 HIG Markdown pages. The original skill itself recommends loading only the always-load foundation pages plus a small number of screen-specific references per review. The focused guide here distills the relevant principles and links back to the source pages.

The app is a React web/PWA, not a native SwiftUI/UIKit app. Apply Apple's platform-independent design principles and adapt iOS conventions thoughtfully; do not pretend native APIs or SF Symbols are automatically available in the browser.
