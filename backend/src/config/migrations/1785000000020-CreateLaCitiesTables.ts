import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLaCitiesTables1785000000020 implements MigrationInterface {
  name = 'CreateLaCitiesTables1785000000020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "la_cities" (
        "id" SERIAL PRIMARY KEY,
        "city_name" varchar(255) NOT NULL,
        "business_zone_id" int NOT NULL REFERENCES "zones"("id") ON DELETE RESTRICT,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        "created_by" varchar(255) NULL,
        "updated_by" varchar(255) NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_la_cities_zone" ON "la_cities" ("business_zone_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_la_cities_name" ON "la_cities" USING gin ("city_name" gin_trgm_ops)`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "la_regions" (
        "id" SERIAL PRIMARY KEY,
        "la_city_id" int NOT NULL REFERENCES "la_cities"("id") ON DELETE CASCADE,
        "region_name" varchar(255) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        "created_by" varchar(255) NULL,
        "updated_by" varchar(255) NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_la_regions_city" ON "la_regions" ("la_city_id")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "la_micromarkets" (
        "id" SERIAL PRIMARY KEY,
        "la_region_id" int NOT NULL REFERENCES "la_regions"("id") ON DELETE CASCADE,
        "micromarket_name" varchar(255) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        "created_by" varchar(255) NULL,
        "updated_by" varchar(255) NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_la_micromarkets_region" ON "la_micromarkets" ("la_region_id")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "la_localities" (
        "id" SERIAL PRIMARY KEY,
        "la_micromarket_id" int NOT NULL REFERENCES "la_micromarkets"("id") ON DELETE CASCADE,
        "locality_name" varchar(255) NOT NULL,
        "pincode" varchar(6) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        "created_by" varchar(255) NULL,
        "updated_by" varchar(255) NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_la_localities_micro" ON "la_localities" ("la_micromarket_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_la_localities_pincode" ON "la_localities" ("pincode")`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "la_city_approvals" (
        "id" SERIAL PRIMARY KEY,
        "la_city_id" int NOT NULL REFERENCES "la_cities"("id") ON DELETE CASCADE,
        "generic_approval" varchar(255) NOT NULL,
        "governing_bodies" jsonb NOT NULL DEFAULT '[]',
        "documents" jsonb NOT NULL DEFAULT '[]',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        "created_by" varchar(255) NULL,
        "updated_by" varchar(255) NULL
      )
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_la_approvals_city" ON "la_city_approvals" ("la_city_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "la_city_approvals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "la_localities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "la_micromarkets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "la_regions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "la_cities"`);
  }
}
