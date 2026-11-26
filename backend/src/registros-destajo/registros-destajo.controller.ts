import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { RegistroDestajo } from './registro-destajo.entity.js';
import { RegistrosDestajoService } from './registros-destajo.service.js';

@Controller('registros-destajo')
export class RegistrosDestajoController extends CrudController<RegistroDestajo> {
  constructor(service: RegistrosDestajoService) {
    super(service);
  }
}
