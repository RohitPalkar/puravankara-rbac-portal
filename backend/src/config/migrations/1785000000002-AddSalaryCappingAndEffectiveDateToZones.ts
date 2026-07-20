import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalaryCappingAndEffectiveDateToZones1785000000002 implements MigrationInterface {
  name = 'AddSalaryCappingAndEffectiveDateToZones1785000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "zones" ADD "salary_capping" numeric(4,2) NOT NULL DEFAULT 1.00`,
    );
    await queryRunner.query(
      `ALTER TABLE "zones" ADD "effective_date" date NOT NULL DEFAULT CURRENT_DATE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "zones" DROP COLUMN "effective_date"`);
    await queryRunner.query(`ALTER TABLE "zones" DROP COLUMN "salary_capping"`);
  }
}
