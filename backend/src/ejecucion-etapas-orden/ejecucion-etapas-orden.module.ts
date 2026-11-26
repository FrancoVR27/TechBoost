import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EjecucionEtapaOrden } from './ejecucion-etapa-orden.entity.js';
import { EjecucionEtapasOrdenController } from './ejecucion-etapas-orden.controller.js';
import { EjecucionEtapasOrdenService } from './ejecucion-etapas-orden.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([EjecucionEtapaOrden])],
  controllers: [EjecucionEtapasOrdenController],
  providers: [EjecucionEtapasOrdenService],
})
export class EjecucionEtapasOrdenModule {}
