# Music PWA — Google AI Studio Planning Bundle

This bundle is intended to be uploaded to the existing Google AI Studio project while the agent is in **Plan mode**. It consolidates the latest UX feedback, mobile-device comparison screenshots, Apple design/HIG reference material, design-engineering workflows, and existing project decisions.

## What to do

1. Open the existing Music PWA project in Google AI Studio.
2. Switch to **Plan mode**. Do not use Build/implementation mode yet.
3. Upload this ZIP. If AI Studio cannot inspect ZIP contents directly, extract it and upload the Markdown files in `01_MASTER_BRIEF`, `02_APPLE_DESIGN_AND_HIG`, `03_DESIGN_ENGINEERING_SKILLS`, and `04_PROJECT_CONTEXT`.
4. Upload the images from `05_VISUAL_REFERENCES` as individual image attachments as well. They are also included in this ZIP for convenience.
5. Paste the prompt from `PLAN_MODE_PROMPT.md`.
6. Ask the agent to return a detailed plan only. Bring that plan back to ChatGPT for review before authorising implementation.

## Bundle contents

- `01_MASTER_BRIEF/MASTER_UX_AND_IMPLEMENTATION_BRIEF.md` — current consolidated requirements and requested changes.
- `02_APPLE_DESIGN_AND_HIG/` — supplied Apple design skill, supplied Apple HIG review skill, focused music-player design guide, AI Studio workflow and HIG reference index.
- `03_DESIGN_ENGINEERING_SKILLS/` — curated Emil Kowalski design-engineering skill selection and workflow, plus Vercel skill recommendations.
- `04_PROJECT_CONTEXT/` — existing Phase 1 brief, design refinement blueprint, visual/interaction audit, prioritised roadmap and original build prompt reference.
- `05_VISUAL_REFERENCES/` — six key screenshots/reference images relevant to this review.

## Important accuracy note about the references

The Apple HIG material here is a **curated reference pack**, not a full offline mirror of every Apple HIG page. It includes the supplied skill documents, a project-specific guide and a reference index linking to upstream source pages. The Emil pack is also a **curated workflow/skill-selection pack**, not a verbatim export of every upstream skill file. Upstream source links are retained in the documentation. Do not claim that all upstream reference pages or skills are embedded locally.

## Project guardrails

- The target is a React-based installed PWA, not a SwiftUI app.
- Existing approved Figma/product decisions remain authoritative.
- Apple HIG and design-engineering references should improve craft, accessibility, motion and mobile ergonomics; they must not replace the product's identity or invent features.
- Keep Phase 1 and Phase 2 separate. Any Phase 2 item needs explicit approval.
- The latest mobile screenshot comparison is a priority: fix status-bar/top safe-area overlap, bottom safe-area/home-indicator overlap, bottom content clearance and mobile scale/spacing.
- The agent must audit and plan first. No code edits during this task.
