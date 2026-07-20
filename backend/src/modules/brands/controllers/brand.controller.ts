import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'List all brands' })
  @ApiResponse({ status: 200, description: 'Paginated list of brands' })
  async findAll(@Query() query: QueryBrandDto) {
    return this.brandService.findAll(query, ['brandName', 'billingName']);
  }
}