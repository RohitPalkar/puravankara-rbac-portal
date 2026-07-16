import { ApprovalService } from '../services/approval.service';
import { ApprovalActionDto } from '../dto/approval-action.dto';
import { ApprovalHistoryResponse } from '../dto/approval-history.dto';
export declare class ApprovalController {
    private readonly approvalService;
    constructor(approvalService: ApprovalService);
    getPending(req: any): Promise<import("../entities/approval-request.entity").ApprovalRequest[]>;
    getSubmitted(req: any): Promise<import("../entities/approval-request.entity").ApprovalRequest[]>;
    getDetail(id: string): Promise<ApprovalHistoryResponse>;
    performAction(requestId: string, dto: ApprovalActionDto, req: any): Promise<ApprovalHistoryResponse>;
}
