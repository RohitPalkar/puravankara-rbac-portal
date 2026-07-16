# Developer Handoff — Enterprise RBAC Administration Platform

## Quick Start

```bash
# Prerequisites: Node.js 20+, MySQL 8+, npm 10+

# Database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS puravankara_rbac;"

# Backend
cd backend
npm install
npm run start:dev    # http://localhost:3000 (auto-seeds)

# Frontend (new terminal)
cd frontend
npm install
npm run dev          # http://localhost:5174

# Login
# superadmin@puravankara.com / SuperAdmin@123
```

---

## Folder Structure

```
puravankara-rbac-admin/
├── backend/
│   ├── src/
│   │   ├── main.ts                 # Entry point
│   │   ├── app.module.ts            # Root module
│   │   ├── common/                  # Shared: guards, decorators, filters, interceptors
│   │   ├── config/                  # Database + JWT config
│   │   └── modules/                 # Feature modules
│   │       ├── auth/                # Authentication + JWT
│   │       ├── users/               # User CRUD + wizard
│   │       ├── zones/               # Master data
│   │       ├── cities/              # Master data
│   │       ├── departments/         # Master data
│   │       ├── levels/              # Master data
│   │       ├── brands/              # Master data
│   │       ├── projects/            # Master data + access matrix
│   │       ├── project-phases/      # Master data
│   │       ├── user-groups/         # Master data
│   │       ├── role-definitions/    # Role definitions
│   │       ├── module-definitions/  # Module + SubModule definitions
│   │       ├── action-definitions/  # Action definitions
│   │       ├── permission-mappings/ # Permission templates
│   │       ├── user-role-assignments/ # User ↔ Role
│   │       ├── user-hierarchies/    # Manager cascade
│   │       ├── employee-directory/  # Employee lookup
│   │       ├── dashboard/          # Stats aggregation
│   │       └── seed/               # Auto-seed on startup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx                # React entry
│   │   ├── App.tsx                 # Routes + theme
│   │   ├── components/
│   │   │   ├── common/             # DataTable, FormDialog, PrivateRoute, PermissionGuardRoute, CanAccess
│   │   │   └── layout/             # Layout, Sidebar, RoleSwitcher
│   │   ├── hooks/                  # useAuth, useCrudList, useSidebar, useSnackbar
│   │   ├── pages/                  # Page components (12 pages)
│   │   ├── services/api.ts         # Axios instance + interceptors
│   │   ├── store/                  # Redux: auth slice
│   │   └── types/index.ts          # TypeScript interfaces
│   └── package.json
│
└── docs/                           # Documentation
```

---

## Module Structure (Backend)

Every feature module follows the same pattern:

```
modules/example/
├── entities/
│   └── example.entity.ts        # TypeORM entity (class + decorators)
├── dto/
│   ├── create-example.dto.ts    # class-validator decorators
│   └── update-example.dto.ts    # PartialType(CreateExampleDto)
├── example.controller.ts        # @Controller(), routes, @Permissions()
├── example.service.ts           # Business logic, repositories
└── example.module.ts            # @Module({ imports, controllers, providers })
```

### To create a new module:

```typescript
// 1. Entity
@Entity('your_table_name')
export class YourEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ default: 'active' })
  status: string;
}

// 2. Controller
@Controller('your-entities')
@Permissions('your-entity')
export class YourEntityController {
  constructor(private readonly service: YourEntityService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) { ... }

  @Post()
  @Permissions('your-entity', 'create')
  async create(@Body() dto: CreateYourEntityDto) { ... }

  @Patch(':id')
  @Permissions('your-entity', 'edit')
  async update(@Param('id') id: number, @Body() dto: UpdateYourEntityDto) { ... }

  @Delete(':id')
  @Permissions('your-entity', 'delete')
  async remove(@Param('id') id: number) { ... }
}
```

---

## Adding a New Master Entity

### Backend

1. Create entity in `backend/src/modules/<name>/entities/`.
2. Create DTOs with `class-validator` decorators.
3. Create controller with `@Permissions('<module-code>')`.
4. Create service with standard CRUD (extend patterns from existing masters).
5. Register in module and import in `app.module.ts`.

### Frontend

1. Create page component in `frontend/src/pages/masters/`.
   - Use `useCrudList` hook for state management.
   - Use `DataTable` component for the grid.
   - Use `FormDialog` component for create/edit form.
2. Add route in `App.tsx` with `PermissionGuardRoute`.
3. Add sidebar icon mapping in `Sidebar.tsx`.

**Full example pattern:**

