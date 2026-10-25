const PROJECT_TIME_ZONE = 'America/Sao_Paulo';

export interface ProjectDateTimeInput {
  eventDate: string;
  eventTime: string;
}

export function toProjectDateTimeInput(value: string): ProjectDateTimeInput {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: PROJECT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';

  return {
    eventDate: `${part('year')}-${part('month')}-${part('day')}`,
    eventTime: `${part('hour')}:${part('minute')}`,
  };
}
