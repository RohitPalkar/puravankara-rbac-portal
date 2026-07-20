import { AppBase } from './common';

export interface ProjectGroup extends AppBase {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CreateProjectGroupRequest {
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateProjectGroupRequest = Partial<CreateProjectGroupRequest>;

export interface AssignProjectAccessRequest {
  userId: string;
  projectId: number;
}

export interface AssignBulkProjectAccessRequest {
  userId: string;
  projectIds: number[];
}

export interface AddProjectToGroupRequest {
  groupId: number;
  projectId: number;
}

export interface AssignUserProjectGroupRequest {
  userId: string;
  groupId: number;
}

export interface UserProjectAccess {
  userId: string;
  projectId: number;
  projectName?: string;
  assignedAt: string;
}

export interface ProjectGroupProject {
  groupId: number;
  projectId: number;
  projectName?: string;
}

export interface UserProjectGroup {
  userId: string;
  groupId: number;
  groupName?: string;
}
