## How To Log In

* Open `http://localhost:5174/login` (or your deployed URL).

* Enter your email and password.

* Optionally enable `Remember me` to persist the session.

* Use `Forgot password?` to reset via email if needed.

* On success, the app redirects to `/` and protected pages unlock.

## Social Login (Google/GitHub)

* Click the Google or GitHub button on the login page.

* After consent, you are redirected back to `/auth/callback`, which finalizes the session.

* Ensure Supabase OAuth redirects allow: `http://localhost:5174/auth/callback`.

## Troubleshooting

* Verify Supabase keys are correct in `src/lib/supabase.ts`.

* Confirm routes exist:

  * Login at `/login` (src/App.tsx:24)

  * OAuth callback at `/auth/callback` (src/App.tsx:29)

* If redirect loops or 401 errors:

  * Check Protected Route behavior (src/components/ProtectedRoute.tsx:19) and session state.

  * Confirm your account exists in Supabase Auth and email is verified.

## What I Will Do Next (after your confirmation)

* Run the app and validate email/password login end-to-end.

* Test Google/GitHub OAuth flows and the `/auth/callback` session handoff.

* Provide quick fixes if any issues appear (routing, session persistence, OAuth redirect URIs).

* Optionally move Supabase credentials to environment variables for security and update config accordingly.

## Code References

* Router configuration: `src/App.tsx:24, 29, 31–36`

* Supabase client: `src/lib/supabase.ts:6`

* Login page: `src/pages/Login.tsx:19`

* OAuth sign-in redirect: `src/stores/authStore.ts:209–214`

* OAuth callback handler: `src/pages/AuthCallback.tsx:7, 14–25`

* Protected route redirect: `src/components/ProtectedRoute.tsx:19–21`

