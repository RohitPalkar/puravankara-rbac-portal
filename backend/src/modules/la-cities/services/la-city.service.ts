import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { LaCity } from '../entities/la-city.entity';
import { LaRegion } from '../entities/la-region.entity';
import { LaMicromarket } from '../entities/la-micromarket.entity';
import { LaLocality } from '../entities/la-locality.entity';
import { LaCityApproval } from '../entities/la-city-approval.entity';
import { CreateLaCityDto, UpdateLaCityDto } from '../dto/la-city.dto';

@Injectable()
export class LaCityService {
  constructor(
    @InjectRepository(LaCity) private readonly cityRepo: Repository<LaCity>,
    @InjectRepository(LaRegion) private readonly regionRepo: Repository<LaRegion>,
    @InjectRepository(LaMicromarket) private readonly micromarketRepo: Repository<LaMicromarket>,
    @InjectRepository(LaLocality) private readonly localityRepo: Repository<LaLocality>,
    @InjectRepository(LaCityApproval) private readonly approvalRepo: Repository<LaCityApproval>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: any) {
    const page = Math.min(Math.max(Number(query.page) || 1, 1), 100);
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
    const search = query.search ? String(query.search).replace(/[%_\\]/g, '\\$&') : null;
    const skip = (page - 1) * limit;

    const qb = this.cityRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.businessZone', 'z')
      .where('c.deleted_at IS NULL');

    if (query.businessZoneId) {
      qb.andWhere('c.business_zone_id = :bz', { bz: Number(query.businessZoneId) });
    }
    if (search) {
      qb.andWhere('c.city_name ILIKE :search', { search: `%${search}%` });
    }
    if (query.isActive !== undefined && query.isActive !== '') {
      const v = String(query.isActive) === 'true';
      qb.andWhere('c.is_active = :isActive', { isActive: v });
    }

    qb.orderBy('c.created_at', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    // Enrich with counts
    const cityIds = data.map((c) => c.id);
    let regionCounts = new Map<number, number>();
    let micromarketCounts = new Map<number, number>();
    let localityCounts = new Map<number, number>();
    if (cityIds.length) {
      const rc = await this.regionRepo
        .createQueryBuilder('r')
        .select('r.la_city_id', 'cityId')
        .addSelect('COUNT(*)', 'cnt')
        .where('r.la_city_id IN (:...ids)', { ids: cityIds })
        .andWhere('r.deleted_at IS NULL')
        .groupBy('r.la_city_id')
        .getRawMany();
      rc.forEach((row) => regionCounts.set(Number(row.cityId), Number(row.cnt)));

      const regionIds = await this.regionRepo.find({
        where: { laCityId: In(cityIds) },
        select: ['id'],
      });
      const rIds = regionIds.map((r) => r.id);
      if (rIds.length) {
        const mc = await this.micromarketRepo
          .createQueryBuilder('m')
          .select('r.la_city_id', 'cityId')
          .addSelect('COUNT(m.id)', 'cnt')
          .innerJoin('m.region', 'r')
          .where('m.la_region_id IN (:...rIds)', { rIds })
          .andWhere('m.deleted_at IS NULL')
          .groupBy('r.la_city_id')
          .getRawMany();
        mc.forEach((row) => micromarketCounts.set(Number(row.cityId), Number(row.cnt)));

        const microIds = await this.micromarketRepo.find({
          where: { laRegionId: In(rIds) },
          select: ['id'],
        });
        const mIds = microIds.map((m) => m.id);
        if (mIds.length) {
          const lc = await this.localityRepo
            .createQueryBuilder('l')
            .select('r.la_city_id', 'cityId')
            .addSelect('COUNT(l.id)', 'cnt')
            .innerJoin('l.micromarket', 'm')
            .innerJoin('m.region', 'r')
            .where('l.la_micromarket_id IN (:...mIds)', { mIds })
            .andWhere('l.deleted_at IS NULL')
            .groupBy('r.la_city_id')
            .getRawMany();
          lc.forEach((row) => localityCounts.set(Number(row.cityId), Number(row.cnt)));
        }
      }
    }

    const enriched = data.map((c: any) => ({
      ...c,
      regionsCount: regionCounts.get(c.id) ?? 0,
      micromarketsCount: micromarketCounts.get(c.id) ?? 0,
      pincodesCount: localityCounts.get(c.id) ?? 0,
      businessZoneName: c.businessZone?.name ?? null,
    }));

    return {
      data: enriched,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: number) {
    const city = await this.cityRepo.findOne({
      where: { id },
      relations: { businessZone: true },
    });
    if (!city || city.deletedAt) throw new NotFoundException('LA City not found');

    const regions = await this.regionRepo.find({
      where: { laCityId: id },
      order: { regionName: 'ASC' },
    });
    const regionIds = regions.map((r) => r.id);
    let micromarkets: LaMicromarket[] = [];
    let localities: LaLocality[] = [];
    if (regionIds.length) {
      micromarkets = await this.micromarketRepo.find({
        where: { laRegionId: In(regionIds) },
        order: { micromarketName: 'ASC' },
      });
      const microIds = micromarkets.map((m) => m.id);
      if (microIds.length) {
        localities = await this.localityRepo.find({
          where: { laMicromarketId: In(microIds) },
          order: { localityName: 'ASC' },
        });
      }
    }
    const approvals = await this.approvalRepo.find({ where: { laCityId: id } });

    // Attach nested
    const microMap = new Map<number, LaMicromarket[]>();
    micromarkets.forEach((m) => {
      const arr = microMap.get(m.laRegionId) ?? [];
      arr.push(m);
      microMap.set(m.laRegionId, arr);
    });
    const localityMap = new Map<number, LaLocality[]>();
    localities.forEach((l) => {
      const arr = localityMap.get(l.laMicromarketId) ?? [];
      arr.push(l);
      localityMap.set(l.laMicromarketId, arr);
    });

    const regionsEnriched = regions.map((r) => ({
      ...r,
      micromarkets: (microMap.get(r.id) ?? []).map((m) => ({
        ...m,
        localities: localityMap.get(m.id) ?? [],
      })),
    }));

    return {
      ...city,
      regions: regionsEnriched,
      approvals,
      businessZoneName: (city as any).businessZone?.name ?? null,
    };
  }

  async create(dto: CreateLaCityDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const city = queryRunner.manager.create(LaCity, {
        cityName: dto.cityName,
        businessZoneId: dto.businessZoneId,
        isActive: dto.isActive ?? true,
      });
      const savedCity = await queryRunner.manager.save(city);

      if (dto.regions?.length) {
        for (const r of dto.regions) {
          const region = queryRunner.manager.create(LaRegion, {
            laCityId: savedCity.id,
            regionName: r.regionName,
          });
          const savedRegion = await queryRunner.manager.save(region);
          if (r.micromarkets?.length) {
            for (const m of r.micromarkets) {
              const micro = queryRunner.manager.create(LaMicromarket, {
                laRegionId: savedRegion.id,
                micromarketName: m.micromarketName,
              });
              const savedMicro = await queryRunner.manager.save(micro);
              if (m.localities?.length) {
                const locals = m.localities.map((l) =>
                  queryRunner.manager.create(LaLocality, {
                    laMicromarketId: savedMicro.id,
                    localityName: l.localityName,
                    pincode: l.pincode,
                  }),
                );
                await queryRunner.manager.save(locals);
              }
            }
          }
        }
      }

      if (dto.approvals?.length) {
        const approvals = dto.approvals.map((a) =>
          queryRunner.manager.create(LaCityApproval, {
            laCityId: savedCity.id,
            genericApproval: a.genericApproval,
            governingBodies: a.governingBodies ?? [],
            documents: a.documents ?? [],
          }),
        );
        await queryRunner.manager.save(approvals);
      }

      await queryRunner.commitTransaction();
      return this.findById(savedCity.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, dto: UpdateLaCityDto) {
    const city = await this.cityRepo.findOne({ where: { id } });
    if (!city || city.deletedAt) throw new NotFoundException('LA City not found');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (dto.cityName !== undefined) city.cityName = dto.cityName;
      if (dto.businessZoneId !== undefined) city.businessZoneId = dto.businessZoneId;
      if (dto.isActive !== undefined) city.isActive = dto.isActive;
      await queryRunner.manager.save(city);

      if (dto.regions !== undefined) {
        // Replace all geo mapping
        const oldRegions = await queryRunner.manager.find(LaRegion, { where: { laCityId: id } });
        const oldRegionIds = oldRegions.map((r) => r.id);
        if (oldRegionIds.length) {
          const oldMicros = await queryRunner.manager.find(LaMicromarket, {
            where: { laRegionId: In(oldRegionIds) },
          });
          const oldMicroIds = oldMicros.map((m) => m.id);
          if (oldMicroIds.length) {
            await queryRunner.manager.delete(LaLocality, { laMicromarketId: In(oldMicroIds) });
          }
          await queryRunner.manager.delete(LaMicromarket, { laRegionId: In(oldRegionIds) });
          await queryRunner.manager.delete(LaRegion, { laCityId: id });
        }
        if (dto.regions?.length) {
          for (const r of dto.regions) {
            const region = queryRunner.manager.create(LaRegion, {
              laCityId: id,
              regionName: r.regionName,
            });
            const savedRegion = await queryRunner.manager.save(region);
            if (r.micromarkets?.length) {
              for (const m of r.micromarkets) {
                const micro = queryRunner.manager.create(LaMicromarket, {
                  laRegionId: savedRegion.id,
                  micromarketName: m.micromarketName,
                });
                const savedMicro = await queryRunner.manager.save(micro);
                if (m.localities?.length) {
                  const locals = m.localities.map((l) =>
                    queryRunner.manager.create(LaLocality, {
                      laMicromarketId: savedMicro.id,
                      localityName: l.localityName,
                      pincode: l.pincode,
                    }),
                  );
                  await queryRunner.manager.save(locals);
                }
              }
            }
          }
        }
      }

      if (dto.approvals !== undefined) {
        await queryRunner.manager.delete(LaCityApproval, { laCityId: id });
        if (dto.approvals?.length) {
          const approvals = dto.approvals.map((a) =>
            queryRunner.manager.create(LaCityApproval, {
              laCityId: id,
              genericApproval: a.genericApproval,
              governingBodies: a.governingBodies ?? [],
              documents: a.documents ?? [],
            }),
          );
          await queryRunner.manager.save(approvals);
        }
      }

      await queryRunner.commitTransaction();
      return this.findById(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const city = await this.cityRepo.findOne({ where: { id } });
    if (!city || city.deletedAt) throw new NotFoundException('LA City not found');
    city.deletedAt = new Date();
    await this.cityRepo.save(city);
    return { message: 'LA City deleted successfully' };
  }
}
