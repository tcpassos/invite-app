# Monta o .pptx do Pitch Final a partir do template institucional da Unisinos.
# Adaptado do montar-pptx.py do T3: mesmos modelos, mais os do Pitch, com ícones em círculo.
# Uso: python montar-pptx.py <template.pptx> <slides.json> <saida.pptx> <pasta-logos> <pasta-capturas>
import json, io, re, sys, copy
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

TEMPLATE, DADOS, SAIDA = sys.argv[1], sys.argv[2], sys.argv[3]

AZUL = RGBColor(0x21, 0x04, 0x9A)
LARANJA = RGBColor(0xE9, 0x4D, 0x1C)
GRAFITE = RGBColor(0x1A, 0x1A, 0x1E)
CINZA = RGBColor(0x6B, 0x6B, 0x78)
CINZA_CLARO = RGBColor(0xD9, 0xD9, 0xD9)
BRANCO = RGBColor(0xFF, 0xFF, 0xFF)
QUASE = RGBColor(0xF2, 0xF2, 0xF5)
ESCURO = RGBColor(0x12, 0x12, 0x1A)
FONTE = "Roboto"
MONO = "Roboto Mono"

def px(v):  # 96 dpi
    return Emu(int(round(v * 9525)))

def pt(v):  # px -> pontos
    return Pt(round(v * 0.75, 1))

# ---------- texto ----------

TAGS = re.compile(r'(<strong[^>]*>.*?</strong>|<em[^>]*>.*?</em>)', re.S)

def pedacos(html):
    """Quebra o html simples dos itens em (texto, negrito, italico)."""
    out = []
    for parte in TAGS.split(html or ''):
        if not parte:
            continue
        if parte.startswith('<strong'):
            out.append((re.sub(r'<[^>]+>', '', parte), True, False))
        elif parte.startswith('<em'):
            out.append((re.sub(r'<[^>]+>', '', parte), False, True))
        else:
            out.append((re.sub(r'<[^>]+>', '', parte), False, False))
    return [(t, b, i) for t, b, i in out if t]

