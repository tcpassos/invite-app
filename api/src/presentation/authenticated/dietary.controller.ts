// DietaryController do pacote autenticado: a consolidação e a exportação do UC008.
import { Controller, Get, Header, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import type { DietarySummary } from '@invite-app/contract';
import { DietaryService } from '../../domain/dietary.service.js';
import { HostId, SessionGuard } from '../common/session.js';
import { renderCsv } from './render-csv.js';

@Controller('invites/:inviteId')
@UseGuards(SessionGuard)
export class DietaryController {
  constructor(private readonly dietary: DietaryService) {}

  /** O dado mais sensível do sistema: só do anfitrião, nunca guardado (Guia, 9.5). */
  @Get('dietary-summary')
  @Header('Cache-Control', 'private, no-store')
  async summary(
    @Param('inviteId') inviteId: string,
    @HostId() hostId: string,
  ): Promise<DietarySummary> {
    const { counts, descriptions } = await this.dietary.consolidateDietaryNotes(inviteId, hostId);
    return {
      counts: counts.map(({ category, count }) => ({
        code: category.code,
        displayName: category.displayName,
        count,
      })),
      descriptions,
    };
  }

  /**
   * Arquivo para baixar, com o charset explícito porque nome brasileiro tem acento, e como
   * anexo para o navegador não o abrir como página (Guia, 9.5).
   */
  @Get('dietary-notes.csv')
  async exportCsv(
    @Param('inviteId') inviteId: string,
    @HostId() hostId: string,
    @Res() res: Response,
  ): Promise<void> {
    const rows = await this.dietary.exportDietaryNotes(inviteId, hostId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="lista-para-o-buffet.csv"');
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(renderCsv(rows));
  }
}
