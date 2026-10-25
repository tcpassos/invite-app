// O pacote público da Apresentação. Não importa nada do pacote autenticado (Guia, 5.3).
import { Module } from '@nestjs/common';
import { RsvpService } from '../../domain/rsvp.service.js';
import { PublicRsvpController } from './public-rsvp.controller.js';

@Module({
  controllers: [PublicRsvpController],
  providers: [RsvpService],
})
export class PublicModule {}
