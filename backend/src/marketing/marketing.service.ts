import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Empresa } from '../empresas/empresas.entity.js';
import { MarketingCampania } from './entities/marketing-campania.entity.js';
import { MarketingContacto } from './entities/marketing-contacto.entity.js';
import { MarketingInteraccion } from './entities/marketing-interaccion.entity.js';

const FUENTES = ['whatsapp', 'redes_sociales', 'referido', 'feria', 'web', 'llamada', 'otro'] as const;
const ESTADOS_CONTACTO = ['nuevo', 'contactado', 'interesado', 'cliente', 'perdido'] as const;
const OBJETIVOS = ['reconocimiento', 'generacion_leads', 'conversiones', 'fidelizacion'] as const;
const CANALES = ['redes_sociales', 'whatsapp', 'correo', 'ferias', 'referidos', 'otro'] as const;
const ESTADOS_CAMPANIA = ['planificada', 'activa', 'pausada', 'finalizada'] as const;
const TIPOS_INTERACCION = ['llamada', 'whatsapp', 'correo', 'reunion', 'visita', 'otro'] as const;
const RESULTADOS_INTERACCION = ['sin_respuesta', 'interesado', 'seguimiento', 'convertido', 'no_interesado'] as const;

type Registro = Record<string, unknown>;

function objeto(body: unknown): Registro {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('El cuerpo debe ser un objeto JSON.');
  }
  return body as Registro;
}

function texto(valor: unknown, campo: string, maximo: number, obligatorio = false): string | null {
  if (valor === undefined || valor === null || valor === '') {
    if (obligatorio) throw new BadRequestException(`${campo} es obligatorio.`);
    return null;
  }
  if (typeof valor !== 'string') throw new BadRequestException(`${campo} debe ser texto.`);
  const limpio = valor.trim();
  if (obligatorio && !limpio) throw new BadRequestException(`${campo} es obligatorio.`);
  if (limpio.length > maximo) throw new BadRequestException(`${campo} no puede superar ${maximo} caracteres.`);
  return limpio || null;
}

function opcion<T extends readonly string[]>(valor: unknown, permitidos: T, campo: string, porDefecto: T[number]): T[number] {
  const seleccionado = valor === undefined || valor === null || valor === '' ? porDefecto : valor;
  if (typeof seleccionado !== 'string' || !permitidos.includes(seleccionado as T[number])) {
    throw new BadRequestException(`El valor de ${campo} no es válido.`);
  }
  return seleccionado as T[number];
}

function fecha(valor: unknown, campo: string, obligatoria = false): string | null {
  if (valor === undefined || valor === null || valor === '') {
    if (obligatoria) throw new BadRequestException(`${campo} es obligatoria.`);
    return null;
  }
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new BadRequestException(`${campo} debe tener el formato YYYY-MM-DD.`);
  }
  const [anio, mes, dia] = valor.split('-').map(Number);
  const comprobacion = new Date(Date.UTC(anio, mes - 1, dia));
  if (
    comprobacion.getUTCFullYear() !== anio ||
    comprobacion.getUTCMonth() !== mes - 1 ||
    comprobacion.getUTCDate() !== dia
  ) {
    throw new BadRequestException(`${campo} no es una fecha válida.`);
  }
  return valor;
}

function monto(valor: unknown, campo: string, porDefecto = 0): number {
  const numero = valor === undefined || valor === null || valor === '' ? porDefecto : Number(valor);
  if (!Number.isFinite(numero) || numero < 0 || numero > 9999999999.99) {
    throw new BadRequestException(`${campo} debe ser un importe igual o mayor que cero.`);
  }
  return Number(numero.toFixed(2));
}

function correo(valor: unknown): string | null {
  const resultado = texto(valor, 'Correo', 150);
  if (resultado && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resultado)) {
    throw new BadRequestException('El correo electrónico no tiene un formato válido.');
  }
  return resultado;
}

function fechaHoy(): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

