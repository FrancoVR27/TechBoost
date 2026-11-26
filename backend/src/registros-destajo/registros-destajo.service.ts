import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { RegistroDestajo } from './registro-destajo.entity.js';

@Injectable()
export class RegistrosDestajoService extends CrudService<RegistroDestajo> {
  constructor(@InjectRepository(RegistroDestajo) repository: Repository<RegistroDestajo>) {
    super(repository);
  }
}
