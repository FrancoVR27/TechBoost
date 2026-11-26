import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { Empresa } from './empresas.entity.js';

@Injectable()
export class EmpresasService extends CrudService<Empresa> {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
  ) {
    super(empresaRepo);
  }

  async listarParaUsuario(usuarioId: string, rol: string): Promise<Empresa[]> {
    if (rol === 'Admin') {
      return this.empresaRepo.find({ order: { fechaCreacion: 'DESC' } });
    }
    return this.empresaRepo.find({
      where: { clienteId: usuarioId },
      order: { fechaCreacion: 'DESC' },
    });
  }
}