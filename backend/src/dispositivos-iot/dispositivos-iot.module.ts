import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoIot } from './dispositivo-iot.entity.js';
import { DispositivosIotController } from './dispositivos-iot.controller.js';
import { DispositivosIotService } from './dispositivos-iot.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([DispositivoIot])],
  controllers: [DispositivosIotController],
  providers: [DispositivosIotService],
})
export class DispositivosIotModule {}
