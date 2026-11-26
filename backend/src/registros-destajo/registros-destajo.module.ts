import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trabajador } from '../trabajadores/trabajador.entity.js';
import { RegistroOperativo } from '../registros-operativos/registro-operativo.entity.js';
import { RegistroDestajo } from './registro-destajo.entity.js';
import { DestajoOperacionesController } from './destajo-operaciones.controller.js';
import { RegistrosDestajoController } from './registros-destajo.controller.js';
import { RegistrosDestajoService } from './registros-destajo.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegistroDestajo,
      Trabajador,
      RegistroOperativo,
    ]),
  ],
  controllers: [
    RegistrosDestajoController,
    DestajoOperacionesController,
  ],
  providers: [RegistrosDestajoService],
})
export class RegistrosDestajoModule {}
