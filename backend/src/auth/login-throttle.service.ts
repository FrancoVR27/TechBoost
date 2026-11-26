import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface Attempt {
  count: number;
  resetAt: number;
}

/**
 * Limita intentos fallidos de login por IP + correo (en memoria).
 * Con varias instancias del backend usa @nestjs/throttler con almacenamiento compartido.
 */
@Injectable()
export class LoginThrottleService {
  private readonly attempts = new Map<string, Attempt>();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000;

  assertAllowed(key: string): void {
    const attempt = this.current(key);
    if (attempt && attempt.count >= this.maxAttempts) {
      throw new HttpException(
        'Demasiados intentos fallidos. Intenta de nuevo en unos minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  registerFailure(key: string): void {
    this.prune();
    const attempt = this.current(key);
    if (attempt) {
      attempt.count += 1;
    } else {
      this.attempts.set(key, { count: 1, resetAt: Date.now() + this.windowMs });
    }
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  private current(key: string): Attempt | undefined {
    const attempt = this.attempts.get(key);
    if (attempt && attempt.resetAt <= Date.now()) {
      this.attempts.delete(key);
      return undefined;
    }
    return attempt;
  }

  private prune(): void {
    if (this.attempts.size < 1000) {
      return;
    }
    const now = Date.now();
    for (const [key, attempt] of this.attempts) {
      if (attempt.resetAt <= now) {
        this.attempts.delete(key);
      }
    }
  }
}
