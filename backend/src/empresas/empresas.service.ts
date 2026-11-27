import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './empresas.entity.js';

const TAMANOS = ['micro', 'pequena', 'mediana'] as const;

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
  ) {}

  async listarParaUsuario(usuarioId: string, rol: string): Promise<Empresa[]> {
    if (rol === 'Admin') {
      return this.empresaRepo.find({ order: { fechaCreacion: 'DESC' } });
    }

    return this.empresaRepo.find({
      where: { clienteId: usuarioId },
      order: { fechaCreacion: 'DESC' },
    });
  }

  async buscarParaUsuario(
    empresaId: string,
    usuarioId: string,
    rol: string,
  ): Promise<Empresa> {
    const where = rol === 'Admin' ? { empresaId } : { empresaId, clienteId: usuarioId };
    const empresa = await this.empresaRepo.findOne({ where });
    if (!empresa) throw new NotFoundException('Empresa no encontrada para esta cuenta.');
    return empresa;
  }

  /** La empresa siempre queda vinculada al usuario autenticado, nunca al ID enviado por el navegador. */
  async crearParaUsuario(usuarioId: string, body: unknown): Promise<Empresa> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Debes enviar los datos de la empresa.');
    }

    const data = body as Record<string, unknown>;
    const razonSocial = this.texto(data.razonSocial, 'razón social', 150);
    const rubro = this.texto(data.rubro, 'rubro', 60);
    const tamano = data.tamano;
    if (typeof tamano !== 'string' || !TAMANOS.includes(tamano as (typeof TAMANOS)[number])) {
      throw new BadRequestException('El tamaño debe ser micro, pequena o mediana.');
    }

    const departamento = data.departamento === undefined
      ? 'La Paz'
      : this.texto(data.departamento, 'departamento', 50);
    const nit = data.nit === undefined || data.nit === null || data.nit === ''
      ? null
      : this.texto(data.nit, 'NIT', 30);
    const cantidadEmpleados = data.cantidadEmpleados === undefined
      ? 1
      : Number(data.cantidadEmpleados);
    if (!Number.isInteger(cantidadEmpleados) || cantidadEmpleados < 1) {
      throw new BadRequestException('La cantidad de empleados debe ser un entero mayor a cero.');
    }

    const existente = await this.empresaRepo.findOneBy({ clienteId: usuarioId });
    if (existente) {
      throw new ConflictException('Tu cuenta ya tiene una empresa vinculada.');
    }

    const empresa = this.empresaRepo.create({
      clienteId: usuarioId,
      razonSocial,
      rubro,
      tamano,
      departamento,
      nit,
      cantidadEmpleados,
    });

    return this.empresaRepo.save(empresa);
  }

  private texto(value: unknown, campo: string, max: number): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`El campo ${campo} es obligatorio.`);
    }
    const result = value.trim();
    if (result.length > max) {
      throw new BadRequestException(`El campo ${campo} no puede superar ${max} caracteres.`);
    }
    return result;
  }
}
