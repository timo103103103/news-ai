## Goal
Replace the entire `HeroSection.tsx` with the implementation from `DubaiSections.tsx`, preserving all functionality, styling, and responsiveness. Keep TypeScript typing and React hooks behavior consistent, and ensure `HeroSection` continues to render correctly wherever used.

## Approach
- Copy the three sections from `src/components/DubaiSections.tsx` (EventsSection, AboutSection, ArticlesSection) into `HeroSection.tsx`.
- Export a default `HeroSection` component that composes these sections in sequence. Provide a minimal `HeroSectionProps` with `className?: string` to maintain compatibility.
- Preserve all Tailwind styling and icon imports from `lucide-react`.
- Do not remove `DubaiSections.tsx`; the replacement is local to `HeroSection.tsx` to avoid breaking references.

## Implementation Steps
1. Remove current content of `src/components/HeroSection.tsx`.
2. Add imports required by DubaiSections: `{ Calendar, MapPin, ArrowRight }` from `lucide-react`.
3. Define in `HeroSection.tsx` the components:
   - `EventsSection` (unchanged from `DubaiSections.tsx`).
   - `AboutSection` (unchanged).
   - `ArticlesSection` (unchanged).
4. Create `export default function HeroSection({ className = '' }: { className?: string })` that returns:
   - A wrapper element `<div className={className}>` containing the three sections in order.
5. Ensure no missing assets: image URLs are remote; Tailwind classes already used project-wide.
6. Keep TypeScript types and hooks: files import React hooks only if used; no unnecessary hooks added.

## Verification
- Build/runtime: rely on the running Vite dev server to hot-reload and check the page.
- Responsiveness: Inspect mobile/tablet/desktop; grid classes in copied code already responsive.
- Accessibility: Headings and buttons remain accessible; images have `alt` text.
- Functionality: Buttons and hover transitions work; no navigation logic required in these sections.

## Impact and Compatibility
- `Home.tsx` (and any other usage) continues to import and render `<HeroSection />` with no prop changes.
- No additional files or dependencies added; Tailwind and `lucide-react` are already in use.

If approved, I will apply the replacement and verify live via the dev server logs and UI.