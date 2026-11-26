import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  QueryFailedError,
  QueryDeepPartialEntity,
  Repository,
} from 'typeorm';

@Injectable()
export abstract class CrudService<T extends ObjectLiteral> {
  protected constructor(protected readonly repository: Repository<T>) {}

  async findAll(
    limit = 100,
    after?: string,
  ): Promise<{ items: unknown[]; nextCursor: string | null }> {
    const primaryColumn = this.getPrimaryColumn();
    const query = this.repository
      .createQueryBuilder('record')
      .orderBy(`record.${primaryColumn.propertyName}`, 'ASC')
      .take(Math.min(limit, 100) + 1);
    if (after !== undefined) {
      query.where(`record.${primaryColumn.propertyName} > :after`, {
        after: this.normalizeId(after),
      });
    }

    const rows = await query.getMany();
    const page = rows.slice(0, Math.min(limit, 100));
    const lastRow = page[page.length - 1];

    return {
      items: page.map((row) => this.toResponse(row)),
      nextCursor:
        rows.length > page.length && lastRow
          ? String(lastRow[primaryColumn.propertyName])
          : null,
    };
  }

  async findOne(id: string): Promise<unknown> {
    const row = await this.findById(id);
    if (!row) {
      throw new NotFoundException('Registro no encontrado');
    }

    return this.toResponse(row);
  }

  async create(body: unknown): Promise<unknown> {
    const payload = this.validateBody(body, true);
    const row = await this.withDatabaseErrors(() =>
      this.repository.save(this.repository.create(payload as DeepPartial<T>)),
    );

    return this.toResponse(row);
  }

  async update(id: string, body: unknown): Promise<unknown> {
    const payload = this.validateBody(body, false);
    const criteria = {
      [this.getPrimaryColumn().propertyName]: this.normalizeId(id),
    } as FindOptionsWhere<T>;
    const result = await this.withDatabaseErrors(() =>
      this.repository.update(criteria, payload as QueryDeepPartialEntity<T>),
    );

    if (!result.affected) {
      throw new NotFoundException('Registro no encontrado');
    }

    const row = await this.findById(id);
    if (!row) {
      throw new NotFoundException('Registro no encontrado');
    }

    return this.toResponse(row);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const criteria = {
      [this.getPrimaryColumn().propertyName]: this.normalizeId(id),
    } as FindOptionsWhere<T>;
    const result = await this.withDatabaseErrors(() =>
      this.repository.delete(criteria),
    );

    if (!result.affected) {
      throw new NotFoundException('Registro no encontrado');
    }

    return { deleted: true };
  }

  protected toResponse(row: T): unknown {
    return { ...row };
  }

  private async findById(id: string): Promise<T | null> {
    const criteria = {
      [this.getPrimaryColumn().propertyName]: this.normalizeId(id),
    } as FindOptionsWhere<T>;
    return this.repository.findOneBy(criteria);
  }

  private getPrimaryColumn() {
    const primaryColumn = this.repository.metadata.primaryColumns[0];
    if (!primaryColumn) {
      throw new Error('La entidad no tiene una clave primaria');
    }

    return primaryColumn;
  }

  private normalizeId(id: string): string | number {
    const column = this.getPrimaryColumn();
    if (column.type === 'uuid') {
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          id,
        )
      ) {
        throw new BadRequestException('El identificador debe ser un UUID válido');
      }
      return id;
    }

    if (column.type === 'int' || column.type === 'integer') {
      const parsed = Number(id);
      if (!Number.isSafeInteger(parsed)) {
        throw new BadRequestException('El identificador debe ser un entero válido');
      }
      return parsed;
    }

    if (column.type === 'bigint') {
      if (!/^\d+$/.test(id)) {
        throw new BadRequestException('El identificador debe ser un entero válido');
      }
      return id;
    }

    return id;
  }

  private validateBody(body: unknown, allowPrimary: boolean): Record<string, unknown> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('El cuerpo debe ser un objeto JSON');
    }

    const allowedColumns = new Set(
      this.repository.metadata.columns
        .filter(
          (column) =>
            !column.isGenerated &&
            !column.isCreateDate &&
            !column.isUpdateDate &&
            !column.isVersion &&
            (allowPrimary || !column.isPrimary),
        )
        .map((column) => column.propertyName),
    );
    const entries = Object.entries(body);
    const invalidFields = entries
      .map(([field]) => field)
      .filter((field) => !allowedColumns.has(field));

    if (invalidFields.length > 0) {
      throw new BadRequestException(
        `Campos no permitidos: ${invalidFields.join(', ')}`,
      );
    }
    if (entries.length === 0) {
      throw new BadRequestException('El cuerpo no puede estar vacío');
    }

    return Object.fromEntries(entries);
  }

  private async withDatabaseErrors<R>(
    operation: () => Promise<R>,
  ): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const code = error.driverError?.code;
        if (code === '23505') {
          throw new ConflictException('Ya existe un registro con esos datos');
        }
        if (
          ['23502', '23503', '23514', '22P02', '22003'].includes(code)
        ) {
          throw new BadRequestException(
            'Los datos no cumplen las restricciones de la base de datos',
          );
        }
      }

      throw error;
    }
  }
}
