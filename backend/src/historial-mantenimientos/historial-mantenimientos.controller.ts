import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { HistorialMantenimiento } from './historial-mantenimiento.entity.js';
import { HistorialMantenimientosService } from './historial-mantenimientos.service.js';

@Controller('historial-mantenimientos')
export class HistorialMantenimientosController extends CrudController<HistorialMantenimiento> {
  constructor(service: HistorialMantenimientosService) {
    super(service);
  }
}
