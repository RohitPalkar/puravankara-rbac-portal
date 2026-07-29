import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropProjectIdFromPhases1785000000009 implements MigrationInterface {
  name = 'DropProjectIdFromPhases1785000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "phases" DROP COLUMN "project_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "phases" ADD "project_id" integer NOT NULL`);
  }
}
