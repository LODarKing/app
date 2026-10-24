"""Builds the HTML/GSAP overlay for the HyperFrames composition and subtitles/final.srt.
Inputs: documentation/scene_bounds.json (word timings of the final voice).
Outputs: hyperframes/main/index.html, subtitles/final.srt, documentation/SUBTITLE_CUES.json
"""
import json, re, base64, html, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC = json.load(open(f'{ROOT}/documentation/scene_bounds.json'))
DUR = 180.0

# ---------------------------------------------------------------- subtitles
KEY = ['inclusão', 'inclusivo', 'barreira', 'barreiras', 'deficiência', 'deficiências', 'incapaz', 'acessibilidade', 'participação', 'participar', 'participe',
       'direitos', 'CIF', 'ONU', 'Organização', 'Mundial', 'Saúde', 'discriminação', 'Discriminação', 'bullying', 'respeitar', 'respeito', '1999', 'Convenção',
       'Jesus', 'João', '5', '38', 'sábado', 'Davi', 'Mefibosete', 'Jônatas', 'Segunda', 'Samuel', '9', 'Helen', 'Keller', 'educação', 'Lei', 'Brasileira',
       'Inclusão', 'Clube', 'Desbravadores', 'mudança', 'dignidade', 'diferenças', 'combatido', 'exclusão', 'oportunidades', 'igualdade', 'Américas']
MAXC = 28          # chars per line
def norm(w): return re.sub(r'[^\wÀ-ÿ]', '', w)

