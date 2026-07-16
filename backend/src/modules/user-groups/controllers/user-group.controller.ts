import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserGroupService } from '../services/user-group.service';
import { CreateUserGroupDto, UpdateUserGroupDto } from '../dto/user-group.dto';
import { UserGroup } from '../entities/user-group.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('User Groups')
@ApiBearerAuth()
@Controller('user-groups')
export class UserGroupController extends BaseController<
  UserGroup,
  CreateUserGroupDto,
  UpdateUserGroupDto
> {
  constructor(protected readonly service: UserGroupService) {
    super(service, 'UserGroup');
  }
}
