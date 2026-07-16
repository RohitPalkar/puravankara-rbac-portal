import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateBrandsTable1783077482113 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
