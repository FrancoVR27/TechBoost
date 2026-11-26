import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { OrdenProduccion } from './orden-produccion.entity.js';
import { OrdenesProduccionService } from './ordenes-produccion.service.js';

@Controller('ordenes-produccion')
export class OrdenesProduccionController extends CrudController<OrdenProduccion> {
  constructor(service: OrdenesProduccionService) {
    super(service);
  }
}
