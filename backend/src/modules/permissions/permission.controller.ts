import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Param,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { PermissionService } from './services/permission.service';
import { PermissionCompilerService } from './services/permission-compiler.service';
import { ScopeResolutionService } from './services/scope-resolution.service';
import { UserPermissionsResponse } from './dto/user-permissions.dto';
import { User } from '../users/entities/user.entity';
import {
  ExplainPermissionDto,
  ExplainPermissionResponse,
} from './dto/explain-permission.dto';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly compilerService: PermissionCompilerService,
    private readonly scopeService: ScopeResolutionService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user permissions for frontend' })
  async getMyPermissions(@Req() req: any): Promise<UserPermissionsResponse> {
    const userId = req.user?.empId || req.user?.userId;
    const result = await this.permissionService.getUserPermissions(userId);
    try {
      const scope = await this.scopeService.resolveUserScope(userId);
      result.scope = {
        resources: {
          zones: scope.resources.zones,
          projects: scope.resources.projects,
        },
      };
    } catch {
      // scope is optional — continue without it if resolution fails
    }
    return result;
  }

  @Post('compile/:userId/:projectId')
  @ApiOperation({
    summary: 'Compile and cache permission snapshot for user+project',
  })
  async compile(
    @Param('userId') userId: string,
    @Param('projectId') projectId: number,
  ): Promise<{ message: string }> {
    await this.compilerService.compileAndSave(userId, projectId);
    return { message: 'Permission snapshot compiled' };
  }

  @Post('compile/:userId')
  @ApiOperation({
    summary: 'Compile permission snapshots for all user projects',
  })
  async compileAll(
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    await this.compilerService.compileForAllUserProjects(userId);
    return { message: 'Permission snapshots compiled for all projects' };
  }

  @Get('snapshot/:userId/:projectId')
  @ApiOperation({ summary: 'Get compiled permission snapshot' })
  async getSnapshot(
    @Param('userId') userId: string,
    @Param('projectId') projectId: number,
  ): Promise<{ modules: any[] }> {
    return this.compilerService.getCompiled(userId, projectId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get permissions for a specific user' })
  async getUserPermissions(
    @Param('userId') userId: string,
  ): Promise<UserPermissionsResponse> {
    return this.permissionService.getUserPermissions(userId);
  }

  @Post('explain')
  @ApiOperation({ summary: 'Explain why a user has or does not have access' })
  async explain(
    @Body() dto: ExplainPermissionDto,
  ): Promise<ExplainPermissionResponse> {
    return this.permissionService.explain({
      userId: dto.userId,
      projectId: dto.projectId,
      moduleCode: dto.module,
      actionCode: dto.action,
    });
  }
}
