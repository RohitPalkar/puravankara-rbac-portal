import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionService } from '../services/permission.service';
import { UserRole } from '../../users/entities/user-role.entity';
import {
  PERMISSION_KEY,
  RequirePermissionOptions,
} from '../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '../../auth/decorators/public.decorator';

@Injectable()
export class PermissionGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: PermissionService,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip permission check for @Public() endpoints
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userId = user.empId || user.userId;

    // SUPER_ADMIN bypasses all permission checks including project context
    const isSuperAdmin = await this.isSuperAdmin(userId);
    if (isSuperAdmin) {
      return true;
    }

    const permission =
      this.reflector.getAllAndOverride<RequirePermissionOptions>(
        PERMISSION_KEY,
        [context.getHandler(), context.getClass()],
      );

    // GET/HEAD/OPTIONS methods are safe — allow if no explicit permission required
    const method = request.method?.toUpperCase();
    const isSafeMethod =
      method === 'GET' || method === 'HEAD' || method === 'OPTIONS';

    if (!permission) {
      if (isSafeMethod) {
        return true;
      }
      throw new ForbiddenException(
        'Insufficient permissions. Contact administrator.',
      );
    }

    // Safe methods with explicit permission use the configured module/action
    // Mutation methods (POST/PATCH/DELETE) require the explicitly configured permission
    const projectId = this.extractProjectId(request);
    if (!projectId) {
      throw new ForbiddenException('Project ID is required');
    }

    await this.permissionService.assertOrThrow({
      userId,
      projectId,
      moduleCode: permission.module,
      actionCode: permission.action,
    });

    return true;
  }

  private async isSuperAdmin(userId: string): Promise<boolean> {
    const roles = await this.userRoleRepo.find({
      where: { userId },
      relations: { role: true },
    });
    return roles.some(
      (ur) =>
        ur.role?.isSystemRole === true ||
        ur.role?.name === 'SUPER_ADMIN',
    );
  }

  private extractProjectId(request: any): number | null {
    const headerId = request.headers['x-project-id'];
    if (headerId) return Number(headerId);

    const paramId = request.params?.projectId;
    if (paramId) return Number(paramId);

    const bodyId = request.body?.projectId;
    if (bodyId) return Number(bodyId);

    return null;
  }
}
