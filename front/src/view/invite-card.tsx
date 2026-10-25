import { TEMPLATES, type InviteCustomizationView } from '@invite-app/contract';
import type { CSSProperties } from 'react';
import { TemplateSet } from '../templates/template-set';

interface InviteCardProps {
  eventName: string;
  eventStartsAt: string;
  location: string;
  customization: InviteCustomizationView;
}

export function InviteCard({ eventName, eventStartsAt, location, customization }: InviteCardProps) {
  const template =
    TEMPLATES.find(({ code }) => code === customization.templateCode) ?? TEMPLATES[0]!;
  const colors = { ...template.defaultColors, ...customization.colorOverrides };
  const style = {
    '--invite-primary': colors.primary,
    '--invite-background': colors.background,
    '--invite-text': colors.text,
  } as CSSProperties;
  const date = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(eventStartsAt));
  return (
    <TemplateSet
      templateCode={template.code}
      eventName={eventName}
      eventDate={date}
      location={location}
      style={style}
    />
  );
}
