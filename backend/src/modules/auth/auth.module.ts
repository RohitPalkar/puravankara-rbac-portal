import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { UserSession } from './entities/user-session.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { UserProjectAccess } from '../project-access/entities/user-project-access.entity';
import { AuditModule } from '../audit/audit.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserAuth,
      UserSession,
      UserRole,
      UserProjectAccess,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'puravankara-rbac-jwt-secret-key-2026',
      signOptions: { expiresIn: 900 },
    }),
    forwardRef(() => PermissionsModule),
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    JwtStrategy,
    RefreshStrategy,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    TokenService,
    PasswordService,
    JwtAuthGuard,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
