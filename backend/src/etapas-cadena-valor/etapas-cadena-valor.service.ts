import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { EtapaCadenaValor } from './etapa-cadena-valor.entity.js';

@Injectable()
export class EtapasCadenaValorService extends CrudService<EtapaCadenaValor> {
  constructor(@InjectRepository(EtapaCadenaValor) repository: Repository<EtapaCadenaValor>) {
    super(repository);
  }
}
