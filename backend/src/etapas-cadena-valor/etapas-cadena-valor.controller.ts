import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { EtapaCadenaValor } from './etapa-cadena-valor.entity.js';
import { EtapasCadenaValorService } from './etapas-cadena-valor.service.js';

@Controller('etapas-cadena-valor')
export class EtapasCadenaValorController extends CrudController<EtapaCadenaValor> {
  constructor(service: EtapasCadenaValorService) {
    super(service);
  }
}
