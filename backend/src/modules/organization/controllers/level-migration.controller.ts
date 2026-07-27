import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LevelMigrationService } from '../services/level-migration.service';
import { RemoveLevelDto } from '../dto/remove-level.dto';

@ApiTags('Organization - Hierarchy Levels')
@ApiBearerAuth()
@Controller('departments/:departmentId/hierarchy-levels')
export class LevelMigrationController {
  constructor(private readonly levelMigrationService: LevelMigrationService) {}

  @Get(':levelNumber/impact')
  @ApiOperation({
    summary: 'Get impact preview before removing a hierarchy level',
    description:
      'Returns dependency counts, protection status, auto-merge eligibility, and available destinations.',
  })
  @ApiResponse({ status: 200, description: 'Impact preview' })
  @ApiResponse({ status: 404, description: 'Department or level not found' })
  async getImpactPreview(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
  ) {
    return this.levelMigrationService.getImpactPreview(
      departmentId,
      levelNumber,
    );
  }

  @Post(':levelNumber/remove')
  @ApiOperation({
    summary: 'Remove a hierarchy level with merge or replace migration',
    description:
      'MERGE: combine users, permissions and roles into destination level. REPLACE: reassign users only, destination permissions unchanged.',
  })
  @ApiResponse({ status: 200, description: 'Level removed successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Department or level not found' })
  async remove(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
    @Body() dto: RemoveLevelDto,
  ) {
    return this.levelMigrationService.remove(departmentId, levelNumber, dto);
  }

  @Get(':levelNumber/remove/check')
  @ApiOperation({
    summary: 'Check if hierarchy level can be auto-removed (no dependencies)',
  })
  @ApiResponse({ status: 200, description: 'Auto-merge check result' })
  async checkAutoMerge(
    @Param('departmentId', ParseIntPipe) departmentId: number,
    @Param('levelNumber', ParseIntPipe) levelNumber: number,
  ) {
    return this.levelMigrationService.checkAutoMerge(departmentId, levelNumber);
  }
}
