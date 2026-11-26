import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { DispositivoIot } from './dispositivo-iot.entity.js';
import { DispositivosIotService } from './dispositivos-iot.service.js';

@Controller('dispositivos-iot')
export class DispositivosIotController extends CrudController<DispositivoIot> {
  constructor(service: DispositivosIotService) {
    super(service);
  }
}
