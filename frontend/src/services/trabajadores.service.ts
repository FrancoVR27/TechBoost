
import type {
  Trabajador,
  CrearTrabajador,
  Movimiento,
  CrearMovimiento,
  RespuestaPaginada,
} from '../types/trabajador.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function solicitud<T>(
  endpoint: string,
  opciones: RequestInit = {},
): Promise<T> {
  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...opciones.headers,
    },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);

    const mensaje = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message || 'Ocurrió un error al comunicarse con el servidor';

    throw new Error(mensaje);
  }

  if (respuesta.status === 204) {
    return undefined as T;
  }

  return respuesta.json() as Promise<T>;
}

// Obtener todos los trabajadores.
export function obtenerTrabajadores(
  limit = 100,
  after?: string,
) {
  const parametros = new URLSearchParams({
    limit: String(limit),
  });

  if (after) {
    parametros.set('after', after);
  }

  return solicitud<RespuestaPaginada<Trabajador>>(
    `/trabajadores?${parametros.toString()}`,
  );
}

// Obtener un trabajador por su identificador.
export function obtenerTrabajador(id: string) {
  return solicitud<Trabajador>(`/trabajadores/${id}`);
}

// Registrar un trabajador.
export function crearTrabajador(datos: CrearTrabajador) {
  return solicitud<Trabajador>('/trabajadores', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

// Actualizar los datos de un trabajador.
export function actualizarTrabajador(
  id: string,
  datos: Partial<CrearTrabajador>,
) {
  return solicitud<Trabajador>(`/trabajadores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(datos),
  });
}

// Registrar un movimiento laboral.
export function registrarMovimiento(
  trabajadorId: string,
  datos: CrearMovimiento,
) {
  return solicitud<Movimiento>(
    `/trabajadores/${trabajadorId}/movimientos`,
    {
      method: 'POST',
      body: JSON.stringify(datos),
    },
  );
}

// Consultar el historial laboral de un trabajador.
export function obtenerHistorial(trabajadorId: string) {
  return solicitud<Movimiento[]>(
    `/trabajadores/${trabajadorId}/movimientos`,
  );
}
