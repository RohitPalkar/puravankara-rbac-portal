import { JwtService } from '@nestjs/jwt';
export interface JwtPayload {
    sub: string;
    email: string;
    sessionId: string;
    roles: string[];
    type?: string;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class TokenService {
    private readonly jwtService;
    private readonly accessTokenExpiry;
    private readonly refreshTokenExpiry;
    constructor(jwtService: JwtService);
    generateAccessToken(payload: JwtPayload): string;
    generateRefreshToken(payload: JwtPayload): string;
    generateTokenPair(payload: JwtPayload): TokenPair;
    verifyAccessToken(token: string): JwtPayload;
    verifyRefreshToken(token: string): JwtPayload;
    createSessionPayload(empId: string, email: string, roles: string[]): JwtPayload;
}
