# Monta a timeline do episódio a partir da voz editada (documentacao/edicao_voz.json):
#  - cada cena dura o mesmo que a sua fala (sem pausas extras entre cenas); a última segura o encerramento;
#  - palavras com tempo global, revisadas (grafia e pontuação conferidas com o roteiro);
#  - blocos de legenda de 2 a 5 palavras e o SRT.
# Saída: timeline.js, entregas/MAPA_E_BUSSOLA_AR021.srt, documentacao/legendas_revisao.txt
import json, os, re

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
E = json.load(open(os.path.join(RAIZ, 'documentacao/edicao_voz.json')))
FPS, HOLD_FINAL = 30, 1.3

# revisão: (take, palavra reconhecida, palavra exibida, ocorrência)
# - grafia: "cardeais", "Norte" com maiúscula (ponto cardeal), "Bússola" no nome da especialidade
# - quase homófonos de baixa confiança do reconhecedor seguem o roteiro ("Num", "aplique", "Com seu", "desenvolver atenção")
# - pontuação de exclamação e dois-pontos do roteiro
FIX = [
    ('MB01', 'instrumentos.', 'instrumentos:', 0), ('MB01', 'Um', 'um', 0), ('MB01', 'bússola.', 'bússola!', 0),
    ('MB02', 'cardiais,', 'cardeais:', 0), ('MB02', 'colaterais,', 'colaterais:', 0),
    ('MB04', 'No', 'Num', 0), ('MB04', 'distância?', 'distância?', 0), ('MB04', 'escala.', 'escala!', 0), ('MB04', 'atenção,', 'atenção:', 0),
    ('MB06', 'azimute,', 'azimute:', 0), ('MB06', 'horário,', 'horário.', 0), ('MB06', '270,', '270.', 0), ('MB06', 'um', 'Um', 1),
    ('MB07', 'importante,', 'importante:', 0), ('MB07', 'norte', 'Norte', 0), ('MB07', 'norte', 'Norte', 0), ('MB07', 'verdadeiro,', 'verdadeiro.', 0), ('MB07', 'essa', 'Essa', 0), ('MB07', 'aplica', 'aplique', 0),
    ('MB08', 'norte.', 'Norte.', 0), ('MB08', 'horizontal', 'horizontal,', 0),
    ('MB09', 'o', None, 1), ('MB09', 'simples,', 'simples.', 0), ('MB09', 'agora', 'Agora', 0), ('MB09', 'prática.', 'prática!', 0),
    ('MB10', 'caminho,', 'caminho.', 0), ('MB10', 'é', 'É', 1), ('MB10', 'a', None, 0), ('MB10', 'bússola.', 'Bússola!', 0),
]
DESTAQUES = ['floresta', 'internet', 'GPS', 'caminhos', 'mapa', 'bússola', 'rosa', 'ventos', 'cardeais', 'colaterais', 'Norte', 'Sul', 'Leste', 'Oeste',
             'Nordeste', 'Sudeste', 'Sudoeste', 'Noroeste', 'oito', 'topográfico', 'relevo', 'curvas', 'nível', 'íngreme', 'escala', '25', 'mil', '250', 'metros',
             'centímetros', '4', '1', 'quilômetro', 'ortofoto', 'corrigida', 'geometricamente', 'azimute', 'horário', '0', '90', '180', '270', '60', 'graus',
             'magnético', 'verdadeiro', 'declinação', 'magnética', 'local', 'data', 'horizontal', 'metais', 'agulha', 'orientada', 'rumo', 'desafio', '10', 'pontos',
             'controle', 'leia', 'determine', 'confira', 'distância', 'encontre', 'prática', 'atenção', 'autonomia', 'responsabilidade', 'segurança', 'Mapa', 'Bússola']

takes = sorted(E)
for tk, de, para, occ in FIX:
    ws = E[tk]['palavras']; n = -1
    for i, w in enumerate(ws):
        if w[0] == de:
            n += 1
            if n == occ:
                if para is None: ws.pop(i)
                else: w[0] = para
                break
    else:
        raise SystemExit(f'revisão não encontrada: {tk} {de} #{occ}')

