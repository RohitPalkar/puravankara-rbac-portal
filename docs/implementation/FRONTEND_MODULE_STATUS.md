# Frontend Module Status

> Generated: 2026-07-20 | Commit: `dbf9b2e` | Sprint: 0

## Module Readiness for API Wiring

Each module is assessed for readiness to switch from mock data to live API calls.

### ✅ Ready for Wiring

Modules with complete API infrastructure (endpoints + service + types + hooks):

| Module | Endpoints | Service | Types | Hooks | BE Live |
|--------|:---------:|:-------:|:-----:|:-----:|:-------:|
| Auth | ✅ | ✅ | ✅ | ✅ | ✅ |
| Setup | ✅ | ✅ | ✅ | ✅ | ✅ |
| Brands | ✅ | ✅ | ✅ | ✅ | ✅ |
| Phases | ✅ | ✅ | ✅ | ✅ | ✅ |
| Channel Partner Types | ✅ | ✅ | ✅ | ✅ | ✅ |
| Channel Partners | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Groups | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cities | ✅ | ✅ | ✅ | ✅ | ✅ |
| Zones | ✅ | ✅ | ✅ | ✅ | ✅ |
| City-Zone Mappings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projects | ✅ | ✅ | ✅ | ✅ | ✅ |
| Project Locations | ✅ | ✅ | ✅ | ✅ | ✅ |
| Departments | ✅ | ✅ | ✅ | ✅ | ✅ |
| Roles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Department Roles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modules | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sub Modules | ✅ | ✅ | ✅ | ✅ | ✅ |
| Actions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Module-Actions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Permissions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Permission Templates | ✅ | ✅ | ✅ | ✅ | ✅ |
| Role-Project Perms | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Permission Overrides | ✅ | ✅ | ✅ | ✅ | ✅ |
| Project Groups | ✅ | ✅ | ✅ | ✅ | ✅ |
| Project Access | ✅ | ✅ | ✅ | ✅ | ✅ |
| Group Projects | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Project Groups | ✅ | ✅ | ✅ | ✅ | ✅ |
| Workflows | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approvals | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delegations | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audit Logs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Roles | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Reporting Lines | ✅ | ✅ | ✅ | ✅ | ✅ |
| User Zones | ✅ | ✅ | ✅ | ✅ | ✅ |

### ⚠️ Still Using Mock Data (28 section files)

| Section | File(s) | Mock Source |
|---------|---------|:-----------:|
| Auth | `src/auth/context/jwt/action.ts` | Inline mock logic |
| Login | `src/auth/view/jwt/jwt-sign-in-view.tsx` | Inline mock logic |
| Permissions | `src/sections/permissions/*` | `src/services/mock-data.ts` |
| Brands | `src/sections/brands/*` | `src/services/mock-data.ts` |
| Geography | `src/sections/geography/*` | `src/services/mock-data.ts` |
| Organization | `src/sections/organization/*` | `src/services/mock-data.ts` |
| Projects | `src/sections/projects/*` | `src/services/mock-data.ts` |
| Users | `src/sections/users/*` | `src/services/mock-data.ts` |
| Workflows | `src/sections/workflow/*` | `src/services/mock-data.ts` |
| Product Config | `src/sections/product-config/*` | `src/services/mock-data.ts` |
| System | `src/sections/system/*` | `src/services/mock-data.ts` |
| Apps | `src/sections/apps/*` | `src/services/mock-data.ts` |
| Access | `src/sections/access/*` | `src/services/mock-data.ts` |

## Build Status

| Check | Result |
|-------|:------:|
| TypeScript (`tsc --noEmit`) | ✅ Passes (0 errors) |
| ESLint | ✅ Passes (2 pre-existing warnings in `errors.ts`) |

## API Infrastructure

| Layer | Files | Description |
|-------|:-----:|-------------|
| `src/services/api/` | 7 | HTTP client, endpoints, errors, response helpers, CRUD factory, query keys |
| `src/services/types/` | 21 | TypeScript interfaces and enums for all DTOs |
| `src/services/services/` | 18 | Domain service objects (CRUD + custom methods) |
| `src/services/hooks/` | 19 | TanStack Query hooks (auto cache invalidation) |

## Architecture

```
src/services/
├── api/          ← Axios client, endpoint paths, error classes, CRUD factory, query keys
├── types/        ← TypeScript interfaces matching backend DTOs
├── services/     ← Domain service objects composing api/ calls
└── hooks/        ← TanStack Query wrappers with cache management
```
