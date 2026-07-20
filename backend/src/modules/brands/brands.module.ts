import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandService } from './services/brand.service';
import { BrandController } from './controllers/brand.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandController],
  providers: [BrandService],
  exports: [TypeOrmModule],
})
export class BrandsModule {}
