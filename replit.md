# MindMate AI

A full-stack mental wellness web app for students and young adults — mood tracking, AI psychology chat, journaling, and daily wellness tools in one calm, therapeutic space.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/mindmate run dev` — run the React frontend (port 20014)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run typecheck:libs` — build composite lib declarations (run before leaf typechecks)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, Tailwind CSS v4, Framer Motion, Recharts
- Auth: Clerk (email + Google OAuth)
- AI: Replit OpenAI integration (`gpt-5.4`), streamed SSE responses
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/api-client-react/src/generated/` — generated React Query hooks (do not edit directly)
- `lib/api-zod/src/generated/` — generated Zod schemas for server validation
- `lib/db/src/schema/` — Drizzle ORM table definitions (moods, journal, wellness, conversations, messages)
- `artifacts/api-server/src/routes/` — Express route handlers (moods, journal, wellness, dashboard, openai-chat)
- `artifacts/mindmate/src/pages/` — React pages (landing, dashboard, mood, chat, journal, wellness, profile)
- `artifacts/mindmate/src/components/` — Shared UI components

## Architecture decisions

- **Contract-first API**: OpenAPI spec drives Orval codegen for both React Query hooks and Zod validation schemas, ensuring frontend/backend stay in sync.
- **SSE streaming for AI chat**: The chat endpoint streams tokens via Server-Sent Events rather than waiting for the full response, for a real-time feel.
- **Clerk auth with proxy**: Clerk is proxied through the Express API (`/api/__clerk`) so auth works seamlessly behind Replit's reverse proxy.
- **Seeded wellness content**: Affirmations and wellness exercises are pre-seeded in the DB at setup time so the app has content from day one.
- **Per-user data isolation**: All user-owned tables (moods, journal, gratitude, conversations) include a `userId` column and all queries filter by the authenticated Clerk user ID.

## Product

- **Mood Tracker**: Log daily mood from 5 levels (Terrible → Amazing) with notes; see 7-day history, streak, weekly analytics
- **AI Psychology Chat**: Streaming conversation with a compassionate AI companion trained on CBT and mindfulness; full conversation history persisted
- **Journal**: Rich text journal entries with title, content, and tags; full CRUD
- **Wellness Tools**: Animated breathing exercises (Box Breathing, 4-7-8), CBT thought records, gratitude journal, daily rotating affirmation card
- **Dashboard**: Weekly mood trend chart, wellness score, activity streak, recent activity feed
- **Auth**: Clerk email + Google OAuth with branded sign-in/sign-up pages

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm run typecheck` — leaf packages depend on compiled lib declarations
- The `integrations-openai-ai-react` package needs `react` and `@types/react` as devDependencies for compilation even though react is a peerDependency
- Drizzle `date()` columns are typed as `string` (ISO format); Zod `coerce.date()` returns `Date` objects — convert with `.toISOString().split("T")[0]` before inserting
- API routes are mounted at `/api` by Express router; the Clerk proxy handles `/api/__clerk`
- The `conversations` table has `userId` with `.default("")` to allow the Clerk proxy to work before auth is applied

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `.local/skills/clerk-auth/` for Clerk setup and customization details
