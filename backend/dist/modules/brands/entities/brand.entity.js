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
exports.Brand = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../common/entities/app-base.entity");
let Brand = class Brand extends app_base_entity_1.AppBaseEntity {
    brandName;
    salaryMultiplier;
    razorpayMerchantId;
    razorpaySecretKey;
    easebuzzBookingSalt;
    easebuzzBookingKey;
    easebuzzBookingSubMerchantId;
    easebuzzMilestoneSalt;
    easebuzzMilestoneKey;
    easebuzzMilestoneSubMerchantId;
    billingName;
    panNumber;
    gstin;
    address1;
    address2;
    pinCode;
    logoUrl;
    reraRegularizationPercentage;
    reraQualificationPercentage;
    maximumRegularizationDays;
    rtmRegularizationPercentage;
    rtmQualificationPercentage;
    regularizationStartDate;
    termsAndConditions;
    isActive;
};
exports.Brand = Brand;
__decorate([
    (0, typeorm_1.Column)({ name: 'brand_name', unique: true, nullable: false }),
    __metadata("design:type", String)
], Brand.prototype, "brandName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salary_multiplier', type: 'decimal', precision: 10, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], Brand.prototype, "salaryMultiplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'razorpay_merchant_id', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "razorpayMerchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'razorpay_secret_key', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "razorpaySecretKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'easebuzz_booking_salt', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "easebuzzBookingSalt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'easebuzz_booking_key', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "easebuzzBookingKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'easebuzz_booking_sub_merchant_id', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "easebuzzBookingSubMerchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'easebuzz_milestone_salt', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "easebuzzMilestoneSalt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'easebuzz_milestone_key', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "easebuzzMilestoneKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'easebuzz_milestone_sub_merchant_id', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "easebuzzMilestoneSubMerchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'billing_name', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "billingName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pan_number', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "panNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gstin', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "gstin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_1', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "address1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_2', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "address2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pin_code', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "pinCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logo_url', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rera_regularization_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Brand.prototype, "reraRegularizationPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rera_qualification_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Brand.prototype, "reraQualificationPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maximum_regularization_days', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Brand.prototype, "maximumRegularizationDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rtm_regularization_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Brand.prototype, "rtmRegularizationPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rtm_qualification_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Brand.prototype, "rtmQualificationPercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'regularization_start_date', type: 'date', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "regularizationStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'terms_and_conditions', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Brand.prototype, "termsAndConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Brand.prototype, "isActive", void 0);
exports.Brand = Brand = __decorate([
    (0, typeorm_1.Entity)('brands')
], Brand);
//# sourceMappingURL=brand.entity.js.map