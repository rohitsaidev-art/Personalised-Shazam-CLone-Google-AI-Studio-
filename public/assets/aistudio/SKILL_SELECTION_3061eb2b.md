# Selected skills and why

## Emil Kowalski — core set

Repository: https://github.com/emilkowalski/skills

| Skill | Use | Priority |
|---|---|---|
| `emil-design-eng` | Broad design-engineering judgement: decide whether motion is needed, choose implementation approach, improve responsive feedback and interaction craft. | Core |
| `apple-design` | Apple-inspired interface principles translated to the web: direct manipulation, fluid physical motion, materials, depth and typography. | Core |
| `improve-animations` | Read-only audit of all animated surfaces; prioritised, self-contained remediation plans before editing. | Core |
| `animate` | Implement an individual animation with deliberate properties, easing, duration, interruption and reduced-motion support. | Core |
| `gestures` | Finger-tracked drag, swipe, sheets, momentum, rubber-banding and velocity-aware dismissal. | Core |
| `choreograph` | Coordinate multi-element transitions: sequencing, overlap, origin and elements that should remain still. | Core |
| `review-animations` | Strict final motion gate with exact findings and approve/block outcome. | Core |
| `animation-performance` | Diagnose dropped frames, layout/paint animation, React work per frame and compositor-friendly alternatives. | Core |
| `mobile-native` | Web-on-phone details: safe areas, dynamic viewport, tap feedback, hover handling, input zoom, touch ergonomics. | Core |
| `break-ui` | Stress test with long/short/missing/non-Latin/emoji values, huge counts and empty states. | Core |
| `learn-taste` | Convert the user's actual corrections into durable, reasoned rules in `DESIGN.md`. | Core, run at session end |

## Emil — useful, but situational

- `find-animation-opportunities`: use during the motion audit to identify where motion adds meaning and where it should stay still.
- `remove-animations`: use when the app has gratuitous, repetitive or distracting motion.
- `animation-vocabulary`: use when describing a desired motion effect is difficult; it provides precise terminology.
- `prototype`: use later when comparing genuinely different component directions. Do not use it to create unnecessary alternate app screens during a fidelity/refinement pass.
- `pick-ui-library`: use only if a real component/library decision is blocking implementation. Do not install another UI library just because this skill exists.

## Explicitly skip for this project

- `animate-expo`: React Native/Expo-specific; current project is React web.
- `write-swift`: native Swift code; current project is React web.
- `ask-sonner`: only relevant if Sonner toast setup/styling is part of the task.
- `ask-emil`: optional routing helper; not needed when the workflow and task are already defined.

## Vercel — add these two skills

Sources: https://github.com/vercel-labs/agent-skills

### `web-design-guidelines` — include
Use as a web-specific audit layer for semantics, keyboard operation, focus visibility, touch interaction, forms, responsiveness, accessibility and other interface implementation details. The skill fetches the current rules from:
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md

### `vercel-react-best-practices` — include, but only for engineering
Use for React performance and maintainability: render behaviour, rerenders, bundle size, event listeners, state derivation, rendering cost and related patterns. It is not a visual-design or Apple-aesthetic skill.

## Do not add a generic frontend-design skill by default
A generic “make it visually striking” skill can push the agent toward a new aesthetic and away from the approved Figma direction. The project needs disciplined fidelity and craft, not a fresh visual identity. The existing Emil + Apple + Vercel review stack is more appropriate.
