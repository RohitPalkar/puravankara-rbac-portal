# Puravankara RBAC Portal

Enterprise Role Based Access Control (RBAC) Portal for managing users, projects, departments, roles, permissions, and project-level access.

This repository contains:

- Backend API
- Frontend Web Application
- Database Schema & Migrations
- Technical Documentation

---

## Project Overview

Puravankara Portal is an internal enterprise platform designed to manage role-based access across multiple projects, departments, and business modules.

The system provides:

- User Management
- Department Management
- Role Management
- Project Management
- Project Access Assignment
- Module & Sub Module Management
- Permission Matrix
- User Level Permission Override
- Reporting Hierarchy Management


---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Component Based Architecture

Deployment:

```
Vercel
```

---

### Backend

- Node.js
- NestJS
- TypeScript
- REST API Architecture
- JWT Authentication
- RBAC Authorization

Deployment:

```
Render
```

---

### Database

- PostgreSQL
- Supabase

Database includes:

- Master Data
- User Management
- RBAC Permissions
- Project Access Mapping

Deployment:

```
Supabase PostgreSQL
```

---

# Repository Structure


```bash
puravankara-portal/

├── backend/
│
│   Backend API source code
│
│   ├── src/
│   ├── docs/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
│
├── frontend/
│
│   Frontend application source code
│
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
│
├── database/
│
│   Database related files
│
│   ├── migrations/
│   ├── seed-data/
│   ├── schema.sql
│   └── FINAL-RBAC-DB.pdf
│
│
├── docs/
│
│   Project Documentation
│
│   ├── PROJECT_OVERVIEW.md
│   ├── DATABASE_MAPPING.md
│   ├── MODULE_MAPPING.md
│   ├── API_CONTRACT.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── OPENCODE_CONTEXT.md
│
│
└── README.md
```

---

# Core Database Modules


## Location Management

Tables:

```
zones
cities
city_zone_mappings
```


---

## Project Management


Tables:

```
projects
project_locations
```


---

## Department & Role Management


Tables:

```
departments
roles
department_roles
```


---

## User Management


Tables:

```
users
user_reporting_lines
user_project_access
```


---

## RBAC Management


Tables:

```
modules
sub_modules
actions
role_permissions
user_project_permissions
```


---

# Authentication Flow


User Login

↓

JWT Token Generation

↓

Fetch User Role

↓

Fetch Assigned Projects

↓

Resolve Permissions

↓

Allow / Restrict Actions


---

# Permission Flow


Priority:


```
User Specific Permission

        ↓

Role Permission

        ↓

Project Access

        ↓

Default Deny
```


Example:


User:

```
John
```

Role:

```
Sales Manager
```


Project Access:

```
Project A
Project B
```


Permissions:

```
Dashboard
    READ

Customers
    CREATE
    UPDATE
    DELETE
```


---

# Backend Setup


Navigate:


```bash
cd backend
```


Install dependencies:


```bash
npm install
```


Create environment:


```bash
cp .env.example .env
```


Start development:


```bash
npm run start:dev
```


Backend URL:


```bash
http://localhost:3000
```


---


# Frontend Setup


Navigate:


```bash
cd frontend
```


Install dependencies:


```bash
npm install
```


Create environment:


```bash
cp .env.example .env
```


Run:


```bash
npm run dev
```


Frontend URL:


```bash
http://localhost:5173
```


---


# Environment Variables


Backend Example:


```env
DATABASE_URL=

JWT_SECRET=

PORT=3000
```


Frontend Example:


```env
VITE_API_URL=http://localhost:3000
```


---


# Development Rules


## Backend


- Follow existing architecture
- Keep modules separated
- Database schema is source of truth
- Do not create duplicate entities
- Maintain API consistency


---

## Frontend


Reuse existing:

- Layout
- Sidebar
- Header
- Tables
- Forms
- Dialogs
- Components


Do not redesign existing approved UI.


---

# API Pattern


Standard Response:


```json
{
    "statusCode":200,
    "message":"Success",
    "data":{}
}
```


---

# Deployment


## Frontend


Platform:

```
Vercel
```


Build:

```bash
npm run build
```


---

## Backend


Platform:

```
Render
```


Build:


```bash
npm install
npm run build
```


Start:


```bash
npm run start:prod
```


---

## Database


Platform:

```
Supabase PostgreSQL
```


Required:

- Run migrations
- Run seed data
- Configure environment variables


---


# Development Workflow


1. Analyze existing backend
2. Analyze existing frontend
3. Match database schema
4. Build API modules
5. Connect frontend APIs
6. Test RBAC flows
7. Deploy backend
8. Deploy frontend


---

# Current Development Priority


Phase 1:

- Authentication
- Master CRUD
- User Management


Phase 2:

- Project Assignment
- Role Mapping
- Permission Matrix


Phase 3:

- Audit
- Logs
- Production Optimization


---


# Maintainers


Puravankara Portal Development Team

```
Internal Enterprise Application
```
