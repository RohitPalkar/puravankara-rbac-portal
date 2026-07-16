import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { AuditQueryDto } from '../dto/audit-query.dto';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission({ module: 'Audit', action: 'VIEW' })
  @ApiOperation({ summary: 'Query audit logs (paginated, filterable)' })
  async findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
  }
}
