import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1785000000018 implements MigrationInterface {
  name = 'AddPerformanceIndexes1785000000018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Audit logs: common filter/sort is entity_name + created_at DESC + performed_by
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_entity_created" 
      ON "audit_logs" ("entity_name", "created_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_performed" 
      ON "audit_logs" ("performed_by", "created_at" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_audit_logs_action" 
      ON "audit_logs" ("action")
    `);

    // Role permissions: composite lookup (role + zone + dept)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_rap_role_zone_dept" 
      ON "role_action_permissions" ("role_id", "zone_id", "department_id")
    `);

    // Users: trigram for ILIKE search optimization (requires pg_trgm extension)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_name_trgm" 
      ON "users" USING gin ("name" gin_trgm_ops)
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_email_trgm" 
      ON "users" USING gin ("email" gin_trgm_ops)
    `);

    // Projects: city/zone filtering already via FK but add composite for location
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_project_locations_zone" 
      ON "project_locations" ("zone_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_projects_city" 
      ON "projects" ("city_id") WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_entity_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_performed"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rap_role_zone_dept"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_name_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email_trgm"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_project_locations_zone"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_projects_city"`);
  }
}