def cues_for(words):
    """Sentence-aware, balanced chunking: each sentence becomes the fewest chunks of at
    most ~2 lines, with split points chosen to balance length and prefer commas."""
    sents, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        if w['w'][-1] in '.?!' or (nxt and nxt['s'] - w['e'] > 0.6) or not nxt:
            sents.append(cur); cur = []
    out = []
    L = lambda ws: len(' '.join(x['w'] for x in ws))
    for sw in sents:
        n = max(1, -(-L(sw) // (2 * MAXC - 4)))
        if n == 1: out.append(sw); continue
        # dynamic programming over split points
        N = len(sw); target = L(sw) / n
        best = {(0, 0): (0, [])}
        for k in range(1, n + 1):
            for j in range(1, N + 1):
                cands = []
                for i0 in range(0, j):
                    if (i0, k - 1) not in best: continue
                    seg = sw[i0:j]; ln = L(seg)
                    if ln > 2 * MAXC + 4 and j - i0 > 1: continue
                    pen = abs(ln - target) + (0 if sw[j - 1]['w'][-1] in ',.:?!' else 8) + (40 if j - i0 <= 2 and N > 4 else 0)
                    cands.append((best[(i0, k - 1)][0] + pen, best[(i0, k - 1)][1] + [j]))
                if cands: best[(j, k)] = min(cands)
        cuts = best.get((N, n), (0, [N]))[1]
        p0 = 0
        for c in cuts: out.append(sw[p0:c]); p0 = c
    return out

def split_lines(ws):
    text = ' '.join(x['w'] for x in ws)
    if len(text) <= MAXC: return [ws]
    best, bi = 1e9, 1
    for i in range(1, len(ws)):
        a = ' '.join(x['w'] for x in ws[:i]); b = ' '.join(x['w'] for x in ws[i:])
        score = abs(len(a) - len(b)) + (0 if ws[i - 1]['w'][-1] in ',.' else 6) + (80 if max(len(a), len(b)) > MAXC + 1 else 0)
        if score < best: best, bi = score, i
    return [ws[:bi], ws[bi:]]

cues = []
for s in SC:
    for c in cues_for(s['words']):
        cues.append(dict(s=round(c[0]['s'] - 0.05, 3), e=round(c[-1]['e'] + 0.12, 3), lines=[[x['w'] for x in ln] for ln in split_lines(c)]))
# merge cues that would be too short to read (< 0.8 s) into their neighbour
merged = []
for c in cues:
    if merged and (c['e'] - c['s'] < 0.8 or merged[-1]['e'] - merged[-1]['s'] < 0.8) and sum(len(' '.join(l)) for l in merged[-1]['lines'] + c['lines']) <= 2 * MAXC + 4 and c['s'] - merged[-1]['e'] < 0.5:
        allw = [w for l in merged[-1]['lines'] for w in l] + [w for l in c['lines'] for w in l]
        merged[-1]['e'] = c['e']
        merged[-1]['lines'] = [[x['w'] for x in ln] for ln in split_lines([dict(w=w) for w in allw])]
    else: merged.append(c)
cues = merged
# timing hygiene: min 0.9 s on screen, no overlaps, small gaps closed
for i, c in enumerate(cues):
    if c['e'] - c['s'] < 0.9: c['e'] = c['s'] + 0.9
    if i + 1 < len(cues):
        n = cues[i + 1]
        if c['e'] > n['s'] - 0.02: c['e'] = n['s'] - 0.02
        elif n['s'] - c['e'] < 0.35: c['e'] = n['s'] - 0.02
cues[-1]['e'] = min(cues[-1]['e'] + 0.4, 178.6)
json.dump(cues, open(f'{ROOT}/documentation/SUBTITLE_CUES.json', 'w'), ensure_ascii=False, indent=1)

def ts(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'
with open(f'{ROOT}/subtitles/final.srt', 'w') as f:
    for i, c in enumerate(cues, 1):
        f.write(f"{i}\n{ts(c['s'])} --> {ts(c['e'])}\n" + '\n'.join(' '.join(l) for l in c['lines']) + '\n\n')

def cue_html(c):
    out = []
    for ln in c['lines']:
        ws = []
        for w in ln:
            k = norm(w) in KEY
            ws.append(f'<span class="k">{html.escape(w)}</span>' if k else html.escape(w))
        out.append(' '.join(ws))
    return '<br>'.join(out)

# ---------------------------------------------------------------- titles & chips
S = [s['start'] for s in SC]
def A(i, t): return round(S[i - 1] + t, 3)
# kind: title (big, top), chip (pill), big (centre display), label (small near an object)
T = []
def add(kind, text, t0, t1, x=540, y=200, size=None, color=None, cls=''):
    T.append(dict(kind=kind, text=text, t0=t0, t1=t1, x=x, y=y, size=size, color=color, cls=cls))

add('title', 'E SE FOSSE <em>VOCÊ?</em>', A(1, 0.25), A(1, 4.7), y=230)
add('title', 'INCLUSÃO É <em>PARA TODOS!</em>', A(1, 9.0), A(1, 12.95), y=230)
add('chip', 'DEFICIÊNCIA ≠ INCAPACIDADE', A(2, 0.9), A(2, 3.3), y=230)
add('label', 'PESSOA', A(2, 3.9), A(2, 6.5), x=150, y=760)
add('label', 'PARTICIPAÇÃO', A(2, 4.1), A(2, 9.3), x=905, y=640)
add('label', 'BARREIRA', A(2, 6.6), A(2, 7.35), x=575, y=700, cls='red')
add('label', 'ACESSIBILIDADE', A(2, 7.6), A(2, 9.3), x=560, y=870)
add('chip', 'OMS • <b>CIF</b>', A(2, 10.3), A(2, 15.3), y=150)
add('big', 'CIF', A(2, 10.45), A(2, 15.3), x=540, y=868, size=60, color='#211C55')
add('label', 'SAÚDE', A(2, 12.85), A(2, 15.3), x=540, y=262)
add('label', 'AMBIENTE', A(2, 13.75), A(2, 15.3), x=204, y=1262)
add('label', 'PARTICIPAÇÃO', A(2, 14.65), A(2, 15.3), x=876, y=1262)
add('chip', 'CONVENÇÃO DA ONU <b>(2006)</b>', A(2, 15.6), A(2, 20.5), y=230)
add('title', 'ACESSIBILIDADE • PARTICIPAÇÃO • <em>DIREITOS</em>', A(2, 18.6), A(2, 20.55), y=380, size=50)
for (w, t0, t1) in [('FÍSICA', 2.05, 2.95), ('VISUAL', 2.98, 3.85), ('AUDITIVA', 3.88, 4.85), ('INTELECTUAL', 4.88, 5.85), ('MÚLTIPLA', 5.88, 6.6)]:
    add('chip', f'DEFICIÊNCIA <b>{w}</b>', A(3, t0), A(3, t1), y=230)
add('chip', 'DEFICIÊNCIAS <b>NÃO VISÍVEIS</b>', A(3, 6.9), A(3, 10.6), y=230)
add('label', 'Cordão de girassol • Lei 14.624/2023', A(3, 8.6), A(3, 10.4), x=540, y=360)
add('title', 'DIFERENTES HABILIDADES.<br><em>MESMOS DIREITOS.</em>', A(3, 14.3), A(3, 17.8), y=250)
add('chip', '<b>DISCRIMINAÇÃO</b>', A(4, 0.3), A(4, 5.8), y=230, cls='warn')
add('label', 'tratamento desigual', A(4, 2.7), A(4, 5.8), x=540, y=330)
add('chip', '<b>BULLYING</b>', A(4, 6.7), A(4, 13.35), y=230, cls='warn')
add('label', 'intencional e repetido', A(4, 8.3), A(4, 13.35), x=540, y=330)
add('chip', '<b>EXCLUSÃO</b>', A(4, 13.45), A(4, 14.4), y=230, cls='warn')
add('chip', '<b>ATAQUES VIRTUAIS</b>', A(4, 14.55), A(4, 15.8), y=230, cls='warn')
add('title', 'RESPEITO <em>NÃO É OPCIONAL!</em>', A(4, 16.1), A(4, 18.35), y=230)
add('big', '1999', A(5, 0.35), A(5, 2.3), x=540, y=1000, size=150, color='#211C55')
add('chip', 'PAÍSES DAS <b>AMÉRICAS</b>', A(5, 2.9), A(5, 4.2), y=230)
add('chip', 'CONVENÇÃO <b>INTERAMERICANA</b>', A(5, 4.35), A(5, 9.5), y=180)
add('label', 'OEA • Guatemala, 7 de junho de 1999', A(5, 4.6), A(5, 9.5), x=540, y=290)
add('label', 'IGUALDADE', A(5, 9.8), A(5, 12.7), x=205, y=1100)
add('label', 'PARTICIPAÇÃO', A(5, 11.0), A(5, 12.7), x=540, y=1100)
add('label', 'RESPEITO', A(5, 12.2), A(5, 12.7), x=875, y=1100)
add('chip', '① CONHEÇA', A(5, 12.85), A(5, 18.85), x=200, y=430, cls='step')
add('chip', '② DEBATA', A(5, 14.9), A(5, 18.85), x=540, y=430, cls='step')
add('chip', '③ RESUMA', A(5, 16.5), A(5, 18.85), x=880, y=430, cls='step')
add('title', 'DIREITOS <em>NÃO SÃO FAVORES.</em>', A(5, 15.4), A(5, 18.85), y=230)
add('big', 'JOÃO 5:1–18', A(6, 0.35), A(6, 1.45), x=540, y=860, size=96, color='#5A2E2A')
add('chip', '<b>JOÃO 5:1–18</b>', A(6, 1.6), A(6, 6.2), y=200)
add('label', '38 anos', A(6, 4.6), A(6, 6.3), x=260, y=700)
add('chip', '<b>SÁBADO</b>', A(6, 12.8), A(6, 14.3), y=200)
add('title', 'OLHAR PARA <em>AS PESSOAS.</em>', A(6, 17.5), A(6, 19.8), y=240)
add('big', '2 SAMUEL 9', A(7, 0.35), A(7, 1.9), x=540, y=900, size=96, color='#5A3A22')
add('chip', '<b>2 SAMUEL 9</b>', A(7, 2.0), A(7, 7.4), y=200)
add('label', 'Lo-Debar', A(7, 4.6), A(7, 7.4), x=540, y=310)
add('title', 'TODOS À <em>MESMA MESA.</em>', A(7, 14.5), A(7, 21.05), y=240)
add('chip', '<b>HELEN KELLER</b> (1880–1968)', A(8, 0.3), A(8, 3.6), y=200)
for i, L in enumerate('WATER'):
    add('letter', L, A(8, 3.95 + i * 0.25), A(8, 5.4), x=int(540 + (-0.75 + i * 0.32 - (-0.1)) * 215), y=int(960 - (3.95 - 2.1) * 220) - 40)
add('label', 'Anne Sullivan • alfabeto manual tátil', A(8, 3.9), A(8, 5.4), x=540, y=330)
add('chip', '<b>ESCRITORA</b>', A(8, 5.5), A(8, 7.2), y=200)
add('chip', 'Radcliffe College, <b>1904</b>', A(8, 7.3), A(8, 9.2), y=200)
add('chip', 'DEFENDEU <b>DIREITOS</b>', A(8, 9.3), A(8, 10.4), y=200)
add('title', 'EDUCAÇÃO <em>TRANSFORMA.</em>', A(8, 10.5), A(8, 14.6), y=240)
add('title', 'LEI BRASILEIRA <em>DE INCLUSÃO</em>', A(9, 0.9), A(9, 9.0), y=170, size=58)
add('chip', 'Lei nº <b>13.146/2015</b>', A(9, 1.5), A(9, 9.0), y=290)
for (w, t0, x, y) in [('DIREITOS', 3.45, 170, 700), ('ACESSIBILIDADE', 4.45, 910, 700), ('EDUCAÇÃO', 5.45, 150, 1270), ('PARTICIPAÇÃO', 6.55, 930, 1270), ('IGUALDADE', 7.65, 540, 1395)]:
    pass  # icon names are spoken; the icons carry the meaning (keeps the subtitle band clear)
add('label', 'RAMPA', A(9, 12.6), A(9, 15.9), x=250, y=420)
add('label', 'LEGENDAS', A(9, 12.9), A(9, 15.9), x=810, y=420)
add('label', 'COMUNICAÇÃO ALTERNATIVA', A(9, 13.2), A(9, 15.9), x=740, y=1268)
add('label', 'INSTRUÇÕES ADAPTADAS', A(9, 13.5), A(9, 15.9), x=300, y=520)
add('title', 'SEU CLUBE <em>É INCLUSIVO?</em>', A(10, 0.3), A(10, 3.0), y=230)
add('chip', '① OBSERVE AS <b>BARREIRAS</b>', A(10, 3.1), A(10, 5.0), y=230, cls='step')
add('chip', '② PROPONHA <b>MELHORIAS</b>', A(10, 5.0), A(10, 6.6), y=230, cls='step')
add('chip', '③ APRESENTE À <b>DIRETORIA</b>', A(10, 6.6), A(10, 8.9), y=230, cls='step')
add('chip', 'TODOS <b>PARTICIPAM</b>', A(10, 9.2), A(10, 14.8), y=230)
add('title', 'EDUCAÇÃO INCLUSIVA', A(10, 15.0), DUR + 1, y=200, size=78, cls='end1')
add('title', '<em>NINGUÉM FICA DE FORA!</em>', A(10, 15.6), DUR + 1, y=330, size=70, cls='end2')
add('chip', 'DESBRAVADORES — <b>INCLUIR É NOSSA MISSÃO.</b>', A(10, 17.75), DUR + 1, y=1450, cls='end3')
add('label', 'Especialidade de Educação Inclusiva • AM-055', A(10, 17.9), DUR + 1, x=540, y=1540)

json.dump(T, open(f'{ROOT}/documentation/OVERLAY_TEXT.json', 'w'), ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- page
def font(name, file):
    b = base64.b64encode(open(f'{ROOT}/assets/generated_assets/fonts/{file}', 'rb').read()).decode()
    return f"@font-face{{font-family:'{name}';src:url(data:font/ttf;base64,{b}) format('truetype');font-display:block;}}"
fonts = font('PoppinsB', 'Poppins-Bold.ttf') + font('PoppinsX', 'Poppins-ExtraBold.ttf') + font('PoppinsK', 'Poppins-Black.ttf')
css = """
html,body{margin:0;background:#211C55}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:#211C55}
#world{position:absolute;left:0;top:0;width:1080px;height:1920px}
#ov{position:absolute;inset:0;pointer-events:none}
.o{position:absolute;transform:translate(-50%,-50%);opacity:0;white-space:nowrap;text-align:center}
.title{font-family:PoppinsK;font-size:66px;line-height:1.08;color:#fff;letter-spacing:.5px;padding:18px 34px 16px;border-radius:28px;background:#211C55;
  box-shadow:0 10px 0 #190C3C,0 18px 40px rgba(0,0,0,.35);white-space:normal;width:max-content;max-width:960px}
.title em{font-style:normal;color:#FFEB00}
.chip{font-family:PoppinsX;font-size:42px;color:#211C55;background:#FFFFFF;padding:12px 30px 10px;border-radius:999px;border:5px solid #211C55;box-shadow:0 6px 0 #190C3C}
.chip b{color:#2851D8;font-weight:normal}
.chip.warn{background:#FFE3E6;border-color:#B3263A;color:#B3263A}.chip.warn b{color:#B3263A}
.chip.step{background:#13B9C5;color:#fff;border-color:#211C55;font-size:36px}.chip.step b{color:#FFEB00}
.chip.end3{font-size:36px;background:#211C55;color:#fff;border-color:#FFEB00}.chip.end3 b{color:#FFEB00}
.label{font-family:PoppinsB;font-size:34px;color:#fff;background:rgba(25,12,60,.82);padding:8px 22px 6px;border-radius:16px}
.label.red{background:#B3263A}
.big{font-family:PoppinsK;color:#211C55}
.letter{font-family:PoppinsK;font-size:64px;color:#FFEB00;-webkit-text-stroke:8px #190C3C;paint-order:stroke fill}
#subs{position:absolute;left:90px;width:810px;top:1372px;height:170px;display:flex;align-items:center;justify-content:center}
.cue{position:absolute;left:0;right:0;text-align:center;opacity:0;font-family:PoppinsB;font-size:50px;line-height:1.22;color:#fff;
  -webkit-text-stroke:10px #190C3C;paint-order:stroke fill;text-shadow:0 4px 10px rgba(0,0,0,.45);white-space:nowrap}
.cue .k{color:#FFEB00}
"""
items = []
for i, t in enumerate(T):
    st = f"left:{t['x']}px;top:{t['y']}px;"
    if t['size']: st += f"font-size:{t['size']}px;"
    if t['color']: st += f"color:{t['color']};"
    items.append(f'<div class="o {t["kind"]} {t["cls"]}" id="t{i}" style="{st}">{t["text"]}</div>')
subs = [f'<div class="cue" id="c{i}" style="font-size:{min(50, int(800 / (0.585 * max(len(" ".join(l)) for l in c["lines"]))))}px">{cue_html(c)}</div>' for i, c in enumerate(cues)]
timing = json.dumps(dict(T=[[t['kind'], t['t0'], t['t1']] for t in T], C=[[c['s'], c['e']] for c in cues]))
page = f"""<!doctype html>
<html data-composition-variables='[{{"id":"subs","type":"string","label":"Legendas (on/off)","default":"on"}}]'>
<head><meta charset="utf-8"><title>Educação Inclusiva — Ninguém Fica de Fora!</title>
<style>{fonts}{css}</style>
<script src="gsap.min.js"></script></head>
<body>
<div id="root" data-composition-id="root" data-width="1080" data-height="1920" data-start="0" data-duration="{DUR}">
<canvas id="world" width="1080" height="1920"></canvas>
<div id="ov">{''.join(items)}<div id="subs">{''.join(subs)}</div></div>
</div>
<script src="world.js"></script>
<script>
(function(){{
  const D = {timing};
  const vars = (window.__hyperframes && window.__hyperframes.getVariables) ? window.__hyperframes.getVariables() : {{}};
  if ((vars.subs || 'on') === 'off') document.getElementById('subs').style.display = 'none';
  const tl = gsap.timeline({{ paused: true }});
  D.T.forEach(([kind, t0, t1], i) => {{
    const el = '#t' + i;
    if (kind === 'title') {{
      tl.fromTo(el, {{ opacity: 0, scale: 0.6, y: 30 }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(2.2)' }}, t0);
      if (t1 < {DUR}) tl.to(el, {{ opacity: 0, scale: 0.92, y: -24, duration: 0.3, ease: 'power2.in' }}, t1 - 0.3);
    }} else if (kind === 'big') {{
      tl.fromTo(el, {{ opacity: 0, scale: 1.4 }}, {{ opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' }}, t0);
      tl.to(el, {{ opacity: 0, duration: 0.25 }}, t1 - 0.25);
    }} else if (kind === 'letter') {{
      tl.fromTo(el, {{ opacity: 0, scale: 0.2, y: 20 }}, {{ opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(3)' }}, t0);
      tl.to(el, {{ opacity: 0, duration: 0.2 }}, t1 - 0.2);
    }} else {{
      tl.fromTo(el, {{ opacity: 0, scale: 0.7 }}, {{ opacity: 1, scale: 1, duration: 0.32, ease: 'back.out(2)' }}, t0);
      if (t1 < {DUR}) tl.to(el, {{ opacity: 0, scale: 0.9, duration: 0.22, ease: 'power2.in' }}, t1 - 0.22);
    }}
  }});
  D.C.forEach(([s, e], i) => {{ tl.set('#c' + i, {{ opacity: 1 }}, s); tl.set('#c' + i, {{ opacity: 0 }}, e); }});
  tl.set({{}}, {{}}, {DUR});
  window.__timelines = window.__timelines || {{}};
  window.__timelines['root'] = tl;
}})();
</script>
</body></html>"""
open(f'{ROOT}/hyperframes/main/index.html', 'w').write(page)
print('cues', len(cues), 'overlay items', len(T))
for c in cues[:6]: print(c)
