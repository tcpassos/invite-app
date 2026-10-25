import { renderCsv } from './render-csv.js';

describe('renderCsv (UC008 ED2)', () => {
  it('uma linha por convidado, com cabeçalho, BOM e ponto e vírgula', () => {
    const csv = renderCsv([
      {
        name: 'Ana',
        status: 'ACCEPTED',
        companionCount: 2,
        categoryNames: ['Alergia', 'Vegano'],
        freeText: 'Amendoim',
      },
      { name: 'Bia', status: 'MAYBE', companionCount: 0, categoryNames: [], freeText: null },
    ]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv.slice(1).split('\r\n')).toEqual([
      '"Nome";"Situação";"Acompanhantes";"Categorias";"Observação"',
      '"Ana";"Sim";"2";"Alergia, Vegano";"Amendoim"',
      '"Bia";"Talvez";"0";"";""',
    ]);
  });

  it('neutraliza fórmula e escapa aspas, sem mexer no dado (ADR-0008, medida 5)', () => {
    const csv = renderCsv([
      {
        name: '=HYPERLINK("x")',
        status: 'ACCEPTED',
        companionCount: 0,
        categoryNames: [],
        freeText: '@SOMA(A1)',
      },
    ]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain(`"'@SOMA(A1)"`);
  });
});
