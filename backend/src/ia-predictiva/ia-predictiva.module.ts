import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../empresas/empresas.entity.js';
import { InformeAnalisisIa } from '../informes-analisis-ia/informe-analisis-ia.entity.js';
import { Maquinaria } from '../maquinarias/maquinaria.entity.js';
import { Insumo } from '../insumos/insumo.entity.js';
import { IaPredictivaService } from './ia-predictiva.service.js';
import { IaPredictivaController } from './ia-predictiva.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Empresa, InformeAnalisisIa, Maquinaria, Insumo]),
  ],
  controllers: [IaPredictivaController],
  providers: [IaPredictivaService],
  exports: [IaPredictivaService],
})
export class IaPredictivaModule {}