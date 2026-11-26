import { Controller } from '@nestjs/common';
import { CrudController } from '../common/crud.controller.js';
import { Empresa } from './empresas.entity.js';
import { EmpresasService } from './empresas.service.js';

@Controller('empresas')
export class EmpresasController extends CrudController<Empresa> {
  constructor(service: EmpresasService) {
    super(service);
  }
}