@Injectable()
export class MarketingService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresas: Repository<Empresa>,
    @InjectRepository(MarketingContacto)
    private readonly contactos: Repository<MarketingContacto>,
    @InjectRepository(MarketingCampania)
    private readonly campanias: Repository<MarketingCampania>,
    @InjectRepository(MarketingInteraccion)
    private readonly interacciones: Repository<MarketingInteraccion>,
    private readonly dataSource: DataSource,
  ) {}

  private async verificarEmpresa(empresaId: string): Promise<void> {
    const existe = await this.empresas.findOneBy({ empresaId });
    if (!existe) throw new NotFoundException('La empresa seleccionada no existe.');
  }

  private async buscarContacto(empresaId: string, contactoId: string): Promise<MarketingContacto> {
    const contacto = await this.contactos.findOne({ where: { empresaId, contactoId } });
    if (!contacto) throw new NotFoundException('El contacto no existe en esta empresa.');
    return contacto;
  }

  private async buscarCampania(empresaId: string, campaniaId: string): Promise<MarketingCampania> {
    const campania = await this.campanias.findOne({ where: { empresaId, campaniaId } });
    if (!campania) throw new NotFoundException('La campaña no existe en esta empresa.');
    return campania;
  }

  async obtenerResumen(empresaId: string) {
    await this.verificarEmpresa(empresaId);

    const [contactos, campanias, fuentes, seguimientos] = await Promise.all([
      this.contactos.find({ where: { empresaId } }),
      this.campanias.find({ where: { empresaId } }),
      this.contactos
        .createQueryBuilder('contacto')
        .select('contacto.fuente', 'fuente')
        .addSelect('COUNT(*)', 'cantidad')
        .where('contacto.empresaId = :empresaId', { empresaId })
        .groupBy('contacto.fuente')
        .orderBy('COUNT(*)', 'DESC')
        .getRawMany<{ fuente: string; cantidad: string }>(),
      this.contactos
        .createQueryBuilder('contacto')
        .where('contacto.empresaId = :empresaId', { empresaId })
        .andWhere("contacto.estado NOT IN ('cliente', 'perdido')")
        .andWhere('contacto.proximoSeguimiento IS NOT NULL')
        .andWhere('contacto.proximoSeguimiento <= CURRENT_DATE')
        .getCount(),
    ]);

    const totalContactos = contactos.length;
    const clientes = contactos.filter((item) => item.estado === 'cliente').length;
    const prospectos = totalContactos - clientes - contactos.filter((item) => item.estado === 'perdido').length;
    const activas = campanias.filter((item) => item.estado === 'activa').length;
    const presupuesto = campanias.reduce((total, item) => total + Number(item.presupuestoBs), 0);
    const gasto = campanias.reduce((total, item) => total + Number(item.gastoRealBs), 0);

    return {
      totalContactos,
      prospectos,
      clientes,
      perdidos: contactos.filter((item) => item.estado === 'perdido').length,
      campaniasActivas: activas,
      presupuestoTotalBs: Number(presupuesto.toFixed(2)),
      gastoRealTotalBs: Number(gasto.toFixed(2)),
      seguimientosPendientes: seguimientos,
      tasaConversionPct: totalContactos > 0 ? Number(((clientes / totalContactos) * 100).toFixed(2)) : 0,
      contactosPorFuente: fuentes.map((item) => ({ fuente: item.fuente, cantidad: Number(item.cantidad) })),
    };
  }

  async listarContactos(empresaId: string) {
    await this.verificarEmpresa(empresaId);
    return this.contactos.find({ where: { empresaId }, order: { fechaRegistro: 'DESC' }, take: 300 });
  }

  async crearContacto(empresaId: string, body: unknown) {
    await this.verificarEmpresa(empresaId);
    const datos = objeto(body);
    const campaniaId = texto(datos.campaniaId, 'Campaña', 36);
    if (campaniaId) await this.buscarCampania(empresaId, campaniaId);

    const nuevo = this.contactos.create({
      empresaId,
      campaniaId,
      nombreCompleto: texto(datos.nombreCompleto, 'Nombre del contacto', 150, true)!,
      empresaContacto: texto(datos.empresaContacto, 'Empresa del contacto', 150),
      correo: correo(datos.correo),
      telefono: texto(datos.telefono, 'Teléfono', 30),
      rubro: texto(datos.rubro, 'Rubro', 80),
      fuente: opcion(datos.fuente, FUENTES, 'fuente', 'otro'),
      estado: opcion(datos.estado, ESTADOS_CONTACTO, 'estado', 'nuevo'),
      necesidad: texto(datos.necesidad, 'Necesidad', 5000),
      notas: texto(datos.notas, 'Notas', 5000),
      proximoSeguimiento: fecha(datos.proximoSeguimiento, 'Próximo seguimiento'),
    });
    return this.contactos.save(nuevo);
  }

  async actualizarContacto(empresaId: string, contactoId: string, body: unknown) {
    const contacto = await this.buscarContacto(empresaId, contactoId);
    const datos = objeto(body);
    const permitidos = new Set([
      'campaniaId', 'nombreCompleto', 'empresaContacto', 'correo', 'telefono',
      'rubro', 'fuente', 'estado', 'necesidad', 'notas', 'proximoSeguimiento',
    ]);
    const campos = Object.keys(datos);
    if (campos.length === 0 || campos.some((campo) => !permitidos.has(campo))) {
      throw new BadRequestException('El contacto contiene campos vacíos o no permitidos.');
    }

    if ('campaniaId' in datos) {
      const campaniaId = texto(datos.campaniaId, 'Campaña', 36);
      if (campaniaId) await this.buscarCampania(empresaId, campaniaId);
      contacto.campaniaId = campaniaId;
    }
    if ('nombreCompleto' in datos) contacto.nombreCompleto = texto(datos.nombreCompleto, 'Nombre del contacto', 150, true)!;
    if ('empresaContacto' in datos) contacto.empresaContacto = texto(datos.empresaContacto, 'Empresa del contacto', 150);
    if ('correo' in datos) contacto.correo = correo(datos.correo);
    if ('telefono' in datos) contacto.telefono = texto(datos.telefono, 'Teléfono', 30);
    if ('rubro' in datos) contacto.rubro = texto(datos.rubro, 'Rubro', 80);
    if ('fuente' in datos) contacto.fuente = opcion(datos.fuente, FUENTES, 'fuente', 'otro');
    if ('estado' in datos) contacto.estado = opcion(datos.estado, ESTADOS_CONTACTO, 'estado', 'nuevo');
    if ('necesidad' in datos) contacto.necesidad = texto(datos.necesidad, 'Necesidad', 5000);
    if ('notas' in datos) contacto.notas = texto(datos.notas, 'Notas', 5000);
    if ('proximoSeguimiento' in datos) contacto.proximoSeguimiento = fecha(datos.proximoSeguimiento, 'Próximo seguimiento');
    return this.contactos.save(contacto);
  }

  async eliminarContacto(empresaId: string, contactoId: string) {
    await this.buscarContacto(empresaId, contactoId);
    await this.contactos.delete({ empresaId, contactoId });
    return { deleted: true };
  }

  async listarCampanias(empresaId: string) {
    await this.verificarEmpresa(empresaId);
    return this.campanias.find({ where: { empresaId }, order: { fechaInicio: 'DESC', fechaRegistro: 'DESC' }, take: 200 });
  }

  async crearCampania(empresaId: string, body: unknown) {
    await this.verificarEmpresa(empresaId);
    const datos = objeto(body);
    const fechaInicio = fecha(datos.fechaInicio, 'Fecha de inicio') ?? fechaHoy();
    const fechaFin = fecha(datos.fechaFin, 'Fecha de finalización');
    if (fechaFin && fechaFin < fechaInicio) {
      throw new BadRequestException('La fecha de finalización no puede ser anterior a la fecha de inicio.');
    }

    const nueva = this.campanias.create({
      empresaId,
      nombre: texto(datos.nombre, 'Nombre de campaña', 120, true)!,
      objetivo: opcion(datos.objetivo, OBJETIVOS, 'objetivo', 'generacion_leads'),
      canal: opcion(datos.canal, CANALES, 'canal', 'redes_sociales'),
      presupuestoBs: monto(datos.presupuestoBs, 'Presupuesto').toFixed(2),
      gastoRealBs: monto(datos.gastoRealBs, 'Gasto real').toFixed(2),
      estado: opcion(datos.estado, ESTADOS_CAMPANIA, 'estado', 'planificada'),
      fechaInicio,
      fechaFin,
      descripcion: texto(datos.descripcion, 'Descripción', 5000),
    });
    return this.campanias.save(nueva);
  }

  async actualizarCampania(empresaId: string, campaniaId: string, body: unknown) {
    const campania = await this.buscarCampania(empresaId, campaniaId);
    const datos = objeto(body);
    const permitidos = new Set([
      'nombre', 'objetivo', 'canal', 'presupuestoBs', 'gastoRealBs',
      'estado', 'fechaInicio', 'fechaFin', 'descripcion',
    ]);
    const campos = Object.keys(datos);
    if (campos.length === 0 || campos.some((campo) => !permitidos.has(campo))) {
      throw new BadRequestException('La campaña contiene campos vacíos o no permitidos.');
    }

    if ('nombre' in datos) campania.nombre = texto(datos.nombre, 'Nombre de campaña', 120, true)!;
    if ('objetivo' in datos) campania.objetivo = opcion(datos.objetivo, OBJETIVOS, 'objetivo', 'generacion_leads');
    if ('canal' in datos) campania.canal = opcion(datos.canal, CANALES, 'canal', 'redes_sociales');
    if ('presupuestoBs' in datos) campania.presupuestoBs = monto(datos.presupuestoBs, 'Presupuesto').toFixed(2);
    if ('gastoRealBs' in datos) campania.gastoRealBs = monto(datos.gastoRealBs, 'Gasto real').toFixed(2);
    if ('estado' in datos) campania.estado = opcion(datos.estado, ESTADOS_CAMPANIA, 'estado', 'planificada');
    if ('fechaInicio' in datos) campania.fechaInicio = fecha(datos.fechaInicio, 'Fecha de inicio', true)!;
    if ('fechaFin' in datos) campania.fechaFin = fecha(datos.fechaFin, 'Fecha de finalización');
    if ('descripcion' in datos) campania.descripcion = texto(datos.descripcion, 'Descripción', 5000);
    if (campania.fechaFin && campania.fechaFin < campania.fechaInicio) {
      throw new BadRequestException('La fecha de finalización no puede ser anterior a la fecha de inicio.');
    }
    return this.campanias.save(campania);
  }

  async eliminarCampania(empresaId: string, campaniaId: string) {
    await this.buscarCampania(empresaId, campaniaId);
    await this.campanias.delete({ empresaId, campaniaId });
    return { deleted: true };
  }

  async listarInteracciones(empresaId: string, contactoId: string) {
    await this.buscarContacto(empresaId, contactoId);
    return this.interacciones.find({
      where: { empresaId, contactoId },
      order: { fechaInteraccion: 'DESC' },
      take: 200,
    });
  }

  async crearInteraccion(empresaId: string, contactoId: string, body: unknown) {
    const datos = objeto(body);
    const tipo = opcion(datos.tipo, TIPOS_INTERACCION, 'tipo de interacción', 'whatsapp');
    const resultado = opcion(datos.resultado, RESULTADOS_INTERACCION, 'resultado', 'seguimiento');
    const descripcion = texto(datos.descripcion, 'Descripción', 5000, true)!;
    const proximoSeguimiento = fecha(datos.proximoSeguimiento, 'Próximo seguimiento');

    return this.dataSource.transaction(async (manager) => {
      const contactoRepo = manager.getRepository(MarketingContacto);
      const interaccionRepo = manager.getRepository(MarketingInteraccion);
      const contacto = await contactoRepo.findOne({ where: { empresaId, contactoId } });
      if (!contacto) throw new NotFoundException('El contacto no existe en esta empresa.');

      const interaccion = interaccionRepo.create({
        empresaId,
        contactoId,
        tipo,
        descripcion,
        resultado,
        fechaInteraccion: new Date(),
        proximoSeguimiento,
      });
      const guardada = await interaccionRepo.save(interaccion);

      if (resultado === 'convertido') contacto.estado = 'cliente';
      else if (resultado === 'no_interesado') contacto.estado = 'perdido';
      else if (resultado === 'interesado') contacto.estado = 'interesado';
      else if (contacto.estado === 'nuevo') contacto.estado = 'contactado';
      if (proximoSeguimiento !== null) contacto.proximoSeguimiento = proximoSeguimiento;
      await contactoRepo.save(contacto);

      return guardada;
    });
  }
}
