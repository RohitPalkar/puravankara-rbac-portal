import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionProfile } from '../entities/permission-profile.entity';
import { PermissionProfileModule } from '../entities/permission-profile-module.entity';
import { PermissionProfileSubModule } from '../entities/permission-profile-sub-module.entity';
import { PermissionProfileProject } from '../entities/permission-profile-project.entity';

@Injectable()
export class PermissionProfileService {
  private readonly logger = new Logger(PermissionProfileService.name);

  constructor(
    @InjectRepository(PermissionProfile)
    readonly profileRepo: Repository<PermissionProfile>,
    @InjectRepository(PermissionProfileModule)
    readonly moduleRepo: Repository<PermissionProfileModule>,
    @InjectRepository(PermissionProfileSubModule)
    readonly subModuleRepo: Repository<PermissionProfileSubModule>,
    @InjectRepository(PermissionProfileProject)
    readonly projectRepo: Repository<PermissionProfileProject>,
  ) {}

  async findByUser(userId: string): Promise<PermissionProfile[]> {
    const profiles = await this.profileRepo.find({
      where: { userId },
      relations: {
        department: true,
        role: true,
        buddyUser: true,
        modules: {
          module: true,
          subModules: {
            subModule: true,
            projects: { project: true },
          },
        },
      },
      order: { createdAt: 'ASC' },
    });

    // Sort modules by displayOrder within each profile
    for (const profile of profiles) {
      if (profile.modules) {
        profile.modules.sort((a, b) => a.displayOrder - b.displayOrder);
      }
    }

    return profiles;
  }

  async deleteByUser(userId: string): Promise<void> {
    await this.profileRepo.delete({ userId });
  }
}
