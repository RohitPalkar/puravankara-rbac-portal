import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncAllEntityColumns1785000000005 implements MigrationInterface {
  name = 'SyncAllEntityColumns1785000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============ ACTION GROUPS ============
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "action_groups" (
        "id" SERIAL NOT NULL,
        "sub_module_id" integer NOT NULL,
        "name" character varying NOT NULL,
        "code" character varying,
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_by" character varying,
        "updated_by" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_action_groups" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_action_groups_name_per_submodule" UNIQUE ("sub_module_id", "name")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "action_groups" ADD CONSTRAINT "FK_action_groups_sub_module"
      FOREIGN KEY ("sub_module_id") REFERENCES "sub_modules"("id") ON DELETE CASCADE
    `);

    // ============ ACTIONS - missing columns ============
    await queryRunner.query(`ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "action_group_id" integer`);
    await queryRunner.query(`ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "display_order" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "name" character varying`);
    await queryRunner.query(`UPDATE "actions" SET "name" = COALESCE("label", "code") WHERE "name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "actions" ALTER COLUMN "name" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "actions" ADD CONSTRAINT "FK_actions_action_group" FOREIGN KEY ("action_group_id") REFERENCES "action_groups"("id") ON DELETE SET NULL`);

    // Populate action_groups and link actions
    await queryRunner.query(`
      INSERT INTO "action_groups" ("sub_module_id", "name", "code", "display_order", "is_active")
      SELECT DISTINCT ma."sub_module_id", sm."name" || ' Actions', 'GRP_' || sm."name", 0, TRUE
      FROM "module_actions" ma JOIN "sub_modules" sm ON sm."id" = ma."sub_module_id"
      WHERE ma."sub_module_id" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "action_groups" ag WHERE ag."sub_module_id" = ma."sub_module_id")
    `);
    await queryRunner.query(`
      UPDATE "actions" a SET "action_group_id" = ag."id"
      FROM "module_actions" ma JOIN "action_groups" ag ON ag."sub_module_id" = ma."sub_module_id"
      WHERE ma."action_id" = a."id" AND a."action_group_id" IS NULL
    `);

    // ============ ROLE ACTION PERMISSIONS ============
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_action_permissions" (
        "id" SERIAL NOT NULL,
        "role_id" integer NOT NULL,
        "module_id" integer NOT NULL,
        "sub_module_id" integer,
        "action_group_id" integer,
        "action_id" integer NOT NULL,
        "created_by" character varying,
        "updated_by" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_role_action_permissions" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`ALTER TABLE "role_action_permissions" ADD CONSTRAINT "FK_rap_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "role_action_permissions" ADD CONSTRAINT "FK_rap_module" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "role_action_permissions" ADD CONSTRAINT "FK_rap_sub_module" FOREIGN KEY ("sub_module_id") REFERENCES "sub_modules"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "role_action_permissions" ADD CONSTRAINT "FK_rap_action" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_rap_role_action" ON "role_action_permissions" ("role_id", "action_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_rap_role_id" ON "role_action_permissions" ("role_id")`);

    // ============ DEPARTMENTS ============
    await queryRunner.query(`ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "department_admin_id" character varying`);

    // ============ ZONES ============
    await queryRunner.query(`ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "salary_capping" numeric(10,2)`);
    await queryRunner.query(`ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "start_date" date`);
    await queryRunner.query(`ALTER TABLE "zones" ADD COLUMN IF NOT EXISTS "end_date" date`);

    // ============ MODULES ============
    await queryRunner.query(`ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "is_permission_configurable" boolean NOT NULL DEFAULT true`);

    // ============ SUB MODULES ============
    await queryRunner.query(`ALTER TABLE "sub_modules" ADD COLUMN IF NOT EXISTS "display_order" integer NOT NULL DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "sub_modules" ADD COLUMN IF NOT EXISTS "is_permission_configurable" boolean NOT NULL DEFAULT true`);

    // ============ PROJECTS ============
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "brand_id" integer`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "city_id" integer`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "pan_number" character varying`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "address_1" character varying`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "address_2" character varying`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "pin_code" character varying`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "project_image" character varying`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "jv_logo" character varying`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "sfdc_project_name" character varying`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "codename" character varying`);
    await queryRunner.query(`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "terms_html" text`);

    // ============ JUNCTION TABLE AUDIT COLUMNS ============
    // user_reporting_lines
    await queryRunner.query(`ALTER TABLE "user_reporting_lines" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user_reporting_lines" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    // project_group_projects
    await queryRunner.query(`ALTER TABLE "project_group_projects" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "project_group_projects" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    // user_project_groups
    await queryRunner.query(`ALTER TABLE "user_project_groups" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user_project_groups" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    // user_permission_templates
    await queryRunner.query(`ALTER TABLE "user_permission_templates" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "user_permission_templates" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    // action_permission_scopes
    await queryRunner.query(`ALTER TABLE "action_permission_scopes" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "action_permission_scopes" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);

    // permission_profile_sub_modules
    await queryRunner.query(`ALTER TABLE "permission_profile_sub_modules" ADD COLUMN IF NOT EXISTS "parent_submodule_id" integer`);
    await queryRunner.query(`ALTER TABLE "permission_profile_sub_modules" ADD CONSTRAINT "FK_ppsm_parent_submodule" FOREIGN KEY ("parent_submodule_id") REFERENCES "sub_modules"("id") ON DELETE SET NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order
    await queryRunner.query(`ALTER TABLE "permission_profile_sub_modules" DROP CONSTRAINT IF EXISTS "FK_ppsm_parent_submodule"`);
    await queryRunner.query(`ALTER TABLE "permission_profile_sub_modules" DROP COLUMN IF EXISTS "parent_submodule_id"`);
    await queryRunner.query(`ALTER TABLE "action_permission_scopes" DROP COLUMN IF EXISTS "updated_at"`);
    await queryRunner.query(`ALTER TABLE "action_permission_scopes" DROP COLUMN IF EXISTS "created_at"`);
    await queryRunner.query(`ALTER TABLE "user_permission_templates" DROP COLUMN IF EXISTS "updated_at"`);
    await queryRunner.query(`ALTER TABLE "user_permission_templates" DROP COLUMN IF EXISTS "created_at"`);
    await queryRunner.query(`ALTER TABLE "user_project_groups" DROP COLUMN IF EXISTS "updated_at"`);
    await queryRunner.query(`ALTER TABLE "user_project_groups" DROP COLUMN IF EXISTS "created_at"`);
    await queryRunner.query(`ALTER TABLE "project_group_projects" DROP COLUMN IF EXISTS "updated_at"`);
    await queryRunner.query(`ALTER TABLE "project_group_projects" DROP COLUMN IF EXISTS "created_at"`);
    await queryRunner.query(`ALTER TABLE "user_reporting_lines" DROP COLUMN IF EXISTS "updated_at"`);
    await queryRunner.query(`ALTER TABLE "user_reporting_lines" DROP COLUMN IF EXISTS "created_at"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "terms_html"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "codename"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "sfdc_project_name"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "jv_logo"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "project_image"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "pin_code"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "address_2"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "address_1"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "pan_number"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "city_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN IF EXISTS "brand_id"`);
    await queryRunner.query(`ALTER TABLE "sub_modules" DROP COLUMN IF EXISTS "is_permission_configurable"`);
    await queryRunner.query(`ALTER TABLE "sub_modules" DROP COLUMN IF EXISTS "display_order"`);
    await queryRunner.query(`ALTER TABLE "modules" DROP COLUMN IF EXISTS "is_permission_configurable"`);
    await queryRunner.query(`ALTER TABLE "zones" DROP COLUMN IF EXISTS "end_date"`);
    await queryRunner.query(`ALTER TABLE "zones" DROP COLUMN IF EXISTS "start_date"`);
    await queryRunner.query(`ALTER TABLE "zones" DROP COLUMN IF EXISTS "salary_capping"`);
    await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN IF EXISTS "department_admin_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rap_role_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rap_role_action"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_action_permissions"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP CONSTRAINT IF EXISTS "FK_actions_action_group"`);
    await queryRunner.query(`ALTER TABLE "actions" ALTER COLUMN "name" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN IF EXISTS "name"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN IF EXISTS "display_order"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN IF EXISTS "action_group_id"`);
    await queryRunner.query(`ALTER TABLE "action_groups" DROP CONSTRAINT IF EXISTS "FK_action_groups_sub_module"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "action_groups"`);
  }
}
