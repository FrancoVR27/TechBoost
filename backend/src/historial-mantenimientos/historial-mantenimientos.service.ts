import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { HistorialMantenimiento } from './historial-mantenimiento.entity.js';

@Injectable()
export class HistorialMantenimientosService extends CrudService<HistorialMantenimiento> {
  constructor(@InjectRepository(HistorialMantenimiento) repository: Repository<HistorialMantenimiento>) {
    super(repository);
  }
}
