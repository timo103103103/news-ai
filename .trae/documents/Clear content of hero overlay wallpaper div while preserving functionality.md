## Goal
Empty the target `div` on the front page while preserving all specified elements (`div`, `div`, `h1`, `p`, `button`, `div`, `a`, `button`, `button`) and maintaining dimensions, layout, interactivity, and accessibility.

## Target
- Element to clear: `src/pages/NewsIntelligenceLanding.tsx:181` — the overlay wallpaper `div` currently rendered as:
  - `<div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_60%)]" />`
- Preserved elements: Title (`h1`), subtitle (`p`), Analyze button, CTA link, hero controls, sidebar cards, and surrounding `div` containers.

## Implementation Steps
1. Replace the target `div` with an empty container that retains layout:
   - New markup: `<div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true" role="presentation" />`
   - Keeps full-coverage sizing via `absolute inset-0` and stacking via `z-0`.
   - Removes background to be visually empty; `pointer-events-none` avoids interaction interference.
2. Do not change any other elements or handlers (`handleAnalyzeNews`, `nextSlide`, `prevSlide`).
3. Accessibility: Use `aria-hidden="true"` and `role="presentation"` since the element is decorative and empty.

## Verification
- Visual: Confirm no layout shifts; dimensions remain; the section still occupies original space.
- Functional: Test Analyze button, CTA link, and slide controls; ensure they work.
- Computed styles: Check the cleared `div` has `position:absolute`, `inset:0`, and no background.
- Cross-viewport: Test responsive behavior and different browsers.

## Scope
- Single JSX change in one file; no CSS edits; no new files; no event listeners added; zero memory leak risk.

Confirm to proceed and I will apply the change and verify live in the running dev server.