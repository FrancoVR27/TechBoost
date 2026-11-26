import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('informes_analisis_ia')
export class InformeAnalisisIa {
  @PrimaryGeneratedColumn('uuid', { name: 'informe_id' })
  informeId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ name: 'tipo_analisis', type: 'varchar', length: 50 })
  tipoAnalisis!: string;

  @Column({ name: 'periodo_analizado', type: 'varchar', length: 50, nullable: true })
  periodoAnalizado!: string | null;

  @Column({ name: 'resumen_ejecutivo', type: 'text' })
  resumenEjecutivo!: string;

  @Column({ name: 'cuellos_de_botella', type: 'jsonb', nullable: true })
  cuellosDeBotella!: unknown;

  @Column({ name: 'predicciones_falla', type: 'jsonb', nullable: true })
  prediccionesFalla!: unknown;

  @Column({ name: 'recomendaciones_accionables', type: 'jsonb', nullable: true })
  recomendacionesAccionables!: unknown;

  @Column({ name: 'ahorro_estimado_bs', type: 'numeric', precision: 12, scale: 2, nullable: true })
  ahorroEstimadoBs!: string | null;

  @Column({ name: 'modelo_ia_utilizado', type: 'varchar', length: 60, nullable: true })
  modeloIaUtilizado!: string | null;

  @Column({ name: 'fecha_generacion', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', nullable: true })
  fechaGeneracion!: Date | null;
}
