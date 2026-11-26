import type { FinanceMovement } from "./financeGateway";

export interface FinanceSummary {
  income: number;
  expenses: number;
  net: number;
  fixedCosts: number;
  variableCosts: number;
  productionCosts: number;
  marginPercent: number;
}

export interface LotCostInput {
  quantity: number;
  materials: number;
  labor: number;
  otherVariable: number;
  fixedAllocation: number;
  salePrice: number;
}

export interface LotCostResult {
  variableBatchCost: number;
  totalBatchCost: number;
  unitCost: number;
  unitProfit: number;
  lotProfit: number;
  marginPercent: number;
}

export interface BreakEvenResult {
  contributionPerUnit: number;
  units: number | null;
  salesAmount: number | null;
}

export function calculateFinanceSummary(movements: FinanceMovement[]): FinanceSummary {
  const income = movements
    .filter((movement) => movement.type === "venta")
    .reduce((total, movement) => total + movement.amount, 0);
  const expenses = movements
    .filter((movement) => movement.type !== "venta")
    .reduce((total, movement) => total + movement.amount, 0);
  const fixedCosts = movements
    .filter((movement) => movement.nature === "fijo")
    .reduce((total, movement) => total + movement.amount, 0);
  const variableCosts = movements
    .filter((movement) => movement.nature === "variable")
    .reduce((total, movement) => total + movement.amount, 0);
  const productionCosts = movements
    .filter((movement) =>
      movement.type === "compra_insumos" ||
      movement.type === "pago_destajo" ||
      (movement.type === "gasto_operativo" && movement.nature === "variable"),
    )
    .reduce((total, movement) => total + movement.amount, 0);

  return {
    income,
    expenses,
    net: income - expenses,
    fixedCosts,
    variableCosts,
    productionCosts,
    marginPercent: income > 0 ? ((income - expenses) / income) * 100 : 0,
  };
}

export function calculateLotCost(input: LotCostInput): LotCostResult {
  const quantity = Math.max(1, Math.floor(input.quantity));
  const variableBatchCost = input.materials + input.labor + input.otherVariable;
  const totalBatchCost = variableBatchCost + input.fixedAllocation;
  const unitCost = totalBatchCost / quantity;
  const unitProfit = input.salePrice - unitCost;

  return {
    variableBatchCost,
    totalBatchCost,
    unitCost,
    unitProfit,
    lotProfit: unitProfit * quantity,
    marginPercent: input.salePrice > 0 ? (unitProfit / input.salePrice) * 100 : 0,
  };
}

export function calculateBreakEven(
  fixedCosts: number,
  salePrice: number,
  variableUnitCost: number,
): BreakEvenResult {
  const contributionPerUnit = salePrice - variableUnitCost;
  if (contributionPerUnit <= 0 || fixedCosts < 0 || salePrice < 0 || variableUnitCost < 0) {
    return { contributionPerUnit, units: null, salesAmount: null };
  }
  const units = Math.ceil(fixedCosts / contributionPerUnit);
  return { contributionPerUnit, units, salesAmount: units * salePrice };
}
