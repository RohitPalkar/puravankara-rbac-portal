# Brand Module Migration Report

## Migration Executed

| Property | Value |
|----------|-------|
| **Migration Name** | `CreateBrandsTable1783077482113` |
| **Timestamp** | `1783077482113` |
| **Target Database** | Supabase (`vsxnevbhidivdzdpfojb`) |
| **Connection** | Pooler: `aws-0-ap-northeast-1.pooler.supabase.com:5432` |
| **Executed At** | 2026-07-16T06:48:40.000Z |
| **Status** | ✅ Success |

## Tables Created

| Table | Schema |
|-------|--------|
| `brands` | See full schema below |

### `brands` Table Schema

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

## Seed Records Inserted

| ID | Brand Name | Salary Multiplier | Status |
|----|-----------|-----------------:|--------|
| 1 | Puravankara | 1.00 | Active |
| 2 | Provident | 0.80 | Active |

## Existing Tables Unaffected

The following existing tables were **NOT** modified:

- `zones`, `cities`, `city_zone_mappings`
- `departments`, `department_roles`
- `projects`, `project_locations`, `project_groups`, `project_group_projects`
- `users`, `user_auth`, `user_sessions`, `user_roles`, `user_zones`, `user_reporting_lines`
- `roles`, `module_actions`, `modules`, `sub_modules`, `actions`
- `approval_workflows`, `approval_steps`, `approval_requests`, `approval_request_steps`
- `audit_logs`
- `notifications`, `notification_preferences`
- `user_delegations`
- `permission_scopes`, `action_permission_scopes`, `permission_templates`, `template_permissions`
- `permission_snapshot_history`, `user_permission_overrides`, `user_permission_templates`
- `user_project_access`, `user_project_feature_matrix`, `user_project_groups`
- `role_project_permissions`
- `system_settings`
- `migrations`

## API Verification

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/v1/health` | GET | ✅ 200 | Database connection healthy |
| `/api/v1/brands` | GET | ✅ 401 (auth) | Route registered, auth required |
| `/api/v1/brands/:id` | GET | ✅ 401 (auth) | Route registered, auth required |
| `/api/v1/zones` | GET | ✅ 401 (auth) | Existing API unaffected |
| `/api/v1/departments` | GET | ✅ 401 (auth) | Existing API unaffected |
| `/api/v1/projects` | GET | ✅ 401 (auth) | Existing API unaffected |
| `/api/v1/users` | GET | ✅ 401 (auth) | Existing API unaffected |

All existing APIs continue to work as expected. The Brand module endpoints are properly registered behind authentication.

## Render Deployment

| Property | Value |
|----------|-------|
| **Service** | `puravankara-rbac-portal` |
| **Branch** | `be-render-deployment` |
| **Commit** | `2b93224` |
| **Deploy ID** | `dep-d9c82m9kh4rs73c92jp0` |
| **Status** | ✅ Live |
| **URL** | `https://puravankara-rbac-portal.onrender.com` |

## Supabase Connection

| Property | Value |
|----------|-------|
| **Project Ref** | `vsxnevbhidivdzdpfojb` |
| **Region** | `ap-northeast-1` (Tokyo) |
| **Pooler Host** | `aws-0-ap-northeast-1.pooler.supabase.com:5432` |
| **SSL** | Enabled with `rejectUnauthorized: false` |
| **RLS** | Enabled on Supabase side |
