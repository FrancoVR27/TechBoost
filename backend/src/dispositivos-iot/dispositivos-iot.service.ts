import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { DispositivoIot } from './dispositivo-iot.entity.js';

@Injectable()
export class DispositivosIotService extends CrudService<DispositivoIot> {
  constructor(@InjectRepository(DispositivoIot) repository: Repository<DispositivoIot>) {
    super(repository);
  }
}
