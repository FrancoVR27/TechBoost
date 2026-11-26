import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { InformeAnalisisIa } from './informe-analisis-ia.entity.js';
import { InformesAnalisisIaService } from './informes-analisis-ia.service.js';

@Controller('informes-analisis-ia')
export class InformesAnalisisIaController extends CrudController<InformeAnalisisIa> {
  constructor(service: InformesAnalisisIaService) {
    super(service);
  }
}
