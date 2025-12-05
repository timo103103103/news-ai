## Goal
- Ensure the app is running locally and provide the correct preview URL.

## Steps
1. Check whether the dev servers are already running.
2. If not running, start with `npm run dev` (frontend + API).
3. Read logs to confirm the actual port the frontend is using (Vite may auto-switch if 5173 is busy).
4. Provide the preview URL and confirm the API server port (default 3005).

## Notes
- This uses your existing concurrently setup (`client:dev` + `server:dev`).
- If port conflict occurs, Vite will choose a new port automatically; I’ll surface the final URL.