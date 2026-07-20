# API Coverage Matrix

> Generated: 2026-07-20 | Commit: `dbf9b2e` | Sprint: 0

## Legend

| Status | Meaning |
|--------|---------|
| ✅ | Fully covered — endpoints, service, types, hooks |
| ⚡ | Partially covered — some endpoints missing |
| ❌ | Not implemented |
| 🚫 | Excluded — archive/mock-only |

## Coverage by Module

### Core Infrastructure

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Auth | 6 | 6 | ✅ | ✅ | ✅ | ✅ |
| Health | 1 | 1 | — | — | — | ⚡ |
| Setup | 2 | 2 | ✅ | ✅ | ✅ | ✅ |

### User Management

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Users | 7 | 7 | ✅ | ✅ | ✅ | ✅ |
| User Roles | 3 | 3 | ✅ | ✅ | ✅ | ✅ |
| User Reporting Lines | 3 | 3 | ✅ | ✅ | ✅ | ✅ |
| User Zones | 3 | 3 | ✅ | ✅ | ✅ | ✅ |
| User Groups | 5 | 5 | ✅ | ✅ | ✅ | ✅ |

### Geography

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Cities | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Zones | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| City-Zone Mappings | 3 | 3 | ✅ | ✅ | ✅ | ✅ |

### Brands, Phases, Channel Partners

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Brands | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Phases | 6 | 6 | ✅ | ✅ | ✅ | ✅ |
| Channel Partner Types | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Channel Partners | 5 | 5 | ✅ | ✅ | ✅ | ✅ |

### Projects & Product Catalog

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Projects | 4 | 4 | ✅ | ✅ | ✅ | ✅ |
| Project Locations | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Modules | 6 | 6 | ✅ | ✅ | ✅ | ✅ |
| Sub Modules | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Actions | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Module-Actions | 5 | 5 | ✅ | ✅ | ✅ | ✅ |

### Organization

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Departments | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Roles | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Department Roles | 3 | 3 | ✅ | ✅ | ✅ | ✅ |

### Permissions

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Permissions | 6 | 6 | ✅ | ✅ | ✅ | ✅ |
| Permission Templates | 8 | 8 | ✅ | ✅ | ✅ | ✅ |
| Role-Project Permissions | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| User Permission Overrides | 4 | 4 | ✅ | ✅ | ✅ | ✅ |

### Project Access

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| User Project Access | 4 | 4 | ✅ | ✅ | ✅ | ✅ |
| Project Groups | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Group Projects | 3 | 3 | ✅ | ✅ | ✅ | ✅ |
| User Project Groups | 3 | 3 | ✅ | ✅ | ✅ | ✅ |

### Workflows

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Workflows | 5 | 5 | ✅ | ✅ | ✅ | ✅ |
| Approvals | 4 | 4 | ✅ | ✅ | ✅ | ✅ |

### Delegations

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Delegations | 5 | 5 | ✅ | ✅ | ✅ | ✅ |

### Notifications

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Notifications | 6 | 6 | ✅ | ✅ | ✅ | ✅ |

### Audit

| Module | BE Endpoints | API Endpoints | Service | Types | Hooks | Status |
|--------|:-----------:|:------------:|:-------:|:----:|:-----:|:------:|
| Audit Logs | 1 | 1 | ✅ | ✅ | ✅ | ✅ |

## Summary

| Metric | Count |
|--------|:-----:|
| Backend controllers | 37 |
| Backend API endpoints | ~163 |
| Frontend endpoint definitions | 163 |
| Service modules | 17 |
| Hook modules | 17 |
| Type definition files | 21 |
| Modules fully covered (✅) | 35 / 36 |
| Modules partially covered | 1 (Health — no service/hooks needed) |

## Archived / Excluded

| Path | Contents | Status |
|------|----------|:------:|
| `archive/fe/` | Old MUI-based frontend (all files) | 🚫 Archived |
| `archive/frontend/` | Old shadcn-based frontend (all files) | 🚫 Archived |
| `archive/docs/` | Stale reports, orphaned migrations | 🚫 Archived |
