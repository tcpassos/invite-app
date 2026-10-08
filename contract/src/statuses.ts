// Situações de convite e de resposta. São valores de execução, não só tipos,
// porque o front e a API precisam comparar com eles (Guia da Arquitetura, 10.3).

export const InviteStatus = {
  Draft: 'DRAFT',
  Published: 'PUBLISHED',
  Unpublished: 'UNPUBLISHED',
} as const;
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];

export const RsvpStatus = {
  Accepted: 'ACCEPTED',
  Declined: 'DECLINED',
  Maybe: 'MAYBE',
} as const;
export type RsvpStatus = (typeof RsvpStatus)[keyof typeof RsvpStatus];
