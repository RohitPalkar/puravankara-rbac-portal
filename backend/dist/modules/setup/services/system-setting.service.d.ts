import { Repository } from 'typeorm';
import { SystemSetting } from '../entities/system-setting.entity';
export declare class SystemSettingService {
    private readonly repo;
    constructor(repo: Repository<SystemSetting>);
    get(key: string): Promise<Record<string, any> | null>;
    set(key: string, value: Record<string, any>): Promise<void>;
    delete(key: string): Promise<void>;
    isSetupCompleted(): Promise<boolean>;
    markSetupCompleted(): Promise<void>;
}