def caixa(sl, x, y, w, h, *, alinhar=PP_ALIGN.LEFT, ancora=MSO_ANCHOR.TOP):
    tb = sl.shapes.add_textbox(px(x), px(y), px(w), px(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = ancora
    tf.paragraphs[0].alignment = alinhar
    return tb, tf

def escrever(tf, html, *, tam, cor, peso=300, entre=1.28, espaco=0, fonte=FONTE,
             maiusc=False, espacar=None, primeiro=True):
    """Escreve html simples num text_frame, com <br> virando paragrafo."""
    linhas = re.split(r'<br\s*/?>', html or '')
    for k, linha in enumerate(linhas):
        p = tf.paragraphs[0] if (primeiro and k == 0) else tf.add_paragraph()
        # a linha nova herda o alinhamento da primeira, senao o texto quebrado com <br> volta para a esquerda
        p.alignment = tf.paragraphs[0].alignment
        p.line_spacing = entre
        if espaco:
            p.space_after = pt(espaco)
        for texto, b, i in pedacos(linha) or [('', False, False)]:
            r = p.add_run()
            r.text = texto.upper() if maiusc else texto
            f = r.font
            f.name = fonte
            f.size = pt(tam)
            f.color.rgb = cor
            f.bold = bool(b) or peso >= 700
            f.italic = bool(i)
            if espacar:
                f._rPr.set('spc', str(int(espacar * 100)))
    return tf

def retangulo(sl, x, y, w, h, *, preencher=None, borda=None, largura=1, raio=None, tracejado=False):
    forma = MSO_SHAPE.ROUNDED_RECTANGLE if raio else MSO_SHAPE.RECTANGLE
    s = sl.shapes.add_shape(forma, px(x), px(y), px(w), px(h))
    if raio:
        s.adjustments[0] = min(0.5, raio / min(w, h))
    if preencher is None:
        s.fill.background()
    else:
        s.fill.solid(); s.fill.fore_color.rgb = preencher
    if borda is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = borda; s.line.width = Pt(largura)
        if tracejado:
            from pptx.enum.dml import MSO_LINE_DASH_STYLE
            s.line.dash_style = MSO_LINE_DASH_STYLE.DASH
    s.shadow.inherit = False
    s.text_frame.word_wrap = True
    s.text_frame.margin_left = s.text_frame.margin_right = 0
    s.text_frame.margin_top = s.text_frame.margin_bottom = 0
    return s

def linha(sl, x1, y1, x2, y2, cor=AZUL, largura=2):
    from pptx.enum.shapes import MSO_CONNECTOR
    c = sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, px(x1), px(y1), px(x2), px(y2))
    c.line.color.rgb = cor; c.line.width = Pt(largura)
    return c

def seta(sl, x1, y1, x2, y2, cor=LARANJA, largura=2):
    """Linha com ponta de flecha no destino."""
    from pptx.oxml.ns import qn
    from lxml import etree
    c = linha(sl, x1, y1, x2, y2, cor, largura)
    ln = c.line._get_or_add_ln()
    fim = etree.SubElement(ln, qn('a:tailEnd'))
    fim.set('type', 'triangle'); fim.set('w', 'med'); fim.set('len', 'med')
    return c

def rotulo(sl, x, y, w, texto, *, tam=12, cor=CINZA, peso=400, alinhar=PP_ALIGN.LEFT, fonte=FONTE, maiusc=False, espacar=None):
    tb, tf = caixa(sl, x, y, w, tam * 1.6, alinhar=alinhar)
    escrever(tf, texto, tam=tam, cor=cor, peso=peso, entre=1.2, fonte=fonte, maiusc=maiusc, espacar=espacar)
    return tb

# ---------- marca e simbologia ----------

LOGOS = sys.argv[4] if len(sys.argv) > 4 else '.'
CAPTURAS = sys.argv[5] if len(sys.argv) > 5 else 'capturas'

def captura(sl, nome, x, y, larg=None, alt=None, borda=CINZA_CLARO):
    """Captura de tela com borda fina. Recebe largura ou altura e calcula a outra pela proporcao."""
    import os
    from PIL import Image as _Im
    cam = os.path.join(CAPTURAS, nome)
    with _Im.open(cam) as im:
        w, h = im.size
    if larg is None:
        larg = alt * w / h
    if alt is None:
        alt = larg * h / w
    pic = sl.shapes.add_picture(cam, px(x), px(y), px(larg), px(alt))
    if borda is None:
        pic.line.fill.background()
    else:
        pic.line.color.rgb = borda
        pic.line.width = Pt(0.75)
    return larg, alt

def proporcao(nome):
    import os
    from PIL import Image as _Im
    with _Im.open(os.path.join(CAPTURAS, nome)) as im:
        return im.size[0] / im.size[1]

def fundo_imagem(sl, nome):
    """Fundo de pagina inteira do template institucional, no lugar do azul chapado."""
    import os
    sl.shapes.add_picture(os.path.join(LOGOS, nome), 0, 0, px(1280), px(720))

def imagem(sl, nome, x, y, larg):
    """Logo de projeto (Docker, Kubernetes, OCI), altura calculada pela proporcao do arquivo."""
    import os
    from PIL import Image as _Im
    cam = os.path.join(LOGOS, nome)
    with _Im.open(cam) as im:
        w, h = im.size
    alt = larg * h / w
    sl.shapes.add_picture(cam, px(x), px(y), px(larg), px(alt))
    return alt

def logo(sl, claro=False, x=1128, y=48, tam=36):
    """Simbolo institucional, no mesmo canto em todos os slides."""
    import os
    arq = os.path.join(LOGOS, 'u-branco.png' if claro else 'u-azul.png')
    sl.shapes.add_picture(arq, px(x), px(y), px(tam), px(tam))

def logo_completo(sl, x, y, larg=214):
    import os
    alt = larg * 692 / 2012
    sl.shapes.add_picture(os.path.join(LOGOS, 'lockup-branco.png'), px(x), px(y), px(larg), px(alt))

def _forma(sl, tipo, x, y, w, h, *, preencher=None, borda=None, largura=2):
    s = sl.shapes.add_shape(tipo, px(x), px(y), px(w), px(h))
    if preencher is None:
        s.fill.background()
    else:
        s.fill.solid(); s.fill.fore_color.rgb = preencher
    if borda is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = borda; s.line.width = Pt(largura)
    s.shadow.inherit = False
    return s

def simbolo_bloco(sl, qual, x, y, cor=LARANJA):
    """Marca grande do bloco, desenhada com formas, em vez de ícone genérico."""
    if qual == 'camadas':          # empilhamento
        tons = [RGBColor(0x8A, 0x3A, 0x24), RGBColor(0xC0, 0x44, 0x20), cor]
        for i in range(3):
            _forma(sl, MSO_SHAPE.ROUNDED_RECTANGLE, x, y + 76 - i * 32, 176, 26, preencher=tons[i])
    elif qual == 'mapeamento':     # componente vira nó
        _forma(sl, MSO_SHAPE.ROUNDED_RECTANGLE, x, y + 34, 62, 62, preencher=RGBColor(0x8A, 0x3A, 0x24))
        _forma(sl, MSO_SHAPE.RIGHT_ARROW, x + 74, y + 52, 44, 26, preencher=cor)
        _forma(sl, MSO_SHAPE.ROUNDED_RECTANGLE, x + 130, y + 34, 62, 62, preencher=cor)
    elif qual == 'balanca':        # ganho contra custo
        _forma(sl, MSO_SHAPE.ROUNDED_RECTANGLE, x, y + 16, 74, 80, preencher=cor)
        _forma(sl, MSO_SHAPE.ROUNDED_RECTANGLE, x + 92, y + 52, 74, 44, preencher=RGBColor(0x8A, 0x3A, 0x24))
        _forma(sl, MSO_SHAPE.RECTANGLE, x, y + 104, 166, 4, preencher=cor)

ICONES = {
    'ATENÇÃO': 'alerta', 'CUIDADO': 'alerta', 'REGRA': 'alerta',
    'FONTE': 'documento', 'EM ABERTO': 'aberto',
    'ONDE ESTAMOS HOJE': 'aberto', 'PRÓXIMO PASSO': 'seta',
    'PARA LEVAR PARA A P1': 'documento',
}

def icone_nota(sl, x, y, titulo, cor=LARANJA):
    tipo = ICONES.get((titulo or '').upper(), 'alerta')
    if tipo == 'alerta':
        _forma(sl, MSO_SHAPE.ISOSCELES_TRIANGLE, x, y, 16, 14, borda=cor, largura=1.5)
        _forma(sl, MSO_SHAPE.RECTANGLE, x + 7.2, y + 6, 1.6, 4, preencher=cor)
    elif tipo == 'documento':
        _forma(sl, MSO_SHAPE.FLOWCHART_DOCUMENT, x, y, 15, 14, borda=cor, largura=1.5)
    elif tipo == 'aberto':
        _forma(sl, MSO_SHAPE.DONUT, x, y, 15, 15, preencher=cor)
    else:
        _forma(sl, MSO_SHAPE.CHEVRON, x, y + 1, 15, 13, preencher=cor)

# ---------- pecas comuns ----------

def fundo(sl, cor):
    sl.background.fill.solid()
    sl.background.fill.fore_color.rgb = cor

def cartola(sl, texto, cor=LARANJA, y=66):
    rotulo(sl, 72, y, 1136, texto, tam=13, cor=cor, peso=900, maiusc=True, espacar=1.6)

def titulo_claro(sl, texto, tam=40, y=88, w=1010, cor=AZUL):
    tb, tf = caixa(sl, 72, y, w, 160)
    escrever(tf, texto, tam=tam, cor=cor, peso=900, entre=1.04)

def rodape(sl, n, bloco, claro=False):
    rotulo(sl, 72, 664, 700, bloco, tam=12, cor=RGBColor(0xFF, 0xFF, 0xFF) if claro else CINZA)
    if claro:
        rotulo(sl, 1100, 664, 108, f'{n:02d}', tam=12, cor=BRANCO, peso=900, alinhar=PP_ALIGN.RIGHT)
    else:
        rotulo(sl, 1100, 664, 108, f'{n:02d}', tam=12, cor=AZUL, peso=900, alinhar=PP_ALIGN.RIGHT)

def itens(sl, lista, x, y, w, *, tam=19, gap=13, cor=GRAFITE):
    """Lista com o prefixo // do template, cada item numa caixa propria."""
    cursor = y
    for it in lista:
        retangulo(sl, x + 2, cursor + tam * 0.52, 6, 6, preencher=LARANJA)
        tb, tf = caixa(sl, x + 30, cursor, w - 30, 10)
        escrever(tf, it, tam=tam, cor=cor, peso=300, entre=1.3)
        alt = altura_estimada(it, tam, w - 30)
        cursor += alt + gap
    return cursor

def altura_lista(lista, tam, largura, gap):
    total = sum(altura_estimada(i, tam, largura - 30) + gap for i in lista)
    return max(0, total - gap)

def ajustar(lista, largura, alvo, tam=20, gap=26, minimo=15, maximo=None):
    """Ajusta o corpo a altura disponivel, encolhendo ou crescendo dentro da faixa."""
    while tam > minimo and altura_lista(lista, tam, largura, gap) > alvo:
        tam -= 1
        gap = max(14, gap - 2)
    while maximo and tam < maximo and altura_lista(lista, tam + 1, largura, gap + 2) <= alvo:
        tam += 1
        gap += 2
    return tam, gap, altura_lista(lista, tam, largura, gap)

def centrar(alt, topo=196, base=600):
    """Devolve o y que centraliza um bloco de altura alt na area util."""
    return topo if alt >= base - topo else topo + (base - topo - alt) / 2

_MEDIDOR = None

def _fonte_medicao():
    import os
    # o texto de peso 300 sai na Roboto Regular, entao e ela que mede; Arial e mais larga e sobra margem
    candidatas = [os.path.expanduser('~/.fonts/Roboto-Regular.ttf'), 'C:/Windows/Fonts/arial.ttf',
                  '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
                  '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']
    return next((c for c in candidatas if os.path.exists(c)), None)

FONTE_MEDICAO = _fonte_medicao()

def _medidor(tam):
    """Fonte de medicao. Arial no lugar da Roboto, que e mais estreita, entao sobra margem."""
    global _MEDIDOR
    if _MEDIDOR is None:
        try:
            from PIL import ImageFont, ImageDraw, Image
            if FONTE_MEDICAO is None:
                raise OSError('sem fonte de medicao')
            _MEDIDOR = (ImageDraw.Draw(Image.new('RGB', (8, 8))), ImageFont, {})
        except Exception:
            _MEDIDOR = False
    if _MEDIDOR is False:
        return None
    desenho, ImageFont, cache = _MEDIDOR
    chave = int(round(tam))
    if chave not in cache:
        cache[chave] = ImageFont.truetype(FONTE_MEDICAO, max(6, chave))
    return desenho, cache[chave]

def altura_estimada(html, tam, largura):
    texto = re.sub(r'<[^>]+>', ' ', html or '').strip()
    m = _medidor(tam)
    if m:
        desenho, fonte_med = m
        linhas, atual = 1, ''
        for pal in texto.split():
            teste = (atual + ' ' + pal).strip()
            if desenho.textlength(teste, font=fonte_med) > largura * 0.96 and atual:
                linhas += 1
                atual = pal
            else:
                atual = teste
    else:
        por_linha = max(1, int(largura / (tam * 0.58)))
        linhas = max(1, -(-len(texto) // por_linha))
    return linhas * tam * 1.32

def nota_lateral(sl, x, y, w, titulo, texto):
    icone_nota(sl, x, y, titulo)
    rotulo(sl, x + 26, y + 1, w - 26, titulo, tam=12, cor=LARANJA, peso=900, maiusc=True, espacar=1.2)
    alt = max(40, altura_estimada(texto, 16, w - 22) + texto.count('<br>') * 12)
    retangulo(sl, x, y + 30, 4, alt, preencher=LARANJA)
    tb, tf = caixa(sl, x + 22, y + 30, w - 22, alt + 60)
    escrever(tf, texto, tam=16, cor=RGBColor(0x3A, 0x3A, 0x44), peso=300, entre=1.4, espaco=8)

# ---------- diagramas nativos ----------

LILAS = RGBColor(0xEE, 0xEB, 0xF7)
PESSEGO = RGBColor(0xFD, 0xEA, 0xE3)

def cotovelo(sl, pontos, cor=LARANJA, largura=2):
    """Linha em segmentos retos, com a ponta de flecha no ultimo."""
    for (x1, y1), (x2, y2) in zip(pontos[:-2], pontos[1:-1]):
        linha(sl, x1, y1, x2, y2, cor, largura)
    (x1, y1), (x2, y2) = pontos[-2], pontos[-1]
    seta(sl, x1, y1, x2, y2, cor, largura)

def dg_arquitetura(sl, x, y):
    """Os tres tiers do compose, as camadas da API, o MVC do front e o pacote de tipos compartilhado."""
    ESC = RGBColor(0x3A, 0x3A, 0x44)
    # navegador
    nx, nw = 72, 132
    retangulo(sl, nx, y + 92, nw, 100, preencher=AZUL, raio=5)
    rotulo(sl, nx, y + 112, nw, 'Navegador', tam=17, cor=BRANCO, peso=900, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, nx + 6, y + 140, nw - 12, 'anfitrião e<br>convidado', tam=14, cor=BRANCO, peso=300, alinhar=PP_ALIGN.CENTER)
    # tier front
    fx, fw = 300, 234
    retangulo(sl, fx, y, fw, 290, preencher=LILAS, borda=AZUL, raio=6, tracejado=True)
    rotulo(sl, fx + 16, y + 12, fw - 32, 'Front em Next.js', tam=17, cor=AZUL, peso=900)
    rotulo(sl, fx + 16, y + 38, fw - 32, 'container front, porta 3000', tam=14, cor=CINZA, peso=400)
    for k, nome in enumerate(['Rotas de tela', 'View', 'Controller']):
        retangulo(sl, fx + 18, y + 72 + k * 62, fw - 36, 48, preencher=BRANCO, borda=AZUL, raio=3)
        rotulo(sl, fx + 18, y + 84 + k * 62, fw - 36, nome, tam=16, cor=AZUL, peso=400, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, fx, y + 266, fw, 'MVC', tam=13, cor=AZUL, peso=900, alinhar=PP_ALIGN.CENTER, espacar=1.2)
    # tier api
    ax, aw = 652, 250
    retangulo(sl, ax, y, aw, 290, preencher=PESSEGO, borda=LARANJA, raio=6, tracejado=True)
    rotulo(sl, ax + 16, y + 12, aw - 32, 'API em NestJS', tam=17, cor=LARANJA, peso=900)
    rotulo(sl, ax + 16, y + 38, aw - 32, 'container api, porta 3001 no host', tam=14, cor=CINZA, peso=400)
    for k, nome in enumerate(['Apresentação', 'Domínio', 'Dados']):
        retangulo(sl, ax + 18, y + 72 + k * 62, aw - 36, 48, preencher=BRANCO, borda=LARANJA, raio=3)
        rotulo(sl, ax + 18, y + 84 + k * 62, aw - 36, nome, tam=16, cor=GRAFITE, peso=400, alinhar=PP_ALIGN.CENTER)
        if k:
            seta(sl, ax + aw / 2, y + 72 + k * 62 - 14, ax + aw / 2, y + 72 + k * 62, LARANJA, 1.5)
    rotulo(sl, ax, y + 266, aw, 'TRÊS CAMADAS', tam=13, cor=LARANJA, peso=900, alinhar=PP_ALIGN.CENTER, espacar=1.2)
    # tier banco
    bx, bw = 1020, 188
    retangulo(sl, bx, y + 82, bw, 124, preencher=QUASE, borda=CINZA, raio=6, tracejado=True)
    rotulo(sl, bx, y + 100, bw, 'PostgreSQL', tam=17, cor=GRAFITE, peso=900, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, bx + 8, y + 130, bw - 16, 'container db,<br>sem porta publicada', tam=14, cor=CINZA, peso=400, alinhar=PP_ALIGN.CENTER)
    # ligacoes, com o rotulo centralizado no vao, acima da seta
    def ligacao(x1, x2, ys, texto, cor):
        seta(sl, x1 + 4, ys, x2 - 4, ys, cor, 2)
        rotulo(sl, x1, ys - 46, x2 - x1, texto, tam=14, cor=cor, peso=400, alinhar=PP_ALIGN.CENTER)
    ligacao(nx + nw, fx, y + 142, 'página do<br>convite', AZUL)
    ligacao(fx + fw, ax, y + 142, 'leitura no<br>servidor', AZUL)
    ligacao(ax + aw, bx, y + 142, 'SQL', CINZA)
    cotovelo(sl, [(nx + nw / 2, y + 192), (nx + nw / 2, y + 318), (ax + aw / 2, y + 318), (ax + aw / 2, y + 290)], LARANJA, 2)
    rotulo(sl, nx + nw / 2 + 12, y + 324, 520, 'painel do anfitrião e envio das respostas, direto na API', tam=15, cor=LARANJA, peso=400)
    # pacote de tipos
    retangulo(sl, fx, y + 360, ax + aw - fx, 46, preencher=QUASE, borda=CINZA_CLARO, raio=4)
    tb, tf = caixa(sl, fx + 16, y + 372, ax + aw - fx - 32, 30)
    escrever(tf, '<strong>Pacote de tipos compartilhado (contract):</strong> pedidos e respostas usados pelo front e pela API', tam=14, cor=ESC, peso=300)

def dg_raias(sl, x, y):
    """O envio de uma resposta passando pelas tres camadas, uma raia por camada."""
    ESC = RGBColor(0x3A, 0x3A, 0x44)
    raias = [('Apresentação', AZUL), ('Domínio', LARANJA), ('Dados', CINZA)]
    alt_raia, lrot, topo = 112, 136, y
    for k, (nome, cor) in enumerate(raias):
        ry = topo + k * (alt_raia + 8)
        retangulo(sl, 72, ry, 1136, alt_raia, preencher=QUASE, raio=4)
        retangulo(sl, 72, ry, lrot, alt_raia, preencher=cor, raio=4)
        rotulo(sl, 72, ry + alt_raia / 2 - 12, lrot, nome, tam=16, cor=BRANCO, peso=900, alinhar=PP_ALIGN.CENTER)
    passos = [
        (0, 'Confere o formato e o limite de tráfego'),
        (1, 'Aplica as regras da resposta'),
        (1, 'Calcula as vagas pedidas'),
        (2, 'Trava o convite e soma as vagas ocupadas'),
        (2, 'Confere o teto e grava, ou devolve a recusa'),
        (1, 'Se não cabe, dá nome à recusa: convite lotado'),
        (0, 'Responde com o link pessoal ou com o erro'),
    ]
    x0, gap = 72 + lrot + 14, 12
    larg = (1208 - 8 - x0 - gap * (len(passos) - 1)) / len(passos)
    caixas = []
    for i, (r, txt) in enumerate(passos):
        bx = x0 + i * (larg + gap)
        by = topo + r * (alt_raia + 8) + 10
        retangulo(sl, bx, by, larg, alt_raia - 20, preencher=BRANCO, borda=raias[r][1], largura=1.5, raio=4)
        tb, tf = caixa(sl, bx + 9, by + 6, larg - 18, alt_raia - 32, ancora=MSO_ANCHOR.MIDDLE)
        escrever(tf, txt, tam=15, cor=ESC, peso=400, entre=1.15)
        caixas.append((bx, by, larg, alt_raia - 20))
    for (ax_, ay, aw, ah), (bx_, by_, bw, bh) in zip(caixas, caixas[1:]):
        if ay == by_:
            seta(sl, ax_ + aw, ay + ah / 2, bx_, by_ + bh / 2, CINZA, 1.5)
        else:
            cotovelo(sl, [(ax_ + aw, ay + ah / 2), (ax_ + aw + gap / 2, ay + ah / 2),
                          (ax_ + aw + gap / 2, by_ + bh / 2), (bx_, by_ + bh / 2)], CINZA, 1.5)
    # Quando cabe, a gravação volta direto para a Apresentação, sem passar pela recusa.
    (gx, gy, gw, gh), (rx, ry, rw, rh) = caixas[4], caixas[6]
    meio, alvo = gx + gw / 2, ry + rh * 0.28
    cotovelo(sl, [(meio, gy), (meio, alvo), (rx, alvo)], CINZA, 1.5)
    rotulo(sl, meio + 6, topo + alt_raia + 8 + alt_raia / 2 - 11, 90, 'se cabe', tam=13, cor=ESC)

DIAGRAMAS = {'svgArquitetura': dg_arquitetura, 'svgRaias': dg_raias}

# ---------- modelos ----------

def m_capa(sl, s):
    fundo_imagem(sl, 'fundo-capa.jpg')
    logo_completo(sl, 72, 58, 214)
    rotulo(sl, 72, 200, 700, s['cartola'], tam=13, cor=LARANJA, peso=900, maiusc=True, espacar=1.6)
    tb, tf = caixa(sl, 72, 224, 780, 200)
    escrever(tf, s['titulo'], tam=s.get('tam', 70), cor=BRANCO, peso=900, entre=1.02)
    retangulo(sl, 72, 404, 64, 5, preencher=LARANJA, raio=2)
    tb2, tf2 = caixa(sl, 72, 432, 800, 90)
    escrever(tf2, s['sub'], tam=21, cor=RGBColor(0xD6, 0xCF, 0xF0), peso=300, entre=1.45)
    creditos = [('EQUIPE', s['equipe']), ('DISCIPLINA', s['disciplina'])]
    if s.get('data'):
        creditos.append(('DATA', s['data']))
    if s.get('captura'):
        captura(sl, s['captura'], 930, 120, alt=480, borda=RGBColor(0x6E, 0x59, 0xD2))
    for i, (rot, val) in enumerate(creditos):
        cx = 72 + i * 280
        rotulo(sl, cx, 566, 280, rot, tam=10, cor=RGBColor(0x9C, 0x90, 0xD4), espacar=1.4)
        tb3, tf3 = caixa(sl, cx, 586, 280, 70)
        escrever(tf3, val, tam=13, cor=RGBColor(0xE0, 0xDB, 0xF2), peso=400, entre=1.4)

SIMBOLOS = {'01': 'camadas', '02': 'mapeamento', '03': 'balanca'}

def m_secao(sl, s):
    fundo_imagem(sl, 'fundo-secao.jpg')
    retangulo(sl, 0, 0, 10, 720, preencher=LARANJA)
    logo(sl, claro=True)
    simbolo_bloco(sl, SIMBOLOS.get(s['num'], 'camadas'), 940, 286)
    rotulo(sl, 92, 128, 400, s['num'], tam=130, cor=RGBColor(0x6E, 0x59, 0xD2), peso=900)
    if s.get('cartola'):
        retangulo(sl, 96, 304, 4, 18, preencher=LARANJA)
        rotulo(sl, 112, 300, 700, s['cartola'], tam=15, cor=BRANCO, peso=900, maiusc=True, espacar=1.6)
    tb, tf = caixa(sl, 96, 326, 860, 150)
    escrever(tf, s['titulo'], tam=54, cor=BRANCO, peso=900, entre=1.05)
    tb2, tf2 = caixa(sl, 96, 470, 720, 110)
    escrever(tf2, s['sub'], tam=19, cor=RGBColor(0xE2, 0xDE, 0xF5), peso=300, entre=1.45)
    rodape(sl, s['n'], s['bloco'], True)

def m_citacao(sl, s):
    fundo(sl, AZUL)
    logo(sl, claro=True)
    rotulo(sl, 130, 152, 100, '“', tam=70, cor=LARANJA, peso=900)
    tb, tf = caixa(sl, 130, 216, 1000, 260)
    escrever(tf, s['texto'], tam=s.get('tam', 40), cor=BRANCO, peso=300, entre=1.34)
    retangulo(sl, 130, 484, 64, 5, preencher=LARANJA, raio=2)
    rotulo(sl, 130, 508, 900, s['fonte'], tam=15, cor=RGBColor(0xB8, 0xAE, 0xE4), peso=300)
    rodape(sl, s['n'], s['bloco'], True)

def m_impacto(sl, s):
    fundo_imagem(sl, 'fundo-secao.jpg')
    logo(sl, claro=True)
    if s.get('cartola'):
        retangulo(sl, 96, 172, 4, 18, preencher=LARANJA)
        rotulo(sl, 112, 168, 900, s['cartola'], tam=15, cor=BRANCO, peso=900, maiusc=True, espacar=1.6)
    tb, tf = caixa(sl, 96, 196, 700 if s.get('logo') else 1020, 200)
    escrever(tf, s['titulo'], tam=s.get('tam', 52), cor=BRANCO, peso=900, entre=1.06)
    if s.get('sub'):
        tb2, tf2 = caixa(sl, 96, s.get('subY', 430), 900, 160)
        escrever(tf2, s['sub'], tam=19, cor=RGBColor(0xE2, 0xDE, 0xF5), peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'], True)

def cabeca(sl, s):
    fundo(sl, BRANCO)
    logo(sl, claro=False)
    if s.get('cartola'):
        cartola(sl, s['cartola'])
        titulo_claro(sl, s['titulo'], tam=s.get('tam', 40))
    else:
        titulo_claro(sl, s['titulo'], tam=s.get('tam', 40), y=72)

def m_conteudo(sl, s):
    cabeca(sl, s)
    largura = 1208 - (s.get('right', 320)) - 72 + 30
    if s.get('grande'):
        tam, gap, alt = ajustar(s['itens'], largura, 424, tam=26, gap=34, minimo=20, maximo=28)
    else:
        tam, gap, alt = ajustar(s['itens'], largura, 424, maximo=22)
    y0 = centrar(alt, 176, 636)
    itens(sl, s['itens'], 72, y0, largura, tam=tam, gap=gap)
    if s.get('nota'):
        nota_lateral(sl, 958, y0, 250, s.get('notaTitulo', 'ATENÇÃO'), s['nota'])
    rodape(sl, s['n'], s['bloco'])

def m_duas(sl, s):
    cabeca(sl, s)
    corA = LARANJA if s.get('corA') == '#E94D1C' else AZUL
    corB = AZUL if s.get('corB') == '#21049A' else LARANJA
    tamA, gapA, altA = ajustar(s['itensA'], 540, 372, tam=18, gap=22, minimo=14, maximo=21)
    tamB, gapB, altB = ajustar(s['itensB'], 540, 372, tam=18, gap=22, minimo=14, maximo=21)
    tam, gap = min(tamA, tamB), min(gapA, gapB)
    alt = max(altura_lista(s['itensA'], tam, 540, gap), altura_lista(s['itensB'], tam, 540, gap))
    y0 = centrar(alt + 52, 176, 636)
    for i, (tit, lst, cor) in enumerate([(s['tituloA'], s['itensA'], corA), (s['tituloB'], s['itensB'], corB)]):
        cx = 72 + i * 596
        rotulo(sl, cx, y0, 540, tit, tam=12, cor=cor, peso=900, maiusc=True, espacar=1.2)
        retangulo(sl, cx, y0 + 22, 44, 3, preencher=cor)
        itens(sl, lst, cx, y0 + 52, 540, tam=tam, gap=gap)
    rodape(sl, s['n'], s['bloco'])

def m_terminal(sl, s):
    cabeca(sl, s)
    alt = 46 + len(s['linhas']) * 25 + 24
    legenda = altura_estimada(s['captura'], 15, 1116)
    y0 = min(centrar(alt + 24 + legenda, 176, 640), 640 - alt - 24 - legenda)
    retangulo(sl, 72, y0, 1136, alt, preencher=ESCURO, raio=8)
    retangulo(sl, 100, y0 + 22, 34, 3, preencher=LARANJA, raio=2)
    rotulo(sl, 144, y0 + 16, 200, 'TERMINAL', tam=11, cor=RGBColor(0x8A, 0x8A, 0x9A), espacar=1.4)
    for i, l in enumerate(s['linhas']):
        cor = RGBColor(0x7F, 0xE3, 0xA1) if l.startswith('$') else (RGBColor(0x8A, 0x8A, 0x9A) if l.startswith('#') else RGBColor(0xE4, 0xE4, 0xEC))
        rotulo(sl, 100, y0 + 52 + i * 25, 1080, l if l.strip() else ' ', tam=15, cor=cor, fonte=MONO)
    retangulo(sl, 72, y0 + alt + 24, 3, legenda, preencher=LARANJA)
    tb, tf = caixa(sl, 92, y0 + alt + 22, 1116, 70)
    escrever(tf, s['captura'], tam=15, cor=RGBColor(0x3A, 0x3A, 0x44), peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'])

def m_codigo(sl, s):
    cabeca(sl, s)
    larg = s.get('larguraCod', 640)
    alt = 44 + len(s['linhas']) * 26
    col = 1208 - (72 + larg + 48)
    y0 = centrar(max(alt, altura_lista(s['itens'], 17, col, 16)), 176, 620)
    retangulo(sl, 72, y0, larg, alt, preencher=QUASE, borda=CINZA_CLARO, raio=8)
    for i, l in enumerate(s['linhas']):
        cor = CINZA if l.strip().startswith('#') else GRAFITE
        rotulo(sl, 98, y0 + 22 + i * 26, larg - 40, l if l.strip() else ' ', tam=14, cor=cor, fonte=MONO)
    itens(sl, s['itens'], 72 + larg + 48, y0, col, tam=17, gap=16)
    rodape(sl, s['n'], s['bloco'])

def m_diagrama(sl, s):
    cabeca(sl, s)
    antes = {f.shape_id for f in sl.shapes}
    DIAGRAMAS[s['svgNome']](sl, 90, 0)
    novas = [f for f in sl.shapes if f.shape_id not in antes]
    # a legenda e ancorada acima do rodape e o diagrama ocupa o que sobra,
    # senao legenda de tres linhas invade o rodape
    tam_leg, alt_leg, topo_leg = 17, 0, 0
    if s.get('legenda'):
        while tam_leg > 14 and altura_estimada(s['legenda'], tam_leg, 1116) * 1.16 > 96:
            tam_leg -= 1
        alt_leg = altura_estimada(s['legenda'], tam_leg, 1116) * 1.16
        topo_leg = 634 - alt_leg
    fundo_util = (topo_leg - 24) if s.get('legenda') else 640
    desloca = int(round(centrar(max(f.top + f.height for f in novas) / 9525, 176, fundo_util)))
    for f in novas:
        f.top = f.top + Emu(desloca * 9525)
    if s.get('legenda'):
        retangulo(sl, 72, topo_leg + 2, 3, alt_leg - 4, preencher=LARANJA)
        tb, tf = caixa(sl, 92, topo_leg, 1116, alt_leg + 10)
        escrever(tf, s['legenda'], tam=tam_leg, cor=RGBColor(0x3A, 0x3A, 0x44), peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'])

def m_tabela(sl, s):
    cabeca(sl, s)
    xs = s.get('xs', [72, 320, 700])
    ws = s.get('ws', [230, 360, 500])
    tam_leg, alt_leg, topo_leg = 17, 0, 0
    if s.get('legenda'):
        alt_leg = altura_estimada(s['legenda'], tam_leg, 1116) * 1.16
        topo_leg = 634 - alt_leg
    def alt_celula(i, c):
        return altura_estimada(c, 18 if i == 0 else 17, ws[i] - 18) * 1.05
    corpo = sum(max(alt_celula(i, c) for i, c in enumerate(lin)) + 26 for lin in s['linhas'])
    topo = centrar(corpo + 40, 176, (topo_leg - 24) if s.get('legenda') else 620)
    for i, c in enumerate(s['cabecalhos']):
        rotulo(sl, xs[i], topo, ws[i], c, tam=11, cor=AZUL, peso=900, maiusc=True, espacar=1.2)
    retangulo(sl, 72, topo + 24, 1136, 2, preencher=AZUL)
    y = topo + 40
    for j, lin in enumerate(s['linhas']):
        escolhida = j == s.get('destacar', -1)
        if escolhida:
            retangulo(sl, 60, y - 6, 3, 34, preencher=LARANJA)
        alto = 0
        for i, c in enumerate(lin):
            tb, tf = caixa(sl, xs[i], y, ws[i] - 18, 80)
            escrever(tf, c, tam=18 if i == 0 else 17, cor=(LARANJA if escolhida else AZUL) if i == 0 else GRAFITE, peso=900 if i == 0 else 300, entre=1.35)
            alto = max(alto, alt_celula(i, c))
        y += alto + 26
        retangulo(sl, 72, y - 13, 1136, 1, preencher=RGBColor(0xED, 0xED, 0xF2))
    if s.get('legenda'):
        retangulo(sl, 72, topo_leg + 2, 3, alt_leg - 4, preencher=LARANJA)
        tb, tf = caixa(sl, 92, topo_leg, 1116, alt_leg + 10)
        escrever(tf, s['legenda'], tam=tam_leg, cor=RGBColor(0x3A, 0x3A, 0x44), peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'])

def m_agenda(sl, s):
    cabeca(sl, s)
    y = 212
    for k, it in enumerate(s['itens']):
        rotulo(sl, 72, y + 5, 60, f'{k+1:02d}', tam=15, cor=LARANJA, peso=900)
        rotulo(sl, 128, y, 700, it['t'], tam=21, cor=GRAFITE, peso=400)
        if it['d']:
            rotulo(sl, 856, y + 4, 200, it['d'], tam=16, cor=AZUL, peso=400)
        y += 36
        retangulo(sl, 72, y, 1136, 1, preencher=RGBColor(0xED, 0xED, 0xF2))
        y += 16
    retangulo(sl, 72, 528, 3, 30, preencher=LARANJA)
    tb, tf = caixa(sl, 92, 528, 1010, 90)
    escrever(tf, s['nota'], tam=17, cor=GRAFITE, peso=300, entre=1.45)
    rodape(sl, s['n'], s['bloco'])

def m_linha_tempo(sl, s):
    cabeca(sl, s)
    marcos = s['marcos']
    largura = 1136 / len(marcos)
    retangulo(sl, 72, 318, 1136, 3, preencher=CINZA_CLARO)
    for i, m in enumerate(marcos):
        cx = 72 + i * largura
        cor = LARANJA if i >= len(marcos) - 3 else AZUL
        retangulo(sl, cx + largura / 2 - 8, 311, 16, 16, preencher=cor, raio=8)
        rotulo(sl, cx, 340, largura, m['ano'], tam=20, cor=AZUL, peso=900, alinhar=PP_ALIGN.CENTER)
        tb, tf = caixa(sl, cx + 6, 368, largura - 12, 90, alinhar=PP_ALIGN.CENTER)
        escrever(tf, m['txt'], tam=15, cor=RGBColor(0x3A, 0x3A, 0x44), peso=300, entre=1.35)
        for par in tf.paragraphs:
            par.alignment = PP_ALIGN.CENTER
    alt = altura_estimada(s['remate'], 19, 1100)
    retangulo(sl, 72, 486, 3, alt, preencher=LARANJA)
    tb2, tf2 = caixa(sl, 92, 484, 1100, 80)
    escrever(tf2, s['remate'], tam=19, cor=GRAFITE, peso=300, entre=1.45)
    rodape(sl, s['n'], s['bloco'])

def m_cartoes(sl, s):
    """Grade de cartoes: rotulo pequeno, titulo e um paragrafo curto em cada um.
    Com 'setas', uma flecha rotulada liga cada cartao ao seguinte. 'destacar' marca um deles."""
    cabeca(sl, s)
    cards = s.get('cartoes') or []
    cols = s.get('colunas', 2)
    setas = s.get('setas') or []
    gap = 72 if setas else 24
    n_lin = -(-len(cards) // cols)
    larg = (1136 - gap * (cols - 1)) / cols
    tam_corpo = s.get('tamCorpo', 16 if cols <= 2 else 15)
    def precisa(c):
        h = 84 + altura_estimada(c['d'], tam_corpo, larg - 48) * 1.1 + 24
        if c.get('codigo'):
            h += 12 + 16 + len(c['codigo']) * 22
        return h
    alt_c = max([224 if n_lin == 1 else 180] + [precisa(c) for c in cards])
    # legenda ancorada acima do rodape, como no modelo de diagrama
    tam_leg, alt_leg, topo_leg = 17, 0, 0
    if s.get('legenda'):
        while tam_leg > 14 and altura_estimada(s['legenda'], tam_leg, 1116) * 1.16 > 96:
            tam_leg -= 1
        alt_leg = altura_estimada(s['legenda'], tam_leg, 1116) * 1.16
        topo_leg = 634 - alt_leg
    fundo_util = (topo_leg - 24) if s.get('legenda') else 640
    topo = centrar(n_lin * alt_c + (n_lin - 1) * 24, 176, fundo_util)
    ESC = RGBColor(0x3A, 0x3A, 0x44)
    dest = s.get('destacar', -1)
    for k, c in enumerate(cards):
        cx = 72 + (k % cols) * (larg + gap)
        cy = topo + (k // cols) * (alt_c + 24)
        esc = k == dest
        retangulo(sl, cx, cy, larg, alt_c, preencher=QUASE, borda=LARANJA if esc else CINZA_CLARO, largura=1.5 if esc else 1, raio=8)
        rotulo(sl, cx + 24, cy + 20, larg - 48, c.get('k') or f'{k + 1:02d}', tam=11, cor=LARANJA, peso=900, maiusc=True, espacar=1.4)
        rotulo(sl, cx + 24, cy + 44, larg - 48, c['t'], tam=20, cor=LARANJA if esc else AZUL, peso=900)
        tb, tf = caixa(sl, cx + 24, cy + 84, larg - 48, alt_c - 100)
        escrever(tf, c['d'], tam=tam_corpo, cor=ESC, peso=300, entre=1.45)
        if c.get('codigo'):
            cy0 = cy + 84 + altura_estimada(c['d'], tam_corpo, larg - 48) * 1.1 + 12
            retangulo(sl, cx + 16, cy0, larg - 32, 16 + len(c['codigo']) * 22, preencher=RGBColor(0xE6, 0xE6, 0xEC), raio=4)
            for i, l in enumerate(c['codigo']):
                rotulo(sl, cx + 28, cy0 + 8 + i * 22, larg - 56, l, tam=13, cor=GRAFITE, fonte=MONO)
        if setas and (k % cols) < cols - 1 and k < len(cards) - 1:
            sx, ym = cx + larg, cy + alt_c / 2
            seta(sl, sx + 12, ym, sx + gap - 12, ym, LARANJA, 2)
            rotulo(sl, sx, ym - 30, gap, setas[k] if k < len(setas) else '', tam=12, cor=LARANJA, peso=900, alinhar=PP_ALIGN.CENTER)
    if s.get('legenda'):
        retangulo(sl, 72, topo_leg + 2, 3, alt_leg - 4, preencher=LARANJA)
        tb, tf = caixa(sl, 92, topo_leg, 1116, alt_leg + 10)
        escrever(tf, s['legenda'], tam=tam_leg, cor=ESC, peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'])

def m_capturas(sl, s):
    """Uma fileira de capturas de tela, cada uma com uma legenda curta embaixo."""
    cabeca(sl, s)
    imgs = s['imagens']
    gap = 32
    tam_leg, alt_leg, topo_leg = 17, 0, 0
    if s.get('legenda'):
        alt_leg = altura_estimada(s['legenda'], tam_leg, 1116) * 1.16
        topo_leg = 634 - alt_leg
    fundo_util = (topo_leg - 24) if s.get('legenda') else 640
    topo = s.get('topo', 176)
    reserva = 34 if any(i.get('t') for i in imgs) else 0
    alt = min(s.get('alt', 400), fundo_util - topo - reserva)
    largs = [alt * proporcao(i['arq']) for i in imgs]
    total = sum(largs) + gap * (len(imgs) - 1)
    if total > 1136:
        f = (1136 - gap * (len(imgs) - 1)) / sum(largs)
        alt, largs = alt * f, [l * f for l in largs]
        total = 1136
    x = 72 + (1136 - total) / 2
    y = centrar(alt + reserva, topo, fundo_util)
    for i, l in zip(imgs, largs):
        captura(sl, i['arq'], x, y, larg=l)
        if i.get('t'):
            rotulo(sl, x - 20, y + alt + 10, l + 40, i['t'], tam=15, cor=CINZA, peso=400, alinhar=PP_ALIGN.CENTER)
        x += l + gap
    if s.get('legenda'):
        retangulo(sl, 72, topo_leg + 2, 3, alt_leg - 4, preencher=LARANJA)
        tb, tf = caixa(sl, 92, topo_leg, 1116, alt_leg + 10)
        escrever(tf, s['legenda'], tam=tam_leg, cor=RGBColor(0x3A, 0x3A, 0x44), peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'])

def m_conteudo_imagem(sl, s):
    """Lista à esquerda e uma captura à direita, para a imagem ficar junto do texto que fala dela."""
    cabeca(sl, s)
    larg_txt = s.get('largTexto', 560)
    x_img = 72 + larg_txt + 40
    larg_img_max, alt_img_max = 1208 - x_img, s.get('altImagem', 440)
    prop = proporcao(s['imagem'])
    larg_img = min(larg_img_max, alt_img_max * prop)
    alt_img = larg_img / prop
    tam, gap, alt = ajustar(s['itens'], larg_txt, 424, tam=19, gap=22, minimo=15, maximo=21)
    topo = 176
    y_txt = centrar(alt, topo, 636)
    itens(sl, s['itens'], 72, y_txt, larg_txt, tam=tam, gap=gap)
    y_img = centrar(alt_img + (28 if s.get('legendaImagem') else 0), s.get('topoImagem', topo), 646)
    x = x_img + (larg_img_max - larg_img) / 2
    captura(sl, s['imagem'], x, y_img, larg=larg_img)
    if s.get('legendaImagem'):
        rotulo(sl, x - 20, y_img + alt_img + 8, larg_img + 40, s['legendaImagem'], tam=14, cor=CINZA, peso=400, alinhar=PP_ALIGN.CENTER)
    rodape(sl, s['n'], s['bloco'])

# ---------- modelos do Pitch ----------
# O motivo visual do Pitch é o ícone dentro de um círculo. Azul chapado com ícone branco para
# o que é principal, lilás claro com ícone azul para o que é apoio.

import os as _os
ICONES_DIR = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'icones')
LILAS = RGBColor(0xE9, 0xE5, 0xF8)
LILAS_ESC = RGBColor(0xB8, 0xAE, 0xE4)
TEXTO = RGBColor(0x3A, 0x3A, 0x44)
CODIGO_FUNDO = RGBColor(0x1B, 0x16, 0x3A)

def icone(sl, nome, x, y, d, *, fundo=None, cor='branco'):
    """Círculo com o ícone no centro. fundo=None desenha o círculo azul com ícone branco."""
    if fundo is None:
        fundo = AZUL
    _forma(sl, MSO_SHAPE.OVAL, x, y, d, d, preencher=fundo)
    lado = d * 0.52
    sl.shapes.add_picture(_os.path.join(ICONES_DIR, f'{nome}-{cor}.png'),
                          px(x + (d - lado) / 2), px(y + (d - lado) / 2), px(lado), px(lado))

def icone_claro(sl, nome, x, y, d):
    icone(sl, nome, x, y, d, fundo=LILAS, cor='azul')

def pilula(sl, x, y, texto, *, fundo=LILAS, cor=AZUL, tam=11, alt=24):
    """Etiqueta curta com fundo arredondado. Devolve a largura usada."""
    m = _medidor(tam)
    base = m[0].textlength(texto.upper(), font=m[1]) if m else len(texto) * tam * 0.7
    # a etiqueta sai em negrito e com espaçamento, mais larga que a medição da fonte regular
    larg = base * 1.12 + 22 + len(texto) * 0.6
    retangulo(sl, x, y, larg, alt, preencher=fundo, raio=alt / 2)
    rotulo(sl, x, y + (alt - tam * 1.6) / 2 + 1, larg, texto, tam=tam, cor=cor, peso=900,
           alinhar=PP_ALIGN.CENTER, maiusc=True, espacar=0.6)
    return larg

def alt_par(html, tam, w):
    """Altura que o paragrafo ocupa. A Roboto renderizada sai mais larga que a medida, daí a folga."""
    return altura_estimada(html, tam, w * 0.9) * 1.1

def paragrafo(sl, x, y, w, html, *, tam=16, cor=TEXTO, peso=300, entre=1.4, alinhar=PP_ALIGN.LEFT):
    alt = alt_par(html, tam, w)
    tb, tf = caixa(sl, x, y, w, alt + 10, alinhar=alinhar)
    escrever(tf, html, tam=tam, cor=cor, peso=peso, entre=entre)
    return alt

def m_problema(sl, s):
    """Linhas de ícone à esquerda, com o problema, e um cartão azul à direita, com o objetivo."""
    cabeca(sl, s)
    linhas = s['linhas']
    x_txt, w_txt = 72 + 64 + 24, 520
    alturas = [32 + altura_estimada(l['d'], 17, w_txt) * 1.1 for l in linhas]
    total = sum(alturas) + 36 * (len(linhas) - 1)
    y = centrar(total, 186, 628)
    for l, h in zip(linhas, alturas):
        icone_claro(sl, l['icone'], 72, y, 64)
        rotulo(sl, x_txt, y + 2, w_txt, l['t'], tam=21, cor=AZUL, peso=900)
        paragrafo(sl, x_txt, y + 34, w_txt, l['d'], tam=17)
        y += h + 36
    c = s['cartao']
    cx, cw = 772, 436
    alt_txt = altura_estimada(c['texto'], 24, cw - 72) * 1.1
    ch = 64 + 30 + alt_txt + 28 + len(c['itens']) * 44 + 40
    cy = centrar(ch, 186, 628)
    retangulo(sl, cx, cy, cw, ch, preencher=AZUL, raio=14)
    icone(sl, c.get('icone', 'alvo'), cx + 36, cy + 36, 52, fundo=LARANJA)
    rotulo(sl, cx + 104, cy + 50, cw - 140, c['rotulo'], tam=13, cor=LILAS_ESC, peso=900, maiusc=True, espacar=1.6)
    paragrafo(sl, cx + 36, cy + 112, cw - 72, c['texto'], tam=24, cor=BRANCO, peso=700, entre=1.25)
    yy = cy + 112 + alt_txt + 28
    for it in c['itens']:
        icone(sl, 'check', cx + 36, yy, 28, fundo=RGBColor(0x3A, 0x22, 0xB0))
        rotulo(sl, cx + 76, yy + 3, cw - 112, it, tam=16, cor=RGBColor(0xE2, 0xDE, 0xF5), peso=400)
        yy += 44
    rodape(sl, s['n'], s['bloco'])

def m_personas(sl, s):
    """Um cartão por persona: ícone, nome, papel, o que precisa e o que o app entrega."""
    cabeca(sl, s)
    ps = s['personas']
    gap = 28
    larg = (1136 - gap * (len(ps) - 1)) / len(ps)
    alt_nec = max(altura_estimada(p['precisa'], 17, (larg - 56) * 0.9) for p in ps) * 1.1
    alt_ent = max(altura_estimada(p['app'], 17, (larg - 88) * 0.9) for p in ps) * 1.1 + 12
    alt = 32 + 72 + 24 + 24 + alt_nec + 24 + (alt_ent + 36) + 18
    y = centrar(alt, 180, 630)
    for k, p in enumerate(ps):
        x = 72 + k * (larg + gap)
        retangulo(sl, x, y, larg, alt, preencher=QUASE, raio=14)
        icone(sl, p['icone'], x + 28, y + 32, 72, fundo=LARANJA if k == 0 else AZUL)
        rotulo(sl, x + 116, y + 42, larg - 140, p['nome'], tam=24, cor=AZUL, peso=900)
        rotulo(sl, x + 116, y + 76, larg - 140, p['papel'], tam=12, cor=LARANJA, peso=900, maiusc=True, espacar=1.2)
        yy = y + 32 + 72 + 24
        rotulo(sl, x + 28, yy, larg - 56, 'O que precisa', tam=12, cor=CINZA, peso=900, maiusc=True, espacar=1.4)
        paragrafo(sl, x + 28, yy + 24, larg - 56, p['precisa'], tam=17)
        yy += 24 + alt_nec + 24
        retangulo(sl, x + 16, yy, larg - 32, alt_ent + 36, preencher=BRANCO, raio=10)
        icone_claro(sl, 'check', x + 28, yy + 14, 30)
        paragrafo(sl, x + 68, yy + 16, larg - 88, p['app'], tam=17, cor=AZUL, peso=400)
    rodape(sl, s['n'], s['bloco'])

def m_grade(sl, s):
    """Grade de ícones com título, texto curto e uma etiqueta opcional em cada célula."""
    cabeca(sl, s)
    cel = s['celulas']
    cols = s.get('colunas', 3)
    n_lin = -(-len(cel) // cols)
    gap_x, gap_y = 40, s.get('gapY', 34)
    larg_total = 1136
    if s.get('imagem'):
        alt_im = s.get('altImagem', 430)
        larg_im = alt_im * proporcao(s['imagem'])
        larg_total = 1136 - larg_im - 48
        y_im = centrar(alt_im + 28, 176, 630)
        captura(sl, s['imagem'], 1208 - larg_im, y_im, larg=larg_im)
        if s.get('legendaImagem'):
            rotulo(sl, 1208 - larg_im - 30, y_im + alt_im + 8, larg_im + 60, s['legendaImagem'], tam=14, cor=CINZA, alinhar=PP_ALIGN.CENTER)
    larg = (larg_total - gap_x * (cols - 1)) / cols
    d = s.get('icone', 52)
    tam_d = s.get('tamCorpo', 15)
    w_txt = larg - d - 18
    def alt_cel(c):
        return 34 + altura_estimada(c['d'], tam_d, w_txt * 0.9) * 1.1 + (38 if c.get('etiqueta') and not s.get('etiquetaDireita') else 0)
    alt_lin = [max(alt_cel(c) for c in cel[i * cols:(i + 1) * cols]) for i in range(n_lin)]
    alt_leg = altura_estimada(s['legenda'], 16, 1100) * 1.16 if s.get('legenda') else 0
    base = (634 - alt_leg - 28) if s.get('legenda') else 630
    total = sum(max(a, d) for a in alt_lin) + gap_y * (n_lin - 1)
    y = centrar(total, 182, base)
    for i in range(n_lin):
        for j, c in enumerate(cel[i * cols:(i + 1) * cols]):
            x = 72 + j * (larg + gap_x)
            if c.get('destaque'):
                icone(sl, c['icone'], x, y, d, fundo=LARANJA)
            else:
                icone_claro(sl, c['icone'], x, y, d)
            tx = x + d + 18
            tt = s.get('tamTitulo', 19)
            rotulo(sl, tx, y + 2, w_txt, c['t'], tam=tt, cor=AZUL, peso=900)
            yd = y + tt * 1.6 + 4
            # a etiqueta vai logo abaixo do título, em posição fixa, para nunca encostar no texto
            if c.get('etiqueta') and s.get('etiquetaDireita'):
                # na mesma linha do título, alinhada à direita da célula, sem ocupar altura
                m = _medidor(11)
                lw = (m[0].textlength(c['etiqueta'].upper(), font=m[1]) if m else 60) * 1.12 + 22 + len(c['etiqueta']) * 0.6
                pilula(sl, x + larg - lw, y + 4, c['etiqueta'], alt=22)
            elif c.get('etiqueta'):
                xx = tx
                for e in c['etiqueta'] if isinstance(c['etiqueta'], list) else [c['etiqueta']]:
                    xx += pilula(sl, xx, yd + 2, e, alt=22) + 8
                yd += 32
            paragrafo(sl, tx, yd, w_txt, c['d'], tam=tam_d)
        y += max(alt_lin[i], d) + gap_y
    if s.get('legenda'):
        icone(sl, s.get('iconeLegenda', 'check'), 72, 634 - alt_leg - 4, 30, fundo=LARANJA)
        paragrafo(sl, 116, 634 - alt_leg, 1090, s['legenda'], tam=16, cor=GRAFITE, peso=400)
    rodape(sl, s['n'], s['bloco'])

def m_numeros(sl, s):
    """Números grandes com rótulo, e embaixo um fluxo de etiquetas ligadas por setas."""
    cabeca(sl, s)
    nums = s['numeros']
    gn = 24
    larg = (1136 - gn * (len(nums) - 1)) / len(nums)
    y = 196
    for k, n in enumerate(nums):
        x = 72 + k * (larg + gn)
        retangulo(sl, x, y, larg, 176, preencher=QUASE, raio=14)
        cor = LARANJA if n.get('destaque') else AZUL
        rotulo(sl, x, y + 18, larg, n['v'], tam=72, cor=cor, peso=900, alinhar=PP_ALIGN.CENTER)
        tb, tf = caixa(sl, x + 16, y + 118, larg - 32, 50, alinhar=PP_ALIGN.CENTER)
        escrever(tf, n['r'], tam=15, cor=TEXTO, peso=400, entre=1.25)
    fl = s.get('fluxo')
    if fl:
        rotulo(sl, 72, 400, 1136, fl['titulo'], tam=13, cor=CINZA, peso=900, maiusc=True, espacar=1.4)
        passos = fl['passos']
        gap = 56
        w = (1136 - gap * (len(passos) - 1)) / len(passos)
        for k, p in enumerate(passos):
            x = 72 + k * (w + gap)
            retangulo(sl, x, 432, w, 152, preencher=BRANCO, borda=CINZA_CLARO, largura=1, raio=12)
            icone_claro(sl, p['icone'], x + 20, 452, 44)
            rotulo(sl, x + 76, 458, w - 92, p['t'], tam=19, cor=AZUL, peso=900)
            paragrafo(sl, x + 20, 510, w - 40, p['d'], tam=15)
            if k < len(passos) - 1:
                seta(sl, x + w + 10, 508, x + w + gap - 10, 508, LARANJA, 2.5)
    rodape(sl, s['n'], s['bloco'])

def m_refino(sl, s):
    """Linha do tempo das sprints em cima e os refinamentos do backlog em cartões embaixo."""
    cabeca(sl, s)
    marcos = s['marcos']
    larg = 1136 / len(marcos)
    yl = 214
    retangulo(sl, 72 + larg / 2, yl + 7, 1136 - larg, 3, preencher=CINZA_CLARO)
    for i, m in enumerate(marcos):
        cx = 72 + i * larg
        cor = LARANJA if m.get('codigo') else AZUL
        retangulo(sl, cx + larg / 2 - 9, yl, 18, 18, preencher=cor, raio=9)
        rotulo(sl, cx, yl + 28, larg, m['s'], tam=17, cor=AZUL, peso=900, alinhar=PP_ALIGN.CENTER)
        tb, tf = caixa(sl, cx + 8, yl + 54, larg - 16, 60, alinhar=PP_ALIGN.CENTER)
        escrever(tf, m['t'], tam=14, cor=TEXTO, peso=300, entre=1.3)
    rotulo(sl, 72, 360, 1136, s['tituloCartoes'], tam=12, cor=CINZA, peso=900, maiusc=True, espacar=1.4)
    cards = s['cartoes']
    gap = 28
    w = (1136 - gap * (len(cards) - 1)) / len(cards)
    h = max(64 + altura_estimada(c['antes'], 15, w - 48) + altura_estimada(c['depois'], 15, w - 48) for c in cards) * 1.1 + 70
    for k, c in enumerate(cards):
        x = 72 + k * (w + gap)
        y = 392
        retangulo(sl, x, y, w, h, preencher=QUASE, raio=12)
        rotulo(sl, x + 24, y + 18, w - 48, c['t'], tam=18, cor=AZUL, peso=900)
        ha = paragrafo(sl, x + 24, y + 52, w - 48, '<em>Antes:</em> ' + c['antes'], tam=15, cor=CINZA)
        icone(sl, 'seta_baixo', x + 24, y + 62 + ha, 26, fundo=LARANJA)
        paragrafo(sl, x + 60, y + 64 + ha, w - 84, c['depois'], tam=15, cor=GRAFITE, peso=400)
    rodape(sl, s['n'], s['bloco'])

def m_mosaico(sl, s):
    """Itens à esquerda e uma grade 2x2 de diagramas à direita, cada um com legenda."""
    cabeca(sl, s)
    lw = s.get('largTexto', 420)
    tam, gap, alt = ajustar(s['itens'], lw, 420, tam=18, gap=20, minimo=15, maximo=19)
    itens(sl, s['itens'], 72, centrar(alt, 186, 630), lw, tam=tam, gap=gap)
    x0 = 72 + lw + 48
    gw = 1208 - x0
    cw, ch = (gw - 24) / 2, 196
    for k, im in enumerate(s['imagens']):
        x = x0 + (k % 2) * (cw + 24)
        y = 186 + (k // 2) * (ch + 44)
        retangulo(sl, x, y, cw, ch, preencher=BRANCO, borda=CINZA_CLARO, largura=1, raio=10)
        prop = proporcao(im['arq'])
        iw, ih = cw - 24, ch - 24
        if iw / ih > prop:
            iw = ih * prop
        else:
            ih = iw / prop
        captura(sl, im['arq'], x + (cw - iw) / 2, y + (ch - ih) / 2, larg=iw, borda=None)
        rotulo(sl, x, y + ch + 8, cw, im['t'], tam=14, cor=CINZA, peso=400, alinhar=PP_ALIGN.CENTER)
    rodape(sl, s['n'], s['bloco'])

def m_mapa(sl, s):
    """Mapa do código: uma coluna por tier, com as pastas empilhadas, e o pacote compartilhado embaixo."""
    cabeca(sl, s)
    cols = s['colunas']
    gap = 28
    w = (1136 - gap * (len(cols) - 1)) / len(cols)
    y0 = 180
    altura_col = 344
    for k, c in enumerate(cols):
        x = 72 + k * (w + gap)
        retangulo(sl, x, y0, w, altura_col, preencher=QUASE, raio=14)
        icone(sl, c['icone'], x + 20, y0 + 18, 48)
        rotulo(sl, x + 80, y0 + 22, w - 96, c['t'], tam=19, cor=AZUL, peso=900)
        rotulo(sl, x + 80, y0 + 48, w - 96, c['tec'], tam=13, cor=LARANJA, peso=900, maiusc=True, espacar=1.2)
        n = len(c['pastas'])
        hh = (altura_col - 96 - 10 * (n - 1) - 18) / n
        for j, (pasta, desc) in enumerate(c['pastas']):
            yy = y0 + 86 + j * (hh + 10)
            retangulo(sl, x + 16, yy, w - 32, hh, preencher=BRANCO, raio=8)
            rotulo(sl, x + 30, yy + hh / 2 - 22, w - 60, pasta, tam=15, cor=GRAFITE, peso=700, fonte=MONO)
            rotulo(sl, x + 30, yy + hh / 2, w - 60, desc, tam=14, cor=CINZA, peso=400)
    b = s['base']
    yb = y0 + altura_col + 22
    retangulo(sl, 72, yb, 1136, 78, preencher=AZUL, raio=14)
    icone(sl, b['icone'], 92, yb + 15, 48, fundo=LARANJA)
    rotulo(sl, 156, yb + 14, 300, b['t'], tam=17, cor=BRANCO, peso=700, fonte=MONO)
    rotulo(sl, 156, yb + 42, 1030, b['d'], tam=14, cor=RGBColor(0xE2, 0xDE, 0xF5), peso=400)
    rodape(sl, s['n'], s['bloco'])


def m_comparacao(sl, s):
    """Planejado ao lado do implementado, uma linha por item; as linhas corrigidas na integração ficam num grupo à parte."""
    cabeca(sl, s)
    xs = [128, 340, 640]
    ws = [200, 280, 568]
    y = 150
    rotulo(sl, xs[1], y, ws[1], 'Prescritiva, planejada no Grau A', tam=15, cor=AZUL, peso=900)
    rotulo(sl, xs[2], y, ws[2], 'Descritiva, o que está no código', tam=15, cor=AZUL, peso=900)
    y += 32

    def linha_item(r, y, cor):
        h = max(alt_par(r['plano'], 16, ws[1]), alt_par(r['feito'], 16, ws[2]), 40) + 20
        retangulo(sl, 72, y, 1136, 1, preencher=CINZA_CLARO)
        icone(sl, r['icone'], 72, y + (h - 40) / 2, 40, fundo=cor)
        paragrafo(sl, xs[0], y + (h - 24) / 2, ws[0], r['aspecto'], tam=17, cor=AZUL, peso=900, entre=1.2)
        paragrafo(sl, xs[1], y + 10, ws[1], r['plano'], tam=16, cor=CINZA, peso=400)
        paragrafo(sl, xs[2], y + 10, ws[2], r['feito'], tam=16, cor=GRAFITE, peso=400)
        return y + h

    for r in s['linhas']:
        y = linha_item(r, y, AZUL)
    if s.get('corrigidas'):
        retangulo(sl, 72, y, 1136, 34, preencher=QUASE)
        retangulo(sl, 72, y, 4, 34, preencher=LARANJA)
        rotulo(sl, 92, y + 6, 1100, s['faixa'], tam=15, cor=GRAFITE, peso=700)
        y += 34
        for k, r in enumerate(s['corrigidas']):
            y = linha_item(r, y, LARANJA)
    retangulo(sl, 72, y, 1136, 1, preencher=CINZA_CLARO)
    rodape(sl, s['n'], s['bloco'])

def m_duas_icones(sl, s):
    """Duas colunas com ícone no cabeçalho e itens marcados com ícone pequeno."""
    cabeca(sl, s)
    gap = 40
    w = (1136 - gap) / 2
    cols = s['colunas']
    alts = [96 + sum(altura_estimada(i, 17, (w - 100) * 0.95) * 1.1 + 24 for i in c['itens']) + 12 for c in cols]
    h = max(alts)
    y = centrar(h, 180, 630)
    for k, c in enumerate(cols):
        x = 72 + k * (w + gap)
        retangulo(sl, x, y, w, h, preencher=QUASE, raio=14)
        icone(sl, c['icone'], x + 28, y + 24, 48, fundo=LARANJA if c.get('destaque') else AZUL)
        rotulo(sl, x + 92, y + 34, w - 120, c['t'], tam=20, cor=AZUL, peso=900)
        yy = y + 96
        for it in c['itens']:
            icone_claro(sl, c.get('marcador', 'check'), x + 32, yy + 2, 26)
            hh = altura_estimada(it, 17, (w - 100) * 0.95) * 1.1
            paragrafo(sl, x + 72, yy, w - 100, it, tam=17, cor=GRAFITE, peso=400)
            yy += hh + 24
    if s.get('legenda'):
        paragrafo(sl, 72, y + h + 18, 1136, s['legenda'], tam=15, cor=CINZA, peso=400)
    rodape(sl, s['n'], s['bloco'])

PALAVRAS = re.compile(r'\b(async|await|const|return|if|throw|new|this)\b')

def bloco_codigo(sl, x, y, w, linhas, tam=13):
    """Linhas de código num painel escuro. Comentário em lilás, o resto em claro."""
    for i, l in enumerate(linhas):
        cor = RGBColor(0x9C, 0x90, 0xD4) if l.strip().startswith('//') else RGBColor(0xEE, 0xEC, 0xF8)
        rotulo(sl, x, y + i * tam * 1.75, w + 40, l if l.strip() else ' ', tam=tam, cor=cor, fonte=MONO)

def m_codigo_fluxo(sl, s):
    """Painéis de código lado a lado, um por camada, ligados por setas, cada um com legenda."""
    cabeca(sl, s)
    ps = s['paineis']
    gap = 44
    ws = s.get('larguras') or [(1136 - gap * (len(ps) - 1)) / len(ps)] * len(ps)
    tam = s.get('tamCodigo', 12)
    alt_cod = max(len(p['codigo']) for p in ps) * tam * 1.75 + 24
    alt_leg = max(altura_estimada(p['legenda'], 15, w - 8) for p, w in zip(ps, ws)) * 1.1
    total = 56 + alt_cod + 18 + alt_leg
    y = centrar(total, 178, 632)
    x = 72
    for k, (p, w) in enumerate(zip(ps, ws)):
        icone(sl, p['icone'], x, y, 40, fundo=LARANJA if p.get('destaque') else AZUL)
        rotulo(sl, x + 52, y - 2, w - 52, p['camada'], tam=17, cor=AZUL, peso=900)
        rotulo(sl, x + 52, y + 22, w - 52, p['arquivo'], tam=12, cor=CINZA, peso=400, fonte=MONO)
        retangulo(sl, x, y + 56, w, alt_cod, preencher=CODIGO_FUNDO, raio=10)
        bloco_codigo(sl, x + 16, y + 68, w - 28, p['codigo'], tam=tam)
        paragrafo(sl, x + 4, y + 56 + alt_cod + 14, w - 8, p['legenda'], tam=15)
        if k < len(ps) - 1:
            seta(sl, x + w + 8, y + 56 + alt_cod / 2, x + w + gap - 8, y + 56 + alt_cod / 2, LARANJA, 2.5)
        x += w + gap
    rodape(sl, s['n'], s['bloco'])

def m_divisor(sl, s):
    """Divisor de bloco em azul chapado: número grande, título e quem apresenta."""
    fundo(sl, AZUL)
    logo(sl, claro=True)
    rotulo(sl, 92, 150, 400, s['num'], tam=120, cor=RGBColor(0x6E, 0x59, 0xD2), peso=900)
    tb, tf = caixa(sl, 96, 340, 900, 140)
    escrever(tf, s['titulo'], tam=54, cor=BRANCO, peso=900, entre=1.05)
    y = 420 + (60 if '<br>' in s['titulo'] else 0)
    for k, (nome, ic) in enumerate(s.get('quem') or []):
        icone(sl, ic, 96 + k * 300, y + 40, 44, fundo=LARANJA)
        rotulo(sl, 152 + k * 300, y + 50, 240, nome, tam=19, cor=BRANCO, peso=700)
    rodape(sl, s['n'], s['bloco'], True)

def m_capa_pitch(sl, s):
    fundo_imagem(sl, 'fundo-capa.jpg')
    logo_completo(sl, 72, 58, 214)
    rotulo(sl, 72, 200, 700, s['cartola'], tam=13, cor=LARANJA, peso=900, maiusc=True, espacar=1.6)
    tb, tf = caixa(sl, 72, 224, 800, 200)
    escrever(tf, s['titulo'], tam=s.get('tam', 60), cor=BRANCO, peso=900, entre=1.02)
    tb2, tf2 = caixa(sl, 72, 410, 760, 90)
    escrever(tf2, s['sub'], tam=21, cor=RGBColor(0xD6, 0xCF, 0xF0), peso=300, entre=1.45)
    if s.get('captura'):
        captura(sl, s['captura'], 940, 110, alt=500, borda=RGBColor(0x6E, 0x59, 0xD2))
    for i, (rot, val) in enumerate([('EQUIPE', s['equipe']), ('DISCIPLINA', s['disciplina']), ('DATA', s['data'])]):
        cx = 72 + i * 290
        rotulo(sl, cx, 560, 280, rot, tam=11, cor=RGBColor(0xC9, 0xC1, 0xEE), peso=700, espacar=1.4)
        tb3, tf3 = caixa(sl, cx, 580, 270, 80)
        escrever(tf3, val, tam=13, cor=RGBColor(0xE0, 0xDB, 0xF2), peso=400, entre=1.4)

def m_encerramento(sl, s):
    fundo(sl, AZUL)
    logo(sl, claro=True)
    tb, tf = caixa(sl, 96, 190, 1000, 140)
    escrever(tf, s['titulo'], tam=64, cor=BRANCO, peso=900, entre=1.05)
    y = 330
    for ic, rot, val in s['linhas']:
        icone(sl, ic, 96, y, 48, fundo=LARANJA)
        rotulo(sl, 162, y, 800, rot, tam=13, cor=RGBColor(0xE2, 0xDE, 0xF5), peso=900, maiusc=True, espacar=1.4)
        rotulo(sl, 162, y + 24, 900, val, tam=21, cor=BRANCO, peso=400)
        y += 84
    rodape(sl, s['n'], s['bloco'], True)

def m_demo(sl, s):
    """Slide que fica na tela enquanto a demo começa: o endereço público e o que vai ser mostrado."""
    fundo(sl, AZUL)
    logo(sl, claro=True)
    rotulo(sl, 96, 150, 900, s['cartola'], tam=15, cor=LARANJA, peso=900, maiusc=True, espacar=1.6)
    tb, tf = caixa(sl, 96, 178, 1000, 100)
    escrever(tf, s['titulo'], tam=56, cor=BRANCO, peso=900)
    icone(sl, 'link', 96, 290, 48, fundo=LARANJA)
    rotulo(sl, 162, 300, 1000, s['url'], tam=24, cor=BRANCO, peso=700, fonte=MONO)
    if s.get('nota'):
        tb, tf = caixa(sl, 96, 372, 900, 80)
        escrever(tf, s['nota'], tam=19, cor=RGBColor(0xE2, 0xDE, 0xF5), peso=300, entre=1.45)
    y = 380
    gap = 20
    passos = s.get('passos') or []
    w = (1088 - gap * (len(passos) - 1)) / max(1, len(passos))
    for k, (ic, t) in enumerate(passos):
        x = 96 + k * (w + gap)
        retangulo(sl, x, y, w, 150, preencher=RGBColor(0x2A, 0x12, 0x9E), raio=12)
        icone(sl, ic, x + 18, y + 18, 40, fundo=RGBColor(0x46, 0x2E, 0xC0))
        tb, tf = caixa(sl, x + 18, y + 72, w - 36, 70)
        escrever(tf, t, tam=15, cor=BRANCO, peso=400, entre=1.3)
    rodape(sl, s['n'], s['bloco'], True)

MODELOS = {'conteudoImagem': m_conteudo_imagem, 'capturas': m_capturas, 'capa': m_capa, 'secao': m_secao, 'citacao': m_citacao, 'impacto': m_impacto,
           'conteudo': m_conteudo, 'duasColunas': m_duas, 'terminal': m_terminal,
           'codigo': m_codigo, 'diagrama': m_diagrama, 'tabela': m_tabela,
           'agenda': m_agenda, 'linhaTempo': m_linha_tempo, 'cartoes': m_cartoes,
           'problema': m_problema, 'personas': m_personas, 'grade': m_grade, 'numeros': m_numeros,
           'refino': m_refino, 'mosaico': m_mosaico, 'mapa': m_mapa, 'comparacao': m_comparacao,
           'duasIcones': m_duas_icones, 'codigoFluxo': m_codigo_fluxo, 'divisor': m_divisor,
           'capaPitch': m_capa_pitch, 'encerramento': m_encerramento, 'demo': m_demo}

# ---------- montagem ----------

S = json.load(io.open(DADOS, encoding='utf-8'))
prs = Presentation(TEMPLATE)

# tira os 15 slides de exemplo do template, preservando masters, layouts e tema
xml_slides = prs.slides._sldIdLst
for sid in list(xml_slides):
    rid = sid.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
    prs.part.drop_rel(rid)
    xml_slides.remove(sid)

branco = [l for l in prs.slide_masters[0].slide_layouts if l.name == 'Blank'][0]

# propriedades do arquivo, para nao carregar o autor do template
META = 'Time 04: Andreas Grings, Gabriel Tomasi, Guilherme Toebe, Tiago Passos'
prs.core_properties.title = 'App de gerenciamento de convites, Pitch Final'
prs.core_properties.author = META
prs.core_properties.last_modified_by = META
prs.core_properties.subject = 'Arquitetura de Software, Trabalho 4'
prs.core_properties.keywords = ''
prs.core_properties.comments = ''

for s in S:
    sl = prs.slides.add_slide(branco)
    MODELOS[s['modelo']](sl, s)
    if s.get('notas'):
        sl.notes_slide.notes_text_frame.text = s['notas']

prs.save(SAIDA)
print(f'ok: {len(S)} slides em {SAIDA}')
