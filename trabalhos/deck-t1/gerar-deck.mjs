// Gera os artboards .dc.html do deck do T1 a partir de uma estrutura de dados,
// para que os 30 slides compartilhem exatamente o mesmo sistema visual.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = process.argv[2]
mkdirSync(OUT, { recursive: true })

const AZUL = '#21049A'
const AZUL_ESCURO = '#16036B'
const LARANJA = '#E94D1C'
const GRAFITE = '#1A1A1E'
const CINZA = '#6B6B78'
const CINZA_CLARO = '#D9D9D9'

const FONTE = `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;900&family=Roboto+Mono:wght@400&display=swap">`

const base = (corpo, fundo) => `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
    ${FONTE}
  <style>
    body { margin: 0; font-family: Roboto, "Helvetica Neue", Arial, sans-serif; }
    a { color: ${LARANJA}; text-decoration: none; }
    a:hover { color: ${AZUL}; }
    .sl { width: 1280px; height: 720px; box-sizing: border-box; position: relative; overflow: hidden; background: ${fundo}; }
    .cartola { font-weight: 900; font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; }
    .titulo { font-weight: 900; line-height: 1.02; letter-spacing: -0.015em; margin: 0; }
    .corpo { font-weight: 300; line-height: 1.5; margin: 0; }
    .rodape { position: absolute; left: 72px; right: 72px; bottom: 34px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 400; }
    .barra { width: 64px; height: 5px; border-radius: 3px; background: ${LARANJA}; }
    .item { display: flex; gap: 14px; align-items: flex-start; }
    .cc { font-weight: 900; color: ${LARANJA}; flex: none; }
  </style>
</helmet>
${corpo}
</x-dc>
</body>
</html>
`

const rodape = (n, bloco, claro) => `  <div class="rodape" style="color: ${claro ? 'rgba(255,255,255,.55)' : CINZA}">
    <span>${bloco}</span><span style="font-weight:900; color: ${claro ? '#fff' : AZUL}">${String(n).padStart(2, '0')}</span>
  </div>`

// ---------- modelos de slide ----------

const capa = (s) => base(`<div class="sl" style="background: linear-gradient(135deg, ${AZUL} 0%, ${AZUL_ESCURO} 62%, #2E0BC4 100%)">
  <div style="position:absolute; right:-160px; top:-160px; width:620px; height:620px; border-radius:50%; background:rgba(233,77,28,.16)"></div>
  <div style="position:absolute; right:60px; bottom:-220px; width:420px; height:420px; border-radius:50%; border:2px solid rgba(255,255,255,.14)"></div>
  <div style="position:absolute; left:72px; top:64px; display:flex; flex-direction:column; gap:6px">
    <div style="width:130px; height:26px; border:1px dashed rgba(255,255,255,.4); border-radius:3px; display:flex; align-items:center; justify-content:center; font-size:9px; letter-spacing:.14em; color:rgba(255,255,255,.5); font-weight:400">LOGO UNISINOS</div>
  </div>
  <div style="position:absolute; left:72px; top:214px; right:380px">
    <div class="cartola" style="color:${LARANJA}">${s.cartola}</div>
    <h1 class="titulo" style="color:#fff; font-size:74px; margin-top:20px">${s.titulo}</h1>
    <div class="barra" style="margin-top:30px"></div>
    <p class="corpo" style="color:rgba(255,255,255,.82); font-size:21px; margin-top:28px; max-width:660px">${s.sub}</p>
  </div>
  <div style="position:absolute; left:72px; bottom:78px; display:flex; gap:44px; color:rgba(255,255,255,.7); font-size:13px; font-weight:400">
    <div><div style="color:rgba(255,255,255,.42); font-size:10px; letter-spacing:.14em; margin-bottom:7px">EQUIPE</div>${s.equipe}</div>
    <div><div style="color:rgba(255,255,255,.42); font-size:10px; letter-spacing:.14em; margin-bottom:7px">DISCIPLINA</div>${s.disciplina}</div>
    <div><div style="color:rgba(255,255,255,.42); font-size:10px; letter-spacing:.14em; margin-bottom:7px">DATA</div>${s.data}</div>
  </div>
</div>`, AZUL)

const secao = (s) => base(`<div class="sl" style="background:${AZUL}">
  <div style="position:absolute; left:0; top:0; bottom:0; width:10px; background:${LARANJA}"></div>
  <div style="position:absolute; right:-120px; bottom:-180px; width:520px; height:520px; border-radius:50%; background:rgba(255,255,255,.05)"></div>
  <div style="position:absolute; left:96px; top:50%; transform:translateY(-50%); right:120px">
    <div style="font-weight:900; font-size:130px; color:rgba(255,255,255,.16); line-height:1">${s.num}</div>
    <div class="cartola" style="color:${LARANJA}; margin-top:10px">${s.cartola}</div>
    <h2 class="titulo" style="color:#fff; font-size:56px; margin-top:16px; max-width:820px">${s.titulo}</h2>
    <p class="corpo" style="color:rgba(255,255,255,.72); font-size:19px; margin-top:22px; max-width:700px">${s.sub}</p>
  </div>
${rodape(s.n, s.bloco, true)}
</div>`, AZUL)

const citacao = (s) => base(`<div class="sl" style="background:${AZUL}; display:flex; align-items:center; justify-content:center; padding:0 130px">
  <div style="text-align:left; max-width:960px">
    <div style="font-weight:900; font-size:70px; color:${LARANJA}; line-height:0.6">&ldquo;</div>
    <p style="font-weight:300; font-size:${s.tam || 40}px; line-height:1.32; color:#fff; margin:22px 0 0">${s.texto}</p>
    <div class="barra" style="margin-top:34px"></div>
    <p class="corpo" style="color:rgba(255,255,255,.6); font-size:15px; margin-top:18px">${s.fonte}</p>
  </div>
${rodape(s.n, s.bloco, true)}
</div>`, AZUL)

const impacto = (s) => base(`<div class="sl" style="background:${AZUL}; display:flex; align-items:center; padding:0 96px">
  <div>
    <div class="cartola" style="color:${LARANJA}">${s.cartola}</div>
    <h2 class="titulo" style="color:#fff; font-size:${s.tam || 52}px; margin-top:20px; max-width:1000px">${s.titulo}</h2>
    ${s.sub ? `<p class="corpo" style="color:rgba(255,255,255,.75); font-size:20px; margin-top:26px; max-width:840px">${s.sub}</p>` : ''}
  </div>
${rodape(s.n, s.bloco, true)}
</div>`, AZUL)

const cabecalho = (s) => `  <div style="position:absolute; left:72px; top:66px; right:72px">
    <div class="cartola" style="color:${LARANJA}">${s.cartola}</div>
    <h2 class="titulo" style="color:${AZUL}; font-size:${s.tam || 40}px; margin-top:14px; max-width:1000px">${s.titulo}</h2>
  </div>`

