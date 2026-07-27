import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleIdToHierarchyLevels1785000000007
  implements MigrationInterface
{
  name = 'AddRoleIdToHierarchyLevels1785000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" ADD COLUMN "role_id" integer`,
    );

    await queryRunner.query(
      `UPDATE "department_hierarchy_levels" dhl
       SET "role_id" = r."id"
       FROM "roles" r
       WHERE r."name" = dhl."role_name"`,
    );

    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" ALTER COLUMN "role_id" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels"
       ADD CONSTRAINT "FK_dhl_role"
       FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_dhl_role_id" ON "department_hierarchy_levels" ("role_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_dhl_role_id"`);
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" DROP CONSTRAINT "FK_dhl_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "department_hierarchy_levels" DROP COLUMN "role_id"`,
    );
  }
}
