## Current Behavior
- The tab container `analysis-tabs` is a flex row that wraps and switches to column on small screens.
- Styles live in `src/styles/news-analysis.css` and are imported by `src/pages/NewsAnalysis.tsx:5`.

## Goal
- Keep the three tabs (URL Analysis, Upload, Text) in a single horizontal row across all screen sizes.
- Avoid vertical stacking; allow horizontal scrolling when space is tight.

## Changes
- Update `.analysis-tabs` to prevent wrapping and keep `row` direction at all breakpoints.
- Add horizontal overflow so tabs remain in one line on narrow screens.

## Implementation
- Edit `src/styles/news-analysis.css`:
```
.analysis-tabs {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 0;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .analysis-tabs {
    flex-direction: row;
    gap: 8px;
  }
}
```
- Leave `.tab-btn` as `inline-flex`; no changes needed.

## Verification
- Run the dev server and view the News Analysis page.
- Confirm tabs remain on one horizontal line at desktop and mobile widths.
- Shrink the viewport to ensure horizontal scroll appears instead of vertical stacking.

## Notes
- This preserves existing visual styles (active state, hover) and accessibility roles.
- If preferred, `min-width` for `.tab-btn` can be reduced later to fit more tabs without scrolling.