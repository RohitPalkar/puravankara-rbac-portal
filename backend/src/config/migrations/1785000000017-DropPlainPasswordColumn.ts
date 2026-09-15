import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPlainPasswordColumn1785000000017 implements MigrationInterface {
  name = 'DropPlainPasswordColumn1785000000017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_auth" DROP COLUMN IF EXISTS "plain_password"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_auth" ADD COLUMN IF NOT EXISTS "plain_password" text NULL
    `);
  }
}
