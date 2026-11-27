import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CrudService } from '../common/crud.service.js';
import { Trabajador } from '../trabajadores/trabajador.entity.js';
import { Empresa } from '../empresas/empresas.entity.js';
import { RegistroOperativo } from '../registros-operativos/registro-operativo.entity.js';
import type { RegistrarDestajoDto, FiltrosDestajoDto } from './dto/registrar-destajo.dto.js';
import { RegistroDestajo } from './registro-destajo.entity.js';

@Injectable()
export class RegistrosDestajoService extends CrudService<RegistroDestajo> {
  constructor(
    @InjectRepository(RegistroDestajo)
    repository: Repository<RegistroDestajo>,
    @InjectRepository(Trabajador)
    private readonly trabajadoresRepository: Repository<Trabajador>,
    @InjectRepository(Empresa)
    private readonly empresasRepository: Repository<Empresa>,
    private readonly dataSource: DataSource,
  ) {
    super(repository);
  }

  async registrar(datos: RegistrarDestajoDto, usuarioId: string, rol: string) {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
      throw new BadRequestException('Debes enviar los datos del trabajo realizado');
    }

    const trabajadorId = String(datos.trabajadorId ?? '').trim();
    const fechaTrabajo = String(datos.fechaTrabajo ?? '').trim();
    const descripcionTrabajo = String(datos.descripcionTrabajo ?? '').trim();
    const cantidad = Number(datos.cantidadUnidadesEntregadas);
    const tarifa = Number(datos.tarifaUnitariaBs);

    if (!this.uuidValido(trabajadorId)) {
      throw new BadRequestException('Selecciona un trabajador válido');
    }
    if (!this.fechaValida(fechaTrabajo)) {
      throw new BadRequestException('La fecha de trabajo no es válida');
    }
    if (!descripcionTrabajo || descripcionTrabajo.length > 150) {
      throw new BadRequestException('La descripción debe tener entre 1 y 150 caracteres');
    }
    if (datos.ordenId && !this.uuidValido(String(datos.ordenId))) {
      throw new BadRequestException('La orden de producción no es válida');
    }
    if (datos.etapaId && !this.uuidValido(String(datos.etapaId))) {
      throw new BadRequestException('La etapa de trabajo no es válida');
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0 || cantidad > 99999999.99) {
      throw new BadRequestException('La cantidad debe ser mayor que cero');
    }
    if (!Number.isFinite(tarifa) || tarifa <= 0 || tarifa > 99999999.99) {
      throw new BadRequestException('La tarifa por unidad debe ser mayor que cero');
    }

    const cantidadRedondeada = Number(cantidad.toFixed(2));
    const tarifaRedondeada = Number(tarifa.toFixed(2));
    const montoGanado = Number((cantidadRedondeada * tarifaRedondeada).toFixed(2));

    if (!Number.isFinite(montoGanado) || montoGanado <= 0 || montoGanado > 99999999.99) {
      throw new BadRequestException('El importe calculado está fuera del rango permitido');
    }

    const trabajador = await this.trabajadoresRepository.findOneBy({ trabajadorId });
    if (!trabajador) {
      throw new NotFoundException('El trabajador seleccionado no existe');
    }
    await this.verificarAccesoEmpresa(trabajador.empresaId, usuarioId, rol);
    if (trabajador.activo !== true) {
      throw new BadRequestException('No se puede registrar producción a un trabajador inactivo');
    }
    if (!['destajo', 'mixto'].includes(trabajador.modalidadPago)) {
      throw new BadRequestException('El trabajador debe tener modalidad destajo o mixto');
    }

    const registro = this.repository.create({
      trabajadorId,
      ordenId: datos.ordenId || null,
      etapaId: datos.etapaId || null,
      fechaTrabajo,
      descripcionTrabajo,
      cantidadUnidadesEntregadas: cantidadRedondeada.toFixed(2),
      tarifaUnitariaBs: tarifaRedondeada.toFixed(2),
      montoGanadoBs: montoGanado.toFixed(2),
      pagado: false,
      fechaPago: null,
    });

