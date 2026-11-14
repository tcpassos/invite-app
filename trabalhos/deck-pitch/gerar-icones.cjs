// Gera os ícones do deck do Pitch a partir do Lucide (react-icons), em PNG branco e azul.
// Uso: NODE_PATH=<pasta com react-icons, react, react-dom e sharp> node gerar-icones.cjs
const fs = require('fs');
const path = require('path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const sharp = require('sharp');
const lu = require('react-icons/lu');

const ICONES = {
  conversa: 'LuMessageCircle', pessoas: 'LuUsers', prato: 'LuSalad', alvo: 'LuTarget',
  festa: 'LuPartyPopper', celular: 'LuSmartphone', chef: 'LuChefHat', chave: 'LuKeyRound',
  paleta: 'LuPalette', compartilhar: 'LuShare2', calendario: 'LuCalendarCheck',
  prancheta: 'LuClipboardList', camadas: 'LuLayers', seta_baixo: 'LuArrowDown',
  quebra: 'LuPuzzle', contrato: 'LuFileCode', desacoplar: 'LuUnplug', caixa: 'LuBox',
  escudo: 'LuShieldCheck', servidor: 'LuServer', banco: 'LuDatabase', nuvem: 'LuCloud',
  atualizar: 'LuRefreshCw', cookie: 'LuCookie', link: 'LuLink', monitor: 'LuMonitor',
  codigo: 'LuCode', container: 'LuContainer', pr: 'LuGitPullRequest', fluxo: 'LuWorkflow',
  robo: 'LuBot', usuario_ok: 'LuUserCheck', check: 'LuCheck', seta: 'LuArrowRight',
  alerta: 'LuTriangleAlert', ideia: 'LuLightbulb', kanban: 'LuSquareKanban', foguete: 'LuRocket',
  chaves: 'LuBraces', lista: 'LuListChecks', relogio: 'LuTimer', engrenagem: 'LuSettings',
  trava: 'LuLock', planilha: 'LuSheet', telas: 'LuAppWindow', mapa: 'LuMap', lupa: 'LuSearch',
  diff: 'LuGitCompare', mais: 'LuPlus', git: 'LuGitBranch',
};
const CORES = { branco: '#FFFFFF', azul: '#21049A', laranja: '#E94D1C' };

(async () => {
  const pasta = path.join(__dirname, 'icones');
  fs.mkdirSync(pasta, { recursive: true });
  for (const [nome, comp] of Object.entries(ICONES)) {
    if (!lu[comp]) { console.error('falta', comp); continue; }
    for (const [cor, hex] of Object.entries(CORES)) {
      const svg = renderToStaticMarkup(React.createElement(lu[comp], { size: 256, color: hex, strokeWidth: 2 }));
      await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(path.join(pasta, `${nome}-${cor}.png`));
    }
  }
  console.log('ícones gerados:', Object.keys(ICONES).length);
})();
