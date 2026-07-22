import { MigrationInterface, QueryRunner } from 'typeorm';

export class PermissionProfiles1785000000004 implements MigrationInterface {
  name = 'PermissionProfiles1785000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create permission_profiles table
    await queryRunner.query(`
      CREATE TABLE "permission_profiles" (
        "id" SERIAL NOT NULL,
        "user_id" character varying(20) NOT NULL,
        "profile_type" character varying(20) NOT NULL,
        "department_id" integer,
        "role_id" integer,
        "buddy_user_id" character varying(20),
        "display_name" character varying(100),
        "status" character varying(20) NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permission_profiles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profiles"
      ADD CONSTRAINT "FK_permission_profiles_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("emp_id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profiles"
      ADD CONSTRAINT "FK_permission_profiles_department"
      FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profiles"
      ADD CONSTRAINT "FK_permission_profiles_role"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profiles"
      ADD CONSTRAINT "FK_permission_profiles_buddy"
      FOREIGN KEY ("buddy_user_id") REFERENCES "users"("emp_id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_permission_profiles_user_id" ON "permission_profiles" ("user_id")
    `);

    // 2. Create permission_profile_modules table
    await queryRunner.query(`
      CREATE TABLE "permission_profile_modules" (
        "id" SERIAL NOT NULL,
        "profile_id" integer NOT NULL,
        "module_id" integer NOT NULL,
        "display_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permission_profile_modules" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profile_modules"
      ADD CONSTRAINT "FK_ppm_profile"
      FOREIGN KEY ("profile_id") REFERENCES "permission_profiles"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profile_modules"
      ADD CONSTRAINT "FK_ppm_module"
      FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ppm_profile_id" ON "permission_profile_modules" ("profile_id")
    `);

    // 3. Create permission_profile_sub_modules table
    await queryRunner.query(`
      CREATE TABLE "permission_profile_sub_modules" (
        "id" SERIAL NOT NULL,
        "profile_module_id" integer NOT NULL,
        "sub_module_id" integer NOT NULL,
        "parent_submodule_id" integer,
        "inherit_future_projects" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permission_profile_sub_modules" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profile_sub_modules"
      ADD CONSTRAINT "FK_ppsm_profile_module"
      FOREIGN KEY ("profile_module_id") REFERENCES "permission_profile_modules"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profile_sub_modules"
      ADD CONSTRAINT "FK_ppsm_sub_module"
      FOREIGN KEY ("sub_module_id") REFERENCES "sub_modules"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ppsm_profile_module_id" ON "permission_profile_sub_modules" ("profile_module_id")
    `);

    // 4. Create permission_profile_projects table
    await queryRunner.query(`
      CREATE TABLE "permission_profile_projects" (
        "id" SERIAL NOT NULL,
        "profile_sub_module_id" integer NOT NULL,
        "project_id" integer NOT NULL,
        "selected_by" character varying(20),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permission_profile_projects" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profile_projects"
      ADD CONSTRAINT "FK_ppp_profile_sub_module"
      FOREIGN KEY ("profile_sub_module_id") REFERENCES "permission_profile_sub_modules"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "permission_profile_projects"
      ADD CONSTRAINT "FK_ppp_project"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ppp_profile_sub_module_id" ON "permission_profile_projects" ("profile_sub_module_id")
    `);

    // 5. Backward compatibility migration: create PRIMARY permission profiles
    //    for existing users who have user_roles
    await queryRunner.query(`
      INSERT INTO "permission_profiles" ("user_id", "profile_type", "department_id", "role_id", "display_name", "status")
      SELECT DISTINCT ON (ur."user_id")
        ur."user_id",
        'PRIMARY',
        ur."department_id",
        ur."role_id",
        'Primary',
        'ACTIVE'
      FROM "user_roles" ur
      WHERE ur."user_id" IS NOT NULL
      ORDER BY ur."user_id", ur."assigned_at" ASC
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "permission_profile_projects"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permission_profile_sub_modules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permission_profile_modules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permission_profiles"`);
  }
}
