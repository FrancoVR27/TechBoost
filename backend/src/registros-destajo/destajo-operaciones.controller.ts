import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import type { FiltrosDestajoDto, RegistrarDestajoDto } from './dto/registrar-destajo.dto.js';
import { RegistrosDestajoService } from './registros-destajo.service.js';

@Controller('rrhh/destajo')
export class DestajoOperacionesController {
  constructor(private readonly service: RegistrosDestajoService) {}

  private usuario(request: AuthenticatedRequest) {
    const user = request.user;
    if (!user?.sub) throw new UnauthorizedException();
    return { id: user.sub, rol: user.rol };
  }

  @Post()
  registrar(
    @Body() datos: RegistrarDestajoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = this.usuario(request);
    return this.service.registrar(datos, user.id, user.rol);
  }

  @Get()
  listar(
    @Query() filtros: FiltrosDestajoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = this.usuario(request);
    return this.service.listar(filtros, user.id, user.rol);
  }

  @Get('resumen')
  resumen(
    @Query('empresaId') empresaId: string,
    @Query('desde') desde: string | undefined,
    @Query('hasta') hasta: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = this.usuario(request);
    return this.service.resumen(empresaId, desde, hasta, user.id, user.rol);
  }

  @Patch(':id/marcar-pagado')
  marcarPagado(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = this.usuario(request);
    return this.service.marcarPagado(id, user.id, user.rol);
  }
}
