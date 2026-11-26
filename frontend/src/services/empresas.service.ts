
import type {
  Empresa,
  RespuestaEmpresas,
} from '../types/empresa.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function obtenerEmpresas(): Promise<Empresa[]> {
  const respuesta = await fetch(`${API_URL}/empresas?limit=100`);

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las empresas registradas.');
  }

  const datos: RespuestaEmpresas = await respuesta.json();

  return datos.items;
}
