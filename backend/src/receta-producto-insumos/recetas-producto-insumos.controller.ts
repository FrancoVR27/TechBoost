import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { RecetaProductoInsumo } from './receta-producto-insumo.entity.js';
import { RecetasProductoInsumosService } from './recetas-producto-insumos.service.js';

@Controller('receta-producto-insumos')
export class RecetasProductoInsumosController extends CrudController<RecetaProductoInsumo> {
  constructor(service: RecetasProductoInsumosService) {
    super(service);
  }
}
