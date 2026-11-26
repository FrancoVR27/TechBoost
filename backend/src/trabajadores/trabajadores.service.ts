import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { Trabajador } from './trabajador.entity.js';

@Injectable()
export class TrabajadoresService extends CrudService<Trabajador> {
  constructor(@InjectRepository(Trabajador) repository: Repository<Trabajador>) {
    super(repository);
  }
}
