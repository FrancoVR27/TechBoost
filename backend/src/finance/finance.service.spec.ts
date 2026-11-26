import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FinanceService } from './finance.service.js';

const empresa = { empresaId: 'e1', clienteId: 'u1' };
const trabajador = { trabajadorId: 't1', empresaId: 'e1', nombreCompleto: 'Ana' };

function queryBuilder(rows: unknown[] = []) {
  const builder = {
    where: vi.fn(() => builder),
    andWhere: vi.fn(() => builder),
    orderBy: vi.fn(() => builder),
    take: vi.fn(() => builder),
    getMany: vi.fn(async () => rows),
  };
  return builder;
}

function buildService(options: { withEmpresa?: boolean; movements?: unknown[] } = {}) {
  const withEmpresa = options.withEmpresa !== false;
  const movimientos = {
    createQueryBuilder: vi.fn(() => queryBuilder(options.movements ?? [])),
    create: vi.fn((row) => row),
    save: vi.fn(async (row) => ({ ...row, registroId: 'r9' })),
  };
  const empresas = { findOne: vi.fn(async () => (withEmpresa ? empresa : null)) };
  const destajos = {
    findOne: vi.fn(async () => ({
      destajoId: 'd1',
      trabajadorId: 't1',
      cantidadUnidadesEntregadas: '10.00',
      montoGanadoBs: '100.00',
      pagado: false,
      fechaRegistro: new Date('2026-11-10T12:00:00Z'),
    })),
    find: vi.fn(async () => []),
    save: vi.fn(async (row) => row),
  };
  const trabajadores = { findOne: vi.fn(async () => trabajador), find: vi.fn(async () => [trabajador]) };
  const insumos = { find: vi.fn(async () => []) };
  const recetas = { find: vi.fn(async () => []) };
  const etapas = { find: vi.fn(async () => []) };
  const productos = { find: vi.fn(async () => []) };

  const service = new FinanceService(
    movimientos as never,
    empresas as never,
    destajos as never,
    trabajadores as never,
    insumos as never,
    recetas as never,
    etapas as never,
    productos as never,
  );
  return { service, movimientos, empresas, destajos, trabajadores, insumos, recetas, etapas, productos };
}

