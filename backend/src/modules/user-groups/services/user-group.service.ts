import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGroup } from '../entities/user-group.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateUserGroupDto, UpdateUserGroupDto } from '../dto/user-group.dto';

@Injectable()
export class UserGroupService extends BaseService<UserGroup> {
  constructor(
    @InjectRepository(UserGroup)
    readonly repository: Repository<UserGroup>,
  ) {
    super(repository);
  }

  async create(dto: CreateUserGroupDto): Promise<UserGroup> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdateUserGroupDto): Promise<UserGroup> {
    return super.update(id, dto);
  }
}
