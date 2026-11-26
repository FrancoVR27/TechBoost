
export type TipoMovimiento =
  | 'alta'
  | 'baja'
  | 'paso'
  | 'despido'
  | 'promocion';

export class CrearMovimientoDto {
  tipoMovimiento!: TipoMovimiento;

  fechaMovimiento!: string;

  cargoNuevo?: string;

  motivo?: string;

  observaciones?: string;
}
