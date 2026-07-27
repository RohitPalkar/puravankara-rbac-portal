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
  @ApiOperation({
    summary: 'List all brands (payment secrets excluded by @Exclude)',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of brands' })
  async findAll(@Query() query: QueryBrandDto) {
    const result = await this.brandService.findAll(query, [
      'brandName',
      'billingName',
    ]);
    return {
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get brand by ID (payment secrets excluded by @Exclude)',
  })
  @ApiResponse({ status: 200, description: 'Brand found' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.findById(id);
  }
}
