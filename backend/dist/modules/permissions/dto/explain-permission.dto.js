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
exports.ExplainPermissionResponse = exports.ExplainStep = exports.ExplainPermissionDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ExplainPermissionDto {
    userId;
    projectId;
    module;
    action;
}
exports.ExplainPermissionDto = ExplainPermissionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExplainPermissionDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], ExplainPermissionDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExplainPermissionDto.prototype, "module", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExplainPermissionDto.prototype, "action", void 0);
class ExplainStep {
    step;
    result;
    message;
}
exports.ExplainStep = ExplainStep;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ExplainStep.prototype, "step", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ExplainStep.prototype, "result", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ExplainStep.prototype, "message", void 0);
class ExplainPermissionResponse {
    allowed;
    source;
    explanation;
}
exports.ExplainPermissionResponse = ExplainPermissionResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ExplainPermissionResponse.prototype, "allowed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ExplainPermissionResponse.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ExplainStep] }),
    __metadata("design:type", Array)
], ExplainPermissionResponse.prototype, "explanation", void 0);
//# sourceMappingURL=explain-permission.dto.js.map