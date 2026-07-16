import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Phase } from '../entities/phase.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreatePhaseDto, UpdatePhaseDto, UpdateLaunchDto } from '../dto/phase.dto';

@Injectable()
export class PhaseService extends BaseService<Phase> {
  constructor(
    @InjectRepository(Phase)
    readonly repository: Repository<Phase>,
  ) {
    super(repository);
  }

  async create(dto: CreatePhaseDto): Promise<Phase> {
    return super.create(dto);
  }

  async update(id: number, dto: UpdatePhaseDto): Promise<Phase> {
    return super.update(id, dto);
  }

  async updateLaunch(id: number, dto: UpdateLaunchDto): Promise<Phase> {
    const phase = await this.repository.findOneOrFail({ where: { id } as any });
    Object.assign(phase, dto);
    return this.repository.save(phase);
  }
}
