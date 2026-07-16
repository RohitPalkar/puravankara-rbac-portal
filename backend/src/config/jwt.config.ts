import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET || 'puravankara-rbac-jwt-secret-key-2026',
  signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any },
};
