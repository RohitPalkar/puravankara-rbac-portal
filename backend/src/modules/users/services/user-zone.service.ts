import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserZone } from '../entities/user-zone.entity';

@Injectable()
export class UserZoneService {
  constructor(
    @InjectRepository(UserZone)
    readonly repository: Repository<UserZone>,
  ) {}

  async findByUser(userId: string): Promise<UserZone[]> {
    return this.repository.find({
      where: { userId },
      relations: { zone: true },
    });
  }

  async assign(userId: string, zoneId: number): Promise<UserZone> {
    const existing = await this.repository.findOne({
      where: { userId, zoneId },
    });
    if (existing) return existing;
    const uz = this.repository.create({ userId, zoneId });
    return this.repository.save(uz);
  }

  async revoke(userId: string, zoneId: number): Promise<void> {
    const result = await this.repository.delete({ userId, zoneId });
    if (result.affected === 0)
      throw new NotFoundException('User zone mapping not found');
  }

  async revokeAll(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }
}
