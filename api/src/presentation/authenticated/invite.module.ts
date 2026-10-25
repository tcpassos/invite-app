// O pacote autenticado da Apresentação, com os serviços do painel (Guia, 5.3).
import { Module } from '@nestjs/common';
import { AttendanceService } from '../../domain/attendance.service.js';
import { DietaryService } from '../../domain/dietary.service.js';
import { InviteService } from '../../domain/invite.service.js';
import { DietaryController } from './dietary.controller.js';
import { InviteController } from './invite.controller.js';

@Module({
  controllers: [InviteController, DietaryController],
  providers: [InviteService, AttendanceService, DietaryService],
})
export class InviteModule {}
