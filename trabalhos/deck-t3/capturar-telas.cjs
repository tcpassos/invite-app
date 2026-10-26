// Capturas da aplicação real para o deck do T3, no caminho da demo.
// Precisa do front em 127.0.0.1:3000 e da API em 127.0.0.1:3001, com o banco vazio ou não.
// Uso: node capturar-telas.cjs capturas
const { chromium } = require('playwright');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:3000';
const log = (...a) => console.log('•', ...a);
require('fs').mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ['--lang=pt-BR'], env: { ...process.env, LANG: 'pt_BR.UTF-8', LANGUAGE: 'pt_BR:pt', LC_ALL: 'pt_BR.UTF-8' } });
  const desk = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' };
  const cel = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' };
  const hostCtx = await browser.newContext(desk);
  const host = await hostCtx.newPage();
  const errors = [];
  host.on('pageerror', (e) => errors.push(String(e)));

  await host.goto(`${BASE}/sign-in`);
  await host.waitForLoadState('networkidle');
  await host.screenshot({ path: `${OUT}/c01-entrada.png` });
  await host.getByRole('button', { name: 'Ainda não tenho conta' }).click();
  await host.getByLabel('Seu nome').fill('Marina');
  await host.getByLabel('Email').fill(`marina-${Date.now()}@exemplo.com`);
  await host.getByLabel('Senha').fill('senha-forte');
  await host.getByRole('button', { name: 'Criar conta' }).click();
  await host.waitForURL('**/invites');
  await host.getByText('Nenhum convite ainda').waitFor();

  // convite de reserva, para a lotação: teto 2, uma confirmação com 1 acompanhante
  const criar = async (nome, teto, acomp) => {
    await host.goto(`${BASE}/invites`);
    await host.getByRole('button', { name: 'Novo convite' }).click();
    await host.getByLabel('Nome da festa').fill(nome);
    await host.getByLabel('Local').fill('Chácara da família, Novo Hamburgo');
    await host.getByLabel('Data').fill('2026-11-21');
    await host.getByLabel('Hora').fill('19:30');
    await host.getByLabel('Máximo de pessoas (opcional)').fill(String(teto));
    await host.getByLabel('Acompanhantes por convidado (opcional)').fill(String(acomp));
    await host.getByRole('button', { name: 'Salvar rascunho' }).click();
    await host.waitForURL(/\/invites\/\d+$/);
  };

  await criar('Aniversário de 70 anos da vó Lurdes', 4, 1);
  await host.getByRole('button', { name: /Jardim/ }).click();
  await host.getByRole('button', { name: 'Salvar alterações' }).click();
  await host.getByText('Alterações salvas.').waitFor();
  await host.getByRole('button', { name: 'Publicar' }).click();
  const linkField = host.getByLabel('Link do convite');
  await linkField.waitFor();
  const link = await linkField.inputValue();
  await host.evaluate(() => window.scrollTo(0, 0));
  await host.screenshot({ path: `${OUT}/c02-editor.png` });
  const painelUrl = host.url();
  log('publicado', link);

  const guestCtx = await browser.newContext(cel);
  const guest = await guestCtx.newPage();
  const answer = async (url, name, status, companions, allergy) => {
    await guest.goto(url);
    await guest.getByText(status, { exact: true }).click();
    await guest.getByLabel('Seu nome').fill(name);
    if (companions !== undefined) await guest.getByLabel('Acompanhantes').fill(String(companions));
    if (allergy) {
      await guest.getByText('Alergia', { exact: true }).click();
      await guest.getByLabel('Descreva a restrição').fill(allergy);
    }
    await guest.getByRole('button', { name: 'Enviar resposta' }).click();
  };

  await guest.goto(link);
  await guest.waitForLoadState('networkidle');
  await guest.screenshot({ path: `${OUT}/c03-convite.png` });
  await guest.screenshot({ path: `${OUT}/c03-convite-inteiro.png`, fullPage: true });

  await answer(link, 'Bia', 'Sim', 1, 'Amendoim');
  await guest.getByText('Resposta enviada!').waitFor();
  const personal = await guest.getByLabel('Seu link pessoal').inputValue();
  await guest.getByText('Resposta enviada!').scrollIntoViewIfNeeded();
  await guest.screenshot({ path: `${OUT}/c04-resposta.png` });

  await answer(link, 'Dani', 'Sim', 1);
  await guest.getByText('Resposta enviada!').waitFor();
  await answer(link, 'Caio', 'Sim', 0);
  await guest.getByText('O evento está lotado. Você ainda pode responder que não vai.').waitFor();
  await guest.getByText('O evento está lotado').scrollIntoViewIfNeeded();
  await guest.screenshot({ path: `${OUT}/c05-lotado.png` });
  await guest.getByText('Talvez', { exact: true }).click();
  await guest.getByRole('button', { name: 'Enviar resposta' }).click();
  await guest.getByText('Resposta enviada!').waitFor();
  await answer(link, 'Eduardo', 'Não');
  await guest.getByText('Resposta enviada!').waitFor();

  await guest.goto(personal);
  await guest.getByText('Talvez', { exact: true }).click();
  await guest.getByRole('button', { name: 'Salvar alteração' }).click();
  await guest.getByText('Resposta atualizada.').waitFor();
  await guest.screenshot({ path: `${OUT}/c06-link-pessoal.png` });

  await host.goto(painelUrl);
  await host.getByText('Total de pessoas').waitFor();
  await host.getByText('Total de pessoas').scrollIntoViewIfNeeded();
  await host.screenshot({ path: `${OUT}/c07-painel.png` });
  await host.screenshot({ path: `${OUT}/c07-painel-inteiro.png`, fullPage: true });

  await host.goto(`${BASE}/invites`);
  await host.waitForLoadState('networkidle');
  await host.screenshot({ path: `${OUT}/c08-lista.png` });

  await host.goto(painelUrl);
  await host.getByRole('button', { name: 'Despublicar' }).click();
  await host.getByRole('button', { name: 'Publicar' }).waitFor();
  await guest.goto(link);
  await guest.waitForLoadState('networkidle');
  log('despublicado →', new URL(guest.url()).pathname);
  await guest.screenshot({ path: `${OUT}/c09-nao-encontrado.png` });

  log('erros de página:', errors.length ? errors : 'nenhum');
  await browser.close();
})().catch((e) => {
  console.error('FALHOU', e);
  process.exit(1);
});
