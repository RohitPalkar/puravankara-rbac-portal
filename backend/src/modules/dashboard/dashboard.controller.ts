import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('zone-overview')
  @ApiOperation({ summary: 'Zones with project and user counts' })
  getZoneOverview() {
    return this.dashboardService.getZoneOverview();
  }

  @Get('security-stats')
  @ApiOperation({ summary: 'Security statistics' })
  getSecurityStats() {
    return this.dashboardService.getSecurityStats();
  }

  @Get('operations-summary')
  @ApiOperation({ summary: 'Operations hub summary' })
  getOperationsSummary() {
    return this.dashboardService.getOperationsSummary();
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPI counts' })
  getKpis() {
    return this.dashboardService.getKpis();
  }
}
