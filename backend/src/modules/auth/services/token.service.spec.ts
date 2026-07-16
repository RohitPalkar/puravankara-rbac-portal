import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: jest.Mocked<JwtService>;

  const mockPayload = {
    sub: 'PPL00001',
    email: 'test@example.com',
    sessionId: 'session-1',
    roles: ['1', '2'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
    jwtService = module.get(JwtService);
  });

  describe('generateAccessToken', () => {
    it('should sign a JWT with payload and expiry', () => {
      jwtService.sign.mockReturnValue('access-token');

      const token = service.generateAccessToken(mockPayload);

      expect(token).toBe('access-token');
      expect(jwtService.sign).toHaveBeenCalledWith(mockPayload, {
        expiresIn: 900,
      });
    });
  });

  describe('generateRefreshToken', () => {
    it('should sign a JWT with type refresh', () => {
      jwtService.sign.mockReturnValue('refresh-token');

      const token = service.generateRefreshToken(mockPayload);

      expect(token).toBe('refresh-token');
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'refresh' }),
        expect.any(Object),
      );
    });
  });

  describe('generateTokenPair', () => {
    it('should return both tokens', () => {
      jwtService.sign.mockReturnValue('token');

      const pair = service.generateTokenPair(mockPayload);

      expect(pair.accessToken).toBe('token');
      expect(pair.refreshToken).toBe('token');
      expect(pair.expiresIn).toBe(900);
    });
  });

  describe('verifyAccessToken', () => {
    it('should return payload on valid token', () => {
      jwtService.verify.mockReturnValue(mockPayload);

      const result = service.verifyAccessToken('valid-token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw on invalid token', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      expect(() => service.verifyAccessToken('bad-token')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return payload on valid token', () => {
      jwtService.verify.mockReturnValue(mockPayload);

      const result = service.verifyRefreshToken('valid-token');

      expect(result).toEqual(mockPayload);
    });

    it('should throw on invalid token', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      expect(() => service.verifyRefreshToken('bad-token')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('createSessionPayload', () => {
    it('should generate payload with sessionId', () => {
      const result = service.createSessionPayload('PPL00001', 'test@test.com', [
        '1',
      ]);

      expect(result.sub).toBe('PPL00001');
      expect(result.email).toBe('test@test.com');
      expect(result.roles).toEqual(['1']);
      expect(result.sessionId).toBeDefined();
    });
  });
});
