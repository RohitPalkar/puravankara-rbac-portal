import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getZoneOverview() {
    const rows = await this.dataSource.query(
      `SELECT 
        z.id, z.name,
        COUNT(DISTINCT pl.project_id)::int AS project_count,
        COUNT(DISTINCT uz.user_id)::int AS user_count
      FROM zones z
      LEFT JOIN project_locations pl ON pl.zone_id = z.id
        AND pl.project_id IN (SELECT id FROM projects WHERE deleted_at IS NULL)
      LEFT JOIN user_zones uz ON uz.zone_id = z.id
        AND uz.user_id IN (SELECT emp_id FROM users WHERE deleted_at IS NULL)
      WHERE z.deleted_at IS NULL
      GROUP BY z.id, z.name
      ORDER BY z.name`,
    );
    return rows;
  }

  async getSecurityStats() {
    const [lockedResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM user_auth WHERE is_locked = true`,
    );
    const [todayLoginsResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM user_sessions WHERE created_at >= CURRENT_DATE`,
    );
    return {
      todayLogins: todayLoginsResult?.count ?? 0,
      failedLogins: 0,
      lockedAccounts: lockedResult?.count ?? 0,
      passwordExpiring: 0,
    };
  }

  async getOperationsSummary() {
    const [pendingApprovalsResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM approval_requests WHERE status = 'PENDING'`,
    );
    const [usersWithoutRolesResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM users u
       WHERE u.deleted_at IS NULL
       AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.emp_id)`,
    );
    const [inactiveUsersResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM users WHERE deleted_at IS NULL AND is_active = false`,
    );
    return {
      pendingApprovals: pendingApprovalsResult?.count ?? 0,
      permissionRequests: 0,
      usersWithoutRoles: usersWithoutRolesResult?.count ?? 0,
      inactiveUsers: inactiveUsersResult?.count ?? 0,
    };
  }

  async getKpis() {
    const [totalUsersResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM users WHERE deleted_at IS NULL`,
    );
    const [activeUsersResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM users WHERE deleted_at IS NULL AND is_active = true`,
    );
    const [totalProjectsResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM projects WHERE deleted_at IS NULL`,
    );
    const [departmentsResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM departments WHERE deleted_at IS NULL`,
    );
    const [rolesResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM roles WHERE deleted_at IS NULL`,
    );
    const [todayEventsResult] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS count FROM audit_logs WHERE created_at >= CURRENT_DATE`,
    );
    return {
      totalUsers: totalUsersResult?.count ?? 0,
      activeUsers: activeUsersResult?.count ?? 0,
      totalProjects: totalProjectsResult?.count ?? 0,
      departments: departmentsResult?.count ?? 0,
      permissionProfiles: rolesResult?.count ?? 0,
      todayEvents: todayEventsResult?.count ?? 0,
    };
  }
}
