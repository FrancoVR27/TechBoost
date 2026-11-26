import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';

import { CrudController } from '../common/crud.controller.js';
import { Trabajador } from './trabajador.entity.js';
import { TrabajadoresService } from './trabajadores.service.js';
import { HistorialMovimientosService } from './historial-movimientos.service.js';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto.js';

@Controller('trabajadores')
export class TrabajadoresController extends CrudController<Trabajador> {
  constructor(
    service: TrabajadoresService,
    private readonly historialService: HistorialMovimientosService,
  ) {
    super(service);
  }

  // Registrar alta, baja, paso, despido o promoción.

  @Post(':id/movimientos')
  registrarMovimiento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CrearMovimientoDto,
  ) {
    return this.historialService.registrar(id, dto);
  }

  // Consultar el historial laboral.

  @Get(':id/movimientos')
  consultarHistorial(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.historialService.consultarHistorial(id);
  }
}

