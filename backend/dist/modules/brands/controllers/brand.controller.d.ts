import { BrandService } from '../services/brand.service';
import { CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';
import { Brand } from '../entities/brand.entity';
import { BaseController } from '../../../common/crud/base.controller';
export declare class BrandController extends BaseController<Brand, CreateBrandDto, UpdateBrandDto> {
    private readonly brandService;
    constructor(brandService: BrandService);
}
