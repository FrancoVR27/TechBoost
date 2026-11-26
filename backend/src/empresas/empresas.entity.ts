import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid', { name: 'empresa_id' })
  empresaId!: string;

  @Column({ name: 'cliente_id', type: 'uuid', unique: true })
  clienteId!: string;

  @Column({ name: 'razon_social', type: 'varchar', length: 150 })
  razonSocial!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  nit!: string | null;

  @Column({ type: 'varchar', length: 20 })
  tamano!: string;

  @Column({ type: 'varchar', length: 60 })
  rubro!: string;

  @Column({ type: 'varchar', length: 50, default: 'La Paz', nullable: true })
  departamento!: string | null;

  @Column({ name: 'cantidad_empleados', type: 'integer', default: 1, nullable: true })
  cantidadEmpleados!: number | null;

  @Column({ name: 'usa_facturacion_sin', type: 'boolean', default: false, nullable: true })
  usaFacturacionSin!: boolean | null;

  @Column({ name: 'configuracion_erp_ia', type: 'jsonb', nullable: true })
  configuracionErpIa!: Record<string, unknown> | null;

  @Column({
    name: 'fecha_creacion',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  fechaCreacion!: Date | null;
}
