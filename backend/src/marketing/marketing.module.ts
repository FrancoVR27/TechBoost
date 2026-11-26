import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from '../empresas/empresas.entity.js';
import { MarketingCampania } from './entities/marketing-campania.entity.js';
import { MarketingContacto } from './entities/marketing-contacto.entity.js';
import { MarketingInteraccion } from './entities/marketing-interaccion.entity.js';
import { MarketingController } from './marketing.controller.js';
import { MarketingService } from './marketing.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Empresa,
      MarketingCampania,
      MarketingContacto,
      MarketingInteraccion,
    ]),
  ],
  controllers: [MarketingController],
  providers: [MarketingService],
})
export class MarketingModule {}
