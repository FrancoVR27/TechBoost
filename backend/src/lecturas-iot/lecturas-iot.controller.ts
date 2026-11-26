import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { LecturaIot } from './lectura-iot.entity.js';
import { LecturasIotService } from './lecturas-iot.service.js';

@Controller('lecturas-iot')
export class LecturasIotController extends CrudController<LecturaIot> {
  constructor(service: LecturasIotService) {
    super(service);
  }
}