const lista = (itens, cor) => itens.map((i) => `      <div class="item">
        <span class="cc" style="font-size:17px; line-height:1.5">//</span>
        <p class="corpo" style="font-size:19px; color:${cor || GRAFITE}">${i}</p>
      </div>`).join('\n')

const conteudo = (s) => base(`<div class="sl" style="background:#fff">
${cabecalho(s)}
  <div style="position:absolute; left:72px; top:${s.top || 210}px; right:${s.right || 320}px; display:flex; flex-direction:column; gap:19px">
${lista(s.itens)}
  </div>
  ${s.nota ? `<div style="position:absolute; right:72px; top:210px; width:${s.notaW || 250}px; border-left:3px solid ${LARANJA}; padding-left:20px">
    <div class="cartola" style="color:${LARANJA}; font-size:11px">${s.notaTitulo || 'ATENÇÃO'}</div>
    <p class="corpo" style="font-size:15px; color:${CINZA}; margin-top:11px">${s.nota}</p>
  </div>` : ''}
${rodape(s.n, s.bloco)}
</div>`, '#fff')

const duasColunas = (s) => base(`<div class="sl" style="background:#fff">
${cabecalho(s)}
  <div style="position:absolute; left:72px; top:214px; right:72px; display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:56px">
    <div>
      <div class="cartola" style="color:${s.corA || AZUL}; font-size:12px">${s.tituloA}</div>
      <div style="height:3px; background:${s.corA || AZUL}; margin:11px 0 20px; width:44px"></div>
      <div style="display:flex; flex-direction:column; gap:15px">
${lista(s.itensA)}
      </div>
    </div>
    <div>
      <div class="cartola" style="color:${s.corB || LARANJA}; font-size:12px">${s.tituloB}</div>
      <div style="height:3px; background:${s.corB || LARANJA}; margin:11px 0 20px; width:44px"></div>
      <div style="display:flex; flex-direction:column; gap:15px">
${lista(s.itensB)}
      </div>
    </div>
  </div>
${rodape(s.n, s.bloco)}
</div>`, '#fff')

const terminal = (s) => base(`<div class="sl" style="background:#fff">
${cabecalho(s)}
  <div style="position:absolute; left:72px; top:206px; right:72px; background:#12121A; border-radius:8px; padding:24px 28px; font-family:'Roboto Mono', ui-monospace, Menlo, Consolas, monospace">
    <div style="display:flex; gap:9px; margin-bottom:18px; align-items:center">
      <span style="width:34px;height:3px;border-radius:2px;background:${LARANJA}"></span>
      <span style="font-size:11px; letter-spacing:.14em; color:#6B6B78; font-weight:400">TERMINAL</span>
    </div>
${s.linhas.map((l) => `    <div style="font-size:15px; line-height:1.75; color:${l.startsWith('$') ? '#7FE3A1' : l.startsWith('#') ? '#6B6B78' : '#E4E4EC'}; white-space:pre">${l}</div>`).join('\n')}
  </div>
  <div style="position:absolute; left:72px; bottom:${s.rodapeAlto || 82}px; right:72px; font-size:12px; color:${CINZA}; font-weight:400">${s.captura}</div>
${rodape(s.n, s.bloco)}
</div>`, '#fff')

const codigo = (s) => base(`<div class="sl" style="background:#fff">
${cabecalho(s)}
  <div style="position:absolute; left:72px; top:206px; width:${s.larguraCod || 640}px; background:#F4F4F8; border-radius:8px; border:1px solid ${CINZA_CLARO}; padding:22px 26px; font-family:'Roboto Mono', ui-monospace, Menlo, Consolas, monospace">
${s.linhas.map((l) => `    <div style="font-size:14px; line-height:1.85; color:${l.trimStart().startsWith('#') ? CINZA : GRAFITE}; white-space:pre">${l}</div>`).join('\n')}
  </div>
  <div style="position:absolute; right:72px; top:206px; width:${1136 - (s.larguraCod || 640) - 48}px; display:flex; flex-direction:column; gap:17px">
${lista(s.itens)}
  </div>
${rodape(s.n, s.bloco)}
</div>`, '#fff')

const diagrama = (s) => base(`<div class="sl" style="background:#fff">
${cabecalho(s)}
  <div style="position:absolute; left:72px; top:${s.topSvg || 200}px; right:72px; display:flex; justify-content:center">
${s.svg}
  </div>
  ${s.legenda ? `<div style="position:absolute; left:72px; right:72px; bottom:80px; font-size:16px; color:${CINZA}; font-weight:300; line-height:1.5">${s.legenda}</div>` : ''}
${rodape(s.n, s.bloco)}
</div>`, '#fff')

const linhaTempo = (s) => base(`<div class="sl" style="background:#fff">
${cabecalho(s)}
  <div style="position:absolute; left:72px; right:72px; top:280px">
    <div style="height:3px; background:${CINZA_CLARO}; position:relative">
      <div style="position:absolute; left:0; top:0; height:3px; width:100%; background:linear-gradient(90deg, ${CINZA_CLARO} 0%, ${LARANJA} 100%)"></div>
    </div>
    <div style="display:grid; grid-template-columns: repeat(${s.marcos.length}, minmax(0, 1fr)); gap:8px; margin-top:-8px">
${s.marcos.map((m, i) => `      <div style="display:flex; flex-direction:column; align-items:center; text-align:center">
        <span style="width:13px; height:13px; border-radius:50%; background:${i >= s.marcos.length - 3 ? LARANJA : AZUL}"></span>
        <span style="font-weight:900; font-size:19px; color:${AZUL}; margin-top:14px">${m.ano}</span>
        <span style="font-weight:300; font-size:13px; color:${CINZA}; margin-top:5px; line-height:1.35">${m.txt}</span>
      </div>`).join('\n')}
    </div>
  </div>
  <div style="position:absolute; left:72px; right:72px; bottom:96px; border-left:3px solid ${LARANJA}; padding-left:20px">
    <p class="corpo" style="font-size:19px; color:${GRAFITE}">${s.remate}</p>
  </div>
${rodape(s.n, s.bloco)}
</div>`, '#fff')

const tabela = (s) => base(`<div class="sl" style="background:#fff">
${cabecalho(s)}
  <div style="position:absolute; left:72px; right:72px; top:206px">
    <div style="display:grid; grid-template-columns:${s.cols}; gap:0; border-bottom:2px solid ${AZUL}; padding-bottom:12px">
${s.cabecalhos.map((c) => `      <div class="cartola" style="color:${AZUL}; font-size:11px">${c}</div>`).join('\n')}
    </div>
${s.linhas.map((l) => `    <div style="display:grid; grid-template-columns:${s.cols}; gap:0; padding:15px 0; border-bottom:1px solid #EDEDF2">
${l.map((c, i) => `      <div class="corpo" style="font-size:${i === 0 ? 17 : 16}px; color:${i === 0 ? AZUL : GRAFITE}; font-weight:${i === 0 ? 400 : 300}; padding-right:18px">${c}</div>`).join('\n')}
    </div>`).join('\n')}
  </div>
${rodape(s.n, s.bloco)}
</div>`, '#fff')

