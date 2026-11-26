import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('etapas_cadena_valor')
export class EtapaCadenaValor {
  @PrimaryGeneratedColumn('uuid', { name: 'etapa_id' })
  etapaId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ name: 'nombre_etapa', type: 'varchar', length: 100 })
  nombreEtapa!: string;

  @Column({ name: 'tipo_actividad', type: 'varchar', length: 20, default: 'primaria' })
  tipoActividad!: string;

  @Column({ name: 'orden_secuencia', type: 'integer' })
  ordenSecuencia!: number;

  @Column({ name: 'tiempo_estimado_min', type: 'numeric', precision: 8, scale: 2, nullable: true })
  tiempoEstimadoMin!: string | null;

  @Column({ name: 'costo_mano_obra_estandar_bs', type: 'numeric', precision: 10, scale: 2, default: 0, nullable: true })
  costoManoObraEstandarBs!: string | null;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;
}
