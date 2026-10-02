# forrent.si

A rental discovery app with natural-language search, map browsing, transparent monthly cost breakdowns, saved homes, comparisons, saved searches, and renter preferences.

## Current state

The app runs in a clearly labeled **sample-data preview** by default. All listings, availability, rents, fees, and map locations are fictional. Photos are illustrative. No applications, payments, tour requests, or email alerts are sent. Live feeds are intentionally deferred.

Without configured accounts, preferences, searches, and favorites stay in the current browser. With Supabase connected, password signup/login/reset and account-owned storage are enabled. Basic search is deterministic and labeled as a preview; optional authenticated OpenAI interpretation is implemented but needs a server-side API key.

## Run locally

Requires Node 22.13+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

The Vite development server shows preview mode without external credentials. To exercise runtime configuration and APIs:

```sh
npm run build
node --env-file=.env server/index.js
```

Copy `.env.example` to `.env` and fill only values needed. Never commit `.env`.

## Deploy to Hostinger

Use Hostinger's **Node.js app** deployment, connected to `nerdicom/forrent` on `main`.

| Setting | Value |
|---|---|
| Node | 24 (or supported 22.13+) |
| Install | `npm ci` |
| Build | `npm run build` |
| Start | `npm start` |
| Entry file, if requested | `server/index.js` |
| App URL | `https://forrent.si` |

Hostinger supplies `PORT`; the server binds to `0.0.0.0`. Deploy the source repository, not `dist` alone, to enable APIs and runtime configuration. The frontend's `dist` folder can also be served as a static preview, but account configuration and AI endpoints then remain unavailable.

Environment variables:

| Variable | Purpose |
|---|---|
| `APP_URL` | Canonical app origin, used to validate AI requests |
| `DEMO_MODE` | Keep `true` until licensed feeds are connected |
| `SUPABASE_URL` | Dedicated forrent Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key (never service_role) |
| `OPENAI_API_KEY` | Optional server-only AI key |
| `OPENAI_MODEL` | Optional compatible Responses model, default `gpt-4.1-mini` |
| `AI_DAILY_LIMIT` | Per-process daily AI request cap, defaults to 200 |

## Connect Supabase

1. Create a **dedicated** forrent project in the chosen organization. Do not apply this schema to an unrelated app.
2. Apply the SQL under `supabase/migrations` to the new project. It creates public listings and account-owned renter profiles, saved homes, and saved searches, plus a private feed-source table.
3. Add the project URL and publishable key in Hostinger, then restart/redeploy.
4. In Supabase Auth, set Site URL to `https://forrent.si` and permit that URL for signup confirmation and password recovery. Configure production SMTP before public signup; the default Supabase sender is limited.
5. Verify signup confirmation, sign-in, password recovery, cross-device persistence, and isolation with two test accounts. These require a live Supabase project and were not run in the unconfigured preview.

All public tables have RLS and explicit grants. Browsers cannot write listings or access feed credentials. Only account owners can access their profile/favorites/searches. There are no SECURITY DEFINER functions or user-editable authorization claims.

## Feed contract

Feed adapters should normalize licensed records into `public.listings`, upserting on `(source, source_id)`. The importer runs server-side with appropriately protected credentials, never in the browser. Store origin links and sync timestamps, keep unit-level identity, preserve attribution and media rights, and mark withdrawn records inactive. Source contracts must define allowed caching, display, AI processing, refresh, and deletion behavior.

The live frontend selects active records for the chosen city; the initial live fetch limit is 200. Add server-side pagination and geographic queries before scaling beyond a launch market. Support for additional cities is centralized in `src/data.js` and the AI schema.

## AI behavior and production limits

The AI only converts the submitted search into a strict, validated filter schema. Filtering and match explanations use listing facts. Unsupported preferences are disclosed; the model does not invent listings or make eligibility decisions. Authenticated requests are verified with Supabase `getUser`. Keys stay on the server, input is limited, upstream requests time out, and per-account/hour plus per-process/day limits apply. Before multi-instance scaling, replace in-memory quotas with a shared rate-limit store and configure provider spending limits.

## Validation

```sh
npm test
npm run build
```

Validation completed: production build, nine search/API tests, desktop and 390px mobile UI checks, favorite/search persistence, comparisons, map marker selection, and migration/RLS checks in local Postgres (PGlite). Live Supabase authentication and live OpenAI calls await configuration. Browser WebMCP registration is feature-detected; the preview browser did not expose the tool interface.

The demo is noindex by default. The production server removes the noindex metadata when `DEMO_MODE=false`. Read ASSETS.md for image sources.
