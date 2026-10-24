// Formatação do que a API manda, para exibir. A data chega como um instante ISO e é
// mostrada no fuso do projeto, o mesmo em que a API leu a data e a hora digitadas (ADR-0013).
import { InviteStatus, RsvpStatus } from '@invite-app/contract';

export const PROJECT_TIME_ZONE = 'America/Sao_Paulo';

export function formatEventDate(eventStartsAt: string): string {
  return new Date(eventStartsAt).toLocaleDateString('pt-BR', {
    timeZone: PROJECT_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatEventTime(eventStartsAt: string): string {
  const [hour = '', minute = ''] = new Date(eventStartsAt)
    .toLocaleTimeString('pt-BR', {
      timeZone: PROJECT_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit',
    })
    .split(':');
  return minute === '00' ? `${hour}h` : `${hour}h${minute}`;
}

/** O que o anfitrião digitou no formulário, para a prévia. Sem fuso: é texto, não instante. */
export function formatDateInput(eventDate: string): string {
  const [year, month, day] = eventDate.split('-').map(Number);
  if (!year || !month || !day) return '';
  return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatTimeInput(eventTime: string): string {
  const [hour, minute] = eventTime.split(':');
  if (!hour || !minute) return '';
  return minute === '00' ? `${hour}h` : `${hour}h${minute}`;
}

export function formatClock(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * O instante devolvido pela API, separado de volta em data e hora para o formulário de
 * correção, que envia os dois campos como na criação (ADR-0013).
 */
export function toDateAndTime(eventStartsAt: string): { eventDate: string; eventTime: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: PROJECT_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(eventStartsAt))
      .map((part) => [part.type, part.value]),
  );
  return {
    eventDate: `${parts.year}-${parts.month}-${parts.day}`,
    eventTime: `${parts.hour}:${parts.minute}`,
  };
}

export const RSVP_STATUS_LABEL: Record<RsvpStatus, string> = {
  [RsvpStatus.Accepted]: 'Sim',
  [RsvpStatus.Maybe]: 'Talvez',
  [RsvpStatus.Declined]: 'Não',
};

export const INVITE_STATUS_LABEL: Record<InviteStatus, string> = {
  [InviteStatus.Draft]: 'Rascunho',
  [InviteStatus.Published]: 'Publicado',
  [InviteStatus.Unpublished]: 'Despublicado',
};