const agenda = (s) => base(`<div class="sl" style="background:#fff">
${cabecalho(s)}
  <div style="position:absolute; left:72px; top:210px; right:72px; display:flex; flex-direction:column; gap:0">
${s.itens.map((i, k) => `    <div style="display:grid; grid-template-columns: 52px 1fr 210px; align-items:center; gap:22px; padding:17px 0; border-bottom:1px solid #EDEDF2">
      <span style="font-weight:900; font-size:15px; color:${LARANJA}">${String(k + 1).padStart(2, '0')}</span>
      <span class="corpo" style="font-size:21px; color:${GRAFITE}; font-weight:400">${i.t}</span>
      <span class="corpo" style="font-size:14px; color:${CINZA}; text-align:right">${i.d}</span>
    </div>`).join('\n')}
  </div>
  <div style="position:absolute; left:72px; bottom:80px; font-size:15px; color:${CINZA}; font-weight:300">${s.nota}</div>
${rodape(s.n, s.bloco)}
</div>`, '#fff')

const modelos = { capa, secao, citacao, impacto, conteudo, duasColunas, terminal, codigo, diagrama, linhaTempo, tabela, agenda }

// ---------- svgs ----------

const svgCamadas = `<svg width="880" height="290" viewBox="0 0 880 290" xmlns="http://www.w3.org/2000/svg">
  <g font-family="Roboto, sans-serif">
    <rect x="40" y="216" width="360" height="46" rx="4" fill="#F0F0F5" stroke="#D9D9D9"/>
    <rect x="40" y="164" width="360" height="46" rx="4" fill="#F0F0F5" stroke="#D9D9D9"/>
    <rect x="40" y="112" width="360" height="46" rx="4" fill="#F0F0F5" stroke="#D9D9D9"/>
    <rect x="40" y="54" width="360" height="52" rx="4" fill="#E94D1C" fill-opacity="0.12" stroke="#E94D1C" stroke-dasharray="5 4"/>
    <text x="60" y="245" font-size="14" fill="#1A1A1E" font-weight="300">camada base (debian, alpine)</text>
    <text x="60" y="193" font-size="14" fill="#1A1A1E" font-weight="300">dependências</text>
    <text x="60" y="141" font-size="14" fill="#1A1A1E" font-weight="300">código da aplicação</text>
    <text x="60" y="79" font-size="14" fill="#E94D1C" font-weight="900">camada de escrita</text>
    <text x="60" y="97" font-size="12" fill="#6B6B78" font-weight="300">criada pelo container, morre com ele</text>
    <text x="40" y="34" font-size="11" fill="#6B6B78" font-weight="900" letter-spacing="1.6">SOMENTE LEITURA, ENDEREÇADAS POR DIGEST</text>
    <line x1="440" y1="60" x2="440" y2="258" stroke="#D9D9D9" stroke-width="1"/>
    <text x="480" y="96" font-size="15" fill="#21049A" font-weight="900">copy-up</text>
    <text x="480" y="122" font-size="13.5" fill="#1A1A1E" font-weight="300">alterar um byte de um arquivo grande</text>
    <text x="480" y="142" font-size="13.5" fill="#1A1A1E" font-weight="300">copia o arquivo inteiro para cima</text>
    <text x="480" y="184" font-size="15" fill="#21049A" font-weight="900">whiteout</text>
    <text x="480" y="210" font-size="13.5" fill="#1A1A1E" font-weight="300">apagar cria uma marcação,</text>
    <text x="480" y="230" font-size="13.5" fill="#1A1A1E" font-weight="300">o arquivo continua na camada de baixo</text>
  </g>
</svg>`

const svgPilha = `<svg width="940" height="270" viewBox="0 0 940 270" xmlns="http://www.w3.org/2000/svg">
  <g font-family="Roboto, sans-serif">
    <rect x="10" y="86" width="150" height="60" rx="5" fill="#21049A"/>
    <text x="85" y="112" font-size="15" fill="#fff" font-weight="900" text-anchor="middle">docker CLI</text>
    <text x="85" y="131" font-size="12" fill="#ffffffcc" font-weight="300" text-anchor="middle">cliente</text>
    <rect x="205" y="86" width="150" height="60" rx="5" fill="#21049A"/>
    <text x="280" y="112" font-size="15" fill="#fff" font-weight="900" text-anchor="middle">dockerd</text>
    <text x="280" y="131" font-size="12" fill="#ffffffcc" font-weight="300" text-anchor="middle">daemon, roda como root</text>
    <rect x="400" y="86" width="150" height="60" rx="5" fill="#21049A"/>
    <text x="475" y="112" font-size="15" fill="#fff" font-weight="900" text-anchor="middle">containerd</text>
    <text x="475" y="131" font-size="12" fill="#ffffffcc" font-weight="300" text-anchor="middle">ciclo de vida</text>
    <rect x="595" y="86" width="140" height="60" rx="5" fill="#E94D1C"/>
    <text x="665" y="112" font-size="15" fill="#fff" font-weight="900" text-anchor="middle">shim</text>
    <text x="665" y="131" font-size="12" fill="#ffffffcc" font-weight="300" text-anchor="middle">um por container</text>
    <rect x="780" y="86" width="150" height="60" rx="5" fill="#E94D1C"/>
    <text x="855" y="112" font-size="15" fill="#fff" font-weight="900" text-anchor="middle">runc</text>
    <text x="855" y="131" font-size="12" fill="#ffffffcc" font-weight="300" text-anchor="middle">cria e sai</text>
    <path d="M160 116 L200 116" stroke="#6B6B78" stroke-width="1.5" marker-end="url(#seta)"/>
    <path d="M355 116 L395 116" stroke="#6B6B78" stroke-width="1.5" marker-end="url(#seta)"/>
    <path d="M550 116 L590 116" stroke="#6B6B78" stroke-width="1.5" marker-end="url(#seta)"/>
    <path d="M735 116 L775 116" stroke="#6B6B78" stroke-width="1.5" marker-end="url(#seta)"/>
    <text x="375" y="78" font-size="11" fill="#6B6B78" font-weight="400">gRPC</text>
    <defs><marker id="seta" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6B6B78"/></marker></defs>
    <text x="10" y="196" font-size="13.5" fill="#1A1A1E" font-weight="300">O shim é pai do container e não filho do daemon. Foi esse desenho que fez reiniciar</text>
    <text x="10" y="216" font-size="13.5" fill="#1A1A1E" font-weight="300">o daemon deixar de matar os containers em execução.</text>
    <text x="10" y="248" font-size="13.5" fill="#1A1A1E" font-weight="300">Cada peça tem uma responsabilidade e pode ser trocada. É a substituibilidade da Aula 05, aplicada ao próprio Docker.</text>
  </g>
</svg>`

