import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('registros_operativos')
export class RegistroOperativo {
  @PrimaryGeneratedColumn('uuid', { name: 'registro_id' })
  registroId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ name: 'tipo_movimiento', type: 'varchar', length: 30 })
  tipoMovimiento!: string;

  @Column({ name: 'monto_bs', type: 'numeric', precision: 12, scale: 2 })
  montoBs!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ name: 'canal_origen', type: 'varchar', length: 30, default: 'web' })
  canalOrigen!: string;

  @Column({ name: 'datos_extraidos_ia', type: 'jsonb', nullable: true })
  datosExtraidosIa!: Record<string, unknown> | null;

  @Column({ name: 'fecha_operacion', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  fechaOperacion!: Date | null;
}
