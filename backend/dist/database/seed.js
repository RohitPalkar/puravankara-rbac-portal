"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const seed_module_1 = require("./seed.module");
const seed_service_1 = require("./seeders/seed.service");
async function run() {
    const app = await core_1.NestFactory.createApplicationContext(seed_module_1.SeedModule);
    const seedService = app.get(seed_service_1.SeedService);
    try {
        await seedService.seed();
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
//# sourceMappingURL=seed.js.map