import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  APP_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production', 'test')
    .default('development'),

  DATABASE_URL: Joi.string().optional(),
  DB_HOST: Joi.string().optional(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().optional(),
  DB_PASSWORD: Joi.string().optional(),
  DB_NAME: Joi.string().optional(),
  DB_LOGGING: Joi.boolean().default(false),
  DB_POOL_MAX: Joi.number().default(10),

  REDIS_ENABLED: Joi.boolean().default(false),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().optional(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('debug'),
  LOG_FORMAT: Joi.string().valid('pretty', 'json').default('pretty'),

  CORS_ORIGINS: Joi.string().optional(),
  FRONTEND_URL: Joi.string().optional(),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  LOGIN_THROTTLE_TTL: Joi.number().default(60),
  LOGIN_THROTTLE_LIMIT: Joi.number().default(5),

  DEFAULT_ADMIN_EMAIL: Joi.string().default('admin@system.local'),
  DEFAULT_ADMIN_PASSWORD: Joi.string().min(8).default('Admin@123456'),
});
