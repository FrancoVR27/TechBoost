import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  actualizarProducto,
  calcularCostoProducto,
  crearInsumo,
  crearLineaReceta,
  crearOperacion,
  crearProducto,
  eliminarLineaReceta,
  obtenerEmpresasPC,
  obtenerInsumosPC,
  obtenerOperacionesPC,
  obtenerPlanes,
  obtenerProductosPC,
  obtenerRecetasPC,
} from '../services/planes-costos.service';
import type {
  Empresa,
  Insumo,
  Plan,
  Producto,
  RecetaProductoInsumo,
  RegistroOperativo,
  ResultadoCosto,
} from '../types/planes-costos.types';

const moneda = (valor: number | string | null | undefined) =>
  `Bs. ${Number(valor ?? 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fechaHoy = () => {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const nombrePlan = (nombre: string) =>
  nombre.replaceAll('_', ' ').replace(/\b\w/g, (letra) => letra.toUpperCase());

function caracteristicasPlan(plan: Plan): string[] {
  const nombre = plan.nombre.toLowerCase();
  if (nombre === 'free') {
    return [
      'Contabilidad simple',
      'Inventario y ventas',
      'Flujo de caja básico',
      'Registro desde el celular',
    ];
  }
  if (nombre === 'monitoreo') {
    return [
      'Kit de hasta 5 sensores',
      'Panel web de indicadores',
      'Alertas de fallas por WhatsApp',
      'Monitoreo de maquinaria',
    ];
  }
  if (nombre === 'predictivo_ia') {
    return [
      'Incluye monitoreo',
      'Detección de anomalías',
      'Mantenimiento predictivo con IA',
      'Recomendaciones de mantenimiento',
    ];
  }
  return [
    'Automatización de procesos',
    'Integración tecnológica a medida',
    'Visión artificial para calidad',
    'Capacitación e implementación',
  ];
}

function PlanesCostosPanel() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState('');
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [recetas, setRecetas] = useState<RecetaProductoInsumo[]>([]);
  const [operaciones, setOperaciones] = useState<RegistroOperativo[]>([]);

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoEmpresa, setCargandoEmpresa] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [mostrarProducto, setMostrarProducto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [nombreProducto, setNombreProducto] = useState('');
  const [sku, setSku] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('unidad');
  const [precioVenta, setPrecioVenta] = useState('');
  const [costoManoObra, setCostoManoObra] = useState('0');
  const [otrosCostos, setOtrosCostos] = useState('0');

  const [mostrarInsumo, setMostrarInsumo] = useState(false);
  const [nombreInsumo, setNombreInsumo] = useState('');
  const [unidadInsumo, setUnidadInsumo] = useState('unidad');
  const [stockInsumo, setStockInsumo] = useState('0');
  const [stockMinimo, setStockMinimo] = useState('0');
  const [costoInsumo, setCostoInsumo] = useState('0');

  const [productoReceta, setProductoReceta] = useState<Producto | null>(null);
  const [insumoSeleccionado, setInsumoSeleccionado] = useState('');
  const [cantidadReceta, setCantidadReceta] = useState('1');
  const [mermaReceta, setMermaReceta] = useState('0');

  const [resultadoCosto, setResultadoCosto] = useState<ResultadoCosto | null>(null);
  const [mostrarOperacion, setMostrarOperacion] = useState(false);
  const [tipoOperacion, setTipoOperacion] = useState<'venta' | 'compra_insumo' | 'gasto_operativo'>('gasto_operativo');
  const [montoOperacion, setMontoOperacion] = useState('');
  const [descripcionOperacion, setDescripcionOperacion] = useState('');
  const [fechaOperacion, setFechaOperacion] = useState(fechaHoy());
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarCatalogos() {
      try {
        setCargandoInicial(true);
        setError('');
        const [listaEmpresas, listaPlanes] = await Promise.all([
          obtenerEmpresasPC(),
          obtenerPlanes(),
        ]);
        setEmpresas(listaEmpresas);
        setPlanes(listaPlanes);
        if (listaEmpresas.length > 0) setEmpresaId(listaEmpresas[0].empresaId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los planes y las empresas.');
      } finally {
        setCargandoInicial(false);
      }
    }
    void cargarCatalogos();
  }, []);

  async function cargarDatosEmpresa(id: string) {
    if (!id) return;
    try {
      setCargandoEmpresa(true);
      setError('');
      const [listaProductos, listaInsumos, listaRecetas, listaOperaciones] = await Promise.all([
        obtenerProductosPC(),
        obtenerInsumosPC(),
        obtenerRecetasPC(),
        obtenerOperacionesPC(),
      ]);
      setProductos(listaProductos.filter((item) => item.empresaId === id));
      setInsumos(listaInsumos.filter((item) => item.empresaId === id));
      setRecetas(listaRecetas);
      setOperaciones(listaOperaciones.filter((item) => item.empresaId === id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos de la empresa.');
    } finally {
      setCargandoEmpresa(false);
    }
  }

  useEffect(() => {
    if (empresaId) void cargarDatosEmpresa(empresaId);
  }, [empresaId]);

  const recetasProducto = useMemo(
    () => productoReceta ? recetas.filter((item) => item.productoId === productoReceta.productoId) : [],
    [recetas, productoReceta],
  );

  const ingresos = useMemo(
    () => operaciones.filter((item) => item.tipoMovimiento === 'venta').reduce((total, item) => total + Number(item.montoBs), 0),
    [operaciones],
  );

  const egresos = useMemo(
    () => operaciones.filter((item) => item.tipoMovimiento !== 'venta').reduce((total, item) => total + Number(item.montoBs), 0),
    [operaciones],
  );

  function abrirProducto(producto?: Producto) {
    setProductoEditando(producto ?? null);
    setNombreProducto(producto?.nombre ?? '');
    setSku(producto?.sku ?? '');
    setUnidadMedida(producto?.unidadMedida ?? 'unidad');
    setPrecioVenta(producto?.precioVentaBs ?? '');
    setCostoManoObra(producto?.costoManoObraBs ?? '0');
    setOtrosCostos(producto?.otrosCostosBs ?? '0');
    setError('');
    setMostrarProducto(true);
  }

  async function guardarProducto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const precio = Number(precioVenta);
    const manoObra = Number(costoManoObra);
    const otros = Number(otrosCostos);
    if (!empresaId) return setError('Primero selecciona una empresa.');
    if (!nombreProducto.trim()) return setError('Ingresa el nombre del producto.');
    if (!Number.isFinite(precio) || precio < 0 || !Number.isFinite(manoObra) || manoObra < 0 || !Number.isFinite(otros) || otros < 0) {
      return setError('Los precios y costos deben ser números iguales o mayores que cero.');
    }
    try {
      setGuardando(true);
      const datos = {
        nombre: nombreProducto.trim(),
        sku: sku.trim() || null,
        unidadMedida: unidadMedida.trim(),
        precioVentaBs: precio.toFixed(2),
        costoManoObraBs: manoObra.toFixed(2),
        otrosCostosBs: otros.toFixed(2),
      };
      if (productoEditando) {
        await actualizarProducto(productoEditando.productoId, datos);
      } else {
        await crearProducto({ ...datos, empresaId, costoCalculadoBs: null, margenGananciaPct: null });
      }
      setMostrarProducto(false);
      setMensaje(productoEditando ? 'Producto actualizado.' : 'Producto registrado. Ahora puedes configurar su receta.');
      await cargarDatosEmpresa(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto.');
    } finally {
      setGuardando(false);
    }
  }

  async function guardarInsumo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const stock = Number(stockInsumo);
    const minimo = Number(stockMinimo);
    const costo = Number(costoInsumo);
    if (!empresaId) return setError('Primero selecciona una empresa.');
    if (!nombreInsumo.trim()) return setError('Ingresa el nombre del insumo.');
    if (![stock, minimo, costo].every((n) => Number.isFinite(n) && n >= 0)) {
      return setError('Stock y costo deben ser números iguales o mayores que cero.');
    }
    try {
      setGuardando(true);
      await crearInsumo({
        empresaId,
        nombre: nombreInsumo.trim(),
        unidadMedida: unidadInsumo.trim(),
        stockActual: stock.toFixed(3),
        stockMinimoAlerta: minimo.toFixed(3),
        costoUnitarioPromedioBs: costo.toFixed(2),
      });
      setMostrarInsumo(false);
      setNombreInsumo('');
      setMensaje('Insumo registrado correctamente.');
      await cargarDatosEmpresa(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el insumo.');
    } finally {
      setGuardando(false);
    }
  }

  async function agregarReceta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const cantidad = Number(cantidadReceta);
    const merma = Number(mermaReceta);
    if (!productoReceta) return;
    if (!insumoSeleccionado) return setError('Selecciona un insumo.');
    if (!Number.isFinite(cantidad) || cantidad <= 0 || !Number.isFinite(merma) || merma < 0 || merma > 100) {
      return setError('La cantidad debe ser mayor que cero y la merma debe estar entre 0 y 100%.');
    }
    try {
      setGuardando(true);
      await crearLineaReceta({
        productoId: productoReceta.productoId,
        insumoId: insumoSeleccionado,
        cantidadRequerida: cantidad.toFixed(4),
        porcentajeMermaEstimada: merma.toFixed(2),
      });
      const nuevasRecetas = await obtenerRecetasPC();
      setRecetas(nuevasRecetas);
      setInsumoSeleccionado('');
      setCantidadReceta('1');
      setMermaReceta('0');
      setMensaje('Insumo agregado a la receta del producto.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo agregar el insumo a la receta.');
    } finally {
      setGuardando(false);
    }
  }

  async function quitarReceta(recetaId: string) {
    if (!productoReceta) return;
    try {
      setError('');
      await eliminarLineaReceta(recetaId);
      setRecetas(await obtenerRecetasPC());
      setMensaje('Insumo retirado de la receta.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo retirar el insumo.');
    }
  }

  async function ejecutarCalculo(producto: Producto) {
    try {
      setError('');
      const resultado = await calcularCostoProducto(producto.productoId);
      setResultadoCosto(resultado);
      await cargarDatosEmpresa(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo calcular el costo.');
    }
  }

  async function guardarOperacion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const monto = Number(montoOperacion);
    if (!empresaId) return setError('Primero selecciona una empresa.');
    if (!Number.isFinite(monto) || monto <= 0) return setError('El monto debe ser mayor que cero.');
    if (!descripcionOperacion.trim()) return setError('Describe brevemente la operación.');
    try {
      setGuardando(true);
      await crearOperacion({
        empresaId,
        tipoMovimiento: tipoOperacion,
        montoBs: monto,
        descripcion: descripcionOperacion.trim(),
        canalOrigen: 'web',
        fechaOperacion: new Date(`${fechaOperacion}T12:00:00`).toISOString(),
      });
      setMostrarOperacion(false);
      setMontoOperacion('');
      setDescripcionOperacion('');
      setMensaje('Movimiento financiero registrado.');
      await cargarDatosEmpresa(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el movimiento financiero.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoInicial) {
    return <div className="pc-panel"><div className="pc-message">Cargando planes y empresas...</div></div>;
  }

  return (
    <div className="pc-panel">
      <header className="topbar pc-topbar">
        <div>
          <span className="breadcrumb">TECH BOOST / GESTIÓN FINANCIERA</span>
          <h1>Planes y Costos</h1>
          <p>Administra el catálogo de planes, calcula costos por producto y controla el flujo de dinero.</p>
        </div>
        <button className="button-secondary" onClick={() => empresaId && cargarDatosEmpresa(empresaId)} disabled={cargandoEmpresa || !empresaId}>
          ↻ Actualizar
        </button>
      </header>

      <div className="pc-content">
        {error && <div className="pc-alert pc-alert-error">{error}<button type="button" onClick={() => setError('')}>×</button></div>}
        {mensaje && <div className="pc-alert pc-alert-ok">{mensaje}<button type="button" onClick={() => setMensaje('')}>×</button></div>}

        <section className="pc-section">
          <div className="pc-section-heading">
            <div>
              <span className="pc-eyebrow">CATÁLOGO COMERCIAL</span>
              <h2>Planes de TECH BOOST</h2>
              <p>Precios mensuales del catálogo y servicios de implementación por proyecto.</p>
            </div>
          </div>
          <div className="pc-plans-grid">
            {planes.map((plan) => {
              const proyecto = plan.nombre.toLowerCase() === 'automatizacion_full';
              return (
                <article className={`pc-plan-card ${plan.nombre.toLowerCase() === 'predictivo_ia' ? 'pc-plan-featured' : ''}`} key={plan.planId}>
                  <span className="pc-plan-tag">PLAN {String(plan.planId).padStart(2, '0')}</span>
                  <h3>{nombrePlan(plan.nombre)}</h3>
                  <div className="pc-plan-price">
                    {proyecto ? 'Desde Bs. 12.000' : plan.precioMensualBs === '0.00' || Number(plan.precioMensualBs) === 0 ? 'Gratis' : moneda(plan.precioMensualBs)}
                  </div>
                  <p className="pc-plan-period">{proyecto ? 'Cotización por proyecto' : Number(plan.precioMensualBs) === 0 ? 'Paquete básico' : 'Por mes'}</p>
                  <ul>
                    {caracteristicasPlan(plan).map((caracteristica) => <li key={caracteristica}>{caracteristica}</li>)}
                  </ul>
                </article>
              );
            })}
            {planes.length === 0 && <div className="pc-message">No hay planes registrados en la tabla planes.</div>}
          </div>
          <p className="pc-note">El catálogo se obtiene de la base de datos. La automatización integral se cotiza por proyecto; el valor de referencia de Bs. 12.000 no es una suscripción mensual.</p>
        </section>

        <section className="pc-section">
          <div className="pc-section-heading pc-company-heading">
            <div>
              <span className="pc-eyebrow">COSTEO Y FINANZAS</span>
              <h2>Costos de la empresa</h2>
              <p>Selecciona la empresa cuyos productos, insumos y movimientos deseas consultar.</p>
            </div>
            <label className="pc-company-select">
              Empresa
              <select value={empresaId} onChange={(event) => setEmpresaId(event.target.value)}>
                {empresas.map((empresa) => <option key={empresa.empresaId} value={empresa.empresaId}>{empresa.razonSocial}</option>)}
              </select>
            </label>
          </div>

          {empresas.length === 0 ? (
            <div className="pc-message">No existen empresas registradas. Registra primero una empresa para administrar sus costos.</div>
          ) : (
            <>
              <div className="pc-kpis">
                <article className="pc-kpi"><span>Ingresos registrados</span><strong>{moneda(ingresos)}</strong><small>Ventas registradas</small></article>
                <article className="pc-kpi"><span>Egresos registrados</span><strong>{moneda(egresos)}</strong><small>Compras, gastos y pagos de destajo</small></article>
                <article className={`pc-kpi ${ingresos - egresos >= 0 ? 'pc-kpi-positive' : 'pc-kpi-negative'}`}><span>Balance registrado</span><strong>{moneda(ingresos - egresos)}</strong><small>Ingresos menos egresos</small></article>
              </div>

              <div className="pc-subsection">
                <div className="pc-subsection-heading">
                  <div><h3>Costos por producto</h3><p>Calcula el costo unitario usando insumos, merma, mano de obra y otros costos.</p></div>
                  <div className="pc-toolbar-actions">
                    <button className="button-secondary" onClick={() => setMostrarInsumo(true)}>+ Nuevo insumo</button>
                    <button className="button-primary" onClick={() => abrirProducto()}>+ Nuevo producto</button>
                  </div>
                </div>

                {cargandoEmpresa ? <div className="pc-message">Cargando información de la empresa...</div> : (
                  <div className="pc-table-wrap">
                    <table className="pc-table">
                      <thead><tr><th>PRODUCTO</th><th>UNIDAD</th><th>PRECIO VENTA</th><th>COSTO UNITARIO</th><th>MARGEN</th><th>ACCIONES</th></tr></thead>
                      <tbody>
                        {productos.map((producto) => (
                          <tr key={producto.productoId}>
                            <td><strong>{producto.nombre}</strong><small>{producto.sku || 'Sin SKU'}</small></td>
                            <td>{producto.unidadMedida}</td>
                            <td>{moneda(producto.precioVentaBs)}</td>
                            <td>{producto.costoCalculadoBs === null ? 'Sin calcular' : moneda(producto.costoCalculadoBs)}</td>
                            <td>{producto.margenGananciaPct === null ? '—' : `${Number(producto.margenGananciaPct).toFixed(2)}%`}</td>
                            <td>
                              <div className="pc-row-actions">
                                <button className="table-action" onClick={() => { setProductoReceta(producto); setError(''); }}>Receta</button>
                                <button className="table-action" onClick={() => abrirProducto(producto)}>Editar</button>
                                <button className="table-action pc-calc-button" onClick={() => void ejecutarCalculo(producto)}>Calcular</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {productos.length === 0 && <tr><td colSpan={6} className="pc-empty">Todavía no hay productos registrados para esta empresa.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="pc-subsection">
                <div className="pc-subsection-heading">
                  <div><h3>Insumos registrados</h3><p>Materias primas y materiales con su costo promedio y existencias.</p></div>
                </div>
                <div className="pc-table-wrap">
                  <table className="pc-table">
                    <thead><tr><th>INSUMO</th><th>UNIDAD</th><th>STOCK</th><th>STOCK MÍNIMO</th><th>COSTO UNITARIO</th></tr></thead>
                    <tbody>
                      {insumos.map((insumo) => <tr key={insumo.insumoId}><td><strong>{insumo.nombre}</strong></td><td>{insumo.unidadMedida}</td><td>{Number(insumo.stockActual).toFixed(3)}</td><td>{Number(insumo.stockMinimoAlerta).toFixed(3)}</td><td>{moneda(insumo.costoUnitarioPromedioBs)}</td></tr>)}
                      {insumos.length === 0 && <tr><td colSpan={5} className="pc-empty">No hay insumos registrados para esta empresa.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pc-subsection">
                <div className="pc-subsection-heading">
                  <div><h3>Flujo de dinero</h3><p>Registro de ventas, compras de insumos y gastos operativos.</p></div>
                  <button className="button-primary" onClick={() => { setError(''); setMostrarOperacion(true); }}>+ Registrar movimiento</button>
                </div>
                <div className="pc-table-wrap">
                  <table className="pc-table">
                    <thead><tr><th>FECHA</th><th>TIPO</th><th>DESCRIPCIÓN</th><th>MONTO</th></tr></thead>
                    <tbody>
                      {[...operaciones].sort((a, b) => (b.fechaOperacion ?? '').localeCompare(a.fechaOperacion ?? '')).slice(0, 20).map((operacion) => (
                        <tr key={operacion.registroId}>
                          <td>{operacion.fechaOperacion ? new Date(operacion.fechaOperacion).toLocaleDateString('es-BO') : '—'}</td>
                          <td><span className={`pc-operation-tag ${operacion.tipoMovimiento === 'venta' ? 'pc-income' : 'pc-expense'}`}>{operacion.tipoMovimiento.replaceAll('_', ' ')}</span></td>
                          <td>{operacion.descripcion || 'Sin descripción'}</td>
                          <td>{moneda(operacion.montoBs)}</td>
                        </tr>
                      ))}
                      {operaciones.length === 0 && <tr><td colSpan={4} className="pc-empty">No existen movimientos financieros registrados.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <p className="pc-note">El balance considera los registros operativos cargados (máximo 100 registros por consulta). No representa una contabilidad formal ni sustituye conciliaciones bancarias.</p>
              </div>
            </>
          )}
        </section>
      </div>

      {mostrarProducto && (
        <div className="pc-modal-backdrop" onClick={() => setMostrarProducto(false)}>
          <section className="pc-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pc-modal-head"><div><span className="pc-eyebrow">COSTOS POR PRODUCTO</span><h2>{productoEditando ? 'Editar producto' : 'Registrar producto'}</h2></div><button className="pc-close" onClick={() => setMostrarProducto(false)}>×</button></div>
            <form className="pc-form" onSubmit={guardarProducto}>
              <label>Nombre del producto<input value={nombreProducto} onChange={(event) => setNombreProducto(event.target.value)} maxLength={120} required /></label>
              <div className="pc-form-grid"><label>SKU (opcional)<input value={sku} onChange={(event) => setSku(event.target.value)} maxLength={50} /></label><label>Unidad de medida<input value={unidadMedida} onChange={(event) => setUnidadMedida(event.target.value)} maxLength={30} placeholder="par, prenda, kg, unidad" required /></label></div>
              <label>Precio de venta por unidad (Bs.)<input type="number" min="0" step="0.01" value={precioVenta} onChange={(event) => setPrecioVenta(event.target.value)} required /></label>
              <div className="pc-form-grid"><label>Mano de obra por unidad (Bs.)<input type="number" min="0" step="0.01" value={costoManoObra} onChange={(event) => setCostoManoObra(event.target.value)} required /></label><label>Otros costos por unidad (Bs.)<input type="number" min="0" step="0.01" value={otrosCostos} onChange={(event) => setOtrosCostos(event.target.value)} required /></label></div>
              <p className="pc-help">Los costos de materiales se agregan desde «Receta». El costo unitario total se calcula después con el botón «Calcular».</p>
              {error && <div className="pc-form-error">{error}</div>}
              <div className="pc-form-actions"><button type="button" className="button-secondary" onClick={() => setMostrarProducto(false)}>Cancelar</button><button type="submit" className="button-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar producto'}</button></div>
            </form>
          </section>
        </div>
      )}

      {mostrarInsumo && (
        <div className="pc-modal-backdrop" onClick={() => setMostrarInsumo(false)}>
          <section className="pc-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pc-modal-head"><div><span className="pc-eyebrow">MATERIALES</span><h2>Registrar insumo</h2></div><button className="pc-close" onClick={() => setMostrarInsumo(false)}>×</button></div>
            <form className="pc-form" onSubmit={guardarInsumo}>
              <label>Nombre del insumo<input value={nombreInsumo} onChange={(event) => setNombreInsumo(event.target.value)} maxLength={100} required /></label>
              <div className="pc-form-grid"><label>Unidad de medida<input value={unidadInsumo} onChange={(event) => setUnidadInsumo(event.target.value)} maxLength={20} placeholder="metros, kg, litros" required /></label><label>Costo unitario promedio (Bs.)<input type="number" min="0" step="0.01" value={costoInsumo} onChange={(event) => setCostoInsumo(event.target.value)} required /></label></div>
              <div className="pc-form-grid"><label>Stock actual<input type="number" min="0" step="0.001" value={stockInsumo} onChange={(event) => setStockInsumo(event.target.value)} required /></label><label>Stock mínimo de alerta<input type="number" min="0" step="0.001" value={stockMinimo} onChange={(event) => setStockMinimo(event.target.value)} required /></label></div>
              {error && <div className="pc-form-error">{error}</div>}
              <div className="pc-form-actions"><button type="button" className="button-secondary" onClick={() => setMostrarInsumo(false)}>Cancelar</button><button type="submit" className="button-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar insumo'}</button></div>
            </form>
          </section>
        </div>
      )}

      {productoReceta && (
        <div className="pc-modal-backdrop" onClick={() => setProductoReceta(null)}>
          <section className="pc-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pc-modal-head"><div><span className="pc-eyebrow">COMPOSICIÓN DEL PRODUCTO</span><h2>Receta de {productoReceta.nombre}</h2></div><button className="pc-close" onClick={() => setProductoReceta(null)}>×</button></div>
            <form className="pc-form" onSubmit={agregarReceta}>
              <label>Insumo<select value={insumoSeleccionado} onChange={(event) => setInsumoSeleccionado(event.target.value)} required><option value="">Selecciona un insumo</option>{insumos.map((insumo) => <option key={insumo.insumoId} value={insumo.insumoId}>{insumo.nombre} — {moneda(insumo.costoUnitarioPromedioBs)} / {insumo.unidadMedida}</option>)}</select></label>
              <div className="pc-form-grid"><label>Cantidad requerida por unidad<input type="number" min="0.0001" step="0.0001" value={cantidadReceta} onChange={(event) => setCantidadReceta(event.target.value)} required /></label><label>Merma estimada (%)<input type="number" min="0" max="100" step="0.01" value={mermaReceta} onChange={(event) => setMermaReceta(event.target.value)} required /></label></div>
              <button type="submit" className="button-primary" disabled={guardando || insumos.length === 0}>{guardando ? 'Agregando...' : 'Agregar insumo a la receta'}</button>
            </form>
            <div className="pc-recipe-list"><h3>Insumos de esta receta</h3>
              {recetasProducto.length === 0 ? <p className="pc-help">Todavía no se agregaron insumos a este producto.</p> : recetasProducto.map((receta) => {
                const insumo = insumos.find((item) => item.insumoId === receta.insumoId);
                return <div className="pc-recipe-row" key={receta.recetaId}><div><strong>{insumo?.nombre ?? 'Insumo no encontrado'}</strong><small>{receta.cantidadRequerida} {insumo?.unidadMedida ?? ''} · Merma {Number(receta.porcentajeMermaEstimada ?? 0).toFixed(2)}%</small></div><button type="button" className="pc-remove" onClick={() => void quitarReceta(receta.recetaId)}>Quitar</button></div>;
              })}
            </div>
            <div className="pc-form-actions"><button type="button" className="button-secondary" onClick={() => setProductoReceta(null)}>Cerrar</button><button type="button" className="button-primary" onClick={() => void ejecutarCalculo(productoReceta)}>Calcular costo del producto</button></div>
          </section>
        </div>
      )}

      {mostrarOperacion && (
        <div className="pc-modal-backdrop" onClick={() => setMostrarOperacion(false)}>
          <section className="pc-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pc-modal-head"><div><span className="pc-eyebrow">FLUJO DE DINERO</span><h2>Registrar movimiento</h2></div><button className="pc-close" onClick={() => setMostrarOperacion(false)}>×</button></div>
            <form className="pc-form" onSubmit={guardarOperacion}>
              <label>Tipo de movimiento<select value={tipoOperacion} onChange={(event) => setTipoOperacion(event.target.value as typeof tipoOperacion)}><option value="venta">Venta / ingreso</option><option value="compra_insumo">Compra de insumos</option><option value="gasto_operativo">Gasto operativo</option></select></label>
              <div className="pc-form-grid"><label>Fecha<input type="date" value={fechaOperacion} onChange={(event) => setFechaOperacion(event.target.value)} required /></label><label>Monto (Bs.)<input type="number" min="0.01" step="0.01" value={montoOperacion} onChange={(event) => setMontoOperacion(event.target.value)} required /></label></div>
              <label>Descripción<input value={descripcionOperacion} onChange={(event) => setDescripcionOperacion(event.target.value)} maxLength={500} placeholder="Ej. Venta de lote de zapatos" required /></label>
              <p className="pc-help">Este registro actualiza el flujo financiero. Para modificar existencias, registra los cambios en el módulo de insumos.</p>
              {error && <div className="pc-form-error">{error}</div>}
              <div className="pc-form-actions"><button type="button" className="button-secondary" onClick={() => setMostrarOperacion(false)}>Cancelar</button><button type="submit" className="button-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Registrar movimiento'}</button></div>
            </form>
          </section>
        </div>
      )}

      {resultadoCosto && (
        <div className="pc-modal-backdrop" onClick={() => setResultadoCosto(null)}>
          <section className="pc-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pc-modal-head"><div><span className="pc-eyebrow">RESULTADO DEL COSTEO</span><h2>{resultadoCosto.producto.nombre}</h2></div><button className="pc-close" onClick={() => setResultadoCosto(null)}>×</button></div>
            <div className="pc-result-grid">
              <div><span>Costo unitario total</span><strong>{moneda(resultadoCosto.totales.costoCalculadoBs)}</strong></div>
              <div><span>Precio de venta</span><strong>{moneda(resultadoCosto.totales.precioVentaBs)}</strong></div>
              <div><span>Utilidad por unidad</span><strong>{moneda(resultadoCosto.totales.utilidadPorUnidadBs)}</strong></div>
              <div><span>Margen sobre venta</span><strong>{resultadoCosto.totales.margenGananciaPct.toFixed(2)}%</strong></div>
            </div>
            <div className="pc-breakdown"><div><span>Materiales (incluye merma)</span><strong>{moneda(resultadoCosto.totales.costoMaterialesBs)}</strong></div><div><span>Mano de obra</span><strong>{moneda(resultadoCosto.totales.costoManoObraBs)}</strong></div><div><span>Otros costos</span><strong>{moneda(resultadoCosto.totales.otrosCostosBs)}</strong></div></div>
            {resultadoCosto.materiales.length > 0 && <div className="pc-recipe-list"><h3>Desglose de materiales</h3>{resultadoCosto.materiales.map((item) => <div className="pc-recipe-row" key={item.recetaId}><div><strong>{item.insumo}</strong><small>{item.cantidadConMerma} {item.unidadMedida} con merma incluida</small></div><strong>{moneda(item.costoTotalBs)}</strong></div>)}</div>}
            <div className="pc-form-actions"><button className="button-primary" onClick={() => setResultadoCosto(null)}>Cerrar resultado</button></div>
          </section>
        </div>
      )}
    </div>
  );
}

export default PlanesCostosPanel;
