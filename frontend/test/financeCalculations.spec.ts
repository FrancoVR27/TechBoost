import {
  calculateBreakEven,
  calculateFinanceSummary,
  calculateLotCost,
} from '../src/services/financeCalculations.ts';
import type { FinanceMovement } from '../src/services/financeGateway.ts';

describe('cálculos financieros del frontend', () => {
  it('calcula el punto de equilibrio con la fórmula acordada', () => {
    expect(calculateBreakEven(100, 50, 25)).toEqual({
      contributionPerUnit: 25,
      units: 4,
      salesAmount: 200,
    });
  });

  it('informa que no puede calcularse cuando el denominador es cero o negativo', () => {
    expect(calculateBreakEven(100, 25, 25)).toEqual({
      contributionPerUnit: 0,
      units: null,
      salesAmount: null,
    });
    expect(calculateBreakEven(100, 20, 25)).toEqual({
      contributionPerUnit: -5,
      units: null,
      salesAmount: null,
    });
  });

  it('acepta costos fijos en cero sin inventar unidades', () => {
    expect(calculateBreakEven(0, 50, 25)).toEqual({
      contributionPerUnit: 25,
      units: 0,
      salesAmount: 0,
    });
  });

  it('devuelve ceros con datos vacíos y separa costos de producción', () => {
    expect(calculateFinanceSummary([])).toEqual({
      income: 0,
      expenses: 0,
      net: 0,
      fixedCosts: 0,
      variableCosts: 0,
      productionCosts: 0,
      marginPercent: 0,
    });

    const movements: FinanceMovement[] = [
      { id: '1', date: '2026-11-01', description: 'Venta', type: 'venta', amount: 100, nature: 'no_aplica' },
      { id: '2', date: '2026-11-02', description: 'Insumos', type: 'compra_insumos', amount: 20, nature: 'variable' },
      { id: '3', date: '2026-11-03', description: 'Alquiler', type: 'gasto_operativo', amount: 30, nature: 'fijo' },
    ];
    expect(calculateFinanceSummary(movements)).toMatchObject({
      fixedCosts: 30,
      variableCosts: 20,
      productionCosts: 20,
    });
  });

  it('estima el costo de lote sin contar mano de obra dos veces', () => {
    const result = calculateLotCost({
      quantity: 10,
      materials: 100,
      labor: 50,
      otherVariable: 20,
      fixedAllocation: 30,
      salePrice: 25,
    });
    expect(result.variableBatchCost).toBe(170);
    expect(result.totalBatchCost).toBe(200);
    expect(result.unitCost).toBe(20);
    expect(result.lotProfit).toBe(50);
  });
});
