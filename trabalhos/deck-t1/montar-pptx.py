# Monta o .pptx do seminario T1 a partir do template institucional da Unisinos,
# reaproveitando o mesmo conteudo dos artboards (slides.json).
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

def linha(sl, x1, y1, x2, y2, cor=CINZA_CLARO, largura=1):
    from pptx.enum.shapes import MSO_CONNECTOR
    c = sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, px(x1), px(y1), px(x2), px(y2))
    c.line.color.rgb = cor; c.line.width = Pt(largura)
    return c

def rotulo(sl, x, y, w, texto, *, tam=12, cor=CINZA, peso=400, alinhar=PP_ALIGN.LEFT, fonte=FONTE, maiusc=False, espacar=None):
    tb, tf = caixa(sl, x, y, w, tam * 1.6, alinhar=alinhar)
    escrever(tf, texto, tam=tam, cor=cor, peso=peso, entre=1.2, fonte=fonte, maiusc=maiusc, espacar=espacar)
    return tb

# ---------- pecas comuns ----------

def fundo(sl, cor):
    sl.background.fill.solid()
    sl.background.fill.fore_color.rgb = cor

def cartola(sl, texto, cor=LARANJA, y=66):
    rotulo(sl, 72, y, 1136, texto, tam=13, cor=cor, peso=900, maiusc=True, espacar=1.6)

def titulo_claro(sl, texto, tam=40, y=88, w=1000, cor=AZUL):
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
        rotulo(sl, x, cursor + 1, 26, '//', tam=tam * 0.92, cor=LARANJA, peso=900)
        tb, tf = caixa(sl, x + 30, cursor, w - 30, 10)
        escrever(tf, it, tam=tam, cor=cor, peso=300, entre=1.3)
        alt = altura_estimada(it, tam, w - 30)
        cursor += alt + gap
    return cursor

