import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import type { CostBreakdown, DestajoRecord, FinanceMovementRecord, FinanceReport } from './finance.types.js';
import {
  isCostNature,
  isMovementType,
} from './finance.utils.js';
import { FinanceService } from './finance.service.js';

@Controller('finance')
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  private userId(request: AuthenticatedRequest): string {
    const userId = request.user?.sub;
    if (!userId) throw new UnauthorizedException();
    return userId;
  }

  private integerQuery(value: string | undefined, name: string, fallback: number): number {
    if (value === undefined) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException(`${name} debe ser un entero positivo`);
    }
    return Math.min(parsed, 500);
  }

  private amountQuery(value: string | undefined, name: string): number {
    if (value === undefined) return 0;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new BadRequestException(`${name} debe ser un número mayor o igual a cero`);
    }
    return Math.round(parsed * 100) / 100;
  }

  @Get('movements')
  async movements(
    @Req() request: AuthenticatedRequest,
    @Query('period') period?: string,
    @Query('type') type?: string,
    @Query('nature') nature?: string,
    @Query('limit') limit?: string,
  ): Promise<{ items: FinanceMovementRecord[] }> {
    if (type !== undefined && !isMovementType(type)) {
      throw new BadRequestException('Tipo de movimiento no válido');
    }
    if (nature !== undefined && !isCostNature(nature)) {
      throw new BadRequestException('Naturaleza de costo no válida');
    }
    const items = await this.finance.listMovements(
      this.userId(request),
      period,
      type,
      nature,
      this.integerQuery(limit, 'limit', 500),
    );
    return { items };
  }

  @Post('movements')
  createMovement(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<FinanceMovementRecord> {
    return this.finance.createMovement(this.userId(request), body);
  }

  @Get('destajos')
  destajos(
    @Req() request: AuthenticatedRequest,
    @Query('period') period?: string,
  ): Promise<DestajoRecord[]> {
    return this.finance.getDestajos(this.userId(request), period);
  }

  @Patch('destajos/:id/pay')
  payDestajo(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{ destajo: DestajoRecord; alreadyPaid: boolean }> {
    return this.finance.payDestajo(this.userId(request), id);
  }

  @Get('costs')
  costs(
    @Req() request: AuthenticatedRequest,
    @Query('period') period?: string,
  ): Promise<CostBreakdown> {
    return this.finance.getCostBreakdown(this.userId(request), period);
  }

  @Get('report')
  report(
    @Req() request: AuthenticatedRequest,
    @Query('period') period?: string,
    @Query('openingBalance') openingBalance?: string,
  ): Promise<FinanceReport> {
    return this.finance.getReport(
      this.userId(request),
      period,
      this.amountQuery(openingBalance, 'openingBalance'),
    );
  }
}
