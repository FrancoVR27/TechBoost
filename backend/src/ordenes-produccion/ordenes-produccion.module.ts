import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenProduccion } from './orden-produccion.entity.js';
import { OrdenesProduccionController } from './ordenes-produccion.controller.js';
import { OrdenesProduccionService } from './ordenes-produccion.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([OrdenProduccion])],
  controllers: [OrdenesProduccionController],
  providers: [OrdenesProduccionService],
})
export class OrdenesProduccionModule {}
