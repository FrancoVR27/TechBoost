import { apiFetch } from '../api';
import type {
  Trabajador,
  CrearTrabajador,
  Movimiento,
  CrearMovimiento,
  RespuestaPaginada,
} from '../types/trabajador.types';

export function obtenerTrabajadores(limit = 100, after?: string) {
  const parametros = new URLSearchParams({ limit: String(limit) });
  if (after) parametros.set('after', after);
  return apiFetch<RespuestaPaginada<Trabajador>>(`/trabajadores?${parametros.toString()}`);
}

export function obtenerTrabajador(id: string) {
  return apiFetch<Trabajador>(`/trabajadores/${encodeURIComponent(id)}`);
}

export function crearTrabajador(datos: CrearTrabajador) {
  return apiFetch<Trabajador>('/trabajadores', {
    method: 'POST',
    body: datos,
  });
}

export function actualizarTrabajador(id: string, datos: Partial<CrearTrabajador>) {
  return apiFetch<Trabajador>(`/trabajadores/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: datos,
  });
}

export function eliminarTrabajador(id: string) {
  return apiFetch<{ deleted: true }>(`/trabajadores/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function registrarMovimiento(trabajadorId: string, datos: CrearMovimiento) {
  return apiFetch<Movimiento>(
    `/trabajadores/${encodeURIComponent(trabajadorId)}/movimientos`,
    { method: 'POST', body: datos },
  );
}

export function obtenerHistorial(trabajadorId: string) {
  return apiFetch<Movimiento[]>(
    `/trabajadores/${encodeURIComponent(trabajadorId)}/movimientos`,
  );
}
