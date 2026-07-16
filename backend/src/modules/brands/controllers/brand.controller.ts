import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BrandService } from '../services/brand.service';
import { CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';
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
}