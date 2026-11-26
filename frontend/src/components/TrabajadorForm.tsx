
import { useEffect, useState } from 'react';

import { obtenerEmpresas } from '../services/empresas.service';
import {
  crearTrabajador,
  actualizarTrabajador,
} from '../services/trabajadores.service';

import type { Empresa } from '../types/empresa.types';
import type {
  Trabajador,
  CrearTrabajador,
  ModalidadPago,
} from '../types/trabajador.types';

interface Props {
  trabajador?: Trabajador | null;
  onCerrar: () => void;
  onGuardado: () => void;
}

function TrabajadorForm({
  trabajador,
  onCerrar,
  onGuardado,
}: Props) {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState(
    trabajador?.empresaId || '',
  );
  const [nombreCompleto, setNombreCompleto] = useState(
    trabajador?.nombreCompleto || '',
  );
  const [cargo, setCargo] = useState(trabajador?.cargo || '');
  const [modalidadPago, setModalidadPago] = useState<ModalidadPago>(
    trabajador?.modalidadPago ?? 'sueldo_fijo',
    );
  const [tarifaBaseBs, setTarifaBaseBs] = useState(
    trabajador?.tarifaBaseBs || '',
  );
  const [activo, setActivo] = useState(
    trabajador?.activo ?? true,
  );

  const [cargandoEmpresas, setCargandoEmpresas] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarEmpresas() {
      try {
        const datos = await obtenerEmpresas();
        setEmpresas(datos);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Error al cargar empresas.',
        );
      } finally {
        setCargandoEmpresas(false);
      }
    }

    cargarEmpresas();
  }, []);

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!trabajador && !empresaId) {
      setError('Selecciona una empresa.');
      return;
    }

    const tarifa = Number(tarifaBaseBs);

    if (!Number.isFinite(tarifa) || tarifa < 0) {
      setError('La tarifa base debe ser un número válido mayor o igual a cero.');
      return;
    }

    const datos: Partial<CrearTrabajador> = {
      nombreCompleto: nombreCompleto.trim(),
      cargo: cargo.trim() || null,
      modalidadPago,
      tarifaBaseBs: tarifa,
    };

    if (!trabajador) {
      datos.empresaId = empresaId;
      datos.activo = true;
    } else {
      datos.activo = activo;
    }

    try {
      setGuardando(true);

      if (trabajador) {
        await actualizarTrabajador(
          trabajador.trabajadorId,
          datos,
        );
      } else {
        await crearTrabajador(datos as CrearTrabajador);
      }

      onGuardado();
      onCerrar();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el trabajador.',
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
            <h2>
              {trabajador ? 'Editar trabajador' : 'Registrar trabajador'}
            </h2>
            <p>
              Completa los datos del trabajador.
            </p>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onCerrar}
          >
            ×
          </button>
        </div>

        <form onSubmit={guardar} className="worker-form">
          {!trabajador && (
            <label>
              Empresa
              <select
                value={empresaId}
                onChange={(event) => setEmpresaId(event.target.value)}
                required
                disabled={cargandoEmpresas}
              >
                <option value="">
                  {cargandoEmpresas
                    ? 'Cargando empresas...'
                    : 'Seleccionar empresa'}
                </option>

                {empresas.map((empresa) => (
                  <option
                    key={empresa.empresaId}
                    value={empresa.empresaId}
                  >
                    {empresa.razonSocial}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Nombre completo
            <input
              type="text"
              value={nombreCompleto}
              onChange={(event) =>
                setNombreCompleto(event.target.value)
              }
              maxLength={150}
              required
              placeholder="Nombre y apellidos"
            />
          </label>

          <label>
            Cargo
            <input
              type="text"
              value={cargo}
              onChange={(event) => setCargo(event.target.value)}
              maxLength={80}
              placeholder="Ej. Administrador"
            />
          </label>

          <label>
            Modalidad de pago
            <select
              value={modalidadPago}
              onChange={(event) =>
                setModalidadPago(event.target.value as ModalidadPago)
              }
              
            >
              <option value="sueldo_fijo">Sueldo fijo</option>
              <option value="destajo">Trabajo a destajo</option>
              <option value="mixto">Mixto (sueldo + destajo)</option>
            </select>
          </label>

          <label>
            Tarifa base (Bs.)
            <input
              type="number"
              value={tarifaBaseBs}
              onChange={(event) =>
                setTarifaBaseBs(event.target.value)
              }
              min="0"
              step="0.01"
              required
              placeholder="Ej. 3500.00"
            />
          </label>

          {trabajador && (
            <label>
              Estado laboral
              <select
                value={activo ? 'activo' : 'inactivo'}
                onChange={(event) =>
                  setActivo(event.target.value === 'activo')
                }
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
              <small>
                Para registrar altas o bajas con su historial,
                utiliza el formulario de movimientos laborales.
              </small>
            </label>
          )}

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
              disabled={guardando || (!trabajador && empresas.length === 0)}
            >
              {guardando
                ? 'Guardando...'
                : trabajador
                  ? 'Guardar cambios'
                  : 'Registrar trabajador'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TrabajadorForm;
