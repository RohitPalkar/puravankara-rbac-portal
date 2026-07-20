# Endpoint Inventory

> Generated: 2026-07-20 | Commit: `dbf9b2e` | Sprint: 0

All routes are prefixed with `/api/v1`. Backend deployed at `https://puravankara-rbac-portal.onrender.com`.

## Auth

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| POST | `/auth/login` | ✅ | ✅ | ✅ |
| POST | `/auth/refresh` | ✅ | ✅ | ✅ |
| POST | `/auth/logout` | ✅ | ✅ | ✅ |
| POST | `/auth/logout-all` | ✅ | ✅ | ✅ |
| POST | `/auth/set-password` | ✅ | ✅ | ✅ |
| GET | `/auth/me` | ✅ | ✅ | ✅ |

## Setup

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/setup/status` | ✅ | ✅ | ✅ |
| POST | `/setup/reset` | ✅ | ✅ | ✅ |

## Users

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/users` | ✅ | ✅ | ✅ |
| GET | `/users/:id` | ✅ | ✅ | ✅ |
| POST | `/users` | ✅ | ✅ | ✅ |
| POST | `/users/full` | ✅ | ✅ | ✅ |
| POST | `/users/fetch-employee` | ✅ | ✅ | ✅ |
| PATCH | `/users/:id` | ✅ | ✅ | ✅ |
| DELETE | `/users/:id` | ✅ | ✅ | ✅ |
| GET | `/user-roles/:userId` | ✅ | ✅ | ✅ |
| POST | `/user-roles` | ✅ | ✅ | ✅ |
| DELETE | `/user-roles/:userId/department/:departmentId/role/:roleId` | ✅ | ✅ | ✅ |
| GET | `/user-reporting-lines/:userId` | ✅ | ✅ | ✅ |
| POST | `/user-reporting-lines` | ✅ | ✅ | ✅ |
| DELETE | `/user-reporting-lines/:userId/reports-to/:reportsToUserId/level/:levelRank` | ✅ | ✅ | ✅ |
| GET | `/user-zones/:userId` | ✅ | ✅ | ✅ |
| POST | `/user-zones` | ✅ | ✅ | ✅ |
| DELETE | `/user-zones/:userId/zone/:zoneId` | ✅ | ✅ | ✅ |

## User Groups

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/user-groups` | ✅ | ✅ | ✅ |
| GET | `/user-groups/:id` | ✅ | ✅ | ✅ |
| POST | `/user-groups` | ✅ | ✅ | ✅ |
| PATCH | `/user-groups/:id` | ✅ | ✅ | ✅ |
| DELETE | `/user-groups/:id` | ✅ | ✅ | ✅ |

## Brands

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/brands` | ✅ | ✅ | ✅ |
| GET | `/brands/:id` | ✅ | ✅ | ✅ |
| POST | `/brands` | ✅ | ✅ | ✅ |
| PATCH | `/brands/:id` | ✅ | ✅ | ✅ |
| DELETE | `/brands/:id` | ✅ | ✅ | ✅ |

## Phases

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/phases` | ✅ | ✅ | ✅ |
| GET | `/phases/:id` | ✅ | ✅ | ✅ |
| POST | `/phases` | ✅ | ✅ | ✅ |
| PATCH | `/phases/:id` | ✅ | ✅ | ✅ |
| DELETE | `/phases/:id` | ✅ | ✅ | ✅ |
| PUT | `/phases/:id/launch` | ✅ | ✅ | ✅ |

## Channel Partners

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/channel-partner-types` | ✅ | ✅ | ✅ |
| GET | `/channel-partner-types/:id` | ✅ | ✅ | ✅ |
| POST | `/channel-partner-types` | ✅ | ✅ | ✅ |
| PATCH | `/channel-partner-types/:id` | ✅ | ✅ | ✅ |
| DELETE | `/channel-partner-types/:id` | ✅ | ✅ | ✅ |
| GET | `/channel-partners` | ✅ | ✅ | ✅ |
| GET | `/channel-partners/:id` | ✅ | ✅ | ✅ |
| POST | `/channel-partners` | ✅ | ✅ | ✅ |
| PATCH | `/channel-partners/:id` | ✅ | ✅ | ✅ |
| DELETE | `/channel-partners/:id` | ✅ | ✅ | ✅ |

