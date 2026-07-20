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

const MODULES_SEED = [
  { name: 'Geography', code: 'GEOGRAPHY' },
  { name: 'Brands', code: 'BRANDS' },
  { name: 'Organization', code: 'ORGANIZATION' },
  { name: 'Product Config', code: 'PRODUCT_CONFIG' },
  { name: 'Projects', code: 'PROJECTS' },
  { name: 'Users', code: 'USERS' },
  { name: 'Permissions', code: 'PERMISSIONS' },
];

const SUB_MODULES_SEED: { name: string; code: string; moduleName: string }[] = [
  { name: 'ZONES', code: 'ZONES', moduleName: 'Geography' },
  { name: 'CITIES', code: 'CITIES', moduleName: 'Geography' },
  { name: 'BRANDS', code: 'BRANDS', moduleName: 'Brands' },
  { name: 'DEPARTMENTS', code: 'DEPARTMENTS', moduleName: 'Organization' },
  { name: 'ROLES', code: 'ROLES', moduleName: 'Organization' },
  { name: 'MODULES', code: 'MODULES', moduleName: 'Product Config' },
  { name: 'SUB_MODULES', code: 'SUB_MODULES', moduleName: 'Product Config' },
  { name: 'ACTIONS', code: 'ACTIONS', moduleName: 'Product Config' },
  { name: 'PROJECTS', code: 'PROJECTS', moduleName: 'Projects' },
  { name: 'USERS', code: 'USERS', moduleName: 'Users' },
  { name: 'PERMISSIONS', code: 'PERMISSIONS', moduleName: 'Permissions' },
];

const ZONE_NAMES = ['North', 'South', 'East', 'West'];

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

  // 2. Seed modules
  const moduleMap = new Map<string, Module>();
  for (const m of MODULES_SEED) {
    let mod = await moduleRepo.findOne({ where: { name: m.name } });
    if (!mod) {
      mod = await moduleRepo.save(
        moduleRepo.create({ name: m.name, code: m.code, isActive: true }),
      );
    }
    moduleMap.set(m.name, mod);
  }

  // 3. Seed sub-modules
  const subModuleMap = new Map<string, SubModule>();
  for (const sm of SUB_MODULES_SEED) {
    const parentModule = moduleMap.get(sm.moduleName);
    if (!parentModule) continue;
    let sub = await subModuleRepo.findOne({
      where: { moduleId: parentModule.id, name: sm.name },
    });
    if (!sub) {
      sub = await subModuleRepo.save(
        subModuleRepo.create({
          moduleId: parentModule.id,
          name: sm.name,
          isActive: true,
        }),
      );
    }
    subModuleMap.set(sm.name, sub);
  }

  // 4. Seed system actions
  const allActions: Action[] = [];
  for (const code of SYSTEM_ACTIONS) {
    let action = await actionRepo.findOne({ where: { code } });
    if (!action) {
      action = await actionRepo.save(
        actionRepo.create({
          code,
          label: code.charAt(0) + code.slice(1).toLowerCase(),
          isActive: true,
        }),
      );
    }
    allActions.push(action);
  }

  // 5. Seed module-actions (link all actions to all sub-modules)
  for (const sub of subModuleMap.values()) {
    for (const action of allActions) {
      const existing = await moduleActionRepo.findOne({
        where: {
          moduleId: sub.moduleId,
          subModuleId: sub.id,
          actionId: action.id,
        },
      });
      if (!existing) {
        await moduleActionRepo.save(
          moduleActionRepo.create({
            moduleId: sub.moduleId,
            subModuleId: sub.id,
            actionId: action.id,
            isActive: true,
          }),
        );
      }
    }
  }

  // 6. Seed SUPER_ADMIN role
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

  // 3. Seed system admin user from ENV or defaults
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@system.local';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';

  let adminUser = await userRepo.findOne({ where: { email: adminEmail } });
  if (!adminUser) {
    // Generate emp_id using normal sequence
    const [lastUser] = await userRepo.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });
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
  const existingAuth = await authRepo.findOne({
    where: { userId: adminUser.empId },
  });
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
