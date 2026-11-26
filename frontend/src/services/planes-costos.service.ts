import type {
  Empresa,
  Plan,
  Producto,
  Insumo,
  RecetaProductoInsumo,
  RegistroOperativo,
  ResultadoCosto,
  RespuestaPaginada,
} from '../types/planes-costos.types';

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
      : error?.message || 'No se pudo completar la operación.';
    throw new Error(mensaje);
  }

  if (respuesta.status === 204) return undefined as T;
  return respuesta.json() as Promise<T>;
}

async function listar<T>(endpoint: string): Promise<T[]> {
  const respuesta = await solicitud<RespuestaPaginada<T>>(`${endpoint}?limit=100`);
  return respuesta.items;
}

export function obtenerEmpresasPC() {
  return listar<Empresa>('/empresas');
}

export function obtenerPlanes() {
  return listar<Plan>('/planes');
}

export function obtenerProductosPC() {
  return listar<Producto>('/productos');
}

export function crearProducto(datos: Partial<Producto> & Pick<Producto, 'empresaId' | 'nombre' | 'unidadMedida' | 'precioVentaBs'>) {
  return solicitud<Producto>('/productos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function actualizarProducto(productoId: string, datos: Partial<Producto>) {
  return solicitud<Producto>(`/productos/${productoId}`, {
    method: 'PATCH',
    body: JSON.stringify(datos),
  });
}

export function obtenerInsumosPC() {
  return listar<Insumo>('/insumos');
}

export function crearInsumo(datos: Omit<Insumo, 'insumoId'>) {
  return solicitud<Insumo>('/insumos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function obtenerRecetasPC() {
  return listar<RecetaProductoInsumo>('/receta-producto-insumos');
}

export function crearLineaReceta(datos: Omit<RecetaProductoInsumo, 'recetaId'>) {
  return solicitud<RecetaProductoInsumo>('/receta-producto-insumos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function eliminarLineaReceta(recetaId: string) {
  return solicitud<{ deleted: true }>(`/receta-producto-insumos/${recetaId}`, {
    method: 'DELETE',
  });
}

export function calcularCostoProducto(productoId: string) {
  return solicitud<ResultadoCosto>(`/costos-productos/${productoId}/calcular`, {
    method: 'POST',
  });
}

export function obtenerOperacionesPC() {
  return listar<RegistroOperativo>('/registros-operativos');
}

export function crearOperacion(datos: {
  empresaId: string;
  tipoMovimiento: 'venta' | 'compra_insumo' | 'gasto_operativo';
  montoBs: number;
  descripcion: string;
  canalOrigen: 'web';
  fechaOperacion: string;
}) {
  return solicitud<RegistroOperativo>('/registros-operativos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}
