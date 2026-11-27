import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { CrearMovimientoDto } from './dto/crear-movimiento.dto.js';
import { HistorialMovimientosService } from './historial-movimientos.service.js';
import { TrabajadoresService } from './trabajadores.service.js';

@Controller('trabajadores')
export class TrabajadoresController {
  constructor(
    private readonly trabajadores: TrabajadoresService,
    private readonly historialService: HistorialMovimientosService,
  ) {}

  private usuario(request: AuthenticatedRequest) {
    const user = request.user;
    if (!user?.sub) throw new UnauthorizedException();
    return { sub: user.sub, rol: user.rol };
  }

  private limite(value?: string): number {
    if (value === undefined) return 100;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException('limit debe ser un entero positivo.');
    }
    return Math.min(parsed, 100);
  }

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query('limit') limit?: string,
    @Query('after') after?: string,
  ) {
    return this.trabajadores.listar(this.usuario(request), this.limite(limit), after);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.trabajadores.obtener(this.usuario(request), id);
  }

  @Post()
  create(@Body() body: unknown, @Req() request: AuthenticatedRequest) {
    return this.trabajadores.crear(this.usuario(request), body);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.trabajadores.actualizar(this.usuario(request), id, body);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.trabajadores.eliminar(this.usuario(request), id);
  }

  @Post(':id/movimientos')
  async registrarMovimiento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CrearMovimientoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.trabajadores.obtener(this.usuario(request), id);
    return this.historialService.registrar(id, dto);
  }

  @Get(':id/movimientos')
  async consultarHistorial(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    await this.trabajadores.obtener(this.usuario(request), id);
    return this.historialService.consultarHistorial(id);
  }
}
