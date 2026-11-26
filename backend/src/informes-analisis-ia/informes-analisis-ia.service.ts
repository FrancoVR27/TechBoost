import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { InformeAnalisisIa } from './informe-analisis-ia.entity.js';

@Injectable()
export class InformesAnalisisIaService extends CrudService<InformeAnalisisIa> {
  constructor(@InjectRepository(InformeAnalisisIa) repository: Repository<InformeAnalisisIa>) {
    super(repository);
  }
}
