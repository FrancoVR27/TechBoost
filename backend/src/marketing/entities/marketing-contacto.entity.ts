import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('marketing_contactos')
export class MarketingContacto {
  @PrimaryGeneratedColumn('uuid', { name: 'contacto_id' })
  contactoId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ name: 'campania_id', type: 'uuid', nullable: true })
  campaniaId!: string | null;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 150 })
  nombreCompleto!: string;

  @Column({ name: 'empresa_contacto', type: 'varchar', length: 150, nullable: true })
  empresaContacto!: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  correo!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  rubro!: string | null;

  @Column({ type: 'varchar', length: 30, default: 'otro' })
  fuente!: string;

  @Column({ type: 'varchar', length: 20, default: 'nuevo' })
  estado!: string;

  @Column({ type: 'text', nullable: true })
  necesidad!: string | null;

  @Column({ type: 'text', nullable: true })
  notas!: string | null;

  @Column({ name: 'proximo_seguimiento', type: 'date', nullable: true })
  proximoSeguimiento!: string | null;

  @Column({ name: 'fecha_registro', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fechaRegistro!: Date;
}
