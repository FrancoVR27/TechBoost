import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { Empresa } from './empresas.entity.js';

@Injectable()
export class EmpresasService extends CrudService<Empresa> {
  constructor(@InjectRepository(Empresa) repository: Repository<Empresa>) {
    super(repository);
  }
}
