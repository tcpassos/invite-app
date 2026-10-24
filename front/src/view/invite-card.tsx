// O convite como o convidado vê, desenhado pelo template escolhido (ADR-0009). É a mesma
// view na página pública, no link pessoal e na prévia do editor. Todo texto entra como
// texto, nunca como HTML (ADR-0008, medida 4).
import type { CSSProperties } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { DEFAULT_TEMPLATE_CODE, TEMPLATES, type HexColor } from '@invite-app/contract';
import { formatEventDate, formatEventTime } from './format';

export interface InviteCardContent {
  eventName: string;
  /** Data e hora já formatadas. Vazias na prévia de um formulário ainda sem data. */
  dateLabel: string;
  timeLabel: string;
  location: string;
  templateCode: string;
  colorOverrides: Record<string, HexColor>;
}

export function templateFor(templateCode: string) {
  return (
    TEMPLATES.find((template) => template.code === templateCode) ??
    TEMPLATES.find((template) => template.code === DEFAULT_TEMPLATE_CODE)!
  );
}

/** O que a API devolve, no formato do cartão. */
export function cardContent(invite: {
  eventName: string;
  eventStartsAt: string;
  location: string;
  customization: { templateCode: string; colorOverrides: Record<string, HexColor> };
}): InviteCardContent {
  return {
    eventName: invite.eventName,
    dateLabel: formatEventDate(invite.eventStartsAt),
    timeLabel: formatEventTime(invite.eventStartsAt),
    location: invite.location,
    ...invite.customization,
  };
}

export function InviteCard({ invite }: { invite: InviteCardContent }) {
  const template = templateFor(invite.templateCode);
  const colors = { ...template.defaultColors, ...invite.colorOverrides };
  const style = {
    '--invite-primary': colors.primary,
    '--invite-accent': colors.accent,
  } as CSSProperties;

  return (
    <article className={`invite-template invite-template--${template.code}`} style={style}>
      <div className="invite-template__seal" aria-hidden />
      <p className="invite-template__greeting">você está convidado(a)!</p>
      <h1 className="invite-template__title">{invite.eventName || 'Nome da festa'}</h1>

      <dl className="invite-template__facts">
        <div className="invite-template__fact">
          <span className="invite-template__icon" aria-hidden>
            <Calendar className="size-4" />
          </span>
          <dt>Data</dt>
          <dd>{invite.dateLabel || 'A definir'}</dd>
        </div>
        <div className="invite-template__fact">
          <span className="invite-template__icon" aria-hidden>
            <Clock className="size-4" />
          </span>
          <dt>Hora</dt>
          <dd>{invite.timeLabel || 'A definir'}</dd>
        </div>
        <div className="invite-template__fact">
          <span className="invite-template__icon" aria-hidden>
            <MapPin className="size-4" />
          </span>
          <dt>Local</dt>
          <dd>{invite.location || 'A definir'}</dd>
        </div>
      </dl>
    </article>
  );
}
