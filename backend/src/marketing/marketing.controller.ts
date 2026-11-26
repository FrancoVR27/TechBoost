import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { MarketingService } from './marketing.service.js';

@Controller('marketing/empresas/:empresaId')
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  @Get('resumen')
  obtenerResumen(@Param('empresaId', ParseUUIDPipe) empresaId: string) {
    return this.marketingService.obtenerResumen(empresaId);
  }

  @Get('contactos')
  listarContactos(@Param('empresaId', ParseUUIDPipe) empresaId: string) {
    return this.marketingService.listarContactos(empresaId);
  }

  @Post('contactos')
  crearContacto(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() body: unknown,
  ) {
    return this.marketingService.crearContacto(empresaId, body);
  }

  @Patch('contactos/:contactoId')
  actualizarContacto(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('contactoId', ParseUUIDPipe) contactoId: string,
    @Body() body: unknown,
  ) {
    return this.marketingService.actualizarContacto(empresaId, contactoId, body);
  }

  @Delete('contactos/:contactoId')
  eliminarContacto(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('contactoId', ParseUUIDPipe) contactoId: string,
  ) {
    return this.marketingService.eliminarContacto(empresaId, contactoId);
  }

  @Get('campanias')
  listarCampanias(@Param('empresaId', ParseUUIDPipe) empresaId: string) {
    return this.marketingService.listarCampanias(empresaId);
  }

  @Post('campanias')
  crearCampania(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() body: unknown,
  ) {
    return this.marketingService.crearCampania(empresaId, body);
  }

  @Patch('campanias/:campaniaId')
  actualizarCampania(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('campaniaId', ParseUUIDPipe) campaniaId: string,
    @Body() body: unknown,
  ) {
    return this.marketingService.actualizarCampania(empresaId, campaniaId, body);
  }

  @Delete('campanias/:campaniaId')
  eliminarCampania(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('campaniaId', ParseUUIDPipe) campaniaId: string,
  ) {
    return this.marketingService.eliminarCampania(empresaId, campaniaId);
  }

  @Get('contactos/:contactoId/interacciones')
  listarInteracciones(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('contactoId', ParseUUIDPipe) contactoId: string,
  ) {
    return this.marketingService.listarInteracciones(empresaId, contactoId);
  }

  @Post('contactos/:contactoId/interacciones')
  crearInteraccion(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Param('contactoId', ParseUUIDPipe) contactoId: string,
    @Body() body: unknown,
  ) {
    return this.marketingService.crearInteraccion(empresaId, contactoId, body);
  }
}
