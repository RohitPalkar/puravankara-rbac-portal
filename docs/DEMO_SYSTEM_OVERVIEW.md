# System Overview — Enterprise RBAC Administration Platform

## Problem Statement

Managing enterprise user access in a real-estate organization requires handling multiple interacting dimensions:

- **Multi-level hierarchy** — Individual contributors report to managers, managers to department heads, department heads to administration. Each level has different access needs.
- **Department-based access** — Sales, CRM, Finance, and Operations teams operate in the same system but must never see each other's restricted data.
- **Project-based access** — A Sales Executive assigned to Project A in the South zone should not access Project B in the West zone unless explicitly authorized.
- **Dynamic permissions** — Roles change (promotions, transfers), projects launch and close, organizational structure evolves. Permission changes must take effect without redeployment.

Traditional approaches fail:
- Hard-coded role checks require code changes for every new permission.
- Static config files cannot adapt to organizational changes.
- Per-user permission lists do not scale beyond a handful of users.

## Solution: Master-Driven RBAC Platform

A configuration-driven, database-backed role-based access control system.

```
Configure once.
Assign users dynamically.
Permissions resolve automatically.
```

### Core Principle

The platform separates **what a role can do** (permission template) from **where a user can do it** (project scope). This allows the organization to:

1. **Define permission templates** once per department, level, and role combination.
2. **Assign users** to roles and projects through a guided wizard.
3. **Resolve permissions** at runtime by intersecting role permissions with project assignments.

### Key Differentiators

| Capability | Traditional Approach | This Platform |
|------------|-------------------|---------------|
| Permission definition | Code-level role checks | DB-driven templates with UI |
| Hierarchy management | Hard-coded levels | Department-configurable depth |
| Project scoping | Not supported | Per-user project-module matrix |
| New module addition | Code changes required | Master data entry only |
| Permission audit | Difficult | Queryable DB mappings |
| User onboarding | Manual setup | 3-step guided wizard |

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                       │
│  Login → Dashboard → Masters → Permissions → Users → CRUD   │
│  Permission Guards  │  Dynamic Sidebar  │  Redux State      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (JWT)
┌──────────────────────────▼──────────────────────────────────┐
│                   Backend (NestJS 11)                        │
│  Auth Module → Guard Chain → Controller → Service → DB      │
│  JWT Guard │ Permission Guard │ Transform Interceptor       │
└──────────────────────────┬──────────────────────────────────┘
                           │ SQL
┌──────────────────────────▼──────────────────────────────────┐
│                   MySQL 8 Database                           │
│  20 Tables │ Soft Delete │ Foreign Keys │ Indexes           │
└─────────────────────────────────────────────────────────────┘
```

## Users of the System

| Persona | Role in System | What They Do |
|---------|---------------|--------------|
| Super Admin | Full system access | Configure masters, create users, manage all permissions |
| Department Admin | Department-level admin | Manage their team's roles and access |
| Manager | Team supervisor | View team reports, approve workflows |
| Individual Contributor | End user | Access permitted modules for assigned projects |

## Flow Overview

```
1. Super Admin configures masters
   → Zones, Departments, Levels, Roles, Modules, Actions

2. Super Admin builds permission templates
   → Department + Level + Role → Module + SubModule + Action

3. Super Admin creates users via wizard
   → Step 1: Employee lookup
   → Step 2: Department, Role, Zone, Hierarchy
   → Step 3: Project access matrix

4. User logs in
   → JWT issued → Permissions calculated → Sidebar filtered

5. User works
   → Permission guards enforce access at page and action level
```

## Technology Decisions

| Decision | Rationale |
|----------|-----------|
| NestJS | Structured modular backend with built-in guard/interceptor pipeline |
| TypeORM + MySQL | Relational data model fits the hierarchical permission structure |
| React + MUI | Enterprise-grade component library with accessibility built in |
| Redux Toolkit | Predictable state management for auth and permissions |
| JWT | Stateless authentication suitable for REST API |
| Vite | Fast HMR and modern build pipeline |