def altura_estimada(html, tam, largura):
    texto = re.sub(r'<[^>]+>', '', html or '')
    por_linha = max(1, int(largura / (tam * 0.50)))
    linhas = max(1, -(-len(texto) // por_linha))
    return linhas * tam * 1.32

def nota_lateral(sl, x, y, w, titulo, texto):
    retangulo(sl, x, y, 3, 92, preencher=LARANJA)
    rotulo(sl, x + 17, y, w - 17, titulo, tam=11, cor=LARANJA, peso=900, maiusc=True, espacar=1.2)
    tb, tf = caixa(sl, x + 17, y + 22, w - 17, 240)
    escrever(tf, texto, tam=15, cor=CINZA, peso=300, entre=1.35, espaco=8)

# ---------- diagramas nativos ----------

def dg_camadas(sl, x, y):
    dados = [(216, '#F0F0F5', 'camada base (debian, alpine)', GRAFITE, False),
             (164, '#F0F0F5', 'dependências', GRAFITE, False),
             (112, '#F0F0F5', 'código da aplicação', GRAFITE, False)]
    rotulo(sl, x, y, 460, 'SOMENTE LEITURA, ENDEREÇADAS POR DIGEST', tam=11, cor=CINZA, peso=900, espacar=1.6)
    for topo, _, txt, cor, _ in dados:
        retangulo(sl, x, y + topo - 40, 360, 46, preencher=QUASE, borda=CINZA_CLARO, raio=4)
        rotulo(sl, x + 20, y + topo - 40 + 14, 320, txt, tam=14, cor=cor, peso=300)
    retangulo(sl, x, y + 14, 360, 52, preencher=RGBColor(0xFD, 0xEA, 0xE3), borda=LARANJA, raio=4, tracejado=True)
    rotulo(sl, x + 20, y + 24, 320, 'camada de escrita', tam=14, cor=LARANJA, peso=900)
    rotulo(sl, x + 20, y + 43, 320, 'criada pelo container, morre com ele', tam=12, cor=CINZA, peso=300)
    linha(sl, x + 400, y + 20, x + 400, y + 218, CINZA_CLARO)
    for dy, tit, corpo in [(56, 'copy-up', 'alterar um byte de um arquivo grande copia o arquivo inteiro para cima'),
                           (144, 'whiteout', 'apagar cria uma marcação, o arquivo continua na camada de baixo')]:
        rotulo(sl, x + 440, y + dy, 380, tit, tam=15, cor=AZUL, peso=900)
        tb, tf = caixa(sl, x + 440, y + dy + 26, 390, 70)
        escrever(tf, corpo, tam=13.5, cor=GRAFITE, peso=300, entre=1.4)

def dg_pilha(sl, x, y):
    caixas = [('docker CLI', 'cliente', AZUL), ('dockerd', 'daemon, roda como root', AZUL),
              ('containerd', 'ciclo de vida', AZUL), ('shim', 'um por container', LARANJA),
              ('runc', 'cria e sai', LARANJA)]
    larg, gap = 186, 34
    for i, (nome, sub, cor) in enumerate(caixas):
        cx = x + i * (larg + gap)
        retangulo(sl, cx, y + 46, larg, 66, preencher=cor, raio=5)
        rotulo(sl, cx, y + 58, larg, nome, tam=15, cor=BRANCO, peso=900, alinhar=PP_ALIGN.CENTER)
        rotulo(sl, cx + 6, y + 80, larg - 12, sub, tam=11.5, cor=BRANCO, peso=300, alinhar=PP_ALIGN.CENTER)
        if i:
            linha(sl, cx - gap, y + 79, cx, y + 79, CINZA, 1.5)
    rotulo(sl, x + 2 * (larg + gap) - 40, y + 22, 90, 'gRPC', tam=11.5, cor=CINZA)
    tb, tf = caixa(sl, x, y + 136, 1040, 90)
    escrever(tf, 'O shim é pai do container e não filho do daemon. Foi esse desenho que fez reiniciar o daemon deixar de matar os containers em execução.', tam=13.5, cor=GRAFITE, peso=300, entre=1.45)
    tb2, tf2 = caixa(sl, x, y + 182, 1040, 60)
    escrever(tf2, 'O runc cria os namespaces, configura cgroups, aplica capabilities e seccomp, faz pivot_root, dá execve e sai.', tam=13.5, cor=GRAFITE, peso=300, entre=1.45)

def dg_uml(sl, x, y):
    retangulo(sl, x, y, 400, 240, borda=AZUL, largura=2)
    rotulo(sl, x + 20, y + 16, 360, '«device»', tam=12, cor=AZUL, peso=900, espacar=1.4)
    rotulo(sl, x + 20, y + 36, 360, 'Host de desenvolvimento', tam=19, cor=AZUL, peso=900)
    retangulo(sl, x + 32, y + 74, 336, 146, borda=LARANJA, largura=2)
    rotulo(sl, x + 52, y + 88, 300, '«executionEnvironment»', tam=12, cor=LARANJA, peso=900, espacar=1.2)
    rotulo(sl, x + 52, y + 110, 300, 'Container', tam=17, cor=LARANJA, peso=900)
    retangulo(sl, x + 64, y + 144, 272, 58, preencher=QUASE, borda=CINZA, raio=3)
    rotulo(sl, x + 84, y + 156, 240, '«artifact»', tam=11.5, cor=CINZA, peso=900, espacar=1.2)
    rotulo(sl, x + 84, y + 176, 240, 'imagem (tag + digest)', tam=15, cor=GRAFITE, peso=400)
    tb, tf = caixa(sl, x + 450, y + 20, 420, 90)
    escrever(tf, 'Ambiente de execução é<br>uma especialização de nó.', tam=17, cor=AZUL, peso=900, entre=1.28)
    tb2, tf2 = caixa(sl, x + 450, y + 90, 430, 110)
    escrever(tf2, 'Por isso nunca dizer que container não é nó. O modelo fiel é o container aninhado no host, com a imagem implantada dentro dele.', tam=14.5, cor=GRAFITE, peso=300, entre=1.5)
    linha(sl, x + 450, y + 172, x + 880, y + 172, CINZA_CLARO)
    tb3, tf3 = caixa(sl, x + 450, y + 188, 430, 80)
    escrever(tf3, 'Máquina virtual, essa sim, é um nó novo, com sistema operacional próprio.', tam=14.5, cor=GRAFITE, peso=300, entre=1.5)

def dg_tiers(sl, x, y):
    rotulo(sl, x, y, 1050, 'AS TRÊS CAMADAS LÓGICAS FICAM SEMPRE NA MESMA IMAGEM. O QUE MUDA É ONDE FRONT E BANCO RODAM.',
           tam=12, cor=CINZA, peso=900, espacar=1.4)
    def camadas(cx, cy, larg, tam):
        retangulo(sl, cx, cy, larg, 70, preencher=BRANCO, borda=AZUL, raio=3)
        for k, nome in enumerate(['Apresentação e API', 'Domínio', 'Dados']):
            rotulo(sl, cx + 4, cy + 12 + k * 20, larg - 8, nome, tam=tam, cor=AZUL, peso=400, alinhar=PP_ALIGN.CENTER)
    # 1 tier
    retangulo(sl, x, y + 26, 286, 158, preencher=RGBColor(0xEE, 0xEB, 0xF7), borda=AZUL, raio=5, tracejado=True)
    retangulo(sl, x + 16, y + 42, 254, 26, preencher=BRANCO, borda=CINZA_CLARO, raio=3)
    rotulo(sl, x + 16, y + 48, 254, 'front', tam=13, cor=GRAFITE, peso=300, alinhar=PP_ALIGN.CENTER)
    camadas(x + 16, y + 74, 254, 12)
    retangulo(sl, x + 16, y + 150, 254, 26, preencher=BRANCO, borda=CINZA_CLARO, raio=3)
    rotulo(sl, x + 16, y + 156, 254, 'banco', tam=13, cor=GRAFITE, peso=300, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, x, y + 196, 286, '1 tier', tam=15, cor=AZUL, peso=900, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, x, y + 218, 286, 'tudo num processo só', tam=13, cor=CINZA, peso=300, alinhar=PP_ALIGN.CENTER)
    # 2 tiers
    b = x + 347
    retangulo(sl, b, y + 26, 120, 158, preencher=RGBColor(0xEE, 0xEB, 0xF7), borda=AZUL, raio=5, tracejado=True)
    retangulo(sl, b + 14, y + 42, 92, 26, preencher=BRANCO, borda=CINZA_CLARO, raio=3)
    rotulo(sl, b + 14, y + 48, 92, 'front', tam=13, cor=GRAFITE, peso=300, alinhar=PP_ALIGN.CENTER)
    retangulo(sl, b + 140, y + 26, 146, 158, preencher=RGBColor(0xEE, 0xEB, 0xF7), borda=AZUL, raio=5, tracejado=True)
    camadas(b + 154, y + 74, 118, 11.5)
    retangulo(sl, b + 154, y + 150, 118, 26, preencher=BRANCO, borda=CINZA_CLARO, raio=3)
    rotulo(sl, b + 154, y + 156, 118, 'banco', tam=12, cor=GRAFITE, peso=300, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, b, y + 196, 286, '2 tiers', tam=15, cor=AZUL, peso=900, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, b, y + 218, 286, 'front separado', tam=13, cor=CINZA, peso=300, alinhar=PP_ALIGN.CENTER)
    # 3 tiers
    c = x + 694
    retangulo(sl, c, y + 26, 88, 158, preencher=RGBColor(0xFD, 0xEA, 0xE3), borda=LARANJA, raio=5, tracejado=True)
    retangulo(sl, c + 12, y + 42, 64, 26, preencher=BRANCO, borda=CINZA_CLARO, raio=3)
    rotulo(sl, c + 12, y + 48, 64, 'front', tam=12, cor=GRAFITE, peso=300, alinhar=PP_ALIGN.CENTER)
    retangulo(sl, c + 100, y + 26, 98, 158, preencher=RGBColor(0xFD, 0xEA, 0xE3), borda=LARANJA, raio=5, tracejado=True)
    camadas(c + 110, y + 74, 78, 11)
    retangulo(sl, c + 210, y + 26, 88, 158, preencher=RGBColor(0xFD, 0xEA, 0xE3), borda=LARANJA, raio=5, tracejado=True)
    retangulo(sl, c + 222, y + 42, 64, 26, preencher=BRANCO, borda=CINZA_CLARO, raio=3)
    rotulo(sl, c + 222, y + 48, 64, 'banco', tam=12, cor=GRAFITE, peso=300, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, c, y + 196, 298, '3 tiers', tam=15, cor=LARANJA, peso=900, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, c, y + 218, 298, 'banco isolado', tam=13, cor=CINZA, peso=300, alinhar=PP_ALIGN.CENTER)

def dg_dois(sl, x, y):
    rotulo(sl, x, y, 400, 'RASCUNHO #59, DIAGRAMA DE COMPONENTES', tam=11, cor=AZUL, peso=900, espacar=1.4)
    retangulo(sl, x, y + 18, 400, 196, borda=CINZA_CLARO)
    for cx, nome in [(x + 28, 'Convite público'), (x + 222, 'Painel')]:
        retangulo(sl, cx, y + 44, 150, 48, preencher=AZUL, raio=3)
        rotulo(sl, cx, y + 60, 150, nome, tam=13, cor=BRANCO, peso=400, alinhar=PP_ALIGN.CENTER)
    retangulo(sl, x + 125, y + 114, 150, 44, preencher=AZUL, raio=3)
    rotulo(sl, x + 125, y + 128, 150, 'API', tam=13, cor=BRANCO, peso=400, alinhar=PP_ALIGN.CENTER)
    retangulo(sl, x + 125, y + 172, 150, 30, preencher=CINZA, raio=3)
    rotulo(sl, x + 125, y + 179, 150, 'Dados', tam=12, cor=BRANCO, peso=400, alinhar=PP_ALIGN.CENTER)
    linha(sl, x + 103, y + 92, x + 180, y + 114, CINZA, 1.4)
    linha(sl, x + 297, y + 92, x + 220, y + 114, CINZA, 1.4)
    linha(sl, x + 200, y + 158, x + 200, y + 172, CINZA, 1.4)
    linha(sl, x + 420, y + 114, x + 520, y + 114, LARANJA, 2)
    rotulo(sl, x + 428, y + 92, 60, '#72', tam=12, cor=LARANJA, peso=900)
    rotulo(sl, x + 560, y, 420, 'RASCUNHO #60, DIAGRAMA DE IMPLANTAÇÃO', tam=11, cor=LARANJA, peso=900, espacar=1.4)
    retangulo(sl, x + 560, y + 18, 400, 196, borda=LARANJA, largura=2)
    rotulo(sl, x + 580, y + 30, 200, '«device» host', tam=11, cor=LARANJA, peso=900)
    for i, nome in enumerate(['front', 'API', 'banco']):
        cx = x + 580 + i * 124
        retangulo(sl, cx, y + 54, 112, 52, borda=AZUL, largura=1.5)
        rotulo(sl, cx + 2, y + 62, 108, '«executionEnv»', tam=11.5, cor=AZUL, peso=900, alinhar=PP_ALIGN.CENTER)
        rotulo(sl, cx + 2, y + 80, 108, nome, tam=11, cor=GRAFITE, peso=300, alinhar=PP_ALIGN.CENTER)
        if i:
            linha(sl, cx - 12, y + 80, cx, y + 80, LARANJA, 1.6)
    retangulo(sl, x + 580, y + 130, 360, 34, preencher=RGBColor(0xFD, 0xEA, 0xE3), borda=LARANJA, raio=3, tracejado=True)
    rotulo(sl, x + 580, y + 140, 360, 'rede nomeada, resolução por nome de serviço  ·  #75', tam=12, cor=LARANJA, peso=400, alinhar=PP_ALIGN.CENTER)
    rotulo(sl, x + 580, y + 182, 380, '#71 nós  ·  #73 imagem por tag e digest  ·  #74, #76 e #77 são passos de processo', tam=11.5, cor=CINZA, peso=300)

DIAGRAMAS = {'svgCamadas': dg_camadas, 'svgPilha': dg_pilha, 'svgUml': dg_uml,
             'svgTiers': dg_tiers, 'svgDois': dg_dois}

# ---------- modelos ----------

def m_capa(sl, s):
    fundo(sl, AZUL)
    retangulo(sl, 880, 40, 420, 420, preencher=RGBColor(0x33, 0x14, 0xA8), raio=210)
    retangulo(sl, 72, 62, 132, 28, borda=RGBColor(0x8A, 0x7A, 0xC8), tracejado=True)
    rotulo(sl, 72, 70, 132, 'LOGO UNISINOS', tam=10, cor=RGBColor(0xB5, 0xAA, 0xE0), alinhar=PP_ALIGN.CENTER, espacar=1.4)
    rotulo(sl, 72, 200, 700, s['cartola'], tam=13, cor=LARANJA, peso=900, maiusc=True, espacar=1.6)
    tb, tf = caixa(sl, 72, 224, 780, 200)
    escrever(tf, s['titulo'], tam=70, cor=BRANCO, peso=900, entre=1.02)
    retangulo(sl, 72, 404, 64, 5, preencher=LARANJA, raio=2)
    tb2, tf2 = caixa(sl, 72, 432, 660, 90)
    escrever(tf2, s['sub'], tam=21, cor=RGBColor(0xD6, 0xCF, 0xF0), peso=300, entre=1.45)
    for i, (rot, val) in enumerate([('EQUIPE', s['equipe']), ('DISCIPLINA', s['disciplina']), ('DATA', s['data'])]):
        cx = 72 + i * 300
        rotulo(sl, cx, 566, 280, rot, tam=10, cor=RGBColor(0x9C, 0x90, 0xD4), espacar=1.4)
        tb3, tf3 = caixa(sl, cx, 586, 280, 70)
        escrever(tf3, val, tam=13, cor=RGBColor(0xE0, 0xDB, 0xF2), peso=400, entre=1.4)

def m_secao(sl, s):
    fundo(sl, AZUL)
    retangulo(sl, 0, 0, 10, 720, preencher=LARANJA)
    rotulo(sl, 92, 128, 400, s['num'], tam=130, cor=RGBColor(0x4B, 0x36, 0xB4), peso=900)
    rotulo(sl, 96, 300, 700, s['cartola'], tam=13, cor=LARANJA, peso=900, maiusc=True, espacar=1.6)
    tb, tf = caixa(sl, 96, 326, 860, 150)
    escrever(tf, s['titulo'], tam=54, cor=BRANCO, peso=900, entre=1.05)
    tb2, tf2 = caixa(sl, 96, 470, 720, 110)
    escrever(tf2, s['sub'], tam=19, cor=RGBColor(0xC4, 0xBB, 0xEA), peso=300, entre=1.45)
    rodape(sl, s['n'], s['bloco'], True)

def m_citacao(sl, s):
    fundo(sl, AZUL)
    rotulo(sl, 130, 152, 100, '“', tam=70, cor=LARANJA, peso=900)
    tb, tf = caixa(sl, 130, 216, 1000, 260)
    escrever(tf, s['texto'], tam=s.get('tam', 40), cor=BRANCO, peso=300, entre=1.34)
    retangulo(sl, 130, 484, 64, 5, preencher=LARANJA, raio=2)
    rotulo(sl, 130, 508, 900, s['fonte'], tam=15, cor=RGBColor(0xB8, 0xAE, 0xE4), peso=300)
    rodape(sl, s['n'], s['bloco'], True)

def m_impacto(sl, s):
    fundo(sl, AZUL)
    rotulo(sl, 96, 168, 900, s['cartola'], tam=13, cor=LARANJA, peso=900, maiusc=True, espacar=1.6)
    tb, tf = caixa(sl, 96, 196, 1020, 200)
    escrever(tf, s['titulo'], tam=s.get('tam', 52), cor=BRANCO, peso=900, entre=1.06)
    if s.get('sub'):
        tb2, tf2 = caixa(sl, 96, 430, 900, 160)
        escrever(tf2, s['sub'], tam=19, cor=RGBColor(0xC9, 0xC1, 0xEC), peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'], True)

def cabeca(sl, s):
    fundo(sl, BRANCO)
    cartola(sl, s['cartola'])
    titulo_claro(sl, s['titulo'], tam=s.get('tam', 40))

def m_conteudo(sl, s):
    cabeca(sl, s)
    largura = 1208 - (s.get('right', 320)) - 72
    itens(sl, s['itens'], 72, s.get('top', 210), largura + 30)
    if s.get('nota'):
        nota_lateral(sl, 1208 - s.get('notaW', 250), 210, s.get('notaW', 250), s.get('notaTitulo', 'ATENÇÃO'), s['nota'])
    rodape(sl, s['n'], s['bloco'])

def m_duas(sl, s):
    cabeca(sl, s)
    corA = LARANJA if s.get('corA') == '#E94D1C' else AZUL
    corB = AZUL if s.get('corB') == '#21049A' else LARANJA
    for i, (tit, lst, cor) in enumerate([(s['tituloA'], s['itensA'], corA), (s['tituloB'], s['itensB'], corB)]):
        cx = 72 + i * 596
        rotulo(sl, cx, 214, 540, tit, tam=12, cor=cor, peso=900, maiusc=True, espacar=1.2)
        retangulo(sl, cx, 236, 44, 3, preencher=cor)
        itens(sl, lst, cx, 256, 540, tam=17, gap=11)
    rodape(sl, s['n'], s['bloco'])

def m_terminal(sl, s):
    cabeca(sl, s)
    alt = 46 + len(s['linhas']) * 25 + 24
    retangulo(sl, 72, 206, 1136, alt, preencher=ESCURO, raio=8)
    retangulo(sl, 100, 228, 34, 3, preencher=LARANJA, raio=2)
    rotulo(sl, 144, 222, 200, 'TERMINAL', tam=11, cor=RGBColor(0x8A, 0x8A, 0x9A), espacar=1.4)
    for i, l in enumerate(s['linhas']):
        cor = RGBColor(0x7F, 0xE3, 0xA1) if l.startswith('$') else (RGBColor(0x8A, 0x8A, 0x9A) if l.startswith('#') else RGBColor(0xE4, 0xE4, 0xEC))
        rotulo(sl, 100, 258 + i * 25, 1080, l if l.strip() else ' ', tam=15, cor=cor, fonte=MONO)
    tb, tf = caixa(sl, 72, 206 + alt + 22, 1136, 70)
    escrever(tf, s['captura'], tam=12.5, cor=CINZA, peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'])

def m_codigo(sl, s):
    cabeca(sl, s)
    larg = s.get('larguraCod', 640)
    alt = 44 + len(s['linhas']) * 26
    retangulo(sl, 72, 206, larg, alt, preencher=QUASE, borda=CINZA_CLARO, raio=8)
    for i, l in enumerate(s['linhas']):
        cor = CINZA if l.strip().startswith('#') else GRAFITE
        rotulo(sl, 98, 228 + i * 26, larg - 40, l if l.strip() else ' ', tam=14, cor=cor, fonte=MONO)
    itens(sl, s['itens'], 72 + larg + 48, 206, 1208 - (72 + larg + 48), tam=17, gap=12)
    rodape(sl, s['n'], s['bloco'])

def m_diagrama(sl, s):
    cabeca(sl, s)
    DIAGRAMAS[s['svgNome']](sl, 90, s.get('topSvg', 200))
    if s.get('legenda'):
        tb, tf = caixa(sl, 72, 596, 1136, 60)
        escrever(tf, s['legenda'], tam=16, cor=CINZA, peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'])

def m_tabela(sl, s):
    cabeca(sl, s)
    xs = [72, 320, 700]
    ws = [230, 360, 500]
    for i, c in enumerate(s['cabecalhos']):
        rotulo(sl, xs[i], 210, ws[i], c, tam=11, cor=AZUL, peso=900, maiusc=True, espacar=1.2)
    retangulo(sl, 72, 234, 1136, 2, preencher=AZUL)
    y = 250
    for lin in s['linhas']:
        alto = 0
        for i, c in enumerate(lin):
            tb, tf = caixa(sl, xs[i], y, ws[i] - 18, 80)
            escrever(tf, c, tam=17 if i == 0 else 16, cor=AZUL if i == 0 else GRAFITE, peso=400 if i == 0 else 300, entre=1.35)
            alto = max(alto, altura_estimada(c, 16, ws[i] - 18))
        y += alto + 26
        retangulo(sl, 72, y - 13, 1136, 1, preencher=RGBColor(0xED, 0xED, 0xF2))
    rodape(sl, s['n'], s['bloco'])

def m_agenda(sl, s):
    cabeca(sl, s)
    y = 216
    for k, it in enumerate(s['itens']):
        rotulo(sl, 72, y + 4, 60, f'{k+1:02d}', tam=15, cor=LARANJA, peso=900)
        rotulo(sl, 132, y, 760, it['t'], tam=21, cor=GRAFITE, peso=400)
        if it['d']:
            rotulo(sl, 950, y + 3, 258, it['d'], tam=14, cor=CINZA, peso=300, alinhar=PP_ALIGN.RIGHT)
        y += 38
        retangulo(sl, 72, y, 1136, 1, preencher=RGBColor(0xED, 0xED, 0xF2))
        y += 18
    tb, tf = caixa(sl, 72, 596, 1136, 60)
    escrever(tf, s['nota'], tam=15, cor=CINZA, peso=300, entre=1.5)
    rodape(sl, s['n'], s['bloco'])

def m_linha_tempo(sl, s):
    cabeca(sl, s)
    marcos = s['marcos']
    largura = 1136 / len(marcos)
    retangulo(sl, 72, 284, 1136, 3, preencher=CINZA_CLARO)
    for i, m in enumerate(marcos):
        cx = 72 + i * largura
        cor = LARANJA if i >= len(marcos) - 3 else AZUL
        retangulo(sl, cx + largura / 2 - 7, 278, 14, 14, preencher=cor, raio=7)
        rotulo(sl, cx, 306, largura, m['ano'], tam=19, cor=AZUL, peso=900, alinhar=PP_ALIGN.CENTER)
        tb, tf = caixa(sl, cx + 6, 332, largura - 12, 90, alinhar=PP_ALIGN.CENTER)
        escrever(tf, m['txt'], tam=13, cor=CINZA, peso=300, entre=1.35)
        tf.paragraphs[0].alignment = PP_ALIGN.CENTER
    retangulo(sl, 72, 486, 3, 70, preencher=LARANJA)
    tb2, tf2 = caixa(sl, 92, 486, 1100, 80)
    escrever(tf2, s['remate'], tam=19, cor=GRAFITE, peso=300, entre=1.45)
    rodape(sl, s['n'], s['bloco'])

MODELOS = {'capa': m_capa, 'secao': m_secao, 'citacao': m_citacao, 'impacto': m_impacto,
           'conteudo': m_conteudo, 'duasColunas': m_duas, 'terminal': m_terminal,
           'codigo': m_codigo, 'diagrama': m_diagrama, 'tabela': m_tabela,
           'agenda': m_agenda, 'linhaTempo': m_linha_tempo}

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

for s in S:
    sl = prs.slides.add_slide(branco)
    MODELOS[s['modelo']](sl, s)
    if s.get('notas'):
        sl.notes_slide.notes_text_frame.text = s['notas']

prs.save(SAIDA)
print(f'ok: {len(S)} slides em {SAIDA}')
