import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('historial_mantenimientos')
export class HistorialMantenimiento {
  @PrimaryGeneratedColumn('uuid', { name: 'mantenimiento_id' })
  mantenimientoId!: string;

  @Column({ name: 'maquina_id', type: 'uuid' })
  maquinaId!: string;

  @Column({ type: 'varchar', length: 30 })
  tipo!: string;

  @Column({ name: 'descripcion_falla', type: 'text', nullable: true })
  descripcionFalla!: string | null;

  @Column({ name: 'costo_reparacion_bs', type: 'numeric', precision: 10, scale: 2, default: 0, nullable: true })
  costoReparacionBs!: string | null;

  @Column({ name: 'tiempo_parada_horas', type: 'numeric', precision: 6, scale: 2, default: 0, nullable: true })
  tiempoParadaHoras!: string | null;

  @Column({ name: 'fecha_inicio', type: 'timestamptz' })
  fechaInicio!: Date;

  @Column({ name: 'fecha_fin', type: 'timestamptz', nullable: true })
  fechaFin!: Date | null;
}
