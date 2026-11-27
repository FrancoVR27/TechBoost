import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from '../empresas/empresas.entity.js';
import { Trabajador } from './trabajador.entity.js';

interface UsuarioSesion {
  sub: string;
  rol: string;
}

const MODALIDADES = ['sueldo_fijo', 'destajo', 'mixto'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class TrabajadoresService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadores: Repository<Trabajador>,
    @InjectRepository(Empresa)
    private readonly empresas: Repository<Empresa>,
  ) {}

  async listar(usuario: UsuarioSesion, limit = 100, after?: string) {
    const pageSize = Math.min(Math.max(limit, 1), 100);
    const query = this.trabajadores
      .createQueryBuilder('trabajador')
      .orderBy('trabajador.trabajadorId', 'ASC')
      .take(pageSize + 1);

    if (usuario.rol !== 'Admin') {
      const empresa = await this.empresaDelUsuario(usuario.sub);
      if (!empresa) return { items: [], nextCursor: null };
      query.where('trabajador.empresaId = :empresaId', { empresaId: empresa.empresaId });
    }

    if (after !== undefined) {
      if (!UUID.test(after)) throw new BadRequestException('El cursor debe ser un UUID válido.');
      if (usuario.rol === 'Admin') {
        query.where('trabajador.trabajadorId > :after', { after });
      } else {
        query.andWhere('trabajador.trabajadorId > :after', { after });
      }
    }

    const rows = await query.getMany();
    const items = rows.slice(0, pageSize);
    return {
      items,
      nextCursor: rows.length > pageSize && items.length
        ? items[items.length - 1].trabajadorId
        : null,
    };
  }

  async obtener(usuario: UsuarioSesion, trabajadorId: string): Promise<Trabajador> {
    const where: { trabajadorId: string; empresaId?: string } = { trabajadorId };
    if (usuario.rol !== 'Admin') {
      const empresa = await this.empresaDelUsuario(usuario.sub);
      if (!empresa) throw new NotFoundException('Tu cuenta no tiene una empresa vinculada. Regístrala en Empresas.');
      where.empresaId = empresa.empresaId;
    }
    const trabajador = await this.trabajadores.findOne({ where });
    if (!trabajador) throw new NotFoundException('Trabajador no encontrado en tu empresa.');
    return trabajador;
  }

  async crear(usuario: UsuarioSesion, body: unknown): Promise<Trabajador> {
    const data = this.objeto(body);
    let empresaId: string;

    if (usuario.rol === 'Admin') {
      if (typeof data.empresaId !== 'string' || !UUID.test(data.empresaId)) {
        throw new BadRequestException('Selecciona una empresa válida.');
      }
      empresaId = data.empresaId;
      const exists = await this.empresas.findOneBy({ empresaId });
      if (!exists) throw new NotFoundException('La empresa seleccionada no existe.');
    } else {
      const empresa = await this.empresaDelUsuario(usuario.sub);
      if (!empresa) throw new NotFoundException('Tu cuenta no tiene una empresa vinculada. Regístrala en Empresas.');
      empresaId = empresa.empresaId;
    }

    const trabajador = this.trabajadores.create({
      empresaId,
      nombreCompleto: this.texto(data.nombreCompleto, 'nombre completo', 150),
      cargo: this.cargo(data.cargo),
      modalidadPago: this.modalidad(data.modalidadPago),
      tarifaBaseBs: this.tarifa(data.tarifaBaseBs),
      activo: data.activo === undefined ? true : this.booleano(data.activo, 'activo'),
    });
    return this.trabajadores.save(trabajador);
  }

  async actualizar(usuario: UsuarioSesion, trabajadorId: string, body: unknown): Promise<Trabajador> {
    const trabajador = await this.obtener(usuario, trabajadorId);
    const data = this.objeto(body);
    const permitidos = new Set(['nombreCompleto', 'cargo', 'modalidadPago', 'tarifaBaseBs', 'activo']);
    const invalidos = Object.keys(data).filter((key) => !permitidos.has(key));
    if (invalidos.length) throw new BadRequestException(`Campos no permitidos: ${invalidos.join(', ')}`);
    if (!Object.keys(data).length) throw new BadRequestException('Debes enviar al menos un campo para actualizar.');

    if ('nombreCompleto' in data) trabajador.nombreCompleto = this.texto(data.nombreCompleto, 'nombre completo', 150);
    if ('cargo' in data) trabajador.cargo = this.cargo(data.cargo);
    if ('modalidadPago' in data) trabajador.modalidadPago = this.modalidad(data.modalidadPago);
    if ('tarifaBaseBs' in data) trabajador.tarifaBaseBs = this.tarifa(data.tarifaBaseBs);
    if ('activo' in data) trabajador.activo = this.booleano(data.activo, 'activo');

    return this.trabajadores.save(trabajador);
  }

  async eliminar(usuario: UsuarioSesion, trabajadorId: string): Promise<{ deleted: true }> {
    const trabajador = await this.obtener(usuario, trabajadorId);
    await this.trabajadores.remove(trabajador);
    return { deleted: true };
  }

  private async empresaDelUsuario(usuarioId: string): Promise<Empresa | null> {
    return this.empresas.findOne({ where: { clienteId: usuarioId } });
  }

  private objeto(body: unknown): Record<string, unknown> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('El cuerpo debe ser un objeto JSON.');
    }
    return body as Record<string, unknown>;
  }

  private texto(value: unknown, campo: string, max: number): string {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`El campo ${campo} es obligatorio.`);
    }
    const result = value.trim();
    if (result.length > max) throw new BadRequestException(`El campo ${campo} es demasiado largo.`);
    return result;
  }

  private cargo(value: unknown): string | null {
    if (value === undefined || value === null || value === '') return null;
    return this.texto(value, 'cargo', 80);
  }

  private modalidad(value: unknown): (typeof MODALIDADES)[number] {
    if (typeof value !== 'string' || !MODALIDADES.includes(value as (typeof MODALIDADES)[number])) {
      throw new BadRequestException('La modalidad de pago no es válida.');
    }
    return value as (typeof MODALIDADES)[number];
  }

  private tarifa(value: unknown): string {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new BadRequestException('La tarifa base debe ser un número mayor o igual a cero.');
    }
    return amount.toFixed(2);
  }

  private booleano(value: unknown, campo: string): boolean {
    if (typeof value !== 'boolean') throw new BadRequestException(`El campo ${campo} debe ser booleano.`);
    return value;
  }
}
