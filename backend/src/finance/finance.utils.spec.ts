import {
  buildCashFlow,
  mapMovement,
  parsePeriod,
  roundBOB,
  summarize,
  validateMovementInput,
  type RawMovement,
} from './finance.utils.js';
import type { FinanceMovementRecord } from './finance.types.js';

const rawMovement = (overrides: Partial<RawMovement> = {}): RawMovement => ({
  registroId: 'r1',
  tipoMovimiento: 'venta',
  montoBs: '100.00',
  descripcion: 'Venta de prueba unitaria',
  datosExtraidosIa: null,
  fechaOperacion: new Date('2026-11-03T12:00:00Z'),
  ...overrides,
});

describe('finance.utils', () => {
  it('valida y normaliza un movimiento nuevo', () => {
    expect(
      validateMovementInput({
        date: '2026-11-25',
        description: '  Compra de cuero  ',
        type: 'compra_insumos',
        amount: '780.456',
      }),
    ).toEqual({
      date: '2026-11-25',
      description: 'Compra de cuero',
      type: 'compra_insumos',
      amount: 780.46,
      nature: 'variable',
    });
  });

  it('rechaza fechas, tipos y montos inválidos', () => {
    expect(validateMovementInput({ date: '25-11-2026', description: 'x', type: 'venta', amount: 1 })).toBeNull();
    expect(validateMovementInput({ date: '2026-11-25', description: 'x', type: 'otro', amount: 1 })).toBeNull();
    expect(validateMovementInput({ date: '2026-11-25', description: 'x', type: 'pago_destajo', amount: 1 })).toBeNull();
    expect(validateMovementInput({ date: '2026-11-25', description: 'x', type: 'venta', amount: 0 })).toBeNull();
    expect(validateMovementInput(null)).toBeNull();
  });

  it('mapea tipos de la base de datos sin inventar columnas', () => {
    const mapped = mapMovement(
      rawMovement({
        tipoMovimiento: 'compra_insumo',
        montoBs: '12.50',
        datosExtraidosIa: { finance: { nature: 'fijo' } },
      }),
    );
    expect(mapped).toMatchObject({
      id: 'r1',
      type: 'compra_insumos',
      amount: 12.5,
      nature: 'variable',
      source: 'registros_operativos',
    });
  });

  it('separa costos fijos, variables y registrados en el resumen', () => {
    const movements: FinanceMovementRecord[] = [
      { id: '1', date: '2026-11-01', description: 'Venta', type: 'venta', amount: 1000, nature: 'no_aplica', source: 'registros_operativos' },
      { id: '2', date: '2026-11-02', description: 'Alquiler', type: 'gasto_operativo', amount: 300, nature: 'fijo', source: 'registros_operativos' },
      { id: '3', date: '2026-11-03', description: 'Insumos', type: 'compra_insumos', amount: 200, nature: 'variable', source: 'registros_operativos' },
      { id: '4', date: '2026-11-04', description: 'Destajo', type: 'pago_destajo', amount: 100, nature: 'variable', source: 'registros_operativos' },
    ];
    expect(summarize(movements, 500)).toEqual({
      income: 1000,
      expenses: 600,
      net: 400,
      fixedCosts: 300,
      variableCosts: 300,
      registeredProductionCosts: 300,
      marginPercent: 40,
      openingBalance: 500,
      cashClosing: 900,
    });
  });

  it('no inventa saldo inicial cuando no se recibe parámetro', () => {
    expect(summarize([])).toEqual({
      income: 0,
      expenses: 0,
      net: 0,
      fixedCosts: 0,
      variableCosts: 0,
      registeredProductionCosts: 0,
      marginPercent: 0,
      openingBalance: 0,
      cashClosing: 0,
    });
    expect(summarize([mapMovement(rawMovement({ montoBs: '75.00' }))])).toMatchObject({
      openingBalance: 0,
      cashClosing: 75,
    });
  });

  it('agrupa el flujo de caja en cuatro semanas del periodo', () => {
    const movements: FinanceMovementRecord[] = [
      { id: '1', date: '2026-11-03', description: 'Venta', type: 'venta', amount: 100, nature: 'no_aplica', source: 'registros_operativos' },
      { id: '2', date: '2026-11-18', description: 'Gasto', type: 'gasto_operativo', amount: 40, nature: 'fijo', source: 'registros_operativos' },
    ];
    expect(buildCashFlow(movements, '2026-11')).toEqual([
      { label: 'Sem. 1', income: 100, expenses: 0 },
      { label: 'Sem. 2', income: 0, expenses: 0 },
      { label: 'Sem. 3', income: 0, expenses: 40 },
      { label: 'Sem. 4', income: 0, expenses: 0 },
    ]);
    expect(buildCashFlow([], '2026-11')).toEqual([
      { label: 'Sem. 1', income: 0, expenses: 0 },
      { label: 'Sem. 2', income: 0, expenses: 0 },
      { label: 'Sem. 3', income: 0, expenses: 0 },
      { label: 'Sem. 4', income: 0, expenses: 0 },
    ]);
  });

  it('valida periodos y redondea importes en bolivianos', () => {
    expect(parsePeriod('2026-11')).toMatchObject({ period: '2026-11' });
    expect(parsePeriod('2026-13')).toBeNull();
    expect(roundBOB(1.005)).toBe(1.01);
  });
});
