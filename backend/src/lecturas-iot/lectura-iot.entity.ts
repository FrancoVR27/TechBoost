import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lecturas_iot')
export class LecturaIot {
  @PrimaryGeneratedColumn('increment', { name: 'lectura_id', type: 'bigint' })
  lecturaId!: string;

  @Column({ name: 'dispositivo_id', type: 'uuid' })
  dispositivoId!: string;

  @Column({ name: 'timestamp_lectura', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestampLectura!: Date;

  @Column({ name: 'valor_numerico', type: 'numeric', precision: 12, scale: 4, nullable: true })
  valorNumerico!: string | null;

  @Column({ name: 'payload_raw', type: 'jsonb', nullable: true })
  payloadRaw!: Record<string, unknown> | null;

  @Column({ name: 'es_anomalia', type: 'boolean', default: false, nullable: true })
  esAnomalia!: boolean | null;
}
