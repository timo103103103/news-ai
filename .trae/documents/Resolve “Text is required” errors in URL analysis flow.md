## What the two logs mean
- Error #1: The request to `/api/analyze/summary` is missing `text`. When the URL tab is used, the client sends `{ url }` (no `text`), and the controller `summaryController` requires `text`.
- Error #2: The client catches the 400 from the server and throws with `new Error(errorData.error)`, producing the “Analysis error” log.

## Root cause
- In `src/pages/NewsAnalysis.tsx`, `handleSubmit` constructs `requestBody` with `url` for the URL tab, then posts it to `/api/analyze/summary`, which only accepts `{ text }`.
- Additionally, the client assumes `data.data` is a string and accesses `.length`, while the summary controller returns an object (not plain text).

## Fix plan (client-side only)
1. Update URL tab flow in `handleSubmit`:
   - Step A: POST to `/api/analyze/news-input/url` with `{ url }` to extract article text server-side.
   - Step B: If success, set `requestBody.text = response.text` (sanitized text).
   - Step C: POST to `/api/analyze/summary` with `{ text }`.
2. Normalize response handling:
   - Treat `data.data` from summary as an object; store `rawAnalysis` as the object directly.
   - When computing `sourceText`, use the original text (from URL extraction/file/text) rather than the summary object.
   - Remove `.length` checks on `rawAnalysis` if it’s an object; if needed, compute length on `JSON.stringify(rawAnalysis)`.
3. UI feedback improvements:
   - If URL extraction fails (non-200), surface a toast “Could not fetch content from URL. Please try another link.” and keep the form enabled.
   - Keep existing success/error auto-dismiss, but ensure the user sees a helpful message when the 400 occurs.

## Exact edits (high level)
- In `handleSubmit`:
  - For `activeTab === 'url'`: `const urlTextRes = await fetch('/api/analyze/news-input/url', { method:'POST', headers, body: JSON.stringify({ url: urlInput.trim() }) })` → read JSON; on success set `requestBody.text = json.text`.
  - Then call summary: `await fetch('/api/analyze/summary', { method:'POST', headers, body: JSON.stringify({ text: requestBody.text }) })`.
- Replace uses of `analysisText.length` with a guard that stringifies objects: `const raw = data.data; const rawLen = typeof raw === 'string' ? raw.length : JSON.stringify(raw).length;`.
- Set `analysisResult.rawAnalysis = raw` (object or string), `analysisResult.sourceText = requestBody.text || requestBody.url || ''`.

## Validation
- URL tab: paste a real article URL → server extracts text → summary endpoint returns JSON → results page shows summary.
- Text/file tabs remain unchanged and pass `text` directly.
- Browser console shows 200/OK; no “Text is required” error.

## Optional (server-side, future)
- Extend `summaryController` to accept `{ url }` by fetching content internally; not needed now since `/news-input/url` exists.
