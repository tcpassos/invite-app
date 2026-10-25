// O tempo do evento no fuso do projeto (ADR-0013). Um fuso só para o projeto inteiro, e as
// comparações de dia, como a data no passado e o fim do prazo de alteração, são feitas
// nele. O nome IANA resolve horário de verão sozinho, se o país voltar a ter.
export const PROJECT_TIME_ZONE = 'America/Sao_Paulo';

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: PROJECT_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const wallClockFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: PROJECT_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** O dia do instante no fuso do projeto, como AAAA-MM-DD. Compara por texto. */
export function projectDate(instant: Date): string {
  return dayFormat.format(instant);
}

/**
 * O instante de uma data e hora lidas no fuso do projeto, ou vazio se elas não existem no
 * calendário, como 31 de fevereiro. É a junção que a Apresentação faz antes de entregar o
 * instante ao Domínio (ADR-0013).
 */
export function projectInstant(date: string, time: string): Date | null {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeParts = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateParts || !timeParts) return null;
  const [year, month, day] = dateParts.slice(1).map(Number) as [number, number, number];
  const [hour, minute] = timeParts.slice(1).map(Number) as [number, number];
  if (hour > 23 || minute > 59) return null;

  // Lê a data como se fosse UTC e corrige pela diferença do fuso naquele instante.
  const asUtc = Date.UTC(year, month - 1, day, hour, minute);
  const instant = new Date(asUtc - offsetMs(new Date(asUtc)));
  // A ida e volta recusa o dia que não existe e a hora pulada numa mudança de horário.
  return wallClock(instant) === `${date} ${time}` ? instant : null;
}

function wallClock(instant: Date): string {
  const parts = Object.fromEntries(
    wallClockFormat.formatToParts(instant).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

/** Quanto o relógio do projeto está à frente do UTC naquele instante. Negativo no Brasil. */
function offsetMs(instant: Date): number {
  const [date = '', time = ''] = wallClock(instant).split(' ');
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const [hour, minute] = time.split(':').map(Number) as [number, number];
  const seconds = instant.getTime() % 60_000;
  return Date.UTC(year, month - 1, day, hour, minute) + seconds - instant.getTime();
}
