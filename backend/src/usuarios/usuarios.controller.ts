import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { Usuario } from './usuarios.entity.js';
import { UsuariosService } from './usuarios.service.js';

@Controller('usuarios')
export class UsuariosController extends CrudController<Usuario> {
  constructor(service: UsuariosService) {
    super(service);
  }
}
