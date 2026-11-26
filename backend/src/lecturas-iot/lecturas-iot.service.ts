import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { LecturaIot } from './lectura-iot.entity.js';

@Injectable()
export class LecturasIotService extends CrudService<LecturaIot> {
  constructor(@InjectRepository(LecturaIot) repository: Repository<LecturaIot>) {
    super(repository);
  }
}
