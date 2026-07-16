"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProjectGroupController = exports.ProjectGroupProjectController = exports.ProjectGroupController = exports.UserProjectAccessController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const project_access_service_1 = require("../services/project-access.service");
const project_access_dto_1 = require("../dto/project-access.dto");
const base_controller_1 = require("../../../common/crud/base.controller");
let UserProjectAccessController = class UserProjectAccessController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async findByUser(userId) {
        return this.svc.findByUser(userId);
    }
    async assign(dto) {
        return this.svc.assign(dto);
    }
    async assignBulk(dto) {
        return this.svc.assignBulk(dto);
    }
    async revoke(userId, projectId) {
        await this.svc.revoke(userId, +projectId);
        return { message: 'Project access revoked' };
    }
};
exports.UserProjectAccessController = UserProjectAccessController;
__decorate([
    (0, common_1.Get)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get projects accessible to a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserProjectAccessController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Assign single project to user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_access_dto_1.AssignProjectAccessDto]),
    __metadata("design:returntype", Promise)
], UserProjectAccessController.prototype, "assign", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign multiple projects to user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_access_dto_1.AssignBulkProjectAccessDto]),
    __metadata("design:returntype", Promise)
], UserProjectAccessController.prototype, "assignBulk", null);
__decorate([
    (0, common_1.Delete)(':userId/project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke project access from user' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserProjectAccessController.prototype, "revoke", null);
exports.UserProjectAccessController = UserProjectAccessController = __decorate([
    (0, swagger_1.ApiTags)('Project Access'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('user-project-access'),
    __metadata("design:paramtypes", [project_access_service_1.UserProjectAccessService])
], UserProjectAccessController);
let ProjectGroupController = class ProjectGroupController extends base_controller_1.BaseController {
    svc;
    constructor(svc) {
        super(svc, 'ProjectGroup');
        this.svc = svc;
    }
};
exports.ProjectGroupController = ProjectGroupController;
exports.ProjectGroupController = ProjectGroupController = __decorate([
    (0, swagger_1.ApiTags)('Project Access - Groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('project-groups'),
    __metadata("design:paramtypes", [project_access_service_1.ProjectGroupService])
], ProjectGroupController);
let ProjectGroupProjectController = class ProjectGroupProjectController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async findByGroup(groupId) {
        return this.svc.findByGroup(+groupId);
    }
    async addProject(dto) {
        return this.svc.addProject(dto.groupId, dto.projectId);
    }
    async removeProject(groupId, projectId) {
        await this.svc.removeProject(+groupId, +projectId);
        return { message: 'Project removed from group' };
    }
};
exports.ProjectGroupProjectController = ProjectGroupProjectController;
__decorate([
    (0, common_1.Get)(':groupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get projects in a group' }),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectGroupProjectController.prototype, "findByGroup", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add project to group' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_access_dto_1.AddProjectToGroupDto]),
    __metadata("design:returntype", Promise)
], ProjectGroupProjectController.prototype, "addProject", null);
__decorate([
    (0, common_1.Delete)(':groupId/project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove project from group' }),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectGroupProjectController.prototype, "removeProject", null);
exports.ProjectGroupProjectController = ProjectGroupProjectController = __decorate([
    (0, swagger_1.ApiTags)('Project Access - Group Projects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('project-group-projects'),
    __metadata("design:paramtypes", [project_access_service_1.ProjectGroupProjectService])
], ProjectGroupProjectController);
let UserProjectGroupController = class UserProjectGroupController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async findByUser(userId) {
        return this.svc.findByUser(userId);
    }
    async assign(dto) {
        return this.svc.assign(dto);
    }
    async revoke(userId, groupId) {
        await this.svc.revoke(userId, +groupId);
        return { message: 'User removed from group' };
    }
};
exports.UserProjectGroupController = UserProjectGroupController;
__decorate([
    (0, common_1.Get)(':userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get groups for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserProjectGroupController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Assign user to project group' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_access_dto_1.AssignUserProjectGroupDto]),
    __metadata("design:returntype", Promise)
], UserProjectGroupController.prototype, "assign", null);
__decorate([
    (0, common_1.Delete)(':userId/group/:groupId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove user from project group' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserProjectGroupController.prototype, "revoke", null);
exports.UserProjectGroupController = UserProjectGroupController = __decorate([
    (0, swagger_1.ApiTags)('Project Access - User Groups'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('user-project-groups'),
    __metadata("design:paramtypes", [project_access_service_1.UserProjectGroupService])
], UserProjectGroupController);
//# sourceMappingURL=project-access.controller.js.map