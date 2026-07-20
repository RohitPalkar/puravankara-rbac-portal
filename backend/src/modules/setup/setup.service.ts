import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from '../organization/entities/department.entity';
import { Project } from '../projects/entities/project.entity';
import { Module } from '../product-catalog/entities/module.entity';
import { Zone } from '../geography/entities/zone.entity';
import { City } from '../geography/entities/city.entity';

import { Role } from '../organization/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { SystemSettingService } from './services/system-setting.service';
import { SetupStatus, EntityStatus } from './dto/setup-status.dto';

@Injectable()
export class SetupService {
  private readonly logger = new Logger(SetupService.name);

  private readonly ZONE_NAMES = ['North', 'South', 'East', 'West'];

  private readonly ZONE_CITIES: Record<string, string[]> = {
    North: ['Delhi', 'Chandigarh', 'Lucknow', 'Jaipur', 'Srinagar'],
    South: ['Bangalore', 'Chennai', 'Hyderabad', 'Kochi', 'Coimbatore'],
    East: ['Kolkata', 'Bhubaneswar', 'Patna', 'Guwahati', 'Ranchi'],
    West: ['Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Goa'],
  };

  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Module)
    private readonly moduleRepo: Repository<Module>,
    @InjectRepository(Zone)
    private readonly zoneRepo: Repository<Zone>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly systemSettings: SystemSettingService,
  ) {}

  async getStatus(): Promise<SetupStatus> {
    const [
      deptCount,
      projectCount,
      moduleCount,
      zoneCount,
      cityCount,
      roleCount,
      totalUserCount,
      adminCount,
    ] = await Promise.all([
      this.deptRepo.count({ where: { deletedAt: null } }),
      this.projectRepo.count({ where: { deletedAt: null } }),
      this.moduleRepo.count({ where: { isActive: true } }),
      this.zoneRepo.count({ where: { deletedAt: null } }),
      this.cityRepo.count({ where: { deletedAt: null } }),
      this.roleRepo.count({ where: { isSystemRole: false, deletedAt: null } }),
      this.userRepo.count({ where: { deletedAt: null } }),
      this.userRepo.count({
        where: { deletedAt: null, email: 'admin@system.local' },
      }),
    ]);

    const entries: [string, number][] = [
      ['department', deptCount],
      ['project', projectCount],
      ['module', moduleCount],
      ['zone', zoneCount],
      ['city', cityCount],
      ['role', roleCount],
      ['user', totalUserCount - adminCount],
    ];

    const required: string[] = [];
    const status: Record<string, EntityStatus> = {};

    for (const [key, count] of entries) {
      const exists = count > 0;
      status[key] = { exists, count };
      if (!exists) required.push(key);
    }

    const setupCompleted = required.length === 0;

    if (setupCompleted) {
      await this.systemSettings.markSetupCompleted();
    }

    return {
      setupCompleted,
      required,
      status,
    };
  }

  async reset(): Promise<void> {
    const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@system.local';

    const q = (sql: string, params?: any[]) =>
      this.zoneRepo.manager.query(sql, params);

    // Reset admin auth lock and password
    const hash = await bcrypt.hash(
      process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
      10,
    );
    await q(
      `UPDATE user_auth SET is_locked = false, failed_attempts = 0, password_hash = $1 WHERE user_id IN (SELECT emp_id FROM users WHERE email = $2)`,
      [hash, ADMIN_EMAIL],
    );

    // Delete non-admin users (cascading deletes handle related tables)
    await q(
      `DELETE FROM user_permission_templates WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`,
      [ADMIN_EMAIL],
    );
    await q(
      `DELETE FROM user_project_feature_matrix WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`,
      [ADMIN_EMAIL],
    );
    await q(
      `DELETE FROM user_permission_overrides WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`,
      [ADMIN_EMAIL],
    );
    await q(
      `DELETE FROM user_project_access WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`,
      [ADMIN_EMAIL],
    );
    await q(
      `DELETE FROM user_reporting_lines WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`,
      [ADMIN_EMAIL],
    );
    await q(
      `DELETE FROM user_zones WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`,
      [ADMIN_EMAIL],
    );
    await q(
      `DELETE FROM user_roles WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`,
      [ADMIN_EMAIL],
    );
    await q(
      `DELETE FROM user_auth WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`,
      [ADMIN_EMAIL],
    );
    await q(`DELETE FROM users WHERE email != $1`, [ADMIN_EMAIL]);

    // Clear and reseed geography
    await q(`DELETE FROM city_zone_mappings`);
    await q(`DELETE FROM cities`);
    await q(`DELETE FROM zones`);

    for (const name of this.ZONE_NAMES) {
      await q(`INSERT INTO zones (name, is_active) VALUES ($1, true)`, [name]);
    }

    const allZones = await q(`SELECT id, name FROM zones`);

    for (const [zoneName, cityNames] of Object.entries(this.ZONE_CITIES)) {
      const zone = allZones.find((z: any) => z.name === zoneName);
      if (!zone) continue;
      for (const cityName of cityNames) {
        const r = await q(
          `INSERT INTO cities (name, is_active) VALUES ($1, true) RETURNING id`,
          [cityName],
        );
        await q(
          `INSERT INTO city_zone_mappings (city_id, zone_id) VALUES ($1, $2)`,
          [r[0].id, zone.id],
        );
      }
    }

    // Re-seed modules and sub-modules
    await q(`DELETE FROM module_actions`);
    await q(`DELETE FROM sub_modules`);
    await q(`DELETE FROM modules`);
    await q(
      `DELETE FROM actions WHERE code NOT IN ('VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT')`,
    );

    // Modules
    const moduleInserts: { name: string; code: string }[] = [
      { name: 'Geography', code: 'GEOGRAPHY' },
      { name: 'Brands', code: 'BRANDS' },
      { name: 'Organization', code: 'ORGANIZATION' },
      { name: 'Product Config', code: 'PRODUCT_CONFIG' },
      { name: 'Projects', code: 'PROJECTS' },
      { name: 'Users', code: 'USERS' },
      { name: 'Permissions', code: 'PERMISSIONS' },
    ];
    const modIds: Record<string, number> = {};
    for (const m of moduleInserts) {
      const r = await q(
        `INSERT INTO modules (name, code, is_active) VALUES ($1, $2, true) RETURNING id`,
        [m.name, m.code],
      );
      modIds[m.name] = r[0].id;
    }

    // Actions
    const actionCodes = [
      'VIEW',
      'CREATE',
      'UPDATE',
      'DELETE',
      'APPROVE',
      'REJECT',
      'EXPORT',
      'IMPORT',
    ];
    const actIds: Record<string, number> = {};
    for (const code of actionCodes) {
      const existing = await q(`SELECT id FROM actions WHERE code = $1`, [
        code,
      ]);
      if (existing.length > 0) {
        actIds[code] = existing[0].id;
      } else {
        const r = await q(
          `INSERT INTO actions (code, label, is_active) VALUES ($1, $2, true) RETURNING id`,
          [code, code.charAt(0) + code.slice(1).toLowerCase()],
        );
        actIds[code] = r[0].id;
      }
    }

    // Sub-modules
    const subModuleInserts: { name: string; moduleName: string }[] = [
      { name: 'ZONES', moduleName: 'Geography' },
      { name: 'CITIES', moduleName: 'Geography' },
      { name: 'BRANDS', moduleName: 'Brands' },
      { name: 'DEPARTMENTS', moduleName: 'Organization' },
      { name: 'ROLES', moduleName: 'Organization' },
      { name: 'MODULES', moduleName: 'Product Config' },
      { name: 'SUB_MODULES', moduleName: 'Product Config' },
      { name: 'ACTIONS', moduleName: 'Product Config' },
      { name: 'PROJECTS', moduleName: 'Projects' },
      { name: 'USERS', moduleName: 'Users' },
      { name: 'PERMISSIONS', moduleName: 'Permissions' },
    ];
    const subIds: Record<string, number> = {};
    for (const sm of subModuleInserts) {
      const modId = modIds[sm.moduleName];
      if (!modId) continue;
      const r = await q(
        `INSERT INTO sub_modules (module_id, name, is_active) VALUES ($1, $2, true) RETURNING id`,
        [modId, sm.name],
      );
      subIds[sm.name] = r[0].id;
    }

    // Module-actions (link all actions to all sub-modules)
    for (const [subName, subId] of Object.entries(subIds)) {
      const subMod = subModuleInserts.find((sm) => sm.name === subName);
      if (!subMod) continue;
      const modId = modIds[subMod.moduleName];
      if (!modId) continue;
      for (const actionCode of actionCodes) {
        const actId = actIds[actionCode];
        if (!actId) continue;
        await q(
          `INSERT INTO module_actions (module_id, sub_module_id, action_id, is_active) VALUES ($1, $2, $3, true) ON CONFLICT DO NOTHING`,
          [modId, subId, actId],
        );
      }
    }

    this.logger.log(
      'Reset complete: zones/cities reseeded; modules/sub-modules seeded; non-admin users removed',
    );
  }
}
