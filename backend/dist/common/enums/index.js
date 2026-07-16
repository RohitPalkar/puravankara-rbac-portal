"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalType = exports.AuthProvider = exports.EmploymentStatus = exports.ApprovalStatus = exports.PermissionType = void 0;
var PermissionType;
(function (PermissionType) {
    PermissionType["ALLOW"] = "ALLOW";
    PermissionType["DENY"] = "DENY";
})(PermissionType || (exports.PermissionType = PermissionType = {}));
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING"] = "PENDING";
    ApprovalStatus["APPROVED"] = "APPROVED";
    ApprovalStatus["REJECTED"] = "REJECTED";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
var EmploymentStatus;
(function (EmploymentStatus) {
    EmploymentStatus["PERMANENT"] = "PERMANENT";
    EmploymentStatus["CONTRACT"] = "CONTRACT";
    EmploymentStatus["PROBATION"] = "PROBATION";
    EmploymentStatus["INTERN"] = "INTERN";
    EmploymentStatus["SERVING_NOTICE"] = "SERVING_NOTICE";
})(EmploymentStatus || (exports.EmploymentStatus = EmploymentStatus = {}));
var AuthProvider;
(function (AuthProvider) {
    AuthProvider["LOCAL"] = "LOCAL";
    AuthProvider["AZURE_AD"] = "AZURE_AD";
    AuthProvider["GOOGLE"] = "GOOGLE";
    AuthProvider["OKTA"] = "OKTA";
})(AuthProvider || (exports.AuthProvider = AuthProvider = {}));
var ApprovalType;
(function (ApprovalType) {
    ApprovalType["REVIEW"] = "REVIEW";
    ApprovalType["APPROVE"] = "APPROVE";
    ApprovalType["REJECT"] = "REJECT";
})(ApprovalType || (exports.ApprovalType = ApprovalType = {}));
//# sourceMappingURL=index.js.map