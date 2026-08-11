import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCredentialsAndResetTokenToUserAuth1785000000015
  implements MigrationInterface
{
  name = 'AddCredentialsAndResetTokenToUserAuth1785000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_auth"
      ADD COLUMN IF NOT EXISTS "plain_password" text NULL,
      ADD COLUMN IF NOT EXISTS "reset_token_hash" text NULL,
      ADD COLUMN IF NOT EXISTS "reset_token_expires_at" timestamptz NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_auth"
      DROP COLUMN IF EXISTS "plain_password",
      DROP COLUMN IF EXISTS "reset_token_hash",
      DROP COLUMN IF EXISTS "reset_token_expires_at"
    `);
  }
}