    return this.repository.save(registro);
  }

  async listar(filtros: FiltrosDestajoDto, usuarioId: string, rol: string) {
    const empresaId = await this.empresaAutorizada(filtros.empresaId, usuarioId, rol);
    const filtrosAutorizados = { ...filtros, empresaId };
    this.validarFiltros(filtrosAutorizados);

    const query = this.repository
      .createQueryBuilder('registro')
      .innerJoin(
        'trabajadores',
        'trabajador',
        'trabajador.trabajador_id = registro.trabajador_id',
      )
      .select('registro.destajoId', 'destajoId')
      .addSelect('registro.trabajadorId', 'trabajadorId')
      .addSelect('trabajador.nombre_completo', 'trabajadorNombre')
      .addSelect('trabajador.empresa_id', 'empresaId')
      .addSelect('registro.fechaTrabajo', 'fechaTrabajo')
      .addSelect('registro.descripcionTrabajo', 'descripcionTrabajo')
      .addSelect('registro.cantidadUnidadesEntregadas', 'cantidadUnidadesEntregadas')
      .addSelect('registro.tarifaUnitariaBs', 'tarifaUnitariaBs')
      .addSelect('registro.montoGanadoBs', 'montoGanadoBs')
      .addSelect('registro.pagado', 'pagado')
      .addSelect('registro.fechaPago', 'fechaPago')
      .addSelect('registro.fechaRegistro', 'fechaRegistro')
      .where('trabajador.empresa_id = :empresaId', { empresaId });

    if (filtrosAutorizados.trabajadorId) {
      query.andWhere('registro.trabajadorId = :trabajadorId', {
        trabajadorId: filtrosAutorizados.trabajadorId,
      });
    }
    if (filtrosAutorizados.desde) {
      query.andWhere('registro.fechaTrabajo >= :desde', {
        desde: filtrosAutorizados.desde,
      });
    }
    if (filtrosAutorizados.hasta) {
      query.andWhere('registro.fechaTrabajo <= :hasta', {
        hasta: filtrosAutorizados.hasta,
      });
    }
    if (filtrosAutorizados.pagado === 'true') {
      query.andWhere('registro.pagado = TRUE');
    } else if (filtrosAutorizados.pagado === 'false') {
      query.andWhere('registro.pagado = FALSE');
    }

    const filas = await query
      .orderBy('registro.fechaTrabajo', 'DESC')
      .addOrderBy('registro.fechaRegistro', 'DESC')
      .take(300)
      .getRawMany<Record<string, unknown>>();

    return filas.map((fila) => ({
      destajoId: String(fila.destajoId),
      trabajadorId: String(fila.trabajadorId),
      trabajadorNombre: String(fila.trabajadorNombre),
      empresaId: String(fila.empresaId),
      fechaTrabajo: String(fila.fechaTrabajo).substring(0, 10),
      descripcionTrabajo: String(fila.descripcionTrabajo),
      cantidadUnidadesEntregadas: Number(fila.cantidadUnidadesEntregadas),
      tarifaUnitariaBs: Number(fila.tarifaUnitariaBs),
      montoGanadoBs: Number(fila.montoGanadoBs),
      pagado: fila.pagado === true,
      fechaPago: fila.fechaPago ?? null,
      fechaRegistro: fila.fechaRegistro ?? null,
    }));
  }

  async resumen(empresaIdSolicitada: string, desde: string | undefined, hasta: string | undefined, usuarioId: string, rol: string) {
    const empresaId = await this.empresaAutorizada(empresaIdSolicitada, usuarioId, rol);
    if (desde && !this.fechaValida(desde)) {
      throw new BadRequestException('La fecha inicial no es válida');
    }
    if (hasta && !this.fechaValida(hasta)) {
      throw new BadRequestException('La fecha final no es válida');
    }
    if (desde && hasta && desde > hasta) {
      throw new BadRequestException('La fecha inicial no puede ser posterior a la fecha final');
    }

    const query = this.repository
      .createQueryBuilder('registro')
      .innerJoin(
        'trabajadores',
        'trabajador',
        'trabajador.trabajador_id = registro.trabajador_id',
      )
      .select('registro.trabajadorId', 'trabajadorId')
      .addSelect('trabajador.nombre_completo', 'trabajadorNombre')
      .addSelect('COUNT(registro.destajoId)', 'cantidadRegistros')
      .addSelect('COALESCE(SUM(registro.cantidadUnidadesEntregadas), 0)', 'unidadesEntregadas')
      .addSelect('COALESCE(SUM(registro.montoGanadoBs), 0)', 'montoGeneradoBs')
      .addSelect(
        'COALESCE(SUM(CASE WHEN registro.pagado = TRUE THEN registro.montoGanadoBs ELSE 0 END), 0)',
        'montoPagadoBs',
      )
      .addSelect(
        'COALESCE(SUM(CASE WHEN registro.pagado = FALSE THEN registro.montoGanadoBs ELSE 0 END), 0)',
        'montoPendienteBs',
      )
      .where('trabajador.empresa_id = :empresaId', { empresaId });

    if (desde) {
      query.andWhere('registro.fechaTrabajo >= :desde', { desde });
    }
    if (hasta) {
      query.andWhere('registro.fechaTrabajo <= :hasta', { hasta });
    }

    const filas = await query
      .groupBy('registro.trabajadorId')
      .addGroupBy('trabajador.nombre_completo')
      .orderBy('trabajador.nombre_completo', 'ASC')
      .getRawMany<Record<string, unknown>>();

    const trabajadores = filas.map((fila) => ({
      trabajadorId: String(fila.trabajadorId),
      trabajadorNombre: String(fila.trabajadorNombre),
      cantidadRegistros: Number(fila.cantidadRegistros),
      unidadesEntregadas: Number(fila.unidadesEntregadas),
      montoGeneradoBs: Number(Number(fila.montoGeneradoBs).toFixed(2)),
      montoPagadoBs: Number(Number(fila.montoPagadoBs).toFixed(2)),
      montoPendienteBs: Number(Number(fila.montoPendienteBs).toFixed(2)),
    }));

    const totales = trabajadores.reduce(
      (acumulado, trabajador) => ({
        cantidadRegistros: acumulado.cantidadRegistros + trabajador.cantidadRegistros,
        unidadesEntregadas: acumulado.unidadesEntregadas + trabajador.unidadesEntregadas,
        montoGeneradoBs: Number((acumulado.montoGeneradoBs + trabajador.montoGeneradoBs).toFixed(2)),
        montoPagadoBs: Number((acumulado.montoPagadoBs + trabajador.montoPagadoBs).toFixed(2)),
        montoPendienteBs: Number((acumulado.montoPendienteBs + trabajador.montoPendienteBs).toFixed(2)),
      }),
      {
        cantidadRegistros: 0,
        unidadesEntregadas: 0,
        montoGeneradoBs: 0,
        montoPagadoBs: 0,
        montoPendienteBs: 0,
      },
    );

    return { totales, trabajadores };
  }

  async marcarPagado(destajoId: string, usuarioId: string, rol: string) {
    if (!this.uuidValido(destajoId)) {
      throw new BadRequestException('El identificador del registro no es válido');
    }

    return this.dataSource.transaction(async (manager) => {
      const registrosRepository = manager.getRepository(RegistroDestajo);
      const trabajadoresRepository = manager.getRepository(Trabajador);
      const operacionesRepository = manager.getRepository(RegistroOperativo);

      const registro = await registrosRepository.findOne({
        where: { destajoId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!registro) {
        throw new NotFoundException('El registro de destajo no existe');
      }
      if (registro.pagado) {
        throw new ConflictException('Este registro ya fue marcado como pagado');
      }

      const trabajador = await trabajadoresRepository.findOneBy({
        trabajadorId: registro.trabajadorId,
      });
      if (!trabajador) {
        throw new NotFoundException('No se encontró el trabajador asociado');
      }
      await this.verificarAccesoEmpresa(trabajador.empresaId, usuarioId, rol);

      registro.pagado = true;
      registro.fechaPago = new Date();
      await registrosRepository.save(registro);

      // El pago también alimenta el registro operativo de la empresa.
      await operacionesRepository.save(
        operacionesRepository.create({
          empresaId: trabajador.empresaId,
          tipoMovimiento: 'pago_destajo',
          montoBs: registro.montoGanadoBs,
          descripcion: `Pago a ${trabajador.nombreCompleto}: ${registro.descripcionTrabajo}`,
          canalOrigen: 'web',
          datosExtraidosIa: {
            destajoId: registro.destajoId,
            trabajadorId: trabajador.trabajadorId,
            fechaTrabajo: registro.fechaTrabajo,
          },
        }),
      );

      return registro;
    });
  }

  private async empresaAutorizada(empresaSolicitada: string, usuarioId: string, rol: string): Promise<string> {
    if (rol === 'Admin') {
      if (!this.uuidValido(empresaSolicitada)) {
        throw new BadRequestException('Selecciona una empresa válida');
      }
      const empresa = await this.empresasRepository.findOneBy({ empresaId: empresaSolicitada });
      if (!empresa) throw new NotFoundException('La empresa seleccionada no existe');
      return empresa.empresaId;
    }

    const empresa = await this.empresasRepository.findOneBy({ clienteId: usuarioId });
    if (!empresa) throw new NotFoundException('Tu cuenta todavía no tiene una empresa vinculada. Regístrala en Empresas.');
    return empresa.empresaId;
  }

  private async verificarAccesoEmpresa(empresaId: string, usuarioId: string, rol: string): Promise<void> {
    if (rol === 'Admin') return;
    const empresa = await this.empresasRepository.findOneBy({ clienteId: usuarioId });
    if (!empresa || empresa.empresaId !== empresaId) {
      throw new NotFoundException('El registro no existe en tu empresa.');
    }
  }

  private validarFiltros(filtros: FiltrosDestajoDto) {
    if (!this.uuidValido(filtros.empresaId)) {
      throw new BadRequestException('Selecciona una empresa válida');
    }
    if (filtros.trabajadorId && !this.uuidValido(filtros.trabajadorId)) {
      throw new BadRequestException('El trabajador seleccionado no es válido');
    }
    if (filtros.desde && !this.fechaValida(filtros.desde)) {
      throw new BadRequestException('La fecha inicial no es válida');
    }
    if (filtros.hasta && !this.fechaValida(filtros.hasta)) {
      throw new BadRequestException('La fecha final no es válida');
    }
    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      throw new BadRequestException('La fecha inicial no puede ser posterior a la fecha final');
    }
    if (filtros.pagado && !['true', 'false'].includes(filtros.pagado)) {
      throw new BadRequestException('El filtro de pago no es válido');
    }
  }

  private uuidValido(valor: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valor);
  }

  private fechaValida(valor: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const fecha = new Date(`${valor}T00:00:00.000Z`);
    return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
  }
}
