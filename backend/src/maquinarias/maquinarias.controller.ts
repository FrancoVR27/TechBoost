import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { Maquinaria } from './maquinaria.entity.js';
import { MaquinariasService } from './maquinarias.service.js';

@Controller('maquinarias')
export class MaquinariasController extends CrudController<Maquinaria> {
  constructor(service: MaquinariasService) {
    super(service);
  }
}
