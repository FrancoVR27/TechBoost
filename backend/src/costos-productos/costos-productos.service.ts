import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../productos/productos.entity.js';
import { Insumo } from '../insumos/insumo.entity.js';
import { RecetaProductoInsumo } from '../receta-producto-insumos/receta-producto-insumo.entity.js';

@Injectable()
export class CostosProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
    @InjectRepository(Insumo)
    private readonly insumosRepository: Repository<Insumo>,
    @InjectRepository(RecetaProductoInsumo)
    private readonly recetasRepository: Repository<RecetaProductoInsumo>,
  ) {}

  async calcular(productoId: string) {
    const producto = await this.productosRepository.findOneBy({ productoId });
    if (!producto) {
      throw new NotFoundException('No se encontró el producto solicitado.');
    }

    const recetas = await this.recetasRepository.find({
      where: { productoId },
      order: { recetaId: 'ASC' },
    });

    const lineas: Array<{
      recetaId: string;
      insumoId: string;
      insumo: string;
      unidadMedida: string;
      cantidadRequerida: number;
      porcentajeMermaEstimada: number;
      cantidadConMerma: number;
      costoUnitarioBs: number;
      costoTotalBs: number;
    }> = [];
    let costoMateriales = 0;

    for (const receta of recetas) {
      const insumo = await this.insumosRepository.findOneBy({
        insumoId: receta.insumoId,
      });

      if (!insumo) {
        throw new NotFoundException(
          `No se encontró el insumo asociado a la receta ${receta.recetaId}.`,
        );
      }

      if (insumo.empresaId !== producto.empresaId) {
        throw new BadRequestException(
          'La receta contiene un insumo que pertenece a otra empresa.',
        );
      }

      const cantidad = Number(receta.cantidadRequerida);
      const mermaPct = Number(receta.porcentajeMermaEstimada ?? 0);
      const costoUnitario = Number(insumo.costoUnitarioPromedioBs);

      if (
        !Number.isFinite(cantidad) || cantidad <= 0 ||
        !Number.isFinite(mermaPct) || mermaPct < 0 || mermaPct > 100 ||
        !Number.isFinite(costoUnitario) || costoUnitario < 0
      ) {
        throw new BadRequestException(
          'La receta contiene cantidades, mermas o costos no válidos.',
        );
      }

      const cantidadConMerma = cantidad * (1 + mermaPct / 100);
      const costoLinea = cantidadConMerma * costoUnitario;
      costoMateriales += costoLinea;

      lineas.push({
        recetaId: receta.recetaId,
        insumoId: insumo.insumoId,
        insumo: insumo.nombre,
        unidadMedida: insumo.unidadMedida,
        cantidadRequerida: cantidad,
        porcentajeMermaEstimada: mermaPct,
        cantidadConMerma: Number(cantidadConMerma.toFixed(4)),
        costoUnitarioBs: Number(costoUnitario.toFixed(2)),
        costoTotalBs: Number(costoLinea.toFixed(2)),
      });
    }

    const costoManoObra = Number(producto.costoManoObraBs ?? 0);
    const otrosCostos = Number(producto.otrosCostosBs ?? 0);
    const precioVenta = Number(producto.precioVentaBs);

    if (
      !Number.isFinite(costoManoObra) || costoManoObra < 0 ||
      !Number.isFinite(otrosCostos) || otrosCostos < 0 ||
      !Number.isFinite(precioVenta) || precioVenta < 0
    ) {
      throw new BadRequestException(
        'El producto contiene costos o precio de venta no válidos.',
      );
    }

    const costoTotal = costoMateriales + costoManoObra + otrosCostos;
    const utilidad = precioVenta - costoTotal;
    // Margen sobre precio de venta, expresado como porcentaje.
    const margen = precioVenta > 0 ? (utilidad / precioVenta) * 100 : 0;

    producto.costoCalculadoBs = costoTotal.toFixed(2);
    producto.margenGananciaPct = margen.toFixed(2);
    await this.productosRepository.save(producto);

    return {
      producto: {
        productoId: producto.productoId,
        empresaId: producto.empresaId,
        nombre: producto.nombre,
        unidadMedida: producto.unidadMedida,
        precioVentaBs: Number(precioVenta.toFixed(2)),
      },
      materiales: lineas,
      totales: {
        costoMaterialesBs: Number(costoMateriales.toFixed(2)),
        costoManoObraBs: Number(costoManoObra.toFixed(2)),
        otrosCostosBs: Number(otrosCostos.toFixed(2)),
        costoCalculadoBs: Number(costoTotal.toFixed(2)),
        utilidadPorUnidadBs: Number(utilidad.toFixed(2)),
        margenGananciaPct: Number(margen.toFixed(2)),
        precioVentaBs: Number(precioVenta.toFixed(2)),
      },
    };
  }
}
