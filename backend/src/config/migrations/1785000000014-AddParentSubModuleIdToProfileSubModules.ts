import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentSubModuleIdToProfileSubModules1785000000014
  implements MigrationInterface
{
  name = 'AddParentSubModuleIdToProfileSubModules1785000000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "permission_profile_sub_modules"
      ADD COLUMN IF NOT EXISTS "parent_submodule_id" integer NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "permission_profile_sub_modules"
      DROP COLUMN IF EXISTS "parent_submodule_id"
    `);
  }
}
