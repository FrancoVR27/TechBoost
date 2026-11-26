import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('planes')
export class Plan {
  @PrimaryColumn({ name: 'plan_id', type: 'integer' })
  planId!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  nombre!: string;

  @Column({
    name: 'precio_mensual_bs',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  precioMensualBs!: string;
}
