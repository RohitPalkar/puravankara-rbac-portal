const DATA_SOURCE_KEY = 'VITE_DATA_SOURCE';

export type DataSource = 'mock' | 'api';

export function getDataSource(): DataSource {
  const env = import.meta.env.VITE_DATA_SOURCE as string | undefined;
  if (env === 'api' || env === 'mock') return env;
  return 'mock';
}

export function isApiMode(): boolean {
  return getDataSource() === 'api';
}

export function isMockMode(): boolean {
  return getDataSource() === 'mock';
}
