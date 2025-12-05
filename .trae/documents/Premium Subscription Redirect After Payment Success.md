## Goal
Automatically redirect users to the Premium subscription page after successful payment verification, with a smooth transition that preserves session state, loads in ≤2 seconds, and robust error handling.

## Target Flow
1. User clicks `Go Premium` in `Pricing`.
2. Stripe Checkout completes → redirect to Premium Subscription page.
3. Client verifies payment via `session_id` → sets tier to `premium`.
4. Smooth transition shows subscription details, benefits, and management options.
5. On error, show notifications with fallback actions.

## Server Changes
1. Update Stripe success URL in `api/controllers/stripeController.ts`:
   - Change `success_url` to `CLIENT_URL + '/pricing?success=true&session_id={CHECKOUT_SESSION_ID}'`.
   - Keep `cancel_url` as `CLIENT_URL + '/pricing?canceled=true'`.
   - Rationale: `Pricing.tsx` already handles `success` and calls `/api/stripe/subscription-status`.

## Client Changes (Pricing Page)
1. Enhance `Pricing.tsx` success handling:
   - On `success === 'true'` and `session_id` present, call `/api/stripe/subscription-status`.
   - On `status === 'success'`, call `setTier(data.tier)` and immediately navigate to `'/pricing#premium'` (or `'/premium'` route if available).
   - Use a lightweight full-screen transition overlay for ~300ms to avoid abrupt changes.
2. Simulated Premium branch:
   - After `setTier('premium')`, programmatically navigate to `'/pricing#premium'` with a smooth transition.
3. Preserve session state:
   - Keep `SubscriptionContext` tier; optionally persist tier to `localStorage` to survive route reloads.
   - Do not clear query params until after verification.

## Premium Page Content
1. Display subscription details using:
   - `SubscriptionStatus` (current plan name, price, status, renewal date, features).
   - `BillingManagement` (manage billing portal, cancel, payment method info).
2. Show benefits list and CTA:
   - Add concise benefits section and `Start Using Premium` CTA linking to results/dashboard.

## Transitions & Performance
- Add a fade-in overlay (`opacity/transform`) around premium content for smooth transition.
- Preload the premium section (static components) to ensure render in ≤2s.
- Keep verification call (`/api/stripe/subscription-status`) as the only async step; show skeleton during fetch.

## Error Handling
1. If verification returns `pending` or fails:
   - Show a banner/toast: “Payment verification failed — retry or contact support”.
   - Provide actions: `Retry`, `Open Billing Portal`, `Back to Pricing`.
   - Keep user on `Pricing` without changing tier.
2. Log errors in console; avoid blocking UI.

## Routing
- Use `react-router-dom` `useNavigate` for client redirects.
- If `'/premium'` dedicated route exists, redirect there; otherwise use `'/pricing#premium'` anchor.

## Verification
- Simulate success (Premium button) and confirm immediate redirect with tier set to `premium`.
- Test Stripe success URL path with `session_id` and verify redirect + tier set.
- Validate 2s load: content renders with skeleton → full details visible under target time.
- Test error paths (no `session_id`, server 500) and ensure fallback UI.

## Deliverables
- Updated success URL on server.
- Pricing page enhancements: verification → set tier → redirect.
- Transition overlay and skeleton.
- Error handling with notifications and fallbacks.

Please confirm this plan and preferred target route (`/premium` vs `/pricing#premium`).