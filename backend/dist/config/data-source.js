"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function buildOptions() {
    const url = process.env.DATABASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';
    const base = {
        type: 'postgres',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: false,
        ssl: isProduction ? { rejectUnauthorized: false } : undefined,
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
exports.dataSourceOptions = buildOptions();
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=data-source.js.map