## Geography

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/cities` | ✅ | ✅ | ✅ |
| GET | `/cities/:id` | ✅ | ✅ | ✅ |
| POST | `/cities` | ✅ | ✅ | ✅ |
| PATCH | `/cities/:id` | ✅ | ✅ | ✅ |
| DELETE | `/cities/:id` | ✅ | ✅ | ✅ |
| GET | `/zones` | ✅ | ✅ | ✅ |
| GET | `/zones/:id` | ✅ | ✅ | ✅ |
| POST | `/zones` | ✅ | ✅ | ✅ |
| PATCH | `/zones/:id` | ✅ | ✅ | ✅ |
| DELETE | `/zones/:id` | ✅ | ✅ | ✅ |
| GET | `/city-zone-mappings` | ✅ | ✅ | ✅ |
| POST | `/city-zone-mappings` | ✅ | ✅ | ✅ |
| DELETE | `/city-zone-mappings/:cityId/zone/:zoneId` | ✅ | ✅ | ✅ |

## Projects

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/projects` | ✅ | ✅ | ✅ |
| GET | `/projects/:id` | ✅ | ✅ | ✅ |
| POST | `/projects` | ✅ | ✅ | ✅ |
| PATCH | `/projects/:id` | ✅ | ✅ | ✅ |
| DELETE | `/projects/:id` | ✅ | ✅ | ✅ |
| GET | `/project-locations` | ✅ | ✅ | ✅ |
| GET | `/project-locations/:projectId` | ✅ | ✅ | ✅ |
| GET | `/project-locations/zone/:zoneId` | ✅ | ✅ | ✅ |
| POST | `/project-locations` | ✅ | ✅ | ✅ |
| DELETE | `/project-locations/:projectId/city/:cityId/zone/:zoneId` | ✅ | ✅ | ✅ |

## Organization

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/departments` | ✅ | ✅ | ✅ |
| GET | `/departments/:id` | ✅ | ✅ | ✅ |
| POST | `/departments` | ✅ | ✅ | ✅ |
| PATCH | `/departments/:id` | ✅ | ✅ | ✅ |
| DELETE | `/departments/:id` | ✅ | ✅ | ✅ |
| GET | `/roles` | ✅ | ✅ | ✅ |
| GET | `/roles/:id` | ✅ | ✅ | ✅ |
| POST | `/roles` | ✅ | ✅ | ✅ |
| PATCH | `/roles/:id` | ✅ | ✅ | ✅ |
| DELETE | `/roles/:id` | ✅ | ✅ | ✅ |
| GET | `/department-roles` | ✅ | ✅ | ✅ |
| POST | `/department-roles` | ✅ | ✅ | ✅ |
| DELETE | `/department-roles/:departmentId/role/:roleId` | ✅ | ✅ | ✅ |

## Product Catalog

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/modules` | ✅ | ✅ | ✅ |
| GET | `/modules/:id` | ✅ | ✅ | ✅ |
| GET | `/modules/tree` | ✅ | ✅ | ✅ |
| POST | `/modules` | ✅ | ✅ | ✅ |
| PATCH | `/modules/:id` | ✅ | ✅ | ✅ |
| DELETE | `/modules/:id` | ✅ | ✅ | ✅ |
| GET | `/sub-modules` | ✅ | ✅ | ✅ |
| GET | `/sub-modules/:id` | ✅ | ✅ | ✅ |
| POST | `/sub-modules` | ✅ | ✅ | ✅ |
| PATCH | `/sub-modules/:id` | ✅ | ✅ | ✅ |
| DELETE | `/sub-modules/:id` | ✅ | ✅ | ✅ |
| GET | `/actions` | ✅ | ✅ | ✅ |
| GET | `/actions/:id` | ✅ | ✅ | ✅ |
| POST | `/actions` | ✅ | ✅ | ✅ |
| PATCH | `/actions/:id` | ✅ | ✅ | ✅ |
| DELETE | `/actions/:id` | ✅ | ✅ | ✅ |
| GET | `/module-actions` | ✅ | ✅ | ✅ |
| GET | `/module-actions/:id` | ✅ | ✅ | ✅ |
| POST | `/module-actions` | ✅ | ✅ | ✅ |
| PATCH | `/module-actions/:id` | ✅ | ✅ | ✅ |
| DELETE | `/module-actions/:id` | ✅ | ✅ | ✅ |

