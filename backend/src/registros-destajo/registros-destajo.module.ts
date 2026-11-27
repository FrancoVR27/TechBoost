import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../empresas/empresas.entity.js';
import { Trabajador } from '../trabajadores/trabajador.entity.js';
import { RegistroOperativo } from '../registros-operativos/registro-operativo.entity.js';
import { RegistroDestajo } from './registro-destajo.entity.js';
import { DestajoOperacionesController } from './destajo-operaciones.controller.js';
import { RegistrosDestajoService } from './registros-destajo.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroDestajo, Trabajador, RegistroOperativo, Empresa])],
  // Se expone solo la API validada por empresa; se elimina el CRUD genérico sin aislamiento empresarial.
  controllers: [DestajoOperacionesController],
  providers: [RegistrosDestajoService],
})
export class RegistrosDestajoModule {}
