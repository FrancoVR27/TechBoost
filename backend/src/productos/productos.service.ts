import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { Producto } from './productos.entity.js';

@Injectable()
export class ProductosService extends CrudService<Producto> {
  constructor(@InjectRepository(Producto) repository: Repository<Producto>) {
    super(repository);
  }
}
