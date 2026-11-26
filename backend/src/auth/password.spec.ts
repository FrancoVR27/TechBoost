import { hashPassword, verifyPassword } from './password.js';

describe('password', () => {
  it('verifica la contraseña correcta y rechaza la incorrecta', async () => {
    const hash = await hashPassword('Clave-Segura-123');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('Clave-Segura-123', hash)).toBe(true);
    expect(await verifyPassword('otra-clave', hash)).toBe(false);
  });

  it('genera hashes distintos para la misma contraseña (salt aleatorio)', async () => {
    expect(await hashPassword('igual-igual')).not.toBe(
      await hashPassword('igual-igual'),
    );
  });

  it('rechaza valores guardados con formato inválido sin lanzar errores', async () => {
    expect(await verifyPassword('x', 'texto-plano')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$a$b$c$d$e')).toBe(false);
    expect(await verifyPassword('x', '')).toBe(false);
  });
});
