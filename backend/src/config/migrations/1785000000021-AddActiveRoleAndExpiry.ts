import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveRoleAndExpiry1785000000021 implements MigrationInterface {
  name = 'AddActiveRoleAndExpiry1785000000021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. user_sessions.active_role_id — per-session active role context
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
      ADD COLUMN IF NOT EXISTS "active_role_id" integer NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'FK_user_sessions_active_role'
            AND table_name = 'user_sessions'
        ) THEN
          ALTER TABLE "user_sessions"
          ADD CONSTRAINT "FK_user_sessions_active_role"
          FOREIGN KEY ("active_role_id") REFERENCES "roles"("id") ON DELETE SET NULL;
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_sessions_active_role"
      ON "user_sessions" ("active_role_id")
    `);

    // 2. user_roles.expires_at — secondary role auto-expiry
    await queryRunner.query(`
      ALTER TABLE "user_roles"
      ADD COLUMN IF NOT EXISTS "expires_at" timestamptz NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_user_roles_expires_at"
      ON "user_roles" ("expires_at")
      WHERE "expires_at" IS NOT NULL
    `);

    // 2b. user_roles.role_type — PRIMARY / SECONDARY / BUDDY_RM
    await queryRunner.query(`
      ALTER TABLE "user_roles"
      ADD COLUMN IF NOT EXISTS "role_type" varchar(20) NULL
    `);

    // Backfill role_type: earliest assignment per user -> PRIMARY, rest SECONDARY
    await queryRunner.query(`
      WITH ranked AS (
        SELECT id, user_id,
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY assigned_at NULLS FIRST, id ASC) AS rn
        FROM "user_roles"
        WHERE "role_type" IS NULL
      )
      UPDATE "user_roles" ur
      SET "role_type" = CASE WHEN r.rn = 1 THEN 'PRIMARY' ELSE 'SECONDARY' END
      FROM ranked r
      WHERE ur.id = r.id
    `);

    // 3. permission_profiles.expires_at — secondary profile auto-expiry
    await queryRunner.query(`
      ALTER TABLE "permission_profiles"
      ADD COLUMN IF NOT EXISTS "expires_at" timestamptz NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_permission_profiles_expires_at"
      ON "permission_profiles" ("expires_at")
      WHERE "expires_at" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_permission_profiles_expires_at"`);
    await queryRunner.query(`ALTER TABLE "permission_profiles" DROP COLUMN IF EXISTS "expires_at"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_roles_expires_at"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN IF EXISTS "role_type"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN IF EXISTS "expires_at"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_sessions_active_role"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT IF EXISTS "FK_user_sessions_active_role"`);
    await queryRunner.query(`ALTER TABLE "user_sessions" DROP COLUMN IF EXISTS "active_role_id"`);
  }
}
