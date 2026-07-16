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
exports.bootstrapSeeder = bootstrapSeeder;
const bcrypt = __importStar(require("bcrypt"));
const role_entity_1 = require("../../modules/organization/entities/role.entity");
const user_entity_1 = require("../../modules/users/entities/user.entity");
const user_auth_entity_1 = require("../../modules/auth/entities/user-auth.entity");
const user_role_entity_1 = require("../../modules/users/entities/user-role.entity");
const action_entity_1 = require("../../modules/product-catalog/entities/action.entity");
const zone_entity_1 = require("../../modules/geography/entities/zone.entity");
const SALT_ROUNDS = 12;
const SYSTEM_ACTIONS = [
    'VIEW',
    'CREATE',
    'UPDATE',
    'DELETE',
    'APPROVE',
    'REJECT',
    'EXPORT',
    'IMPORT',
];
const ZONE_NAMES = ['North', 'South', 'East', 'West'];
async function bootstrapSeeder(dataSource) {
    const roleRepo = dataSource.getRepository(role_entity_1.Role);
    const userRepo = dataSource.getRepository(user_entity_1.User);
    const authRepo = dataSource.getRepository(user_auth_entity_1.UserAuth);
    const userRoleRepo = dataSource.getRepository(user_role_entity_1.UserRole);
    const actionRepo = dataSource.getRepository(action_entity_1.Action);
    const zoneRepo = dataSource.getRepository(zone_entity_1.Zone);
    for (const name of ZONE_NAMES) {
        const existing = await zoneRepo.findOne({ where: { name } });
        if (!existing) {
            await zoneRepo.save(zoneRepo.create({ name, isActive: true }));
        }
    }
    for (const code of SYSTEM_ACTIONS) {
        const existing = await actionRepo.findOne({ where: { code } });
        if (!existing) {
            await actionRepo.save(actionRepo.create({
                code,
                label: code.charAt(0) + code.slice(1).toLowerCase(),
                isActive: true,
            }));
        }
    }
    const existingRole = await roleRepo.findOne({
        where: { name: 'SUPER_ADMIN' },
    });
    const superAdminRole = existingRole ||
        (await roleRepo.save(roleRepo.create({
            name: 'SUPER_ADMIN',
            hierarchyLevelRank: 1,
            isActive: true,
            isSystemRole: true,
        })));
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@system.local';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';
    let adminUser = await userRepo.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
        const [lastUser] = await userRepo.find({ order: { createdAt: 'DESC' }, take: 1 });
        const lastNum = lastUser
            ? parseInt(lastUser.empId.replace('PPL', ''), 10)
            : 0;
        const nextNum = lastNum + 1;
        const empId = `PPL${String(nextNum).padStart(5, '0')}`;
        adminUser = await userRepo.save(userRepo.create({
            empId,
            name: 'System Administrator',
            email: adminEmail,
            departmentId: null,
            employmentStatus: 'PERMANENT',
            isActive: true,
        }));
    }
    const existingAuth = await authRepo.findOne({ where: { userId: adminUser.empId } });
    if (!existingAuth) {
        const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
        await authRepo.save(authRepo.create({
            userId: adminUser.empId,
            passwordHash,
            authProvider: 'LOCAL',
        }));
    }
    const existingAssignment = await userRoleRepo.findOne({
        where: { userId: adminUser.empId, roleId: superAdminRole.id },
    });
    if (!existingAssignment) {
        await userRoleRepo.save(userRoleRepo.create({
            userId: adminUser.empId,
            departmentId: null,
            roleId: superAdminRole.id,
            assignedBy: 'SYSTEM',
            assignedAt: new Date(),
        }));
    }
}
//# sourceMappingURL=bootstrap.seeder.js.map