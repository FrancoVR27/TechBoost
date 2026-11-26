import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { Maquinaria } from './maquinaria.entity.js';

@Injectable()
export class MaquinariasService extends CrudService<Maquinaria> {
  constructor(@InjectRepository(Maquinaria) repository: Repository<Maquinaria>) {
    super(repository);
  }
}
