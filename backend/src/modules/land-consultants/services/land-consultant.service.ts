import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandConsultant } from '../entities/land-consultant.entity';
import { BaseService } from '../../../common/crud/base.service';

@Injectable()
export class LandConsultantService extends BaseService<LandConsultant> {
  constructor(
    @InjectRepository(LandConsultant)
    readonly repository: Repository<LandConsultant>,
  ) {
    super(repository);
  }
}
