"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainSeeder = mainSeeder;
const bootstrap_seeder_1 = require("./bootstrap.seeder");
async function mainSeeder(dataSource) {
    await (0, bootstrap_seeder_1.bootstrapSeeder)(dataSource);
}
//# sourceMappingURL=main.seeder.js.map