import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropLegacyRoleActionUniqueIndex1785000000011 implements MigrationInterface {
  name = 'DropLegacyRoleActionUniqueIndex1785000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_role_action_permissions_role_action"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_rap_role_action"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "idx_role_action_permissions_role_action" ON "role_action_permissions" ("role_id", "action_id")`,
    );
  }
}
