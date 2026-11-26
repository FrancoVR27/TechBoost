import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { Producto } from './productos.entity.js';
import { ProductosService } from './productos.service.js';

@Controller('productos')
export class ProductosController extends CrudController<Producto> {
  constructor(service: ProductosService) {
    super(service);
  }
}
