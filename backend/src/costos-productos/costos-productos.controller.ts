import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CostosProductosService } from './costos-productos.service.js';

@Controller('costos-productos')
export class CostosProductosController {
  constructor(private readonly costosService: CostosProductosService) {}

  @Post(':productoId/calcular')
  calcular(@Param('productoId', ParseUUIDPipe) productoId: string) {
    return this.costosService.calcular(productoId);
  }
}
