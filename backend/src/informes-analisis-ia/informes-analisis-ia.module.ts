import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InformeAnalisisIa } from './informe-analisis-ia.entity.js';
import { InformesAnalisisIaController } from './informes-analisis-ia.controller.js';
import { InformesAnalisisIaService } from './informes-analisis-ia.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([InformeAnalisisIa])],
  controllers: [InformesAnalisisIaController],
  providers: [InformesAnalisisIaService],
})
export class InformesAnalisisIaModule {}
