
export interface Empresa {
  empresaId: string;
  clienteId: string;
  razonSocial: string;
  nit: string | null;
  tamano: string;
  rubro: string;
  departamento: string | null;
  cantidadEmpleados: number | null;
  usaFacturacionSin: boolean | null;
  fechaCreacion: string | null;
}

export interface RespuestaEmpresas {
  items: Empresa[];
  nextCursor: string | null;
}
