import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { calculateBreakEven } from "../services/financeCalculations";
import type { CostNature, FinanceMovement, MovementType } from "../services/financeGateway";
import {
  financeErrorMessage,
  httpFinanceGateway,
  type DestajoRecord,
  type FinanceReport,
} from "../services/httpFinanceGateway";

const money = (value: number) =>
  new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

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

// Los pagos a destajo se leen desde registros_destajo; registrarlos aquí los duplicaría.
const creatableTypes: MovementType[] = ["venta", "compra_insumos", "gasto_operativo"];

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const CURRENT_DATE = new Date().toISOString().slice(0, 10);

function Metric({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "positive" | "negative" | "navy";
}) {
  return (
    <article className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function FinancePanel({ onExit }: { onExit: () => void }) {
  const [period, setPeriod] = useState(CURRENT_MONTH);
  const [report, setReport] = useState<FinanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [natureFilter, setNatureFilter] = useState("todos");
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [breakEvenPrice, setBreakEvenPrice] = useState(0);
  const [variableUnitCost, setVariableUnitCost] = useState(0);
  const [newMovement, setNewMovement] = useState<{
    date: string;
    description: string;
    type: MovementType;
    amount: string;
    nature: CostNature;
  }>(() => ({
    date: CURRENT_DATE,
    description: "",
    type: "venta",
    amount: "",
    nature: "no_aplica",
  }));

  const load = useCallback(async () => {
    try {
      const data = await httpFinanceGateway.getReport(period);
      setReport(data);
      setBreakEvenPrice(data.breakEven.salePrice);
      setVariableUnitCost(data.breakEven.variableUnitCost);
    } catch (caught) {
      setError(financeErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const data = await httpFinanceGateway.getReport(period);
        if (!active) return;
        setReport(data);
        setBreakEvenPrice(data.breakEven.salePrice);
        setVariableUnitCost(data.breakEven.variableUnitCost);
      } catch (caught) {
        if (active) setError(financeErrorMessage(caught));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [period]);

  const filteredMovements = useMemo<FinanceMovement[]>(() => {
    const items = report?.movements ?? [];
    return items.filter(
      (item) =>
        (typeFilter === "todos" || item.type === typeFilter) &&
        (natureFilter === "todos" || item.nature === natureFilter),
    );
  }, [report, typeFilter, natureFilter]);

  const summary = report?.summary;
  const weeks = report?.cashFlow ?? [
    { label: "Sem. 1", income: 0, expenses: 0 },
    { label: "Sem. 2", income: 0, expenses: 0 },
    { label: "Sem. 3", income: 0, expenses: 0 },
    { label: "Sem. 4", income: 0, expenses: 0 },
  ];
  const maxWeekValue = Math.max(
    1,
    ...weeks.flatMap((week) => [week.income, week.expenses]),
  );
  const { contributionPerUnit, units, salesAmount } = calculateBreakEven(
    summary?.fixedCosts ?? 0,
    breakEvenPrice,
    variableUnitCost,
  );
  const highestExpense = [...(report?.movements ?? [])]
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
    setSaving(true);
    try {
      await httpFinanceGateway.createMovement({
        date: newMovement.date,
        description: newMovement.description.trim(),
        type: newMovement.type,
        amount,
        nature: newMovement.type === "venta" ? "no_aplica" : newMovement.nature,
      });
      const targetPeriod = newMovement.date.slice(0, 7);
      setError("");
      setPeriod(targetPeriod);
      if (targetPeriod === period) await load();
      setNewMovement((current) => ({
        ...current,
        description: "",
        amount: "",
      }));
      setFormOpen(false);
    } catch (caught) {
      setFormError(financeErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function handlePayDestajo(item: DestajoRecord) {
    setPayingId(item.id);
    setError("");
    setNotice("");
    try {
      const result = await httpFinanceGateway.payDestajo(item.id);
      setNotice(
        result.alreadyPaid
          ? "El destajo ya estaba pagado; no se registró un segundo pago."
          : "Pago registrado una sola vez en registros_destajo.",
      );
      await load();
    } catch (caught) {
      setError(financeErrorMessage(caught));
    } finally {
      setPayingId(null);
    }
  }

  return (
    <main className="finance-page">
      <section className="finance-heading">
        <div>
          <div className="eyebrow eyebrow-dark">ÁREA FINANCIERA · DATOS REALES</div>
          <h1>Los números de tu negocio, desde la base de datos.</h1>
          <p>
            Ingresos, egresos, costos, flujo de caja, destajos y reportes de la empresa
            asociada a tu sesión. Todos los importes están expresados en bolivianos.
          </p>
        </div>
        <button className="button button-outline" onClick={onExit} type="button">
          Volver al sitio público
        </button>
      </section>

      {error && (
        <div className="form-error" role="alert">
          <strong>No se pudo cargar la información financiera.</strong> {error}{" "}
          <button
            type="button"
            className="text-button"
            onClick={() => { setError(""); void load(); }}
          >
            Reintentar
          </button>
        </div>
      )}

      <section className="finance-toolbar">
        <div className="field-inline">
          <label htmlFor="finance-real-period">
            <Icon name="calendar" size={16} /> Periodo
          </label>
          <input
            id="finance-real-period"
            type="month"
            value={period}
            onChange={(event) => { setPeriod(event.target.value); setError(""); }}
          />
        </div>
        <button
          className="button button-primary"
          onClick={() => setFormOpen((open) => !open)}
          type="button"
        >
          <Icon name="plus" size={17} /> Registrar movimiento
        </button>
      </section>

      {formOpen && (
        <section className="panel movement-form-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">NUEVO REGISTRO</span>
              <h2>Agregar movimiento</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Cerrar formulario"
              onClick={() => setFormOpen(false)}
            >
              <Icon name="close" />
            </button>
          </div>
          <form className="movement-form" onSubmit={handleMovementSubmit}>
            <label>
              Tipo de movimiento
              <select
                value={newMovement.type}
                onChange={(event) => {
                  const type = event.target.value as MovementType;
                  setNewMovement((current) => ({
                    ...current,
                    type,
                    nature:
                      type === "venta"
                        ? "no_aplica"
                        : type === "gasto_operativo"
                          ? "fijo"
                          : "variable",
                  }));
                }}
              >
                {creatableTypes.map((type) => (
                  <option key={type} value={type}>
                    {movementNames[type]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Descripción
              <input
                value={newMovement.description}
                onChange={(event) =>
                  setNewMovement((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Ej. Compra de hilo para producción"
              />
            </label>
            <label>
              Monto (Bs)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newMovement.amount}
                onChange={(event) =>
                  setNewMovement((current) => ({ ...current, amount: event.target.value }))
                }
                placeholder="0.00"
              />
            </label>
            <label>
              Fecha
              <input
                type="date"
                value={newMovement.date}
                onChange={(event) =>
                  setNewMovement((current) => ({ ...current, date: event.target.value }))
                }
              />
            </label>
            {newMovement.type === "gasto_operativo" && (
              <label>
                Naturaleza del costo
                <select
                  value={newMovement.nature}
                  onChange={(event) =>
                    setNewMovement((current) => ({
                      ...current,
                      nature: event.target.value as CostNature,
                    }))
                  }
                >
                  <option value="fijo">Costo fijo</option>
                  <option value="variable">Costo variable</option>
                </select>
              </label>
            )}
            <div className="form-actions">
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <button className="button button-primary" type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar en la base de datos"}
              </button>
            </div>
          </form>
          <p className="field-note">
            Las ventas no se clasifican como costos. Las compras de insumos se clasifican
            como variables. Los pagos a destajo no se registran aquí: se consultan desde
            registros_destajo para evitar duplicarlos.
          </p>
        </section>
      )}

      <section className="metrics-grid">
        <Metric
          label="Ingresos"
          value={money(summary?.income ?? 0)}
          note="Ventas registradas del periodo"
          tone="navy"
        />
        <Metric
          label="Egresos"
          value={money(summary?.expenses ?? 0)}
          note="Movimientos registrados"
          tone="negative"
        />
        <Metric
          label="Resultado neto"
          value={money(summary?.net ?? 0)}
          note="Ingresos menos egresos"
          tone={(summary?.net ?? 0) >= 0 ? "positive" : "negative"}
        />
        <Metric
          label="Costos de producción"
          value={money(summary?.registeredProductionCosts ?? 0)}
          note="Costos registrados, no estimados"
        />
        <Metric
          label="Margen neto"
          value={`${(summary?.marginPercent ?? 0).toFixed(1)}%`}
          note="Resultado neto / ingresos"
          tone={(summary?.marginPercent ?? 0) >= 0 ? "positive" : "negative"}
        />
        <Metric
          label="Destajos pendientes"
          value={money(report?.destajosPendientesBs ?? 0)}
          note="Desde registros_destajo, no sumados al flujo"
          tone="navy"
        />
      </section>

      <section className="finance-grid finance-grid-main">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MOVIMIENTOS MONETARIOS</span>
              <h2>Flujo de caja</h2>
            </div>
            <span className="soft-tag">Bs</span>
          </div>
          <div className="cash-summary">
            <div>
              <span>Saldo inicial</span>
              <strong>No disponible en la BD</strong>
            </div>
            <div>
              <span>Entradas</span>
              <strong className="positive-text">+ {money(summary?.income ?? 0)}</strong>
            </div>
            <div>
              <span>Salidas</span>
              <strong className="negative-text">− {money(summary?.expenses ?? 0)}</strong>
            </div>
            <div className="cash-ending">
              <span>Resultado neto</span>
              <strong>{money(summary?.net ?? 0)}</strong>
            </div>
          </div>
          <div className="chart-title">
            <strong>Entradas y salidas por semana</strong>
            <span>{period || "Periodo seleccionado"}</span>
          </div>
          <div className="cash-chart" role="img" aria-label="Gráfico de ingresos y egresos semanales">
            {weeks.map((week) => (
              <div className="chart-group" key={week.label}>
                <div className="chart-bars">
                  <span
                    className="chart-bar chart-income"
                    style={{ height: `${Math.max(3, (week.income / maxWeekValue) * 100)}%` }}
                    title={`Ingresos: ${money(week.income)}`}
                  />
                  <span
                    className="chart-bar chart-expense"
                    style={{ height: `${Math.max(3, (week.expenses / maxWeekValue) * 100)}%` }}
                    title={`Egresos: ${money(week.expenses)}`}
                  />
                </div>
                <small>{week.label}</small>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <span><i className="legend-income" />Ingresos</span>
            <span><i className="legend-expense" />Egresos</span>
          </div>
          <p className="field-note">
            {loading && !report
              ? "Cargando movimientos desde PostgreSQL…"
              : "El flujo de caja usa registros_operativos. Los registros_destajo no se suman aquí para evitar duplicar pagos."}
          </p>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">ESTRUCTURA DE COSTOS</span>
              <h2>Registrados y estimados</h2>
            </div>
            <span className="soft-tag">Separados</span>
          </div>
          <div className="cost-classification">
            <div className="cost-class-card">
              <div className="cost-class-top">
                <span className="cost-dot fixed-dot" />
                <strong>Costos registrados</strong>
              </div>
              <b>{money(report?.costs.registered.total ?? 0)}</b>
              <p>
                Compras {money(report?.costs.registered.compraInsumos ?? 0)} · Gastos{" "}
                {money(report?.costs.registered.gastoOperativo ?? 0)} · Destajo{" "}
                {money(report?.costs.registered.pagoDestajo ?? 0)}.
              </p>
            </div>
            <div className="cost-class-card">
              <div className="cost-class-top">
                <span className="cost-dot variable-dot" />
                <strong>Costos estimados</strong>
              </div>
              <b>{money(report?.costs.estimated.costoCalculadoProductosBs ?? 0)}</b>
              <p>
                Mano de obra estándar {money(report?.costs.estimated.manoObraEstandarBs ?? 0)} ·
                Inventario {money(report?.costs.estimated.valorInventarioInsumosBs ?? 0)}.
              </p>
            </div>
          </div>
          <div className="insights-grid">
            {(report?.costs.estimated.materialesPorProducto ?? []).map((item) => (
              <article className="insight-card" key={item.producto}>
                <strong>{item.producto}</strong>
                <p>Materiales estimados por receta: {money(item.montoBs)}.</p>
              </article>
            ))}
          </div>
          <div className="classification-note">
            <Icon name="alert" size={18} />
            <p>
              {report?.costs.note ??
                "Costos registrados y estimados se mantienen separados; no se suman entre sí."}
            </p>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">REGISTRO FINANCIERO</span>
            <h2>Ingresos y egresos</h2>
          </div>
          <span className="soft-tag">{filteredMovements.length} registros</span>
        </div>
        <div className="table-filters">
          <label>
            Tipo
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="todos">Todos</option>
              {Object.entries(movementNames).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Naturaleza
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
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Clasificación</th>
                <th className="amount-cell">Monto</th>
              </tr>
            </thead>
            <tbody>
              {loading && !report ? (
                <tr><td colSpan={5} className="empty-row">Cargando datos reales…</td></tr>
              ) : filteredMovements.length ? (
                filteredMovements.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date || "—"}</td>
                    <td className="movement-description">{item.description}</td>
                    <td>{movementNames[item.type]}</td>
                    <td>
                      <span className={`nature-pill nature-${item.nature}`}>
                        {natureNames[item.nature]}
                      </span>
                    </td>
                    <td className={`amount-cell ${item.type === "venta" ? "positive-text" : ""}`}>
                      {item.type === "venta" ? "+" : "−"} {money(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="empty-row">No hay movimientos en el periodo seleccionado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">TRABAJO A DESTAJO</span>
            <h2>Pagos y pendientes</h2>
          </div>
          <span className="soft-tag">Pago idempotente</span>
        </div>
        <div className="cash-summary">
          <div><span>Pagados</span><strong>{money(report?.destajosPagadosBs ?? 0)}</strong></div>
          <div><span>Pendientes</span><strong>{money(report?.destajosPendientesBs ?? 0)}</strong></div>
        </div>
        <div className="table-scroll">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Trabajador</th>
                <th>Unidades</th>
                <th>Monto (Bs)</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {(report?.destajos ?? []).length ? (
                (report?.destajos ?? []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.fecha || "—"}</td>
                    <td className="movement-description">{item.trabajador}</td>
                    <td>{item.unidades}</td>
                    <td className="amount-cell">{money(item.montoBs)}</td>
                    <td>
                      <span className={`nature-pill nature-${item.pagado ? "fijo" : "variable"}`}>
                        {item.pagado ? "Pagado" : "Pendiente"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button button-small button-primary"
                        disabled={item.pagado || payingId === item.id}
                        onClick={() => void handlePayDestajo(item)}
                      >
                        {item.pagado
                          ? "Pagado"
                          : payingId === item.id
                            ? "Procesando…"
                            : "Registrar pago"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="empty-row">No hay registros de destajo en este periodo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {notice && <p className="field-note">{notice}</p>}
        <p className="field-note">
          Estos importes provienen de registros_destajo. El botón solo actualiza la columna
          pagado y es idempotente; no crea movimientos ni permite pagar dos veces el mismo
          destajo. Por eso no se agregan al flujo de caja.
        </p>
      </section>

      <section className="finance-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">PUNTO DE EQUILIBRIO</span>
              <h2>Calcular con datos reales</h2>
            </div>
            <span className="soft-tag">Editable</span>
          </div>
          <p className="panel-intro">
            Los valores iniciales vienen del backend: costos fijos registrados, precio del
            primer producto y estimación de materiales y mano de obra. Puedes ajustarlos
            localmente para explorar escenarios.
          </p>
          <div className="calculator-fields single">
            <label>Costos fijos del periodo (Bs)
              <input
                type="number"
                min="0"
                step="0.01"
                value={summary?.fixedCosts ?? 0}
                readOnly
              />
            </label>
            <label>Precio de venta por unidad (Bs)
              <input
                type="number"
                min="0"
                step="0.01"
                value={breakEvenPrice}
                onChange={(event) => setBreakEvenPrice(Math.max(0, Number(event.target.value) || 0))}
              />
            </label>
            <label>Costo variable por unidad (Bs)
              <input
                type="number"
                min="0"
                step="0.01"
                value={variableUnitCost}
                onChange={(event) => setVariableUnitCost(Math.max(0, Number(event.target.value) || 0))}
              />
            </label>
          </div>
          {contributionPerUnit <= 0 ? (
            <div className="break-even-warning">
              <Icon name="alert" />
              <strong>No se puede calcular.</strong>
              <span>El precio debe ser mayor que el costo variable unitario.</span>
            </div>
          ) : (
            <div className="break-even-result">
              <span>Punto de equilibrio estimado</span>
              <strong>{units} <small>unidades</small></strong>
              <p>Vende aproximadamente {units} unidades para cubrir {money(summary?.fixedCosts ?? 0)} de costos fijos.</p>
              <div className="break-even-line"><span>Ventas necesarias</span><b>{money(salesAmount ?? 0)}</b></div>
              <div className="break-even-line"><span>Contribución por unidad</span><b>{money(contributionPerUnit)}</b></div>
            </div>
          )}
          <p className="field-note">{report?.breakEven.note ?? "Fuente: datos registrados y estimados del backend."}</p>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">LECTURA PARA DECIDIR</span>
              <h2>Resumen del periodo</h2>
            </div>
            <span className="soft-tag">Sin IA</span>
          </div>
          <div className="insights-grid">
            <article className="insight-card">
              <span className="insight-icon"><Icon name="trend" /></span>
              <strong>Resultado</strong>
              <p>
                {(summary?.net ?? 0) >= 0
                  ? `El periodo presenta un resultado positivo de ${money(summary?.net ?? 0)}.`
                  : `Los egresos superan los ingresos por ${money(Math.abs(summary?.net ?? 0))}.`}
              </p>
            </article>
            <article className="insight-card">
              <span className="insight-icon"><Icon name="coins" /></span>
              <strong>Mayor egreso registrado</strong>
              <p>
                {highestExpense
                  ? `${highestExpense.description}: ${money(highestExpense.amount)}.`
                  : "No hay egresos registrados en este periodo."}
              </p>
            </article>
          </div>
          <div className="classification-note">
            <Icon name="alert" size={18} />
            <div>
              <strong>Limitaciones</strong>
              <ul>
                {(report?.limitations ?? []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>

      <footer className="finance-footer">
        <span>TECH BOOST · Datos financieros de la sesión autenticada</span>
        <button type="button" className="text-button" onClick={onExit}>
          Salir del panel <Icon name="arrow" size={16} />
        </button>
      </footer>
    </main>
  );
}
