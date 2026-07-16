import { AppBaseEntity } from '../../../common/entities/app-base.entity';
export declare class Brand extends AppBaseEntity {
    brandName: string;
    salaryMultiplier: number;
    razorpayMerchantId: string;
    razorpaySecretKey: string;
    easebuzzBookingSalt: string;
    easebuzzBookingKey: string;
    easebuzzBookingSubMerchantId: string;
    easebuzzMilestoneSalt: string;
    easebuzzMilestoneKey: string;
    easebuzzMilestoneSubMerchantId: string;
    billingName: string;
    panNumber: string;
    gstin: string;
    address1: string;
    address2: string;
    pinCode: string;
    logoUrl: string;
    reraRegularizationPercentage: number;
    reraQualificationPercentage: number;
    maximumRegularizationDays: number;
    rtmRegularizationPercentage: number;
    rtmQualificationPercentage: number;
    regularizationStartDate: string;
    termsAndConditions: string;
    isActive: boolean;
}
