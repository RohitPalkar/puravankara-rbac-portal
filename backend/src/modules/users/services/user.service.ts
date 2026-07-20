import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { UserZone } from '../entities/user-zone.entity';
import { UserReportingLine } from '../entities/user-reporting-line.entity';
import { UserAuth } from '../../auth/entities/user-auth.entity';
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
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationQuery): Promise<PaginatedResult<User>> {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;
    const where: any = { deletedAt: null };

    if (search) {
      where.name = { $ilike: `%${search}%` };
    }

    const [data, total] = await this.repository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: { department: true },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.repository.findOne({
      where: { empId: id },
      relations: { department: true },
    });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    return user;
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

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.email && dto.email !== user.email) {
      const existing = await this.repository.findOne({
        where: { email: dto.email },
      });
      if (existing) throw new ConflictException('Email already in use');
    }
    Object.assign(user, dto);
    return this.repository.save(user);
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

      const zones: UserZone[] = [];
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

      const reportingLines: UserReportingLine[] = [];
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

      await queryRunner.commitTransaction();

      return { user: savedUser, roles, zones, reportingLines };
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
      .catch(() => {});

    this.compilerService.compileForAllUserProjects(dto.userId).catch(() => {});

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

    this.compilerService.compileForAllUserProjects(userId).catch(() => {});
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
