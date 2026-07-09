# Puravankara Enterprise RBAC API

Enterprise-grade RBAC + ABAC + Workflow + Audit + Notification platform built with NestJS.

## Architecture

```
┌─────────────────────────────────────────────┐
│           API Gateway (NestJS)               │
│  JWT Auth | Rate Limit | Helmet | CORS      │
├─────────────────────────────────────────────┤
│  Authentication  │  Permission Engine        │
│  Workflow Engine  │  Audit Engine            │
│  Delegation       │  Notifications           │
│  CRUD APIs        │  Project Access          │
├─────────────────────────────────────────────┤
│  PostgreSQL │ Redis │ WebSocket              │
└─────────────────────────────────────────────┘
```

## Tech Stack

- **Runtime:** Node.js 20, TypeScript
- **Framework:** NestJS 11
- **Database:** PostgreSQL 16 (TypeORM)
- **Cache:** Redis 7 (with memory fallback)
- **Auth:** JWT + Refresh Token Rotation
- **Realtime:** Socket.IO WebSocket
- **API:** Swagger/OpenAPI

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (optional, falls back to memory)

### Setup

```bash
# Clone and install
cd backend
cp .env.example .env
npm install

# Database
npm run migration:run
npm run seed

# Start
npm run start:dev
```

### Docker

```bash
# From project root
docker compose up -d

# Run migrations + seed
docker compose exec backend npm run migration:run
docker compose exec backend npm run seed
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | API port |
| `NODE_ENV` | No | `development` | Environment |
| `DB_HOST` | Yes | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_USERNAME` | Yes | `postgres` | DB user |
| `DB_PASSWORD` | Yes | `postgres` | DB password |
| `DB_NAME` | Yes | `puravankara_rbac_v3` | DB name |
| `REDIS_ENABLED` | No | `false` | Enable Redis |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 16 chars) |
| `JWT_REFRESH_SECRET` | No | `JWT_SECRET` | Refresh token secret |
| `JWT_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `CORS_ORIGINS` | No | localhost origins | Comma-separated allowed origins |
| `THROTTLE_TTL` | No | `60` | Rate limit window (seconds) |
| `THROTTLE_LIMIT` | No | `100` | Max requests per window |
| `LOG_LEVEL` | No | `debug` | Logging level |
| `LOG_FORMAT` | No | `pretty` | Log format (`pretty` or `json`) |

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Database + Redis health check |

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Login (returns JWT + refresh token) |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/logout-all` | Invalidate all sessions |
| GET | `/auth/me` | Current user profile |

### Permissions
| Method | Path | Description |
|---|---|---|
| GET | `/permissions/me` | Current user permissions |
| POST | `/permissions/explain` | Explain why access is granted/denied |

### Workflows
| Method | Path | Description |
|---|---|---|
| GET | `/workflows` | List active workflows |
| GET | `/workflows/:id/steps` | Workflow step chain |
| POST | `/workflows/:id/submit` | Submit approval request |
| GET | `/approvals/pending` | My pending approvals |
| GET | `/approvals/submitted` | My submitted requests |
| POST | `/approvals/:id/action` | Approve/reject |

### Notifications
| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | My notifications (paginated, filterable) |
| GET | `/notifications/count` | Unread count |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read-all` | Mark all as read |
| GET | `/notifications/preferences` | My preferences |
| PATCH | `/notifications/preferences` | Update preferences |

### CRUD Resources
`/geography/*`, `/projects/*`, `/organization/*`, `/users/*`, `/modules/*`, `/project-access/*`, `/delegations/*`, `/audit-logs`

**Documentation:** `http://localhost:3000/api/v1/docs`

## Database

```bash
# Migration commands
npm run migration:create -- src/config/migrations/MigrationName
npm run migration:generate -- src/config/migrations/MigrationName
npm run migration:run
npm run migration:revert

# Seed
npm run seed
```

## Testing

```bash
# Unit tests (76+ tests across 10 suites)
npm test

# Coverage (thresholds: global 80%, auth 90%, permissions 90%, workflows 85%)
npm run test:cov

# E2E (requires running database)
npm run test:e2e
```

## Scripts

| Script | Description |
|---|---|
| `npm run start` | Start |
| `npm run start:dev` | Watch mode |
| `npm run start:prod` | Production (from dist/) |
| `npm run build` | Compile |
| `npm run lint` | ESLint |
| `npm run seed` | Seed database |
| `npm test` | Unit tests |
| `npm run test:cov` | Coverage |
| `npm run test:e2e` | E2E tests |

## Security

- Helmet security headers (XSS, clickjacking, MIME sniffing)
- Rate limiting (100 req/min general, 5 req/min login)
- JWT with refresh token rotation
- Account locking after 5 failed attempts
- bcrypt password hashing (12 rounds)
- CORS whitelist
- Request validation (class-validator)
- Soft delete on all entities
- Comprehensive audit logging

## License

Proprietary — Puravankara Limited
