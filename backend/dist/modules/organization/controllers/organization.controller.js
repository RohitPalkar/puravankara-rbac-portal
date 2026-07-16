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
exports.RoleController = exports.DepartmentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organization_service_1 = require("../services/organization.service");
const base_controller_1 = require("../../../common/crud/base.controller");
let DepartmentController = class DepartmentController extends base_controller_1.BaseController {
    departmentService;
    constructor(departmentService) {
        super(departmentService, 'Department');
        this.departmentService = departmentService;
    }
};
exports.DepartmentController = DepartmentController;
exports.DepartmentController = DepartmentController = __decorate([
    (0, swagger_1.ApiTags)('Organization - Departments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('departments'),
    __metadata("design:paramtypes", [organization_service_1.DepartmentService])
], DepartmentController);
let RoleController = class RoleController extends base_controller_1.BaseController {
    roleService;
    constructor(roleService) {
        super(roleService, 'Role');
        this.roleService = roleService;
    }
};
exports.RoleController = RoleController;
exports.RoleController = RoleController = __decorate([
    (0, swagger_1.ApiTags)('Organization - Roles'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [organization_service_1.RoleService])
], RoleController);
//# sourceMappingURL=organization.controller.js.map