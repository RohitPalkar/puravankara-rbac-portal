import { DataSource, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../modules/organization/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { UserAuth } from '../../modules/auth/entities/user-auth.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';
import { Action } from '../../modules/product-catalog/entities/action.entity';
import { Module } from '../../modules/product-catalog/entities/module.entity';
import { SubModule } from '../../modules/product-catalog/entities/sub-module.entity';
import { ModuleAction } from '../../modules/product-catalog/entities/module-action.entity';
import { Zone } from '../../modules/geography/entities/zone.entity';

const SALT_ROUNDS = 12;

const SYSTEM_ACTIONS = [
  'VIEW',
  'CREATE',
  'UPDATE',
  'DELETE',
  'APPROVE',
  'REJECT',
  'EXPORT',
  'IMPORT',
];

const ZONE_NAMES = ['North', 'South', 'East', 'West'];

const MODULE_SEED: {
  name: string;
  subModules: { name: string; actions: string[] }[];
  moduleActions: string[];
}[] = [
  {
    name: 'CRM',
    subModules: [
      { name: 'Leads', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'] },
      { name: 'Opportunities', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
      { name: 'Customers', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'] },
      { name: 'Reports', actions: ['VIEW', 'EXPORT'] },
    ],
    moduleActions: ['VIEW'],
  },
  {
    name: 'EOI',
    subModules: [
      { name: 'Enquiries', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
      { name: 'Registrations', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
      { name: 'Allocations', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'] },
      { name: 'Reports', actions: ['VIEW', 'EXPORT'] },
    ],
    moduleActions: ['VIEW'],
  },
  {
    name: 'IOM',
    subModules: [
      { name: 'Inventory', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'IMPORT'] },
      { name: 'Bookings', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'] },
      { name: 'Agreements', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
      { name: 'Payments', actions: ['VIEW', 'CREATE', 'UPDATE', 'EXPORT'] },
      { name: 'Reports', actions: ['VIEW', 'EXPORT'] },
    ],
    moduleActions: ['VIEW'],
  },
  {
    name: 'Marketing',
    subModules: [
      { name: 'Campaigns', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
      { name: 'Events', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
      { name: 'Analytics', actions: ['VIEW', 'EXPORT'] },
    ],
    moduleActions: ['VIEW'],
  },
  {
    name: 'Finance',
    subModules: [
      { name: 'Invoices', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'] },
      { name: 'Payments', actions: ['VIEW', 'CREATE', 'UPDATE', 'APPROVE', 'REJECT'] },
      { name: 'Reports', actions: ['VIEW', 'EXPORT'] },
    ],
    moduleActions: ['VIEW'],
  },
  {
    name: 'Projects',
    subModules: [
      { name: 'Project Details', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
      { name: 'Milestones', actions: ['VIEW', 'CREATE', 'UPDATE'] },
      { name: 'Reports', actions: ['VIEW', 'EXPORT'] },
    ],
    moduleActions: ['VIEW'],
  },
  {
    name: 'System',
    subModules: [
      { name: 'Users', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
      { name: 'Roles', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
      { name: 'Permissions', actions: ['VIEW', 'CREATE', 'UPDATE', 'DELETE'] },
      { name: 'Settings', actions: ['VIEW', 'UPDATE'] },
      { name: 'Audit Logs', actions: ['VIEW', 'EXPORT'] },
    ],
    moduleActions: ['VIEW'],
  },
];

export async function bootstrapSeeder(dataSource: DataSource): Promise<void> {
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const authRepo = dataSource.getRepository(UserAuth);
  const userRoleRepo = dataSource.getRepository(UserRole);
  const actionRepo = dataSource.getRepository(Action);
  const moduleRepo = dataSource.getRepository(Module);
  const subModuleRepo = dataSource.getRepository(SubModule);
  const moduleActionRepo = dataSource.getRepository(ModuleAction);
  const zoneRepo = dataSource.getRepository(Zone);

  // 1. Seed zones
  for (const name of ZONE_NAMES) {
    const existing = await zoneRepo.findOne({ where: { name } });
    if (!existing) {
      await zoneRepo.save(zoneRepo.create({ name, isActive: true }));
    }
  }

  // 2. Seed system actions
  for (const code of SYSTEM_ACTIONS) {
    const existing = await actionRepo.findOne({ where: { code } });
    if (!existing) {
      await actionRepo.save(
        actionRepo.create({
          code,
          label: code.charAt(0) + code.slice(1).toLowerCase(),
          isActive: true,
        }),
      );
    }
  }

  // 3. Seed product catalog: modules, sub-modules, and module-action links
  const allActions = await actionRepo.find({ where: { isActive: true } });
  const actionMap = new Map(allActions.map((a) => [a.code, a.id]));

  for (const modDef of MODULE_SEED) {
    let mod = await moduleRepo.findOne({ where: { name: modDef.name } });
    if (!mod) {
      mod = await moduleRepo.save(moduleRepo.create({ name: modDef.name, isActive: true }));
    }

    for (const smDef of modDef.subModules) {
      let sm = await subModuleRepo.findOne({ where: { moduleId: mod.id, name: smDef.name } });
      if (!sm) {
        sm = await subModuleRepo.save(subModuleRepo.create({ moduleId: mod.id, name: smDef.name, isActive: true }));
      }

      for (const actionCode of smDef.actions) {
        const actionId = actionMap.get(actionCode);
        if (!actionId) continue;
        const existing = await moduleActionRepo.findOne({ where: { moduleId: mod.id, subModuleId: sm.id, actionId } });
        if (!existing) {
          await moduleActionRepo.save(moduleActionRepo.create({ moduleId: mod.id, subModuleId: sm.id, actionId, isActive: true }));
        }
      }
    }

    for (const actionCode of modDef.moduleActions) {
      const actionId = actionMap.get(actionCode);
      if (!actionId) continue;
      const existing = await moduleActionRepo.findOne({ where: { moduleId: mod.id, subModuleId: null, actionId } });
      if (!existing) {
        await moduleActionRepo.save(moduleActionRepo.create({ moduleId: mod.id, subModuleId: null as any, actionId, isActive: true }));
      }
    }
  }

  // 5. Seed SUPER_ADMIN role
  const existingRole = await roleRepo.findOne({
    where: { name: 'SUPER_ADMIN' },
  });
  const superAdminRole =
    existingRole ||
    (await roleRepo.save(
      roleRepo.create({
        name: 'SUPER_ADMIN',
        hierarchyLevelRank: 1,
        isActive: true,
        isSystemRole: true,
      }),
    ));

  // 6. Seed system admin user from ENV or defaults
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@system.local';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD!;

  let adminUser = await userRepo.findOne({ where: { email: adminEmail } });
  if (!adminUser) {
    // Generate emp_id using normal sequence
    const [lastUser] = await userRepo.find({ order: { createdAt: 'DESC' }, take: 1 });
    const lastNum = lastUser
      ? parseInt(lastUser.empId.replace('PPL', ''), 10)
      : 0;
    const nextNum = lastNum + 1;
    const empId = `PPL${String(nextNum).padStart(5, '0')}`;
    adminUser = await userRepo.save(
      userRepo.create({
        empId,
        name: 'System Administrator',
        email: adminEmail,
        departmentId: null,
        employmentStatus: 'PERMANENT',
        isActive: true,
      }),
    );
  }

  // Ensure UserAuth record exists (even if user was created by prior migration)
  const existingAuth = await authRepo.findOne({ where: { userId: adminUser.empId } });
  if (!existingAuth) {
    const passwordHash: string = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    await authRepo.save(
      authRepo.create({
        userId: adminUser.empId,
        passwordHash,
        authProvider: 'LOCAL',
      }),
    );
  }

  // Ensure SUPER_ADMIN role assignment exists
  const existingAssignment = await userRoleRepo.findOne({
    where: { userId: adminUser.empId, roleId: superAdminRole.id },
  });
  if (!existingAssignment) {
    await userRoleRepo.save(
      userRoleRepo.create({
        userId: adminUser.empId,
        departmentId: null,
        roleId: superAdminRole.id,
        assignedBy: 'SYSTEM',
        assignedAt: new Date(),
      }),
    );
  }
}
