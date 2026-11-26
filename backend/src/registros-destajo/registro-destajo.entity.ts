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

  @Column({ name: 'fecha_trabajo', type: 'date' })
  fechaTrabajo!: string;

  @Column({ name: 'descripcion_trabajo', type: 'varchar', length: 150 })
  descripcionTrabajo!: string;

  @Column({
    name: 'cantidad_unidades_entregadas',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  cantidadUnidadesEntregadas!: string;

  @Column({
    name: 'tarifa_unitaria_bs',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  tarifaUnitariaBs!: string;

  @Column({
    name: 'monto_ganado_bs',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  montoGanadoBs!: string;

  @Column({ type: 'boolean', default: false })
  pagado!: boolean;

  @Column({
    name: 'fecha_pago',
    type: 'timestamptz',
    nullable: true,
  })
  fechaPago!: Date | null;

  @Column({
    name: 'fecha_registro',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  fechaRegistro!: Date | null;
}
