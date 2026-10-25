import { Module } from '@nestjs/common';
import { AttendanceService, DietaryService } from '../../domain/panel.service.js';
import { InviteService } from '../../domain/invite.service.js';
import { DietaryController } from './dietary.controller.js';
import { InviteController } from './invite.controller.js';

@Module({
  controllers: [InviteController, DietaryController],
  providers: [InviteService, AttendanceService, DietaryService],
})
export class InviteModule {}
