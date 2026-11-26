import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from '../productos/productos.entity.js';
import { Insumo } from '../insumos/insumo.entity.js';
import { RecetaProductoInsumo } from '../receta-producto-insumos/receta-producto-insumo.entity.js';
import { CostosProductosController } from './costos-productos.controller.js';
import { CostosProductosService } from './costos-productos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Insumo, RecetaProductoInsumo])],
  controllers: [CostosProductosController],
  providers: [CostosProductosService],
})
export class CostosProductosModule {}
