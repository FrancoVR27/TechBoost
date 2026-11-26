import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { Trabajador } from './trabajador.entity.js';
import { TrabajadoresService } from './trabajadores.service.js';

@Controller('trabajadores')
export class TrabajadoresController extends CrudController<Trabajador> {
  constructor(service: TrabajadoresService) {
    super(service);
  }
}
