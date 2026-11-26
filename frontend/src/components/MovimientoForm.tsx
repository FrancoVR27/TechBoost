
import { useState, type FormEvent } from 'react';

import { registrarMovimiento } from '../services/trabajadores.service';

import type {
  Trabajador,
  TipoMovimiento,
  CrearMovimiento,
} from '../types/trabajador.types';

interface MovimientoFormProps {
  trabajador: Trabajador;
  onCerrar: () => void;
  onGuardado: () => void;
}

function MovimientoForm({
  trabajador,
  onCerrar,
  onGuardado,
}: MovimientoFormProps) {
  const [tipoMovimiento, setTipoMovimiento] =
    useState<TipoMovimiento>('paso');

  const [fechaMovimiento, setFechaMovimiento] = useState(() => {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  });

  const [cargoNuevo, setCargoNuevo] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const requiereCargo =
    tipoMovimiento === 'paso' ||
    tipoMovimiento === 'promocion';

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!fechaMovimiento) {
      setError('Debes seleccionar la fecha del movimiento.');
      return;
    }

    if (requiereCargo && !cargoNuevo.trim()) {
      setError('Debes ingresar el nuevo cargo.');
      return;
    }

    const datos: CrearMovimiento = {
      tipoMovimiento,
      fechaMovimiento,
      ...(requiereCargo && {
        cargoNuevo: cargoNuevo.trim(),
      }),
      ...(motivo.trim() && {
        motivo: motivo.trim(),
      }),
      ...(observaciones.trim() && {
        observaciones: observaciones.trim(),
      }),
    };

    try {
      setGuardando(true);

      await registrarMovimiento(
        trabajador.trabajadorId,
        datos,
      );

      onGuardado();
      onCerrar();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo registrar el movimiento laboral.',
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
            <span className="breadcrumb">RECURSOS HUMANOS</span>
            <h2>Registrar movimiento</h2>
            <p>{trabajador.nombreCompleto}</p>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onCerrar}
          >
            ×
          </button>
        </div>

        <div className="worker-information">
          <div>
            <span>Cargo actual</span>
            <strong>{trabajador.cargo || 'Sin cargo'}</strong>
          </div>

          <div>
            <span>Estado actual</span>
            <strong>
              {trabajador.activo === true ? 'Activo' : 'Inactivo'}
            </strong>
          </div>
        </div>

        <form className="worker-form" onSubmit={guardar}>
          <label>
            Tipo de movimiento
            <select
              value={tipoMovimiento}
              onChange={(event) =>
                setTipoMovimiento(
                  event.target.value as TipoMovimiento,
                )
              }
            >
              <option value="paso">Paso de cargo</option>
              <option value="promocion">Promoción</option>

              {trabajador.activo === true ? (
                <>
                  <option value="baja">Baja</option>
                  <option value="despido">Despido</option>
                </>
              ) : (
                <option value="alta">Alta</option>
              )}
            </select>
          </label>

          <label>
            Fecha del movimiento
            <input
              type="date"
              value={fechaMovimiento}
              onChange={(event) =>
                setFechaMovimiento(event.target.value)
              }
              required
            />
          </label>

          {requiereCargo && (
            <label>
              Nuevo cargo
              <input
                type="text"
                value={cargoNuevo}
                onChange={(event) =>
                  setCargoNuevo(event.target.value)
                }
                maxLength={80}
                placeholder="Ej. Gerente de ventas"
                required
              />
            </label>
          )}

          <label>
            Motivo
            <textarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              rows={3}
              placeholder="Describe el motivo del movimiento..."
            />
          </label>

          <label>
            Observaciones
            <textarea
              value={observaciones}
              onChange={(event) =>
                setObservaciones(event.target.value)
              }
              rows={3}
              placeholder="Información adicional (opcional)..."
            />
          </label>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

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
              disabled={guardando}
            >
              {guardando ? 'Guardando...' : 'Registrar movimiento'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default MovimientoForm;
