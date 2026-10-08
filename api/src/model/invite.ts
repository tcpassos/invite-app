// Classes de modelo do Diagrama de Classes (DAS, seção 5.2). Nenhuma tem método: o
// comportamento mora nos serviços do Domínio. A camada de Dados devolve estes tipos e
// nunca a linha do banco (ADR-0014).
import type { InviteStatus } from '@invite-app/contract';

export interface Invite {
  id: string;
  hostId: string;
  eventName: string;
  /** Instante único do evento, guardado em UTC (ADR-0013). */
  eventStartsAt: Date;
  location: string;
  status: InviteStatus;
  /** Nasce na primeira publicação e é reaproveitado ao republicar (ADR-0005). */
  publicToken: string | null;
  capacityLimit: number | null;
  maxCompanionsPerGuest: number | null;
}

/** Objeto de valor: um papel de cor do template e o valor dele, em #rrggbb. */
export interface ColorSetting {
  role: string;
  value: string;
}

/** Sem linha salva, o convite usa o template padrão sem sobrescritas (UC003 passo 1). */
export interface InviteCustomization {
  templateCode: string;
  colorOverrides: ColorSetting[];
}
