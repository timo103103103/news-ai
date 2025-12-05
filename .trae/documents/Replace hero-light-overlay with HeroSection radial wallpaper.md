## Goal
Copy the exact styling from the HeroSection radial wallpaper `div` and use it to fully replace the existing `hero-light-overlay` `div` in NewsIntelligenceLanding, preserving visual behavior, functional characteristics, and any existing event listeners.

## Source & Target
- Source element: `src/components/HeroSection.tsx:71` → `<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_60%)]" />`
- Target element: `src/pages/NewsIntelligenceLanding.tsx:181` → `<div className="hero-light-overlay" />`
- Current target styles: `src/styles/news-intelligence.css` defines `.hero-light-overlay { position: absolute; inset: 0; background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%); z-index: 0; }`

## Implementation Steps
1. Locate the target element in `src/pages/NewsIntelligenceLanding.tsx` within the `.hero-overlay` block and replace `<div className="hero-light-overlay" />` with the source element markup from HeroSection:
   - New markup: `<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_60%)]" />`
   - This preserves full-cover dimensions (`absolute` + `inset-0`) and the exact radial gradient.
2. Preserve layering and event listeners:
   - Keep the element at the same position in the DOM to preserve stacking order consistent with `.hero-gradient-overlay` and `.hero-interactive-overlay`.
   - Do not introduce any new listeners or timers; the element is purely presentational, so no memory-leak risks.
3. Optional z-index alignment:
   - If needed for clarity, add Tailwind `z-0` to the new `div` to match the original `.hero-light-overlay` z-index; otherwise, DOM order will keep it beneath content (`hero-content` has `z-3`).

## Verification
- Visual: Open `/news-intelligence` and confirm the wallpaper shows the indigo radial glow identically to HeroSection.
- Computed styles: Use devtools Elements panel and compare `getComputedStyle` for the source and target `div`s:
  - `position` = `absolute`
  - `top/left/right/bottom` = `0px`
  - `backgroundImage` contains `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2), transparent 60%)`
  - `width/height` match container size
- Functional: Ensure no event handlers existed on the replaced element (confirmed by code review); parent-level handlers remain unaffected.
- Performance: Confirm no new intervals/listeners; HMR applies cleanly with no warnings.

## Rollback Plan
If the new layering affects visuals, revert to the original `<div className="hero-light-overlay" />` or add `z-0` to the new element to explicitly match stacking behavior.

## Scope & Impact
- Single JSX element replacement; no new files created; no changes to CSS files.
- Safely preserves all visual quality attributes, dimensions, resolution, and aspect ratio via `absolute inset-0`.

Confirm to proceed and I’ll apply the change and verify live in the running dev server.