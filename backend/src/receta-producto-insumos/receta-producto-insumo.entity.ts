import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('receta_producto_insumos')
export class RecetaProductoInsumo {
  @PrimaryGeneratedColumn('uuid', { name: 'receta_id' })
  recetaId!: string;

  @Column({ name: 'producto_id', type: 'uuid' })
  productoId!: string;

  @Column({ name: 'insumo_id', type: 'uuid' })
  insumoId!: string;

  @Column({ name: 'cantidad_requerida', type: 'numeric', precision: 10, scale: 4 })
  cantidadRequerida!: string;

  @Column({ name: 'porcentaje_merma_estimada', type: 'numeric', precision: 5, scale: 2, default: 0, nullable: true })
  porcentajeMermaEstimada!: string | null;
}
