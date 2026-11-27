import { apiFetch } from '../api';
import type { Empresa, RespuestaEmpresas } from '../types/empresa.types';

export async function obtenerEmpresas(): Promise<Empresa[]> {
  const datos = await apiFetch<RespuestaEmpresas>('/empresas?limit=100');
  return datos.items;
}
