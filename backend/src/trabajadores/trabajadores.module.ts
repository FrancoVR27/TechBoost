import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from './trabajador.entity.js';
import { HistorialMovimiento } from './historial-movimiento.entity.js';
import { TrabajadoresController } from './trabajadores.controller.js';
import { TrabajadoresService } from './trabajadores.service.js';
import { HistorialMovimientosService } from './historial-movimientos.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Trabajador,
      HistorialMovimiento,
    ]),
  ],

  controllers: [
    TrabajadoresController,
  ],

  providers: [
    TrabajadoresService,
    HistorialMovimientosService,
  ],
})
export class TrabajadoresModule {}
