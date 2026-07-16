import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import type { JwtPayload } from '../services/token.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    validate(payload: JwtPayload): Promise<{
        empId: string;
        name: string;
        email: string;
        departmentId: number;
        department: import("../../organization/entities/department.entity").Department;
        sessionId: string;
        roles: string[];
    }>;
}
export {};
