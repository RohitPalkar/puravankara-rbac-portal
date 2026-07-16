# Puravankara RBAC Administration Platform

Enterprise Role-Based Access Control administration platform with dynamic DB-driven permissions, master CRUD, user management, 3-step user creation wizard, permission matrix builder, and project access control.

Built for real-estate organizations where department-based access, multi-level hierarchy, and project scoping are first-class requirements.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, TypeORM, MySQL 8, JWT, Passport, bcrypt |
| Frontend | React 19, MUI 9, Redux Toolkit, React Router 7, Vite 8, Axios, MUI X DataGrid |
| Language | TypeScript |

## Quick Start

```bash
# 1. Ensure MySQL is running and create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS puravankara_rbac;"

# 2. Configure backend/.env or backend/src/config/database.config.ts
#    Default: root / YourStrongPassword123! / localhost:3306 / puravankara_rbac

# 3. Backend
cd backend
npm install
npm run start:dev          # Runs on http://localhost:3000 (auto-seeds data)

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev                # Runs on http://localhost:5174
```

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@puravankara.com | SuperAdmin@123 |

Data is auto-seeded on first startup (levels, modules, actions, zones, brands, departments, roles, employee directory).

## Key Features

- **JWT Authentication** — Email + password login with bcrypt, 24h expiry
- **Dynamic RBAC** — Department → Level → Role → Module → SubModule → Action hierarchy
- **Two-Layer Permission Model** — WHAT (role template) + WHERE (project scope) = Effective access
- **Super Admin Bypass** — Full access across all modules and actions
- **Dynamic Sidebar** — Navigation filtered by user permissions at runtime
- **Master CRUD** — 8 reusable master data pages (Zones, Cities, Departments, Levels, Roles, Brands, Projects, Phases, User Groups)
- **Permission Matrix Builder** — Visual tree-based permission configuration per department+role with cascading checkboxes
- **User Creation Wizard** — 3-step flow: Identity lookup → Organization → Project Access
- **Project Access Matrix** — Per-user project-level module/action access control
- **Flat Module Support** — Modules with direct actions (no sub-modules) and hierarchical modules coexist
- **Multi-Role Support** — Primary + secondary role assignments with runtime role switching
- **Enterprise UI** — Responsive, breadcrumbs, custom stepper, metric cards, skeleton loading, snackbar notifications
- **Seed Data** — Auto-seeds 5 departments, 13 roles, 9 employees, 20+ modules, 50+ actions

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React 19)                          │
│  Components  │  Pages  │  Hooks  │  Redux  │  Guards        │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / JWT
┌──────────────────────────▼──────────────────────────────────┐
│                  Backend (NestJS 11)                          │
│  Controllers  │  Services  │  Guards  │  Interceptors       │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL
┌──────────────────────────▼──────────────────────────────────┐
│                  MySQL 8 Database                             │
│  20 Tables  │  Soft Delete  │  Foreign Keys  │  Indexes     │
└─────────────────────────────────────────────────────────────┘
```

### Permission Resolution

```
User
  → Department + Level + Role
    → Permission Template (dept_role_module_mappings)
      → WHAT actions can the role perform?
        → Project Scope (user_project_module_access)
          → WHERE can the user perform them?
            → EFFECTIVE PERMISSION = Role ∩ Project
```

## API Base Path

All APIs: `http://localhost:3000/api/`. Frontend uses relative `/api/` via Vite proxy.

## Response Format

All responses follow: `{ statusCode, message, data, meta }`

## Build

```bash
cd backend  && npm run build    # NestJS → dist/
cd frontend && npm run build    # Vite → dist/
```

## Documentation

| Document | Description |
|----------|-------------|
| `docs/DEMO_SYSTEM_OVERVIEW.md` | Problem statement, solution overview, high-level architecture |
| `docs/ARCHITECTURE_WALKTHROUGH.md` | Layered architecture, frontend/backend structure, request lifecycle, data flow |
| `docs/RBAC_ENGINE_EXPLAINED.md` | Two-layer permission model, resolution algorithm, guard chain |
| `docs/DATABASE_WALKTHROUGH.md` | Entity groups (Organization, Identity, Security, Permissions), relationships, indexes |
| `docs/API_OVERVIEW.md` | API groups: Auth, Masters, Users, Permissions, Dashboard |
| `docs/DEMO_SCRIPT.md` | 8-sequence end-to-end demo walkthrough |
| `docs/TECHNICAL_QA.md` | 12 technical questions covering scalability, SSO, extensibility, debugging |
| `docs/DEVELOPER_HANDOFF.md` | Setup, folder structure, adding masters/modules/actions, RBAC debugging |
| `docs/ARCHITECTURE.md` | FE + BE architecture, module structure, data flow |
| `docs/RBAC_FLOW.md` | Permission resolution, role hierarchy, security |
| `docs/DATABASE.md` | Entity relationships, foreign keys, indexes |
| `docs/DEMO_FLOW.md` | End-to-end business journey walkthrough |
| `docs/SETUP.md` | Installation and troubleshooting guide |

## Project Structure

```
puravankara-rbac-admin/
├── backend/           # NestJS API server (port 3000)
│   └── src/
│       ├── common/    # Guards, decorators, filters, interceptors
│       ├── config/    # Database and JWT config
│       └── modules/   # 18 feature modules
├── frontend/          # React SPA (port 5174)
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── hooks/       # useAuth, useCrudList, useSidebar, useSnackbar
│       ├── pages/       # 12 page components
│       ├── services/    # Axios API client
│       ├── store/       # Redux (auth slice)
│       └── types/       # TypeScript interfaces
└── docs/              # Complete documentation suite
```
