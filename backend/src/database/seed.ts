import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seeders/seed.service';

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seed();
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await app.close();
    process.exit(1);
  }
}

run();