const svgUml = `<svg width="860" height="280" viewBox="0 0 860 280" xmlns="http://www.w3.org/2000/svg">
  <g font-family="Roboto, sans-serif">
    <rect x="20" y="20" width="400" height="240" rx="4" fill="none" stroke="#21049A" stroke-width="2"/>
    <text x="40" y="48" font-size="12" fill="#21049A" font-weight="900" letter-spacing="1.4">&#171;device&#187;</text>
    <text x="40" y="70" font-size="19" fill="#21049A" font-weight="900">Host de desenvolvimento</text>
    <rect x="52" y="94" width="336" height="146" rx="4" fill="none" stroke="#E94D1C" stroke-width="2"/>
    <text x="72" y="122" font-size="12" fill="#E94D1C" font-weight="900" letter-spacing="1.4">&#171;executionEnvironment&#187;</text>
    <text x="72" y="144" font-size="17" fill="#E94D1C" font-weight="900">Container</text>
    <rect x="84" y="164" width="272" height="58" rx="3" fill="#F0F0F5" stroke="#6B6B78"/>
    <text x="104" y="188" font-size="11" fill="#6B6B78" font-weight="900" letter-spacing="1.2">&#171;artifact&#187;</text>
    <text x="104" y="209" font-size="15" fill="#1A1A1E" font-weight="400">imagem (tag + digest)</text>
    <text x="470" y="60" font-size="17" fill="#21049A" font-weight="900">Ambiente de execução é</text>
    <text x="470" y="84" font-size="17" fill="#21049A" font-weight="900">uma especialização de nó.</text>
    <text x="470" y="124" font-size="14.5" fill="#1A1A1E" font-weight="300">Por isso nunca dizer que container não é nó.</text>
    <text x="470" y="148" font-size="14.5" fill="#1A1A1E" font-weight="300">O modelo fiel é o container aninhado no host,</text>
    <text x="470" y="172" font-size="14.5" fill="#1A1A1E" font-weight="300">com a imagem implantada dentro dele.</text>
    <line x1="470" y1="200" x2="840" y2="200" stroke="#D9D9D9"/>
    <text x="470" y="230" font-size="14.5" fill="#1A1A1E" font-weight="300">Máquina virtual, essa sim, é um nó novo,</text>
    <text x="470" y="254" font-size="14.5" fill="#1A1A1E" font-weight="300">com sistema operacional próprio.</text>
  </g>
</svg>`

const svgTiers = `<svg width="980" height="256" viewBox="0 0 980 256" xmlns="http://www.w3.org/2000/svg">
  <g font-family="Roboto, sans-serif">
    <text x="0" y="16" font-size="12" fill="#6B6B78" font-weight="900" letter-spacing="1.4">AS TRÊS CAMADAS LÓGICAS FICAM SEMPRE NA MESMA IMAGEM. O QUE MUDA É ONDE FRONT E BANCO RODAM.</text>
    <g>
      <rect x="0" y="40" width="286" height="158" rx="5" fill="#21049A" fill-opacity="0.07" stroke="#21049A" stroke-dasharray="4 4"/>
      <rect x="16" y="56" width="254" height="26" rx="3" fill="#fff" stroke="#D9D9D9"/><text x="143" y="74" font-size="13" fill="#1A1A1E" font-weight="300" text-anchor="middle">front</text>
      <rect x="16" y="88" width="254" height="70" rx="3" fill="#fff" stroke="#21049A"/>
      <text x="143" y="106" font-size="12" fill="#21049A" font-weight="400" text-anchor="middle">Apresentação e API</text>
      <text x="143" y="126" font-size="12" fill="#21049A" font-weight="400" text-anchor="middle">Domínio</text>
      <text x="143" y="146" font-size="12" fill="#21049A" font-weight="400" text-anchor="middle">Dados</text>
      <rect x="16" y="164" width="254" height="26" rx="3" fill="#fff" stroke="#D9D9D9"/><text x="143" y="182" font-size="13" fill="#1A1A1E" font-weight="300" text-anchor="middle">banco</text>
      <text x="143" y="224" font-size="15" fill="#21049A" font-weight="900" text-anchor="middle">1 tier</text>
      <text x="143" y="245" font-size="13" fill="#6B6B78" font-weight="300" text-anchor="middle">tudo num processo só</text>
    </g>
    <g transform="translate(347,0)">
      <rect x="0" y="40" width="120" height="158" rx="5" fill="#21049A" fill-opacity="0.07" stroke="#21049A" stroke-dasharray="4 4"/>
      <rect x="14" y="56" width="92" height="26" rx="3" fill="#fff" stroke="#D9D9D9"/><text x="60" y="74" font-size="13" fill="#1A1A1E" font-weight="300" text-anchor="middle">front</text>
      <rect x="140" y="40" width="146" height="158" rx="5" fill="#21049A" fill-opacity="0.07" stroke="#21049A" stroke-dasharray="4 4"/>
      <rect x="154" y="88" width="118" height="70" rx="3" fill="#fff" stroke="#21049A"/>
      <text x="213" y="106" font-size="11" fill="#21049A" font-weight="400" text-anchor="middle">Apresentação e API</text>
      <text x="213" y="126" font-size="11" fill="#21049A" font-weight="400" text-anchor="middle">Domínio</text>
      <text x="213" y="146" font-size="11" fill="#21049A" font-weight="400" text-anchor="middle">Dados</text>
      <rect x="154" y="164" width="118" height="26" rx="3" fill="#fff" stroke="#D9D9D9"/><text x="213" y="182" font-size="12" fill="#1A1A1E" font-weight="300" text-anchor="middle">banco</text>
      <text x="143" y="224" font-size="15" fill="#21049A" font-weight="900" text-anchor="middle">2 tiers</text>
      <text x="143" y="245" font-size="13" fill="#6B6B78" font-weight="300" text-anchor="middle">front separado</text>
    </g>
    <g transform="translate(694,0)">
      <rect x="0" y="40" width="88" height="158" rx="5" fill="#E94D1C" fill-opacity="0.09" stroke="#E94D1C" stroke-dasharray="4 4"/>
      <rect x="12" y="56" width="64" height="26" rx="3" fill="#fff" stroke="#D9D9D9"/><text x="44" y="74" font-size="12" fill="#1A1A1E" font-weight="300" text-anchor="middle">front</text>
      <rect x="100" y="40" width="98" height="158" rx="5" fill="#E94D1C" fill-opacity="0.09" stroke="#E94D1C" stroke-dasharray="4 4"/>
      <rect x="110" y="88" width="78" height="70" rx="3" fill="#fff" stroke="#21049A"/>
      <text x="149" y="106" font-size="10.5" fill="#21049A" font-weight="400" text-anchor="middle">Apres. e API</text>
      <text x="149" y="126" font-size="10.5" fill="#21049A" font-weight="400" text-anchor="middle">Domínio</text>
      <text x="149" y="146" font-size="10.5" fill="#21049A" font-weight="400" text-anchor="middle">Dados</text>
      <rect x="210" y="40" width="88" height="158" rx="5" fill="#E94D1C" fill-opacity="0.09" stroke="#E94D1C" stroke-dasharray="4 4"/>
      <rect x="222" y="56" width="64" height="26" rx="3" fill="#fff" stroke="#D9D9D9"/><text x="254" y="74" font-size="12" fill="#1A1A1E" font-weight="300" text-anchor="middle">banco</text>
      <text x="149" y="224" font-size="15" fill="#E94D1C" font-weight="900" text-anchor="middle">3 tiers</text>
      <text x="149" y="245" font-size="13" fill="#6B6B78" font-weight="300" text-anchor="middle">banco isolado</text>
    </g>
  </g>
</svg>`

