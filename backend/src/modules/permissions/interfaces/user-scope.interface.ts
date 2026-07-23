export interface ResourceInfo {
  id: number;
  name: string;
}

export interface UserScope {
  userId: string;
  resources: {
    zones: ResourceInfo[];
    projects: ResourceInfo[];
  };
  hasProject(projectId: number): boolean;
  hasZone(zoneId: number): boolean;
}

export interface EffectivePermission {
  version: string;
  generatedAt: string;
  expiresAt: string;
  scope: {
    resources: {
      zones: ResourceInfo[];
      projects: ResourceInfo[];
    };
  };
  permissions: {
    modules: any[];
    subModules: any[];
    actions: any[];
  };
}
