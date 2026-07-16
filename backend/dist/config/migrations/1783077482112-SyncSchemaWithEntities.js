"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncSchemaWithEntities1783077482112 = void 0;
class SyncSchemaWithEntities1783077482112 {
    name = 'SyncSchemaWithEntities1783077482112';
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "roles"
      ADD COLUMN IF NOT EXISTS "is_system_role" boolean NOT NULL DEFAULT false
    `);
        await queryRunner.query(`
      ALTER TABLE "projects"
      ADD COLUMN IF NOT EXISTS "extended_metadata" jsonb
    `);
        await queryRunner.query(`
      ALTER TABLE "user_roles"
      ADD COLUMN IF NOT EXISTS "id" SERIAL
    `);
        await queryRunner.query(`
      ALTER TABLE "user_roles"
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);
        await queryRunner.query(`
      ALTER TABLE "user_roles"
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);
        const pkExists = await queryRunner.query(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'user_roles'
        AND constraint_type = 'PRIMARY KEY'
        AND constraint_name ILIKE '%pk%'
    `);
        if (pkExists.length > 0) {
            await queryRunner.query(`
        ALTER TABLE "user_roles" DROP CONSTRAINT "${pkExists[0].constraint_name}" CASCADE
      `);
        }
        await queryRunner.query(`
      ALTER TABLE "user_roles"
      ALTER COLUMN "department_id" DROP NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "user_roles" ADD PRIMARY KEY ("id")
    `);
        await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'UQ_user_roles_composite'
            AND conrelid = 'user_roles'::regclass
        ) THEN
          ALTER TABLE "user_roles"
          ADD CONSTRAINT "UQ_user_roles_composite"
          UNIQUE ("user_id", "department_id", "role_id");
        END IF;
      END $$;
    `);
        await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "department_id" DROP NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "approval_steps"
      ALTER COLUMN "department_id" DROP NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "approval_steps"
      ALTER COLUMN "level_rank" DROP NOT NULL
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" character varying,
        "updated_by" character varying,
        "user_id" character varying NOT NULL,
        "title" character varying NOT NULL,
        "message" text,
        "notification_type" character varying,
        "priority" character varying,
        "reference_type" character varying,
        "reference_id" character varying,
        "metadata" json,
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_user_read"
      ON "notifications" ("user_id", "is_read")
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notification_preferences" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" character varying,
        "updated_by" character varying,
        "user_id" character varying NOT NULL,
        "email_enabled" boolean NOT NULL DEFAULT true,
        "in_app_enabled" boolean NOT NULL DEFAULT true,
        "push_enabled" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_notification_preferences" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_preferences_user" UNIQUE ("user_id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "system_settings" (
        "key" character varying NOT NULL,
        "value" jsonb NOT NULL,
        CONSTRAINT "PK_system_settings" PRIMARY KEY ("key")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_zones" (
        "user_id" character varying NOT NULL,
        "zone_id" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_zones" PRIMARY KEY ("user_id", "zone_id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permission_snapshot_history" (
        "id" SERIAL NOT NULL,
        "user_id" character varying NOT NULL,
        "project_id" integer NOT NULL,
        "snapshot" jsonb NOT NULL,
        "changed_by" character varying NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permission_snapshot_history" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_project_feature_matrix" (
        "id" SERIAL NOT NULL,
        "user_id" character varying NOT NULL,
        "project_id" integer NOT NULL,
        "feature_privileges_document" jsonb,
        "generated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_user_project_feature_matrix" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_project_feature_matrix" UNIQUE ("user_id", "project_id")
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "user_project_feature_matrix"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "permission_snapshot_history"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_zones"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "system_settings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
        await queryRunner.query(`
      ALTER TABLE "approval_steps"
      ALTER COLUMN "level_rank" SET NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "approval_steps"
      ALTER COLUMN "department_id" SET NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "department_id" SET NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "user_roles"
      ALTER COLUMN "department_id" SET NOT NULL
    `);
        await queryRunner.query(`
      ALTER TABLE "user_roles" DROP COLUMN IF EXISTS "updated_at"
    `);
        await queryRunner.query(`
      ALTER TABLE "user_roles" DROP COLUMN IF EXISTS "created_at"
    `);
        await queryRunner.query(`
      ALTER TABLE "user_roles" DROP COLUMN IF EXISTS "id"
    `);
        await queryRunner.query(`
      ALTER TABLE "projects" DROP COLUMN IF EXISTS "extended_metadata"
    `);
        await queryRunner.query(`
      ALTER TABLE "roles" DROP COLUMN IF EXISTS "is_system_role"
    `);
    }
}
exports.SyncSchemaWithEntities1783077482112 = SyncSchemaWithEntities1783077482112;
//# sourceMappingURL=1783077482112-SyncSchemaWithEntities.js.map