const svgVm = `<svg width="1100" height="300" viewBox="0 0 1100 300" xmlns="http://www.w3.org/2000/svg"><g font-family="Roboto, sans-serif" font-size="13"><text x="0" y="14" fill="#21049A" font-weight="900">MÁQUINA VIRTUAL</text><rect x="0" y="206" width="500" height="34" fill="#D9D9D9"/><rect x="0" y="168" width="500" height="36" fill="#F2F2F5" stroke="#D9D9D9"/><rect x="0" y="130" width="500" height="36" fill="#21049A"/><text x="600" y="14" fill="#E94D1C" font-weight="900">CONTAINER</text><rect x="600" y="206" width="500" height="34" fill="#D9D9D9"/><rect x="600" y="168" width="500" height="36" fill="#F2F2F5" stroke="#D9D9D9"/><rect x="600" y="130" width="500" height="36" fill="#21049A"/></g></svg>`

const svgAntes = `<svg width="1100" height="300" viewBox="0 0 1100 300" xmlns="http://www.w3.org/2000/svg"><g font-family="Roboto, sans-serif" font-size="13"><text x="0" y="14" fill="#21049A" font-weight="900">NO COMEÇO DO PROJETO</text><rect x="0" y="40" width="500" height="184" rx="6" fill="#F2F2F5" stroke="#D9D9D9"/><text x="600" y="14" fill="#E94D1C" font-weight="900">AGORA</text><rect x="600" y="40" width="500" height="184" rx="6" fill="#F2F2F5" stroke="#D9D9D9"/></g></svg>`

const svgDois = `<svg width="960" height="270" viewBox="0 0 960 270" xmlns="http://www.w3.org/2000/svg">
  <g font-family="Roboto, sans-serif">
    <text x="0" y="16" font-size="11" fill="#21049A" font-weight="900" letter-spacing="1.4">RASCUNHO #59, DIAGRAMA DE COMPONENTES</text>
    <rect x="0" y="34" width="400" height="196" rx="5" fill="none" stroke="#D9D9D9"/>
    <rect x="28" y="60" width="150" height="48" rx="3" fill="#21049A"/><text x="103" y="90" font-size="13" fill="#fff" font-weight="400" text-anchor="middle">Convite público</text>
    <rect x="222" y="60" width="150" height="48" rx="3" fill="#21049A"/><text x="297" y="90" font-size="13" fill="#fff" font-weight="400" text-anchor="middle">Painel</text>
    <rect x="125" y="130" width="150" height="44" rx="3" fill="#21049A"/><text x="200" y="157" font-size="13" fill="#fff" font-weight="400" text-anchor="middle">API</text>
    <rect x="125" y="188" width="150" height="30" rx="3" fill="#6B6B78"/><text x="200" y="208" font-size="12" fill="#fff" font-weight="400" text-anchor="middle">Dados</text>
    <path d="M103 108 L180 130" stroke="#6B6B78" stroke-width="1.4"/><path d="M297 108 L220 130" stroke="#6B6B78" stroke-width="1.4"/>
    <path d="M200 174 L200 188" stroke="#6B6B78" stroke-width="1.4"/>
    <path d="M420 130 L520 130" stroke="#E94D1C" stroke-width="2" marker-end="url(#s2)"/>
    <text x="428" y="120" font-size="12" fill="#E94D1C" font-weight="900">#72</text>
    <defs><marker id="s2" markerWidth="8" markerHeight="8" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#E94D1C"/></marker></defs>
    <text x="560" y="16" font-size="11" fill="#E94D1C" font-weight="900" letter-spacing="1.4">RASCUNHO #60, DIAGRAMA DE IMPLANTAÇÃO</text>
    <rect x="560" y="34" width="400" height="196" rx="5" fill="none" stroke="#E94D1C" stroke-width="2"/>
    <text x="580" y="58" font-size="11" fill="#E94D1C" font-weight="900">&#171;device&#187; host</text>
    <rect x="580" y="70" width="112" height="52" rx="3" fill="none" stroke="#21049A" stroke-width="1.5"/><text x="636" y="92" font-size="10" fill="#21049A" font-weight="900" text-anchor="middle">&#171;executionEnvironment&#187;</text><text x="636" y="110" font-size="11" fill="#1A1A1E" font-weight="300" text-anchor="middle">front</text>
    <rect x="704" y="70" width="112" height="52" rx="3" fill="none" stroke="#21049A" stroke-width="1.5"/><text x="760" y="92" font-size="10" fill="#21049A" font-weight="900" text-anchor="middle">&#171;executionEnvironment&#187;</text><text x="760" y="110" font-size="11" fill="#1A1A1E" font-weight="300" text-anchor="middle">API</text>
    <rect x="828" y="70" width="112" height="52" rx="3" fill="none" stroke="#21049A" stroke-width="1.5"/><text x="884" y="92" font-size="10" fill="#21049A" font-weight="900" text-anchor="middle">&#171;executionEnvironment&#187;</text><text x="884" y="110" font-size="11" fill="#1A1A1E" font-weight="300" text-anchor="middle">banco</text>
    <path d="M692 96 L704 96" stroke="#E94D1C" stroke-width="1.6"/><path d="M816 96 L828 96" stroke="#E94D1C" stroke-width="1.6"/>
    <rect x="580" y="146" width="360" height="34" rx="3" fill="#E94D1C" fill-opacity="0.1" stroke="#E94D1C" stroke-dasharray="4 3"/>
    <text x="760" y="168" font-size="12" fill="#E94D1C" font-weight="400" text-anchor="middle">rede nomeada, resolução por nome de serviço  ·  #75</text>
    <text x="580" y="206" font-size="12.5" fill="#6B6B78" font-weight="300">#71 nós  ·  #73 imagem por tag e digest  ·  #74, #76 e #77 são passos de processo</text>
  </g>
</svg>`

