"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBrandsTable1783077482113 = void 0;
class CreateBrandsTable1783077482113 {
    name = 'CreateBrandsTable1783077482113';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "brands" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "created_by" character varying,
        "updated_by" character varying,
        "brand_name" character varying NOT NULL,
        "salary_multiplier" numeric(10,2) NOT NULL,
        "razorpay_merchant_id" character varying,
        "razorpay_secret_key" character varying,
        "easebuzz_booking_salt" character varying,
        "easebuzz_booking_key" character varying,
        "easebuzz_booking_sub_merchant_id" character varying,
        "easebuzz_milestone_salt" character varying,
        "easebuzz_milestone_key" character varying,
        "easebuzz_milestone_sub_merchant_id" character varying,
        "billing_name" character varying,
        "pan_number" character varying,
        "gstin" character varying,
        "address_1" character varying,
        "address_2" character varying,
        "pin_code" character varying,
        "logo_url" character varying,
        "rera_regularization_percentage" numeric(5,2),
        "rera_qualification_percentage" numeric(5,2),
        "maximum_regularization_days" integer,
        "rtm_regularization_percentage" numeric(5,2),
        "rtm_qualification_percentage" numeric(5,2),
        "regularization_start_date" date,
        "terms_and_conditions" text,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "UQ_brands_brand_name" UNIQUE ("brand_name"),
        CONSTRAINT "PK_brands_id" PRIMARY KEY ("id")
      )`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "brands"`);
    }
}
exports.CreateBrandsTable1783077482113 = CreateBrandsTable1783077482113;
//# sourceMappingURL=1783077482113-CreateBrandsTable.js.map