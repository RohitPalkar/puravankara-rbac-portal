# FRONTEND PHASE 0 — FOUNDATION COMPLETE

## Branch
- `frontend/rbac-v2-rebuild` — blank orphan branch, contains all new FE code
- `main` / `deployment/render-vercel` — untouched (BE-only)

## Old FE Analysis
Reference repo at `/Users/rohitvp/Downloads/purvankara-portal FE code`

### Components Kept (as design reference)
| Pattern | Source | Decision |
|---|---|---|
| DashboardLayout (sidebar + header) | `layouts/dashboard/` | Rebuild — shadcn sidebar |
| AuthSplitLayout | `layouts/auth-split/` | Rebuild — simple card |
| CustomBreadcrumbs | `components/custom-breadcrumbs/` | Rebuild as component |
| Table system (useTable, pagination, sort) | `components/table/` | Rebuild with shadcn Table |
| Form pattern (RHF + Zod) | `components/hook-form/` | Keep — same pattern |
| CRUD 3-file structure (page → section → components) | `pages/` + `sections/` | Keep |
| Label/Badge | `components/label/` | shadcn badge |
| ConfirmDialog | `components/custom-dialog/` | shadcn dialog |
| Snackbar (Sonner) | `components/snackbar/` | shadcn sonner |
| Iconify | `components/iconify/` | MUI Icons |
| EmptyContent | `components/empty-content/` | Rebuild |
| LoadingScreen | `components/loading-screen/` | MUI CircularProgress |
| Role-based guards | `auth/guard/` | PermissionRoute component |
| Axios interceptors | `services/axiosInterceptors.ts` | Keep — same pattern |

### Components Discarded
- Redux slices/store (48 slices) → replaced by Zustand
- Formik integration → replaced by RHF-only
- Mock fallback pattern → removed
- Old API routes/permissions → new endpoints
- Settings drawer → skip (default theme)
- Sentry → skip for now
- Cloudflare Turnstile → skip

## Folder Structure
```
frontend/src/
  app/
    providers.tsx        # BrowserRouter, QueryClient, ThemeProvider
    router.tsx           # All routes with guards

  layouts/
    DashboardLayout/     # (Phase 1)
    AuthLayout/          # (Phase 1)

  components/
    ui/                  # shadcn/ui components
      button.tsx
      input.tsx
      select.tsx
      card.tsx
      table.tsx
      dialog.tsx
      dropdown-menu.tsx
      badge.tsx
      tabs.tsx
      sonner.tsx
    data-table/          # (Phase 1)
    forms/               # (Phase 1)
    dialogs/             # (Phase 1)
    common/              # (Phase 1)

  features/
    auth/LoginPage.tsx   # Login page with pre-filled creds
    dashboard/
      DashboardPage.tsx  # Module grid dashboard
      PagePlaceholder.tsx

  services/
    api/
      axios.ts           # Axios with JWT interceptor
      endpoints.ts       # Typed API endpoint functions

  stores/
    auth.store.ts        # Zustand: user, token, login, logout, checkSession
    permission.store.ts  # Zustand: permission tree, modules, actions

  hooks/
    useAuth.ts           # Auth hook wrapper
    usePermission.ts     # Permission hook wrapper

  types/
    api.types.ts         # ApiResponse, User, LoginPayload, etc.

  theme/
    index.ts             # MUI theme config

  lib/
    utils.ts             # shadcn cn() utility

  index.css              # Tailwind v4 import
  main.tsx               # Entry point
```

## Packages Installed
| Package | Version | Purpose |
|---|---|---|
| @mui/material | ^9.2.0 | Material UI components |
| @mui/icons-material | ^9.2.0 | MUI icons |
| @emotion/react | ^11.14 | CSS-in-JS for MUI |
| @emotion/styled | ^11.14 | Styled components for MUI |
| tailwindcss | ^4.3.2 | Utility CSS |
| @tailwindcss/vite | ^4.3.2 | Tailwind Vite plugin |
| react-router-dom | ^7.18.1 | Routing |
| @tanstack/react-query | ^5.101.2 | Server state management |
| zustand | ^5.0.14 | Client state management |
| axios | ^1.18.1 | HTTP client |
| react-hook-form | ^7.81.0 | Form management |
| @hookform/resolvers | ^5.4.0 | RHF validators |
| zod | ^4.4.3 | Schema validation |
| shadcn/ui | latest | Base UI components |
| @types/react | ^19.2.17 | TypeScript types |
| vite | ^8.1.1 | Build tool |

## Build Result
```
✓ built in 173ms
dist/ contains: index.html, CSS, JS chunks (splitting LoginPage/DashboardPage/Placeholder)
```

## Routes Defined
| Path | Guard | Component |
|---|---|---|
| `/login` | Public | LoginPage |
| `/dashboard` | Protected | DashboardPage |
| `/master/geography` | Protected | Placeholder |
| `/master/organization` | Protected | Placeholder |
| `/product-config` | Protected | Placeholder |
| `/projects` | Protected | Placeholder |
| `/users` | Protected | Placeholder |
| `/permissions` | Protected | Placeholder |
| `/workflows` | Protected | Placeholder |
| `/audit` | Protected | Placeholder |

## Auth Flow
- Zustand `auth.store.ts` manages: user, accessToken, refreshToken, isAuthenticated
- localStorage persistence for tokens
- Axios interceptor attaches JWT, 401 → auto-logout
- `ProtectedRoute` redirects to /login if unauthenticated
- `PublicRoute` redirects to /dashboard if already authenticated
- `useAuth()` hook for components

## Pending for Phase 1
- [ ] DashboardLayout (sidebar + header + breadcrumbs)
- [ ] User CRUD pages (list, create, edit, view)
- [ ] Role management CRUD
- [ ] Geography (zones, cities) CRUD
- [ ] Organization (departments) CRUD
- [ ] Projects CRUD
- [ ] Product Config CRUD
- [ ] Permission viewer
- [ ] Workflow list
- [ ] Audit log viewer
- [ ] Notification list
- [ ] Form system (RHF + shadcn + MUI integration)
- [ ] Data table with pagination, sort, search
- [ ] Confirmation dialogs
- [ ] Toast notifications (sonner)
