import { ApiProperty } from '@nestjs/swagger';

class ActionPermission {
  @ApiProperty()
  code: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ default: true })
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

class UserInfo {
  @ApiProperty()
  empId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: [String] })
  roles: string[];
}

export class UserPermissionsResponse {
  @ApiProperty()
  user: UserInfo;

  @ApiProperty({ type: [ProjectPermissions] })
  projects: ProjectPermissions[];
}

export { ProjectPermissions, ModulePermissions, SubModulePermissions, ActionPermission, UserInfo };
