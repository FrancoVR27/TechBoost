import type {
  CrearRegistroDestajo,
  FiltrosDestajo,
  RegistroDestajo,
  ResumenDestajo,
} from '../types/destajo.types';

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

  if (respuesta.status === 204) return undefined as T;
  return respuesta.json() as Promise<T>;
}

export function obtenerRegistrosDestajo(filtros: FiltrosDestajo) {
  const parametros = new URLSearchParams({ empresaId: filtros.empresaId });

  if (filtros.trabajadorId) parametros.set('trabajadorId', filtros.trabajadorId);
  if (filtros.desde) parametros.set('desde', filtros.desde);
  if (filtros.hasta) parametros.set('hasta', filtros.hasta);
  if (filtros.pagado) parametros.set('pagado', filtros.pagado);

  return solicitud<RegistroDestajo[]>(
    `/rrhh/destajo?${parametros.toString()}`,
  );
}

export function obtenerResumenDestajo(
  empresaId: string,
  desde?: string,
  hasta?: string,
) {
  const parametros = new URLSearchParams({ empresaId });
  if (desde) parametros.set('desde', desde);
  if (hasta) parametros.set('hasta', hasta);

  return solicitud<ResumenDestajo>(
    `/rrhh/destajo/resumen?${parametros.toString()}`,
  );
}

export function crearRegistroDestajo(datos: CrearRegistroDestajo) {
  return solicitud<RegistroDestajo>('/rrhh/destajo', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function marcarDestajoPagado(destajoId: string) {
  return solicitud<RegistroDestajo>(
    `/rrhh/destajo/${destajoId}/marcar-pagado`,
    { method: 'PATCH' },
  );
}