// ---------- os slides ----------

const S = []
const add = (modelo, dados) => { S.push({ modelo, ...dados, n: S.length + 1 }) }

add('capa', {
  cartola: 'Seminário T1 · Tecnologias emergentes',
  titulo: 'Docker e<br>conteinerização',
  sub: 'Como o empacotamento em containers se aplica ao projeto Invite People',
  equipe: 'Andreas Grings · Gabriel Tomasi<br>Guilherme Toebe · Tiago Passos',
  disciplina: 'Arquitetura de Software<br>Prof. Kleinner Farias',
  bloco: '',
})

add('conteudo', {
  bloco: 'Introdução',
  cartola: '',
  titulo: 'O projeto Invite People',
  itens: [
    'É um app web de convites virtuais, onde o convidado confirma presença e o anfitrião consolida as restrições alimentares.',
    'São duas superfícies sobre o mesmo Model, o convite público, que não pede login, e o painel do anfitrião.',
    'A arquitetura já está registrada na documentação do projeto, com MVC no front-end e três camadas no back-end.',
    'Como esses componentes serão distribuídos e implantados no ambiente de execução.',
  ],
  nota: 'Três camadas lógicas no back-end.<br><br>A decisão é em quantos processos separados elas rodam.',
  notaTitulo: 'PONTO DE PARTIDA',
  right: 330,
})

add('conteudo', {
  bloco: 'Introdução',
  cartola: '',
  titulo: 'Para que o grupo quer usar Docker',
  itens: [
    'Ambiente de desenvolvimento igual para os quatro, com o banco rodando sem ninguém instalar nada na própria máquina.',
    'Um arquivo no repositório que descreve esse ambiente inteiro, versionado junto com o código, e que qualquer um sobe com um comando.',
    'Na entrega e na apresentação do produto, o mesmo ambiente do desenvolvimento.',
  ],
  right: 120,
})

add('secao', { bloco: '01 · Definições e arquitetura', num: '01', cartola: '', titulo: 'Definições e arquitetura', sub: 'Antes de decidir onde cada parte roda, o que o kernel faz quando alguém digita docker run e por que a imagem é em camadas.' })

add('linhaTempo', {
  bloco: '01 · Definições',
  cartola: '',
  titulo: 'Linha do tempo do isolamento de processos',
  marcos: [
    { ano: '1979', txt: 'chroot' },
    { ano: '2002', txt: 'primeiro namespace no kernel' },
    { ano: '2008', txt: 'cgroups no mainline' },
    { ano: '2013', txt: 'Docker' },
    { ano: '2015', txt: 'primeiras especificações comuns de container' },
    { ano: '2017', txt: 'containerd na CNCF' },
    { ano: '2022', txt: 'Kubernetes remove o dockershim' },
  ],
  remate: 'O isolamento de processos existe desde 1979. A padronização da cadeia de execução é de 2015.',
})

add('duasColunas', {
  bloco: '01 · Definições',
  cartola: '',
  titulo: 'Container e imagem',
  tituloA: 'CONTAINER',
  itensA: [
    'Um ou mais processos executados com visão isolada por namespaces, consumo limitado por cgroups e privilégio reduzido por capabilities e seccomp, sobre um sistema de arquivos raiz próprio.',
  ],
  tituloB: 'IMAGEM',
  itensB: [
    'Conjunto ordenado de camadas de sistema de arquivos mais a configuração de execução, identificado por um digest, o hash do próprio conteúdo.',
    'No diagrama de implantação, a imagem é artefato e o container é nó.',
  ],
})

add('terminal', {
  bloco: '01 · Arquitetura',
  cartola: '',
  titulo: 'Container é um processo comum,<br>com a visão restringida',
  linhas: [
    '$ docker run -d --name web nginx',
    '$ ps -eo pid,comm | grep nginx',
    '   4821 nginx',
    '',
    '$ lsns -p 4821',
    '        NS TYPE   NPROCS   PID USER',
    '4026532191 mnt         3  4821 root',
    '4026532192 uts         3  4821 root',
    '4026532193 ipc         3  4821 root',
    '4026532194 pid         3  4821 root',
    '4026532196 net         3  4821 root',
  ],
  captura: 'Namespaces e cgroups são recursos do kernel Linux. No Windows, o Docker Desktop roda o engine sobre o WSL2, uma máquina virtual leve com kernel Linux. O mesmo processo tem PID 1 dentro do container e outro PID no host. Por isso, no diagrama de implantação, o container fica dentro do nó do host.',
})

add('duasColunas', {
  bloco: '01 · Arquitetura',
  cartola: '',
  titulo: 'Namespaces e cgroups<br>fazem coisas diferentes',
  tituloA: 'NAMESPACES',
  itensA: [
    'O namespace mnt dá ao processo uma árvore de montagem própria.',
    'O namespace pid faz o processo enxergar a si mesmo como PID 1.',
    'O namespace net dá uma pilha de rede própria. Dois containers conseguem escutar na mesma porta.',
    'Esse é o mecanismo que permite o front-end, a API e o banco do projeto rodarem no mesmo host sem conflito de porta.',
  ],
  tituloB: 'CGROUPS V2',
  itensB: [
    'Os cgroups contabilizam e limitam o consumo de recursos, sem isolar nada.',
    'Estourar o limite de memória encerra o processo, sem degradação gradual.',
    'O limite de CPU só reduz a velocidade. As requisições mais lentas pioram e a média quase não muda.',
  ],
})

add('diagrama', {
  bloco: '01 · Arquitetura',
  cartola: '',
  titulo: 'As camadas de uma imagem',
  svg: svgCamadas,
  svgNome: 'svgCamadas',
  legenda: 'A imagem é construída a partir de um Dockerfile e distribuída por um registry. Cada instrução gera uma camada. Um Dockerfile que copia um .env e o apaga na instrução seguinte deixa o segredo legível na camada anterior. No nosso caso, a senha do banco e o segredo de sessão do anfitrião.',
  topSvg: 196,
})

add('diagrama', {
  bloco: '01 · Arquitetura',
  cartola: '',
  titulo: 'A pilha de execução do Docker',
  svg: svgPilha,
  svgNome: 'svgPilha',
  topSvg: 200,
})

