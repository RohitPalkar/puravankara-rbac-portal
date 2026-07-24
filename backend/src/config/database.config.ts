import { TypeOrmModuleOptions } from '@nestjs/typeorm';

function buildDatabaseConfig(): TypeOrmModuleOptions {
  const nodeEnv = process.env.NODE_ENV;
  const url = process.env.DATABASE_URL;

  if (!nodeEnv) {
    console.warn(
      'WARNING: NODE_ENV is not set. ' +
        'synchronize defaults to false for safety. ' +
        'Set NODE_ENV=production for production deployments.',
    );
  }

  const isProduction = nodeEnv === 'production';
  const isSupabaseUrl =
    url && (url.includes('supabase') || url.includes('pooler'));

  // NEVER true when NODE_ENV=production; opt-in only via TYPEORM_SYNC=true
  const synchronize = process.env.TYPEORM_SYNC === 'true' && !isProduction;

  const base: TypeOrmModuleOptions = {
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize,
    logging: process.env.DB_LOGGING === 'true',
    invalidWhereValuesBehavior: { null: 'sql-null' },
    useUTC: true,
    poolSize: Number(process.env.DB_POOL_MAX) || 10,
    extra: {
      max: Number(process.env.DB_POOL_MAX) || 10,
    },
    ssl:
      isProduction || isSupabaseUrl ? { rejectUnauthorized: false } : undefined,
  };

  if (url) {
    return { ...base, url };
  }

  return {
    ...base,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

export const databaseConfig: TypeOrmModuleOptions = buildDatabaseConfig();
