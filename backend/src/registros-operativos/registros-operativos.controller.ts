import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { RegistroOperativo } from './registro-operativo.entity.js';
import { RegistrosOperativosService } from './registros-operativos.service.js';

@Controller('registros-operativos')
export class RegistrosOperativosController extends CrudController<RegistroOperativo> {
  constructor(service: RegistrosOperativosService) {
    super(service);
  }
}
