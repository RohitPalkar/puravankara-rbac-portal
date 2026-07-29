# Puravankara RBAC Portal — Demo Guide

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@puravankara.com | Test@123 |

## Feature List

### Department Master
- Zone-scoped department CRUD
- Inline duplicate name detection with zone context
- Cascade clear on zone/department change
- Delete with impact summary + merge (same-zone only)
- Zone column on department list
- Search, filter, pagination

### User Management
- 3-step user creation wizard (Basic Info -> Project Mapping -> Organisation Details)
- Zone-filtered autocompletes for all lookups
- Permission profile configuration per role (Primary, Secondary, Buddy RM)
- Module/sub-module/project-level permission assignment
- Department Administrator designation with single-admin enforcement
- User detail page with Profile, Project Access, and Permissions tabs
- User CRUD with deactivate/reactivate

### Permission Matrix
- Role-scoped permission configuration
- Project + Role selector with cascade clear
- Permission tree with expand/collapse
- Select All / Clear All (whole-tree + sub-module)
- Sticky save bar with elevation shadow
- Search in left panel
- Success messages with role name + action count

### Dashboard
- 4 KPI cards (Total Users, Departments, Projects, Active Roles)
- 3 entity-scoped activity feeds (Recently Created Users, Updated Permissions, Recent Departments)
- System Status (Active Users/Projects/Departments)
- Quick Actions (Create User/Department/Project, Assign Permissions)
- Zone filter for scoped activity view
- Welcome banner with time-based greeting

### Project Management
- Project CRUD with responsive grid
- Row actions menu (edit/delete)
- Location mapping

## Module Overview

| Module | Path | Description |
|--------|------|-------------|
| Dashboard | /dashboard | KPIs, activity, system status, quick actions |
| Department Master | /dashboard/departments | Zone-scoped department management |
| User Management | /dashboard/users | User creation, editing, permission profiles |
| Permission Matrix | /dashboard/permission-matrix | Role-based permission assignment |
| Project Management | /dashboard/projects | Project CRUD |
| Zone Management | /dashboard/zones | Zone master data |
| Role Management | /dashboard/roles | Role master data |
| Settings | /dashboard/settings | System configuration |

## Known Limitations

1. **Employment Status**: Always defaults to "PERMANENT" on user creation. The frontend collects Active/Inactive but the employment status field is hardcoded.
2. **User Groups & Effective Dates**: Collected in the user creation wizard (step 3) but not sent to the API.
3. **Team Lead Search**: Searches locally from fetched results rather than server-side.
4. **Zone Filter Propagation**: The dashboard zone filter applies to activity feeds but not all dashboard sections in a unified way.
5. **Department Merge Candidates**: Derived from currently loaded table data — may miss valid targets when pagination is active.
6. **Permission Profile Edit**: The user detail page loads and displays permission profiles but editing/saving permissions from the detail view requires backend support for the `profiles` field in the `PATCH /users/:id` endpoint.

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (hosted Supabase instance already configured)

### Frontend
```bash
npm install
npm run build   # production build
npm run dev     # development server (port 5173)
```

### Backend
The backend is hosted at `https://puravankara-rbac-portal.onrender.com`. No local backend setup required for demo.

### Database
The database has been reset with only the Super Admin account active. To reset again:
```sql
-- Run the phase6_demo_reset migration on the Supabase project
```

### Environment
The API base URL is configured in `src/config-global.ts`. Default:
```
https://puravankara-rbac-portal.onrender.com
```

## Demo Flow

1. **Login** as admin@puravankara.com / Test@123
2. **Create a Zone** if none exist (or use existing North/South/West/East)
3. **Create Department** under a zone
4. **Create Roles** for the department (or use existing roles)
5. **Create a User** with permission profiles
6. **Assign Permissions** via Permission Matrix
7. **Verify** the user's access by logging in as the created user
8. **Demonstrate** the Dashboard KPIs and activity feeds
9. **Demonstrate** Department merge/delete with impact summary
