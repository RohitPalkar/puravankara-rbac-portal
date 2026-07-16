import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import type { Request } from 'express';
import type { AuthenticatedUser } from './decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: Request): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    refresh(dto: RefreshTokenDto, req: Request): Promise<import("./dto/auth-response.dto").AuthResponseDto>;
    logout(user: AuthenticatedUser): Promise<{
        message: string;
    }>;
    logoutAll(user: AuthenticatedUser): Promise<{
        message: string;
    }>;
    setPassword(dto: SetPasswordDto): Promise<{
        message: string;
    }>;
    getProfile(user: AuthenticatedUser): Promise<{
        user: {
            empId: string;
            name: string;
            email: string;
            departmentId: number;
            department: string;
            employmentStatus: string;
        };
        roles: {
            roleId: number;
            roleName: string;
            departmentId: number;
            departmentName: string;
        }[];
    }>;
}
