import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedAtToUserSessions1783077482114
  implements MigrationInterface
{
  name = 'AddUpdatedAtToUserSessions1783077482114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_sessions"
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_sessions" DROP COLUMN IF EXISTS "updated_at"
    `);
  }
}
