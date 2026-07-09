import { DataSource } from 'typeorm';
import { bootstrapSeeder } from './bootstrap.seeder';

export async function mainSeeder(dataSource: DataSource): Promise<void> {
  await bootstrapSeeder(dataSource);
}
