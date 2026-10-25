import { csvResponse } from './render-csv.js';

describe('csvResponse', () => {
  it('quotes CSV values and neutralizes spreadsheet formulas', () => {
    const output = csvResponse([
      {
        name: '=HYPERLINK("https://example.com")',
        status: 'ACCEPTED',
        companionCount: 1,
        categories: ['Sem glúten'],
        freeText: 'Alergia, "grave"',
      },
    ]);

    expect(output).toContain('"\'=HYPERLINK(""https://example.com"")"');
    expect(output).toContain('"Alergia, ""grave"""');
    expect(output.split('\r\n')).toHaveLength(3);
  });

  it('still produces a header when no eligible guest responded', () => {
    expect(csvResponse([])).toContain('"Nome","Resposta","Acompanhantes"');
  });
});
