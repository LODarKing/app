"""Mapa de sincronização + legendas a partir da transcrição da fala real (faster-whisper, tempos por palavra).
uso: python3 audio/sincronizar.py  ->  mapa_sincronizacao.json, legendas.srt, legendas_piloto.srt, remotion/src/data/legendas.json
Os blocos de legenda são definidos aqui (texto exibido, já revisado); as palavras são casadas em ordem com a transcrição."""
import json, re, unicodedata
T = json.load(open('documentacao/transcricao_whisper.json'))
P = T['palavras']
# (texto exibido, cena). Números por extenso na fala viram algarismos na tela. Destaques: [d]=dourado [c]=ciano
BLOCOS = [
 ('Você sabe por que o Brasil', 1), ('celebra a Consciência Negra', 1), ('no dia [d]20 de novembro[/d],', 1), ('e não no dia 13 de maio?', 1),
 ('A resposta começa', 1), ('muito antes de essa data', 1), ('virar feriado.', 1),
 ('Em [c]1971[/c],', 2), ('durante a ditadura militar,', 2), ('um grupo de jovens negros', 2), ('de Porto Alegre', 2), ('decidiu valorizar outra forma', 2),
 ('de contar a história', 2), ('da liberdade no Brasil.', 2), ('Entre eles estava o poeta', 2), ('[c]Oliveira Silveira[/c].', 2),
 ('O [c]Grupo Palmares[/c] queria lembrar', 3), ('não apenas a assinatura', 3), ('da Lei Áurea,', 3), ('mas também o protagonismo', 3),
 ('de quem resistiu à escravidão,', 3), ('e encontrou uma data simbólica:', 3),
 ('[d]20 de novembro[/d]', 4), ('de [d]1695[/d],', 4), ('o dia da morte', 4), ('de [d]Zumbi dos Palmares[/d],', 4), ('uma das maiores referências', 4),
 ('da resistência negra no Brasil.', 4),
 ('A proposta se espalhou,', 5), ('ganhou força', 5), ('com o movimento negro', 5), ('e, em [c]2011[/c],', 5), ('a data foi oficializada nacionalmente.', 5),
 ('Mas o [d]feriado nacional[/d]', 5), ('em todo o Brasil', 5), ('só chegou em [d]2024[/d]!', 5),
 ('Hoje, o [d]20 de novembro[/d]', 6), ('é um convite para lembrar a história,', 6), ('valorizar a cultura afro-brasileira', 6),
 ('e refletir sobre a igualdade racial.', 6), ('Porque conhecer o passado', 6), ('também transforma a maneira', 6), ('como enxergamos o presente.', 6),
 ('Além do Visível.', 7), ('O extraordinário está nos detalhes.', 7),
]
# Tempos ESTIMADOS só para palavras que faltam no arquivo recebido (truncado em 60,37 s). Com o áudio completo, a
# transcrição cobre tudo e esta tabela deixa de ser usada.
ESTIMADO = {'presente.': (60.34, 60.95), 'Além': (61.70, 61.98), 'do': (61.98, 62.10), 'Visível.': (62.10, 62.75),
            'O': (63.15, 63.25), 'extraordinário': (63.25, 64.05), 'está': (64.05, 64.30), 'nos': (64.30, 64.50), 'detalhes.': (64.50, 65.40)}
