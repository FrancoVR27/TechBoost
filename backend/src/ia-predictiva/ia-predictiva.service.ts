import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenAI, Type } from '@google/genai';
import { Empresa } from '../empresas/empresas.entity.js';
import { InformeAnalisisIa } from '../informes-analisis-ia/informe-analisis-ia.entity.js';
import { Maquinaria } from '../maquinarias/maquinaria.entity.js';
import { Insumo } from '../insumos/insumo.entity.js';

export type TipoAnalisisIa =
  | 'optimizacion_cadena_valor'
  | 'mantenimiento_predictivo'
  | 'costos_y_margenes'
  | 'demanda_estacional'
  | 'diagnostico_integral';

export interface MensajeChat {
  role: 'user' | 'model';
  text: string;
}

@Injectable()
export class IaPredictivaService {
  private readonly ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  private readonly modeloDefault = 'gemini-3.5-flash-lite';

  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    @InjectRepository(InformeAnalisisIa)
    private readonly informeRepo: Repository<InformeAnalisisIa>,
    @InjectRepository(Maquinaria)
    private readonly maquinariaRepo: Repository<Maquinaria>,
    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,
  ) {}

  async verificarAccesoEmpresa(
    empresaId: string,
    usuarioId: string,
    rol: string,
  ): Promise<Empresa> {
    const empresa = await this.empresaRepo.findOne({
      where: { empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    if (rol !== 'Admin' && empresa.clienteId !== usuarioId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta empresa',
      );
    }

    return empresa;
  }

  async listarInformes(
    empresaId: string,
    usuarioId: string,
    rol: string,
  ): Promise<InformeAnalisisIa[]> {
    await this.verificarAccesoEmpresa(empresaId, usuarioId, rol);

    return this.informeRepo.find({
      where: { empresaId },
      order: { fechaGeneracion: 'DESC' },
    });
  }

  async generarPrediccion(
    empresaId: string,
    usuarioId: string,
    rol: string,
    tipoAnalisis: TipoAnalisisIa,
    periodoAnalizado?: string,
  ): Promise<InformeAnalisisIa> {
    const empresa = await this.verificarAccesoEmpresa(
      empresaId,
      usuarioId,
      rol,
    );

    const [maquinarias, insumos] = await Promise.all([
      this.maquinariaRepo.find({ where: { empresaId } }),
      this.insumoRepo.find({ where: { empresaId } }),
    ]);

    const contexto = {
      empresa: {
        empresaId: empresa.empresaId,
        razonSocial: empresa.razonSocial,
        rubro: empresa.rubro,
        tamano: empresa.tamano,
        departamento: empresa.departamento,
        cantidadEmpleados: empresa.cantidadEmpleados,
        configuracionErpIa: empresa.configuracionErpIa,
      },
      maquinarias,
      insumos,
    };

    const prompt = `
Eres el motor de IA predictiva de TECH BOOST para industrias y PyMEs en Bolivia.
Analiza los datos reales de la empresa y genera un informe estructurado del tipo "${tipoAnalisis}"${periodoAnalizado ? ` para el periodo "${periodoAnalizado}"` : ''}.
No inventes datos inexistentes; si hay poca información registrada, señálalo en las recomendaciones y explica qué conviene registrar.

DATOS DE LA EMPRESA (JSON):
${JSON.stringify(contexto)}
`;

    const response = await this.ai.models.generateContent({
      model: this.modeloDefault,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            resumenEjecutivo: { type: Type.STRING },
            cuellosDeBotella: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            prediccionesFalla: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  objetivo: { type: Type.STRING },
                  riesgo: { type: Type.STRING },
                  ventanaEstimada: { type: Type.STRING },
                  motivo: { type: Type.STRING },
                },
              },
            },
            recomendacionesAccionables: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            ahorroEstimadoBs: { type: Type.NUMBER },
          },
          required: [
            'resumenEjecutivo',
            'cuellosDeBotella',
            'prediccionesFalla',
            'recomendacionesAccionables',
            'ahorroEstimadoBs',
          ],
        },
      },
    });

    const resultado = JSON.parse(response.text!) as {
      resumenEjecutivo: string;
      cuellosDeBotella: string[];
      prediccionesFalla: Array<{
        objetivo: string;
        riesgo: string;
        ventanaEstimada: string;
        motivo: string;
      }>;
      recomendacionesAccionables: string[];
      ahorroEstimadoBs: number;
    };

    const informe = this.informeRepo.create({
      empresaId,
      tipoAnalisis,
      periodoAnalizado: periodoAnalizado ?? 'Actual',
      resumenEjecutivo: resultado.resumenEjecutivo,
      cuellosDeBotella: resultado.cuellosDeBotella,
      prediccionesFalla: resultado.prediccionesFalla,
      recomendacionesAccionables: resultado.recomendacionesAccionables,
      ahorroEstimadoBs: Number(resultado.ahorroEstimadoBs || 0).toFixed(2),
      modeloIaUtilizado: this.modeloDefault,
    });

    return this.informeRepo.save(informe);
  }

  async chatearConEmpresa(
    empresaId: string,
    usuarioId: string,
    rol: string,
    mensaje: string,
    historial: MensajeChat[] = [],
  ): Promise<{ respuesta: string; empresaId: string }> {
    const empresa = await this.verificarAccesoEmpresa(
      empresaId,
      usuarioId,
      rol,
    );

    const [maquinarias, insumos, ultimosInformes] = await Promise.all([
      this.maquinariaRepo.find({ where: { empresaId } }),
      this.insumoRepo.find({ where: { empresaId } }),
      this.informeRepo.find({
        where: { empresaId },
        order: { fechaGeneracion: 'DESC' },
        take: 3,
      }),
    ]);

    const contents = [
      ...historial.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: mensaje }],
      },
    ];

    const response = await this.ai.models.generateContent({
      model: this.modeloDefault,
      contents,
      config: {
        systemInstruction: `
Eres el asistente inteligente de TECH BOOST para la empresa "${empresa.razonSocial}" (ID: ${empresa.empresaId}, rubro: ${empresa.rubro}, tamaño: ${empresa.tamano}).
Responde en español, de forma directa, práctica y enfocada en operaciones, costos en Bs, inventarios y maquinaria.
Usa exclusivamente la información de la empresa que se adjunta; si falta un dato, indícalo claramente.

CONTEXTO DE LA EMPRESA:
${JSON.stringify({
  empresa: {
    razonSocial: empresa.razonSocial,
    rubro: empresa.rubro,
    tamano: empresa.tamano,
    departamento: empresa.departamento,
    cantidadEmpleados: empresa.cantidadEmpleados,
  },
  maquinarias,
  insumos,
  ultimosInformes,
})}
`,
      },
    });

    return {
      respuesta: response.text ?? 'No pude generar una respuesta en este momento.',
      empresaId,
    };
  }
}