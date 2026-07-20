import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCityStateCountryToBrands1785000000001 implements MigrationInterface {
  name = 'AddCityStateCountryToBrands1785000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "city" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "state" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "brands" ADD "country" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "country"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "state"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "city"`);
  }
}
