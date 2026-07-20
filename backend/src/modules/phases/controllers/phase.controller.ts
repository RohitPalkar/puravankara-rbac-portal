import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PhaseService } from '../services/phase.service';
import {
  CreatePhaseDto,
  UpdatePhaseDto,
  UpdateLaunchDto,
} from '../dto/phase.dto';
import { Phase } from '../entities/phase.entity';
import { BaseController } from '../../../common/crud/base.controller';

@ApiTags('Phases')
@ApiBearerAuth()
@Controller('phases')
export class PhaseController extends BaseController<
  Phase,
  CreatePhaseDto,
  UpdatePhaseDto
> {
  constructor(private readonly phaseService: PhaseService) {
    super(phaseService, 'Phase');
  }

  @Put(':id/launch')
  async updateLaunch(
    @Param('id') id: string,
    @Body() dto: UpdateLaunchDto,
  ): Promise<Phase> {
    return this.phaseService.updateLaunch(Number(id), dto);
  }
}
