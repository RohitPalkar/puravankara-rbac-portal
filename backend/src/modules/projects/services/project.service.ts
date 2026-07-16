import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { ProjectPaymentGateway } from '../entities/project-payment-gateway.entity';
import { ProjectIncentiveRule } from '../entities/project-incentive-rule.entity';
import { BaseService } from '../../../common/crud/base.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';

@Injectable()
export class ProjectService extends BaseService<Project> {
  constructor(
    @InjectRepository(Project)
    readonly repository: Repository<Project>,
    @InjectRepository(ProjectPaymentGateway)
    private readonly gatewayRepo: Repository<ProjectPaymentGateway>,
    @InjectRepository(ProjectIncentiveRule)
    private readonly incentiveRepo: Repository<ProjectIncentiveRule>,
  ) {
    super(repository);
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    const { paymentGateways, incentiveRules, ...projectData } = dto;
    const project = this.repository.create(projectData);
    const saved = await this.repository.save(project);

    if (paymentGateways?.length) {
      const gateways = paymentGateways.map((g) =>
        this.gatewayRepo.create({ ...g, projectId: saved.id }),
      );
      await this.gatewayRepo.save(gateways);
    }

    if (incentiveRules?.length) {
      const rules = incentiveRules.map((r) =>
        this.incentiveRepo.create({ ...r, projectId: saved.id }),
      );
      await this.incentiveRepo.save(rules);
    }

    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const { paymentGateways, incentiveRules, ...projectData } = dto;

    if (Object.keys(projectData).length) {
      await super.update(id, projectData);
    }

    if (paymentGateways) {
      await this.gatewayRepo.delete({ projectId: id });
      if (paymentGateways.length) {
        const gateways = paymentGateways.map((g) =>
          this.gatewayRepo.create({ ...g, projectId: id }),
        );
        await this.gatewayRepo.save(gateways);
      }
    }

    if (incentiveRules) {
      await this.incentiveRepo.delete({ projectId: id });
      if (incentiveRules.length) {
        const rules = incentiveRules.map((r) =>
          this.incentiveRepo.create({ ...r, projectId: id }),
        );
        await this.incentiveRepo.save(rules);
      }
    }

    return this.findOne(id);
  }

  async findOne(id: number): Promise<Project> {
    return this.repository.findOne({
      where: { id } as any,
      relations: ['paymentGateways', 'incentiveRules', 'brand', 'city'],
    });
  }

  async findAll(): Promise<Project[]> {
    return this.repository.find({
      relations: ['brand', 'city'],
      order: { createdAt: 'DESC' as any },
    });
  }
}
