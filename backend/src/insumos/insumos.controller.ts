import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { Insumo } from './insumo.entity.js';
import { InsumosService } from './insumos.service.js';

@Controller('insumos')
export class InsumosController extends CrudController<Insumo> {
  constructor(service: InsumosService) {
    super(service);
  }
}
