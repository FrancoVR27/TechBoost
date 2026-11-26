import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
import { CrudService } from './crud.service.js';

@Controller()
export abstract class CrudController<T extends ObjectLiteral> {
  protected constructor(protected readonly service: CrudService<T>) {}

  @Get()
  findAll(@Query('limit') limit?: string, @Query('after') after?: string) {
    const parsedLimit = limit === undefined ? 100 : Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      throw new BadRequestException('limit debe ser un entero positivo');
    }

    return this.service.findAll(parsedLimit, after);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: unknown) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
