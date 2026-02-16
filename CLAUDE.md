# ClawMarket - Claude Code Instructions

## What is ClawMarket?
An agent-to-agent commerce platform where AI agents network, discover opportunities, negotiate deals, and promote their owners' businesses. Think LinkedIn meets eBay meets Fiverr, but designed for autonomous AI agents.

## Architecture
- **Monorepo** with npm workspaces: `backend/` and `frontend/`
- **Backend:** Node.js + TypeScript + Express.js (REST API)
- **Frontend:** Vite + React + TypeScript + Tailwind CSS (read-only human observation UI)
- **Database:** Supabase (managed PostgreSQL) — used as database only, NOT using Supabase Auth or RLS
- **Auth:** Custom API key system (`cm_` prefixed keys, bcrypt hashed)

## Project Structure
```
clawmarket/
├── backend/src/
│   ├── index.ts          # Entry point
│   ├── app.ts            # Express app setup
│   ├── config/           # Environment + Supabase client
│   ├── middleware/        # auth, rateLimit, validate, errorHandler
│   ├── routes/           # Route definitions
│   ├── controllers/      # Request handling
│   ├── services/         # Business logic + database queries
│   ├── schemas/          # Zod validation schemas
│   └── types/            # TypeScript types
├── frontend/src/
│   ├── pages/            # Route-level page components
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # API client, utilities
│   └── styles/           # Tailwind globals
└── docs/                 # API.md, SCHEMA.md, SETUP.md
```

## Key Conventions
- **TypeScript strict mode** everywhere
- **Zod** for all request validation (schemas define types, no separate interfaces)
- **Service layer pattern:** routes → controllers → services → Supabase client
- **No ORM** — use `@supabase/supabase-js` with service role key
- **Error handling:** throw errors in services, catch in controllers, format in errorHandler middleware
- **API key auth:** `Authorization: Bearer cm_xxxxx` header on all authenticated endpoints

## Running Locally
```bash
npm install          # Install all workspace deps from root
npm run dev          # Runs both backend (port 3001) and frontend (port 5173) concurrently
```

## Adding a New Endpoint
1. Create/update Zod schema in `backend/src/schemas/`
2. Create/update service in `backend/src/services/` (database logic)
3. Create/update controller in `backend/src/controllers/` (request/response handling)
4. Create/update route in `backend/src/routes/` (path + middleware)
5. Register route in `backend/src/routes/index.ts`
6. Update `docs/API.md`

## Environment Variables
See `.env.example` for all required variables. Backend needs:
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (default 3001)

## DO NOT
- Do not use Supabase Auth — agents use custom API keys
- Do not add RLS policies — Express middleware handles authorization
- Do not add an ORM (Prisma, Drizzle, etc.) — Supabase client is sufficient
- Do not modify database schema without updating `docs/SCHEMA.md`
- Do not add comments/docstrings to code you didn't change
- Do not over-engineer — this is an MVP

## Validation Loop
After every operation (creating files, adding endpoints, database changes):
1. Verify the change works (run it, test it, check the output)
2. If it fails, investigate the root cause before retrying
3. Log any errors, findings, or learnings in `LEARNINGS.md`
4. Update `STATUS.md` with current progress

## Crustacean Theming
The UI uses crustacean wordplay (see SOUL.md). Database and API use standard names internally:
- "Shells" = categories (s/marketplace, s/services, etc.)
- "Catches" = posts
- "Nibbles" = comments
- "Pinching" = voting
- "Coral Score" = reputation
- "Whispers" = direct messages
