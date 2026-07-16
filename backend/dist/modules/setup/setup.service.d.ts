import { Repository } from 'typeorm';
import { Department } from '../organization/entities/department.entity';
import { Project } from '../projects/entities/project.entity';
import { Module } from '../product-catalog/entities/module.entity';
import { Zone } from '../geography/entities/zone.entity';
import { City } from '../geography/entities/city.entity';
import { Role } from '../organization/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { SystemSettingService } from './services/system-setting.service';
import { SetupStatus } from './dto/setup-status.dto';
export declare class SetupService {
    private readonly deptRepo;
    private readonly projectRepo;
    private readonly moduleRepo;
    private readonly zoneRepo;
    private readonly cityRepo;
    private readonly roleRepo;
    private readonly userRepo;
    private readonly systemSettings;
    private readonly logger;
    private readonly ZONE_NAMES;
    private readonly ZONE_CITIES;
    constructor(deptRepo: Repository<Department>, projectRepo: Repository<Project>, moduleRepo: Repository<Module>, zoneRepo: Repository<Zone>, cityRepo: Repository<City>, roleRepo: Repository<Role>, userRepo: Repository<User>, systemSettings: SystemSettingService);
    getStatus(): Promise<SetupStatus>;
    reset(): Promise<void>;
}
