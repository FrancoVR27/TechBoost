import { Repository } from 'typeorm';
import { Usuario } from './usuarios.entity.js';
import { UsuariosService } from './usuarios.service.js';

class TestUsuariosService extends UsuariosService {
  response(usuario: Usuario): unknown {
    return this.toResponse(usuario);
  }
}

describe('UsuariosService', () => {
  it('never includes the password hash in API responses', () => {
    const repository = Object.create(Repository.prototype) as Repository<Usuario>;
    const service = new TestUsuariosService(repository);
    const usuario = Object.assign(new Usuario(), {
      usuarioId: 'f8991a26-7b6e-4e16-8fc0-66f0459e3e1a',
      nombre: 'Ana',
      apellido: 'Pérez',
      correo: 'ana@example.com',
      contrasenaHash: 'secret-hash',
      rol: 'Cliente',
      planId: 1,
      estado: 'activo',
      fechaRegistro: new Date(),
    });

    expect(service.response(usuario)).not.toHaveProperty('contrasenaHash');
  });
});
