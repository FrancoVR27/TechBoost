export interface Empresa {
  empresaId: string;
  razonSocial: string;
}

export interface Plan {
  planId: number;
  nombre: string;
  precioMensualBs: string | number;
}

export interface Producto {
  productoId: string;
  empresaId: string;
  sku: string | null;
  nombre: string;
  unidadMedida: string;
  precioVentaBs: string;
  costoCalculadoBs: string | null;
  margenGananciaPct: string | null;
  costoManoObraBs: string;
  otrosCostosBs: string;
}

export interface Insumo {
  insumoId: string;
  empresaId: string;
  nombre: string;
  unidadMedida: string;
  stockActual: string;
  stockMinimoAlerta: string;
  costoUnitarioPromedioBs: string;
}

export interface RecetaProductoInsumo {
  recetaId: string;
  productoId: string;
  insumoId: string;
  cantidadRequerida: string;
  porcentajeMermaEstimada: string | null;
}

export type TipoOperacion = 'venta' | 'compra_insumo' | 'gasto_operativo' | 'pago_destajo';

export interface RegistroOperativo {
  registroId: string;
  empresaId: string;
  tipoMovimiento: TipoOperacion;
  montoBs: string;
  descripcion: string | null;
  canalOrigen: string;
  fechaOperacion: string | null;
}

export interface RespuestaPaginada<T> {
  items: T[];
  nextCursor: string | null;
}

export interface ResultadoCosto {
  producto: {
    productoId: string;
    empresaId: string;
    nombre: string;
    unidadMedida: string;
    precioVentaBs: number;
  };
  materiales: Array<{
    recetaId: string;
    insumoId: string;
    insumo: string;
    unidadMedida: string;
    cantidadRequerida: number;
    porcentajeMermaEstimada: number;
    cantidadConMerma: number;
    costoUnitarioBs: number;
    costoTotalBs: number;
  }>;
  totales: {
    costoMaterialesBs: number;
    costoManoObraBs: number;
    otrosCostosBs: number;
    costoCalculadoBs: number;
    utilidadPorUnidadBs: number;
    margenGananciaPct: number;
    precioVentaBs: number;
  };
}
