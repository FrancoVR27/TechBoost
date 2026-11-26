import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dispositivos_iot')
export class DispositivoIot {
  @PrimaryGeneratedColumn('uuid', { name: 'dispositivo_id' })
  dispositivoId!: string;

  @Column({ name: 'maquina_id', type: 'uuid' })
  maquinaId!: string;

  @Column({ name: 'codigo_hardware', type: 'varchar', length: 80, unique: true })
  codigoHardware!: string;

  @Column({ name: 'tipo_sensor', type: 'varchar', length: 50 })
  tipoSensor!: string;

  @Column({ name: 'unidad_medida', type: 'varchar', length: 20, nullable: true })
  unidadMedida!: string | null;

  @Column({ name: 'umbral_alerta_min', type: 'numeric', precision: 10, scale: 3, nullable: true })
  umbralAlertaMin!: string | null;

  @Column({ name: 'umbral_alerta_max', type: 'numeric', precision: 10, scale: 3, nullable: true })
  umbralAlertaMax!: string | null;

  @Column({ name: 'estado_conexion', type: 'varchar', length: 20, default: 'online' })
  estadoConexion!: string;
}
