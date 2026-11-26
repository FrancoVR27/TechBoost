export interface RegistrarDestajoDto {
  trabajadorId: string;
  fechaTrabajo: string;
  descripcionTrabajo: string;
  cantidadUnidadesEntregadas: number;
  tarifaUnitariaBs: number;
  ordenId?: string | null;
  etapaId?: string | null;
}

export interface FiltrosDestajoDto {
  empresaId: string;
  trabajadorId?: string;
  desde?: string;
  hasta?: string;
  pagado?: string;
}
