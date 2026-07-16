import { AppBaseEntity } from '../../../common/entities/app-base.entity';
import { ApprovalRequest } from './approval-request.entity';
export declare class ApprovalRequestStep extends AppBaseEntity {
    requestId: number;
    stepOrder: number;
    approverId: string;
    status: string;
    comments: string;
    actionDate: Date;
    request: ApprovalRequest;
}
