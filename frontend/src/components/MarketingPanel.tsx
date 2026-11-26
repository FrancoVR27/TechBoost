import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { obtenerEmpresas } from '../services/empresas.service';
import {
  actualizarCampaniaMarketing,
  actualizarContactoMarketing,
  crearCampaniaMarketing,
  crearContactoMarketing,
  crearInteraccionMarketing,
  eliminarCampaniaMarketing,
  eliminarContactoMarketing,
  obtenerCampaniasMarketing,
  obtenerContactosMarketing,
  obtenerInteraccionesMarketing,
  obtenerResumenMarketing,
} from '../services/marketing.service';
import type { Empresa } from '../types/empresa.types';
import type {
  CanalCampania,
  CrearMarketingCampania,
  CrearMarketingContacto,
  EstadoCampania,
  EstadoContacto,
  FuenteContacto,
  MarketingCampania,
  MarketingContacto,
  MarketingInteraccion,
  ObjetivoCampania,
  ResultadoInteraccion,
  ResumenMarketing,
  TipoInteraccion,
} from '../types/marketing.types';

type Pestana = 'resumen' | 'contactos' | 'campanias';
type FiltroContacto = 'todos' | EstadoContacto;

const resumenVacio: ResumenMarketing = {
  totalContactos: 0,
  prospectos: 0,
  clientes: 0,
  perdidos: 0,
  campaniasActivas: 0,
  presupuestoTotalBs: 0,
  gastoRealTotalBs: 0,
  seguimientosPendientes: 0,
  tasaConversionPct: 0,
  contactosPorFuente: [],
};

const nuevoContacto = (): CrearMarketingContacto => ({
  campaniaId: null,
  nombreCompleto: '',
  empresaContacto: '',
  correo: '',
  telefono: '',
  rubro: '',
  fuente: 'otro',
  estado: 'nuevo',
  necesidad: '',
  notas: '',
  proximoSeguimiento: null,
});

