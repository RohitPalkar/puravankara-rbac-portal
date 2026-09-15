# Setup Guide

## Prerequisites

- Node.js >= 20
- PostgreSQL 16+ (Supabase) or local Postgres 16 (port 5432)
- npm >= 10 or yarn 1.22.22
- Redis 7+ (optional, falls back to memory)

## Database Setup

Postgres is now primary (see `backend/src/config/database.config.ts:15` + `env.validation.ts:12`). MySQL legacy removed.

```bash
# Local Postgres (via docker-compose)
docker compose up -d postgres redis

# Or create DB manually
psql -U postgres -c "CREATE DATABASE puravankara_rbac_v3;"
```

Env is `DATABASE_URL` (Supabase pooler) or `DB_HOST/DB_USERNAME/DB_NAME`. See `backend/.env.example:8`.

- `synchronize: false` - migrations only (`npm run migration:run`)
- Default pool: `max 10` (prod 20), `statement_timeout` recommended

## Backend Setup

```bash
cd backend
npm install
npm run build                # Compile to dist/
npm run start:dev            # Development (watch mode)
npm run start:prod           # Production (from dist/)
```

Backend runs on **http://localhost:3000**

Swagger docs: `http://localhost:3000/api/v1/docs` (OpenAPI JSON at `/api/v1/docs-json`)

## Frontend Setup

```bash
# Frontend lives at root (Vite)
npm install
npm run dev                  # Development (HMR on port 8081, proxy /api -> 3000)
npm run build                # Production build to dist/
npm run preview              # Preview on port 4173 (for nginx)
```

## First Run

1. Start Postgres + Redis: `docker compose up -d`
2. `cd backend && npm run migration:run && npm run start:dev`
3. Wait for "Backend running on http://localhost:3000" + "Swagger docs at /api/v1/docs"
4. `npm run dev` (root, port 8081)
5. Open `http://localhost:8081`
6. Login: `admin@puravankara.com` / `Test@123` (super admin `ADMIN001`)

## What Gets Seeded

| Entity | Count | Details |
|--------|-------|---------|
| Levels | 4 | L1 Individual Contributor → L4 Dept Admin |
| Modules | 20+ | Dashboard, Masters, Users, Roles, EOI, Bookings, etc. |
| Actions | 53 | Create, List, View, Edit, Delete, Export, plus custom |
| SubModules | 39 | Zone/City/Dept/Level/Project/Brand Management, EOI sections, etc. |
| Zones | 4 | West, East, North, South |
| Project Phases | 3 | Phase 1, 2, 3 |
| User Groups | 3 | Closing RM, Team Admin, Dept Admin |
| Brands | 3 | Puravankara, Provident, Purva Land |
| Projects | 2 | Puravankara Electronic City, Provident Park Square |
| Departments | 5 | Administration, Sales, CRM, Finance, Operations |
| Roles | 13 | Super Admin, Admin, Sales Head/Manager/Exec, CRM Head/TL/Exec, etc. |
| Employee Directory | 9 | Employees across all departments |
| Super Admin | 1 | superadmin@puravankara.com / SuperAdmin@123 |

## Troubleshooting

### Backend fails to start
- Check MySQL is running: `mysql -u root -p -e "SELECT 1"`
- Verify credentials in `backend/src/config/database.config.ts`
- Check port 3000 is free: `lsof -i :3000`

### Seed doesn't run
- SeedService.onModuleInit runs on startup
- Checks `if (count > 0) return;` — delete tables or use fresh DB to re-seed
- To reset: `mysql -u root -p -e "DROP DATABASE puravankara_rbac; CREATE DATABASE puravankara_rbac;"`

### Frontend shows blank page
- Open browser console (F12)
- Check for CORS errors (backend must be on port 3000)
- API base URL is `/api` (relative, proxied by Vite)

### Login fails
- Wait for backend to finish seeding (5-10 seconds after startup)
- Check MySQL connection
- Verify credentials: `superadmin@puravankara.com` / `SuperAdmin@123`

### Port conflicts
- Backend default: 3000 (change in `.env` or `main.ts`)
- Frontend dev: 5174 (change in `vite.config.ts`)