describe('FinanceService.createMovement', () => {
  it('persiste en registros_operativos usando las columnas reales', async () => {
    const { service, movimientos } = buildService();
    const result = await service.createMovement('u1', {
      date: '2026-11-25',
      description: '  Compra de cuero  ',
      type: 'compra_insumos',
      amount: 12.5,
    });

    expect(movimientos.save).toHaveBeenCalledTimes(1);
    expect(movimientos.save).toHaveBeenCalledWith(
      expect.objectContaining({
        empresaId: 'e1',
        tipoMovimiento: 'compra_insumo',
        montoBs: '12.50',
        descripcion: 'Compra de cuero',
        canalOrigen: 'web',
        datosExtraidosIa: {
          finance: { nature: 'variable', registeredBy: 'techboost-finance' },
        },
      }),
    );
    expect(result).toMatchObject({
      id: 'r9',
      type: 'compra_insumos',
      amount: 12.5,
      nature: 'variable',
      source: 'registros_operativos',
    });
  });

  it('no escribe cuando el usuario no tiene empresa asociada', async () => {
    const { service, movimientos } = buildService({ withEmpresa: false });

    await expect(
      service.createMovement('u1', {
        date: '2026-11-25',
        description: 'Movimiento',
        type: 'venta',
        amount: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(movimientos.save).not.toHaveBeenCalled();
  });
});

describe('FinanceService.payDestajo', () => {
  it('marca el destajo como pagado una sola vez', async () => {
    const { service, destajos } = buildService();
    const result = await service.payDestajo('u1', 'd1');

    expect(result.alreadyPaid).toBe(false);
    expect(result.destajo.pagado).toBe(true);
    expect(destajos.save).toHaveBeenCalledTimes(1);
  });

  it('no vuelve a pagar un destajo ya pagado', async () => {
    const { service, destajos } = buildService();
    vi.spyOn(destajos, 'findOne').mockResolvedValue({
      destajoId: 'd1',
      trabajadorId: 't1',
      cantidadUnidadesEntregadas: '10.00',
      montoGanadoBs: '100.00',
      pagado: true,
      fechaRegistro: new Date('2026-11-10T12:00:00Z'),
    });

    const result = await service.payDestajo('u1', 'd1');

    expect(result.alreadyPaid).toBe(true);
    expect(result.destajo.pagado).toBe(true);
    expect(destajos.save).not.toHaveBeenCalled();
  });

  it('rechaza un destajo inexistente sin escribir', async () => {
    const { service, destajos } = buildService();
    vi.spyOn(destajos, 'findOne').mockResolvedValue(null);

    await expect(service.payDestajo('u1', 'inexistente')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(destajos.save).not.toHaveBeenCalled();
  });

  it('rechaza un destajo de otra empresa sin escribir', async () => {
    const { service, destajos, trabajadores } = buildService();
    vi.spyOn(trabajadores, 'findOne').mockResolvedValue({
      ...trabajador,
      empresaId: 'otra',
    });

    await expect(service.payDestajo('u1', 'd1')).rejects.toBeInstanceOf(NotFoundException);
    expect(destajos.save).not.toHaveBeenCalled();
  });

  it('no escribe cuando el usuario no tiene empresa asociada', async () => {
    const { service, destajos } = buildService({ withEmpresa: false });

    await expect(service.payDestajo('u1', 'd1')).rejects.toBeInstanceOf(BadRequestException);
    expect(destajos.save).not.toHaveBeenCalled();
  });
});

describe('FinanceService.getCostBreakdown', () => {
  it('separa costos registrados de estimados y calcula materiales con merma', async () => {
    const movements = [
      {
        registroId: 'm1',
        tipoMovimiento: 'compra_insumo',
        montoBs: '40.00',
        descripcion: 'Insumos',
        datosExtraidosIa: null,
        fechaOperacion: new Date('2026-11-03T12:00:00Z'),
      },
      {
        registroId: 'm2',
        tipoMovimiento: 'gasto_operativo',
        montoBs: '60.00',
        descripcion: 'Alquiler',
        datosExtraidosIa: { finance: { nature: 'fijo' } },
        fechaOperacion: new Date('2026-11-05T12:00:00Z'),
      },
      {
        registroId: 'm3',
        tipoMovimiento: 'pago_destajo',
        montoBs: '15.00',
        descripcion: 'Destajo',
        datosExtraidosIa: null,
        fechaOperacion: new Date('2026-11-08T12:00:00Z'),
      },
      {
        registroId: 'm4',
        tipoMovimiento: 'venta',
        montoBs: '200.00',
        descripcion: 'Venta',
        datosExtraidosIa: null,
        fechaOperacion: new Date('2026-11-10T12:00:00Z'),
      },
    ];
    const { service, insumos, recetas, etapas, productos } = buildService({ movements });

    vi.spyOn(insumos, 'find').mockResolvedValue([
      { insumoId: 'i1', costoUnitarioPromedioBs: '10.00', stockActual: '5.00' },
    ]);
    vi.spyOn(productos, 'find').mockResolvedValue([
      { productoId: 'p1', nombre: 'Producto A', costoCalculadoBs: '100.00' },
      { productoId: 'p2', nombre: 'Producto B', costoCalculadoBs: '50.00' },
    ]);
    vi.spyOn(recetas, 'find').mockResolvedValue([
      { productoId: 'p1', insumoId: 'i1', cantidadRequerida: '2', porcentajeMermaEstimada: '10' },
      { productoId: 'p2', insumoId: 'i1', cantidadRequerida: '1', porcentajeMermaEstimada: '0' },
    ]);
    vi.spyOn(etapas, 'find').mockResolvedValue([
      { costoManoObraEstandarBs: '30.00' },
      { costoManoObraEstandarBs: '20.00' },
    ]);

    const result = await service.getCostBreakdown('u1', '2026-11');

    expect(result.registered).toEqual({
      compraInsumos: 40,
      gastoOperativo: 60,
      pagoDestajo: 15,
      total: 115,
    });
    expect(result.estimated.materialesPorProducto).toEqual([
      { producto: 'Producto A', montoBs: 22 },
      { producto: 'Producto B', montoBs: 10 },
    ]);
    // La mano de obra estándar se cuenta una sola vez desde etapas; el destajo
    // registrado permanece en `registered` y no se suma a esta estimación.
    expect(result.estimated.manoObraEstandarBs).toBe(50);
    expect(result.estimated.valorInventarioInsumosBs).toBe(50);
    expect(result.estimated.costoCalculadoProductosBs).toBe(150);
    expect(result.note).toContain('No se suman entre sí');
  });
});

describe('FinanceService.getOverview', () => {
  it('deriva el punto de equilibrio de costos fijos, precio y estimación reales', async () => {
    const { service, productos } = buildService();
    vi.spyOn(service, 'listMovements').mockResolvedValue([
      {
        id: 'v1',
        date: '2026-11-02',
        description: 'Venta',
        type: 'venta',
        amount: 200,
        nature: 'no_aplica',
        source: 'registros_operativos',
      },
      {
        id: 'g1',
        date: '2026-11-03',
        description: 'Alquiler',
        type: 'gasto_operativo',
        amount: 100,
        nature: 'fijo',
        source: 'registros_operativos',
      },
    ]);
    vi.spyOn(service, 'getDestajos').mockResolvedValue([]);
    vi.spyOn(service, 'getCostBreakdown').mockResolvedValue({
      registered: { compraInsumos: 0, gastoOperativo: 100, pagoDestajo: 0, total: 100 },
      estimated: {
        materialesPorProducto: [{ producto: 'Producto A', montoBs: 20 }],
        manoObraEstandarBs: 10,
        valorInventarioInsumosBs: 0,
        costoCalculadoProductosBs: 30,
      },
      note: 'separados',
    });
    vi.spyOn(productos, 'find').mockResolvedValue([{ precioVentaBs: '50.00' }]);

    const result = await service.getOverview('u1', '2026-11');

    expect(result.breakEven).toMatchObject({
      fixedCosts: 100,
      salePrice: 50,
      variableUnitCost: 30,
    });
  });
});