const fechaHoy = () => {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const nuevaCampania = (): CrearMarketingCampania => ({
  nombre: '',
  objetivo: 'generacion_leads',
  canal: 'redes_sociales',
  presupuestoBs: '0',
  gastoRealBs: '0',
  estado: 'planificada',
  fechaInicio: fechaHoy(),
  fechaFin: null,
  descripcion: '',
});

const moneda = (valor: number | string | null | undefined) =>
  `Bs. ${Number(valor ?? 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatoFecha = (valor: string | null | undefined) => {
  if (!valor) return 'Sin fecha';
  const partes = valor.slice(0, 10).split('-');
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : valor;
};

const etiqueta = (valor: string) =>
  valor.replaceAll('_', ' ').replace(/\b\w/g, (letra) => letra.toUpperCase());

function MarketingPanel() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState('');
  const [resumen, setResumen] = useState<ResumenMarketing>(resumenVacio);
  const [contactos, setContactos] = useState<MarketingContacto[]>([]);
  const [campanias, setCampanias] = useState<MarketingCampania[]>([]);

  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [pestana, setPestana] = useState<Pestana>('resumen');
  const [busqueda, setBusqueda] = useState('');
  const [filtroContacto, setFiltroContacto] = useState<FiltroContacto>('todos');

  const [mostrarFormularioContacto, setMostrarFormularioContacto] = useState(false);
  const [contactoEditando, setContactoEditando] = useState<MarketingContacto | null>(null);
  const [formContacto, setFormContacto] = useState<CrearMarketingContacto>(nuevoContacto());

  const [mostrarFormularioCampania, setMostrarFormularioCampania] = useState(false);
  const [campaniaEditando, setCampaniaEditando] = useState<MarketingCampania | null>(null);
  const [formCampania, setFormCampania] = useState<CrearMarketingCampania>(nuevaCampania());

  const [contactoSeguimiento, setContactoSeguimiento] = useState<MarketingContacto | null>(null);
  const [interacciones, setInteracciones] = useState<MarketingInteraccion[]>([]);
  const [tipoInteraccion, setTipoInteraccion] = useState<TipoInteraccion>('whatsapp');
  const [resultadoInteraccion, setResultadoInteraccion] = useState<ResultadoInteraccion>('seguimiento');
  const [descripcionInteraccion, setDescripcionInteraccion] = useState('');
  const [proximoSeguimiento, setProximoSeguimiento] = useState('');

  useEffect(() => {
    async function cargarEmpresas() {
      try {
        setCargandoInicial(true);
        setError('');
        const lista = await obtenerEmpresas();
        setEmpresas(lista);
        if (lista.length > 0) setEmpresaId(lista[0].empresaId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las empresas.');
      } finally {
        setCargandoInicial(false);
      }
    }
    void cargarEmpresas();
  }, []);

  async function cargarDatosEmpresa(id: string) {
    if (!id) return;
    try {
      setCargandoDatos(true);
      setError('');
      const [nuevoResumen, nuevosContactos, nuevasCampanias] = await Promise.all([
        obtenerResumenMarketing(id),
        obtenerContactosMarketing(id),
        obtenerCampaniasMarketing(id),
      ]);
      setResumen(nuevoResumen);
      setContactos(nuevosContactos);
      setCampanias(nuevasCampanias);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos de marketing.');
    } finally {
      setCargandoDatos(false);
    }
  }

  useEffect(() => {
    if (empresaId) void cargarDatosEmpresa(empresaId);
  }, [empresaId]);

  const contactosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return contactos.filter((contacto) => {
      const coincideTexto =
        contacto.nombreCompleto.toLowerCase().includes(texto) ||
        (contacto.empresaContacto ?? '').toLowerCase().includes(texto) ||
        (contacto.correo ?? '').toLowerCase().includes(texto);
      const coincideEstado = filtroContacto === 'todos' || contacto.estado === filtroContacto;
      return coincideTexto && coincideEstado;
    });
  }, [contactos, busqueda, filtroContacto]);

  function abrirNuevoContacto() {
    setContactoEditando(null);
    setFormContacto(nuevoContacto());
    setError('');
    setMostrarFormularioContacto(true);
  }

  function abrirEditarContacto(contacto: MarketingContacto) {
    setContactoEditando(contacto);
    setFormContacto({
      campaniaId: contacto.campaniaId,
      nombreCompleto: contacto.nombreCompleto,
      empresaContacto: contacto.empresaContacto ?? '',
      correo: contacto.correo ?? '',
      telefono: contacto.telefono ?? '',
      rubro: contacto.rubro ?? '',
      fuente: contacto.fuente,
      estado: contacto.estado,
      necesidad: contacto.necesidad ?? '',
      notas: contacto.notas ?? '',
      proximoSeguimiento: contacto.proximoSeguimiento,
    });
    setError('');
    setMostrarFormularioContacto(true);
  }

  async function guardarContacto(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!empresaId) return setError('Selecciona una empresa.');
    if (!formContacto.nombreCompleto.trim()) return setError('El nombre del contacto es obligatorio.');
    try {
      setGuardando(true);
      setError('');
      const datos: CrearMarketingContacto = {
        ...formContacto,
        nombreCompleto: formContacto.nombreCompleto.trim(),
        campaniaId: formContacto.campaniaId || null,
        empresaContacto: formContacto.empresaContacto?.trim() || null,
        correo: formContacto.correo?.trim() || null,
        telefono: formContacto.telefono?.trim() || null,
        rubro: formContacto.rubro?.trim() || null,
        necesidad: formContacto.necesidad?.trim() || null,
        notas: formContacto.notas?.trim() || null,
        proximoSeguimiento: formContacto.proximoSeguimiento || null,
      };
      if (contactoEditando) {
        await actualizarContactoMarketing(empresaId, contactoEditando.contactoId, datos);
        setMensaje('Contacto actualizado correctamente.');
      } else {
        await crearContactoMarketing(empresaId, datos);
        setMensaje('Contacto registrado correctamente.');
      }
      setMostrarFormularioContacto(false);
      await cargarDatosEmpresa(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el contacto.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarContacto(contacto: MarketingContacto) {
    const confirmado = window.confirm(`¿Deseas eliminar el contacto ${contacto.nombreCompleto}? También se eliminará su historial de interacciones.`);
    if (!confirmado || !empresaId) return;
    try {
      setError('');
      await eliminarContactoMarketing(empresaId, contacto.contactoId);
      setMensaje('Contacto eliminado.');
      await cargarDatosEmpresa(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el contacto.');
    }
  }

  function abrirNuevaCampania() {
    setCampaniaEditando(null);
    setFormCampania(nuevaCampania());
    setError('');
    setMostrarFormularioCampania(true);
  }

  function abrirEditarCampania(campania: MarketingCampania) {
    setCampaniaEditando(campania);
    setFormCampania({
      nombre: campania.nombre,
      objetivo: campania.objetivo,
      canal: campania.canal,
      presupuestoBs: String(campania.presupuestoBs),
      gastoRealBs: String(campania.gastoRealBs),
      estado: campania.estado,
      fechaInicio: campania.fechaInicio.slice(0, 10),
      fechaFin: campania.fechaFin?.slice(0, 10) ?? null,
      descripcion: campania.descripcion ?? '',
    });
    setError('');
    setMostrarFormularioCampania(true);
  }

  async function guardarCampania(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!empresaId) return setError('Selecciona una empresa.');
    const presupuesto = Number(formCampania.presupuestoBs);
    const gasto = Number(formCampania.gastoRealBs);
    if (!formCampania.nombre.trim()) return setError('El nombre de la campaña es obligatorio.');
    if (!Number.isFinite(presupuesto) || presupuesto < 0 || !Number.isFinite(gasto) || gasto < 0) {
      return setError('El presupuesto y el gasto deben ser números iguales o mayores que cero.');
    }
    try {
      setGuardando(true);
      setError('');
      const datos: CrearMarketingCampania = {
        ...formCampania,
        nombre: formCampania.nombre.trim(),
        presupuestoBs: presupuesto,
        gastoRealBs: gasto,
        fechaFin: formCampania.fechaFin || null,
        descripcion: formCampania.descripcion?.trim() || null,
      };
      if (campaniaEditando) {
        await actualizarCampaniaMarketing(empresaId, campaniaEditando.campaniaId, datos);
        setMensaje('Campaña actualizada correctamente.');
      } else {
        await crearCampaniaMarketing(empresaId, datos);
        setMensaje('Campaña registrada correctamente.');
      }
      setMostrarFormularioCampania(false);
      await cargarDatosEmpresa(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la campaña.');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarCampania(campania: MarketingCampania) {
    const confirmado = window.confirm(`¿Deseas eliminar la campaña ${campania.nombre}? Los contactos asociados conservarán su información, pero quedarán sin campaña.`);
    if (!confirmado || !empresaId) return;
    try {
      setError('');
      await eliminarCampaniaMarketing(empresaId, campania.campaniaId);
      setMensaje('Campaña eliminada.');
      await cargarDatosEmpresa(empresaId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la campaña.');
    }
  }

  async function abrirSeguimiento(contacto: MarketingContacto) {
    if (!empresaId) return;
    setContactoSeguimiento(contacto);
    setInteracciones([]);
    setDescripcionInteraccion('');
    setTipoInteraccion('whatsapp');
    setResultadoInteraccion('seguimiento');
    setProximoSeguimiento('');
    setError('');
    try {
      const lista = await obtenerInteraccionesMarketing(empresaId, contacto.contactoId);
      setInteracciones(lista);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el seguimiento.');
    }
  }

  async function guardarInteraccion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!empresaId || !contactoSeguimiento) return;
    if (!descripcionInteraccion.trim()) return setError('Describe el contacto o seguimiento realizado.');
    try {
      setGuardando(true);
      setError('');
      await crearInteraccionMarketing(empresaId, contactoSeguimiento.contactoId, {
        tipo: tipoInteraccion,
        descripcion: descripcionInteraccion.trim(),
        resultado: resultadoInteraccion,
        proximoSeguimiento: proximoSeguimiento || null,
      });
      setDescripcionInteraccion('');
      setProximoSeguimiento('');
      setInteracciones(await obtenerInteraccionesMarketing(empresaId, contactoSeguimiento.contactoId));
      setMensaje('Seguimiento registrado. El estado del contacto se actualizó según el resultado.');
      await cargarDatosEmpresa(empresaId);
      const actualizado = (await obtenerContactosMarketing(empresaId)).find(
        (item) => item.contactoId === contactoSeguimiento.contactoId,
      );
      if (actualizado) setContactoSeguimiento(actualizado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el seguimiento.');
    } finally {
      setGuardando(false);
    }
  }

  const campaniaNombre = (id: string | null) =>
    campanias.find((item) => item.campaniaId === id)?.nombre ?? 'Sin campaña asociada';

  if (cargandoInicial) {
    return <div className="marketing-page"><div className="marketing-message">Cargando empresas para Marketing...</div></div>;
  }

  if (!empresas.length) {
    return (
      <div className="marketing-page">
        <header className="topbar">
          <div>
            <span className="breadcrumb">TECH BOOST / MARKETING</span>
            <h1>Marketing e inteligencia de mercados</h1>
            <p>Gestiona prospectos, campañas y seguimiento comercial.</p>
          </div>
        </header>
        <div className="marketing-message marketing-error">No hay empresas registradas. Registra una empresa antes de utilizar Marketing.</div>
      </div>
    );
  }

  return (
    <div className="marketing-page">
      <header className="topbar marketing-topbar">
        <div>
          <span className="breadcrumb">TECH BOOST / MARKETING</span>
          <h1>Marketing e inteligencia de mercados</h1>
          <p>Gestiona prospectos, campañas y oportunidades comerciales.</p>
        </div>
        <button
          type="button"
          className="button-secondary"
          onClick={() => void cargarDatosEmpresa(empresaId)}
          disabled={cargandoDatos}
        >
          ↻ Actualizar
        </button>
      </header>

      <section className="marketing-toolbar">
        <div className="marketing-company-select">
          <label htmlFor="marketing-empresa">Empresa</label>
          <select
            id="marketing-empresa"
            value={empresaId}
            onChange={(event) => setEmpresaId(event.target.value)}
          >
            {empresas.map((empresa) => (
              <option key={empresa.empresaId} value={empresa.empresaId}>
                {empresa.razonSocial}
              </option>
            ))}
          </select>
        </div>
        <nav className="marketing-tabs" aria-label="Secciones de marketing">
          <button type="button" className={pestana === 'resumen' ? 'selected' : ''} onClick={() => setPestana('resumen')}>Resumen</button>
          <button type="button" className={pestana === 'contactos' ? 'selected' : ''} onClick={() => setPestana('contactos')}>Contactos y prospectos</button>
          <button type="button" className={pestana === 'campanias' ? 'selected' : ''} onClick={() => setPestana('campanias')}>Campañas</button>
        </nav>
      </section>

      {mensaje && (
        <div className="marketing-message marketing-success">
          <span>{mensaje}</span>
          <button type="button" onClick={() => setMensaje('')} aria-label="Cerrar mensaje">×</button>
        </div>
      )}
      {error && (
        <div className="marketing-message marketing-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Cerrar error">×</button>
        </div>
      )}

      {cargandoDatos && <div className="marketing-loading">Actualizando información de la empresa...</div>}

      {pestana === 'resumen' && (
        <section className="marketing-content">
          <div className="marketing-kpis">
            <article className="marketing-kpi">
              <span>Contactos registrados</span>
              <strong>{resumen.totalContactos}</strong>
              <small>Prospectos, clientes y contactos</small>
            </article>
            <article className="marketing-kpi">
              <span>Prospectos activos</span>
              <strong>{resumen.prospectos}</strong>
              <small>En proceso comercial</small>
            </article>
            <article className="marketing-kpi">
              <span>Clientes convertidos</span>
              <strong>{resumen.clientes}</strong>
              <small>Tasa de conversión: {resumen.tasaConversionPct.toFixed(2)}%</small>
            </article>
            <article className="marketing-kpi">
              <span>Campañas activas</span>
              <strong>{resumen.campaniasActivas}</strong>
              <small>{resumen.seguimientosPendientes} seguimientos pendientes</small>
            </article>
          </div>

          <div className="marketing-summary-grid">
            <article className="marketing-card">
              <div className="marketing-card-heading">
                <div>
                  <h2>Origen de los contactos</h2>
                  <p>Canales que generan oportunidades comerciales.</p>
                </div>
              </div>
              {resumen.contactosPorFuente.length === 0 ? (
                <div className="marketing-empty">Todavía no hay contactos registrados.</div>
              ) : (
                <div className="marketing-source-list">
                  {resumen.contactosPorFuente.map((item) => {
                    const porcentaje = resumen.totalContactos > 0 ? (item.cantidad / resumen.totalContactos) * 100 : 0;
                    return (
                      <div className="marketing-source-row" key={item.fuente}>
                        <div><span>{etiqueta(item.fuente)}</span><strong>{item.cantidad}</strong></div>
                        <div className="marketing-progress"><i style={{ width: `${porcentaje}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="marketing-card">
              <div className="marketing-card-heading">
                <div>
                  <h2>Inversión en campañas</h2>
                  <p>Presupuesto asignado frente al gasto registrado.</p>
                </div>
              </div>
              <div className="marketing-budget-row">
                <span>Presupuesto total</span>
                <strong>{moneda(resumen.presupuestoTotalBs)}</strong>
              </div>
              <div className="marketing-budget-row">
                <span>Gasto real</span>
                <strong>{moneda(resumen.gastoRealTotalBs)}</strong>
              </div>
              <div className="marketing-budget-note">
                Estos importes son los valores registrados en las campañas. No representan un estado financiero contable.
              </div>
              <button type="button" className="button-primary" onClick={() => setPestana('campanias')}>Administrar campañas</button>
            </article>
          </div>

          <article className="marketing-card marketing-followup-card">
            <div>
              <h2>Seguimiento comercial</h2>
              <p>Contactos que necesitan atención y seguimiento.</p>
            </div>
            <div className="marketing-followup-number">{resumen.seguimientosPendientes}</div>
            <button type="button" className="button-primary" onClick={() => { setPestana('contactos'); setFiltroContacto('todos'); }}>Ver contactos</button>
          </article>
        </section>
      )}

      {pestana === 'contactos' && (
        <section className="marketing-content">
          <div className="marketing-card">
            <div className="marketing-card-heading marketing-heading-wrap">
              <div>
                <h2>Contactos y prospectos</h2>
                <p>Registra clientes potenciales y conserva el historial de seguimiento.</p>
              </div>
              <button type="button" className="button-primary" onClick={abrirNuevoContacto}>+ Nuevo contacto</button>
            </div>
            <div className="marketing-filter-row">
              <input
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por nombre, empresa o correo..."
                aria-label="Buscar contactos"
              />
              <select value={filtroContacto} onChange={(event) => setFiltroContacto(event.target.value as FiltroContacto)} aria-label="Filtrar por estado">
                <option value="todos">Todos los estados</option>
                <option value="nuevo">Nuevo</option>
                <option value="contactado">Contactado</option>
                <option value="interesado">Interesado</option>
                <option value="cliente">Cliente</option>
                <option value="perdido">No interesado</option>
              </select>
            </div>
            <div className="marketing-table-wrap">
              <table className="marketing-table">
                <thead>
                  <tr><th>CONTACTO</th><th>ORIGEN</th><th>ESTADO</th><th>PRÓXIMO SEGUIMIENTO</th><th>ACCIONES</th></tr>
                </thead>
                <tbody>
                  {contactosFiltrados.map((contacto) => (
                    <tr key={contacto.contactoId}>
                      <td>
                        <div className="marketing-person">
                          <strong>{contacto.nombreCompleto}</strong>
                          <span>{contacto.empresaContacto || contacto.correo || contacto.telefono || 'Sin datos adicionales'}</span>
                        </div>
                      </td>
                      <td>{etiqueta(contacto.fuente)}</td>
                      <td><span className={`marketing-status status-${contacto.estado}`}>{etiqueta(contacto.estado)}</span></td>
                      <td>{formatoFecha(contacto.proximoSeguimiento)}</td>
                      <td>
                        <div className="marketing-actions">
                          <button type="button" className="marketing-action" onClick={() => void abrirSeguimiento(contacto)}>Seguimiento</button>
                          <button type="button" className="marketing-action" onClick={() => abrirEditarContacto(contacto)}>Editar</button>
                          <button type="button" className="marketing-action danger" onClick={() => void eliminarContacto(contacto)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {contactosFiltrados.length === 0 && (
                    <tr><td colSpan={5} className="marketing-empty">No se encontraron contactos para esta búsqueda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="marketing-table-footer">Mostrando {contactosFiltrados.length} de {contactos.length} contactos</div>
          </div>
        </section>
      )}

      {pestana === 'campanias' && (
        <section className="marketing-content">
          <div className="marketing-card">
            <div className="marketing-card-heading marketing-heading-wrap">
              <div>
                <h2>Campañas de marketing</h2>
                <p>Planifica acciones comerciales, registra su presupuesto y controla su ejecución.</p>
              </div>
              <button type="button" className="button-primary" onClick={abrirNuevaCampania}>+ Nueva campaña</button>
            </div>
            {campanias.length === 0 ? (
              <div className="marketing-empty marketing-empty-large">Todavía no hay campañas registradas. Crea una campaña para comenzar a medir tus acciones comerciales.</div>
            ) : (
              <div className="marketing-campaign-grid">
                {campanias.map((campania) => {
                  const cantidadContactos = contactos.filter((item) => item.campaniaId === campania.campaniaId).length;
                  const gasto = Number(campania.gastoRealBs);
                  const presupuesto = Number(campania.presupuestoBs);
                  const porcentajeGastoReal = presupuesto > 0 ? (gasto / presupuesto) * 100 : 0;
                  const anchoBarraGasto = Math.min(100, porcentajeGastoReal);
                  return (
                    <article className="marketing-campaign" key={campania.campaniaId}>
                      <div className="marketing-campaign-top">
                        <span className={`marketing-status campaign-${campania.estado}`}>{etiqueta(campania.estado)}</span>
                        <span className="marketing-mono">{formatoFecha(campania.fechaInicio)}</span>
                      </div>
                      <h3>{campania.nombre}</h3>
                      <p className="marketing-campaign-description">{campania.descripcion || 'Sin descripción.'}</p>
                      <div className="marketing-campaign-tags">
                        <span>{etiqueta(campania.canal)}</span>
                        <span>{etiqueta(campania.objetivo)}</span>
                      </div>
                      <div className="marketing-campaign-stats">
                        <div><span>Presupuesto</span><strong>{moneda(presupuesto)}</strong></div>
                        <div><span>Gasto real</span><strong>{moneda(gasto)}</strong></div>
                        <div><span>Contactos relacionados</span><strong>{cantidadContactos}</strong></div>
                      </div>
                      <div className="marketing-progress marketing-campaign-progress"><i style={{ width: `${anchoBarraGasto}%` }} /></div>
                      <small className="marketing-spend-caption">{porcentajeGastoReal.toFixed(1)}% del presupuesto utilizado</small>
                      <div className="marketing-campaign-footer">
                        <button type="button" className="marketing-action" onClick={() => abrirEditarCampania(campania)}>Editar</button>
                        <button type="button" className="marketing-action danger" onClick={() => void eliminarCampania(campania)}>Eliminar</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {mostrarFormularioContacto && (
        <div className="modal-overlay" onClick={() => setMostrarFormularioContacto(false)}>
          <section className="modal-card form-modal marketing-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="breadcrumb">MARKETING / CONTACTOS</span>
                <h2>{contactoEditando ? 'Editar contacto' : 'Registrar contacto'}</h2>
                <p>Información del prospecto o cliente potencial.</p>
              </div>
              <button type="button" className="close-button" onClick={() => setMostrarFormularioContacto(false)}>×</button>
            </div>
            <form className="worker-form" onSubmit={guardarContacto}>
              <label>Nombre completo<input value={formContacto.nombreCompleto} onChange={(event) => setFormContacto({ ...formContacto, nombreCompleto: event.target.value })} maxLength={150} required /></label>
              <div className="marketing-form-grid">
                <label>Empresa o negocio<input value={formContacto.empresaContacto ?? ''} onChange={(event) => setFormContacto({ ...formContacto, empresaContacto: event.target.value })} maxLength={150} /></label>
                <label>Rubro<input value={formContacto.rubro ?? ''} onChange={(event) => setFormContacto({ ...formContacto, rubro: event.target.value })} maxLength={80} placeholder="Ej. Metalmecánica" /></label>
                <label>Correo electrónico<input type="email" value={formContacto.correo ?? ''} onChange={(event) => setFormContacto({ ...formContacto, correo: event.target.value })} maxLength={150} /></label>
                <label>Teléfono<input type="tel" value={formContacto.telefono ?? ''} onChange={(event) => setFormContacto({ ...formContacto, telefono: event.target.value })} maxLength={30} /></label>
                <label>Fuente del contacto
                  <select value={formContacto.fuente} onChange={(event) => setFormContacto({ ...formContacto, fuente: event.target.value as FuenteContacto })}>
                    <option value="whatsapp">WhatsApp</option><option value="redes_sociales">Redes sociales</option><option value="referido">Referido</option><option value="feria">Feria</option><option value="web">Sitio web</option><option value="llamada">Llamada</option><option value="otro">Otro</option>
                  </select>
                </label>
                <label>Estado comercial
                  <select value={formContacto.estado} onChange={(event) => setFormContacto({ ...formContacto, estado: event.target.value as EstadoContacto })}>
                    <option value="nuevo">Nuevo</option><option value="contactado">Contactado</option><option value="interesado">Interesado</option><option value="cliente">Cliente</option><option value="perdido">No interesado</option>
                  </select>
                </label>
                <label>Campaña relacionada
                  <select value={formContacto.campaniaId ?? ''} onChange={(event) => setFormContacto({ ...formContacto, campaniaId: event.target.value || null })}>
                    <option value="">Sin campaña</option>
                    {campanias.map((campania) => <option key={campania.campaniaId} value={campania.campaniaId}>{campania.nombre}</option>)}
                  </select>
                </label>
                <label>Próximo seguimiento<input type="date" value={formContacto.proximoSeguimiento ?? ''} onChange={(event) => setFormContacto({ ...formContacto, proximoSeguimiento: event.target.value || null })} /></label>
              </div>
              <label>Necesidad del contacto<textarea rows={2} value={formContacto.necesidad ?? ''} onChange={(event) => setFormContacto({ ...formContacto, necesidad: event.target.value })} placeholder="¿Qué necesita resolver este posible cliente?" /></label>
              <label>Notas internas<textarea rows={2} value={formContacto.notas ?? ''} onChange={(event) => setFormContacto({ ...formContacto, notas: event.target.value })} placeholder="Información adicional para el seguimiento..." /></label>
              {error && <div className="form-error">{error}</div>}
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => setMostrarFormularioContacto(false)} disabled={guardando}>Cancelar</button>
                <button type="submit" className="button-primary" disabled={guardando}>{guardando ? 'Guardando...' : contactoEditando ? 'Guardar cambios' : 'Registrar contacto'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {mostrarFormularioCampania && (
        <div className="modal-overlay" onClick={() => setMostrarFormularioCampania(false)}>
          <section className="modal-card form-modal marketing-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="breadcrumb">MARKETING / CAMPAÑAS</span>
                <h2>{campaniaEditando ? 'Editar campaña' : 'Registrar campaña'}</h2>
                <p>Planifica el objetivo, canal y presupuesto comercial.</p>
              </div>
              <button type="button" className="close-button" onClick={() => setMostrarFormularioCampania(false)}>×</button>
            </div>
            <form className="worker-form" onSubmit={guardarCampania}>
              <label>Nombre de la campaña<input value={formCampania.nombre} onChange={(event) => setFormCampania({ ...formCampania, nombre: event.target.value })} maxLength={120} required placeholder="Ej. Promoción de servicios industriales" /></label>
              <div className="marketing-form-grid">
                <label>Objetivo
                  <select value={formCampania.objetivo} onChange={(event) => setFormCampania({ ...formCampania, objetivo: event.target.value as ObjetivoCampania })}>
                    <option value="reconocimiento">Reconocimiento de marca</option><option value="generacion_leads">Generar prospectos</option><option value="conversiones">Conversiones</option><option value="fidelizacion">Fidelización</option>
                  </select>
                </label>
                <label>Canal
                  <select value={formCampania.canal} onChange={(event) => setFormCampania({ ...formCampania, canal: event.target.value as CanalCampania })}>
                    <option value="redes_sociales">Redes sociales</option><option value="whatsapp">WhatsApp</option><option value="correo">Correo electrónico</option><option value="ferias">Ferias</option><option value="referidos">Referidos</option><option value="otro">Otro</option>
                  </select>
                </label>
                <label>Presupuesto (Bs.)<input type="number" min="0" step="0.01" value={formCampania.presupuestoBs} onChange={(event) => setFormCampania({ ...formCampania, presupuestoBs: event.target.value })} /></label>
                <label>Gasto real (Bs.)<input type="number" min="0" step="0.01" value={formCampania.gastoRealBs} onChange={(event) => setFormCampania({ ...formCampania, gastoRealBs: event.target.value })} /></label>
                <label>Estado
                  <select value={formCampania.estado} onChange={(event) => setFormCampania({ ...formCampania, estado: event.target.value as EstadoCampania })}>
                    <option value="planificada">Planificada</option><option value="activa">Activa</option><option value="pausada">Pausada</option><option value="finalizada">Finalizada</option>
                  </select>
                </label>
                <label>Fecha de inicio<input type="date" value={formCampania.fechaInicio} onChange={(event) => setFormCampania({ ...formCampania, fechaInicio: event.target.value })} required /></label>
                <label>Fecha de finalización<input type="date" value={formCampania.fechaFin ?? ''} onChange={(event) => setFormCampania({ ...formCampania, fechaFin: event.target.value || null })} /></label>
              </div>
              <label>Descripción<textarea rows={3} value={formCampania.descripcion ?? ''} onChange={(event) => setFormCampania({ ...formCampania, descripcion: event.target.value })} placeholder="Describe las acciones y el público al que se dirige." /></label>
              {error && <div className="form-error">{error}</div>}
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => setMostrarFormularioCampania(false)} disabled={guardando}>Cancelar</button>
                <button type="submit" className="button-primary" disabled={guardando}>{guardando ? 'Guardando...' : campaniaEditando ? 'Guardar cambios' : 'Registrar campaña'}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {contactoSeguimiento && (
        <div className="modal-overlay" onClick={() => setContactoSeguimiento(null)}>
          <section className="modal-card marketing-followup-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="breadcrumb">MARKETING / SEGUIMIENTO</span>
                <h2>Historial comercial</h2>
                <p>{contactoSeguimiento.nombreCompleto} · {campaniaNombre(contactoSeguimiento.campaniaId)}</p>
              </div>
              <button type="button" className="close-button" onClick={() => setContactoSeguimiento(null)}>×</button>
            </div>
            <div className="marketing-interaction-list">
              {interacciones.length === 0 ? (
                <div className="marketing-empty">Todavía no hay seguimientos registrados para este contacto.</div>
              ) : interacciones.map((item) => (
                <article className="marketing-interaction" key={item.interaccionId}>
                  <div><strong>{etiqueta(item.tipo)}</strong><span>{new Date(item.fechaInteraccion).toLocaleString('es-BO')}</span></div>
                  <p>{item.descripcion}</p>
                  <small>Resultado: {etiqueta(item.resultado)}{item.proximoSeguimiento ? ` · Próximo seguimiento: ${formatoFecha(item.proximoSeguimiento)}` : ''}</small>
                </article>
              ))}
            </div>
            <form className="worker-form marketing-new-interaction" onSubmit={guardarInteraccion}>
              <h3>Registrar nuevo seguimiento</h3>
              <div className="marketing-form-grid">
                <label>Medio de contacto
                  <select value={tipoInteraccion} onChange={(event) => setTipoInteraccion(event.target.value as TipoInteraccion)}>
                    <option value="whatsapp">WhatsApp</option><option value="llamada">Llamada</option><option value="correo">Correo</option><option value="reunion">Reunión</option><option value="visita">Visita</option><option value="otro">Otro</option>
                  </select>
                </label>
                <label>Resultado
                  <select value={resultadoInteraccion} onChange={(event) => setResultadoInteraccion(event.target.value as ResultadoInteraccion)}>
                    <option value="seguimiento">Requiere seguimiento</option><option value="sin_respuesta">Sin respuesta</option><option value="interesado">Interesado</option><option value="convertido">Convertido en cliente</option><option value="no_interesado">No interesado</option>
                  </select>
                </label>
                <label>Próximo seguimiento<input type="date" value={proximoSeguimiento} onChange={(event) => setProximoSeguimiento(event.target.value)} /></label>
              </div>
              <label>Descripción<textarea rows={3} value={descripcionInteraccion} onChange={(event) => setDescripcionInteraccion(event.target.value)} required placeholder="Describe el contacto, consulta o acuerdo realizado..." /></label>
              {error && <div className="form-error">{error}</div>}
              <div className="form-actions">
                <button type="button" className="button-secondary" onClick={() => setContactoSeguimiento(null)} disabled={guardando}>Cerrar</button>
                <button type="submit" className="button-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar seguimiento'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default MarketingPanel;
