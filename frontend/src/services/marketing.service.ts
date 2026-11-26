import type {
  CrearMarketingCampania,
  CrearMarketingContacto,
  CrearMarketingInteraccion,
  MarketingCampania,
  MarketingContacto,
  MarketingInteraccion,
  ResumenMarketing,
} from '../types/marketing.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function solicitud<T>(endpoint: string, opciones: RequestInit = {}): Promise<T> {
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
      : error?.message || 'No se pudo completar la operación de marketing.';
    throw new Error(mensaje);
  }

  if (respuesta.status === 204) return undefined as T;
  return respuesta.json() as Promise<T>;
}

const baseEmpresa = (empresaId: string) =>
  `/marketing/empresas/${encodeURIComponent(empresaId)}`;

export function obtenerResumenMarketing(empresaId: string) {
  return solicitud<ResumenMarketing>(`${baseEmpresa(empresaId)}/resumen`);
}

export function obtenerContactosMarketing(empresaId: string) {
  return solicitud<MarketingContacto[]>(`${baseEmpresa(empresaId)}/contactos`);
}

export function crearContactoMarketing(empresaId: string, datos: CrearMarketingContacto) {
  return solicitud<MarketingContacto>(`${baseEmpresa(empresaId)}/contactos`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function actualizarContactoMarketing(
  empresaId: string,
  contactoId: string,
  datos: Partial<CrearMarketingContacto>,
) {
  return solicitud<MarketingContacto>(
    `${baseEmpresa(empresaId)}/contactos/${encodeURIComponent(contactoId)}`,
    { method: 'PATCH', body: JSON.stringify(datos) },
  );
}

export function eliminarContactoMarketing(empresaId: string, contactoId: string) {
  return solicitud<{ deleted: true }>(
    `${baseEmpresa(empresaId)}/contactos/${encodeURIComponent(contactoId)}`,
    { method: 'DELETE' },
  );
}

export function obtenerCampaniasMarketing(empresaId: string) {
  return solicitud<MarketingCampania[]>(`${baseEmpresa(empresaId)}/campanias`);
}

export function crearCampaniaMarketing(empresaId: string, datos: CrearMarketingCampania) {
  return solicitud<MarketingCampania>(`${baseEmpresa(empresaId)}/campanias`, {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function actualizarCampaniaMarketing(
  empresaId: string,
  campaniaId: string,
  datos: Partial<CrearMarketingCampania>,
) {
  return solicitud<MarketingCampania>(
    `${baseEmpresa(empresaId)}/campanias/${encodeURIComponent(campaniaId)}`,
    { method: 'PATCH', body: JSON.stringify(datos) },
  );
}

export function eliminarCampaniaMarketing(empresaId: string, campaniaId: string) {
  return solicitud<{ deleted: true }>(
    `${baseEmpresa(empresaId)}/campanias/${encodeURIComponent(campaniaId)}`,
    { method: 'DELETE' },
  );
}

export function obtenerInteraccionesMarketing(empresaId: string, contactoId: string) {
  return solicitud<MarketingInteraccion[]>(
    `${baseEmpresa(empresaId)}/contactos/${encodeURIComponent(contactoId)}/interacciones`,
  );
}

export function crearInteraccionMarketing(
  empresaId: string,
  contactoId: string,
  datos: CrearMarketingInteraccion,
) {
  return solicitud<MarketingInteraccion>(
    `${baseEmpresa(empresaId)}/contactos/${encodeURIComponent(contactoId)}/interacciones`,
    { method: 'POST', body: JSON.stringify(datos) },
  );
}
