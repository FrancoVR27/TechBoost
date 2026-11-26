import { Controller } from '@nestjs/common';
import { Roles } from '../auth/auth.decorators.js';
import { CrudController } from '../common/crud.controller.js';
import { Usuario } from './usuarios.entity.js';
import { UsuariosService } from './usuarios.service.js';

// Gestión de usuarios: solo administradores. El registro público va por POST /auth/register.
@Roles('Admin')
@Controller('usuarios')
export class UsuariosController extends CrudController<Usuario> {
  constructor(service: UsuariosService) {
    super(service);
  }
}
