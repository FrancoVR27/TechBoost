import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('marketing_campanias')
export class MarketingCampania {
  @PrimaryGeneratedColumn('uuid', { name: 'campania_id' })
  campaniaId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ type: 'varchar', length: 30, default: 'generacion_leads' })
  objetivo!: string;

  @Column({ type: 'varchar', length: 30, default: 'redes_sociales' })
  canal!: string;

  @Column({ name: 'presupuesto_bs', type: 'numeric', precision: 12, scale: 2, default: 0 })
  presupuestoBs!: string;

  @Column({ name: 'gasto_real_bs', type: 'numeric', precision: 12, scale: 2, default: 0 })
  gastoRealBs!: string;

  @Column({ type: 'varchar', length: 20, default: 'planificada' })
  estado!: string;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio!: string;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin!: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'fecha_registro', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro!: Date;
}
