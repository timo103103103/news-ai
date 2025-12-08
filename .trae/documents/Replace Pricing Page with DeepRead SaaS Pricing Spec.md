## Overview
- Replace `src/pages/Pricing.tsx` with a modern, high-trust SaaS pricing page for DeepRead.
- Implement package-based subscriptions with monthly/yearly toggle and extra scan packs.
- Emphasize Pro plan visually; separate sections for Subscriptions, Add-ons, Usage Logic, Comparison, FAQ, Trust.

## Data Model
- State: `billingCycle: 'monthly' | 'yearly'` (default `'monthly'`), `focusedPlan: 'pro' | 'starter' | 'business'`, `loadingCTA`, `message`.
- Plans constant:
  - Starter: `$9`/month, `$90`/year, `40 scans`, features per spec.
  - Pro (Most Popular): `$29`/month, `$290`/year, `200 scans`, features per spec.
  - Business: `$79`/month, `$790`/year, `800 scans`, features per spec.
- Stripe Price IDs via env for each plan & cycle:
  - `import.meta.env.VITE_STRIPE_PRICE_STARTER_MONTHLY/YEARLY`
  - `VITE_STRIPE_PRICE_PRO_MONTHLY/YEARLY`
  - `VITE_STRIPE_PRICE_BUSINESS_MONTHLY/YEARLY`
- Extra packs constant:
  - `Extra 50 scans` → `$7` (`VITE_STRIPE_PRICE_PACK_50`)
  - `Extra 200 scans` → `$20` (`VITE_STRIPE_PRICE_PACK_200`)

## UI Structure
- Hero section (dark default): headline, subheadline, primary CTA “Get Started”, secondary “Start with Pro”, monthly/yearly toggle with sticky behavior.
- Main pricing cards (3 side-by-side, responsive to single column on mobile).
- Extra scan packs section (separate block under subscriptions).
- Usage logic visual (horizontal step diagram).
- Comparison table (Features × Starter/Pro/Business).
- FAQ block (required questions and calm tone answers).
- Trust & Payment section with Stripe/Visa/Mastercard/Apple Pay/Google Pay icons and text.

## Toggle Logic
- Sticky toggle using `sticky top-0` with backdrop blur; updates prices and shows savings badges when yearly.
- Savings badges: `(Save $18)`, `(Save $58)`, `(Save $158)` displayed beside yearly prices.

## Visual Emphasis & Style
- Dark mode default with soft neon accents; support existing theme via `dark:` classes.
- Pro card dominance: 105–110% scale, glow outline, gradient accent, “MOST POPULAR” badge.
- Glassmorphism/soft shadow cards, rounded corners, subtle transitions.
- CTA colors: primary for Pro, secondary for others.

## Extra Scan Packs
- Two compact add-on cards with lightning icon, “One-time purchase”, “No auto-renew” badge, “Add credits” button.
- Helper text: “Perfect for heavy months without upgrading your plan.”
- If pack price IDs missing, disable buttons and show tooltip “Contact support”.

## Usage Logic Section
- Horizontal steps: Subscribe → Monthly credits → Use credits & generate analysis → If out of credits → Buy extra pack or Upgrade plan.
- Message: “You never lose access. You simply scale up when you need more.”

## Comparison Table
- Columns: Feature, Starter, Pro, Business.
- Rows: Monthly scans, Modes available, Upload formats, Credibility depth, Team access, API access, Export options, Support tier.
- Pro column visually emphasized.

## FAQ Block
- Questions:
  - What happens if I run out of scans?
  - Do extra packs expire?
  - Can I upgrade anytime?
  - Does yearly include the same credits?
  - Is there rollover for unused scans?
  - Is payment secure with Stripe?
- Provide concise, non-technical, reassuring answers.

## Trust & Payment
- Icons/logos for Stripe, Visa, Mastercard, Apple Pay, Google Pay (via icon set).
- Text: “Payments secured by Stripe. Cancel anytime. No hidden fees.”

## Behavior & API Integration
- Subscribe CTA: choose correct `priceId` based on `billingCycle`; POST `/api/stripe/create-checkout-session` with `{ priceId, tier }` and redirect to returned `url`.
- Extra pack CTA: similar checkout flow for one-time packs; if backend lacks endpoint, show informational modal and disable.
- Preserve existing payment success verification (`session_id`) and premium view logic.

## File Changes
- Overhaul `src/pages/Pricing.tsx` to new layout and logic; remove old tiers, reuse Tailwind & `lucide-react` icons.
- No new external dependencies; rely on existing design tokens/styles.
- Optional minor CSS in `news-intelligence.css` or dedicated utility classes for glow/gradient.

## Validation
- Manual: toggle updates prices and yearly savings; Pro visually focused; add-on buttons disabled when IDs missing.
- API: checkout session created and redirects; health unaffected.
- Responsive: desktop 3 columns, mobile stacked; sticky toggle visible while scrolling; animations subtle.

## Handoff
- Document required env keys and where to set them.
- Keep code clean, typed, and ready for further Stripe integration.