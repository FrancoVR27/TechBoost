import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetaProductoInsumo } from './receta-producto-insumo.entity.js';
import { RecetasProductoInsumosController } from './recetas-producto-insumos.controller.js';
import { RecetasProductoInsumosService } from './recetas-producto-insumos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([RecetaProductoInsumo])],
  controllers: [RecetasProductoInsumosController],
  providers: [RecetasProductoInsumosService],
})
export class RecetasProductoInsumosModule {}
