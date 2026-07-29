import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddZoneDeptToRolePermissions1785000000010 implements MigrationInterface {
  name = 'AddZoneDeptToRolePermissions1785000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const constraintResult = await queryRunner.query(
      `SELECT conname FROM pg_constraint WHERE conrelid = 'role_action_permissions'::regclass AND contype = 'u' AND conkey = (SELECT array_agg(attnum) FROM pg_attribute WHERE attrelid = 'role_action_permissions'::regclass AND attname IN ('role_id', 'action_id'))`,
    );
    const oldConstraintName = constraintResult[0]?.conname;
    if (oldConstraintName) {
      await queryRunner.query(`ALTER TABLE "role_action_permissions" DROP CONSTRAINT "${oldConstraintName}"`);
    }

    await queryRunner.query(`ALTER TABLE "role_action_permissions" ADD "zone_id" integer`);
    await queryRunner.query(`ALTER TABLE "role_action_permissions" ADD "department_id" integer`);
    await queryRunner.query(`ALTER TABLE "role_action_permissions" ADD CONSTRAINT "UQ_role_action_zone_dept" UNIQUE ("zone_id", "department_id", "role_id", "action_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "role_action_permissions" DROP CONSTRAINT "UQ_role_action_zone_dept"`);
    await queryRunner.query(`ALTER TABLE "role_action_permissions" ADD CONSTRAINT "UQ_866ab9714b1e89672e3e09369ce" UNIQUE ("role_id", "action_id")`);
    await queryRunner.query(`ALTER TABLE "role_action_permissions" DROP COLUMN "department_id"`);
    await queryRunner.query(`ALTER TABLE "role_action_permissions" DROP COLUMN "zone_id"`);
  }
}
