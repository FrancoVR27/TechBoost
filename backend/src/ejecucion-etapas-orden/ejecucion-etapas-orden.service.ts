import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { EjecucionEtapaOrden } from './ejecucion-etapa-orden.entity.js';

@Injectable()
export class EjecucionEtapasOrdenService extends CrudService<EjecucionEtapaOrden> {
  constructor(@InjectRepository(EjecucionEtapaOrden) repository: Repository<EjecucionEtapaOrden>) {
    super(repository);
  }
}
