import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistorialMantenimiento } from './historial-mantenimiento.entity.js';
import { HistorialMantenimientosController } from './historial-mantenimientos.controller.js';
import { HistorialMantenimientosService } from './historial-mantenimientos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialMantenimiento])],
  controllers: [HistorialMantenimientosController],
  providers: [HistorialMantenimientosService],
})
export class HistorialMantenimientosModule {}
