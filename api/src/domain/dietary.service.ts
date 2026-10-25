// DietaryService do Diagrama de Componentes: a consolidação e a exportação do UC008, na
// ordem do diagrama de sequência. O Domínio conduz o caso de uso e decide quem conta, e a
// camada de Dados agrega no banco.
import { Injectable } from '@nestjs/common';
import { RsvpStatus } from '@invite-app/contract';
import { DietaryCategoryRepository } from '../data/dietary-category.repository.js';
import { InviteRepository } from '../data/invite.repository.js';
import type { DietaryCategory, DietaryDescription, GuestExportRow } from '../model/index.js';
import { validateOwnership } from './ownership.js';

/** UC008 RN2: só conta quem respondeu sim ou talvez. Vai por parâmetro aos Dados (Guia, 4.3). */
export const DIETARY_STATUSES = [RsvpStatus.Accepted, RsvpStatus.Maybe] as const;

export interface DietaryConsolidation {
  /** Só as categorias com alguém, na ordem do catálogo. Vazio é o A1 do UC008. */
  counts: { category: DietaryCategory; count: number }[];
  descriptions: DietaryDescription[];
}

@Injectable()
export class DietaryService {
  constructor(
    private readonly invites: InviteRepository,
    private readonly categories: DietaryCategoryRepository,
  ) {}

  async consolidateDietaryNotes(inviteId: string, hostId: string): Promise<DietaryConsolidation> {
    validateOwnership(await this.invites.findById(inviteId), hostId);
    const counts = await this.invites.countGuestsByCategory(inviteId, DIETARY_STATUSES);
    const categories = await this.categories.listDietaryCategories();
    const describedCodes = categories
      .filter((category) => category.requiresDescription)
      .map((category) => category.code);
    const descriptions = await this.invites.findDescriptionsByCategories(
      inviteId,
      DIETARY_STATUSES,
      describedCodes,
    );
    return {
      counts: categories.flatMap((category) => {
        const count = counts.find((item) => item.code === category.code)?.count ?? 0;
        return count > 0 ? [{ category, count }] : [];
      }),
      descriptions,
    };
  }

  /** As linhas da exportação, sem formatá-las. Quem monta o CSV é a Apresentação. */
  async exportDietaryNotes(inviteId: string, hostId: string): Promise<GuestExportRow[]> {
    validateOwnership(await this.invites.findById(inviteId), hostId);
    return this.invites.findGuestsForExport(inviteId, DIETARY_STATUSES);
  }
}
