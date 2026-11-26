export type FuenteContacto =
  | 'whatsapp'
  | 'redes_sociales'
  | 'referido'
  | 'feria'
  | 'web'
  | 'llamada'
  | 'otro';

export type EstadoContacto =
  | 'nuevo'
  | 'contactado'
  | 'interesado'
  | 'cliente'
  | 'perdido';

export type ObjetivoCampania =
  | 'reconocimiento'
  | 'generacion_leads'
  | 'conversiones'
  | 'fidelizacion';

export type CanalCampania =
  | 'redes_sociales'
  | 'whatsapp'
  | 'correo'
  | 'ferias'
  | 'referidos'
  | 'otro';

export type EstadoCampania =
  | 'planificada'
  | 'activa'
  | 'pausada'
  | 'finalizada';

export type TipoInteraccion =
  | 'llamada'
  | 'whatsapp'
  | 'correo'
  | 'reunion'
  | 'visita'
  | 'otro';

export type ResultadoInteraccion =
  | 'sin_respuesta'
  | 'interesado'
  | 'seguimiento'
  | 'convertido'
  | 'no_interesado';

export interface MarketingContacto {
  contactoId: string;
  empresaId: string;
  campaniaId: string | null;
  nombreCompleto: string;
  empresaContacto: string | null;
  correo: string | null;
  telefono: string | null;
  rubro: string | null;
  fuente: FuenteContacto;
  estado: EstadoContacto;
  necesidad: string | null;
  notas: string | null;
  proximoSeguimiento: string | null;
  fechaRegistro: string;
}

export interface MarketingCampania {
  campaniaId: string;
  empresaId: string;
  nombre: string;
  objetivo: ObjetivoCampania;
  canal: CanalCampania;
  presupuestoBs: string | number;
  gastoRealBs: string | number;
  estado: EstadoCampania;
  fechaInicio: string;
  fechaFin: string | null;
  descripcion: string | null;
  fechaRegistro: string;
}

export interface MarketingInteraccion {
  interaccionId: string;
  empresaId: string;
  contactoId: string;
  tipo: TipoInteraccion;
  descripcion: string;
  resultado: ResultadoInteraccion;
  fechaInteraccion: string;
  proximoSeguimiento: string | null;
}

export interface ContactosPorFuente {
  fuente: string;
  cantidad: number;
}

export interface ResumenMarketing {
  totalContactos: number;
  prospectos: number;
  clientes: number;
  perdidos: number;
  campaniasActivas: number;
  presupuestoTotalBs: number;
  gastoRealTotalBs: number;
  seguimientosPendientes: number;
  tasaConversionPct: number;
  contactosPorFuente: ContactosPorFuente[];
}

export type CrearMarketingContacto = Omit<
  MarketingContacto,
  'contactoId' | 'empresaId' | 'fechaRegistro'
>;

export type CrearMarketingCampania = Omit<
  MarketingCampania,
  'campaniaId' | 'empresaId' | 'fechaRegistro'
>;

export interface CrearMarketingInteraccion {
  tipo: TipoInteraccion;
  descripcion: string;
  resultado: ResultadoInteraccion;
  proximoSeguimiento: string | null;
}
