
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import {
  DataSource,
  Repository,
} from 'typeorm';

import { Trabajador } from './trabajador.entity.js';
import { HistorialMovimiento } from './historial-movimiento.entity.js';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto.js';

@Injectable()
export class HistorialMovimientosService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Trabajador)
    private readonly trabajadoresRepository: Repository<Trabajador>,

    @InjectRepository(HistorialMovimiento)
    private readonly historialRepository: Repository<HistorialMovimiento>,
  ) {}

  async registrar(
    trabajadorId: string,
    dto: CrearMovimientoDto,
  ) {
    // 1. Validar que se hayan recibido datos.

    if (!dto || typeof dto !== 'object') {
      throw new BadRequestException(
        'Debe enviar los datos del movimiento',
      );
    }

    // 2. Validar el tipo de movimiento.

    const tiposPermitidos = [
      'alta',
      'baja',
      'paso',
      'despido',
      'promocion',
    ] as const;

    if (
      typeof dto.tipoMovimiento !== 'string' ||
      !tiposPermitidos.includes(
        dto.tipoMovimiento as typeof tiposPermitidos[number],
      )
    ) {
      throw new BadRequestException(
        'Tipo de movimiento no válido',
      );
    }

    const tipo = dto.tipoMovimiento;

    // 3. Validar la fecha.

    if (
      typeof dto.fechaMovimiento !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dto.fechaMovimiento) ||
      !this.fechaValida(dto.fechaMovimiento)
    ) {
      throw new BadRequestException(
        'La fecha debe tener el formato YYYY-MM-DD y ser válida',
      );
    }

    // 4. Validar que los campos opcionales sean textos.

    for (const [campo, valor] of [
      ['cargoNuevo', dto.cargoNuevo],
      ['motivo', dto.motivo],
      ['observaciones', dto.observaciones],
    ] as const) {
      if (
        valor !== undefined &&
        valor !== null &&
        typeof valor !== 'string'
      ) {
        throw new BadRequestException(
          `El campo ${campo} debe ser un texto`,
        );
      }
    }

    // 5. Validar el nuevo cargo.

    const cargoNuevo = dto.cargoNuevo?.trim();

    if (
      ['paso', 'promocion'].includes(tipo) &&
      !cargoNuevo
    ) {
      throw new BadRequestException(
        'Debe especificar el nuevo cargo',
      );
    }

    if (cargoNuevo && cargoNuevo.length > 80) {
      throw new BadRequestException(
        'El cargo no puede superar los 80 caracteres',
      );
    }

    // 6. Registrar el movimiento en una transacción.

    return this.dataSource.transaction(
      async (manager) => {

        const trabajadores =
          manager.getRepository(Trabajador);

        const historial =
          manager.getRepository(HistorialMovimiento);

        // Bloquear el registro mientras se procesa
        // la transacción para evitar modificaciones simultáneas.

        const trabajador = await trabajadores.findOne({
          where: { trabajadorId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!trabajador) {
          throw new NotFoundException(
            'Trabajador no encontrado',
          );
        }

        // 7. Validar el estado actual del trabajador.

        if (tipo === 'alta' && trabajador.activo) {
          throw new BadRequestException(
            'El trabajador ya se encuentra activo',
          );
        }

        if (
          ['baja', 'despido'].includes(tipo) &&
          !trabajador.activo
        ) {
          throw new BadRequestException(
            'El trabajador ya se encuentra inactivo',
          );
        }

        // 8. Obtener el cargo anterior.

        const cargoAnterior = trabajador.cargo;

        // 9. Actualizar los datos del trabajador.

        if (tipo === 'alta') {
          trabajador.activo = true;
        }

        if (tipo === 'baja' || tipo === 'despido') {
          trabajador.activo = false;
        }

        if (tipo === 'paso' || tipo === 'promocion') {
          trabajador.cargo = cargoNuevo!;
        }

        await trabajadores.save(trabajador);

        // 10. Crear el registro del historial.

        const nuevoMovimiento = historial.create({
          trabajadorId,
          tipoMovimiento: tipo,
          cargoAnterior,
          cargoNuevo:
            tipo === 'paso' || tipo === 'promocion'
              ? cargoNuevo!
              : null,
          fechaMovimiento: dto.fechaMovimiento,
          motivo: dto.motivo?.trim() || null,
          observaciones: dto.observaciones?.trim() || null,
        });

        return historial.save(nuevoMovimiento);
      },
    );
  }

  // Consultar el historial laboral de un trabajador.

  async consultarHistorial(trabajadorId: string) {
    const trabajador =
      await this.trabajadoresRepository.findOneBy({
        trabajadorId,
      });

    if (!trabajador) {
      throw new NotFoundException(
        'Trabajador no encontrado',
      );
    }

    return this.historialRepository.find({
      where: { trabajadorId },
      order: {
        fechaMovimiento: 'DESC',
        fechaRegistro: 'DESC',
      },
    });
  }

  // Comprobar que la fecha exista en el calendario.

  private fechaValida(fecha: string): boolean {
    const [anio, mes, dia] = fecha.split('-').map(Number);

    const date = new Date(
      Date.UTC(anio, mes - 1, dia),
    );

    return (
      date.getUTCFullYear() === anio &&
      date.getUTCMonth() === mes - 1 &&
      date.getUTCDate() === dia
    );
  }
}
