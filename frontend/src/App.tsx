import PlanesCostosPanel from './components/PlanesCostosPanel';
import TrabajadorForm from './components/TrabajadorForm';
import MovimientoForm from './components/MovimientoForm';
import DestajoPanel from './components/DestajoPanel';
import { useEffect, useMemo, useState } from 'react';
import MarketingPanel from './components/MarketingPanel';
import './App.css';

import {
  obtenerTrabajadores,
  obtenerHistorial,
} from './services/trabajadores.service';

import type {
  Trabajador,
  Movimiento,
} from './types/trabajador.types';

type FiltroEstado = 'todos' | 'activos' | 'inactivos';

function App() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>('todos');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [trabajadorSeleccionado, setTrabajadorSeleccionado] =
    useState<Trabajador | null>(null);

  const [historial, setHistorial] = useState<Movimiento[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [trabajadorEditar, setTrabajadorEditar] =
    useState<Trabajador | null>(null);

  const [mostrarMovimiento, setMostrarMovimiento] = useState(false);

  const [trabajadorMovimiento, setTrabajadorMovimiento] =
    useState<Trabajador | null>(null);

  const [seccionActiva, setSeccionActiva] = useState<'recursos-humanos' | 'planes-costos' | 'marketing'>('recursos-humanos');


  async function cargarTrabajadores() {
    try {
      setCargando(true);
      setError('');

      const respuesta = await obtenerTrabajadores(100);

      setTrabajadores(respuesta.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la lista de trabajadores.',
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTrabajadores();
  }, []);

  const trabajadoresFiltrados = useMemo(() => {
    return trabajadores.filter((trabajador) => {
      const texto = busqueda.toLowerCase().trim();

      const coincideBusqueda =
        trabajador.nombreCompleto.toLowerCase().includes(texto) ||
        (trabajador.cargo ?? '').toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === 'todos' ||
        (filtroEstado === 'activos' && trabajador.activo === true) ||
        (filtroEstado === 'inactivos' && trabajador.activo !== true);

      return coincideBusqueda && coincideEstado;
    });
  }, [trabajadores, busqueda, filtroEstado]);

  const totalTrabajadores = trabajadores.length;

  const totalActivos = trabajadores.filter(
    (trabajador) => trabajador.activo === true,
  ).length;

  const totalInactivos = totalTrabajadores - totalActivos;

  async function abrirHistorial(trabajador: Trabajador) {
    setTrabajadorSeleccionado(trabajador);
    setHistorial([]);
    setErrorHistorial('');

    try {
      setCargandoHistorial(true);

      const respuesta = await obtenerHistorial(
        trabajador.trabajadorId,
      );

      setHistorial(respuesta);
    } catch (err) {
      setErrorHistorial(
        err instanceof Error
          ? err.message
          : 'No se pudo consultar el historial laboral.',
      );
    } finally {
      setCargandoHistorial(false);
    }
  }

  function cerrarHistorial() {
    setTrabajadorSeleccionado(null);
    setHistorial([]);
    setErrorHistorial('');
  }

  function formatoFecha(fecha: string) {
    if (!fecha) return '-';

    const partes = fecha.substring(0, 10).split('-');

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">TB</div>
          <div>
            <h2>TECH BOOST</h2>
            <span>Panel empresarial</span>
          </div>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">GESTIÓN EMPRESARIAL</span>

          <button
            type="button"
            className={`sidebar-item ${seccionActiva === 'recursos-humanos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('recursos-humanos')}
          >
            <span className="sidebar-icon">▦</span>
            Recursos Humanos
          </button>

          <button
            type="button"
            className={`sidebar-item ${seccionActiva === 'marketing' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('marketing')}
          >
            <span className="sidebar-icon">◈</span>
            Marketing
          </button>

          <button
            type="button"
            className={`sidebar-item ${seccionActiva === 'planes-costos' ? 'active' : ''}`}
            onClick={() => setSeccionActiva('planes-costos')}
          >
            <span className="sidebar-icon">▤</span>
            Planes y Costos
          </button>

        </div>

        <div className="sidebar-footer">
          <div className="user-avatar">A</div>
          <div>
            <strong>Administrador</strong>
            <span>Gestión empresarial</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {seccionActiva === 'recursos-humanos' && (
          <>
        <header className="topbar">
          <div>
            <span className="breadcrumb">
              TECH BOOST / RECURSOS HUMANOS
            </span>
            <h1>Recursos Humanos</h1>
            <p>
              Administración y control del personal de la empresa.
            </p>
          </div>

          <button
            className="button-secondary"
            onClick={cargarTrabajadores}
            disabled={cargando}
          >
            ↻ Actualizar
          </button>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-icon blue">♙</div>
            <div>
              <span>Total de trabajadores</span>
              <strong>{totalTrabajadores}</strong>
              <small>Personal registrado</small>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">✓</div>
            <div>
              <span>Trabajadores activos</span>
              <strong>{totalActivos}</strong>
              <small>Personal habilitado</small>
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-icon orange">Ⅱ</div>
            <div>
              <span>Trabajadores inactivos</span>
              <strong>{totalInactivos}</strong>
              <small>Personal no habilitado</small>
            </div>
          </article>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Gestión de trabajadores</h2>
              <p>Consulta y administra el personal registrado.</p>
            </div>

            <button
              className="button-primary"
              onClick={() => {
                setTrabajadorEditar(null);
                setMostrarFormulario(true);
              }}
            >
              + Registrar trabajador
            </button>
          </div>

          <div className="toolbar">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Buscar por nombre o cargo..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(event) =>
                setFiltroEstado(event.target.value as FiltroEstado)
              }
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>

          {cargando && (
            <div className="message-box">
              Cargando trabajadores...
            </div>
          )}

          {!cargando && error && (
            <div className="message-box error-message">
              <strong>No se pudo cargar la información.</strong>
              <span>{error}</span>
              <button onClick={cargarTrabajadores}>
                Intentar nuevamente
              </button>
            </div>
          )}

          {!cargando && !error && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>TRABAJADOR</th>
                    <th>CARGO</th>
                    <th>MODALIDAD DE PAGO</th>
                    <th>TARIFA BASE</th>
                    <th>ESTADO</th>
                    <th>ACCIONES</th>
                  </tr>
                </thead>

                <tbody>
                  {trabajadoresFiltrados.map((trabajador) => (
                    <tr key={trabajador.trabajadorId}>
                      <td>
                        <div className="worker-cell">
                          <div className="worker-avatar">
                            {trabajador.nombreCompleto
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{trabajador.nombreCompleto}</strong>
                            <small>
                              {trabajador.trabajadorId.slice(0, 8)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{trabajador.cargo || 'Sin cargo'}</td>

                      <td>
                        {trabajador.modalidadPago}
                      </td>

                      <td>
                        Bs. {Number(trabajador.tarifaBaseBs).toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={`status ${
                            trabajador.activo === true
                              ? 'status-active'
                              : 'status-inactive'
                          }`}
                        >
                          {trabajador.activo === true
                            ? 'Activo'
                            : 'Inactivo'}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="table-action"
                            onClick={() => {
                              setTrabajadorEditar(trabajador);
                              setMostrarFormulario(true);
                            }}
                          >
                            Editar
                          </button>

                          <button
                            className="table-action"
                            onClick={() => abrirHistorial(trabajador)}
                          >
                            Historial
                          </button>

                          <button
                            className="table-action"
                            onClick={() => {
                              setTrabajadorMovimiento(trabajador);
                              setMostrarMovimiento(true);
                            }}
                          >
                            Movimiento
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {trabajadoresFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-table">
                        No se encontraron trabajadores.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-footer">
            Mostrando {trabajadoresFiltrados.length} de{' '}
            {totalTrabajadores} trabajadores
          </div>
        </section>

        <DestajoPanel trabajadores={trabajadores} />
          </>
        )}

        {seccionActiva === 'planes-costos' && <PlanesCostosPanel />}
        {seccionActiva === 'marketing' && <MarketingPanel />}

      </main>

      {trabajadorSeleccionado && (
        <div className="modal-overlay" onClick={cerrarHistorial}>
          <section
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="breadcrumb">RECURSOS HUMANOS</span>
                <h2>Historial laboral</h2>
                <p>{trabajadorSeleccionado.nombreCompleto}</p>
              </div>

              <button
                className="close-button"
                onClick={cerrarHistorial}
              >
                ×
              </button>
            </div>

            {cargandoHistorial && (
              <div className="message-box">
                Consultando historial...
              </div>
            )}

            {!cargandoHistorial && errorHistorial && (
              <div className="message-box error-message">
                {errorHistorial}
              </div>
            )}

            {!cargandoHistorial &&
              !errorHistorial &&
              historial.length === 0 && (
                <div className="message-box">
                  Este trabajador todavía no tiene movimientos registrados.
                </div>
              )}

            {!cargandoHistorial &&
              !errorHistorial &&
              historial.length > 0 && (
                <div className="history-list">
                  {historial.map((movimiento) => (
                    <article
                      className="history-item"
                      key={movimiento.movimientoId}
                    >
                      <div className="history-dot" />

                      <div>
                        <strong>
                          {movimiento.tipoMovimiento.toUpperCase()}
                        </strong>

                        <span>
                          {formatoFecha(movimiento.fechaMovimiento)}
                        </span>

                        {movimiento.cargoAnterior && (
                          <p>
                            Cargo anterior: {movimiento.cargoAnterior}
                          </p>
                        )}

                        {movimiento.cargoNuevo && (
                          <p>
                            Cargo nuevo: {movimiento.cargoNuevo}
                          </p>
                        )}

                        {movimiento.motivo && (
                          <p>Motivo: {movimiento.motivo}</p>
                        )}

                        {movimiento.observaciones && (
                          <p>
                            Observaciones: {movimiento.observaciones}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
          </section>
        </div>
      )}

      {/* Modal para registrar o editar trabajadores */}
      {mostrarFormulario && (
        <TrabajadorForm
          trabajador={trabajadorEditar}
          onCerrar={() => {
            setMostrarFormulario(false);
            setTrabajadorEditar(null);
          }}
          onGuardado={cargarTrabajadores}
        />
      )}

      {mostrarMovimiento && trabajadorMovimiento && (
        <MovimientoForm
          trabajador={trabajadorMovimiento}
          onCerrar={() => {
            setMostrarMovimiento(false);
            setTrabajadorMovimiento(null);
          }}
          onGuardado={cargarTrabajadores}
        />
      )}

    </div>
  );
}

export default App;
