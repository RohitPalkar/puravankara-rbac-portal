import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncActionGroupAndPermissions1785000000005 implements MigrationInterface {
  name = 'SyncActionGroupAndPermissions1785000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create action_groups table if not exists
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

    // 2. Add missing columns to actions table
    await queryRunner.query(`
      ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "action_group_id" integer
    `);
    await queryRunner.query(`
      ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "display_order" integer NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "actions" ADD COLUMN IF NOT EXISTS "name" character varying
    `);

    // 3. Populate action_groups from module_actions if empty
    await queryRunner.query(`
      INSERT INTO "action_groups" ("sub_module_id", "name", "code", "display_order", "is_active")
      SELECT DISTINCT ma."sub_module_id", sm."name" || ' Actions', 'GRP_' || sm."name", 0, TRUE
      FROM "module_actions" ma
      JOIN "sub_modules" sm ON sm."id" = ma."sub_module_id"
      WHERE ma."sub_module_id" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "action_groups" ag WHERE ag."sub_module_id" = ma."sub_module_id")
    `);

    // 4. Link actions to action_groups via module_actions
    await queryRunner.query(`
      UPDATE "actions" a
      SET "action_group_id" = ag."id"
      FROM "module_actions" ma
      JOIN "action_groups" ag ON ag."sub_module_id" = ma."sub_module_id"
      WHERE ma."action_id" = a."id" AND a."action_group_id" IS NULL
    `);

    // 5. Populate name column from label/code where missing
    await queryRunner.query(`
      UPDATE "actions" SET "name" = COALESCE("label", "code") WHERE "name" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "actions" ALTER COLUMN "name" SET NOT NULL
    `);

    // 6. Add foreign key for actions.action_group_id
    await queryRunner.query(`
      ALTER TABLE "actions" ADD CONSTRAINT "FK_actions_action_group"
      FOREIGN KEY ("action_group_id") REFERENCES "action_groups"("id") ON DELETE SET NULL
    `);

    // 7. Create role_action_permissions table if not exists
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

    await queryRunner.query(`
      ALTER TABLE "role_action_permissions" ADD CONSTRAINT "FK_rap_role"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "role_action_permissions" ADD CONSTRAINT "FK_rap_module"
      FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "role_action_permissions" ADD CONSTRAINT "FK_rap_sub_module"
      FOREIGN KEY ("sub_module_id") REFERENCES "sub_modules"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "role_action_permissions" ADD CONSTRAINT "FK_rap_action"
      FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE
    `);

    // 8. Add unique constraint on (role_id, action_id)
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_rap_role_action" ON "role_action_permissions" ("role_id", "action_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_rap_role_id" ON "role_action_permissions" ("role_id")
    `);

    // 9. Add missing parent_submodule_id column to permission_profile_sub_modules
    //    (created by migration #004 which may not have run yet)
    await queryRunner.query(`
      ALTER TABLE "permission_profile_sub_modules" ADD COLUMN IF NOT EXISTS "parent_submodule_id" integer
    `);
    await queryRunner.query(`
      ALTER TABLE "permission_profile_sub_modules" ADD CONSTRAINT "FK_ppsm_parent_submodule"
      FOREIGN KEY ("parent_submodule_id") REFERENCES "sub_modules"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rap_role_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rap_role_action"`);
    await queryRunner.query(`ALTER TABLE "permission_profile_sub_modules" DROP CONSTRAINT IF EXISTS "FK_ppsm_parent_submodule"`);
    await queryRunner.query(`ALTER TABLE "permission_profile_sub_modules" DROP COLUMN IF EXISTS "parent_submodule_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_action_permissions"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP CONSTRAINT IF EXISTS "FK_actions_action_group"`);
    await queryRunner.query(`ALTER TABLE "actions" ALTER COLUMN "name" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN IF EXISTS "name"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN IF EXISTS "display_order"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN IF EXISTS "action_group_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "action_groups"`);
  }
}
