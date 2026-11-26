import type {
  CashFlowWeek,
  CostNature,
  CreateMovementInput,
  FinanceMovementRecord,
  FinanceSummaryRecord,
  MovementType,
} from './finance.types.js';

export interface RawMovement {
  registroId: string;
  tipoMovimiento: string;
  montoBs: string;
  descripcion: string | null;
  datosExtraidosIa: Record<string, unknown> | null;
  fechaOperacion: Date | null;
}

const DB_TO_MOVEMENT: Record<string, MovementType> = {
  venta: 'venta',
  compra_insumo: 'compra_insumos',
  gasto_operativo: 'gasto_operativo',
  pago_destajo: 'pago_destajo',
};

const MOVEMENT_TO_DB: Record<MovementType, string> = {
  venta: 'venta',
  compra_insumos: 'compra_insumo',
  gasto_operativo: 'gasto_operativo',
  pago_destajo: 'pago_destajo',
};

const MOVEMENT_TYPES = Object.keys(MOVEMENT_TO_DB) as MovementType[];
const CREATABLE_TYPES: MovementType[] = ['venta', 'compra_insumos', 'gasto_operativo'];
const NATURES: CostNature[] = ['fijo', 'variable', 'no_aplica'];
const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function toMovementType(value: string): MovementType {
  return DB_TO_MOVEMENT[value] ?? 'gasto_operativo';
}

export function toDbMovementType(value: MovementType): string {
  return MOVEMENT_TO_DB[value];
}

export function isMovementType(value: unknown): value is MovementType {
  return typeof value === 'string' && MOVEMENT_TYPES.includes(value as MovementType);
}

/** Los pagos a destajo se leen de registros_destajo; registrarlos aquí los duplicaría. */
export function isCreatableMovementType(value: unknown): value is MovementType {
  return typeof value === 'string' && CREATABLE_TYPES.includes(value as MovementType);
}

export function isCostNature(value: unknown): value is CostNature {
  return typeof value === 'string' && NATURES.includes(value as CostNature);
}

export function normalizeNature(type: MovementType, nature: unknown): CostNature {
  if (type === 'venta') return 'no_aplica';
  if (type === 'compra_insumos' || type === 'pago_destajo') return 'variable';
  return nature === 'fijo' || nature === 'variable' ? nature : 'fijo';
}

export function roundBOB(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parsePeriod(period: string | undefined, now = new Date()): { period: string; start: Date; end: Date } | null {
  const resolved = period?.trim() || `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  if (!PERIOD_REGEX.test(resolved)) return null;
  const [year, month] = resolved.split('-').map(Number);
  return {
    period: resolved,
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateMovementInput(body: unknown): CreateMovementInput | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  if (!isValidDate(input.date)) return null;
  if (!isCreatableMovementType(input.type)) return null;
  if (input.description !== undefined && typeof input.description !== 'string') return null;
  const description = (input.description as string | undefined)?.trim() ?? '';
  if (!description || description.length > 500) return null;
  const amount = toNumber(input.amount as string | number | undefined);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) return null;
  if (input.nature !== undefined && !isCostNature(input.nature)) return null;
  return {
    date: input.date,
    description,
    type: input.type,
    amount: roundBOB(amount),
    nature: normalizeNature(input.type, input.nature),
  };
}

function extractNature(row: RawMovement): CostNature {
  const meta = row.datosExtraidosIa?.finance;
  if (meta && typeof meta === 'object' && 'nature' in meta) {
    const nature = (meta as { nature: unknown }).nature;
    if (isCostNature(nature)) return normalizeNature(toMovementType(row.tipoMovimiento), nature);
  }
  return normalizeNature(toMovementType(row.tipoMovimiento), undefined);
}

export function mapMovement(row: RawMovement): FinanceMovementRecord {
  const date = row.fechaOperacion ? row.fechaOperacion.toISOString().slice(0, 10) : '';
  return {
    id: row.registroId,
    date,
    description: row.descripcion ?? '',
    type: toMovementType(row.tipoMovimiento),
    amount: roundBOB(toNumber(row.montoBs)),
    nature: extractNature(row),
    source: 'registros_operativos',
  };
}

export function summarize(
  movements: FinanceMovementRecord[],
  openingBalance = 0,
): FinanceSummaryRecord {
  const income = roundBOB(
    movements.filter((m) => m.type === 'venta').reduce((total, m) => total + m.amount, 0),
  );
  const expenses = roundBOB(
    movements.filter((m) => m.type !== 'venta').reduce((total, m) => total + m.amount, 0),
  );
  const fixedCosts = roundBOB(
    movements.filter((m) => m.nature === 'fijo').reduce((total, m) => total + m.amount, 0),
  );
  const variableCosts = roundBOB(
    movements.filter((m) => m.nature === 'variable').reduce((total, m) => total + m.amount, 0),
  );
  const registeredProductionCosts = roundBOB(
    movements
      .filter(
        (m) =>
          m.type === 'compra_insumos' ||
          m.type === 'pago_destajo' ||
          (m.type === 'gasto_operativo' && m.nature === 'variable'),
      )
      .reduce((total, m) => total + m.amount, 0),
  );
  return {
    income,
    expenses,
    net: roundBOB(income - expenses),
    fixedCosts,
    variableCosts,
    registeredProductionCosts,
    marginPercent: income > 0 ? roundBOB(((income - expenses) / income) * 100) : 0,
    openingBalance: roundBOB(openingBalance),
    cashClosing: roundBOB(openingBalance + income - expenses),
  };
}

export function weekOfMonth(date: string): number {
  const day = Number(date.slice(8, 10));
  if (!Number.isFinite(day)) return 4;
  return day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : 4;
}

export function buildCashFlow(
  movements: FinanceMovementRecord[],
  period: string,
): CashFlowWeek[] {
  return [1, 2, 3, 4].map((week) => {
    const group = movements.filter((m) => m.date.startsWith(period) && weekOfMonth(m.date) === week);
    return {
      label: `Sem. ${week}`,
      income: roundBOB(group.filter((m) => m.type === 'venta').reduce((total, m) => total + m.amount, 0)),
      expenses: roundBOB(group.filter((m) => m.type !== 'venta').reduce((total, m) => total + m.amount, 0)),
    };
  });
}
