## Overview

* Build a robust RESTful backend that the TRAE frontend calls over HTTPS for analytical workflows.

* Use existing Express server under `api/` for local/dev and Vercel serverless for production; add optional Supabase Edge Functions for heavy/isolated compute.

* Clean separation: routing/controllers → services (business logic) → repositories (DB/cache) → infrastructure (queue, HTTP, auth, logging).

## Architecture

* API Layer: Express app (`api/app.ts`) mounting routes under `/api/*`.

* Controllers: Input → validation → service orchestration → response formatting.

* Services: Core analytical algorithms and orchestration of queue/caching.

* Queue Workers: Handle heavy computations with concurrency, retries, and timeouts.

* Repositories: DB access (Supabase/Postgres) and cache (Redis) via thin interfaces.

* Infrastructure: Auth (JWT or Supabase), rate limiting, CORS, Helmet, logging.

* Documentation: OpenAPI spec with Swagger UI.

* Testing: Unit (algorithms/validation) + integration (HTTP) + E2E coverage ≥ 80%.

## API Design

* `POST /api/analyze/summary` → text or file URL; returns structured summary.

* `POST /api/analyze/pestle` → PESTLE analysis; paid tier.

* `POST /api/analyze/motive` → motives/entities.

* `POST /api/analyze/party-impact` → winners/losers.

* `POST /api/analyze/market-impact` → stocks/market impacts.

* `GET /api/analysis/:id` → fetch computed result.

* `GET /api/analysis/:id/status` → queued/running/succeeded/failed with progress.

* `POST /api/analysis` → create analysis request (returns `id`, status).

* `GET /api/analysis` → list history with filters/pagination.

* Unified request payload: `{ text?: string; fileUrl?: string; params?: Record<string, unknown> }`.

* Unified response envelope: `{ id, status, result, meta, errors? }`.

## Validation & Security

* Validation: Zod schemas per endpoint; sanitize strings/URLs.

* Security: Helmet, CORS allowlist, Express rate limiting, input size limits, request timeouts.

* Auth: Bearer JWT or Supabase auth for sensitive operations (history, premium endpoints).

* Secrets: Use env vars (`OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REDIS_URL`); never log secrets.

## Processing Pipeline

1. Receive request → validate (Zod) → normalize input (fetch file by URL when provided).
2. Check cache by content hash + params; return cached result when hit.
3. If heavy compute, enqueue job; respond with `202 Accepted` and `id`.
4. Worker executes: call OpenAI API, run algorithms, compute result objects.
5. Persist results and metadata; write cache; publish status updates.
6. Return formatted JSON; expose status endpoints for polling.

## Database & Cache

* DB: Supabase Postgres tables

  * `analyses(id, type, created_at, status, user_id)`

  * `analysis_params(analysis_id, key, value)`

  * `analysis_results(analysis_id, result_json, summary_text)`

  * `jobs(id, analysis_id, state, started_at, finished_at, error)`

* Cache: Redis

  * Keys: `analysis:hash:<hash>` → result; TTL based on tier.

  * Keys: `analysis:status:<id>` → status/progress.

## Queue & Performance

* Queue: BullMQ backed by Redis; job priorities per tier, retries, backoff.

* Worker: concurrency tuned; respects `ANALYSIS_TIMEOUT_MS`; cancellation via job tokens.

* Caching: content-hash of `text` + normalized params; layered: Redis + DB fallback.

* Timeouts: AbortController for OpenAI requests; worker-level hard timeout.

## Documentation

* OpenAPI via `swagger-jsdoc` annotations; serve at `GET /api/docs` with `swagger-ui-express`.

* Include example requests/responses and error schemas.

* Deployment guide for Vercel and Supabase Edge Functions (env, build, routes, proxies).

## Testing Strategy

* Unit: vitest for validators, services, formatters, error handling; mocks for OpenAI and Redis.

* Integration: supertest against Express app for endpoints; cover auth, rate-limit, validation, queue behavior.

* E2E: run dev server with a fake OpenAI; verify full flow from `/api/analysis` → status → result.

* Coverage target: ≥80% critical paths; CI job runs `vitest --coverage`.

## Implementation Plan (Files)

* `api/app.ts`: ensure CORS, Helmet, rate limiting, JSON parsing, error middleware, Swagger.

* `api/routes/analyze.ts`: route definitions for all analysis endpoints.

* `api/controllers/analyzeController.ts`: orchestrates validate → service → response.

* `api/services/analyzer.ts`: core analysis orchestration; calls specific algorithms.

* `api/services/algorithms/*.ts`: PESTLE, motive, market-impact implementations.

* `api/services/openaiClient.ts`: wrapper around OpenAI API with timeouts and retry.

* `api/queue/index.ts`: BullMQ queues, job definitions, priorities.

* `api/queue/workers/analyzeWorker.ts`: worker logic with status updates.

* `api/repositories/db.ts`: Supabase client (service role), typed queries.

* `api/repositories/cache.ts`: Redis client; get/set for results & status.

* `api/middleware/auth.ts`: JWT/Supabase auth guards.

* `api/middleware/validation.ts`: Zod-based validation helpers.

* `api/middleware/error.ts`: centralized error handling and logging (pino).

* `api/docs/openapi.ts`: swagger-jsdoc setup and route registration.

* `api/tests/unit/*`, `api/tests/integration/*`: vitest + supertest suites.

## Supabase Edge Function (Optional)

* Create `supabase/functions/analyze-news/index.ts` using Deno `serve`.

* Accept `{ text, fileUrl }`; call OpenAI; return JSON.

* Configure `OPENAI_API_KEY`; call from TRAE Solo with service role key.

* Use for isolated compute or when deploying on Supabase; keep Express for richer features (queue, caching, DB history).

## ENV & Config

* `.env`: `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `REDIS_URL`, `ANALYSIS_TIMEOUT_MS`, `CORS_ALLOWLIST`.

* Dev proxy: `vite.config.ts` forwards `/api` → local server.

* Vercel: `vercel.json` rewrites `/api/*` → serverless handler.

## Deliverables

* Fully functional REST API with endpoints, validation, auth, rate limiting.

* Queue worker for heavy analyses with status tracking and timeouts.

* DB schema and repository layer; caching with Redis.

* OpenAPI docs at `/api/docs`.

* Tests with ≥80% coverage for core paths; integration and E2E.

* Deployment instructions for Vercel and optional Supabase Edge Functions.

## Next Steps

* Proceed to implement the files above, add dependencies (zod, swagger-jsdoc, swagger-ui-express, bullmq, pino, express-rate-limit, ioredis, supertest), configure env, and write tests.

* After implementation, verify locally (`npm run dev`), run tests (`npm run test`), and prepare deployment.

