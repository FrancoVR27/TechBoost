import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { FiltrosDestajoDto, RegistrarDestajoDto } from './dto/registrar-destajo.dto.js';
import { RegistrosDestajoService } from './registros-destajo.service.js';

@Controller('rrhh/destajo')
export class DestajoOperacionesController {
  constructor(private readonly service: RegistrosDestajoService) {}

  @Post()
  registrar(@Body() datos: RegistrarDestajoDto) {
    return this.service.registrar(datos);
  }

  @Get()
  listar(@Query() filtros: FiltrosDestajoDto) {
    return this.service.listar(filtros);
  }

  @Get('resumen')
  resumen(
    @Query('empresaId') empresaId: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.service.resumen(empresaId, desde, hasta);
  }

  @Patch(':id/marcar-pagado')
  marcarPagado(@Param('id') id: string) {
    return this.service.marcarPagado(id);
  }
}
