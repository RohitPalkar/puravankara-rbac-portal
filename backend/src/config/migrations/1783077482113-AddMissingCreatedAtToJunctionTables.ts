import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMissingCreatedAtToJunctionTables1783077482113
  implements MigrationInterface
{
  name = 'AddMissingCreatedAtToJunctionTables1783077482113';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "department_roles"
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);
    await queryRunner.query(`
      ALTER TABLE "department_roles"
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);

    await queryRunner.query(`
      ALTER TABLE "city_zone_mappings"
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);
    await queryRunner.query(`
      ALTER TABLE "city_zone_mappings"
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);

    await queryRunner.query(`
      ALTER TABLE "project_locations"
      ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);
    await queryRunner.query(`
      ALTER TABLE "project_locations"
      ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "department_roles" DROP COLUMN IF EXISTS "updated_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "department_roles" DROP COLUMN IF EXISTS "created_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "city_zone_mappings" DROP COLUMN IF EXISTS "updated_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "city_zone_mappings" DROP COLUMN IF EXISTS "created_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "project_locations" DROP COLUMN IF EXISTS "updated_at"
    `);
    await queryRunner.query(`
      ALTER TABLE "project_locations" DROP COLUMN IF EXISTS "created_at"
    `);
  }
}
