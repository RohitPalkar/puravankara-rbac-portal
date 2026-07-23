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

class FlatModule {
  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  route: string;

  @ApiProperty({ default: true })
  allowed: boolean;

  @ApiProperty({ type: [String] })
  actions: string[];
}

class FrontendPermissions {
  @ApiProperty({ type: [FlatModule] })
  modules: FlatModule[];
}

class ScopeResourceInfo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}

class ScopeResources {
  @ApiProperty({ type: [ScopeResourceInfo] })
  zones: ScopeResourceInfo[];

  @ApiProperty({ type: [ScopeResourceInfo] })
  projects: ScopeResourceInfo[];
}

class ScopeInfo {
  @ApiProperty({ type: ScopeResources })
  resources: ScopeResources;
}

export class UserPermissionsResponse {
  @ApiProperty()
  user: UserInfo;

  @ApiProperty({ type: [ProjectPermissions] })
  projects: ProjectPermissions[];

  @ApiProperty({ type: FrontendPermissions })
  permissions: FrontendPermissions;

  @ApiProperty({ type: ScopeInfo, nullable: true })
  scope?: ScopeInfo;
}

export {
  ProjectPermissions,
  ModulePermissions,
  SubModulePermissions,
  ActionPermission,
  UserInfo,
  FlatModule,
  FrontendPermissions,
};
