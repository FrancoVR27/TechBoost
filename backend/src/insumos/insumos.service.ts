import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { Insumo } from './insumo.entity.js';

@Injectable()
export class InsumosService extends CrudService<Insumo> {
  constructor(@InjectRepository(Insumo) repository: Repository<Insumo>) {
    super(repository);
  }
}
