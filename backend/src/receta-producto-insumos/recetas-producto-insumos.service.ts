import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { RecetaProductoInsumo } from './receta-producto-insumo.entity.js';

@Injectable()
export class RecetasProductoInsumosService extends CrudService<RecetaProductoInsumo> {
  constructor(@InjectRepository(RecetaProductoInsumo) repository: Repository<RecetaProductoInsumo>) {
    super(repository);
  }
}
