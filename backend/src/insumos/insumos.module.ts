import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Insumo } from './insumo.entity.js';
import { InsumosController } from './insumos.controller.js';
import { InsumosService } from './insumos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Insumo])],
  controllers: [InsumosController],
  providers: [InsumosService],
})
export class InsumosModule {}
