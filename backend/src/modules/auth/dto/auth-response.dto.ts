import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserInfo {
  @ApiProperty()
  empId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  roles: string[];
}

class ActionPermission {
  @ApiProperty()
  code: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  allowed: boolean;
}

class SubModulePermissions {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [ActionPermission] })
  actions: ActionPermission[];
}

class ModulePermissions {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [SubModulePermissions] })
  subModules: SubModulePermissions[];
}

class ProjectPermissions {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [ModulePermissions] })
  modules: ModulePermissions[];
}

class CompiledPermissions {
  @ApiProperty({ type: [ProjectPermissions] })
  projects: ProjectPermissions[];
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  user: UserInfo;

  @ApiPropertyOptional({ type: [ProjectPermissions] })
  permissions?: CompiledPermissions;
}
