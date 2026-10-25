// Leitura do corpo da criação e da correção do convite (UC002). A data e a hora chegam
// separadas, como a tela preenche, e a junção num instante do fuso do projeto é feita aqui,
// na Apresentação, antes de chegar ao Domínio (ADR-0013).
import { BadRequestException } from '@nestjs/common';
import type { InviteCommand } from '../../domain/invite.service.js';
import { projectInstant } from '../../domain/project-time.js';
import { asObject, optionalInteger, optionalString } from '../common/parse-request.js';

export function parseInviteCommand(raw: unknown): InviteCommand {
  const body = asObject(raw);
  const eventDate = optionalString(body, 'eventDate');
  const eventTime = optionalString(body, 'eventTime');
  return {
    eventName: optionalString(body, 'eventName'),
    location: optionalString(body, 'location'),
    schedule: schedule(eventDate, eventTime),
    peopleLimit: optionalInteger(body, 'peopleLimit', { nullable: true }),
    companionLimit: optionalInteger(body, 'companionLimit', { nullable: true }),
  };
}

function schedule(eventDate = '', eventTime = ''): InviteCommand['schedule'] {
  // Ausente ou vazio é regra, e quem recusa com 422 é o Domínio.
  if (!eventDate) return { missing: 'eventDate' };
  if (!eventTime) return { missing: 'eventTime' };
  // Fora de AAAA-MM-DD e HH:mm, ou fora do calendário, não é data que a rota declare.
  const eventStartsAt = projectInstant(eventDate, eventTime);
  if (!eventStartsAt) throw new BadRequestException();
  return { eventStartsAt };
}
