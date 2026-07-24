import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ProfileType } from '../../../common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { UserZone } from '../entities/user-zone.entity';
import { UserReportingLine } from '../entities/user-reporting-line.entity';
import { UserAuth } from '../../auth/entities/user-auth.entity';
import { UserProjectAccess } from '../../project-access/entities/user-project-access.entity';
import { BaseService } from '../../../common/crud/base.service';
import {
  PaginationQuery,
  PaginatedResult,
} from '../../../common/crud/crud.interface';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateUserFullDto,
} from '../dto/user.dto';
import { PermissionProfile } from '../../permissions/entities/permission-profile.entity';
import { PermissionProfileModule } from '../../permissions/entities/permission-profile-module.entity';
import { PermissionProfileSubModule } from '../../permissions/entities/permission-profile-sub-module.entity';
import { PermissionProfileProject } from '../../permissions/entities/permission-profile-project.entity';
import { PermissionCompilerService } from '../../permissions/services/permission-compiler.service';
import { NotificationService } from '../../notifications/services/notification.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    readonly repository: Repository<User>,
    @InjectRepository(UserRole)
    readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserZone)
    readonly userZoneRepository: Repository<UserZone>,
    @InjectRepository(UserReportingLine)
    readonly reportingLineRepository: Repository<UserReportingLine>,
    @InjectRepository(UserAuth)
    readonly userAuthRepository: Repository<UserAuth>,
    @InjectRepository(UserProjectAccess)
    readonly userProjectAccessRepository: Repository<UserProjectAccess>,
    @InjectRepository(PermissionProfile)
    readonly profileRepo: Repository<PermissionProfile>,
    @InjectRepository(PermissionProfileModule)
    readonly profileModuleRepo: Repository<PermissionProfileModule>,
    @InjectRepository(PermissionProfileSubModule)
    readonly profileSubModuleRepo: Repository<PermissionProfileSubModule>,
    @InjectRepository(PermissionProfileProject)
    readonly profileProjectRepo: Repository<PermissionProfileProject>,
    private readonly dataSource: DataSource,
    private readonly compilerService: PermissionCompilerService,
  ) {}

  async fetchEmployee(
    employeeId: string,
  ): Promise<{ employeeName: string; email: string; mobile: string }> {
    const user = await this.repository.findOne({
      where: { empId: employeeId, deletedAt: null },
    });
    if (!user) throw new NotFoundException('No employee found in SAP');
    return {
      employeeName: user.name,
      email: user.email,
      mobile: '',
    };
  }

  async findAll(query: PaginationQuery): Promise<PaginatedResult<User>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;
    const where: any = { deletedAt: null, isActive: true };

    if (search) {
      where.$or = [
        { name: { $ilike: `%${search}%` } },
        { empId: { $ilike: `%${search}%` } },
        { email: { $ilike: `%${search}%` } },
      ];
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: { department: true },
    });

    const empIds = data.map((u) => u.empId);

    const [userRoles, userZones, projectCounts] = await Promise.all([
      this.userRoleRepository.find({
        where: { userId: In(empIds) },
        relations: { role: true, department: true },
      }),
      this.userZoneRepository.find({
        where: { userId: In(empIds) },
        relations: { zone: true },
      }),
      this.userProjectAccessRepository
        .createQueryBuilder('upa')
        .select('upa.user_id', 'userId')
        .addSelect('COUNT(upa.project_id)', 'count')
        .where('upa.user_id IN (:...empIds)', { empIds })
        .groupBy('upa.user_id')
        .getRawMany(),
    ]);

    const roleMap = new Map<string, { roleName: string; departmentName: string }>();
    for (const ur of userRoles) {
      if (!roleMap.has(ur.userId) && ur.role) {
        roleMap.set(ur.userId, {
          roleName: ur.role.name,
          departmentName: ur.department?.name ?? '',
        });
      }
    }

    const zoneMap = new Map<string, string[]>();
    for (const uz of userZones) {
      if (uz.zone) {
        const names = zoneMap.get(uz.userId) ?? [];
        names.push(uz.zone.name);
        zoneMap.set(uz.userId, names);
      }
    }

    const projectCountMap = new Map<string, number>();
    for (const row of projectCounts) {
      projectCountMap.set(row.userId, Number(row.count));
    }

    const enriched = data.map((user) => {
      const role = roleMap.get(user.empId);
      return {
        ...user,
        roleName: role?.roleName ?? null,
        zoneNames: zoneMap.get(user.empId) ?? [],
        projectCount: projectCountMap.get(user.empId) ?? 0,
      };
    });

    return {
      data: enriched,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<User & { profiles?: PermissionProfile[] }> {
    const user = await this.repository.findOne({
      where: { empId: id },
      relations: { department: true },
    });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    const profiles = await this.profileRepo.find({
      where: { userId: id },
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

    // Sort modules by displayOrder for consistent frontend rendering
    for (const profile of profiles) {
      if (profile.modules) {
        profile.modules.sort((a, b) => a.displayOrder - b.displayOrder);
      }
    }

    return { ...user, profiles };
  }

  async create(
    dto: CreateUserDto,
  ): Promise<{ user: User; generatedPassword: string }> {
    const existing = await this.repository.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const empId = await this.generateEmpId();

    const user = this.repository.create({
      empId,
      name: dto.name,
      email: dto.email,
      departmentId: dto.departmentId,
      employmentStatus: dto.employmentStatus || 'PERMANENT',
      isActive: dto.isActive ?? true,
    });

    const savedUser = await this.repository.save(user);

    const generatedPassword = this.generateRandomPassword();
    const passwordHash = await bcrypt.hash(generatedPassword, 12);
    await this.userAuthRepository.save(
      this.userAuthRepository.create({
        userId: savedUser.empId,
        passwordHash,
        authProvider: 'LOCAL',
      }),
    );

    return { user: savedUser, generatedPassword };
  }

  private generateRandomPassword(length = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = uppercase + lowercase + digits + special;

    const required = [
      uppercase[Math.floor(Math.random() * uppercase.length)],
      lowercase[Math.floor(Math.random() * lowercase.length)],
      digits[Math.floor(Math.random() * digits.length)],
      special[Math.floor(Math.random() * special.length)],
    ];

    for (let i = required.length; i < length; i++) {
      required.push(all[Math.floor(Math.random() * all.length)]);
    }

    for (let i = required.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [required[i], required[j]] = [required[j], required[i]];
    }

    return required.join('');
  }

  async update(id: string, dto: UpdateUserDto): Promise<User & { profiles?: PermissionProfile[] }> {
    const user = await this.findById(id);
    if (dto.email && dto.email !== user.email) {
      const existing = await this.repository.findOne({
        where: { email: dto.email },
      });
      if (existing) throw new ConflictException('Email already in use');
    }
    Object.assign(user, dto);
    await this.repository.save(user);

    // Handle profile updates
    if (dto.profiles) {
      await this.profileRepo.delete({ userId: id });

      const deptRolePairs = new Set<string>();
      for (const profileDto of dto.profiles) {
        // Validate buddy RM requires department + role
        if (profileDto.profileType === ProfileType.BUDDY_RM) {
          if (!profileDto.departmentId || !profileDto.roleId) {
            throw new BadRequestException('Buddy RM profile requires departmentId and roleId');
          }
          if (profileDto.buddyUserId === id) {
            throw new BadRequestException('Buddy RM cannot be the same user');
          }
        }

        // Validate no duplicate dept+role across profiles
        if (profileDto.departmentId && profileDto.roleId) {
          const pair = `${profileDto.departmentId}:${profileDto.roleId}`;
          if (deptRolePairs.has(pair)) {
            throw new BadRequestException(`Duplicate department+role assignment: department ${profileDto.departmentId}, role ${profileDto.roleId}`);
          }
          deptRolePairs.add(pair);
        }

        const profile = this.profileRepo.create({
          userId: id,
          profileType: profileDto.profileType,
          departmentId: profileDto.departmentId ?? null,
          roleId: profileDto.roleId ?? null,
          buddyUserId: profileDto.buddyUserId ?? null,
          displayName: profileDto.displayName ?? null,
          status: profileDto.status ?? 'ACTIVE',
        });
        const savedProfile = await this.profileRepo.save(profile);

        if (profileDto.modules?.length) {
          for (const modDto of profileDto.modules) {
            const ppm = this.profileModuleRepo.create({
              profileId: savedProfile.id,
              moduleId: modDto.moduleId,
              displayOrder: modDto.displayOrder ?? 0,
            });
            const savedMod = await this.profileModuleRepo.save(ppm);

            if (modDto.subModules?.length) {
              for (const smDto of modDto.subModules) {
                const ppsm = this.profileSubModuleRepo.create({
                  profileModuleId: savedMod.id,
                  subModuleId: smDto.subModuleId,
                  inheritFutureProjects: smDto.inheritFutureProjects ?? false,
                });
                const savedSm = await this.profileSubModuleRepo.save(ppsm);

                if (smDto.projects?.length) {
                  for (const projDto of smDto.projects) {
                    const ppp = this.profileProjectRepo.create({
                      profileSubModuleId: savedSm.id,
                      projectId: projDto.projectId,
                      selectedBy: projDto.selectedBy ?? 'SYSTEM',
                    });
                    await this.profileProjectRepo.save(ppp);
                  }
                }
              }
            }
          }
        }
      }
    }

    const result = await this.findById(id);
    return result;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    (user as any).deletedAt = new Date();
    await this.repository.save(user);
  }

  async createFull(dto: CreateUserFullDto): Promise<{
    user: User;
    roles: UserRole[];
    zones: UserZone[];
    reportingLines: UserReportingLine[];
    profiles: PermissionProfile[];
    generatedPassword: string;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(User, {
        where: { email: dto.basic.email },
      });
      if (existing) throw new ConflictException('Email already in use');

      const empId = await this.generateEmpId();

      const user = queryRunner.manager.create(User, {
        empId,
        name: dto.basic.name,
        email: dto.basic.email,
        departmentId: dto.basic.departmentId,
        employmentStatus: dto.basic.employmentStatus || 'PERMANENT',
        isActive: dto.basic.isActive ?? true,
      });
      const savedUser = await queryRunner.manager.save(user);

      const roles: UserRole[] = [];
      const zones: UserZone[] = [];
      const reportingLines: UserReportingLine[] = [];
      const profiles: PermissionProfile[] = [];

      // Create legacy user_roles for backward compatibility
      if (!dto.profiles?.length) {
        const primaryRole = queryRunner.manager.create(UserRole, {
          userId: savedUser.empId,
          departmentId: dto.basic.departmentId,
          roleId: dto.organization.primaryRole,
          assignedBy: 'SYSTEM',
          assignedAt: new Date(),
        });
        roles.push(await queryRunner.manager.save(primaryRole));

        if (dto.organization.secondaryRoles?.length) {
          for (const roleId of dto.organization.secondaryRoles) {
            const sr = queryRunner.manager.create(UserRole, {
              userId: savedUser.empId,
              departmentId: dto.basic.departmentId,
              roleId,
              assignedBy: 'SYSTEM',
              assignedAt: new Date(),
            });
            roles.push(await queryRunner.manager.save(sr));
          }
        }

        if (dto.organization.zones?.length) {
          for (const zoneId of dto.organization.zones) {
            const uz = queryRunner.manager.create(UserZone, {
              userId: savedUser.empId,
              zoneId,
              assignedAt: new Date(),
            });
            zones.push(await queryRunner.manager.save(uz));
          }
        }
      }

      if (dto.organization.reporting?.length) {
        for (const entry of dto.organization.reporting) {
          const rl = queryRunner.manager.create(UserReportingLine, {
            userId: savedUser.empId,
            reportsToUserId: entry.managerId,
            levelRank: entry.levelRank,
            effectiveFrom: new Date(),
          });
          reportingLines.push(await queryRunner.manager.save(rl));
        }
      }

      // Create permission profiles
      if (dto.profiles?.length) {
        const deptRolePairs = new Set<string>();
        for (const profileDto of dto.profiles) {
          // Validate buddy RM requires department + role
          if (profileDto.profileType === ProfileType.BUDDY_RM) {
            if (!profileDto.departmentId || !profileDto.roleId) {
              throw new BadRequestException('Buddy RM profile requires departmentId and roleId');
            }
            if (profileDto.buddyUserId === savedUser.empId) {
              throw new BadRequestException('Buddy RM cannot be the same user');
            }
          }

          // Validate no duplicate dept+role across profiles
          if (profileDto.departmentId && profileDto.roleId) {
            const pair = `${profileDto.departmentId}:${profileDto.roleId}`;
            if (deptRolePairs.has(pair)) {
              throw new BadRequestException(`Duplicate department+role assignment: department ${profileDto.departmentId}, role ${profileDto.roleId}`);
            }
            deptRolePairs.add(pair);
          }

          const profile = queryRunner.manager.create(PermissionProfile, {
            userId: savedUser.empId,
            profileType: profileDto.profileType,
            departmentId: profileDto.departmentId ?? null,
            roleId: profileDto.roleId ?? null,
            buddyUserId: profileDto.buddyUserId ?? null,
            displayName: profileDto.displayName ?? null,
            status: profileDto.status ?? 'ACTIVE',
          });
          const savedProfile = await queryRunner.manager.save(profile);

          // Create user_role entries for backward compat
          if (profileDto.roleId && profileDto.departmentId) {
            const ur = queryRunner.manager.create(UserRole, {
              userId: savedUser.empId,
              departmentId: profileDto.departmentId,
              roleId: profileDto.roleId,
              assignedBy: 'SYSTEM',
              assignedAt: new Date(),
            });
            roles.push(await queryRunner.manager.save(ur));
          }

          // Create module → subModule → project tree
          if (profileDto.modules?.length) {
            for (const modDto of profileDto.modules) {
              const ppm = queryRunner.manager.create(PermissionProfileModule, {
                profileId: savedProfile.id,
                moduleId: modDto.moduleId,
                displayOrder: modDto.displayOrder ?? 0,
              });
              const savedMod = await queryRunner.manager.save(ppm);

              if (modDto.subModules?.length) {
                for (const smDto of modDto.subModules) {
                  const ppsm = queryRunner.manager.create(PermissionProfileSubModule, {
                    profileModuleId: savedMod.id,
                    subModuleId: smDto.subModuleId,
                    inheritFutureProjects: smDto.inheritFutureProjects ?? false,
                  });
                  const savedSm = await queryRunner.manager.save(ppsm);

                  if (smDto.projects?.length) {
                    for (const projDto of smDto.projects) {
                      const ppp = queryRunner.manager.create(PermissionProfileProject, {
                        profileSubModuleId: savedSm.id,
                        projectId: projDto.projectId,
                        selectedBy: projDto.selectedBy ?? 'SYSTEM',
                      });
                      await queryRunner.manager.save(ppp);
                    }
                  }
                }
              }
            }
          }

          profiles.push(savedProfile);
        }
      }

      const generatedPassword = this.generateRandomPassword();
      const passwordHash = await bcrypt.hash(generatedPassword, 12);
      await queryRunner.manager.save(
        queryRunner.manager.create(UserAuth, {
          userId: savedUser.empId,
          passwordHash,
          authProvider: 'LOCAL',
        }),
      );

      await queryRunner.commitTransaction();

      // Trigger permission compilation
      if (profiles.length > 0) {
        const projectIds = new Set<number>();
        for (const p of profiles) {
          const fullProfile = await this.profileRepo.findOne({
            where: { id: p.id },
            relations: { modules: { subModules: { projects: true } } },
          });
          if (fullProfile?.modules) {
            for (const mod of fullProfile.modules) {
              for (const sm of mod.subModules) {
                for (const proj of sm.projects) {
                  projectIds.add(proj.projectId);
                }
              }
            }
          }
        }
        for (const pid of projectIds) {
          this.compilerService.compileAndSave(savedUser.empId, pid).catch((err) => this.logger.error('Failed to compile permissions for user project', err));
        }
      }

      return { user: savedUser, roles, zones, reportingLines, profiles, generatedPassword };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `User creation transaction failed: ${(err as Error).message}`,
      );
      if (
        err instanceof ConflictException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new BadRequestException(
        'User creation failed. All changes rolled back.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async generateEmpId(): Promise<string> {
    const [lastUser] = await this.repository.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });

    const lastNum = lastUser
      ? parseInt(lastUser.empId.replace('PPL', ''), 10)
      : 0;
    const nextNum = lastNum + 1;
    return `PPL${String(nextNum).padStart(5, '0')}`;
  }
}

@Injectable()
export class UserRoleService {
  private readonly logger = new Logger(UserRoleService.name);

  constructor(
    @InjectRepository(UserRole)
    readonly repository: Repository<UserRole>,
    private readonly notifService: NotificationService,
    private readonly compilerService: PermissionCompilerService,
  ) {}

  async findByUser(userId: string): Promise<UserRole[]> {
    return this.repository.find({
      where: { userId },
      relations: { role: true, department: true },
    });
  }

  async assign(dto: {
    userId: string;
    departmentId: number;
    roleId: number;
    assignedBy?: string;
  }): Promise<UserRole> {
    const existing = await this.repository.findOne({
      where: {
        userId: dto.userId,
        departmentId: dto.departmentId,
        roleId: dto.roleId,
      },
    });
    if (existing)
      throw new ConflictException(
        'User already has this role in this department',
      );

    const ur = this.repository.create({
      userId: dto.userId,
      departmentId: dto.departmentId,
      roleId: dto.roleId,
      assignedBy: dto.assignedBy,
      assignedAt: new Date(),
    });
    const saved = await this.repository.save(ur);

    this.notifService
      .sendToUser(
        dto.userId,
        'Role Assigned',
        `You have been assigned a new role in department ${dto.departmentId}`,
        'ROLE_ASSIGNMENT',
        String(dto.roleId),
        'ROLE',
        'HIGH',
      )
      .catch((err) => this.logger.error('Failed to send role-assigned notification', err));

    this.compilerService.compileForAllUserProjects(dto.userId).catch((err) => this.logger.error('Failed to compile permissions after role assignment', err));

    return saved;
  }

  async revoke(
    userId: string,
    departmentId: number,
    roleId: number,
  ): Promise<void> {
    const result = await this.repository.delete({
      userId,
      departmentId,
      roleId,
    });
    if (result.affected === 0)
      throw new NotFoundException('User role assignment not found');

    this.compilerService.compileForAllUserProjects(userId).catch((err) => this.logger.error('Failed to compile permissions after role revoke', err));
  }
}

@Injectable()
export class UserReportingLineService {
  constructor(
    @InjectRepository(UserReportingLine)
    readonly repository: Repository<UserReportingLine>,
  ) {}

  async findByUser(userId: string): Promise<UserReportingLine[]> {
    return this.repository.find({
      where: { userId },
      relations: { reportsTo: true },
    });
  }

  async create(dto: {
    userId: string;
    reportsToUserId: string;
    levelRank: number;
    effectiveFrom?: string;
    effectiveTo?: string;
  }): Promise<UserReportingLine> {
    const rl = this.repository.create({
      userId: dto.userId,
      reportsToUserId: dto.reportsToUserId,
      levelRank: dto.levelRank,
      effectiveFrom: dto.effectiveFrom
        ? new Date(dto.effectiveFrom)
        : undefined,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
    });
    return this.repository.save(rl);
  }

  async remove(
    userId: string,
    reportsToUserId: string,
    levelRank: number,
  ): Promise<void> {
    const result = await this.repository.delete({
      userId,
      reportsToUserId,
      levelRank,
    });
    if (result.affected === 0)
      throw new NotFoundException('Reporting line not found');
  }
}
