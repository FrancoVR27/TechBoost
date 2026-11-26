import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { signJwt, verifyJwt } from './jwt.js';
import type { AuthUser } from './auth.types.js';

@Injectable()
export class TokenService {
  private readonly secret: string;
  readonly ttlSeconds: number;

  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_SECRET es obligatorio y debe tener al menos 32 caracteres',
      );
    }
    this.secret = secret;
    this.ttlSeconds = Number(config.get('JWT_EXPIRES_IN_SECONDS')) || 60 * 60 * 8;
  }

  sign(user: Pick<AuthUser, 'sub' | 'correo' | 'rol' | 'planId'>): string {
    return signJwt(user, this.secret, this.ttlSeconds);
  }

  verify(token: string): AuthUser | null {
    return verifyJwt(token, this.secret);
  }
}
