import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();

function buildOptions(): DataSourceOptions {
  const url = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';
  const isSupabaseUrl = url && (url.includes('supabase') || url.includes('pooler'));
  const base: DataSourceOptions = {
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: false,
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

export const dataSourceOptions: DataSourceOptions = buildOptions();

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
