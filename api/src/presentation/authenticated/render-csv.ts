// renderCsv do diagrama do UC008: a serialização da exportação, que é forma de saída e por
// isso é da Apresentação (Guia, 3.4). O que está no banco continua íntegro.
import { RsvpStatus } from '@invite-app/contract';
import type { GuestExportRow } from '../../model/index.js';

// Ponto e vírgula, porque é o separador que a planilha em português abre sem perguntar.
const SEPARATOR = ';';

const STATUS_LABEL: Partial<Record<RsvpStatus, string>> = {
  [RsvpStatus.Accepted]: 'Sim',
  [RsvpStatus.Maybe]: 'Talvez',
};

/**
 * ADR-0008, medida 5: campo começado por =, +, - ou @ ganha uma aspa simples na frente,
 * para a planilha não executar o que o convidado escreveu como fórmula.
 */
export function neutralizeFormulaPrefix(field: string): string {
  return /^[=+\-@]/.test(field) ? `'${field}` : field;
}

function cell(value: string): string {
  return `"${neutralizeFormulaPrefix(value).replaceAll('"', '""')}"`;
}

/** Uma linha por convidado, com o BOM para a planilha ler os acentos em UTF-8. */
export function renderCsv(rows: readonly GuestExportRow[]): string {
  const header = ['Nome', 'Situação', 'Acompanhantes', 'Categorias', 'Observação'];
  const lines = rows.map((row) =>
    [
      row.name,
      STATUS_LABEL[row.status] ?? row.status,
      String(row.companionCount),
      row.categoryNames.join(', '),
      row.freeText ?? '',
    ].map(cell),
  );
  return '﻿' + [header.map(cell), ...lines].map((line) => line.join(SEPARATOR)).join('\r\n');
}
