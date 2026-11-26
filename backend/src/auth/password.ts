import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

// Formato guardado: scrypt$N$r$p$salt(base64)$hash(base64)
const KEY_LENGTH = 64;
const N = 16384;
const R = 8;
const P = 1;

function derive(
  password: string,
  salt: Buffer,
  n: number,
  r: number,
  p: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: n, r, p }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64');
  const salt = Buffer.from(saltB64, 'base64');
  const params = [Number(n), Number(r), Number(p)];
  if (params.some((value) => !Number.isSafeInteger(value) || value < 1)) {
    return false;
  }

  try {
    const actual = await derive(password, salt, params[0], params[1], params[2]);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
