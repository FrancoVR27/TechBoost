import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LecturaIot } from './lectura-iot.entity.js';
import { LecturasIotController } from './lecturas-iot.controller.js';
import { LecturasIotService } from './lecturas-iot.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([LecturaIot])],
  controllers: [LecturasIotController],
  providers: [LecturasIotService],
})
export class LecturasIotModule {}
