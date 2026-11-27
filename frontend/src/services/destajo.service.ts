import { apiFetch } from '../api';
import type {
  CrearRegistroDestajo,
  FiltrosDestajo,
  RegistroDestajo,
  ResumenDestajo,
} from '../types/destajo.types';

function construirQuery(filtros: FiltrosDestajo) {
  const parametros = new URLSearchParams({ empresaId: filtros.empresaId });
  if (filtros.trabajadorId) parametros.set('trabajadorId', filtros.trabajadorId);
  if (filtros.desde) parametros.set('desde', filtros.desde);
  if (filtros.hasta) parametros.set('hasta', filtros.hasta);
  if (filtros.pagado) parametros.set('pagado', filtros.pagado);
  return parametros.toString();
}

export function obtenerRegistrosDestajo(filtros: FiltrosDestajo) {
  return apiFetch<RegistroDestajo[]>(`/rrhh/destajo?${construirQuery(filtros)}`);
}

export function obtenerResumenDestajo(empresaId: string, desde?: string, hasta?: string) {
  const parametros = new URLSearchParams({ empresaId });
  if (desde) parametros.set('desde', desde);
  if (hasta) parametros.set('hasta', hasta);
  return apiFetch<ResumenDestajo>(`/rrhh/destajo/resumen?${parametros.toString()}`);
}

export function crearRegistroDestajo(datos: CrearRegistroDestajo) {
  return apiFetch<RegistroDestajo>('/rrhh/destajo', {
    method: 'POST',
    body: datos,
  });
}

export function marcarDestajoPagado(destajoId: string) {
  return apiFetch<RegistroDestajo>(`/rrhh/destajo/${encodeURIComponent(destajoId)}/marcar-pagado`, {
    method: 'PATCH',
  });
}
