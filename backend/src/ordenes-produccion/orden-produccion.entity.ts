import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ordenes_produccion')
export class OrdenProduccion {
  @PrimaryGeneratedColumn('uuid', { name: 'orden_id' })
  ordenId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId!: string;

  @Column({ name: 'cantidad_planificada', type: 'integer' })
  cantidadPlanificada!: number;

  @Column({ name: 'cantidad_producida', type: 'integer', default: 0, nullable: true })
  cantidadProducida!: number | null;

  @Column({ name: 'cantidad_defectuosa', type: 'integer', default: 0, nullable: true })
  cantidadDefectuosa!: number | null;

  @Column({ type: 'varchar', length: 20, default: 'pendiente' })
  estado!: string;

  @Column({ name: 'fecha_inicio', type: 'timestamptz', nullable: true })
  fechaInicio!: Date | null;

  @Column({ name: 'fecha_fin_estimada', type: 'timestamptz', nullable: true })
  fechaFinEstimada!: Date | null;

  @Column({ name: 'fecha_fin_real', type: 'timestamptz', nullable: true })
  fechaFinReal!: Date | null;
}
