import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { RegistroOperativo } from './registro-operativo.entity.js';

@Injectable()
export class RegistrosOperativosService extends CrudService<RegistroOperativo> {
  constructor(@InjectRepository(RegistroOperativo) repository: Repository<RegistroOperativo>) {
    super(repository);
  }
}
