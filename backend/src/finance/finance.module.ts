import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../empresas/empresas.entity.js';
import { EtapaCadenaValor } from '../etapas-cadena-valor/etapa-cadena-valor.entity.js';
import { Insumo } from '../insumos/insumo.entity.js';
import { Producto } from '../productos/productos.entity.js';
import { RecetaProductoInsumo } from '../receta-producto-insumos/receta-producto-insumo.entity.js';
import { RegistroDestajo } from '../registros-destajo/registro-destajo.entity.js';
import { RegistroOperativo } from '../registros-operativos/registro-operativo.entity.js';
import { Trabajador } from '../trabajadores/trabajador.entity.js';
import { FinanceController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RegistroOperativo,
      Empresa,
      RegistroDestajo,
      Trabajador,
      Insumo,
      RecetaProductoInsumo,
      EtapaCadenaValor,
      Producto,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
