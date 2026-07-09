import { Injectable } from '@nestjs/common';
import { UserPermissionsResponse, ProjectPermissions } from '../dto/user-permissions.dto';

export interface NavPermissionModule {
  code: string;
  name: string;
  route: string;
  allowed: boolean;
  actions?: string[];
}

export interface PermissionMeResponse {
  user: {
    empId: string;
    name: string;
    email: string;
    role?: string;
  };
  permissions: {
    modules: NavPermissionModule[];
  };
}

const MODULE_ROUTE_MAP: Record<string, string> = {
  DASHBOARD: '/dashboard',
  ZONE_MGMT: '/dashboard/zone-master',
  DEPARTMENTS: '/dashboard/department-master',
  ROLES: '/dashboard/role-master',
  PROJECTS: '/dashboard/project-master',
  PERMISSION_MATRIX: '/dashboard/permission-mapping',
  USERS: '/dashboard/user-management',
  ACTIVITY_LOGS: '/dashboard/audit-logs',
  CRM: '/apps/crm',
  EOI: '/apps/eoi',
  IOM: '/apps/iom',
  BOOKINGS: '/apps/bookings',
  INVENTORY: '/apps/inventory',
  FINANCE: '/apps/finance',
  REPORTS: '/apps/reports',
  DOCUMENTS: '/apps/documents',
  ESIGNATURE: '/apps/esignature',
  GEOGRAPHY: '/dashboard/zone-master',
  ORGANIZATION: '/dashboard/department-master',
  PRODUCT_CONFIG: '/dashboard/permission-mapping',
  PERMISSIONS: '/dashboard/permission-mapping',
  LOYALTY: '/apps/loyalty',
};

const MODULE_NAME_TO_CODE: Record<string, string> = {
  Dashboard: 'DASHBOARD',
  Geography: 'GEOGRAPHY',
  Organization: 'ORGANIZATION',
  'Product Config': 'PRODUCT_CONFIG',
  Projects: 'PROJECTS',
  Users: 'USERS',
  Permissions: 'PERMISSIONS',
  CRM: 'CRM',
  EOI: 'EOI',
  IOM: 'IOM',
  Inventory: 'INVENTORY',
  Finance: 'FINANCE',
  Reports: 'REPORTS',
  Bookings: 'BOOKINGS',
  Loyalty: 'LOYALTY',
};

const SUBMODULE_TO_CODE: Record<string, string> = {
  Zones: 'ZONE_MGMT',
  Cities: 'GEOGRAPHY',
  Departments: 'DEPARTMENTS',
  Roles: 'ROLES',
  Projects: 'PROJECTS',
  Users: 'USERS',
  Permissions: 'PERMISSION_MATRIX',
  Modules: 'PRODUCT_CONFIG',
  'Sub Modules': 'PRODUCT_CONFIG',
  Actions: 'PRODUCT_CONFIG',
  'Generate IOM': 'IOM',
};

const ALL_MODULE_DEFINITIONS: { code: string; name: string; route: string }[] = [
  { code: 'DASHBOARD', name: 'Dashboard', route: '/dashboard' },
  { code: 'ZONE_MGMT', name: 'Zone Management', route: '/dashboard/zone-master' },
  { code: 'DEPARTMENTS', name: 'Departments', route: '/dashboard/department-master' },
  { code: 'ROLES', name: 'Roles', route: '/dashboard/role-master' },
  { code: 'PROJECTS', name: 'Projects', route: '/dashboard/project-master' },
  { code: 'PERMISSION_MATRIX', name: 'Permission Mapping', route: '/dashboard/permission-mapping' },
  { code: 'USERS', name: 'Users', route: '/dashboard/user-management' },
  { code: 'ACTIVITY_LOGS', name: 'Activity Logs', route: '/dashboard/audit-logs' },
  { code: 'CRM', name: 'CRM', route: '/apps/crm' },
  { code: 'EOI', name: 'EOI', route: '/apps/eoi' },
  { code: 'IOM', name: 'IOM', route: '/apps/iom' },
  { code: 'BOOKINGS', name: 'Bookings', route: '/apps/bookings' },
  { code: 'INVENTORY', name: 'Inventory', route: '/apps/inventory' },
  { code: 'FINANCE', name: 'Finance', route: '/apps/finance' },
  { code: 'REPORTS', name: 'Reports', route: '/apps/reports' },
  { code: 'DOCUMENTS', name: 'Documents', route: '/apps/documents' },
  { code: 'ESIGNATURE', name: 'eSignature', route: '/apps/esignature' },
];

@Injectable()
export class PermissionAdapterService {
  adaptPermissionMeResponse(raw: UserPermissionsResponse): PermissionMeResponse {
    const actionMap = this.buildModuleActions(raw.projects);

    const modules: NavPermissionModule[] = ALL_MODULE_DEFINITIONS.map((def) => {
      const actions = actionMap.get(def.code);
      return {
        code: def.code,
        name: def.name,
        route: def.route,
        allowed: actions !== undefined && actions.size > 0,
        actions: actions ? Array.from(actions) : [],
      };
    });

    return {
      user: {
        empId: raw.user.empId,
        name: raw.user.name,
        email: raw.user.email,
        role: raw.user.roles?.[0] || undefined,
      },
      permissions: { modules },
    };
  }

  private buildModuleActions(projects: ProjectPermissions[]): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();

    for (const proj of projects) {
      for (const mod of proj.modules) {
        for (const sm of mod.subModules) {
          const code = SUBMODULE_TO_CODE[sm.name] || MODULE_NAME_TO_CODE[mod.name];
          if (code) {
            if (!map.has(code)) map.set(code, new Set());
            const set = map.get(code)!;
            for (const a of sm.actions) {
              if (a.allowed) set.add(a.code.toUpperCase());
            }
          }
        }
      }
    }

    return map;
  }
}