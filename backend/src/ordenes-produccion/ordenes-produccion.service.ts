import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { OrdenProduccion } from './orden-produccion.entity.js';

@Injectable()
export class OrdenesProduccionService extends CrudService<OrdenProduccion> {
  constructor(@InjectRepository(OrdenProduccion) repository: Repository<OrdenProduccion>) {
    super(repository);
  }
}
