import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { PermissionService } from '../services/permission.service';
import { UserRole } from '../../users/entities/user-role.entity';
export declare class PermissionGuard {
    private readonly reflector;
    private readonly permissionService;
    private readonly userRoleRepo;
    constructor(reflector: Reflector, permissionService: PermissionService, userRoleRepo: Repository<UserRole>);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private isSuperAdmin;
    private extractProjectId;
}
