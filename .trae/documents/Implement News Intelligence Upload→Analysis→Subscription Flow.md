## Findings

* Syntax errors and invalid JSX in `src/components/SummaryCard.tsx` cause build failure:

  * Line 64 contains raw text `[Image of a PESTLE analysis bar chart]` which is not a JSX comment → parser error.

  * The `button` element (lines 116–121) lacks a closing `</button>` and the component tree is not closed (`</div>` and function closing brace/paren are missing) → unterminated JSX/function.

* Vite/Babel logs show TypeScript parser failures consistent with unclosed tags/invalid tokens.

* Imports and Recharts usage otherwise look correct, including `Cell` fill mapping.

## Fix Plan

1. Replace raw text at line 64 with a JSX comment to keep intent without breaking JSX:

   * Change `[Image of a PESTLE analysis bar chart]` to `{/* Image of a PESTLE analysis bar chart */}`.
2. Close all missing JSX and function boundaries:

   * Add `</button>` after the `<ArrowRight />` icon.

   * Add closing `</div>` for the outer card wrapper.

   * Ensure the function component returns a closed tree and ends with `}`.
3. Minor polish and safety:

   * Guard `onViewFullReport` click: `onClick={onViewFullReport ?? (() => {})}` to prevent undefined handler errors.

   * Ensure numeric props (`accuracy`, `dataPoints`) render with defaults and proper formatting; keep as-is if they already do.
4. Align styling with standardized analysis components:

   * Keep existing Tailwind classes but ensure consistency with the palette used in `AnalysisComponents.tsx` (blue/purple/gray).

   * Maintain the small PESTLE bar chart (it’s fine to remain as a lightweight preview card).

## Validation

* Run dev server to confirm no parse errors; SummaryCard renders.

* Add a unit test:

  * Render `<SummaryCard title="Test" accuracy={95} dataPoints={123} />` and assert title/accuracy/data points appear and button is present.

* Manual visual check: responsiveness of the card and mini chart on mobile/desktop.

## Notes

* This fix is limited in scope (syntactic correctness and minor safety); no breaking API changes.

* If desired later, we can migrate SummaryCard to consume the shared `AnalysisData` model for tighter integration with the unified dashboard.

