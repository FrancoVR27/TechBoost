import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('maquinarias')
export class Maquinaria {
  @PrimaryGeneratedColumn('uuid', { name: 'maquina_id' })
  maquinaId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ name: 'etapa_id', type: 'uuid', nullable: true })
  etapaId!: string | null;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'marca_modelo', type: 'varchar', length: 100, nullable: true })
  marcaModelo!: string | null;

  @Column({ name: 'anio_fabricacion', type: 'integer', nullable: true })
  anioFabricacion!: number | null;

  @Column({ name: 'estado_operativo', type: 'varchar', length: 30, default: 'operativa' })
  estadoOperativo!: string;

  @Column({ name: 'horas_uso_acumuladas', type: 'numeric', precision: 10, scale: 2, default: 0, nullable: true })
  horasUsoAcumuladas!: string | null;
}
