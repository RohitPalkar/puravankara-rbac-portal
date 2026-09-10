import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

function buildOptions(): DataSourceOptions {
  const url = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';
  const base: DataSourceOptions = {
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: false,
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    // Performance: pool tuning for Supabase pooler (ap-northeast-1 → Oregon latency)
    extra: {
      max: 20,
      min: 2,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000,
      statement_timeout: 10000,
      query_timeout: 10000,
    },
    cache: {
      duration: 30000, // 30s query cache for metadata queries
    },
    maxQueryExecutionTime: 1000,
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

export const dataSourceOptions: DataSourceOptions = buildOptions();

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
