import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalWorkflow } from './entities/approval-workflow.entity';
import { ApprovalStep } from './entities/approval-step.entity';
import { ApprovalRequest } from './entities/approval-request.entity';
import { ApprovalRequestStep } from './entities/approval-request-step.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { UserDelegation } from '../delegation/entities/user-delegation.entity';
import { Module as ProductModule } from '../product-catalog/entities/module.entity';
import { WorkflowService } from './services/workflow.service';
import { ApprovalService } from './services/approval.service';
import { DelegationService } from './services/delegation.service';
import { WorkflowController } from './controllers/workflow.controller';
import { ApprovalController } from './controllers/approval.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApprovalWorkflow,
      ApprovalStep,
      ApprovalRequest,
      ApprovalRequestStep,
      User,
      UserRole,
      UserDelegation,
      ProductModule,
    ]),
    AuditModule,
    NotificationsModule,
  ],
  controllers: [WorkflowController, ApprovalController],
  providers: [WorkflowService, ApprovalService, DelegationService],
  exports: [WorkflowService, ApprovalService, DelegationService, TypeOrmModule],
})
export class WorkflowsModule {}
