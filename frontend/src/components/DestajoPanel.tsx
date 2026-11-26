import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerEmpresas } from '../services/empresas.service';
import {
  marcarDestajoPagado,
  obtenerRegistrosDestajo,
  obtenerResumenDestajo,
} from '../services/destajo.service';
import type { Empresa } from '../types/empresa.types';
import type {
  RegistroDestajo,
  ResumenDestajo,
} from '../types/destajo.types';
import type { Trabajador } from '../types/trabajador.types';
import RegistroDestajoForm from './RegistroDestajoForm';

interface DestajoPanelProps {
  trabajadores: Trabajador[];
}

function fechaActual() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function primerDiaMes() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  return `${anio}-${mes}-01`;
}

const resumenVacio: ResumenDestajo = {
  totales: {
    cantidadRegistros: 0,
    unidadesEntregadas: 0,
    montoGeneradoBs: 0,
    montoPagadoBs: 0,
    montoPendienteBs: 0,
  },
  trabajadores: [],
};

function dinero(valor: number) {
  return `Bs. ${Number(valor || 0).toFixed(2)}`;
}

function fechaBonita(fecha: string) {
  if (!fecha) return '—';
  const partes = fecha.substring(0, 10).split('-');
  return partes.length === 3
    ? `${partes[2]}/${partes[1]}/${partes[0]}`
    : fecha;
}

