# RiverReady design notes

The design system behind the Phase 5b redesign and its polish pass. Colours and sizes live in `src/styles/tokens.css`; this file records the decisions.

## Concept card
- **Idea:** your places, the river next to each one, and how ready you are, seen from above.
- **Metaphor:** a river seen from above, cutting through layers of earth (moss, ochre, clay).
- **Signature:** the earth band in the header with a live river (`RiverBand.jsx`), echoed by the gauge tube on each location card. The tube's water level shows where the latest reading sits in its typical range.
- **Emotion:** calm and grounded. Information first, never alarming.
- **Motion verb:** *rise like water.* Things fill from the bottom, lift slightly, or settle.
- **Screenshot:** the home page, with the band above and the gauge cards below.

## Palette (by role; exact values per theme in tokens.css)
| Role | Light | Dark |
|---|---|---|
| Ground | sand `#f1ede3` | umber `#1b1511` |
| Ink | `#241c15` | `#f2eadd` |
| River / primary | teal `#0c5c60` | `#6cc9c2` |
| Earth band | `#3a2a1e` | `#110d0a` |
| Focus | amber `#8a5a00` | `#f2c14e` |
Clay is kept for "high" and destructive actions, so the focus ring is amber (it used to be clay and read like an error).

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
- Page change: the new page rises in (640 ms, symmetric in-out curve), and the header band eases between its tall (home) and slim (inner) heights (900 ms). Not on first load, so LCP stays fast. Feedback (hover, press) uses the fast-out curve instead.
- Lazy pages load inside the layout's own Suspense boundary, so the header and disclaimer never disappear while a page chunk loads.
- Idle state: the dashed highlight drifts along the river in the band. It stops under reduced motion.
- First paint: `index.html` holds a static shell (band, h1, intro text) the same height as the real header, so the React swap causes no layout shift.

## Decisions against the award playbook (brief wins)
- No GSAP, Lenis, WebGL or View Transitions router: CLAUDE.md forbids new dependencies, and React Router's `viewTransition` needs a data router. Everything is CSS.
- A missing URL still returns HTTP 200 locally. A real 404 status needs server routing on nuwebspace (deployment phase).
- No `og:image` or canonical tag until the deployed URL is known: both need an absolute URL.
