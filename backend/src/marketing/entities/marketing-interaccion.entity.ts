import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('marketing_interacciones')
export class MarketingInteraccion {
  @PrimaryGeneratedColumn('uuid', { name: 'interaccion_id' })
  interaccionId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ name: 'contacto_id', type: 'uuid' })
  contactoId!: string;

  @Column({ type: 'varchar', length: 20 })
  tipo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'varchar', length: 20, default: 'seguimiento' })
  resultado!: string;

  @Column({ name: 'fecha_interaccion', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaInteraccion!: Date;

  @Column({ name: 'proximo_seguimiento', type: 'date', nullable: true })
  proximoSeguimiento!: string | null;
}
