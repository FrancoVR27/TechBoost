import { signJwt, verifyJwt } from './jwt.js';

const SECRET = 'x'.repeat(40);
const claims = { sub: 'u1', correo: 'a@b.com', rol: 'Cliente', planId: 1 };

describe('jwt', () => {
  it('firma y verifica un token válido', () => {
    const token = signJwt(claims, SECRET, 60);
    expect(verifyJwt(token, SECRET)).toMatchObject(claims);
  });

  it('rechaza un token firmado con otro secreto', () => {
    const token = signJwt(claims, SECRET, 60);
    expect(verifyJwt(token, 'y'.repeat(40))).toBeNull();
  });

  it('rechaza un token expirado', () => {
    const token = signJwt(claims, SECRET, 60, Date.now() - 120_000);
    expect(verifyJwt(token, SECRET)).toBeNull();
  });

  it('rechaza un payload manipulado', () => {
    const [h, , s] = signJwt(claims, SECRET, 60).split('.');
    const forged = Buffer.from(
      JSON.stringify({ ...claims, rol: 'Admin', iat: 1, exp: 9999999999 }),
    ).toString('base64url');
    expect(verifyJwt(`${h}.${forged}.${s}`, SECRET)).toBeNull();
  });

  it('rechaza alg=none y basura', () => {
    const none = Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url');
    const body = Buffer.from(
      JSON.stringify({ ...claims, iat: 1, exp: 9999999999 }),
    ).toString('base64url');
    expect(verifyJwt(`${none}.${body}.`, SECRET)).toBeNull();
    expect(verifyJwt('no-es-un-token', SECRET)).toBeNull();
  });
});
