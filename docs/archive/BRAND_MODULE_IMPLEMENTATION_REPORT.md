# Brand Module Implementation Report

## Overview

Brand Master module (Module 1) implemented with full backend CRUD and frontend listing/edit. Backend supports full CRUD including Create/Delete/Activate/Deactivate; frontend exposes only Edit (listing + edit page).

## Files Created

### Backend

| File | Path |
|------|------|
| Entity | `backend/src/modules/brands/entities/brand.entity.ts` |
| DTOs | `backend/src/modules/brands/dto/brand.dto.ts` |
| Service | `backend/src/modules/brands/services/brand.service.ts` |
| Controller | `backend/src/modules/brands/controllers/brand.controller.ts` |
| Module | `backend/src/modules/brands/brands.module.ts` |
| Migration | `backend/src/config/migrations/1783077482113-CreateBrandsTable.ts` |

### Frontend

| File | Path |
|------|------|
| Brand type | `fe/src/types/index.ts` |
| Brand API service | `fe/src/services/api/brand-api.ts` |
| Mock data | `fe/src/services/mock-data.ts` |
| API adapters | `fe/src/services/api-adapters.ts` |
| Brand list page | `fe/src/sections/brands/brand-list.tsx` |
| Brand edit page | `fe/src/sections/brands/brand-edit.tsx` |

### Reusable Table Framework

| Component | Path |
|-----------|------|
| GroupedHeaderTable | `fe/src/components/tables/GroupedHeaderTable/index.tsx` |
| StandardDataTable | `fe/src/components/tables/StandardDataTable/index.tsx` |
| TableToolbar | `fe/src/components/tables/TableToolbar/index.tsx` |
| TablePagination | `fe/src/components/tables/TablePagination/index.tsx` |
| TableEmptyState | `fe/src/components/tables/TableEmptyState/index.tsx` |
| TableLoading | `fe/src/components/tables/TableLoading/index.tsx` |
| TableSearch | `fe/src/components/tables/TableSearch/index.tsx` |
| TableFilters | `fe/src/components/tables/TableFilters/index.tsx` |
| useDataTable hook | `fe/src/components/tables/hooks/use-data-table.ts` |
| useGroupedTable hook | `fe/src/components/tables/hooks/use-grouped-table.ts` |
| Types | `fe/src/components/tables/hooks/types.ts` |
| Barrel exports | `fe/src/components/tables/index.ts` |

## Files Modified

| File | Change |
|------|--------|
| `backend/src/app.module.ts` | Registered `BrandsModule` |
| `fe/src/routes/paths.ts` | Added `brandMaster` and `brandEdit` paths |
| `fe/src/routes/sections/dashboard.tsx` | Added Brand lazy imports and routes |
| `fe/src/layouts/config-nav-dashboard.tsx` | Added Brand to Master nav items |
| `fe/src/hooks/use-permission-nav.tsx` | Added BRAND to ADMIN_REGISTRY and nav logic |
| `fe/src/auth/guard/permission-guard.tsx` | Added BRAND route-to-code mapping |

## Migration

**Name:** `CreateBrandsTable1783077482113`

**Columns:**
- `id` — SERIAL PRIMARY KEY
- `brand_name` — VARCHAR, UNIQUE, NOT NULL
- `salary_multiplier` — NUMERIC(10,2), NOT NULL
- `razorpay_merchant_id`, `razorpay_secret_key` — VARCHAR, nullable
- `easebuzz_booking_salt`, `easebuzz_booking_key`, `easebuzz_booking_sub_merchant_id` — VARCHAR, nullable
- `easebuzz_milestone_salt`, `easebuzz_milestone_key`, `easebuzz_milestone_sub_merchant_id` — VARCHAR, nullable
- `billing_name`, `pan_number`, `gstin`, `address_1`, `address_2`, `pin_code` — VARCHAR, nullable
- `logo_url` — VARCHAR, nullable
- `rera_regularization_percentage`, `rera_qualification_percentage` — NUMERIC(5,2), nullable
- `maximum_regularization_days` — INTEGER, nullable
- `rtm_regularization_percentage`, `rtm_qualification_percentage` — NUMERIC(5,2), nullable
- `regularization_start_date` — DATE, nullable
- `terms_and_conditions` — TEXT, nullable
- `is_active` — BOOLEAN, DEFAULT true
- Plus all `AppBaseEntity` columns: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`

**Run:** `npm run migration:run`

## API Endpoints

| Method | Path | Description | Frontend Uses |
|--------|------|-------------|---------------|
| GET | `/api/v1/brands` | List all brands (paginated) | Yes |
| GET | `/api/v1/brands/:id` | Get brand by ID | Yes |
| POST | `/api/v1/brands` | Create brand | No (hidden) |
| PATCH | `/api/v1/brands/:id` | Update brand | Yes |
| DELETE | `/api/v1/brands/:id` | Soft delete brand | No (hidden) |

## Database Schema

```sql
CREATE TABLE "brands" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMP WITH TIME ZONE,
    "created_by" character varying,
    "updated_by" character varying,
    "brand_name" character varying NOT NULL,
    "salary_multiplier" numeric(10,2) NOT NULL,
    "razorpay_merchant_id" character varying,
    "razorpay_secret_key" character varying,
    "easebuzz_booking_salt" character varying,
    "easebuzz_booking_key" character varying,
    "easebuzz_booking_sub_merchant_id" character varying,
    "easebuzz_milestone_salt" character varying,
    "easebuzz_milestone_key" character varying,
    "easebuzz_milestone_sub_merchant_id" character varying,
    "billing_name" character varying,
    "pan_number" character varying,
    "gstin" character varying,
    "address_1" character varying,
    "address_2" character varying,
    "pin_code" character varying,
    "logo_url" character varying,
    "rera_regularization_percentage" numeric(5,2),
    "rera_qualification_percentage" numeric(5,2),
    "maximum_regularization_days" integer,
    "rtm_regularization_percentage" numeric(5,2),
    "rtm_qualification_percentage" numeric(5,2),
    "regularization_start_date" date,
    "terms_and_conditions" text,
    "is_active" boolean NOT NULL DEFAULT true,
    CONSTRAINT "UQ_brands_brand_name" UNIQUE ("brand_name"),
    CONSTRAINT "PK_brands_id" PRIMARY KEY ("id")
);
```

## Frontend Routes

| Route | Page | Purpose |
|-------|------|---------|
| `/dashboard/brand-master` | BrandListPage | Listing with grouped headers |
| `/dashboard/brand-master/:id/edit` | BrandEditPage | Edit form with 6 sections |

## Reusable Components Created

See TABLE_FRAMEWORK_REPORT.md for full details on the reusable table framework.

## Permissions

| Permission Code | Action | Frontend Visibility |
|----------------|--------|-------------------|
| BRAND | VIEW | Listing page accessible |
| BRAND | CREATE | Hidden (backend supports) |
| BRAND | EDIT | Edit button on listing, edit form |
| BRAND | DELETE | Hidden (backend supports via soft delete) |

## Remaining Work for Future CRUD Enablement

1. **Create Brand page** — Add `/dashboard/brand-master/create` route using `brand-edit.tsx` as template (change isEdit logic)
2. **Delete functionality** — Add delete dialog to brand-list.tsx using `useDeleteBrand` mutation
3. **Activate/Deactivate** — Add status toggle column to listing with `isActive` PATCH
4. **Frontend CRUD hooks** — Add `useCreateBrand()`, `useUpdateBrand()`, `useDeleteBrand()` mutations in `api-adapters.ts`
5. **Permission integration** — Add `<Can>` guards on conditional UI elements
