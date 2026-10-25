import type { DietaryExportRow } from '@invite-app/contract';

function neutralizeFormulaPrefix(value: string): string {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function escapeCsv(value: string): string {
  const safe = neutralizeFormulaPrefix(value);
  return `"${safe.replaceAll('"', '""')}"`;
}

export function csvResponse(rows: DietaryExportRow[]): string {
  const header = ['Nome', 'Resposta', 'Acompanhantes', 'Categorias', 'Observações'];
  const lines = rows.map((row) =>
    [
      row.name,
      row.status === 'ACCEPTED' ? 'Sim' : 'Talvez',
      String(row.companionCount),
      row.categories.join('; '),
      row.freeText,
    ]
      .map(escapeCsv)
      .join(','),
  );
  return `\uFEFF${[header.map(escapeCsv).join(','), ...lines].join('\r\n')}\r\n`;
}
