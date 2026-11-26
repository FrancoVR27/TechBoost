import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid', { name: 'producto_id' })
  productoId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sku!: string | null;

  @Column({ type: 'varchar', length: 120 })
  nombre!: string;

  @Column({ name: 'unidad_medida', type: 'varchar', length: 30 })
  unidadMedida!: string;

  @Column({ name: 'precio_venta_bs', type: 'numeric', precision: 10, scale: 2 })
  precioVentaBs!: string;

  @Column({ name: 'costo_calculado_bs', type: 'numeric', precision: 10, scale: 2, nullable: true })
  costoCalculadoBs!: string | null;

  @Column({ name: 'margen_ganancia_pct', type: 'numeric', precision: 5, scale: 2, nullable: true })
  margenGananciaPct!: string | null;

  @Column({ name: 'costo_mano_obra_bs', type: 'numeric', precision: 10, scale: 2, default: 0 })
  costoManoObraBs!: string;

  @Column({ name: 'otros_costos_bs', type: 'numeric', precision: 10, scale: 2, default: 0 })
  otrosCostosBs!: string;
}
