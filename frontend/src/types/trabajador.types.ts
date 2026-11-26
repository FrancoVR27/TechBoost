export type ModalidadPago = 'sueldo_fijo' | 'destajo' | 'mixto';

export type TipoMovimiento =
  | 'alta'
  | 'baja'
  | 'paso'
  | 'despido'
  | 'promocion';

export interface Trabajador {
  trabajadorId: string;
  empresaId: string;
  nombreCompleto: string;
  cargo: string | null;
  modalidadPago: ModalidadPago;
  tarifaBaseBs: string;
  activo: boolean | null;
}

export interface CrearTrabajador {
  empresaId: string;
  nombreCompleto: string;
  cargo: string | null;
  modalidadPago: ModalidadPago;
  tarifaBaseBs: number;
  activo?: boolean;
}

export interface Movimiento {
  movimientoId: string;
  trabajadorId: string;
  tipoMovimiento: TipoMovimiento;
  cargoAnterior: string | null;
  cargoNuevo: string | null;
  fechaMovimiento: string;
  motivo: string | null;
  observaciones: string | null;
  fechaRegistro: string;
}

export interface CrearMovimiento {
  tipoMovimiento: TipoMovimiento;
  fechaMovimiento: string;
  cargoNuevo?: string;
  motivo?: string;
  observaciones?: string;
}

export interface RespuestaPaginada<T> {
  items: T[];
  nextCursor: string | null;
}
