# RBAC Business Alignment

## Comparison: Current Implementation vs RBAC Info.xlsx

### Masters — Present vs Required

| Master | Current | Required (from XLSX) | Gap |
|--------|---------|---------------------|-----|
| Zone | ✅ Entity + CRUD + API + FE | Zone master CURD + City mapping | ✅ Matches |
| City | ✅ Entity + CRUD + API + FE | City - Zone mapping | ✅ Matches |
| Department | ✅ Entity + CRUD + API + FE (up to L7) | CRUD, Level within dept L-7 | ✅ Matches |
| Projects | ⚠️ Referenced in seed module entity list, no CRUD module | Project with Brand, City, Phase, Company, Billing Entity, Image, Payment Gateway, Incentive Criteria | ❌ Missing CRUD, missing fields |
| Brands | ❌ Not present | Address, GSTIN, PAN, Billing Entity | ❌ Missing entirely |
| Project Phases | ❌ Not present | Phase dropdown (e.g., Purva Atmosphere T1) | ❌ Missing entirely |
| User Group | ❌ Not present | Closing RM, Team Admin, etc. with start/end dates | ❌ Missing entirely |
| Levels | ✅ Entity + CRUD + API + FE | L1-L4 mapped to roles | ✅ Matches |
| Roles | ✅ Entity + CRUD + API + FE | CRUD | ✅ Matches |
| Modules | ✅ Entity + CRUD + API + FE | 18 business modules needed | ❌ Only 10 seeded |
| Sub-Modules | ✅ Entity + CRUD + API + FE | 30+ business sub-modules needed | ❌ Only 5 seeded |
| Actions | ✅ Entity + CRUD + API + FE | 7 base + 50+ custom actions | ❌ Only 6 base seeded |

### Hierarchy — Present vs Required

| Chain | Current | Required |
|-------|---------|----------|
| Zone → City | ✅ Zone has cities[] | ✅ Correct |
| Zone → Project | ❌ No relationship | ❌ Project must belong to Zone |
| City → Project | ❌ No relationship | ❌ Project must belong to City |
| Department → Level | ⚠️ DepartmentLevel entity exists (L1-L7) | ✅ Matches |
| Department → Role | ✅ Department has roleDefinitions[] | ✅ Correct |
| Level → Role | ✅ RoleDefinition has levelId | ✅ Correct |
| User → Multi-Zone | ❌ User has single zoneId | ❌ User must select multiple zones |
| User → Primary/Secondary Role | ❌ User has single roleAssignment | ❌ User needs primary + secondary |
| User → Hierarchy | ✅ UserHierarchy entity exists | ⚠️ Needs clearer cascade: Manager(L2)→TeamAdmin(L3)→DeptAdmin(L4) |

### Permission Engine — Present vs Required

| Feature | Current | Required |
|---------|---------|----------|
| Dept-Role-Module Mapping | ✅ Basic CRUD | ✅ With multi-select modules/sub-modules/actions |
| Level-based Mapping | ⚠️ Level picker exists on mapping entity | ✅ Must enforce level filtering |
| Multi-select in Mapping | ❌ Single-select dropdowns | ❌ Multi-select for modules, sub-modules, actions |
| Signature Upload flag | ❌ Not present | ❌ Boolean on mapping for E-Signer module |
| Admin Bypass | ⚠️ Only Super Admin bypasses perms | ❌ Admin should also bypass |
| Permission Cache | ❌ No cache | ❌ 15-min TTL needed |
| Audit Logging | ❌ Not present | ❌ All mapping changes logged |
| Permission Preview | ⚠️ Effective tree endpoint exists | ✅ Correct |
| Bulk Mapping | ❌ Single create per call | ❌ Bulk create needed |
| Permission Resolver Services | ❌ Business logic in controllers | ❌ Extract to PermissionResolver, RoleResolver, SidebarResolver, UserAccessResolver |

### User Management — Present vs Required

| Feature | Current | Required |
|---------|---------|----------|
| Multi-Zone Selection | ❌ Single zone select | ❌ Multi-select zones |
| Primary + Secondary Role | ❌ Single role assignment | ❌ Primary role + Secondary role (optional) |
| Per-Project Module Toggle | ❌ Not present | ❌ Select project → toggle modules for that project |
| Manager Cascade (L2/L3/L4) | ⚠️ UserHierarchy entity exists but not in creation flow | ❌ Reporter Manager(L2) → Team Admin(L3) → Dept Admin(L4) |
| User Group | ❌ Not present | ❌ Closing RM, etc. with start/end dates |
| Project-Based Role Filtering | ❌ Not present | ❌ Roles filtered by selected department's mappings |
| Dynamic Modules on Role Switch | ❌ Not present | ❌ Change nav/permissions when switching primary/secondary role |

### API Gaps

| Endpoint | Current | Required |
|----------|---------|----------|
| Projects CRUD | ❌ Missing | ✅ Create, Read, Update, Delete, Search, Paginate |
| Brands CRUD | ❌ Missing | ✅ Create, Read, Update, Delete, Search, Paginate |
| Project Phases CRUD | ❌ Missing | ✅ Create, Read, Update, Delete, Search, Paginate |
| User Groups CRUD | ❌ Missing | ✅ Create, Read, Update, Delete, Search, Paginate |
| GET /users/hierarchy-candidates | ❌ Missing | ✅ Candidates filtered by dept + project overlap |
| POST /auth/switch-role | ❌ Missing | ✅ Switch active role, return new permission tree |
| GET /permissions/check | ❌ Missing | ✅ Check single permission (module+action+project) |
| GET /permissions/my-permissions | ❌ Missing | ✅ Full resolved permission tree for current user |
| POST /permission-mappings/bulk | ❌ Missing | ✅ Bulk create/update mappings |
| PATCH /users/:id/roles | ❌ Missing | ✅ Update primary/secondary roles |
| PUT /users/:id/hierarchy | ❌ Missing | ✅ Update cascade hierarchy |

### Database Quality Gaps

| Item | Current | Required |
|------|---------|----------|
| Foreign Keys | ⚠️ TypeORM relations exist but DB may not have explicit FKs | ✅ Add explicit FK constraints |
| Composite Unique Constraints | ❌ Not enforced | ✅ Unique on (dept + role + module + sub-module + action) in mapping |
| Indexes | ❌ Not specified | ✅ Add indexes on frequently queried columns |
| created_by / updated_by | ❌ Only on UserRoleAssignment and PermissionMapping | ✅ Add to all entities |
| Audit Fields | ✅ created_at, updated_at, deleted_at on all entities | ✅ Matches |
| Soft Delete | ✅ All entities have deletedAt | ✅ Correct |

---

## Implementation Priority

### Phase 2a (Current Sprint) — Foundation Masters
1. Create Projects entity + CRUD + seed
2. Create Brands entity + CRUD + seed  
3. Create Project Phases entity + CRUD + seed
4. Create User Group entity + CRUD + seed
5. Fix Project → Zone + City relationships

### Phase 2b — Permission Engine Upgrade
6. Create PermissionResolverService
7. Create RoleResolverService
8. Create SidebarResolverService
9. Create UserAccessResolverService
10. Add composite unique constraint on DeptRoleModuleMapping
11. Add admin bypass logic
12. Add 403 interceptor on frontend

### Phase 2c — User Model Upgrade
13. Add multi-zone support (junction table or JSON)
14. Add primary/secondary role assignment APIs
15. Add hierarchy candidates API
16. Add user group fields to user creation

### Phase 2d — API Polish
17. Add @ApiTags() + @ApiProperty() swagger decorators
18. Ensure consistent error handling
19. Verify all endpoints return proper status codes
