import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { Empresa } from './empresas.entity.js';
import { EmpresasService } from './empresas.service.js';

@Controller('empresas')
export class EmpresasController {
  constructor(private readonly empresas: EmpresasService) {}

  private usuario(request: AuthenticatedRequest): { id: string; rol: string } {
    const user = request.user;
    if (!user?.sub) throw new UnauthorizedException();
    return { id: user.sub, rol: user.rol };
  }

  @Get()
  async findAll(
    @Req() request: AuthenticatedRequest,
  ): Promise<{ items: Empresa[]; nextCursor: null }> {
    const user = this.usuario(request);
    const items = await this.empresas.listarParaUsuario(user.id, user.rol);
    return { items, nextCursor: null };
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Empresa> {
    const user = this.usuario(request);
    return this.empresas.buscarParaUsuario(id, user.id, user.rol);
  }

  @Post()
  create(
    @Body() body: unknown,
    @Req() request: AuthenticatedRequest,
  ): Promise<Empresa> {
    const user = this.usuario(request);
    return this.empresas.crearParaUsuario(user.id, body);
  }
}
