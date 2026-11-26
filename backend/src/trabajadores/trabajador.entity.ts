import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('trabajadores')
export class Trabajador {
  @PrimaryGeneratedColumn('uuid', { name: 'trabajador_id' })
  trabajadorId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 150 })
  nombreCompleto!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  cargo!: string | null;

  @Column({ name: 'modalidad_pago', type: 'varchar', length: 20 })
  modalidadPago!: string;

  @Column({ name: 'tarifa_base_bs', type: 'numeric', precision: 10, scale: 2 })
  tarifaBaseBs!: string;

  @Column({ type: 'boolean', default: true, nullable: true })
  activo!: boolean | null;
}
