## What I Will Do
- Save your uploaded logo into the project assets and use it everywhere the brand is shown.
- Render the image directly (no SVG recreation), ensuring one-line alignment with text when needed.
- Standardize sizes for header, footer, and auth pages; add responsive variants.
- Keep accessibility (alt text) and crispness on HiDPI; provide dark-mode friendly display.

## Files To Update
1. Add: `src/assets/brand/veritas-ai-logo.png` (your image)
2. Update: `src/components/Logo.tsx` to render an `<img>` when an image source is available
3. Replace usages to ensure consistent sizing:
   - `src/components/Header.tsx`
   - `src/pages/Home.tsx` (footer)
   - `src/pages/NewsIntelligenceLanding.tsx` (navbar + footer copyright text)
   - `src/pages/Login.tsx` (brand at top)

## Implementation Details
- Import the image via Vite:
  - `import brandLogo from '@/assets/brand/veritas-ai-logo.png'`
- Refactor `Logo`:
  - Props: `size` (default 64), `className`, `alt` (default "Veritas AI"), `inline` (default true)
  - When `brandLogo` exists, render:
    - `<img src={brandLogo} alt={alt} width={size} height={size} className={inline ? 'inline-block align-middle' : 'block'} />`
  - Keep the previous SVG as a fallback if the image cannot be loaded.
- One-line alignment:
  - Wrap image inside `flex items-center gap-3` container to keep image and any accompanying text on the same line.
  - For pages that only need the mark, use `<Logo size={56} />`; for larger hero/footer, `<Logo size={72} />`.

## Accessibility & Performance
- Set descriptive `alt="Veritas AI logo"`.
- Use `fetchpriority="high"` for header logo and `loading="eager"` there; `loading="lazy"` elsewhere.
- Optionally include a WebP version for smaller payload: `veritas-ai-logo.webp` with `<picture>` fallback.

## Exact Replacements
- Header: replace current `<Logo />` with `<Logo size={56} />`.
- Home footer: `<Logo size={64} />`.
- Landing navbar: `<Logo size={56} />`.
- Login page: `<Logo size={56} />`.

## Verification
- Run dev server and visually confirm:
  - Logo displays everywhere, on a single line
  - Proper sizing and spacing
  - No layout shift on load

## Rollback
- The SVG fallback remains in `Logo.tsx`. If needed, we can flip back by removing the image source import.

If this plan looks good, I’ll implement the changes and wire the uploaded image across the app.