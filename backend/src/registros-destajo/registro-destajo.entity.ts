import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('registros_destajo')
export class RegistroDestajo {
  @PrimaryGeneratedColumn('uuid', { name: 'destajo_id' })
  destajoId!: string;

  @Column({ name: 'trabajador_id', type: 'uuid' })
  trabajadorId!: string;

  @Column({ name: 'orden_id', type: 'uuid', nullable: true })
  ordenId!: string | null;

  @Column({ name: 'etapa_id', type: 'uuid', nullable: true })
  etapaId!: string | null;

  @Column({ name: 'cantidad_unidades_entregadas', type: 'numeric', precision: 10, scale: 2 })
  cantidadUnidadesEntregadas!: string;

  @Column({ name: 'monto_ganado_bs', type: 'numeric', precision: 10, scale: 2 })
  montoGanadoBs!: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  pagado!: boolean | null;

  @Column({ name: 'fecha_registro', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  fechaRegistro!: Date | null;
}
