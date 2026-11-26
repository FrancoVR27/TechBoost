import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { EjecucionEtapaOrden } from './ejecucion-etapa-orden.entity.js';
import { EjecucionEtapasOrdenService } from './ejecucion-etapas-orden.service.js';

@Controller('ejecucion-etapas-orden')
export class EjecucionEtapasOrdenController extends CrudController<EjecucionEtapaOrden> {
  constructor(service: EjecucionEtapasOrdenService) {
    super(service);
  }
}
