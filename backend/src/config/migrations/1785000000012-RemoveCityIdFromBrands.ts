import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCityIdFromBrands1785000000012 implements MigrationInterface {
  name = 'RemoveCityIdFromBrands1785000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "FK_brands_city"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "city_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brands" ADD "city_id" integer`);
    await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "FK_brands_city" FOREIGN KEY ("city_id") REFERENCES "cities"(id) ON DELETE SET NULL`);
  }
}