# palavras faladas que a tela escreve de outro jeito (fala -> tokens exibidos)
FALA = {'20': ['vinte'], '13': ['treze'], 'nacional': []}
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)
out_blocos, k = [], 0
for texto, cena in BLOCOS:
    limpo = re.sub(r'\[/?[dc]\]', '', texto); toks = []
    cor = None
    for raw in re.findall(r'\[/?[dc]\]|[^\s\[]+', texto):
        if raw in ('[d]', '[c]'): cor = 'dourado' if raw == '[d]' else 'ciano'; continue
        if raw in ('[/d]', '[/c]'): cor = None; continue
        if not re.search(r'\w', raw) and toks: toks[-1][0] += raw; continue   # pontuação depois do fechamento
        toks.append([raw, cor])
    pal = []
    for w, cor in toks:
        alvo = FALA.get(w, None)
        if w == 'nacional' and cor == 'dourado':  # "feriado nacional" na tela; a fala diz só "feriado"
            pal.append({'t': w, 'cor': cor, 'ini': pal[-1]['ini'], 'fim': pal[-1]['fim']}); continue
        if k >= len(P):  # além do fim do arquivo recebido: tempo estimado, marcado
            e = ESTIMADO[w]; pal.append({'t': w, 'cor': cor, 'ini': e[0], 'fim': e[1], 'estimado': True}); continue
        if w == 'presente.' and norm(P[k][0]) != 'presente' and P[k][1] > 60:  # palavra cortada no fim do arquivo truncado
            e = ESTIMADO[w]; pal.append({'t': w, 'cor': cor, 'ini': e[0], 'fim': e[1], 'estimado': True}); k += 1; continue
        if w == 'afro-brasileira' and norm(P[k][0]) == 'afro':  # a transcrição separa em "afro" + "-brasileira"
            pal.append({'t': w, 'cor': cor, 'ini': P[k][1], 'fim': P[k + 1][2]}); k += 2; continue
        fala = P[k]; esperado = norm(alvo[0]) if alvo else norm(w)
        if norm(fala[0]) != esperado:
            raise SystemExit(f'diferença: tela "{w}" x fala "{fala[0]}" em {fala[1]}s')
        pal.append({'t': w, 'cor': cor, 'ini': fala[1], 'fim': fala[2]}); k += 1
    ini = next((p['ini'] for p in pal if p['ini'] is not None), None); fim = next((p['fim'] for p in reversed(pal) if p['fim'] is not None), None)
    out_blocos.append({'texto': limpo, 'cena': cena, 'ini': ini, 'fim': fim, 'palavras': pal, 'estimado': any(p.get('estimado') for p in pal),
                       'naTela': cena == 7})  # cena 7: o texto já está na tela (marca), sem legenda dinâmica
assert k == len(P), (k, len(P))
# legenda some no início do próximo bloco ou 0,45 s depois da última palavra
for i, b in enumerate(out_blocos):
    nxt = out_blocos[i + 1]['ini'] if i + 1 < len(out_blocos) and out_blocos[i + 1]['ini'] is not None else None
    b['sai'] = None if b['fim'] is None else round(min(nxt, b['fim'] + 0.6) if nxt else b['fim'] + 0.6, 3)
frases = [[s[0], s[1], s[2]] for s in T['segmentos']]
truncado = T['dur'] < 63
palavra = lambda txt: next(p for b in out_blocos for p in b['palavras'] if p['t'] == txt)
fala = {'estimado': truncado, 'corteVoz': 60.30 if truncado else None,
        'presente': palavra('presente.')['ini'], 'alem': palavra('Além')['ini'], 'extra': palavra('extraordinário')['ini'],
        'fimFala': out_blocos[-1]['fim']}
json.dump(fala, open('remotion/src/data/fala.json', 'w'), indent=1)
print('fala:', fala)
mapa = {'fonte_tempo': 'narração real (ElevenLabs, arquivo enviado), transcrita por faster-whisper medium com tempos por palavra',
        'aviso': ('arquivo recebido truncado em 60,37 s (zip incompleto): fala corta em "enxergamos o pr…"; tempos de "presente. Além do Visível. O extraordinário está nos detalhes." são ESTIMADOS (marcados "estimado")') if T['dur'] < 63 else None,
        'duracao_audio_recebido_s': T['dur'], 'fps': 30, 'frases': frases, 'legendas': out_blocos}
json.dump(mapa, open('mapa_sincronizacao.json', 'w'), ensure_ascii=False, indent=1)
json.dump(out_blocos, open('remotion/src/data/legendas.json', 'w'), ensure_ascii=False)
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'
def srt(bl, nome):
    lin = [f"{i}\n{ts(b['ini'])} --> {ts(b['sai'])}\n{b['texto']}\n" for i, b in enumerate(bl, 1)]
    open(nome, 'w').write('\n'.join(lin))
srt([b for b in out_blocos if b['ini'] is not None], 'legendas.srt')
srt([b for b in out_blocos if b['ini'] is not None and b['fim'] < 11.9], 'legendas_piloto.srt')
for b in out_blocos[:9]: print(b['ini'], b['fim'], b['sai'], b['texto'])
print('blocos', len(out_blocos), 'último', out_blocos[-1]['texto'], out_blocos[-1]['ini'])
