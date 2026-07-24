import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import type { JwtPayload } from '../services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    return {
      empId: user.empId,
      name: user.name,
      email: user.email,
      departmentId: user.departmentId,
      sessionId: payload.sessionId,
      roles: payload.roles,
    };
  }
}
