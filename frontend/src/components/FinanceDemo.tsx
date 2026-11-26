import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import {
  demoFinanceGateway,
  type CostNature,
  type FinanceGateway,
  type FinanceMovement,
  type MovementType,
} from "../services/financeGateway";
import { calculateBreakEven, calculateFinanceSummary, calculateLotCost } from "../services/financeCalculations";

const money = (value: number) =>
  new Intl.NumberFormat("es-BO", { style: "currency", currency: "BOB", maximumFractionDigits: 2 }).format(value);

const movementNames: Record<MovementType, string> = {
  venta: "Venta",
  compra_insumos: "Compra de insumos",
  gasto_operativo: "Gasto operativo",
  pago_destajo: "Pago a destajo",
};

const natureNames: Record<CostNature, string> = {
  fijo: "Fijo",
  variable: "Variable",
  no_aplica: "No aplica",
};

function sum(items: FinanceMovement[]) {
  return items.reduce((total, item) => total + item.amount, 0);
}

function Metric({ label, value, note, tone = "default" }: { label: string; value: string; note: string; tone?: "default" | "positive" | "negative" | "navy" }) {
  return (
    <article className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function FinanceDemo({ onExit, gateway = demoFinanceGateway }: { onExit: () => void; gateway?: FinanceGateway }) {
  const [movements, setMovements] = useState<FinanceMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("2026-11");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [natureFilter, setNatureFilter] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [newMovement, setNewMovement] = useState({
    date: "2026-11-25",
    description: "",
    type: "venta" as MovementType,
    amount: "",
    nature: "no_aplica" as CostNature,
  });

  const [quantity, setQuantity] = useState(12);
  const [materials, setMaterials] = useState(780);
  const [labor, setLabor] = useState(360);
  const [otherVariable, setOtherVariable] = useState(120);
  const [fixedAllocation, setFixedAllocation] = useState(100);
  const [salePrice, setSalePrice] = useState(165);

  const [fixedCostsForBreakEven, setFixedCostsForBreakEven] = useState(1960);
  const [breakEvenPrice, setBreakEvenPrice] = useState(165);
  const [variableUnitCost, setVariableUnitCost] = useState(105);
  const [openingBalance, setOpeningBalance] = useState(10000);

  useEffect(() => {
    let active = true;
    gateway.listMovements().then((data) => {
      if (active) {
        setMovements(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [gateway]);

  const periodMovements = useMemo(
    () => movements.filter((item) => item.date.startsWith(period)),
    [movements, period],
  );
  const summary = useMemo(() => calculateFinanceSummary(periodMovements), [periodMovements]);
  const { income, expenses, net, fixedCosts: fixedTotal, variableCosts: variableTotal, productionCosts: productionCost, marginPercent: margin } = summary;
  const cashClosing = openingBalance + income - expenses;

  const filteredMovements = periodMovements.filter((item) => {
    const typeMatches = typeFilter === "todos" || item.type === typeFilter;
    const natureMatches = natureFilter === "todos" || item.nature === natureFilter;
    return typeMatches && natureMatches;
  });

  const weeks = [1, 2, 3, 4].map((week) => {
    const from = (week - 1) * 7 + 1;
    const to = week === 4 ? 31 : week * 7;
    const group = periodMovements.filter((item) => {
      const day = Number(item.date.slice(8, 10));
      return day >= from && day <= to;
    });
    return {
      label: `Sem. ${week}`,
      income: sum(group.filter((item) => item.type === "venta")),
      expenses: sum(group.filter((item) => item.type !== "venta")),
    };
  });
  const maxWeekValue = Math.max(1, ...weeks.flatMap((week) => [week.income, week.expenses]));

  const lotCost = calculateLotCost({ quantity, materials, labor, otherVariable, fixedAllocation, salePrice });
  const { totalBatchCost: lotTotalCost, unitCost, unitProfit, lotProfit, marginPercent: productMargin } = lotCost;
  const breakEven = calculateBreakEven(fixedCostsForBreakEven, breakEvenPrice, variableUnitCost);
  const { contributionPerUnit: contribution, units: breakEvenUnits, salesAmount: breakEvenRevenue } = breakEven;

  const highestExpense = [...periodMovements]
    .filter((item) => item.type !== "venta")
    .sort((a, b) => b.amount - a.amount)[0];

  async function handleMovementSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const amount = Number(newMovement.amount);
    if (!newMovement.description.trim()) {
      setFormError("Escribe una descripción para el movimiento.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("El monto debe ser mayor que cero.");
      return;
    }
    if (!newMovement.date) {
      setFormError("Selecciona una fecha.");
      return;
    }
    const nature = newMovement.type === "venta" ? "no_aplica" : newMovement.nature;
    const created = await gateway.createMovement({
      date: newMovement.date,
      description: newMovement.description.trim(),
      type: newMovement.type,
      amount,
      nature,
    });
    setMovements((current) => [created, ...current]);
    setPeriod(newMovement.date.slice(0, 7));
    setTypeFilter("todos");
    setNatureFilter("todos");
    setNewMovement({
      date: newMovement.date,
      description: "",
      type: "venta",
      amount: "",
      nature: "no_aplica",
    });
    setFormOpen(false);
  }

  return (
    <main className="finance-page">
      <section className="finance-heading">
        <div>
          <div className="eyebrow eyebrow-dark">ÁREA FINANCIERA · VISTA DE DEMOSTRACIÓN</div>
          <h1>Conoce los números de tu negocio.</h1>
          <p>Un panel para entender cuánto entra, cuánto sale, cuánto cuesta producir y qué decisiones conviene revisar.</p>
        </div>
        <button className="button button-outline" onClick={onExit} type="button">Volver al sitio público</button>
      </section>

      <div className="demo-alert">
        <span className="demo-dot" />
        <div><strong>Datos ficticios de un taller de calzado.</strong> Los registros se mantienen solo en la memoria de esta sesión. No se guardan en PostgreSQL ni representan información de un cliente.</div>
      </div>

      <section className="finance-toolbar">
        <div className="field-inline">
          <label htmlFor="finance-period"><Icon name="calendar" size={16} /> Periodo</label>
          <input id="finance-period" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
        </div>
        <button className="button button-primary" onClick={() => setFormOpen((open) => !open)} type="button">
          <Icon name="plus" size={17} /> Registrar movimiento
        </button>
      </section>

      {formOpen && (
        <section className="panel movement-form-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">NUEVO REGISTRO</span><h2>Agregar movimiento</h2></div>
            <button className="icon-button" type="button" aria-label="Cerrar formulario" onClick={() => setFormOpen(false)}><Icon name="close" /></button>
          </div>
          <form className="movement-form" onSubmit={handleMovementSubmit}>
            <label>Tipo de movimiento
              <select value={newMovement.type} onChange={(event) => {
                const type = event.target.value as MovementType;
                setNewMovement((current) => ({ ...current, type, nature: type === "venta" ? "no_aplica" : type === "gasto_operativo" ? "fijo" : "variable" }));
              }}>
                {Object.entries(movementNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Descripción
              <input value={newMovement.description} onChange={(event) => setNewMovement((current) => ({ ...current, description: event.target.value }))} placeholder="Ej. Compra de hilo para producción" />
            </label>
            <label>Monto (Bs)
              <input type="number" min="0.01" step="0.01" value={newMovement.amount} onChange={(event) => setNewMovement((current) => ({ ...current, amount: event.target.value }))} placeholder="0.00" />
            </label>
            <label>Fecha
              <input type="date" value={newMovement.date} onChange={(event) => setNewMovement((current) => ({ ...current, date: event.target.value }))} />
            </label>
            {newMovement.type !== "venta" && (
              <label>Naturaleza del costo
                <select value={newMovement.nature} onChange={(event) => setNewMovement((current) => ({ ...current, nature: event.target.value as CostNature }))}>
                  <option value="fijo">Costo fijo</option>
                  <option value="variable">Costo variable</option>
                </select>
              </label>
            )}
            <div className="form-actions">
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <button className="button button-primary" type="submit">Guardar en demostración</button>
            </div>
          </form>
          <p className="field-note">Las ventas no se clasifican como costos. Las compras de insumos y los pagos a destajo se proponen como variables, pero puedes revisar la naturaleza del gasto operativo.</p>
        </section>
      )}

      <section className="metrics-grid">
        <Metric label="Ingresos" value={money(income)} note="Ventas del periodo" tone="navy" />
        <Metric label="Egresos" value={money(expenses)} note="Compras, gastos y destajo" tone="negative" />
        <Metric label="Resultado neto" value={money(net)} note="Ingresos menos egresos" tone={net >= 0 ? "positive" : "negative"} />
        <Metric label="Costos de producción" value={money(productionCost)} note="Insumos + destajo + costos variables" />
        <Metric label="Margen neto" value={`${margin.toFixed(1)}%`} note="Resultado neto / ingresos" tone={margin >= 0 ? "positive" : "negative"} />
        <Metric label="Saldo final de caja" value={money(cashClosing)} note="Saldo inicial + entradas − salidas" tone="navy" />
      </section>

      <section className="finance-grid finance-grid-main">
        <article className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">MOVIMIENTOS MONETARIOS</span><h2>Flujo de caja</h2></div>
            <span className="soft-tag">Bs</span>
          </div>
          <div className="cash-summary">
            <label>Saldo inicial (Bs)
              <input type="number" min="0" step="0.01" value={openingBalance} onChange={(event) => setOpeningBalance(Math.max(0, Number(event.target.value) || 0))} />
            </label>
            <div><span>Entradas</span><strong className="positive-text">+ {money(income)}</strong></div>
            <div><span>Salidas</span><strong className="negative-text">− {money(expenses)}</strong></div>
            <div className="cash-ending"><span>Saldo final</span><strong>{money(cashClosing)}</strong></div>
          </div>
          <div className="chart-title"><strong>Entradas y salidas por semana</strong><span>Periodo seleccionado</span></div>
          <div className="cash-chart" role="img" aria-label="Gráfico de ingresos y egresos semanales">
            {weeks.map((week) => (
              <div className="chart-group" key={week.label}>
                <div className="chart-bars">
                  <span className="chart-bar chart-income" style={{ height: `${Math.max(3, (week.income / maxWeekValue) * 100)}%` }} title={`Ingresos: ${money(week.income)}`} />
                  <span className="chart-bar chart-expense" style={{ height: `${Math.max(3, (week.expenses / maxWeekValue) * 100)}%` }} title={`Egresos: ${money(week.expenses)}`} />
                </div>
                <small>{week.label}</small>
              </div>
            ))}
          </div>
          <div className="chart-legend"><span><i className="legend-income" />Ingresos</span><span><i className="legend-expense" />Egresos</span></div>
          <p className="field-note">El flujo de caja registra entradas y salidas de dinero. No equivale a la utilidad contable ni considera movimientos no registrados.</p>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">ESTRUCTURA DE COSTOS</span><h2>Fijos y variables</h2></div>
            <span className="soft-tag">Clasificación</span>
          </div>
          <div className="cost-classification">
            <div className="cost-class-card">
              <div className="cost-class-top"><span className="cost-dot fixed-dot" /><strong>Costos fijos</strong></div>
              <b>{money(fixedTotal)}</b>
              <p>No cambian directamente con cada unidad producida. Ejemplo: alquiler e internet de importe fijo.</p>
            </div>
            <div className="cost-class-card">
              <div className="cost-class-top"><span className="cost-dot variable-dot" /><strong>Costos variables</strong></div>
              <b>{money(variableTotal)}</b>
              <p>Varían con la producción o actividad. Ejemplo: cuero, suelas, consumo de producción y destajo.</p>
            </div>
          </div>
          <div className="classification-note">
            <Icon name="alert" size={18} />
            <p>La naturaleza depende del uso y del contrato. Por ejemplo, la electricidad puede tener una parte fija y otra variable; no se clasifica automáticamente por el nombre del gasto.</p>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div><span className="eyebrow">REGISTRO FINANCIERO</span><h2>Ingresos y egresos</h2></div>
          <span className="soft-tag">{filteredMovements.length} registros</span>
        </div>
        <div className="table-filters">
          <label>Tipo
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="todos">Todos</option>
              {Object.entries(movementNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>Naturaleza
            <select value={natureFilter} onChange={(event) => setNatureFilter(event.target.value)}>
              <option value="todos">Todas</option>
              <option value="fijo">Fijo</option>
              <option value="variable">Variable</option>
              <option value="no_aplica">No aplica</option>
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table className="finance-table">
            <thead><tr><th>Fecha</th><th>Descripción</th><th>Tipo</th><th>Clasificación</th><th className="amount-cell">Monto</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="empty-row">Cargando datos de demostración…</td></tr> :
                filteredMovements.length ? filteredMovements.slice().sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(`${item.date}T12:00:00`).toLocaleDateString("es-BO")}</td>
                    <td className="movement-description">{item.description}</td>
                    <td>{movementNames[item.type]}</td>
                    <td><span className={`nature-pill nature-${item.nature}`}>{natureNames[item.nature]}</span></td>
                    <td className={`amount-cell ${item.type === "venta" ? "positive-text" : ""}`}>{item.type === "venta" ? "+" : "−"} {money(item.amount)}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="empty-row">No hay movimientos para los filtros seleccionados.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="finance-grid">
        <article className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">COSTO POR PRODUCTO</span><h2>Calcula un lote</h2></div>
            <span className="soft-tag">Ejemplo editable</span>
          </div>
          <p className="panel-intro">Ejemplo de 12 pares de zapato casual. Cambia los valores para estimar cuánto cuesta fabricar el lote y cada unidad.</p>
          <div className="calculator-fields">
            <label>Unidades del lote<input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))} /></label>
            <label>Precio de venta por unidad (Bs)<input type="number" min="0" step="0.01" value={salePrice} onChange={(event) => setSalePrice(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label>Materias primas e insumos (Bs)<input type="number" min="0" step="0.01" value={materials} onChange={(event) => setMaterials(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label>Mano de obra del lote (Bs)<input type="number" min="0" step="0.01" value={labor} onChange={(event) => setLabor(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label>Otros costos variables (Bs)<input type="number" min="0" step="0.01" value={otherVariable} onChange={(event) => setOtherVariable(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label>Asignación de costos fijos al lote (Bs)<input type="number" min="0" step="0.01" value={fixedAllocation} onChange={(event) => setFixedAllocation(Math.max(0, Number(event.target.value) || 0))} /></label>
          </div>
          <div className="product-results">
            <div><span>Costo total del lote</span><strong>{money(lotTotalCost)}</strong></div>
            <div><span>Costo unitario</span><strong>{money(unitCost)}</strong></div>
            <div><span>Ganancia estimada por unidad</span><strong className={unitProfit >= 0 ? "positive-text" : "negative-text"}>{money(unitProfit)}</strong></div>
            <div><span>Ganancia estimada del lote</span><strong className={lotProfit >= 0 ? "positive-text" : "negative-text"}>{money(lotProfit)}</strong></div>
            <div><span>Margen estimado</span><strong>{salePrice > 0 ? `${productMargin.toFixed(1)}%` : "—"}</strong></div>
          </div>
          <p className="field-note">Estimación con los valores ingresados. Para calcular un costo real, el backend deberá tomar consumos de recetas, órdenes, ejecución de etapas y mano de obra, evitando sumar dos veces los pagos a destajo.</p>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div><span className="eyebrow">PLANIFICACIÓN</span><h2>Punto de equilibrio</h2></div>
            <span className="soft-tag">Calculadora</span>
          </div>
          <p className="panel-intro">Estima cuántas unidades necesitas vender para cubrir tus costos fijos, sin generar pérdida ni ganancia.</p>
          <div className="calculator-fields single">
            <label>Costos fijos del periodo (Bs)<input type="number" min="0" step="0.01" value={fixedCostsForBreakEven} onChange={(event) => setFixedCostsForBreakEven(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label>Precio de venta por unidad (Bs)<input type="number" min="0" step="0.01" value={breakEvenPrice} onChange={(event) => setBreakEvenPrice(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label>Costo variable por unidad (Bs)<input type="number" min="0" step="0.01" value={variableUnitCost} onChange={(event) => setVariableUnitCost(Math.max(0, Number(event.target.value) || 0))} /></label>
          </div>
          {contribution <= 0 ? (
            <div className="break-even-warning"><Icon name="alert" /><strong>No se puede calcular.</strong><span>El precio de venta debe ser mayor que el costo variable unitario.</span></div>
          ) : (
            <div className="break-even-result">
              <span>Punto de equilibrio estimado</span>
              <strong>{breakEvenUnits} <small>unidades</small></strong>
              <p>Debes vender aproximadamente {breakEvenUnits} unidades para cubrir {money(fixedCostsForBreakEven)} de costos fijos.</p>
              <div className="break-even-line"><span>Ventas necesarias</span><b>{money(breakEvenRevenue ?? 0)}</b></div>
              <div className="break-even-line"><span>Contribución por unidad</span><b>{money(contribution)}</b></div>
            </div>
          )}
          <p className="field-note">Fórmula: costos fijos ÷ (precio de venta − costo variable unitario). El resultado se redondea hacia arriba a unidades completas.</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div><span className="eyebrow">LECTURA PARA DECIDIR</span><h2>Resumen y recomendaciones</h2></div>
          <span className="soft-tag">Reglas básicas · sin IA</span>
        </div>
        <div className="insights-grid">
          <article className="insight-card">
            <span className="insight-icon"><Icon name="trend" /></span>
            <strong>Resultado del periodo</strong>
            <p>{net >= 0 ? `El periodo presenta un resultado positivo de ${money(net)}.` : `Los egresos superan los ingresos por ${money(Math.abs(net))}. Revisa los gastos y el volumen de ventas.`}</p>
          </article>
          <article className="insight-card">
            <span className="insight-icon"><Icon name="coins" /></span>
            <strong>Mayor egreso registrado</strong>
            <p>{highestExpense ? `${highestExpense.description}: ${money(highestExpense.amount)}. Comprueba si corresponde al periodo y si puede planificarse mejor.` : "Aún no hay egresos registrados en este periodo."}</p>
          </article>
          <article className="insight-card">
            <span className="insight-icon"><Icon name="factory" /></span>
            <strong>Rentabilidad del producto de ejemplo</strong>
            <p>{productMargin >= 20 ? `El zapato casual muestra un margen estimado de ${productMargin.toFixed(1)}%. Contrasta este valor con costos y precios reales.` : `El margen estimado es ${productMargin.toFixed(1)}%. Revisa materiales, desperdicio, mano de obra y precio de venta.`}</p>
          </article>
        </div>
        <p className="field-note">Estas observaciones se generan mediante reglas sencillas a partir de los datos de demostración. No existe una integración de inteligencia artificial activa en este módulo.</p>
      </section>
      <footer className="finance-footer">
        <span>TECH BOOST · Transformación inteligente de industrias</span>
        <button type="button" className="text-button" onClick={onExit}>Salir de la demostración <Icon name="arrow" size={16} /></button>
      </footer>
    </main>
  );
}
