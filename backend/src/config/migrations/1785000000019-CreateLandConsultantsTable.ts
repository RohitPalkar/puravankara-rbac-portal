import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLandConsultantsTable1785000000019 implements MigrationInterface {
  name = 'CreateLandConsultantsTable1785000000019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "land_consultants" (
        "id" SERIAL PRIMARY KEY,
        "consultant_type" varchar(20) NOT NULL,
        "business_name" varchar(255) NULL,
        "consultant_name" varchar(255) NULL,
        "gst_no" varchar(15) NULL,
        "contact_person_name" varchar(255) NOT NULL,
        "contact_number" varchar(15) NOT NULL,
        "email_address" varchar(255) NOT NULL,
        "address" text NOT NULL,
        "specialization" varchar(255) NULL,
        "bd_executive_id" varchar(20) NOT NULL,
        "is_puravankara_employee" boolean NOT NULL DEFAULT false,
        "department_id" int NULL REFERENCES "departments"("id") ON DELETE SET NULL,
        "employee_id" varchar(20) NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "proposed_s0_count" int NOT NULL DEFAULT 0,
        "s1_s2_count" int NOT NULL DEFAULT 0,
        "mou_jda_count" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        "created_by" varchar(255) NULL,
        "updated_by" varchar(255) NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_land_consultants_type" ON "land_consultants" ("consultant_type")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_land_consultants_bd_exec" ON "land_consultants" ("bd_executive_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_land_consultants_name" ON "land_consultants" USING gin ("business_name" gin_trgm_ops)
    `);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "land_consultants"`);
  }
}
