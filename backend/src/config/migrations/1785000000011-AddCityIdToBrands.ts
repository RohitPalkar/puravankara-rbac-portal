import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCityIdToBrands1785000000011 implements MigrationInterface {
  name = 'AddCityIdToBrands1785000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brands" ADD "city_id" integer`);
    await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "FK_brands_city" FOREIGN KEY ("city_id") REFERENCES "cities"(id) ON DELETE SET NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "FK_brands_city"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP COLUMN "city_id"`);
  }
}
