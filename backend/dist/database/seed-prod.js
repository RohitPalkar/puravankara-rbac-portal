"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const seed_prod_module_1 = require("./seed-prod.module");
const typeorm_1 = require("typeorm");
const bootstrap_seeder_1 = require("./seeders/bootstrap.seeder");
async function run() {
    const app = await core_1.NestFactory.createApplicationContext(seed_prod_module_1.SeedProdModule);
    const dataSource = app.get(typeorm_1.DataSource);
    try {
        await (0, bootstrap_seeder_1.bootstrapSeeder)(dataSource);
        console.log('Production seed completed successfully.');
        await app.close();
        process.exit(0);
    }
    catch (error) {
        console.error('Seed failed:', error);
        await app.close();
        process.exit(1);
    }
}
run();
//# sourceMappingURL=seed-prod.js.map