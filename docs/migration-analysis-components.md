# Migration Guide: Standardized Analysis Presentation

## Overview
This guide documents changes to unify analysis result presentation across the app using the styling and component structure from `src/components/AnalysisComponents.tsx`.

## Breaking Changes
- `AnalysisComponents.tsx` now exports subcomponents and default `NewsIntelligenceDashboard(data)` which requires a unified `AnalysisData` prop.
- Pages/components that previously rendered bespoke analysis views should now render `NewsIntelligenceDashboard` or consume exported subcomponents.
- A shared adapter `src/utils/analysisAdapter.ts` maps session-stored analysis objects to the unified `AnalysisData`.

## Updated Files
- `src/components/AnalysisComponents.tsx`: accepts `data` prop; exports named components.
- `src/pages/AnalysisResultPage.tsx`: renders `NewsIntelligenceDashboard`.
- `src/components/AnalysisResultsDisplay.tsx`: renders `NewsIntelligenceDashboard`.

## New Files
- `src/utils/analysisAdapter.ts`: converts legacy analysis shapes to unified props.
- `src/stories/AnalysisDashboard.stories.tsx`: Storybook docs for the standardized dashboard.

## How to Migrate
1. Replace custom analysis sections with `<NewsIntelligenceDashboard data={sessionToAnalysisData(currentAnalysis)} />`.
2. Remove duplicated styling grids in favor of standardized subcomponents (`ExecutiveVerdict`, `CredibilityRiskScore`, `MarketSentimentIndicator`, `PESTLEImpactChart`, `MotiveAndBiasRisk`).
3. Ensure responsive containers match the standardized layout (`max-w-7xl`, grid breakpoints).

## Visual Regression
Use Storybook snapshots or Chromatic to baseline the reference implementation and compare pages embedding the dashboard. Target ≥95% similarity across mobile/tablet/desktop.

## Notes
- Subscription gating can wrap standardized sections (e.g., `TierLock`) without altering the unified props.
- API results should be adapted via the adapter to prevent styling/structure divergence.