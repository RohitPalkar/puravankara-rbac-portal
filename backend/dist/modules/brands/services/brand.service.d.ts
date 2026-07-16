import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateBrandDto, UpdateBrandDto } from '../dto/brand.dto';
export declare class BrandService extends BaseService<Brand> {
    readonly repository: Repository<Brand>;
    constructor(repository: Repository<Brand>);
    create(dto: CreateBrandDto): Promise<Brand>;
    update(id: number, dto: UpdateBrandDto): Promise<Brand>;
}
