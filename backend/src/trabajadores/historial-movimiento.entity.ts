
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('historial_movimientos_trabajador')
export class HistorialMovimiento {
  @PrimaryGeneratedColumn('uuid', {
    name: 'movimiento_id',
  })
  movimientoId!: string;

  @Column({
    name: 'trabajador_id',
    type: 'uuid',
  })
  trabajadorId!: string;

  @Column({
    name: 'tipo_movimiento',
    type: 'varchar',
    length: 20,
  })
  tipoMovimiento!: string;

  @Column({
    name: 'cargo_anterior',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  cargoAnterior!: string | null;

  @Column({
    name: 'cargo_nuevo',
    type: 'varchar',
    length: 80,
    nullable: true,
  })
  cargoNuevo!: string | null;

  @Column({
    name: 'fecha_movimiento',
    type: 'date',
  })
  fechaMovimiento!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  motivo!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  observaciones!: string | null;

  @Column({
    name: 'fecha_registro',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  fechaRegistro!: Date;
}
