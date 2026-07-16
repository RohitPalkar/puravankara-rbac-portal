import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DelegationService } from '../services/delegation.service';
import { CreateDelegationDto } from '../dto/create-delegation.dto';
import { UpdateDelegationDto } from '../dto/update-delegation.dto';
import { DelegationQueryDto } from '../dto/delegation-query.dto';
import { RequirePermission } from '../../permissions/decorators/require-permission.decorator';

@ApiTags('Delegations')
@ApiBearerAuth()
@Controller('delegations')
export class DelegationController {
  constructor(private readonly delegationService: DelegationService) {}

  @Get()
  @RequirePermission({ module: 'Delegation', action: 'VIEW' })
  @ApiOperation({ summary: 'List all delegations (paginated, filterable)' })
  async findAll(@Query() query: DelegationQueryDto) {
    return this.delegationService.findAll(query);
  }

  @Get(':id')
  @RequirePermission({ module: 'Delegation', action: 'VIEW' })
  @ApiOperation({ summary: 'Get delegation details' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.delegationService.findById(id);
  }

  @Post()
  @RequirePermission({ module: 'Delegation', action: 'CREATE' })
  @ApiOperation({ summary: 'Create a delegation' })
  @ApiResponse({ status: 201, description: 'Delegation created' })
  async create(@Body() dto: CreateDelegationDto) {
    return this.delegationService.create(dto);
  }

  @Patch(':id')
  @RequirePermission({ module: 'Delegation', action: 'UPDATE' })
  @ApiOperation({ summary: 'Update a delegation' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDelegationDto,
  ) {
    return this.delegationService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission({ module: 'Delegation', action: 'DELETE' })
  @ApiOperation({ summary: 'Soft delete a delegation' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.delegationService.remove(id);
    return { message: 'Delegation deleted successfully' };
  }
}
