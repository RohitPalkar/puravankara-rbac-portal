import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { RawStringPipe } from '../../../common/pipes/raw-string.pipe';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  UserService,
  UserRoleService,
  UserReportingLineService,
} from '../services/user.service';
import { UserMetadataService } from '../services/user-metadata.service';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateUserRoleDto,
  CreateUserReportingLineDto,
  CreateUserFullDto,
} from '../dto/user.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AuditAction } from '../../audit/decorators/audit-action.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly metadataService: UserMetadataService,
  ) {}

  @Get('reporting-managers')
  @ApiOperation({ summary: 'Get potential reporting managers filtered by zone and department' })
  async getReportingManagers(
    @Query('zoneId', ParseIntPipe) zoneId: number,
    @Query('departmentId', ParseIntPipe) departmentId: number,
    @Query('search') search?: string,
  ) {
    return this.userService.findReportingManagers(zoneId, departmentId, search);
  }

  @Get('metadata')
  @ApiOperation({ summary: 'Get all dropdown metadata for user management' })
  async getMetadata() {
    return this.metadataService.getMetadata();
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by emp_id' })
  async findById(@Param('id', RawStringPipe) id: string) {
    return this.userService.findById(id);
  }

  @Post('fetch-employee')
  @ApiOperation({ summary: 'Fetch employee details from database by ID' })
  async fetchEmployee(@Body('employeeId') employeeId: string) {
    return this.userService.fetchEmployee(employeeId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @AuditAction({ entity: 'USERS', action: 'CREATE' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Post('full')
  @ApiOperation({
    summary:
      'Create user with roles, zones, and reporting hierarchy in a single transaction',
  })
  @AuditAction({ entity: 'USERS', action: 'CREATE' })
  async createFull(@Body() dto: CreateUserFullDto) {
    return this.userService.createFull(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @AuditAction({ entity: 'USERS', action: 'UPDATE' })
  async update(
    @Param('id', RawStringPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  @AuditAction({ entity: 'USERS', action: 'DELETE' })
  async remove(@Param('id', RawStringPipe) id: string) {
    await this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }
}

@ApiTags('Users - Roles')
@ApiBearerAuth()
@Controller('user-roles')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get roles for a user' })
  async findByUser(@Param('userId', RawStringPipe) userId: string) {
    return this.userRoleService.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Assign role to user' })
  @AuditAction({ entity: 'USERS', action: 'ROLE_ASSIGNED' })
  async assign(@Body() dto: CreateUserRoleDto) {
    return this.userRoleService.assign(dto);
  }

  @Delete(':userId/department/:departmentId/role/:roleId')
  @ApiOperation({ summary: 'Revoke role from user' })
  @AuditAction({ entity: 'USERS', action: 'ROLE_REVOKED' })
  async revoke(
    @Param('userId', RawStringPipe) userId: string,
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    await this.userRoleService.revoke(userId, departmentId, roleId);
    return { message: 'Role revoked successfully' };
  }
}

@ApiTags('Users - Reporting Lines')
@ApiBearerAuth()
@Controller('user-reporting-lines')
export class UserReportingLineController {
  constructor(private readonly rlService: UserReportingLineService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get reporting lines for a user' })
  async findByUser(@Param('userId', RawStringPipe) userId: string) {
    return this.rlService.findByUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create reporting line' })
  @AuditAction({ entity: 'USERS', action: 'REPORTING_LINE_CREATED' })
  async create(@Body() dto: CreateUserReportingLineDto) {
    return this.rlService.create(dto);
  }

  @Delete(':userId/reports-to/:reportsToUserId/level/:levelRank')
  @ApiOperation({ summary: 'Remove reporting line' })
  @AuditAction({ entity: 'USERS', action: 'REPORTING_LINE_REMOVED' })
  async remove(
    @Param('userId', RawStringPipe) userId: string,
    @Param('reportsToUserId', RawStringPipe) reportsToUserId: string,
    @Param('levelRank', ParseIntPipe) levelRank: number,
  ) {
    await this.rlService.remove(userId, reportsToUserId, levelRank);
    return { message: 'Reporting line removed successfully' };
  }
}
