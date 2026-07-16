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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserInfo {
    empId;
    name;
    email;
    role;
    roles;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserInfo.prototype, "empId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserInfo.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserInfo.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserInfo.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], UserInfo.prototype, "roles", void 0);
class ActionPermission {
    code;
    label;
    allowed;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActionPermission.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ActionPermission.prototype, "label", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ActionPermission.prototype, "allowed", void 0);
class SubModulePermissions {
    id;
    name;
    actions;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SubModulePermissions.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubModulePermissions.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ActionPermission] }),
    __metadata("design:type", Array)
], SubModulePermissions.prototype, "actions", void 0);
class ModulePermissions {
    id;
    name;
    subModules;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ModulePermissions.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ModulePermissions.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SubModulePermissions] }),
    __metadata("design:type", Array)
], ModulePermissions.prototype, "subModules", void 0);
class ProjectPermissions {
    id;
    name;
    modules;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ProjectPermissions.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ProjectPermissions.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ModulePermissions] }),
    __metadata("design:type", Array)
], ProjectPermissions.prototype, "modules", void 0);
class CompiledPermissions {
    projects;
}
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ProjectPermissions] }),
    __metadata("design:type", Array)
], CompiledPermissions.prototype, "projects", void 0);
class AuthResponseDto {
    accessToken;
    refreshToken;
    expiresIn;
    user;
    permissions;
}
exports.AuthResponseDto = AuthResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AuthResponseDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AuthResponseDto.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", UserInfo)
], AuthResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [ProjectPermissions] }),
    __metadata("design:type", CompiledPermissions)
], AuthResponseDto.prototype, "permissions", void 0);
//# sourceMappingURL=auth-response.dto.js.map