## Permissions

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/permissions/me` | ✅ | ✅ | ✅ |
| GET | `/permissions/user/:userId` | ✅ | ✅ | ✅ |
| POST | `/permissions/compile/:userId` | ✅ | ✅ | ✅ |
| POST | `/permissions/compile/:userId/:projectId` | ✅ | ✅ | ✅ |
| GET | `/permissions/snapshot/:userId/:projectId` | ✅ | ✅ | ✅ |
| POST | `/permissions/explain` | ✅ | ✅ | ✅ |
| GET | `/permission-templates` | ✅ | ✅ | ✅ |
| GET | `/permission-templates/:id` | ✅ | ✅ | ✅ |
| POST | `/permission-templates` | ✅ | ✅ | ✅ |
| PATCH | `/permission-templates/:id` | ✅ | ✅ | ✅ |
| DELETE | `/permission-templates/:id` | ✅ | ✅ | ✅ |
| GET | `/permission-templates/:id/permissions` | ✅ | ✅ | ✅ |
| POST | `/permission-templates/:id/permissions` | ✅ | ✅ | ✅ |
| GET | `/role-project-permissions` | ✅ | ✅ | ✅ |
| GET | `/role-project-permissions/role/:roleId` | ✅ | ✅ | ✅ |
| GET | `/role-project-permissions/role/:roleId/project/:projectId` | ✅ | ✅ | ✅ |
| POST | `/role-project-permissions` | ✅ | ✅ | ✅ |
| DELETE | `/role-project-permissions/:id` | ✅ | ✅ | ✅ |
| GET | `/user-permission-overrides/:userId` | ✅ | ✅ | ✅ |
| GET | `/user-permission-overrides/:userId/project/:projectId` | ✅ | ✅ | ✅ |
| POST | `/user-permission-overrides` | ✅ | ✅ | ✅ |
| DELETE | `/user-permission-overrides/:id` | ✅ | ✅ | ✅ |

## Project Access

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/user-project-access/:userId` | ✅ | ✅ | ✅ |
| POST | `/user-project-access` | ✅ | ✅ | ✅ |
| POST | `/user-project-access/bulk` | ✅ | ✅ | ✅ |
| DELETE | `/user-project-access/:userId/project/:projectId` | ✅ | ✅ | ✅ |
| GET | `/project-groups` | ✅ | ✅ | ✅ |
| GET | `/project-groups/:id` | ✅ | ✅ | ✅ |
| POST | `/project-groups` | ✅ | ✅ | ✅ |
| PATCH | `/project-groups/:id` | ✅ | ✅ | ✅ |
| DELETE | `/project-groups/:id` | ✅ | ✅ | ✅ |
| GET | `/project-group-projects/:groupId` | ✅ | ✅ | ✅ |
| POST | `/project-group-projects` | ✅ | ✅ | ✅ |
| DELETE | `/project-group-projects/:groupId/project/:projectId` | ✅ | ✅ | ✅ |
| GET | `/user-project-groups/:userId` | ✅ | ✅ | ✅ |
| POST | `/user-project-groups` | ✅ | ✅ | ✅ |
| DELETE | `/user-project-groups/:userId/group/:groupId` | ✅ | ✅ | ✅ |

## Workflows

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/workflows` | ✅ | ✅ | ✅ |
| GET | `/workflows/:id` | ✅ | ✅ | ✅ |
| POST | `/workflows` | ✅ | ✅ | ✅ |
| GET | `/workflows/:id/steps` | ✅ | ✅ | ✅ |
| POST | `/workflows/:workflowId/submit` | ✅ | ✅ | ✅ |
| GET | `/approvals/pending` | ✅ | ✅ | ✅ |
| GET | `/approvals/submitted` | ✅ | ✅ | ✅ |
| GET | `/approvals/:id` | ✅ | ✅ | ✅ |
| POST | `/approvals/:requestId/action` | ✅ | ✅ | ✅ |

## Delegations

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/delegations` | ✅ | ✅ | ✅ |
| GET | `/delegations/:id` | ✅ | ✅ | ✅ |
| POST | `/delegations` | ✅ | ✅ | ✅ |
| PATCH | `/delegations/:id` | ✅ | ✅ | ✅ |
| DELETE | `/delegations/:id` | ✅ | ✅ | ✅ |

## Notifications

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/notifications` | ✅ | ✅ | ✅ |
| GET | `/notifications/count` | ✅ | ✅ | ✅ |
| GET | `/notifications/preferences` | ✅ | ✅ | ✅ |
| PATCH | `/notifications/preferences` | ✅ | ✅ | ✅ |
| PATCH | `/notifications/:id/read` | ✅ | ✅ | ✅ |
| PATCH | `/notifications/read-all` | ✅ | ✅ | ✅ |

## Audit

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/audit-logs` | ✅ | ✅ | ✅ |

## Health

| Method | Path | Service | Hook | Status |
|--------|------|:-------:|:----:|:------:|
| GET | `/health` | — | — | ✅ (BE only) |
