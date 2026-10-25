import type { CSSProperties } from 'react';

interface TemplateSetProps {
  templateCode: string;
  eventName: string;
  eventDate: string;
  location: string;
  style: CSSProperties;
}

export function TemplateSet({
  templateCode,
  eventName,
  eventDate,
  location,
  style,
}: TemplateSetProps) {
  if (templateCode === 'botanical') {
    return (
      <article className="invite-template invite-template--botanical" style={style}>
        <span className="invite-template__ornament" aria-hidden="true" />
        <p className="invite-template__eyebrow">Um encontro especial</p>
        <h1>{eventName}</h1>
        <p>{eventDate}</p>
        <p>{location}</p>
      </article>
    );
  }

  if (templateCode === 'modern') {
    return (
      <article className="invite-template invite-template--modern" style={style}>
        <p className="invite-template__eyebrow">Convite</p>
        <h1>{eventName}</h1>
        <div className="invite-template__details">
          <p>{eventDate}</p>
          <p>{location}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="invite-template invite-template--classic" style={style}>
      <span className="invite-template__eyebrow">Você está convidado(a)</span>
      <h1>{eventName}</h1>
      <p>{eventDate}</p>
      <p>{location}</p>
    </article>
  );
}
