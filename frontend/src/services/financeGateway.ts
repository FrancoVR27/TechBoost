export type MovementType = "venta" | "compra_insumos" | "gasto_operativo" | "pago_destajo";
export type CostNature = "fijo" | "variable" | "no_aplica";

export interface FinanceMovement {
  id: string;
  date: string;
  description: string;
  type: MovementType;
  amount: number;
  nature: CostNature;
}

export type NewFinanceMovement = Omit<FinanceMovement, "id">;

export interface FinanceGateway {
  listMovements(): Promise<FinanceMovement[]>;
  createMovement(movement: NewFinanceMovement): Promise<FinanceMovement>;
}

const demoSeed: FinanceMovement[] = [
  { id: "demo-01", date: "2026-11-24", description: "Venta de 12 pares de zapato casual", type: "venta", amount: 1980, nature: "no_aplica" },
  { id: "demo-02", date: "2026-11-21", description: "Entrega de pedido escolar", type: "venta", amount: 1250, nature: "no_aplica" },
  { id: "demo-03", date: "2026-11-18", description: "Compra de cuero para lote", type: "compra_insumos", amount: 780, nature: "variable" },
  { id: "demo-04", date: "2026-11-16", description: "Compra de suelas y plantillas", type: "compra_insumos", amount: 260, nature: "variable" },
  { id: "demo-05", date: "2026-11-01", description: "Alquiler del taller", type: "gasto_operativo", amount: 1800, nature: "fijo" },
  { id: "demo-06", date: "2026-11-20", description: "Consumo eléctrico de producción", type: "gasto_operativo", amount: 240, nature: "variable" },
  { id: "demo-07", date: "2026-11-23", description: "Pago a destajo por aparado", type: "pago_destajo", amount: 360, nature: "variable" },
  { id: "demo-08", date: "2026-11-05", description: "Servicio de internet", type: "gasto_operativo", amount: 160, nature: "fijo" },
];

class InMemoryDemoFinanceGateway implements FinanceGateway {
  private movements = [...demoSeed];
  async listMovements(): Promise<FinanceMovement[]> {
    return this.movements.map((movement) => ({ ...movement }));
  }
  async createMovement(input: NewFinanceMovement): Promise<FinanceMovement> {
    const movement: FinanceMovement = { ...input, id: `demo-${Date.now()}-${Math.random().toString(16).slice(2, 7)}` };
    this.movements = [movement, ...this.movements];
    return { ...movement };
  }
}

/**
 * Datos sintéticos en memoria para demostrar la interfaz. No usa localStorage,
 * no consulta Supabase y no representa información de clientes reales.
 */
export const demoFinanceGateway: FinanceGateway = new InMemoryDemoFinanceGateway();
