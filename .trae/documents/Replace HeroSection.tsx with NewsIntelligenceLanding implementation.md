## Goal
Replace `src/components/HeroSection.tsx` entirely with the exact implementation from `src/pages/NewsIntelligenceLanding.tsx`, keeping import paths relative to the components directory and preserving functionality.

## Approach
- Copy all imports, component code, utility functions, props, and export statements from `NewsIntelligenceLanding.tsx` verbatim.
- Adjust nothing except the file location; import paths (`../styles/...`, `../hooks/...`) already align from `src/components`.
- Keep default export as `NewsIntelligenceLanding`; default import aliases will continue to work in consumers.

## Steps
1. Delete current contents of `src/components/HeroSection.tsx`.
2. Paste the full code from `src/pages/NewsIntelligenceLanding.tsx`:
   - Imports: React hooks, `lucide-react` icons, `useScrollAnimation`, `useNavigate`, styles.
   - Component: `NewsIntelligenceLanding` with state, effects, handlers, and full JSX.
   - Export: `export default NewsIntelligenceLanding`.
3. Ensure relative imports:
   - `../styles/news-intelligence.css`
   - `../styles/analysis-components.css`
   - `../hooks/useScrollAnimation`
4. Verification via dev server:
   - Confirm HMR updates apply.
   - Check rendering across mobile/tablet/desktop.
   - Make sure no missing dependencies or TS issues in this file.

## Impact
- `Home.tsx` and other consumers importing default from `HeroSection.tsx` will render the News Intelligence landing content.
- No additional files or dependencies added.

Proceed to implement and verify live with the running dev server.