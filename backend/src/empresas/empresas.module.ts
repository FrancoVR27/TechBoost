import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './empresas.entity.js';
import { EmpresasController } from './empresas.controller.js';
import { EmpresasService } from './empresas.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa])],
  controllers: [EmpresasController],
  providers: [EmpresasService],
})
export class EmpresasModule {}
