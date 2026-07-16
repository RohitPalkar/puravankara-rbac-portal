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
      this.userRepo.count({ where: { deletedAt: null, email: 'admin@system.local' } }),
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

    const q = (sql: string, params?: any[]) => this.zoneRepo.manager.query(sql, params);

    // Reset admin auth lock and password
    const hash = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456', 10);
    await q(`UPDATE user_auth SET is_locked = false, failed_attempts = 0, password_hash = $1 WHERE user_id IN (SELECT emp_id FROM users WHERE email = $2)`, [hash, ADMIN_EMAIL]);

    // Delete non-admin users (cascading deletes handle related tables)
    await q(`DELETE FROM user_permission_templates WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
    await q(`DELETE FROM user_project_feature_matrix WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
    await q(`DELETE FROM user_permission_overrides WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
    await q(`DELETE FROM user_project_access WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
    await q(`DELETE FROM user_reporting_lines WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
    await q(`DELETE FROM user_zones WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
    await q(`DELETE FROM user_roles WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
    await q(`DELETE FROM user_auth WHERE user_id IN (SELECT emp_id FROM users WHERE email != $1)`, [ADMIN_EMAIL]);
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
        const r = await q(`INSERT INTO cities (name, is_active) VALUES ($1, true) RETURNING id`, [cityName]);
        await q(`INSERT INTO city_zone_mappings (city_id, zone_id) VALUES ($1, $2)`, [r[0].id, zone.id]);
      }
    }

    this.logger.log('Reset complete: zones/cities reseeded; non-admin users removed');
  }
}
