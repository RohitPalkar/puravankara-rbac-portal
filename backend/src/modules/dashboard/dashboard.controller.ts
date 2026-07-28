import { Controller, Get, Query } from '@nestjs/common';
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
  getOperationsSummary(@Query('zoneId') zoneId?: number) {
    return this.dashboardService.getOperationsSummary(zoneId ? Number(zoneId) : undefined);
  }

  @Get('kpis')
  @ApiOperation({ summary: 'KPI counts' })
  getKpis(@Query('zoneId') zoneId?: number) {
    return this.dashboardService.getKpis(zoneId ? Number(zoneId) : undefined);
  }

  @Get('system-info')
  @ApiOperation({ summary: 'System information and uptime' })
  getSystemInfo() {
    return this.dashboardService.getSystemInfo();
  }
}
