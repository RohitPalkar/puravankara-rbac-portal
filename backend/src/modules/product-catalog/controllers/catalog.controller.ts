import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  ModuleCatalogService,
  SubModuleCatalogService,
  ActionCatalogService,
  ModuleActionCatalogService,
} from '../services/catalog.service';
import {
  CreateModuleDto,
  UpdateModuleDto,
  CreateSubModuleDto,
  UpdateSubModuleDto,
  CreateActionDto,
  UpdateActionDto,
  CreateModuleActionDto,
  UpdateModuleActionDto,
} from '../dto/catalog.dto';
import { Module as ModuleEntity } from '../entities/module.entity';
import { SubModule } from '../entities/sub-module.entity';
import { Action } from '../entities/action.entity';
import { ModuleAction } from '../entities/module-action.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Product Catalog - Modules')
@ApiBearerAuth()
@Controller('modules')
export class ModuleController extends BaseController<
  ModuleEntity,
  CreateModuleDto,
  UpdateModuleDto
> {
  constructor(private readonly svc: ModuleCatalogService) {
    super(svc, 'Module');
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get module tree with sub-modules and actions' })
  async getTree() {
    return this.svc.getTree();
  }
}

@ApiTags('Product Catalog - Sub Modules')
@ApiBearerAuth()
@Controller('sub-modules')
export class SubModuleController extends BaseController<
  SubModule,
  CreateSubModuleDto,
  UpdateSubModuleDto
> {
  constructor(private readonly svc: SubModuleCatalogService) {
    super(svc, 'SubModule');
  }
}

@ApiTags('Product Catalog - Actions')
@ApiBearerAuth()
@Controller('actions')
export class ActionController extends BaseController<
  Action,
  CreateActionDto,
  UpdateActionDto
> {
  constructor(private readonly svc: ActionCatalogService) {
    super(svc, 'Action');
  }
}

@ApiTags('Product Catalog - Module Actions')
@ApiBearerAuth()
@Controller('module-actions')
export class ModuleActionController extends BaseController<
  ModuleAction,
  CreateModuleActionDto,
  UpdateModuleActionDto
> {
  constructor(private readonly svc: ModuleActionCatalogService) {
    super(svc, 'ModuleAction');
  }
}
