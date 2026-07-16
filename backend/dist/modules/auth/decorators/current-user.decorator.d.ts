export interface AuthenticatedUser {
    empId: string;
    name: string;
    email: string;
    departmentId: number;
    department?: any;
    sessionId: string;
    roles: string[];
}
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | keyof AuthenticatedUser)[]) => ParameterDecorator;
