// Gera a imagem de prévia do link de cada template (ADR-0009), em public/templates. A imagem
// usa o mesmo CSS do convite, em src/templates, para a prévia combinar com o que o convidado
// abre. Rodar de novo sempre que um template mudar ou entrar:
//   npm run og-images --workspace front
// Precisa do Playwright com o Chromium, que não é dependência do projeto. Na raiz:
//   npm install --no-save playwright && npx playwright install chromium
import { mkdir, readFile } from 'node:fs/promises';
import { TEMPLATES } from '@invite-app/contract';

const { chromium } = await import('playwright');
const css = await readFile(
  new URL('../src/templates/invite-templates.css', import.meta.url),
  'utf8',
);
const out = new URL('../public/templates/', import.meta.url);
await mkdir(out, { recursive: true });

// As mesmas fontes que o front embute pelo next/font. Só o gerador as busca na rede.
const fonts =
  'https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=DM+Sans:wght@500&family=Fraunces:wght@600&display=block';

const page = (template) => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<link rel="stylesheet" href="${fonts}">
<style>
  ${css}
  :root { --font-handwritten: 'Caveat'; --font-heading: 'Fraunces'; }
  body { margin: 0; width: 1200px; height: 630px; display: grid; place-items: center;
         background: oklch(0.966 0.023 87.5); font-family: 'DM Sans', sans-serif; }
  .invite-template { width: 1040px; height: 470px; box-sizing: border-box; padding: 64px;
                     display: grid; align-content: center; }
  .invite-template__seal { width: 64px; height: 64px; top: -24px; }
  .invite-template__greeting { font-size: 96px; margin: 0; }
  .invite-template__title { font-size: 44px; margin: 24px 0 0; opacity: 0.85; }
</style></head>
<body>
  <article class="invite-template invite-template--${template.code}"
           style="--invite-primary: ${template.defaultColors.primary}; --invite-accent: ${template.defaultColors.accent}">
    <div class="invite-template__seal"></div>
    <p class="invite-template__greeting">você está convidado(a)!</p>
    <p class="invite-template__title">Confirme sua presença pelo link</p>
  </article>
</body></html>`;

const browser = await chromium.launch(
  process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {},
);
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const template of TEMPLATES) {
  await tab.setContent(page(template), { waitUntil: 'networkidle' });
  await tab.evaluate(() => document.fonts.ready);
  const file = new URL(`${template.code}.png`, out);
  await tab.screenshot({ path: file.pathname });
  console.log(`public/templates/${template.code}.png`);
}
await browser.close();
