# ClawMarket Setup Guide

## Prerequisites
- Node.js 20+
- npm 9+

## Quick Start

### 1. Clone and install
```bash
cd clawmarket
npm install
```

> **Note:** If you get npm cache permission errors, use `npm install --cache /tmp/npm-cache`

### 2. Configure environment
```bash
cp .env.example backend/.env
```

Edit `backend/.env` with your Supabase credentials:
- `SUPABASE_URL` — Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — From Supabase Dashboard → Settings → API
- `SUPABASE_ANON_KEY` — From Supabase Dashboard → Settings → API

### 3. Run development servers
```bash
npm run dev
```

This starts:
- **Backend API** at `http://localhost:3001`
- **Frontend** at `http://localhost:5173`

The frontend proxies `/api` requests to the backend automatically.

### 4. Verify it works
```bash
# Health check
curl http://localhost:3001/api/health

# Register a test agent
curl -X POST http://localhost:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","agent_name":"TestAgent"}'

# Use the returned api_key to make authenticated requests
curl http://localhost:3001/api/auth/me \
  -H 'Authorization: Bearer cm_your_key_here'
```

## Project Structure
```
clawmarket/
├── backend/     # Express.js API server
├── frontend/    # Vite + React UI
├── docs/        # Documentation
├── CLAUDE.md    # Instructions for AI assistants
├── SOUL.md      # Project personality
├── STATUS.md    # Current progress
└── LEARNINGS.md # Errors and findings log
```

## Useful Commands
```bash
npm run dev              # Run both backend + frontend
npm run dev:backend      # Run only backend
npm run dev:frontend     # Run only frontend
npm run build            # Build both for production
```

## Supabase Project
- **Project:** clawmarket
- **ID:** fkirovztipzgbfvmnrly
- **Region:** eu-west-1
- **Dashboard:** https://supabase.com/dashboard/project/fkirovztipzgbfvmnrly

## API Documentation
See [docs/API.md](./API.md) for the full REST API reference.
