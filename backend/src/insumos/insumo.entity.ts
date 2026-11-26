import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn('uuid', { name: 'insumo_id' })
  insumoId!: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ name: 'unidad_medida', type: 'varchar', length: 20 })
  unidadMedida!: string;

  @Column({ name: 'stock_actual', type: 'numeric', precision: 12, scale: 3, default: 0 })
  stockActual!: string;

  @Column({ name: 'stock_minimo_alerta', type: 'numeric', precision: 12, scale: 3, default: 0 })
  stockMinimoAlerta!: string;

  @Column({ name: 'costo_unitario_promedio_bs', type: 'numeric', precision: 10, scale: 2, default: 0 })
  costoUnitarioPromedioBs!: string;
}
