import { Repository } from 'typeorm';
export declare function mockRepository<T>(entity: new (...args: any[]) => T): Partial<Record<keyof Repository<T>, jest.Mock>>;
export declare function mockRepoProvider<T>(entity: new (...args: any[]) => T): {
    provide: string | Function;
    useValue: Partial<Record<keyof Repository<T_1>, jest.Mock<any, any, any>>>;
};
