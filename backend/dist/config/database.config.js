"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
function buildDatabaseConfig() {
    const nodeEnv = process.env.NODE_ENV;
    const url = process.env.DATABASE_URL;
    if (!nodeEnv) {
        console.warn('WARNING: NODE_ENV is not set. ' +
            'synchronize defaults to false for safety. ' +
            'Set NODE_ENV=production for production deployments.');
    }
    const isProduction = nodeEnv === 'production';
    const isSupabaseUrl = url && (url.includes('supabase') || url.includes('pooler'));
    const synchronize = process.env.TYPEORM_SYNC === 'true' && !isProduction;
    const base = {
        type: 'postgres',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize,
        logging: process.env.DB_LOGGING === 'true',
        invalidWhereValuesBehavior: { null: 'sql-null' },
        extra: {
            max: Number(process.env.DB_POOL_MAX) || 10,
        },
        ssl: isProduction || isSupabaseUrl
            ? { rejectUnauthorized: false }
            : undefined,
    };
    if (url) {
        return { ...base, url };
    }
    return {
        ...base,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'puravankara_rbac_v3',
    };
}
exports.databaseConfig = buildDatabaseConfig();
//# sourceMappingURL=database.config.js.map