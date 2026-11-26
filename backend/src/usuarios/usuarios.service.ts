import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../auth/password.js';
import { CrudService } from '../common/crud.service.js';
import { Usuario } from './usuarios.entity.js';

@Injectable()
export class UsuariosService extends CrudService<Usuario> {
  constructor(@InjectRepository(Usuario) repository: Repository<Usuario>) {
    super(repository);
  }

  override async create(body: unknown): Promise<unknown> {
    return super.create(await this.prepare(body));
  }

  override async update(id: string, body: unknown): Promise<unknown> {
    return super.update(id, await this.prepare(body));
  }

  protected override toResponse(usuario: Usuario): unknown {
    const { contrasenaHash: _, ...safeUser } = usuario;
    return safeUser;
  }

  /**
   * El campo contrasenaHash que llega por la API se trata SIEMPRE como contraseña en texto
   * y se hashea antes de guardar; el correo se normaliza a minúsculas.
   */
  private async prepare(body: unknown): Promise<unknown> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return body;
    }

    const data = { ...(body as Record<string, unknown>) };
    if ('contrasenaHash' in data) {
      const password = data.contrasenaHash;
      if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
        throw new BadRequestException(
          'La contraseña debe tener entre 8 y 128 caracteres',
        );
      }
      data.contrasenaHash = await hashPassword(password);
    }
    if (typeof data.correo === 'string') {
      data.correo = data.correo.trim().toLowerCase();
    }
    return data;
  }
}
