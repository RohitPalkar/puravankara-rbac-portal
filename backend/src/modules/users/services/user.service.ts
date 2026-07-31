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
import { Repository, DataSource, In, Not } from 'typeorm';
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
import { Department } from '../../organization/entities/department.entity';
import { DepartmentRole } from '../../organization/entities/department-role.entity';
import { Zone } from '../../geography/entities/zone.entity';

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
      reportsTo,
      zoneId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;
    const where: any = { deletedAt: null };

    const rawIsActive = query['isActive'] as string | undefined;
    if (rawIsActive !== undefined) {
      where.isActive = rawIsActive === 'true';
    }

    if (search) {
      where.$or = [
        { name: { $ilike: `%${search}%` } },
        { empId: { $ilike: `%${search}%` } },
        { email: { $ilike: `%${search}%` } },
      ];
    }

    let userQuery = this.repository
      .createQueryBuilder('u')
      .where('u.deleted_at IS NULL')
      .orderBy(`u.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    if (rawIsActive !== undefined) {
      userQuery = userQuery.andWhere('u.is_active = :isActive', { isActive: rawIsActive === 'true' });
    }

    if (search) {
      userQuery = userQuery.andWhere(
        '(u.name ILIKE :search OR u.emp_id ILIKE :search OR u.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (reportsTo) {
      userQuery = userQuery
        .innerJoin('user_reporting_lines', 'url', 'url.user_id = u.emp_id AND url.level_rank = 1')
        .innerJoin('users', 'rm', 'rm.emp_id = url.reports_to_user_id')
        .andWhere(
          '(rm.name ILIKE :reportsTo OR rm.emp_id ILIKE :reportsTo)',
          { reportsTo: `%${reportsTo}%` },
        );
    }

    if (zoneId) {
      userQuery = userQuery
        .innerJoin('user_zones', 'uz', 'uz.user_id = u.emp_id')
        .andWhere('uz.zone_id = :zoneId', { zoneId });
    }

    if (query['departmentId']) {
      userQuery = userQuery.andWhere('u.department_id = :departmentId', { departmentId: Number(query['departmentId']) });
    }
    if (query['roleId']) {
      userQuery = userQuery.innerJoin('user_roles', 'ur_filter', 'ur_filter.user_id = u.emp_id')
        .andWhere('ur_filter.role_id = :roleId', { roleId: Number(query['roleId']) });
    }

    userQuery = userQuery.leftJoinAndSelect('u.department', 'department');

    const [data, total] = await userQuery.getManyAndCount();

    if (data.length === 0) {
      return {
        data: [],
        meta: { page, limit, total, totalPages: 0 },
      };
    }

    const empIds = data.map((u) => u.empId);

    const [userRoles, userZones, projectCounts, reportingLines] = await Promise.all([
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
      this.reportingLineRepository.find({
        where: { userId: In(empIds), levelRank: 1 },
        relations: { reportsTo: true },
      }),
    ]);

    const roleMap = new Map<
      string,
      { roleName: string; departmentName: string }
    >();
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

    const reportsToMap = new Map<string, string>();
    for (const rl of reportingLines) {
      if (rl.reportsTo) {
        reportsToMap.set(rl.userId, rl.reportsTo.name);
      }
    }

    const deptAdminSet = new Set<string>();
    const deptWithAdmins = await this.repository.manager.find(Department, {
      where: { departmentAdminId: In(empIds) },
    });
    for (const d of deptWithAdmins) {
      deptAdminSet.add(d.departmentAdminId);
    }

    const enriched = data.map((user) => {
      const role = roleMap.get(user.empId);
      return {
        ...user,
        roleName: role?.roleName ?? null,
        departmentName: user.department?.name ?? null,
        zoneNames: zoneMap.get(user.empId) ?? [],
        projectCount: projectCountMap.get(user.empId) ?? 0,
        reportsToName: reportsToMap.get(user.empId) ?? null,
        isDepartmentAdmin: deptAdminSet.has(user.empId),
      };
    });

    return {
      data: enriched,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(
    id: string,
  ): Promise<User & { profiles?: PermissionProfile[]; userRoles?: any[]; userZones?: any[]; reportingManager?: any; isDepartmentAdmin?: boolean }> {
    this.logger.debug(`findById called with id="${id}" (typeof=${typeof id})`);

    let user: User | null = null;
    try {
      user = await this.repository.findOne({
        where: { empId: id },
        relations: { department: true },
      });
    } catch (err) {
      this.logger.warn(
        `findById ORM error for id="${id}": ${(err as Error).message}`,
      );
    }

    if (!user || user.deletedAt) {
      this.logger.warn(
        `findById: ORM returned no user for id="${id}" (user=${!!user}, deletedAt=${(user as any)?.deletedAt})`,
      );
      throw new NotFoundException('User not found');
    }

    let profiles: PermissionProfile[] = [];
    try {
      profiles = await this.profileRepo.find({
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
    } catch (err) {
      this.logger.warn(
        `findById: failed to load profiles for user "${id}": ${(err as Error).message}`,
      );
    }

    const [userRoles, userZones, reportingLines] = await Promise.all([
      this.userRoleRepository.find({ where: { userId: id }, relations: { role: true, department: true } }),
      this.userZoneRepository.find({ where: { userId: id }, relations: { zone: true } }),
      this.reportingLineRepository.find({ where: { userId: id, levelRank: 1 }, relations: { reportsTo: true } }),
    ]);

    const deptAdminCheck = user.departmentId ? await this.repository.manager.findOne(Department, {
      where: { id: user.departmentId, departmentAdminId: id },
    }) : null;

    return {
      ...user,
      profiles,
      userRoles: userRoles.map(ur => ({ roleId: ur.roleId, roleName: ur.role?.name, departmentId: ur.departmentId, departmentName: ur.department?.name })),
      userZones: userZones.map(uz => ({ zoneId: uz.zoneId, zoneName: uz.zone?.name })),
      reportingManager: reportingLines.length > 0 ? { empId: reportingLines[0].reportsTo.empId, name: reportingLines[0].reportsTo.name } : null,
      isDepartmentAdmin: !!deptAdminCheck,
    };
  }

  async findReportingManagers(zoneId: number, departmentId: number, search?: string): Promise<any[]> {
    const qb = this.repository.createQueryBuilder('u')
      .where('u.deleted_at IS NULL')
      .andWhere('u.is_active = :isActive', { isActive: true })
      .innerJoin('user_zones', 'uz', 'uz.user_id = u.emp_id AND uz.zone_id = :zoneId', { zoneId })
      .innerJoin('user_roles', 'ur', 'ur.user_id = u.emp_id')
      .innerJoin('departments', 'd', 'd.id = ur.department_id')
      .innerJoin('roles', 'r', 'r.id = ur.role_id')
      .leftJoin('department_roles', 'dr', 'dr.department_id = d.id AND dr.role_id = r.id')
      .andWhere('ur.department_id = :departmentId', { departmentId });

    if (search) {
      qb.andWhere('(u.name ILIKE :search OR u.emp_id ILIKE :search)', { search: `%${search}%` });
    }

    qb.select([
      'u.emp_id AS "empId"',
      'u.name AS "name"',
      'u.email AS "email"',
      'd.name AS "departmentName"',
      'r.name AS "roleName"',
    ])
    .orderBy('d.name', 'ASC')
    .addOrderBy('r.name', 'ASC')
    .addOrderBy('u.name', 'ASC')
    .distinct(true);

    return qb.getRawMany();
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

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<User & { profiles?: PermissionProfile[] }> {
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
    const allProjectIds = new Set<number>();
    if (dto.profiles) {
      await this.profileRepo.delete({ userId: id });

      const deptRolePairs = new Set<string>();
      for (const profileDto of dto.profiles) {
        // Validate buddy RM requires department + role
        if (profileDto.profileType === ProfileType.BUDDY_RM) {
          if (!profileDto.departmentId || !profileDto.roleId) {
            throw new BadRequestException(
              'Buddy RM profile requires departmentId and roleId',
            );
          }
          if (profileDto.buddyUserId === id) {
            throw new BadRequestException('Buddy RM cannot be the same user');
          }
        }

        // Validate no duplicate dept+role across profiles
        if (profileDto.departmentId && profileDto.roleId) {
          const pair = `${profileDto.departmentId}:${profileDto.roleId}`;
          if (deptRolePairs.has(pair)) {
            throw new BadRequestException(
              `Duplicate department+role assignment: department ${profileDto.departmentId}, role ${profileDto.roleId}`,
            );
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
                    allProjectIds.add(projDto.projectId);
                  }
                }
              }
            }
          }
        }
      }
    }

    // Sync UserProjectAccess records so the permission system can resolve project IDs
    await this.userProjectAccessRepository.delete({ userId: id });
    for (const projectId of allProjectIds) {
      await this.userProjectAccessRepository.save(
        this.userProjectAccessRepository.create({
          userId: id,
          projectId,
          assignedBy: 'SYSTEM',
          assignedAt: new Date(),
        }),
      );
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

      // --- Zone-aware validation ---
      const { zoneId, primaryRole, secondaryRoles } = dto.organization;

      const zone = await queryRunner.manager.findOne(Zone, { where: { id: zoneId } });
      if (!zone) {
        throw new BadRequestException(`Zone with id ${zoneId} not found`);
      }
      if (zone.isActive === false) {
        throw new BadRequestException(`Zone "${zone.name}" is not active`);
      }

      if (dto.basic.departmentId) {
        const dept = await queryRunner.manager.findOne(Department, {
          where: { id: dto.basic.departmentId, deletedAt: null },
        });
        if (!dept) {
          throw new BadRequestException(`Department with id ${dto.basic.departmentId} not found`);
        }
        if (dept.zoneId !== zoneId) {
          throw new BadRequestException(
            `Department "${dept.name}" does not belong to the selected zone`,
          );
        }

        if (primaryRole) {
          const deptRole = await queryRunner.manager.findOne(DepartmentRole, {
            where: { departmentId: dto.basic.departmentId, roleId: primaryRole },
          });
          if (!deptRole) {
            throw new BadRequestException(
              `Primary role is not assigned to the selected department`,
            );
          }
        }

        if (secondaryRoles?.length) {
          for (const sr of secondaryRoles) {
            const deptRole = await queryRunner.manager.findOne(DepartmentRole, {
              where: { departmentId: dto.basic.departmentId, roleId: sr.roleId },
            });
            if (!deptRole) {
              throw new BadRequestException(
                `Secondary role id ${sr.roleId} is not assigned to the selected department`,
              );
            }
          }
        }
      }

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
          for (const entry of dto.organization.secondaryRoles) {
            const sr = queryRunner.manager.create(UserRole, {
              userId: savedUser.empId,
              departmentId: entry.departmentId ?? dto.basic.departmentId,
              roleId: entry.roleId,
              assignedBy: 'SYSTEM',
              assignedAt: new Date(),
            });
            roles.push(await queryRunner.manager.save(sr));
          }
        }

        // Assign the primary zone
        const uz = queryRunner.manager.create(UserZone, {
          userId: savedUser.empId,
          zoneId: dto.organization.zoneId,
          assignedAt: new Date(),
        });
        zones.push(await queryRunner.manager.save(uz));
      }

      // Handle Department Administrator assignment
      if (dto.organization.isDepartmentAdmin && dto.basic.departmentId) {
        const deptWithAdmin = await queryRunner.manager.findOne(Department, {
          where: { id: dto.basic.departmentId },
        });
        if (deptWithAdmin?.departmentAdminId) {
          throw new BadRequestException(
            `This department already has a Department Administrator (${deptWithAdmin.departmentAdminId}). Only one active Department Administrator is allowed per department.`,
          );
        }
        await queryRunner.manager.update(
          Department,
          { id: dto.basic.departmentId },
          { departmentAdminId: savedUser.empId },
        );
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

      // Create permission profiles and UserProjectAccess records
      const allProjectIds = new Set<number>();
      if (dto.profiles?.length) {
        const deptRolePairs = new Set<string>();
        for (const profileDto of dto.profiles) {
          // Validate buddy RM requires department + role
          if (profileDto.profileType === ProfileType.BUDDY_RM) {
            if (!profileDto.departmentId || !profileDto.roleId) {
              throw new BadRequestException(
                'Buddy RM profile requires departmentId and roleId',
              );
            }
            if (profileDto.buddyUserId === savedUser.empId) {
              throw new BadRequestException('Buddy RM cannot be the same user');
            }
          }

          // Validate no duplicate dept+role across profiles
          if (profileDto.departmentId && profileDto.roleId) {
            const pair = `${profileDto.departmentId}:${profileDto.roleId}`;
            if (deptRolePairs.has(pair)) {
              throw new BadRequestException(
                `Duplicate department+role assignment: department ${profileDto.departmentId}, role ${profileDto.roleId}`,
              );
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
                  const ppsm = queryRunner.manager.create(
                    PermissionProfileSubModule,
                    {
                      profileModuleId: savedMod.id,
                      subModuleId: smDto.subModuleId,
                      inheritFutureProjects:
                        smDto.inheritFutureProjects ?? false,
                    },
                  );
                  const savedSm = await queryRunner.manager.save(ppsm);

                  if (smDto.projects?.length) {
                    for (const projDto of smDto.projects) {
                      const ppp = queryRunner.manager.create(
                        PermissionProfileProject,
                        {
                          profileSubModuleId: savedSm.id,
                          projectId: projDto.projectId,
                          selectedBy: projDto.selectedBy ?? 'SYSTEM',
                        },
                      );
                      await queryRunner.manager.save(ppp);
                      allProjectIds.add(projDto.projectId);
                    }
                  }
                }
              }
            }
          }

          profiles.push(savedProfile);
        }
      }

      // Create UserProjectAccess records so the permission system can resolve project IDs
      for (const projectId of allProjectIds) {
        await queryRunner.manager.save(
          queryRunner.manager.create(UserProjectAccess, {
            userId: savedUser.empId,
            projectId,
            assignedBy: 'SYSTEM',
            assignedAt: new Date(),
          }),
        );
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
          this.compilerService
            .compileAndSave(savedUser.empId, pid)
            .catch((err) =>
              this.logger.error(
                'Failed to compile permissions for user project',
                err,
              ),
            );
        }
      }

      return {
        user: savedUser,
        roles,
        zones,
        reportingLines,
        profiles,
        generatedPassword,
      };
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
    const result = await this.repository.query(
      `SELECT emp_id FROM users ORDER BY created_at DESC LIMIT 1`,
    );

    let lastNum = 0;
    if (result?.length) {
      const match = result[0].emp_id.match(/(\d+)$/);
      lastNum = match ? parseInt(match[1], 10) : 0;
    }

    const nextNum = lastNum + 1;
    return `PPL${String(nextNum).padStart(5, '0')}`;
  }

  async updateFull(
    id: string,
    dto: CreateUserFullDto,
  ): Promise<{ user: User; roles: UserRole[]; zones: UserZone[]; reportingLines: UserReportingLine[]; profiles: PermissionProfile[] }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(User, {
        where: { empId: id },
      });
      if (!existing || existing.deletedAt) {
        throw new NotFoundException('User not found');
      }

      if (dto.basic.email && dto.basic.email !== existing.email) {
        const conflict = await queryRunner.manager.findOne(User, {
          where: { email: dto.basic.email },
        });
        if (conflict && conflict.empId !== id) {
          throw new ConflictException('Email already in use');
        }
      }

      // --- Zone-aware validation (mirrors createFull) ---
      const { zoneId, primaryRole, secondaryRoles } = dto.organization;

      const zone = await queryRunner.manager.findOne(Zone, { where: { id: zoneId } });
      if (!zone) throw new BadRequestException(`Zone with id ${zoneId} not found`);
      if (zone.isActive === false) {
        throw new BadRequestException(`Zone "${zone.name}" is not active`);
      }

      if (dto.basic.departmentId) {
        const dept = await queryRunner.manager.findOne(Department, {
          where: { id: dto.basic.departmentId, deletedAt: null },
        });
        if (!dept) {
          throw new BadRequestException(`Department with id ${dto.basic.departmentId} not found`);
        }
        if (dept.zoneId !== zoneId) {
          throw new BadRequestException(
            `Department "${dept.name}" does not belong to the selected zone`,
          );
        }

        if (primaryRole) {
          const deptRole = await queryRunner.manager.findOne(DepartmentRole, {
            where: { departmentId: dto.basic.departmentId, roleId: primaryRole },
          });
          if (!deptRole) {
            throw new BadRequestException(
              `Primary role is not assigned to the selected department`,
            );
          }
        }

        if (secondaryRoles?.length) {
          for (const sr of secondaryRoles) {
            const deptRole = await queryRunner.manager.findOne(DepartmentRole, {
              where: { departmentId: dto.basic.departmentId, roleId: sr.roleId },
            });
            if (!deptRole) {
              throw new BadRequestException(
                `Secondary role id ${sr.roleId} is not assigned to the selected department`,
              );
            }
          }
        }
      }

      // --- Basic details ---
      const oldDeptId = existing.departmentId;
      existing.name = dto.basic.name;
      existing.email = dto.basic.email;
      existing.departmentId = dto.basic.departmentId;
      if (dto.basic.employmentStatus) {
        existing.employmentStatus = dto.basic.employmentStatus;
      }
      if (dto.basic.isActive != null) {
        existing.isActive = dto.basic.isActive;
      }
      const savedUser = await queryRunner.manager.save(existing);

      // --- Department Administrator transfer ---
      const wasDeptAdmin =
        oldDeptId != null &&
        (await queryRunner.manager.findOne(Department, {
          where: { id: oldDeptId, departmentAdminId: id },
        })) != null;

      const wantDeptAdmin = !!dto.organization.isDepartmentAdmin && !!dto.basic.departmentId;

      if (wantDeptAdmin) {
        const newDept = await queryRunner.manager.findOne(Department, {
          where: { id: dto.basic.departmentId },
        });
        if (newDept?.departmentAdminId && newDept.departmentAdminId !== id) {
          throw new BadRequestException(
            `This department already has a Department Administrator (${newDept.departmentAdminId}). Only one active Department Administrator is allowed per department.`,
          );
        }
        await queryRunner.manager.update(
          Department,
          { id: dto.basic.departmentId },
          { departmentAdminId: id },
        );
      }

      if (wasDeptAdmin && (!wantDeptAdmin || oldDeptId !== dto.basic.departmentId)) {
        await queryRunner.manager.update(
          Department,
          { id: oldDeptId, departmentAdminId: id },
          { departmentAdminId: null },
        );
      }

      // --- Replace user_roles ---
      await queryRunner.manager.delete(UserRole, { userId: id });
      const roles: UserRole[] = [];
      const zones: UserZone[] = [];
      const reportingLines: UserReportingLine[] = [];
      const profiles: PermissionProfile[] = [];

      if (!dto.profiles?.length) {
        const primaryRoleRow = queryRunner.manager.create(UserRole, {
          userId: id,
          departmentId: dto.basic.departmentId,
          roleId: dto.organization.primaryRole,
          assignedBy: 'SYSTEM',
          assignedAt: new Date(),
        });
        roles.push(await queryRunner.manager.save(primaryRoleRow));

        if (dto.organization.secondaryRoles?.length) {
          for (const entry of dto.organization.secondaryRoles) {
            const sr = queryRunner.manager.create(UserRole, {
              userId: id,
              departmentId: entry.departmentId ?? dto.basic.departmentId,
              roleId: entry.roleId,
              assignedBy: 'SYSTEM',
              assignedAt: new Date(),
            });
            roles.push(await queryRunner.manager.save(sr));
          }
        }

        // Replace the primary zone assignment
        await queryRunner.manager.delete(UserZone, { userId: id });
        const uz = queryRunner.manager.create(UserZone, {
          userId: id,
          zoneId: dto.organization.zoneId,
          assignedAt: new Date(),
        });
        zones.push(await queryRunner.manager.save(uz));
      }

      // --- Replace reporting lines ---
      await queryRunner.manager.delete(UserReportingLine, { userId: id });
      if (dto.organization.reporting?.length) {
        for (const entry of dto.organization.reporting) {
          const rl = queryRunner.manager.create(UserReportingLine, {
            userId: id,
            reportsToUserId: entry.managerId,
            levelRank: entry.levelRank,
            effectiveFrom: new Date(),
          });
          reportingLines.push(await queryRunner.manager.save(rl));
        }
      }

      // --- Replace permission profiles + UserProjectAccess ---
      await queryRunner.manager.delete(PermissionProfile, { userId: id });
      const allProjectIds = new Set<number>();
      if (dto.profiles?.length) {
        const deptRolePairs = new Set<string>();
        for (const profileDto of dto.profiles) {
          if (profileDto.profileType === ProfileType.BUDDY_RM) {
            if (!profileDto.departmentId || !profileDto.roleId) {
              throw new BadRequestException(
                'Buddy RM profile requires departmentId and roleId',
              );
            }
            if (profileDto.buddyUserId === id) {
              throw new BadRequestException('Buddy RM cannot be the same user');
            }
          }

          if (profileDto.departmentId && profileDto.roleId) {
            const pair = `${profileDto.departmentId}:${profileDto.roleId}`;
            if (deptRolePairs.has(pair)) {
              throw new BadRequestException(
                `Duplicate department+role assignment: department ${profileDto.departmentId}, role ${profileDto.roleId}`,
              );
            }
            deptRolePairs.add(pair);
          }

          const profile = queryRunner.manager.create(PermissionProfile, {
            userId: id,
            profileType: profileDto.profileType,
            departmentId: profileDto.departmentId ?? null,
            roleId: profileDto.roleId ?? null,
            buddyUserId: profileDto.buddyUserId ?? null,
            displayName: profileDto.displayName ?? null,
            status: profileDto.status ?? 'ACTIVE',
          });
          const savedProfile = await queryRunner.manager.save(profile);

          // user_role for backward compat
          if (profileDto.roleId && profileDto.departmentId) {
            const ur = queryRunner.manager.create(UserRole, {
              userId: id,
              departmentId: profileDto.departmentId,
              roleId: profileDto.roleId,
              assignedBy: 'SYSTEM',
              assignedAt: new Date(),
            });
            roles.push(await queryRunner.manager.save(ur));
          }

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
                  const ppsm = queryRunner.manager.create(
                    PermissionProfileSubModule,
                    {
                      profileModuleId: savedMod.id,
                      subModuleId: smDto.subModuleId,
                      inheritFutureProjects: smDto.inheritFutureProjects ?? false,
                    },
                  );
                  const savedSm = await queryRunner.manager.save(ppsm);

                  if (smDto.projects?.length) {
                    for (const projDto of smDto.projects) {
                      const ppp = queryRunner.manager.create(
                        PermissionProfileProject,
                        {
                          profileSubModuleId: savedSm.id,
                          projectId: projDto.projectId,
                          selectedBy: projDto.selectedBy ?? 'SYSTEM',
                        },
                      );
                      await queryRunner.manager.save(ppp);
                      allProjectIds.add(projDto.projectId);
                    }
                  }
                }
              }
            }
          }

          profiles.push(savedProfile);
        }
      }

      // Sync UserProjectAccess records (only when profiles drive project selection)
      if (dto.profiles?.length) {
        await queryRunner.manager.delete(UserProjectAccess, { userId: id });
        for (const projectId of allProjectIds) {
          await queryRunner.manager.save(
            queryRunner.manager.create(UserProjectAccess, {
              userId: id,
              projectId,
              assignedBy: 'SYSTEM',
              assignedAt: new Date(),
            }),
          );
        }
      }

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
          this.compilerService
            .compileAndSave(id, pid)
            .catch((err) =>
              this.logger.error(
                'Failed to compile permissions for user project',
                err,
              ),
            );
        }
      }

      return { user: savedUser, roles, zones, reportingLines, profiles };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `User update transaction failed: ${(err as Error).message}`,
      );
      if (
        err instanceof ConflictException ||
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }
      throw new BadRequestException(
        'User update failed. All changes rolled back.',
      );
    } finally {
      await queryRunner.release();
    }
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
      .catch((err) =>
        this.logger.error('Failed to send role-assigned notification', err),
      );

    this.compilerService
      .compileForAllUserProjects(dto.userId)
      .catch((err) =>
        this.logger.error(
          'Failed to compile permissions after role assignment',
          err,
        ),
      );

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

    this.compilerService
      .compileForAllUserProjects(userId)
      .catch((err) =>
        this.logger.error(
          'Failed to compile permissions after role revoke',
          err,
        ),
      );
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
