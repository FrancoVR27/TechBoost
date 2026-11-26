import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Maquinaria } from './maquinaria.entity.js';
import { MaquinariasController } from './maquinarias.controller.js';
import { MaquinariasService } from './maquinarias.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Maquinaria])],
  controllers: [MaquinariasController],
  providers: [MaquinariasService],
})
export class MaquinariasModule {}
