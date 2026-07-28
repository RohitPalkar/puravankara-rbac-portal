import { MigrationInterface, QueryRunner } from 'typeorm';

export class DepartmentZoneFK1785000000008 implements MigrationInterface {
  name = 'DepartmentZoneFK1785000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "zone_id" integer`,
    );

    // Ensure zone_mappings exist for fresh-install scenario
    // (migration 0006 seeded departments but never populated mappings)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF (SELECT COUNT(*) FROM department_zone_mappings) = 0 THEN
          INSERT INTO department_zone_mappings (department_id, zone_id)
          SELECT d.id, z.id
          FROM departments d
          CROSS JOIN zones z;
        END IF;
      END $$;
    `);

    // Migrate single-zone departments
    await queryRunner.query(
      `UPDATE departments d
       SET zone_id = dzm.zone_id
       FROM department_zone_mappings dzm
       WHERE dzm.department_id = d.id
         AND d.id IN (
           SELECT department_id
           FROM department_zone_mappings
           GROUP BY department_id
           HAVING COUNT(*) = 1
         )`,
    );

    // Split multi-zone departments: clone for each additional zone
    await queryRunner.query(`
      DO $$
      DECLARE
        multi RECORD;
        new_dept_id INTEGER;
      BEGIN
        FOR multi IN
          SELECT d.id AS dept_id, d.name, d.max_hierarchy_levels,
                 d.is_active, d.department_admin_id, dzm.zone_id
          FROM departments d
          JOIN department_zone_mappings dzm ON dzm.department_id = d.id
          WHERE d.id IN (
            SELECT department_id
            FROM department_zone_mappings
            GROUP BY department_id
            HAVING COUNT(*) > 1
          )
          ORDER BY d.id, dzm.zone_id
        LOOP
          IF NOT EXISTS (
            SELECT 1 FROM departments WHERE id = multi.dept_id AND zone_id IS NOT NULL
          ) THEN
            UPDATE departments SET zone_id = multi.zone_id WHERE id = multi.dept_id;
          ELSE
            INSERT INTO departments (name, max_hierarchy_levels, zone_id, is_active, department_admin_id)
            VALUES (multi.name, multi.max_hierarchy_levels, multi.zone_id, multi.is_active, multi.department_admin_id)
            RETURNING id INTO new_dept_id;

            INSERT INTO department_hierarchy_levels (department_id, role_id, level_number, role_name, display_order, is_active)
            SELECT new_dept_id, role_id, level_number, role_name, display_order, is_active
            FROM department_hierarchy_levels
            WHERE department_id = multi.dept_id;

            INSERT INTO department_roles (department_id, role_id)
            SELECT new_dept_id, role_id
            FROM department_roles
            WHERE department_id = multi.dept_id;
          END IF;
        END LOOP;
      END $$;
    `);

    // Default zone for any remaining unmapped departments
    await queryRunner.query(
      `UPDATE departments SET zone_id = (SELECT id FROM zones ORDER BY id ASC LIMIT 1)
       WHERE zone_id IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "departments" ALTER COLUMN "zone_id" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "departments"
       ADD CONSTRAINT "FK_departments_zone"
       FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_departments_zone_id"
       ON "departments" ("zone_id")`,
    );

    // Drop old name unique, add composite (name, zone_id)
    const constraints = await queryRunner.query(
      `SELECT conname FROM pg_constraint
       WHERE conrelid = 'departments'::regclass
         AND contype = 'u'`,
    );
    for (const row of constraints) {
      await queryRunner.query(
        `ALTER TABLE "departments" DROP CONSTRAINT IF EXISTS "${row.conname}"`,
      );
    }
    await queryRunner.query(
      `ALTER TABLE "departments"
       ADD CONSTRAINT "UQ_departments_name_zone" UNIQUE ("name", "zone_id")`,
    );

    // Drop department_zone_mappings
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_dzm_unique"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_dzm_zone_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_dzm_department_id"`);
    await queryRunner.query(
      `ALTER TABLE "department_zone_mappings" DROP CONSTRAINT IF EXISTS "FK_dzm_zone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_zone_mappings" DROP CONSTRAINT IF EXISTS "FK_dzm_department"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "department_zone_mappings"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "department_zone_mappings" (
        "id" SERIAL NOT NULL,
        "department_id" integer NOT NULL,
        "zone_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_department_zone_mappings" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_zone_mappings" ADD CONSTRAINT "FK_dzm_department"
       FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_zone_mappings" ADD CONSTRAINT "FK_dzm_zone"
       FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE`,
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

    await queryRunner.query(
      `INSERT INTO department_zone_mappings (department_id, zone_id)
       SELECT id, zone_id FROM departments WHERE zone_id IS NOT NULL`,
    );

    const constraints = await queryRunner.query(
      `SELECT conname FROM pg_constraint
       WHERE conrelid = 'departments'::regclass
         AND contype = 'u'`,
    );
    for (const row of constraints) {
      await queryRunner.query(
        `ALTER TABLE "departments" DROP CONSTRAINT IF EXISTS "${row.conname}"`,
      );
    }
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "UQ_departments_name" UNIQUE ("name")`,
    );

    // Remove cloned departments (same name group, keep lowest id)
    await queryRunner.query(`
      WITH cloned AS (
        SELECT d.id
        FROM departments d
        WHERE d.id NOT IN (
          SELECT MIN(d2.id) FROM departments d2 GROUP BY d2.name
        )
      )
      , del_hl AS (
        DELETE FROM department_hierarchy_levels
        WHERE department_id IN (SELECT id FROM cloned)
      )
      , del_dr AS (
        DELETE FROM department_roles
        WHERE department_id IN (SELECT id FROM cloned)
      )
      DELETE FROM departments d
      WHERE d.id IN (SELECT id FROM cloned)
    `);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_departments_zone_id"`);
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT IF EXISTS "FK_departments_zone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP COLUMN IF EXISTS "zone_id"`,
    );
  }
}
