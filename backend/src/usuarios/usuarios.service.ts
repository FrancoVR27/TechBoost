import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { Usuario } from './usuarios.entity.js';

@Injectable()
export class UsuariosService extends CrudService<Usuario> {
  constructor(@InjectRepository(Usuario) repository: Repository<Usuario>) {
    super(repository);
  }

  protected override toResponse(usuario: Usuario): unknown {
    const { contrasenaHash: _, ...safeUser } = usuario;
    return safeUser;
  }
}