function DestajoPanel({ trabajadores }: DestajoPanelProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState('');
  const [desde, setDesde] = useState(primerDiaMes);
  const [hasta, setHasta] = useState(fechaActual);
  const [trabajadorFiltro, setTrabajadorFiltro] = useState('');
  const [filtroPagado, setFiltroPagado] = useState('todos');

  const [registros, setRegistros] = useState<RegistroDestajo[]>([]);
  const [resumen, setResumen] = useState<ResumenDestajo>(resumenVacio);
  const [cargando, setCargando] = useState(false);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(true);
  const [error, setError] = useState('');
  const [errorEmpresas, setErrorEmpresas] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargarEmpresas() {
      try {
        setCargandoEmpresas(true);
        const resultado = await obtenerEmpresas();
        if (!activo) return;
        setEmpresas(resultado);
        setEmpresaId((actual) =>
          actual || resultado[0]?.empresaId || trabajadores[0]?.empresaId || '',
        );
      } catch (err) {
        if (!activo) return;
        setErrorEmpresas(
          err instanceof Error
            ? err.message
            : 'No se pudieron cargar las empresas.',
        );
        setEmpresaId((actual) => actual || trabajadores[0]?.empresaId || '');
      } finally {
        if (activo) setCargandoEmpresas(false);
      }
    }

    void cargarEmpresas();
    return () => {
      activo = false;
    };
    // La selección inicial se establece una sola vez al montar el panel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (trabajadores.length > 0 && !trabajadores.some((trabajador) => trabajador.empresaId === empresaId)) {
      setEmpresaId(trabajadores[0].empresaId);
    }
  }, [trabajadores, empresaId]);

  const cargarDatos = useCallback(async () => {
    if (!empresaId) {
      setRegistros([]);
      setResumen(resumenVacio);
      setCargando(false);
      return;
    }

    if (desde && hasta && desde > hasta) {
      setError('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    try {
      setCargando(true);
      setError('');

      const filtroPago = filtroPagado === 'todos'
        ? undefined
        : filtroPagado === 'pagados' ? 'true' as const : 'false' as const;

      const [lista, resumenActual] = await Promise.all([
        obtenerRegistrosDestajo({
          empresaId,
          desde,
          hasta,
          pagado: filtroPago,
        }),
        obtenerResumenDestajo(empresaId, desde, hasta),
      ]);

      setRegistros(lista);
      setResumen(resumenActual);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el control de trabajo a destajo.',
      );
    } finally {
      setCargando(false);
    }
  }, [empresaId, desde, hasta, filtroPagado]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const empresasVisibles = useMemo(() => {
    const ids = new Set(trabajadores.map((trabajador) => trabajador.empresaId));
    return empresas.filter((empresa) => ids.has(empresa.empresaId));
  }, [empresas, trabajadores]);

  const trabajadoresEmpresa = useMemo(
    () => trabajadores.filter((trabajador) => trabajador.empresaId === empresaId),
    [trabajadores, empresaId],
  );

  const trabajadoresDestajo = useMemo(
    () => trabajadoresEmpresa.filter(
      (trabajador) =>
        trabajador.activo === true &&
        ['destajo', 'mixto'].includes(trabajador.modalidadPago),
    ),
    [trabajadoresEmpresa],
  );

  const registrosFiltrados = useMemo(
    () => registros.filter(
      (registro) =>
        !trabajadorFiltro || registro.trabajadorId === trabajadorFiltro,
    ),
    [registros, trabajadorFiltro],
  );

  async function pagarRegistro(registro: RegistroDestajo) {
    try {
      setProcesandoPago(registro.destajoId);
      setError('');
      await marcarDestajoPagado(registro.destajoId);
      await cargarDatos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el pago.',
      );
    } finally {
      setProcesandoPago('');
    }
  }

  return (
    <section className="content-card destajo-section">
      <div className="section-heading">
        <div>
          <span className="breadcrumb">RECURSOS HUMANOS / CONTROL DE PRODUCCIÓN</span>
          <h2>Trabajo a destajo</h2>
          <p>Controla las unidades entregadas y los importes que corresponden pagar.</p>
        </div>
        <button
          className="button-primary"
          onClick={() => setMostrarFormulario(true)}
          disabled={trabajadoresDestajo.length === 0}
        >
          + Registrar producción
        </button>
      </div>

      <div className="destajo-filters">
        <label>
          Empresa
          <select
            value={empresaId}
            onChange={(event) => {
              setEmpresaId(event.target.value);
              setTrabajadorFiltro('');
            }}
            disabled={cargandoEmpresas}
          >
            <option value="">Seleccionar empresa</option>
            {(empresasVisibles.length > 0 ? empresasVisibles : empresas).map((empresa) => (
              <option key={empresa.empresaId} value={empresa.empresaId}>
                {empresa.razonSocial}
              </option>
            ))}
            {empresas.length === 0 && [...new Set(trabajadores.map((trabajador) => trabajador.empresaId))].map((id) => (
              <option key={id} value={id}>
                Empresa {id.slice(0, 8)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Desde
          <input
            type="date"
            value={desde}
            onChange={(event) => setDesde(event.target.value)}
          />
        </label>

        <label>
          Hasta
          <input
            type="date"
            value={hasta}
            onChange={(event) => setHasta(event.target.value)}
          />
        </label>
      </div>

      <div className="destajo-kpis">
        <article className="destajo-kpi">
          <span>Registros de producción</span>
          <strong>{resumen.totales.cantidadRegistros}</strong>
          <small>En el periodo seleccionado</small>
        </article>
        <article className="destajo-kpi">
          <span>Importe generado</span>
          <strong>{dinero(resumen.totales.montoGeneradoBs)}</strong>
          <small>Producción entregada</small>
        </article>
        <article className="destajo-kpi paid">
          <span>Importe pagado</span>
          <strong>{dinero(resumen.totales.montoPagadoBs)}</strong>
          <small>Pagos registrados</small>
        </article>
        <article className="destajo-kpi pending">
          <span>Pendiente de pago</span>
          <strong>{dinero(resumen.totales.montoPendienteBs)}</strong>
          <small>Importe todavía no pagado</small>
        </article>
      </div>

      <div className="destajo-toolbar">
        <label>
          Trabajador
          <select
            value={trabajadorFiltro}
            onChange={(event) => setTrabajadorFiltro(event.target.value)}
          >
            <option value="">Todos los trabajadores</option>
            {trabajadoresEmpresa.map((trabajador) => (
              <option key={trabajador.trabajadorId} value={trabajador.trabajadorId}>
                {trabajador.nombreCompleto}
              </option>
            ))}
          </select>
        </label>

        <label>
          Estado de pago
          <select
            value={filtroPagado}
            onChange={(event) => setFiltroPagado(event.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendientes">Pendientes</option>
            <option value="pagados">Pagados</option>
          </select>
        </label>
      </div>

      {errorEmpresas && (
        <div className="message-box error-message">{errorEmpresas}</div>
      )}

      {error && (
        <div className="message-box error-message">{error}</div>
      )}

      {cargando && (
        <div className="message-box">Cargando registros de producción...</div>
      )}

      {!cargando && !error && empresaId && (
        <div className="table-container">
          <table className="destajo-table">
            <thead>
              <tr>
                <th>FECHA</th>
                <th>TRABAJADOR</th>
                <th>TRABAJO REALIZADO</th>
                <th>CANTIDAD</th>
                <th>TARIFA / UNIDAD</th>
                <th>IMPORTE</th>
                <th>ESTADO</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map((registro) => (
                <tr key={registro.destajoId}>
                  <td>{fechaBonita(registro.fechaTrabajo)}</td>
                  <td><strong>{registro.trabajadorNombre}</strong></td>
                  <td>{registro.descripcionTrabajo}</td>
                  <td className="mono-cell">{registro.cantidadUnidadesEntregadas}</td>
                  <td>{dinero(registro.tarifaUnitariaBs)}</td>
                  <td><strong>{dinero(registro.montoGanadoBs)}</strong></td>
                  <td>
                    <span className={`status ${registro.pagado ? 'status-active' : 'status-pending'}`}>
                      {registro.pagado ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    {!registro.pagado ? (
                      <button
                        className="table-action pay-action"
                        onClick={() => void pagarRegistro(registro)}
                        disabled={procesandoPago === registro.destajoId}
                      >
                        {procesandoPago === registro.destajoId ? 'Procesando...' : 'Marcar pagado'}
                      </button>
                    ) : (
                      <span className="paid-date">
                        {registro.fechaPago
                          ? `Pagado ${new Date(registro.fechaPago).toLocaleDateString('es-BO')}`
                          : 'Pago histórico'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {registrosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-table">
                    No existen registros de producción para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && !empresaId && !error && (
        <div className="message-box">
          Registra una empresa y trabajadores para habilitar el control de destajo.
        </div>
      )}

      <div className="destajo-summary-table">
        <div>
          <h3>Resumen por trabajador</h3>
          <p>Producción e importes acumulados dentro del periodo.</p>
        </div>
        {resumen.trabajadores.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>TRABAJADOR</th>
                  <th>REGISTROS</th>
                  <th>UNIDADES</th>
                  <th>GENERADO</th>
                  <th>PAGADO</th>
                  <th>PENDIENTE</th>
                </tr>
              </thead>
              <tbody>
                {resumen.trabajadores.map((item) => (
                  <tr key={item.trabajadorId}>
                    <td><strong>{item.trabajadorNombre}</strong></td>
                    <td>{item.cantidadRegistros}</td>
                    <td>{item.unidadesEntregadas.toFixed(2)}</td>
                    <td>{dinero(item.montoGeneradoBs)}</td>
                    <td>{dinero(item.montoPagadoBs)}</td>
                    <td><strong>{dinero(item.montoPendienteBs)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="message-box">Todavía no hay producción registrada en este periodo.</div>
        )}
      </div>

      {trabajadoresDestajo.length === 0 && empresaId && (
        <p className="destajo-hint">
          Para registrar producción, la empresa debe tener trabajadores activos con modalidad de pago “Destajo” o “Mixto”.
        </p>
      )}

      {mostrarFormulario && (
        <RegistroDestajoForm
          trabajadores={trabajadoresDestajo}
          onCerrar={() => setMostrarFormulario(false)}
          onGuardado={cargarDatos}
        />
      )}
    </section>
  );
}

export default DestajoPanel;
