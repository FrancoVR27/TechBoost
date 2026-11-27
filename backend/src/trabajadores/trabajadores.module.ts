import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../empresas/empresas.entity.js';
import { HistorialMovimiento } from './historial-movimiento.entity.js';
import { Trabajador } from './trabajador.entity.js';
import { TrabajadoresController } from './trabajadores.controller.js';
import { HistorialMovimientosService } from './historial-movimientos.service.js';
import { TrabajadoresService } from './trabajadores.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Trabajador, HistorialMovimiento, Empresa])],
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService, HistorialMovimientosService],
})
export class TrabajadoresModule {}
