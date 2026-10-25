import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { DietaryService } from '../../domain/panel.service.js';
import { HostId, SessionGuard } from '../common/session.js';
import { csvResponse } from './render-csv.js';

@Controller('invites/:inviteId')
@UseGuards(SessionGuard)
export class DietaryController {
  constructor(private readonly dietary: DietaryService) {}

  @Get('dietary-summary')
  summary(@Param('inviteId') inviteId: string, @HostId() hostId: string) {
    return this.dietary.consolidateDietaryNotes(inviteId, hostId);
  }

  @Get('dietary-notes.csv')
  async exportCsv(
    @Param('inviteId') inviteId: string,
    @HostId() hostId: string,
    @Res() response: Response,
  ): Promise<void> {
    const rows = await this.dietary.exportDietaryNotes(inviteId, hostId);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="invite-${inviteId}.csv"`);
    response.setHeader('Cache-Control', 'private, no-store');
    response.send(csvResponse(rows));
  }
}