```typescript
// Page component (170 lines typical)
export default function MyEntityListPage() {
  const crud = useCrudList({ endpoint: '/my-entities' });
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'code', headerName: 'Code', width: 120 },
    { field: 'status', headerName: 'Status', width: 110,
      renderCell: (params: any) => <Chip label={params.value} color={...} size="small" />
    },
    { field: 'actions', headerName: 'Actions', width: 120,
      renderCell: (params: any) => <IconButton onClick={() => crud.openDialog(params.row)}>...</IconButton>
    },
  ];

  const formFields = [
    { name: 'name', label: 'Name', required: true },
    { name: 'code', label: 'Code', required: true },
    { name: 'status', label: 'Status', type: 'select',
      options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]
    },
  ];
  // ... render
}
```

---

## Adding a New Module (for RBAC)

1. Insert into `module_definitions`:
   ```sql
   INSERT INTO module_definitions (name, code, is_flat_module, status)
   VALUES ('New Module', 'new-module', false, 'active');
   ```

2. If hierarchical, add sub-modules:
   ```sql
   INSERT INTO sub_module_definitions (name, code, module_id)
   VALUES ('New SubModule', 'new-submodule', <module_id>);
   ```

3. Add actions:
   ```sql
   INSERT INTO action_definitions (name, code, module_id, sub_module_id)
   VALUES ('View', 'view', <module_id>, <sub_module_id>);
   ```

4. The module now appears in:
   - Permission Matrix Builder UI
   - Project Access Matrix (wizard)
   - Backend guard checks

5. If a UI page is needed:
   - Create page component.
   - Add route with `PermissionGuardRoute moduleCode="new-module"`.
   - Add icon mapping in `Sidebar.tsx` `iconMap`.

---

## Adding a New Permission (Action)

1. Insert into `action_definitions`:
   ```sql
   INSERT INTO action_definitions (name, code, module_id)
   VALUES ('Export', 'export', <module_id>);
   ```

2. The action automatically appears in:
   - Permission Matrix Builder (no code change)
   - User Wizard project matrix (no code change)

3. To guard backend endpoints with the new action:
   ```typescript
   @Permissions('your-module', 'export')
   @Get('export')
   async exportData() { ... }
   ```

4. To guard frontend elements:
   ```typescript
   <CanAccess moduleCode="your-module" action="export">
     <Button>Export</Button>
   </CanAccess>
   ```

---

## Debugging RBAC

### Permission not working?

**Check the role template:**
```sql
-- Does the role have the permission?
SELECT * FROM dept_role_module_mappings
WHERE role_definition_id = <roleId>
AND module_id = (SELECT id FROM module_definitions WHERE code = '<moduleCode>');
```

**Check the user's role assignment:**
```sql
-- What role does the user have?
SELECT * FROM user_role_assignments WHERE user_id = <userId>;

-- What access scope?
SELECT access_scope FROM user_role_assignments WHERE user_id = <userId>;
```

**Check project access:**
```sql
-- Does the user have project-level access?
SELECT * FROM user_project_module_access
WHERE user_id = <userId> AND project_id = <projectId>;
```

**Check super admin status:**
```sql
SELECT is_super_admin FROM users WHERE id = <userId>;
```

### Login response debugging

Check the login API response for permissions:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' | jq '.data.permissions | length'
```

### Frontend permission debugging

In browser console:
```javascript
// Check Redux state
store.getState().auth.permissions

// Check hasModule
useAuth().hasModule('users')

// Check hasPermission
useAuth().hasPermission('users', 'create')
```

---

## Common Development Tasks

### Adding a dropdown endpoint

```typescript
@Get('dropdown')
async getDropdown() {
  const items = await this.service.findAll();
  return items.map(item => ({ id: item.id, name: item.name }));
}
```

### Adding a status toggle

```typescript
@Patch(':id/toggle-status')
async toggleStatus(@Param('id') id: number) {
  const entity = await this.service.findById(id);
  entity.status = entity.status === 'active' ? 'inactive' : 'active';
  await this.service.save(entity);
  return entity;
}
```

### Adding pagination + search

```typescript
@Get()
async findAll(@Query() query: PaginationDto) {
  const { page = 1, limit = 10, search = '' } = query;
  const [data, total] = await this.repository.findAndCount({
    where: search ? { name: Like(`%${search}%`) } : {},
    skip: (page - 1) * limit,
    take: limit,
  });
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}
```

---

## Testing Strategy

- Backend unit tests: Jest (NestJS default) — focus on service logic.
- Backend e2e tests: Supertest — focus on auth flow and permission guard.
- Frontend tests: Vitest + React Testing Library — focus on component rendering and guard behavior.
- Manual test flow: Follow `docs/DEMO_SCRIPT.md`.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | MySQL host |
| `DB_PORT` | 3306 | MySQL port |
| `DB_USERNAME` | root | MySQL user |
| `DB_PASSWORD` | YourStrongPassword123! | MySQL password |
| `DB_NAME` | puravankara_rbac | Database name |
| `JWT_SECRET` | (set in jwt.config.ts) | JWT signing secret |
| `JWT_EXPIRES_IN` | 24h | Token expiry |

To override: set environment variables or edit `backend/src/config/database.config.ts` and `backend/src/config/jwt.config.ts`.
