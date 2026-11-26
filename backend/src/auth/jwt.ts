import { createHmac, timingSafeEqual } from 'node:crypto';

export interface JwtPayload {
  sub: string;
  correo: string;
  rol: string;
  planId: number | null;
  iat: number;
  exp: number;
}

const HEADER = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
  'base64url',
);

function signature(data: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(data).digest();
}

export function signJwt(
  claims: Omit<JwtPayload, 'iat' | 'exp'>,
  secret: string,
  ttlSeconds: number,
  now = Date.now(),
): string {
  const iat = Math.floor(now / 1000);
  const payload: JwtPayload = { ...claims, iat, exp: iat + ttlSeconds };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const data = `${HEADER}.${body}`;
  return `${data}.${signature(data, secret).toString('base64url')}`;
}

export function verifyJwt(
  token: string,
  secret: string,
  now = Date.now(),
): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [header, body, sig] = parts;
  // Solo se acepta el header que firmamos nosotros (evita alg=none u otros).
  if (header !== HEADER) {
    return null;
  }

  const expected = signature(`${header}.${body}`, secret);
  const received = Buffer.from(sig, 'base64url');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8'),
    ) as JwtPayload;
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(now / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
