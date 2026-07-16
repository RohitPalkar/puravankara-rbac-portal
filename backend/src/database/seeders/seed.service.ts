import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { mainSeeder } from './main.seeder';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Starting database seed...');
    await mainSeeder(this.dataSource);
    this.logger.log('Seed completed successfully.');
  }
}
