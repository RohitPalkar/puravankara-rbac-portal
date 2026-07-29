# Release Notes — v1.0.0-demo

## Overview
Demo-ready release of the Puravankara RBAC Portal. The database has been reset
with only the Super Admin account retained. All application data cleaned.
All system masters preserved. No mock APIs, no fake data, no placeholder logic.

## What's Included

### Features
- Zone-scoped Department CRUD with merge/delete impact summary
- 3-step User Creation Wizard with permission profiles
- User Detail page (Profile, Project Access, Permissions tabs)
- Role-based Permission Matrix with tree view
- Enterprise Dashboard (KPIs, activity feeds, system status, quick actions)
- Project Management
- Zone, Role, and Settings management

### Database State
- Users: 1 (Super Admin — admin@puravankara.com)
- Departments: 0 (clean slate)
- Projects: 0 (clean slate)
- Zones: 4 (North, South, West, East — preserved)
- Roles: 9 (SUPER_ADMIN + 8 sales/approval roles — preserved)
- Modules/SubModules/Actions: full system catalog preserved

### Fixes in This Release
- Permission profiles now properly sent during user creation (Phase 5)
- User detail page loads existing project access and permission profiles (Phase 5)
- Database reset migration creates missing permission_profiles tables
- Removed commented-out code artifact

## Deployment
1. Frontend: deploy `dist/` to any static host
2. Backend: already deployed at render.com
3. Database: Supabase project already configured

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@puravankara.com | Test@123 |
