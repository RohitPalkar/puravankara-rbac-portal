import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BrandService } from '../services/brand.service';
import { CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';
import { QueryBrandDto } from '../dto/query-brand.dto';
import { Brand } from '../entities/brand.entity';
import { BaseController } from '../../../common/crud/base.controller';

const SENSITIVE_FIELDS = [
  'razorpaySecretKey',
  'easebuzzBookingSalt',
  'easebuzzBookingKey',
  'easebuzzMilestoneSalt',
  'easebuzzMilestoneKey',
];

function stripSensitiveFields(brand: Brand): Brand {
  for (const field of SENSITIVE_FIELDS) {
    delete (brand as any)[field];
  }
  return brand;
}

@ApiTags('Brands')
@ApiBearerAuth()
@Controller('brands')
export class BrandController extends BaseController<
  Brand,
  CreateBrandDto,
  UpdateBrandDto
> {
  constructor(private readonly brandService: BrandService) {
    super(brandService, 'Brand');
  }

  @Get()
  @ApiOperation({ summary: 'List all brands (sensitive fields excluded)' })
  @ApiResponse({ status: 200, description: 'Paginated list of brands' })
  async findAll(@Query() query: QueryBrandDto) {
    const result = await this.brandService.findAll(query, [
      'brandName',
      'billingName',
    ]);
    return {
      data: result.data.map(stripSensitiveFields),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID (includes sensitive fields)' })
  @ApiResponse({ status: 200, description: 'Brand found' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findById(id);
  }
}
