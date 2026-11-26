export type MovementType =
  | 'venta'
  | 'compra_insumos'
  | 'gasto_operativo'
  | 'pago_destajo';

export type CostNature = 'fijo' | 'variable' | 'no_aplica';

export interface FinanceMovementRecord {
  id: string;
  date: string;
  description: string;
  type: MovementType;
  amount: number;
  nature: CostNature;
  source: 'registros_operativos';
}

export interface CreateMovementInput {
  date: string;
  description: string;
  type: MovementType;
  amount: number;
  nature: CostNature;
}

export interface FinanceSummaryRecord {
  income: number;
  expenses: number;
  net: number;
  fixedCosts: number;
  variableCosts: number;
  registeredProductionCosts: number;
  marginPercent: number;
  openingBalance: number;
  cashClosing: number;
}

export interface CashFlowWeek {
  label: string;
  income: number;
  expenses: number;
}

export interface DestajoRecord {
  id: string;
  trabajador: string;
  unidades: number;
  montoBs: number;
  pagado: boolean;
  fecha: string;
}

export interface RegisteredCosts {
  compraInsumos: number;
  gastoOperativo: number;
  pagoDestajo: number;
  total: number;
}

export interface EstimatedCosts {
  materialesPorProducto: { producto: string; montoBs: number }[];
  manoObraEstandarBs: number;
  valorInventarioInsumosBs: number;
  costoCalculadoProductosBs: number;
}

export interface CostBreakdown {
  registered: RegisteredCosts;
  estimated: EstimatedCosts;
  note: string;
}

export interface BreakEvenInputs {
  fixedCosts: number;
  salePrice: number;
  variableUnitCost: number;
  note: string;
}

export interface FinanceReport {
  period: string;
  movements: FinanceMovementRecord[];
  summary: FinanceSummaryRecord;
  cashFlow: CashFlowWeek[];
  destajos: DestajoRecord[];
  destajosPagadosBs: number;
  destajosPendientesBs: number;
  costs: CostBreakdown;
  breakEven: BreakEvenInputs;
  limitations: string[];
}
