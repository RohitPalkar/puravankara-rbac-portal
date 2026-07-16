# Setup Guide

## Prerequisites

- Node.js >= 20
- MySQL 8+ running locally (port 3306)
- npm >= 10

## Database Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS puravankara_rbac;"
```

Default connection config (`backend/src/config/database.config.ts`):

| Setting | Default |
|---------|---------|
| Host | localhost |
| Port | 3306 |
| Username | root |
| Password | YourStrongPassword123! |
| Database | puravankara_rbac |
| Synchronize | true (auto-creates tables) |

To override, set environment variables or edit `database.config.ts`.

## Backend Setup

```bash
cd backend
npm install
npm run build                # Compile to dist/
npm run start:dev            # Development (watch mode)
npm run start:prod           # Production (from dist/)
```

Backend runs on **http://localhost:3000**

Swagger docs: `http://localhost:3000/api/docs`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev                  # Development (HMR on port 5174)
npm run build                # Production build to dist/
npm run preview              # Preview production build
```

## First Run

1. Start MySQL
2. `cd backend && npm run start:dev`
3. Wait for "Backend running on http://localhost:3000" (auto-seeds data)
4. `cd frontend && npm run dev`
5. Open `http://localhost:5174`
6. Login: `superadmin@puravankara.com` / `SuperAdmin@123`

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
