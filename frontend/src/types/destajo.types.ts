export interface RegistroDestajo {
  destajoId: string;
  trabajadorId: string;
  trabajadorNombre: string;
  empresaId: string;
  fechaTrabajo: string;
  descripcionTrabajo: string;
  cantidadUnidadesEntregadas: number;
  tarifaUnitariaBs: number;
  montoGanadoBs: number;
  pagado: boolean;
  fechaPago: string | null;
  fechaRegistro: string | null;
}

export interface CrearRegistroDestajo {
  trabajadorId: string;
  fechaTrabajo: string;
  descripcionTrabajo: string;
  cantidadUnidadesEntregadas: number;
  tarifaUnitariaBs: number;
}

export interface FiltrosDestajo {
  empresaId: string;
  trabajadorId?: string;
  desde?: string;
  hasta?: string;
  pagado?: 'true' | 'false';
}

export interface ResumenTrabajadorDestajo {
  trabajadorId: string;
  trabajadorNombre: string;
  cantidadRegistros: number;
  unidadesEntregadas: number;
  montoGeneradoBs: number;
  montoPagadoBs: number;
  montoPendienteBs: number;
}

export interface ResumenDestajo {
  totales: {
    cantidadRegistros: number;
    unidadesEntregadas: number;
    montoGeneradoBs: number;
    montoPagadoBs: number;
    montoPendienteBs: number;
  };
  trabajadores: ResumenTrabajadorDestajo[];
}
