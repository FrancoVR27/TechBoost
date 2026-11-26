import { Controller } from '@nestjs/common';
import { AdminWrites } from '../auth/auth.decorators.js';
import { CrudController } from '../common/crud.controller.js';
import { Plan } from './planes.entity.js';
import { PlanesService } from './planes.service.js';

@AdminWrites()
@Controller('planes')
export class PlanesController extends CrudController<Plan> {
  constructor(service: PlanesService) {
    super(service);
  }
}
