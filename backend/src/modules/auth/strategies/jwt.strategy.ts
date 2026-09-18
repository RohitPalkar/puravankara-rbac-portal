import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/entities/user-role.entity';
import { UserSession } from '../entities/user-session.entity';
import type { JwtPayload } from '../services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { empId: payload.sub, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Resolve activeRoleId with expiry + validity fallback
    let activeRoleId: number | null = payload.activeRoleId ?? null;
    try {
      const now = new Date();
      const userRoles = await this.userRoleRepository.find({
        where: { userId: payload.sub },
        relations: { role: true },
      });
      const validRoles = userRoles.filter((ur) => {
        if (!ur.role || !ur.role.isActive) return false;
        if (ur.expiresAt && new Date(ur.expiresAt) <= now) return false;
        return true;
      });

      if (validRoles.length > 0) {
        const hasActive = activeRoleId != null && validRoles.some((ur) => ur.roleId === activeRoleId);
        if (!hasActive) {
          // fallback to PRIMARY if exists else first valid
          const primary = validRoles.find((ur) => ur.roleType === 'PRIMARY');
          const fallback = primary ?? validRoles[0];
          const fallbackId = fallback.roleId;
          activeRoleId = fallbackId;
          // Persist fallback to session if session exists and differs
          if (payload.sessionId) {
            try {
              const session = await this.userSessionRepository.findOne({ where: { id: payload.sessionId } });
              if (session && session.activeRoleId !== fallbackId) {
                session.activeRoleId = fallbackId;
                await this.userSessionRepository.save(session);
              }
            } catch {
              // ignore fallback persistence errors
            }
          }
        }
      } else {
        activeRoleId = null;
      }
    } catch {
      // on error keep payload's activeRoleId
    }

    return {
      empId: user.empId,
      name: user.name,
      email: user.email,
      departmentId: user.departmentId,
      sessionId: payload.sessionId,
      roles: payload.roles,
      activeRoleId,
    };
  }
}
