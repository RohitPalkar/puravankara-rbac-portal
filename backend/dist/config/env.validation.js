"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.envValidationSchema = Joi.object({
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
//# sourceMappingURL=env.validation.js.map