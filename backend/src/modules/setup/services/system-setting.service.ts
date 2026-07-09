import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../entities/system-setting.entity';

@Injectable()
export class SystemSettingService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly repo: Repository<SystemSetting>,
  ) {}

  async get(key: string): Promise<Record<string, any> | null> {
    const setting = await this.repo.findOne({ where: { key } });
    return setting?.value ?? null;
  }

  async set(key: string, value: Record<string, any>): Promise<void> {
    await this.repo.upsert(
      { key, value },
      { conflictPaths: ['key'] },
    );
  }

  async delete(key: string): Promise<void> {
    await this.repo.delete({ key });
  }

  async isSetupCompleted(): Promise<boolean> {
    const val = await this.get('setup_completed');
    return val?.completed === true;
  }

  async markSetupCompleted(): Promise<void> {
    await this.set('setup_completed', { completed: true });
  }
}
