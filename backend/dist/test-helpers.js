"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockRepository = mockRepository;
exports.mockRepoProvider = mockRepoProvider;
const typeorm_1 = require("@nestjs/typeorm");
function mockRepository(entity) {
    return {
        find: jest.fn(),
        findOne: jest.fn(),
        findAndCount: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        findOneOrFail: jest.fn(),
        createQueryBuilder: jest.fn(),
    };
}
function mockRepoProvider(entity) {
    return {
        provide: (0, typeorm_1.getRepositoryToken)(entity),
        useValue: mockRepository(entity),
    };
}
//# sourceMappingURL=test-helpers.js.map