add('conteudo', {
  bloco: '01 · Arquitetura',
  cartola: '',
  titulo: 'Como o privilégio do container é reduzido',
  itens: [
    'Capabilities dividem os privilégios de root em unidades independentes, removidas uma a uma.',
    'O perfil padrão de seccomp-bpf bloqueia parte das chamadas de sistema disponíveis.',
    'AppArmor ou SELinux aplicam uma restrição adicional pelo módulo de segurança do kernel.',
  ],
  right: 330,
})

add('impacto', {
  bloco: '01 · Arquitetura',
  cartola: '',
  titulo: 'Docker implementa as<br>especificações da OCI',
  logo: 'oci',
  sub: 'Fundada em 2015 sob a Linux Foundation, com a Runtime Spec, a Image Spec e a Distribution Spec. O runc pode ser trocado por crun, gVisor ou Kata, e o engine por Podman. Em 2022 o Kubernetes removeu o adaptador que falava com o Docker Engine e as imagens continuaram funcionando, porque o formato é o da OCI.',
  tam: 46,
})

add('secao', { bloco: '02 · Aplicação no projeto', num: '02', cartola: '', titulo: 'Aplicação no Invite People', sub: 'Mapeamento entre os diagramas de arquitetura e o arquivo de compose.' })

add('diagrama', {
  bloco: '02 · Aplicação no projeto',
  cartola: '',
  titulo: 'Camada lógica e tier',
  svg: svgTiers,
  svgNome: 'svgTiers',
  legenda: 'O projeto lógico é o mesmo nas três opções. Os rascunhos dos próximos slides seguem a de três, e a escolha final é registrada no documento de decisões arquiteturais. No Docker, <em>layer</em> se refere às camadas do sistema de arquivos da imagem. A camada lógica da arquitetura é outro conceito.',
  topSvg: 212,
})

add('diagrama', {
  bloco: '02 · Aplicação no projeto',
  cartola: '',
  titulo: 'Container e imagem<br>no diagrama de implantação',
  svg: svgUml,
  svgNome: 'svgUml',
  topSvg: 210,
})

add('diagrama', {
  bloco: '02 · Aplicação no projeto',
  cartola: '',
  titulo: 'Dos componentes para os nós',
  svg: svgDois,
  svgNome: 'svgDois',
  topSvg: 214,
})

add('codigo', {
  bloco: '02 · Aplicação no projeto',
  cartola: '',
  titulo: 'As interfaces no arquivo de compose',
  linhas: [
    'services:',
    '  front:',
    '    image: nginx:alpine',
    '    ports: ["8080:80"]',
    '  api:',
    '    image: node:22-alpine',
    '    ports: ["3000:3000"]     # interface provida',
    '    environment:',
    '      DATABASE_URL: ...      # interface requerida',
    '    depends_on: [db]',
    '  db:',
    '    image: postgres:16',
  ],
  larguraCod: 620,
  itens: [
    'A porta publicada mais o contrato HTTP é a interface provida da UML.',
    'A variável de conexão mais a dependência declarada é a interface requerida.',
    'A porta da UML corresponde à porta publicada do container.',
    'As imagens do arquivo são exemplo. A stack é decisão do documento de decisões arquiteturais.',
  ],
})

add('duasColunas', {
  bloco: '02 · Aplicação no projeto',
  cartola: '',
  titulo: 'Coesão e acoplamento',
  tituloA: 'COESÃO',
  itensA: [
    'Cada imagem tem uma responsabilidade.',
    'O código do front-end não está na imagem da API, então a API não depende dele.',
    'Os serviços conversam por uma rede interna, onde cada um é achado pelo nome. Só os serviços de fronteira publicam porta para fora. O banco fica sem mapeamento nenhum.',
    'Uma regra só documentada depende de revisão manual. Na topologia ela é imposta pela estrutura.',
  ],
  tituloB: 'ACOPLAMENTO',
  itensB: [
    'Entre as nossas três camadas o acoplamento continua igual, porque elas ficam na mesma imagem do back-end.',
    'Onde há separação, o acoplamento continua, agora com latência, falha parcial e ordem de subida.',
  ],
  corB: LARANJA,
})

add('duasColunas', {
  bloco: '02 · Aplicação no projeto',
  cartola: '',
  titulo: 'Área pública e área com login',
  tituloA: 'CONVITE PÚBLICO, SEM LOGIN',
  itensA: [
    'Qualquer pessoa com o link acessa.',
    'O link é compartilhado no grupo da família e as confirmações de presença chegam em pico.',
    'É por esta área que o container da API ganha réplicas, e para isso ela não pode guardar sessão em memória nem gravar upload em disco local.',
  ],
  tituloB: 'PAINEL DO ANFITRIÃO, COM LOGIN',
  itensB: [
    'Só a anfitriã acessa.',
    'Uma pessoa por evento, carga baixa, sem necessidade de réplica.',
  ],
})

add('secao', { bloco: '03 · Vantagens e desvantagens', num: '03', cartola: '', titulo: 'Vantagens, desvantagens e demonstração', sub: 'A demonstração mostra o ambiente e a topologia. A implementação do produto começa em outubro.' })

add('terminal', {
  bloco: '03 · Demonstração',
  cartola: '',
  titulo: 'O que acontece com o dado',
  linhas: [
    '$ docker compose up -d',
    '$ docker compose ps',
    'NAME    IMAGE             STATUS',
    'front   nginx:alpine      Up',
    'api     node:22-alpine    Up',
    'db      postgres:16       Up (healthy)',
    '',
    '$ docker compose exec db psql -U app -c "create table t()"',
    '$ docker compose down && docker compose up -d',
    '# a tabela continua lá, o volume sobreviveu',
    '',
    '$ docker compose down -v',
    '# agora o dado some junto com o volume',
  ],
  captura: 'A imagem de fundo que a anfitriã envia ao personalizar o convite e o CSV de restrições alimentares que ela exporta não podem ser perdidos quando o container é removido. A decisão de implantação impõe uma restrição às camadas superiores.',
  rodapeAlto: 76,
})

add('conteudo', {
  bloco: '03 · Vantagens e desvantagens',
  cartola: '',
  titulo: 'Limitações e custos',
  itens: [
    'O daemon roda como root. Estar no grupo docker equivale a root no host, sem sudo e sem trilha de auditoria.',
    'A regra de rede que o Docker escreve é aplicada antes das regras do administrador, então um bloqueio de firewall na porta publicada não tem efeito.',
    'Container com estado continua exigindo backup e upgrade de versão maior do banco.',
    'O Docker Desktop é pago para empresa acima de certo porte.',
  ],
  nota: 'Dos quatro, o do daemon como root é o que atinge o projeto hoje, porque os quatro integrantes rodam na própria máquina.',
  notaTitulo: 'NO NOSSO CASO',
  right: 320,
  top: 202,
})

