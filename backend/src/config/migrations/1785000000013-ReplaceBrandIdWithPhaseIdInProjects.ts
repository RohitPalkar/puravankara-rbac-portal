import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceBrandIdWithPhaseIdInProjects1785000000013 implements MigrationInterface {
  name = 'ReplaceBrandIdWithPhaseIdInProjects1785000000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "projects_brand_id_fkey"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "brand_id"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "phase_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_phase" FOREIGN KEY ("phase_id") REFERENCES "phases"(id) ON DELETE RESTRICT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_phase"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "phase_id"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "brand_id" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "projects_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"(id) ON DELETE RESTRICT`);
  }
}
