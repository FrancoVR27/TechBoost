import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ejecucion_etapas_orden')
export class EjecucionEtapaOrden {
  @PrimaryGeneratedColumn('uuid', { name: 'ejecucion_id' })
  ejecucionId!: string;

  @Column({ name: 'orden_id', type: 'uuid' })
  ordenId!: string;

  @Column({ name: 'etapa_id', type: 'uuid' })
  etapaId!: string;

  @Column({ name: 'tiempo_real_min', type: 'numeric', precision: 8, scale: 2, nullable: true })
  tiempoRealMin!: string | null;

  @Column({ name: 'desperdicio_registrado', type: 'numeric', precision: 10, scale: 2, default: 0, nullable: true })
  desperdicioRegistrado!: string | null;

  @Column({ name: 'costo_real_etapa_bs', type: 'numeric', precision: 10, scale: 2, nullable: true })
  costoRealEtapaBs!: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @Column({ name: 'fecha_registro', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  fechaRegistro!: Date | null;
}
