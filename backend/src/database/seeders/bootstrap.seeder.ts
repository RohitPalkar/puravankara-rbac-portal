import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../../modules/organization/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { UserAuth } from '../../modules/auth/entities/user-auth.entity';
import { UserRole } from '../../modules/users/entities/user-role.entity';
import { Action } from '../../modules/product-catalog/entities/action.entity';
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

export async function bootstrapSeeder(dataSource: DataSource): Promise<void> {
  const roleRepo = dataSource.getRepository(Role);
  const userRepo = dataSource.getRepository(User);
  const authRepo = dataSource.getRepository(UserAuth);
  const userRoleRepo = dataSource.getRepository(UserRole);
  const actionRepo = dataSource.getRepository(Action);
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

  // 2. Seed SUPER_ADMIN role
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
