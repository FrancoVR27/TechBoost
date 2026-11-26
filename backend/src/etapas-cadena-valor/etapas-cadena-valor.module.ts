import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtapaCadenaValor } from './etapa-cadena-valor.entity.js';
import { EtapasCadenaValorController } from './etapas-cadena-valor.controller.js';
import { EtapasCadenaValorService } from './etapas-cadena-valor.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([EtapaCadenaValor])],
  controllers: [EtapasCadenaValorController],
  providers: [EtapasCadenaValorService],
})
export class EtapasCadenaValorModule {}
