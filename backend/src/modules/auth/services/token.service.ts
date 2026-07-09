import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

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

@Injectable()
export class TokenService {
  private readonly accessTokenExpiry = 900; // 15 minutes in seconds
  private readonly refreshTokenExpiry = '7d';

  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiry,
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    const refreshPayload = { ...payload, type: 'refresh' };
    return this.jwtService.sign(refreshPayload, {
      expiresIn: this.refreshTokenExpiry,
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    });
  }

  generateTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: this.accessTokenExpiry,
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  createSessionPayload(
    empId: string,
    email: string,
    roles: string[],
  ): JwtPayload {
    return {
      sub: empId,
      email,
      sessionId: uuidv4(),
      roles,
    };
  }
}
