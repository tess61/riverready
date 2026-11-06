# RiverReady design notes

The design system behind the Phase 5b redesign and its polish pass. Colours and sizes live in `src/styles/tokens.css`; this file records the decisions.

## Concept card ("Deep Current", Nov 2026; replaces the earthy Phase 5b palette at the student's request)
- **Idea:** your places, the river next to each one, and how ready you are.
- **Metaphor:** a river at night: ink-navy depths with glowing currents in two colours only, aqua and deep blue, blending into each other. Light mode is the same river in morning mist.
- **Signature:** liquid glass over river currents. A fixed backdrop of blurred glowing currents with fine flow lines (`--flow`, drawn by `scripts/make-flow.py`); every button, header pill, card and panel is its own liquid-glass pane that bends the currents at its rim (`hooks/useLiquidGlass.js`). The logo is a glass water drop carrying two waves, the same drop as the app icon (`scripts/make-icons.py`). The gauge tube on each card shows where the latest reading sits in its typical range.
- **Emotion:** calm and clear. Information first, never alarming.
- **Motion verb:** *rise like water.* Things fill from the bottom, lift slightly, or settle; the empty-state pin floats.
- **Screenshot:** the home page: floating glass header pills, the big heading, and the glass gauge cards over the currents.

## Palette (by role; exact values per theme in tokens.css)
| Role | Light | Dark |
|---|---|---|
| Ground | mist `#dde8f0` | ink navy `#0a1020` |
| Ink | `#0d1830` | `#eaf1ff` |
| Primary | deep aqua `#0a636c` | glowing aqua `#5ee6d6` |
| Currents (backdrop) | aqua + blue at 28% | brighter aqua + blue at 40% |
| Blends | aqua -> blue only (logo, icon, progress bar, disclaimer cap, illustration) | same |
| Status only (solid, never blended) | coral = high, amber = medium/low | lighter versions |
| Focus | violet `#5a2fd0` | `#c3b0ff` |
Coral is kept for "high" and destructive actions, so the focus ring is violet. Contrast was checked against the rendered backdrop (pixels behind each text run), not just token pairs, because text sits on gradients.

## Type
System fonts only (no font requests). Display: heavy weight with negative tracking. Numerals: `ui-rounded` where available, tabular. Scale ratio 1.25.
Deliberate two-step page titles: the home h1 is the hero size; inner pages use a smaller h1 so the working content (forms, readings) leads.

## Interaction: one treatment per role
| Role | Treatment |
|---|---|
| Primary button | lifts 2px off its darker ledge on hover/focus, presses flat on click |
| Outline / ghost button, filter chip | fill rises from the bottom edge (water-soft; danger-soft for Delete) |
| Selected filter chip | lifts 2px |
| Nav link | a water line draws under the label while the icon rises 2px |
| Logo | the droplet tips its point the other way and the waves drift |
| Location card | lifts; the water in its gauge tube rises a little |
| Back link | arrow nudges 4px left |
| Theme toggle | soft fill rises behind it, icon turns 25deg |
Hover rules sit inside `@media (hover: hover)` and are mirrored on `:focus-visible`. Under reduced motion, movement becomes instant, but every state change stays visible.

## Continuity
- Page change: the new page rises in (640 ms, symmetric in-out curve). Not on first load, so LCP stays fast. Feedback (hover, press) uses the fast-out curve instead.
- Lazy pages load inside the layout's own Suspense boundary, so the header and disclaimer never disappear while a page chunk loads.
- Idle state: nothing moves. The backdrop is fixed, so the only motion is the glass sliding over it while you scroll.
- First paint: `index.html` holds a static shell (header space, h1, intro text) the same height as the real header, so the React swap causes no layout shift.

## Decisions against the award playbook (brief wins)
- No GSAP, Lenis, WebGL or View Transitions router: CLAUDE.md forbids new dependencies, and React Router's `viewTransition` needs a data router. Everything is CSS.
- A missing URL still returns HTTP 200 locally. A real 404 status needs server routing on nuwebspace (deployment phase).
- No `og:image` or canonical tag until the deployed URL is known: both need an absolute URL.
