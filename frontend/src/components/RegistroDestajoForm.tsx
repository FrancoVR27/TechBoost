import { useEffect, useState, type FormEvent } from 'react';
import { crearRegistroDestajo } from '../services/destajo.service';
import type { CrearRegistroDestajo } from '../types/destajo.types';
import type { Trabajador } from '../types/trabajador.types';

interface RegistroDestajoFormProps {
  trabajadores: Trabajador[];
  onCerrar: () => void;
  onGuardado: () => void | Promise<void>;
}

function fechaLocalActual() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function RegistroDestajoForm({
  trabajadores,
  onCerrar,
  onGuardado,
}: RegistroDestajoFormProps) {
  const [trabajadorId, setTrabajadorId] = useState(
    trabajadores[0]?.trabajadorId ?? '',
  );
  const [fechaTrabajo, setFechaTrabajo] = useState(fechaLocalActual);
  const [descripcionTrabajo, setDescripcionTrabajo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [tarifa, setTarifa] = useState(
    trabajadores[0]?.tarifaBaseBs ?? '',
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const trabajadorActual = trabajadores.find(
    (trabajador) => trabajador.trabajadorId === trabajadorId,
  );

  useEffect(() => {
    if (!trabajadorId && trabajadores.length > 0) {
      setTrabajadorId(trabajadores[0].trabajadorId);
      setTarifa(trabajadores[0].tarifaBaseBs);
    }
  }, [trabajadores, trabajadorId]);

  function cambiarTrabajador(nuevoId: string) {
    setTrabajadorId(nuevoId);
    const seleccionado = trabajadores.find(
      (trabajador) => trabajador.trabajadorId === nuevoId,
    );
    setTarifa(seleccionado?.tarifaBaseBs ?? '');
  }

  const totalCalculado = Number(cantidad) * Number(tarifa);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const cantidadNumero = Number(cantidad);
    const tarifaNumero = Number(tarifa);

    if (!trabajadorId) {
      setError('Selecciona un trabajador.');
      return;
    }
    if (!fechaTrabajo) {
      setError('Selecciona la fecha del trabajo.');
      return;
    }
    if (!descripcionTrabajo.trim()) {
      setError('Describe el producto o trabajo realizado.');
      return;
    }
    if (!Number.isFinite(cantidadNumero) || cantidadNumero <= 0) {
      setError('La cantidad debe ser mayor que cero.');
      return;
    }
    if (!Number.isFinite(tarifaNumero) || tarifaNumero <= 0) {
      setError('La tarifa por unidad debe ser mayor que cero.');
      return;
    }

    const datos: CrearRegistroDestajo = {
      trabajadorId,
      fechaTrabajo,
      descripcionTrabajo: descripcionTrabajo.trim(),
      cantidadUnidadesEntregadas: cantidadNumero,
      tarifaUnitariaBs: tarifaNumero,
    };

    try {
      setGuardando(true);
      await crearRegistroDestajo(datos);
      await onGuardado();
      onCerrar();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el trabajo realizado.',
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <section
        className="modal-card form-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="breadcrumb">RECURSOS HUMANOS / DESTAJO</span>
            <h2>Registrar producción</h2>
            <p>Registra las unidades entregadas por el trabajador.</p>
          </div>
          <button
            type="button"
            className="close-button"
            onClick={onCerrar}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form className="worker-form" onSubmit={guardar}>
          <label>
            Trabajador
            <select
              value={trabajadorId}
              onChange={(event) => cambiarTrabajador(event.target.value)}
              required
            >
              <option value="">Seleccionar trabajador</option>
              {trabajadores.map((trabajador) => (
                <option
                  key={trabajador.trabajadorId}
                  value={trabajador.trabajadorId}
                >
                  {trabajador.nombreCompleto} — {trabajador.cargo || 'Sin cargo'}
                </option>
              ))}
            </select>
          </label>

          {trabajadorActual && (
            <div className="destajo-worker-note">
              <span>Modalidad de pago</span>
              <strong>
                {trabajadorActual.modalidadPago === 'mixto'
                  ? 'Mixto'
                  : 'Trabajo a destajo'}
              </strong>
              <span>Tarifa base registrada: Bs. {Number(trabajadorActual.tarifaBaseBs).toFixed(2)}</span>
            </div>
          )}

          <label>
            Fecha de trabajo
            <input
              type="date"
              value={fechaTrabajo}
              onChange={(event) => setFechaTrabajo(event.target.value)}
              required
            />
          </label>

          <label>
            Producto o trabajo realizado
            <input
              type="text"
              value={descripcionTrabajo}
              onChange={(event) => setDescripcionTrabajo(event.target.value)}
              maxLength={150}
              placeholder="Ej. Ensamblado de 20 sillas"
              required
            />
          </label>

          <div className="destajo-form-grid">
            <label>
              Cantidad entregada
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={cantidad}
                onChange={(event) => setCantidad(event.target.value)}
                placeholder="Ej. 50"
                required
              />
            </label>

            <label>
              Tarifa por unidad (Bs.)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={tarifa}
                onChange={(event) => setTarifa(event.target.value)}
                placeholder="Ej. 2.50"
                required
              />
            </label>
          </div>

          <div className="destajo-total-preview">
            <span>Importe calculado</span>
            <strong>
              Bs. {Number.isFinite(totalCalculado) ? totalCalculado.toFixed(2) : '0.00'}
            </strong>
            <small>Cantidad entregada × tarifa por unidad</small>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={onCerrar}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={guardando || trabajadores.length === 0}
            >
              {guardando ? 'Guardando...' : 'Guardar producción'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RegistroDestajoForm;
