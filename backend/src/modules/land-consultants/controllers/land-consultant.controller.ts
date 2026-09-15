import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LandConsultantService } from '../services/land-consultant.service';
import {
  CreateLandConsultantDto,
  UpdateLandConsultantDto,
} from '../dto/land-consultant.dto';
import { QueryLandConsultantDto } from '../dto/query-land-consultant.dto';
import { LandConsultant } from '../entities/land-consultant.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Land Consultants')
@ApiBearerAuth()
@Controller('land-consultants')
export class LandConsultantController extends BaseController<
  LandConsultant,
  CreateLandConsultantDto,
  UpdateLandConsultantDto
> {
  constructor(private readonly landConsultantService: LandConsultantService) {
    super(landConsultantService, 'Land Consultant');
  }

  @Get()
  @ApiOperation({ summary: 'List all land consultants (paginated, searchable, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated list of land consultants' })
  async findAll(@Query() query: QueryLandConsultantDto) {
    const result = await this.landConsultantService.findAll(
      query as any,
      ['businessName', 'consultantName', 'contactPersonName', 'emailAddress'],
    );
    return {
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get land consultant by ID' })
  @ApiResponse({ status: 200, description: 'Land consultant found' })
  @ApiResponse({ status: 404, description: 'Land consultant not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.landConsultantService.findById(id);
  }
}
