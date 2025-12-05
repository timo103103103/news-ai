## Goal
Apply a high-quality newspaper texture background to Home.tsx that covers the viewport, preserves readability and contrast, and remains responsive and accessible.

## Approach
- Use a CSS Module (`Home.module.css`) for maintainability (styled-components not in dependencies).
- Wrap Home page content with a container applying the newspaper background.
- Use layered backgrounds: texture image + semi-transparent overlay to ensure contrast.
- Add responsive rules to handle mobile/tablet/desktop and reduce motion when needed.

## Changes
1. Create `src/pages/Home.module.css` with:
   - `.newspaperBg`: full-viewport background using `background-image: linear-gradient(rgba(15,23,42,0.40), rgba(15,23,42,0.40)), url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&auto=format&fit=crop)`; `background-size: cover`; `background-position: center`; `background-repeat: no-repeat`; `min-height: 100vh`; `transition: background 300ms ease`.
   - Responsive: `@media (min-width: 1024px) { background-attachment: fixed; }` and `@media (max-width: 1023px) { background-attachment: scroll; }`.
   - Accessibility: `@media (prefers-contrast: more) { increase overlay opacity to 0.6 }` and `@media (prefers-reduced-motion: reduce) { transition: none }`.
2. Update `src/pages/Home.tsx`:
   - Import styles: `import styles from './Home.module.css'`.
   - Wrap all returned content inside `<div className={styles.newspaperBg}>...</div>` (no content changes inside to preserve functionality).

## Verification
- Visual: Background covers viewport, no layout shifts, sections remain readable.
- Accessibility: Overlay ensures contrast; verify key text against background meets ≥4.5:1; prefers-contrast increases overlay for users who need it.
- Responsive: Check mobile/tablet/desktop; no parallax performance issues on mobile due to `background-attachment: scroll`.
- Functionality: HeroSection, buttons, links, charts remain unchanged and working.

## Rollback
- Remove the wrapper and CSS import to revert. No other files affected.

Proceed to implement and verify via the running dev server.