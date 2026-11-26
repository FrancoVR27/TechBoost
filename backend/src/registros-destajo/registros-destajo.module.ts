import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroDestajo } from './registro-destajo.entity.js';
import { RegistrosDestajoController } from './registros-destajo.controller.js';
import { RegistrosDestajoService } from './registros-destajo.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroDestajo])],
  controllers: [RegistrosDestajoController],
  providers: [RegistrosDestajoService],
})
export class RegistrosDestajoModule {}
