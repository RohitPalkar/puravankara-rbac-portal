import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module as ModuleEntity } from './entities/module.entity';
import { SubModule } from './entities/sub-module.entity';
import { Action } from './entities/action.entity';
import { ModuleAction } from './entities/module-action.entity';
import {
  ModuleCatalogService,
  SubModuleCatalogService,
  ActionCatalogService,
  ModuleActionCatalogService,
} from './services/catalog.service';
import {
  ModuleController,
  SubModuleController,
  ActionController,
  ModuleActionController,
} from './controllers/catalog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModuleEntity, SubModule, Action, ModuleAction]),
  ],
  controllers: [
    ModuleController,
    SubModuleController,
    ActionController,
    ModuleActionController,
  ],
  providers: [
    ModuleCatalogService,
    SubModuleCatalogService,
    ActionCatalogService,
    ModuleActionCatalogService,
  ],
  exports: [TypeOrmModule],
})
export class ProductCatalogModule {}
