import { Repository } from 'typeorm';
import { UserProjectAccess } from '../entities/user-project-access.entity';
import { ProjectGroup } from '../entities/project-group.entity';
import { ProjectGroupProject } from '../entities/project-group-project.entity';
import { UserProjectGroup } from '../entities/user-project-group.entity';
import { BaseService } from '../../../common/crud/base.service';
import { PermissionCompilerService } from '../../permissions/services/permission-compiler.service';
import { NotificationService } from '../../notifications/services/notification.service';
export declare class UserProjectAccessService {
    readonly repository: Repository<UserProjectAccess>;
    private readonly compilerService;
    private readonly notifService;
    constructor(repository: Repository<UserProjectAccess>, compilerService: PermissionCompilerService, notifService: NotificationService);
    findByUser(userId: string): Promise<UserProjectAccess[]>;
    assign(dto: {
        userId: string;
        projectId: number;
        assignedBy?: string;
    }): Promise<UserProjectAccess>;
    assignBulk(dto: {
        userId: string;
        projectIds: number[];
        assignedBy?: string;
    }): Promise<UserProjectAccess[]>;
    revoke(userId: string, projectId: number): Promise<void>;
}
export declare class ProjectGroupService extends BaseService<ProjectGroup> {
    readonly repository: Repository<ProjectGroup>;
    constructor(repository: Repository<ProjectGroup>);
}
export declare class ProjectGroupProjectService {
    readonly repository: Repository<ProjectGroupProject>;
    constructor(repository: Repository<ProjectGroupProject>);
    findByGroup(groupId: number): Promise<ProjectGroupProject[]>;
    addProject(groupId: number, projectId: number): Promise<ProjectGroupProject>;
    removeProject(groupId: number, projectId: number): Promise<void>;
}
export declare class UserProjectGroupService {
    readonly repository: Repository<UserProjectGroup>;
    constructor(repository: Repository<UserProjectGroup>);
    findByUser(userId: string): Promise<UserProjectGroup[]>;
    assign(dto: {
        userId: string;
        groupId: number;
        assignedBy?: string;
    }): Promise<UserProjectGroup>;
    revoke(userId: string, groupId: number): Promise<void>;
}
