import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SeedProdModule } from './seed-prod.module';
import { DataSource } from 'typeorm';
import { bootstrapSeeder } from './seeders/bootstrap.seeder';

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedProdModule);
  const dataSource = app.get(DataSource);

  try {
    await bootstrapSeeder(dataSource);
    console.log('Production seed completed successfully.');
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await app.close();
    process.exit(1);
  }
}

run();
