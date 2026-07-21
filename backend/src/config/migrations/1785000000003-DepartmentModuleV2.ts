import { MigrationInterface, QueryRunner } from 'typeorm';

export class DepartmentModuleV21785000000003 implements MigrationInterface {
  name = 'DepartmentModuleV21785000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add department_admin_id to departments
    await queryRunner.query(
      `ALTER TABLE "departments" ADD COLUMN "department_admin_id" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_departments_admin" FOREIGN KEY ("department_admin_id") REFERENCES "users"("emp_id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_departments_department_admin_id" ON "departments" ("department_admin_id")`,
    );

    // 2. Enhance department_hierarchy_levels
    // Rename level_rank -> level_number
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" RENAME COLUMN "level_rank" TO "level_number"`,
    );
    // Rename label -> role_name
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" RENAME COLUMN "label" TO "role_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" ALTER COLUMN "role_name" SET NOT NULL`,
    );
    // Add display_order and populate from level_number
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" ADD COLUMN "display_order" integer`,
    );
    await queryRunner.query(
      `UPDATE "department_hierarchy_levels" SET "display_order" = "level_number"`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" ALTER COLUMN "display_order" SET NOT NULL`,
    );
    // Add indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_dhl_department_id" ON "department_hierarchy_levels" ("department_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dhl_department_level" ON "department_hierarchy_levels" ("department_id", "level_number")`,
    );

    // 3. Create department_zone_mappings table
    await queryRunner.query(
      `CREATE TABLE "department_zone_mappings" (` +
        `"id" SERIAL NOT NULL,` +
        `"department_id" integer NOT NULL,` +
        `"zone_id" integer NOT NULL,` +
        `"created_at" TIMESTAMP NOT NULL DEFAULT now(),` +
        `"updated_at" TIMESTAMP NOT NULL DEFAULT now(),` +
        `CONSTRAINT "PK_department_zone_mappings" PRIMARY KEY ("id")` +
        `)`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_zone_mappings" ADD CONSTRAINT "FK_dzm_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_zone_mappings" ADD CONSTRAINT "FK_dzm_zone" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dzm_department_id" ON "department_zone_mappings" ("department_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dzm_zone_id" ON "department_zone_mappings" ("zone_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_dzm_unique" ON "department_zone_mappings" ("department_id", "zone_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop department_zone_mappings
    await queryRunner.query(`DROP INDEX "IDX_dzm_unique"`);
    await queryRunner.query(`DROP INDEX "IDX_dzm_zone_id"`);
    await queryRunner.query(`DROP INDEX "IDX_dzm_department_id"`);
    await queryRunner.query(
      `ALTER TABLE "department_zone_mappings" DROP CONSTRAINT "FK_dzm_zone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_zone_mappings" DROP CONSTRAINT "FK_dzm_department"`,
    );
    await queryRunner.query(`DROP TABLE "department_zone_mappings"`);

    // 2. Revert department_hierarchy_levels changes
    await queryRunner.query(`DROP INDEX "IDX_dhl_department_level"`);
    await queryRunner.query(`DROP INDEX "IDX_dhl_department_id"`);
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" DROP COLUMN "display_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" ALTER COLUMN "role_name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" RENAME COLUMN "role_name" TO "label"`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" RENAME COLUMN "level_number" TO "level_rank"`,
    );

    // 3. Drop department_admin_id from departments
    await queryRunner.query(`DROP INDEX "IDX_departments_department_admin_id"`);
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_departments_admin"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP COLUMN "department_admin_id"`,
    );
  }
}
