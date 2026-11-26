import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroOperativo } from './registro-operativo.entity.js';
import { RegistrosOperativosController } from './registros-operativos.controller.js';
import { RegistrosOperativosService } from './registros-operativos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroOperativo])],
  controllers: [RegistrosOperativosController],
  providers: [RegistrosOperativosService],
})
export class RegistrosOperativosModule {}
