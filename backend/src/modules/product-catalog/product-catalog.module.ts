import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module as ModuleEntity } from './entities/module.entity';
import { SubModule } from './entities/sub-module.entity';
import { ActionGroup } from './entities/action-group.entity';
import { Action } from './entities/action.entity';
import { ModuleAction } from './entities/module-action.entity';
import {
  ModuleCatalogService,
  SubModuleCatalogService,
  ActionGroupCatalogService,
  ActionCatalogService,
  ModuleActionCatalogService,
} from './services/catalog.service';
import {
  ModuleController,
  SubModuleController,
  ActionGroupController,
  ActionController,
  ModuleActionController,
} from './controllers/catalog.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ModuleEntity, SubModule, ActionGroup, Action, ModuleAction]),
  ],
  controllers: [
    ModuleController,
    SubModuleController,
    ActionGroupController,
    ActionController,
    ModuleActionController,
  ],
  providers: [
    ModuleCatalogService,
    SubModuleCatalogService,
    ActionGroupCatalogService,
    ActionCatalogService,
    ModuleActionCatalogService,
  ],
  exports: [TypeOrmModule],
})
export class ProductCatalogModule {}
