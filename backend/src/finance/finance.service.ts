import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Empresa } from '../empresas/empresas.entity.js';
import { EtapaCadenaValor } from '../etapas-cadena-valor/etapa-cadena-valor.entity.js';
import { Insumo } from '../insumos/insumo.entity.js';
import { Producto } from '../productos/productos.entity.js';
import { RecetaProductoInsumo } from '../receta-producto-insumos/receta-producto-insumo.entity.js';
import { RegistroDestajo } from '../registros-destajo/registro-destajo.entity.js';
import { RegistroOperativo } from '../registros-operativos/registro-operativo.entity.js';
import { Trabajador } from '../trabajadores/trabajador.entity.js';
import type {
  BreakEvenInputs,
  CashFlowWeek,
  CostBreakdown,
  DestajoRecord,
  FinanceMovementRecord,
  FinanceReport,
  FinanceSummaryRecord,
} from './finance.types.js';
import {
  buildCashFlow,
  mapMovement,
  parsePeriod,
  roundBOB,
  summarize,
  toDbMovementType,
  toNumber,
  validateMovementInput,
} from './finance.utils.js';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(RegistroOperativo)
    private readonly movimientos: Repository<RegistroOperativo>,
    @InjectRepository(Empresa)
    private readonly empresas: Repository<Empresa>,
    @InjectRepository(RegistroDestajo)
    private readonly destajos: Repository<RegistroDestajo>,
    @InjectRepository(Trabajador)
    private readonly trabajadores: Repository<Trabajador>,
    @InjectRepository(Insumo)
    private readonly insumos: Repository<Insumo>,
    @InjectRepository(RecetaProductoInsumo)
    private readonly recetas: Repository<RecetaProductoInsumo>,
    @InjectRepository(EtapaCadenaValor)
    private readonly etapas: Repository<EtapaCadenaValor>,
    @InjectRepository(Producto)
    private readonly productos: Repository<Producto>,
  ) {}

  private async resolveEmpresa(usuarioId: string): Promise<Empresa | null> {
    return this.empresas.findOne({ where: { clienteId: usuarioId } });
  }

  private toDestajoRecord(row: RegistroDestajo, trabajador: string): DestajoRecord {
    return {
      id: row.destajoId,
      trabajador,
      unidades: roundBOB(toNumber(row.cantidadUnidadesEntregadas)),
      montoBs: roundBOB(toNumber(row.montoGanadoBs)),
      pagado: row.pagado === true,
      fecha: row.fechaRegistro?.toISOString().slice(0, 10) ?? '',
    };
  }

  private async readMovements(
    empresaId: string,
    period?: string,
    limit = 500,
  ): Promise<FinanceMovementRecord[]> {
    const range = parsePeriod(period);
    if (!range) throw new BadRequestException('El periodo debe tener formato YYYY-MM');

    const query = this.movimientos
      .createQueryBuilder('movimiento')
      .where('movimiento.empresaId = :empresaId', { empresaId })
      .andWhere('movimiento.fechaOperacion >= :start', { start: range.start })
      .andWhere('movimiento.fechaOperacion < :end', { end: range.end })
      .orderBy('movimiento.fechaOperacion', 'DESC')
      .take(Math.min(Math.max(limit, 1), 500));

    const rows = await query.getMany();
    return rows.map(mapMovement);
  }

  async listMovements(
    usuarioId: string,
    period?: string,
    type?: string,
    nature?: string,
    limit = 500,
  ): Promise<FinanceMovementRecord[]> {
    const empresa = await this.resolveEmpresa(usuarioId);
    if (!empresa) return [];
    const movements = await this.readMovements(empresa.empresaId, period, limit);
    return movements.filter(
      (movement) =>
        (type === undefined || movement.type === type) &&
        (nature === undefined || movement.nature === nature),
    );
  }

  async createMovement(
    usuarioId: string,
    body: unknown,
  ): Promise<FinanceMovementRecord> {
    const input = validateMovementInput(body);
    if (!input) {
      throw new BadRequestException(
        'Movimiento inválido: fecha, tipo, descripción y monto (Bs) son obligatorios',
      );
    }
    const empresa = await this.resolveEmpresa(usuarioId);
    if (!empresa) {
      throw new BadRequestException('El usuario no tiene una empresa asociada para registrar movimientos');
    }

    const row = this.movimientos.create({
      empresaId: empresa.empresaId,
      tipoMovimiento: toDbMovementType(input.type),
      montoBs: input.amount.toFixed(2),
      descripcion: input.description,
      canalOrigen: 'web',
      datosExtraidosIa: { finance: { nature: input.nature, registeredBy: 'techboost-finance' } },
      fechaOperacion: new Date(`${input.date}T12:00:00Z`),
    });
    const saved = await this.movimientos.save(row);
    return mapMovement(saved);
  }

  async getDestajos(usuarioId: string, period?: string): Promise<DestajoRecord[]> {
    const empresa = await this.resolveEmpresa(usuarioId);
    if (!empresa) return [];
    const range = parsePeriod(period);
    if (!range) throw new BadRequestException('El periodo debe tener formato YYYY-MM');

    const workers = await this.trabajadores.find({ where: { empresaId: empresa.empresaId } });
    if (workers.length === 0) return [];
    const workerById = new Map(workers.map((worker) => [worker.trabajadorId, worker.nombreCompleto]));
    const rows = await this.destajos.find({
      where: { trabajadorId: In(workers.map((worker) => worker.trabajadorId)) },
    });

    return rows
      .filter((row) => {
        if (!row.fechaRegistro) return false;
        return row.fechaRegistro >= range.start && row.fechaRegistro < range.end;
      })
      .map((row) =>
        this.toDestajoRecord(row, workerById.get(row.trabajadorId) ?? 'Trabajador'),
      );
  }

  /**
   * Marca un destajo como pagado una sola vez. No crea movimientos ni modifica
   * otros módulos: solo actualiza la columna pagado existente en registros_destajo.
   */
  async payDestajo(
    usuarioId: string,
    destajoId: string,
  ): Promise<{ destajo: DestajoRecord; alreadyPaid: boolean }> {
    const empresa = await this.resolveEmpresa(usuarioId);
    if (!empresa) {
      throw new BadRequestException('El usuario no tiene una empresa asociada');
    }

    const destajo = await this.destajos.findOne({ where: { destajoId } });
    if (!destajo) throw new NotFoundException('Destajo no encontrado');

    const trabajador = await this.trabajadores.findOne({
      where: { trabajadorId: destajo.trabajadorId },
    });
    if (!trabajador || trabajador.empresaId !== empresa.empresaId) {
      throw new NotFoundException('Destajo no encontrado');
    }

    const nombre = trabajador.nombreCompleto;
    if (destajo.pagado === true) {
      return { destajo: this.toDestajoRecord(destajo, nombre), alreadyPaid: true };
    }

    destajo.pagado = true;
    const saved = await this.destajos.save(destajo);
    return { destajo: this.toDestajoRecord(saved, nombre), alreadyPaid: false };
  }

  async getCostBreakdown(usuarioId: string, period?: string): Promise<CostBreakdown> {
    const empresa = await this.resolveEmpresa(usuarioId);
    const movements = empresa ? await this.readMovements(empresa.empresaId, period) : [];
    const totalByType = (type: FinanceMovementRecord['type']) =>
      roundBOB(movements.filter((m) => m.type === type).reduce((sum, m) => sum + m.amount, 0));

    const registered = {
      compraInsumos: totalByType('compra_insumos'),
      gastoOperativo: totalByType('gasto_operativo'),
      pagoDestajo: totalByType('pago_destajo'),
      total: roundBOB(
        movements.filter((m) => m.type !== 'venta').reduce((sum, m) => sum + m.amount, 0),
      ),
    };

    if (!empresa) {
      return {
        registered,
        estimated: {
          materialesPorProducto: [],
          manoObraEstandarBs: 0,
          valorInventarioInsumosBs: 0,
          costoCalculadoProductosBs: 0,
        },
        note: 'Sin empresa asociada: solo se muestran movimientos registrados vacíos.',
      };
    }

    const [productRows, insumoRows, etapaRows] = await Promise.all([
      this.productos.find({ where: { empresaId: empresa.empresaId } }),
      this.insumos.find({ where: { empresaId: empresa.empresaId } }),
      this.etapas.find({ where: { empresaId: empresa.empresaId } }),
    ]);
    const recetaRows = productRows.length
      ? await this.recetas.find({ where: { productoId: In(productRows.map((p) => p.productoId)) } })
      : [];
    const insumoById = new Map(insumoRows.map((insumo) => [insumo.insumoId, insumo]));

    const materialesPorProducto = productRows.map((producto) => ({
      producto: producto.nombre,
      montoBs: roundBOB(
        recetaRows
          .filter((receta) => receta.productoId === producto.productoId)
          .reduce((sum, receta) => {
            const insumo = insumoById.get(receta.insumoId);
            if (!insumo) return sum;
            const merma = toNumber(receta.porcentajeMermaEstimada) / 100;
            return (
              sum +
              toNumber(receta.cantidadRequerida) *
                toNumber(insumo.costoUnitarioPromedioBs) *
                (1 + merma)
            );
          }, 0),
      ),
    }));

    return {
      registered,
      estimated: {
        materialesPorProducto,
        manoObraEstandarBs: roundBOB(
          etapaRows.reduce((sum, etapa) => sum + toNumber(etapa.costoManoObraEstandarBs), 0),
        ),
        valorInventarioInsumosBs: roundBOB(
          insumoRows.reduce(
            (sum, insumo) =>
              sum + toNumber(insumo.stockActual) * toNumber(insumo.costoUnitarioPromedioBs),
            0,
          ),
        ),
        costoCalculadoProductosBs: roundBOB(
          productRows.reduce((sum, producto) => sum + toNumber(producto.costoCalculadoBs), 0),
        ),
      },
      note:
        'Costos registrados = registros_operativos del periodo. Costos estimados = recetas, insumos, etapas y productos. No se suman entre sí.',
    };
  }

  async getOverview(
    usuarioId: string,
    period?: string,
    openingBalance = 0,
  ): Promise<{
    summary: FinanceSummaryRecord;
    cashFlow: CashFlowWeek[];
    destajosPagadosBs: number;
    destajosPendientesBs: number;
    breakEven: BreakEvenInputs;
  }> {
    const movements = await this.listMovements(usuarioId, period);
    const range = parsePeriod(period);
    if (!range) throw new BadRequestException('El periodo debe tener formato YYYY-MM');
    const destajos = await this.getDestajos(usuarioId, range.period);
    const costs = await this.getCostBreakdown(usuarioId, range.period);
    const summary = summarize(movements, openingBalance);
    const empresa = await this.resolveEmpresa(usuarioId);
    const producto = empresa
      ? await this.productos.find({ take: 1, where: { empresaId: empresa.empresaId } })
      : [];

    const materialUnit = costs.estimated.materialesPorProducto[0]?.montoBs ?? 0;
    const laborPerProduct = producto.length
      ? costs.estimated.manoObraEstandarBs / producto.length
      : 0;

    return {
      summary,
      cashFlow: buildCashFlow(movements, range.period),
      destajosPagadosBs: roundBOB(
        destajos.filter((d) => d.pagado).reduce((sum, d) => sum + d.montoBs, 0),
      ),
      destajosPendientesBs: roundBOB(
        destajos.filter((d) => !d.pagado).reduce((sum, d) => sum + d.montoBs, 0),
      ),
      breakEven: {
        fixedCosts: summary.fixedCosts,
        salePrice: roundBOB(toNumber(producto[0]?.precioVentaBs)),
        variableUnitCost: roundBOB(materialUnit + laborPerProduct),
        note:
          'Costos fijos registrados (nature=fijo), precio de venta del primer producto y estimación de materiales + mano de obra estándar por producto.',
      },
    };
  }

  async getReport(usuarioId: string, period?: string, openingBalance = 0): Promise<FinanceReport> {
    const range = parsePeriod(period);
    if (!range) throw new BadRequestException('El periodo debe tener formato YYYY-MM');
    const empresa = await this.resolveEmpresa(usuarioId);
    if (!empresa) {
      throw new NotFoundException('Tu cuenta todavía no tiene una empresa vinculada. Entra a Empresas y registra tu negocio.');
    }
    const movements = await this.listMovements(usuarioId, range.period);
    const overview = await this.getOverview(usuarioId, range.period, openingBalance);
    const destajos = await this.getDestajos(usuarioId, range.period);
    const costs = await this.getCostBreakdown(usuarioId, range.period);

    return {
      period: range.period,
      movements,
      summary: overview.summary,
      cashFlow: overview.cashFlow,
      destajos,
      destajosPagadosBs: overview.destajosPagadosBs,
      destajosPendientesBs: overview.destajosPendientesBs,
      costs,
      breakEven: overview.breakEven,
      limitations: [
        'Todos los importes están expresados en bolivianos (Bs).',
        'El flujo de caja usa exclusivamente registros_operativos; los registros_destajo no se suman para evitar duplicar pagos a destajo.',
        'La clasificación fijo/variable se conserva en datos_extraidos_ia.finance porque el esquema no tiene columna dedicada.',
        'El saldo inicial no existe en la base de datos: se recibe como parámetro y no se persiste.',
        'Los costos estimados (recetas/etapas/insumos) no se suman a los costos registrados.',
      ],
    };
  }
}
