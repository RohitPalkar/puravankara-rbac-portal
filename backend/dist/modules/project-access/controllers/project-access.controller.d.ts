import { UserProjectAccessService, ProjectGroupService, ProjectGroupProjectService, UserProjectGroupService } from '../services/project-access.service';
import { AssignProjectAccessDto, AssignBulkProjectAccessDto, CreateProjectGroupDto, UpdateProjectGroupDto, AddProjectToGroupDto, AssignUserProjectGroupDto } from '../dto/project-access.dto';
import { ProjectGroup } from '../entities/project-group.entity';
import { BaseController } from '../../../common/crud/base.controller';
export declare class UserProjectAccessController {
    private readonly svc;
    constructor(svc: UserProjectAccessService);
    findByUser(userId: string): Promise<import("../entities/user-project-access.entity").UserProjectAccess[]>;
    assign(dto: AssignProjectAccessDto): Promise<import("../entities/user-project-access.entity").UserProjectAccess>;
    assignBulk(dto: AssignBulkProjectAccessDto): Promise<import("../entities/user-project-access.entity").UserProjectAccess[]>;
    revoke(userId: string, projectId: string): Promise<{
        message: string;
    }>;
}
export declare class ProjectGroupController extends BaseController<ProjectGroup, CreateProjectGroupDto, UpdateProjectGroupDto> {
    private readonly svc;
    constructor(svc: ProjectGroupService);
}
export declare class ProjectGroupProjectController {
    private readonly svc;
    constructor(svc: ProjectGroupProjectService);
    findByGroup(groupId: string): Promise<import("../entities/project-group-project.entity").ProjectGroupProject[]>;
    addProject(dto: AddProjectToGroupDto): Promise<import("../entities/project-group-project.entity").ProjectGroupProject>;
    removeProject(groupId: string, projectId: string): Promise<{
        message: string;
    }>;
}
export declare class UserProjectGroupController {
    private readonly svc;
    constructor(svc: UserProjectGroupService);
    findByUser(userId: string): Promise<import("../entities/user-project-group.entity").UserProjectGroup[]>;
    assign(dto: AssignUserProjectGroupDto): Promise<import("../entities/user-project-group.entity").UserProjectGroup>;
    revoke(userId: string, groupId: string): Promise<{
        message: string;
    }>;
}
