import type { JwtPayload } from '../services/token.service';
declare const RefreshStrategy_base: new (...args: any) => any;
export declare class RefreshStrategy extends RefreshStrategy_base {
    constructor();
    validate(_req: any, payload: JwtPayload): Promise<{
        empId: string;
        email: string;
        sessionId: string;
        roles: string[];
    }>;
}
export {};
