import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid', { name: 'usuario_id' })
  usuarioId!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  apellido!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  correo!: string;

  @Column({ name: 'contrasena_hash', type: 'varchar', length: 255 })
  contrasenaHash!: string;

  @Column({ type: 'varchar', length: 20 })
  rol!: string;

  @Column({ name: 'plan_id', type: 'integer', nullable: true })
  planId!: number | null;

  @Column({ type: 'varchar', length: 20, default: 'activo' })
  estado!: string;

  @Column({
    name: 'fecha_registro',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  fechaRegistro!: Date | null;
}
