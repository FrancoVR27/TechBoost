import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { Plan } from './planes.entity.js';

@Injectable()
export class PlanesService extends CrudService<Plan> {
  constructor(@InjectRepository(Plan) repository: Repository<Plan>) {
    super(repository);
  }
}
