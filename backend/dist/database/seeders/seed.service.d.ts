import { DataSource } from 'typeorm';
export declare class SeedService {
    private readonly dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    seed(): Promise<void>;
}
