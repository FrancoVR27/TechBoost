import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  IaPredictivaService,
  type MensajeChat,
  type TipoAnalisisIa,
} from './ia-predictiva.service.js';
// Reemplaza la ruta por tu guard JWT real:
// import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

const TIPOS_VALIDOS: TipoAnalisisIa[] = [
  'optimizacion_cadena_valor',
  'mantenimiento_predictivo',
  'costos_y_margenes',
  'demanda_estacional',
  'diagnostico_integral',
];

@Controller('empresas/:empresaId')
// @UseGuards(JwtAuthGuard)
export class IaPredictivaController {
  constructor(private readonly iaService: IaPredictivaService) {}

  private extraerUsuario(req: any): { usuarioId: string; rol: string } {
    const user = req.user ?? {};
    const usuarioId = user.usuarioId ?? user.sub ?? user.usuario_id;
    const rol = user.rol ?? 'Cliente';
    if (!usuarioId) {
      throw new BadRequestException('Token JWT sin identificador de usuario');
    }
    return { usuarioId, rol };
  }

  @Get('ia/informes')
  async listarInformes(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Req() req: any,
  ) {
    const { usuarioId, rol } = this.extraerUsuario(req);
    return this.iaService.listarInformes(empresaId, usuarioId, rol);
  }

  @Post('ia/predecir')
  async predecir(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body()
    body: {
      tipoAnalisis?: TipoAnalisisIa;
      tipo_analisis?: TipoAnalisisIa;
      periodoAnalizado?: string;
    },
    @Req() req: any,
  ) {
    const { usuarioId, rol } = this.extraerUsuario(req);
    const tipo = (body.tipoAnalisis ??
      body.tipo_analisis ??
      'diagnostico_integral') as TipoAnalisisIa;

    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new BadRequestException('Tipo de análisis no válido');
    }

    return this.iaService.generarPrediccion(
      empresaId,
      usuarioId,
      rol,
      tipo,
      body.periodoAnalizado,
    );
  }

  @Post('chat')
  async chat(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body() body: { mensaje?: string; historial?: MensajeChat[] },
    @Req() req: any,
  ) {
    if (!body?.mensaje || !body.mensaje.trim()) {
      throw new BadRequestException('El campo mensaje es obligatorio');
    }
    const { usuarioId, rol } = this.extraerUsuario(req);
    return this.iaService.chatearConEmpresa(
      empresaId,
      usuarioId,
      rol,
      body.mensaje.trim(),
      body.historial ?? [],
    );
  }
}