cenas, palavras, t = [], [], 0.0
for k, tk in enumerate(takes):
    d = E[tk]['duracao_editada_s']
    dur = d + (HOLD_FINAL if k == len(takes) - 1 else 0.0)
    cenas.append({'id': f's{k + 1:02d}', 't0': round(t, 3), 'dur': round(dur, 3), 'voz': f'audio/voz/{tk}.flac', 'voz_dur': d})
    for w, a, b in E[tk]['palavras']:
        palavras.append({'w': w, 't0': round(t + a, 3), 't1': round(t + b, 3), 's': k + 1})
    t += dur
total = round(t, 3)

# blocos de legenda: 2 a 5 palavras, quebra em pontuação; nunca atravessa cena
blocos, cur = [], []
def fecha():
    global cur
    if cur: blocos.append(cur); cur = []
for i, p in enumerate(palavras):
    if cur and palavras[cur[0]]['s'] != p['s']: fecha()
    cur.append(i)
    txt = ' '.join(palavras[j]['w'] for j in cur)
    nxt = palavras[i + 1] if i + 1 < len(palavras) else None
    pont = re.search(r'[.!?:,;]$', p['w'])
    if (pont and len(cur) >= 2) or len(cur) >= 5 or len(txt) >= 24 or (re.search(r'[.!?:]$', p['w'])):
        fecha()
    elif nxt and nxt['s'] != p['s']:
        fecha()
fecha()
# junta blocos de 1 palavra ao vizinho (mesma cena), sem passar de 5 palavras
j = 0
while j < len(blocos):
    b = blocos[j]
    if len(b) == 1:
        prev = blocos[j - 1] if j > 0 and palavras[blocos[j - 1][0]]['s'] == palavras[b[0]]['s'] and len(blocos[j - 1]) < 5 and not re.search(r'[.!?:]$', palavras[blocos[j - 1][-1]]['w']) else None
        nx = blocos[j + 1] if j + 1 < len(blocos) and palavras[blocos[j + 1][0]]['s'] == palavras[b[0]]['s'] and len(blocos[j + 1]) < 5 else None
        if nx is not None and not re.search(r'[.!?:]$', palavras[b[0]]['w']): blocos[j + 1] = b + nx; blocos.pop(j); continue
        if prev is not None: blocos[j - 1] = prev + b; blocos.pop(j); continue
    j += 1

TL = {'fps': FPS, 'dur': total, 'scenes': cenas, 'palavras': palavras,
      'blocos': [' '.join(palavras[i]['w'] for i in b) for b in blocos], 'destaques': DESTAQUES}
open(os.path.join(RAIZ, 'timeline.js'), 'w').write('const TL = ' + json.dumps(TL, ensure_ascii=False) + ';\n')

# SRT (mesmos blocos da tela)
def ts(x):
    ms = int(round(x * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms:03d}'
os.makedirs(os.path.join(RAIZ, 'entregas'), exist_ok=True)
linhas, rev = [], []
for n, b in enumerate(blocos):
    a = palavras[b[0]]['t0']; z = palavras[b[-1]]['t1']
    nx = palavras[blocos[n + 1][0]]['t0'] if n + 1 < len(blocos) else total
    z = min(max(z, a + 0.7), nx - 0.02) if nx - 0.02 > a + 0.3 else z
    txt = ' '.join(palavras[i]['w'] for i in b)
    linhas.append(f'{n + 1}\n{ts(a)} --> {ts(z)}\n{txt}\n'); rev.append(f'{ts(a)}  {txt}')
open(os.path.join(RAIZ, 'entregas/MAPA_E_BUSSOLA_AR021.srt'), 'w', encoding='utf-8').write('\n'.join(linhas))
open(os.path.join(RAIZ, 'documentacao/legendas_revisao.txt'), 'w', encoding='utf-8').write('\n'.join(rev) + '\n')
print(f'duração total {total:.2f} s; {len(palavras)} palavras; {len(blocos)} blocos de legenda')
for c in cenas: print(c['id'], c['t0'], c['dur'])