add('diagrama', {
  bloco: '03 · Vantagens e desvantagens',
  cartola: '',
  titulo: 'Container e máquina virtual',
  svg: svgVm,
  svgNome: 'svgVm',
  legenda: 'A CVE-2019-5736 confirmou o risco: o processo de dentro conseguia sobrescrever o binário do runtime. Por isso o documento de decisões arquiteturais precisa registrar que container não dá o mesmo isolamento de uma máquina virtual.',
})

add('tabela', {
  bloco: '03 · Vantagens e desvantagens',
  cartola: '',
  titulo: 'Alternativas consideradas',
  cols: '1.1fr 1.4fr 1.4fr',
  destacar: 3,
  cabecalhos: ['OPÇÃO', 'A FAVOR', 'CONTRA'],
  linhas: [
    ['README nativo', 'Custo zero para começar', 'Quebra na primeira divergência de versão'],
    ['VM compartilhada', 'Isolamento imposto em hardware', 'Pesada e difícil de versionar'],
    ['Podman', 'Mesmo modelo, sem daemon root', 'Menos material e menos gente do time conhece'],
    ['Compose', 'Ambiente igual para os quatro integrantes', 'Acrescenta uma camada de build e de orquestração'],
  ],
})

add('duasColunas', {
  bloco: '03 · Vantagens e desvantagens',
  cartola: '',
  titulo: 'Quando não compensa',
  tituloA: 'OS QUATRO CRITÉRIOS',
  itensA: [
    'Um monolito num servidor só, que nunca vai escalar.',
    'Um time sem integração contínua, para quem é só um passo de build a mais.',
    'Uma aplicação sensível a latência de cauda.',
    'Um sistema dominado por estado.',
  ],
  tituloB: 'ONDE NÓS ESTAMOS',
  itensB: [
    'Dois dos quatro se aplicam a nós, porque não temos integração contínua definida nem hospedagem decidida.',
    'O motivo para adotar é o ambiente igual para os quatro antes da primeira linha de código.',
  ],
  corB: LARANJA,
  tam: 34,
})

add('duasColunas', {
  bloco: '03 · Vantagens e desvantagens',
  cartola: '',
  titulo: 'Vantagens e custos',
  tituloA: 'VANTAGENS',
  itensA: [
    'Uma responsabilidade por imagem, com a fronteira declarada.',
    'O ambiente fica descrito num arquivo legível, versionado junto com o código.',
    'Trocar runtime ou banco é editar uma linha do arquivo.',
    'A mesma imagem roda no notebook, no pipeline e na apresentação do produto.',
    'Dá para replicar só a API, se o caminho do convite público for mesmo sem estado.',
  ],
  tituloB: 'CUSTOS',
  itensB: [
    'Uma superfície de ataque nova, na imagem base e no privilégio de execução.',
    'I/O mais lento, principalmente nas máquinas Windows.',
  ],
  corB: LARANJA,
  tam: 34,
})

add('diagrama', {
  bloco: 'Considerações finais',
  cartola: '',
  titulo: 'O que mudou no ambiente do time',
  svg: svgAntes,
  svgNome: 'svgAntes',
})

add('conteudo', {
  bloco: 'Referências',
  cartola: '',
  titulo: 'Referências',
  itens: [
    'Open Container Initiative. Runtime Spec, Image Spec e Distribution Spec. Linux Foundation, fundada em 2015.',
    'WIGGINS, A. The Twelve-Factor App, 2011.',
    'FELTER, W. et al. An updated performance comparison of virtual machines and Linux containers. IBM Research Report, 2015.',
    'MERKEL, D. Docker: lightweight Linux containers for consistent development and deployment. Linux Journal, 2014.',
    'NIST SP 800-190. Application Container Security Guide.',
    'SOMMERVILLE, I. Engenharia de Software. 6. ed. Addison Wesley, 2004.',
    'FOWLER, M. Patterns of Enterprise Application Architecture. Addison Wesley, 2002.',
    'FARIAS, K. Aula 03, Arquiteturas em Camadas. Aula 05, Arquiteturas Baseadas em Componentes.',
  ],
  right: 120,
  top: 200,
})

// ---------- escrita ----------

const paginas = [
  { id: 'p-a', nome: 'Capa e Bloco A', ate: 3 },
  { id: 'p-b', nome: 'Bloco B', ate: 12 },
  { id: 'p-c', nome: 'Bloco C', ate: 19 },
  { id: 'p-d', nome: 'Bloco D', ate: 27 },
  { id: 'p-f', nome: 'Fecho', ate: 99 },
]
const paginaDe = (n) => paginas.find((p) => n <= p.ate).id

const artboards = []
S.forEach((s, i) => {
  const nome = i === 0 ? 'Main' : 'S' + String(i + 1).padStart(2, '0')
  writeFileSync(join(OUT, nome + '.dc.html'), modelos[s.modelo](s), 'utf8')
  const pag = paginaDe(s.n)
  const naPag = S.filter((o) => paginaDe(o.n) === pag).indexOf(s)
  artboards.push({
    file: nome + '.dc.html',
    title: String(s.n).padStart(2, '0') + '. ' + (s.tituloCanvas || s.titulo || s.cartola || 'Capa').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().replace(/^(.{0,44}\S)(\s.*)?$/s, '$1'),
    x: (naPag % 4) * 1380,
    y: Math.floor(naPag / 4) * 880,
    w: 1280,
    h: 720,
    page: pag,
    print: 'fixed',
  })
})

writeFileSync(join(OUT, 'canvas.json'), JSON.stringify({
  artboards,
  pages: paginas.map((p) => ({ id: p.id, name: p.nome })),
  annotations: [
    { id: 'nota-tempo', x: 0, y: -150, w: 560, text: 'Bloco A 4 min · Bloco B 6 min · Bloco C 6 min · Bloco D 7 min\nMais 1 min para as três trocas de apresentador. Total 24, dentro da faixa de 20 a 25.', page: 'p-a' },
    { id: 'nota-b', x: 0, y: -130, w: 520, text: 'Este bloco carrega os 30% de domínio técnico. Os dois diagramas não entram na ordem de corte.', page: 'p-b' },
    { id: 'nota-c', x: 0, y: -130, w: 520, text: 'Este bloco carrega os 25% de relação com o projeto, o critério que mais separa uma apresentação genérica de uma boa.', page: 'p-c' },
    { id: 'nota-d', x: 0, y: -130, w: 520, text: 'A demonstração vale 10% e não tem substituto. Imagens baixadas na véspera e nenhuma instrução build no compose.', page: 'p-d' },
  ],
  launch: { view: 'canvas', page: 'p-a' },
}, null, 2), 'utf8')

writeFileSync(join(OUT, 'slides.json'), JSON.stringify(S, null, 1), 'utf8')
console.log('gerados', S.length, 'artboards em', OUT)
