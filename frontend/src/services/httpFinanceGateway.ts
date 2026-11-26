import { apiFetch } from "../api.ts";
import type {
  CostNature,
  FinanceGateway,
  FinanceMovement,
  MovementType,
  NewFinanceMovement,
} from "./financeGateway.ts";

export interface FinanceSummary {
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
  movements: FinanceMovement[];
  summary: FinanceSummary;
  cashFlow: CashFlowWeek[];
  destajos: DestajoRecord[];
  destajosPagadosBs: number;
  destajosPendientesBs: number;
  costs: CostBreakdown;
  breakEven: BreakEvenInputs;
  limitations: string[];
}

export interface FinanceReportGateway extends FinanceGateway {
  listMovements(period?: string): Promise<FinanceMovement[]>;
  getReport(period?: string, openingBalance?: number): Promise<FinanceReport>;
  payDestajo(id: string): Promise<{ destajo: DestajoRecord; alreadyPaid: boolean }>;
}

type RawMovement = FinanceMovement & { source?: string };

function buildQuery(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

function mapMovement(raw: RawMovement): FinanceMovement {
  return {
    id: String(raw.id),
    date: String(raw.date ?? ""),
    description: String(raw.description ?? ""),
    type: raw.type as MovementType,
    amount: Number(raw.amount ?? 0),
    nature: raw.nature as CostNature,
  };
}

export function financeErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "No se pudo completar la operación financiera";
}

/**
 * Implementación HTTP de FinanceGateway. No contiene datos de ejemplo: todo
 * procede de los endpoints autenticados del backend.
 */
export class HttpFinanceGateway implements FinanceReportGateway {
  async listMovements(period?: string): Promise<FinanceMovement[]> {
    const response = await apiFetch<{ items: RawMovement[] }>(
      `/finance/movements${buildQuery({ period })}`,
    );
    return (response.items ?? []).map(mapMovement);
  }

  async createMovement(movement: NewFinanceMovement): Promise<FinanceMovement> {
    const response = await apiFetch<RawMovement>("/finance/movements", {
      method: "POST",
      body: movement,
    });
    return mapMovement(response);
  }

  async getReport(period?: string, openingBalance = 0): Promise<FinanceReport> {
    return apiFetch<FinanceReport>(
      `/finance/report${buildQuery({ period, openingBalance })}`,
    );
  }

  async payDestajo(
    id: string,
  ): Promise<{ destajo: DestajoRecord; alreadyPaid: boolean }> {
    return apiFetch(`/finance/destajos/${encodeURIComponent(id)}/pay`, {
      method: "PATCH",
    });
  }
}

export const httpFinanceGateway: FinanceReportGateway = new HttpFinanceGateway();
