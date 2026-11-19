"""Mapa de sincronização a partir do alinhamento forçado (documentacao/alinhamento.json).
Gera: mapa_sincronizacao.json, transcricao_narracao.txt, legendas.srt e componentes_animacao/dados/tempos.json
(este último é o que o motor de animação lê: palavras, legendas, cenas, marcos e grade musical).
uso: python3 -I audio/montar_mapa.py"""
import json, re, unicodedata
AL = json.load(open('documentacao/alinhamento.json'))['palavras']
AN = json.load(open('documentacao/palavras.json'))
DUR_NARR = 65.306; DUR = 66.0
BPM, FASE = 101.5, 0.136            # grade escolhida para casar os acertos com as palavras-âncora (ver storyboard.md)
SEMI = 60 / BPM / 4
def grade(t): return round(FASE + round((t - FASE) / SEMI) * SEMI, 3)
def norm(s): return re.sub(r'[^\w-]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def w(p, n=0, fim=False):
    k = 0
    for x in AL:
        if norm(x['palavra']) == norm(p):
            if k == n: return x['fim'] if fim else x['ini']
            k += 1
    raise KeyError(p)
# ------------------------------------------------------------------ legendas (blocos de leitura, quebras manuais)
BLOCOS = ['Imagine enviar uma mensagem', 'e precisar esperar|dois dias', 'por uma resposta.', 'Não é ficção científica.',
          'É o que acontece|com a Voyager 1.', 'Em 18 de novembro|de 2026,', 'ela alcançou|um marco histórico.',
          'Tornou-se o primeiro objeto|construído pela humanidade', 'a chegar a um dia-luz|de distância da Terra.',
          'São quase 26 bilhões|de quilômetros.', 'Mesmo viajando|à velocidade da luz,', 'um sinal de rádio leva|cerca de 24 horas',
          'para chegar até ela.', 'E se a nave respondesse|imediatamente,', 'seriam mais 24 horas|para a resposta voltar.',
          'Mas, justamente|neste momento histórico,', 'algo preocupa a NASA.', 'Desde 14 de novembro,', 'a sonda deixou de transmitir|normalmente',
          'seus dados científicos|e de engenharia.', 'O sinal de rádio|ainda chega à Terra,', 'mas os engenheiros|investigam o problema.',
          'Lançada em 1977,', 'a Voyager 1 passou por|Júpiter, Saturno,', 'e em 2012 entrou|no espaço interestelar.', 'Quase 50 anos depois,',
          'essa pequena máquina|continua atravessando', 'a imensidão do espaço,', 'tão distante que|até a própria luz', 'precisa de um dia inteiro|para alcançá-la.',
          'Além do visível,', 'o extraordinário|está nos detalhes.']
# destaques: c = ciano (sinal, sonda), a = amarelo (datas, distâncias, marcos)
DEST = {'dois': 'c', 'dias': 'c', 'Voyager': 'c', '1.': 'c', '1': 'c', '18': 'a', 'novembro': 'a', '2026,': 'a', 'dia-luz': 'a', '26': 'a', 'bilhões': 'a',
        'quilômetros.': 'a', '24': 'c', 'horas': 'c', '14': 'a', '1977,': 'a', '2012': 'a', 'interestelar.': 'c', '50': 'a', 'anos': 'a'}
NAO_DEST = {('de', ), }
k = 0; leg = []
for bi, b in enumerate(BLOCOS):
    linhas = b.split('|'); ws = []
    for li, ln in enumerate(linhas):
        for tok in ln.split(' '):
            a = AL[k]; assert a['palavra'] == tok, (tok, a['palavra']); k += 1
            d = DEST.get(tok, '')
            if tok in ('horas',) and not (ws and ws[-1]['t'] == '24'): d = ''
            if tok == 'dias' and not (ws and ws[-1]['t'] == 'dois'): d = ''
            if tok in ('1', '1.') and not (ws and ws[-1]['t'] == 'Voyager'): d = ''
            if tok == 'novembro' and bi != 5: d = 'a' if bi == 17 else ''
            if tok == 'anos' and not (ws and ws[-1]['t'] == '50'): d = ''
            ws.append({'t': tok, 'ini': a['ini'], 'fim': a['fim'], 'linha': li, 'd': d})
    leg.append({'n': bi + 1, 'ini': round(max(0.0, ws[0]['ini'] - 0.08), 3), 'fim': ws[-1]['fim'], 'palavras': ws, 'texto': b.replace('|', ' ')})
assert k == len(AL)
for i, c in enumerate(leg):     # cada bloco fica até o próximo começar (no máx. 0,9 s após a última palavra)
    nxt = leg[i + 1]['ini'] if i + 1 < len(leg) else DUR
    c['fim'] = round(min(nxt - 0.02, c['fim'] + 0.9), 3)
# os dois últimos blocos coincidem com a assinatura do canal: ficam no SRT, mas não são queimados por cima da marca
for c in leg[-2:]: c['queimar'] = False
# ------------------------------------------------------------------ cenas e marcos (tempos reais da narração)
cenas = [
 {'id': 's1', 'nome': 'Uma mensagem impossível', 't0': 0.0, 't1': 4.75},
 {'id': 's2', 'nome': 'A viagem para fora da Terra', 't0': 4.75, 't1': w('Voyager') - 0.04},
 {'id': 's3', 'nome': 'O marco histórico', 't0': w('Voyager') - 0.04, 't1': 20.30},
 {'id': 's4', 'nome': 'A mensagem que leva um dia', 't0': 20.30, 't1': w('Mas') - 0.10},
 {'id': 's5', 'nome': 'O problema de comunicação', 't0': w('Mas') - 0.10, 't1': w('Lancada') - 0.15},
 {'id': 's6', 'nome': 'Uma jornada de quase cinquenta anos', 't0': w('Lancada') - 0.15, 't1': w('Quase', 1) - 0.10},
 {'id': 's7', 'nome': 'A imensidão do universo', 't0': w('Quase', 1) - 0.10, 't1': DUR},
]
for c in cenas: c['t0'] = round(c['t0'], 3); c['t1'] = round(c['t1'], 3)
M = {   # marcos visuais (nome -> instante); efeitos sonoros usam o mesmo instante encaixado na grade
 'digitar': 0.06, 'enviar': w('mensagem') + 0.02, 'relogio': w('mensagem', 0, True), 'conta_ini': w('e'), 'h48': w('dois'),
 'push48': w('dias'), 'colapso': w('resposta', 0, True) + 0.12, 'ponto': 4.95, 'terra': w('Nao'), 'afasta': w('ficcao'),
 'lua': w('cientifica'), 'voyager': w('Voyager'), 'data_18': w('18'), 'data_nov': w('novembro'), 'data_2026': w('2026'),
 'marco': w('marco'), 'luz_sonda': w('alcancou'), 'recuo': w('Tornou-se'), 'regua': w('primeiro'), 'dialuz_fala': w('dia-luz'),
 'terra_fala': w('Terra'), 'km': w('26'), 'km_fim': w('quilometros', 0, True), 'dialuz': 20.12, 'luz': w('luz'),
 'sinal_sai': w('luz', 0, True), 'h24_fala': w('24'), 'chega': w('chegar', 1), 'resposta': w('respondesse'), 'resposta_sai': w('imediatamente', 0, True) + 0.05,
 'h24b_fala': w('24', 1), 'volta': w('voltar'), 'clima': w('Mas'), 'nasa': w('NASA'), 'data_14': w('14'), 'transmitir': w('transmitir'),
 'dados': w('dados'), 'sinal_ok': w('sinal', 1), 'engenheiros': w('engenheiros'), 'ano_1977': w('1977'), 'jupiter': w('Jupiter'),
 'saturno': w('Saturno'), 'ano_2012': w('2012'), 'interestelar': w('interestelar'), 'cinquenta': w('50'), 'maquina': w('maquina'),
 'imensidao': w('imensidao'), 'luz_final': w('luz', 1), 'dia_inteiro': w('dia'), 'marca': w('Alem'), 'slogan': w('extraordinario'),
 'fim_fala': w('detalhes', 0, True),
}
LIVRES = ('digitar', 'afasta', 'marco', 'colapso', 'ponto', 'dialuz', 'resposta_sai', 'sinal_sai', 'enviar', 'relogio')   # marcos fora de palavra: vão direto para a grade
M = {k: (grade(v) if k in LIVRES else round(v, 3)) for k, v in M.items()}
SINC = [  # pontos de sincronização pedidos no briefing -> palavra real -> ação
 ('DOIS DIAS', 'dois', 'h48', 'contador chega a 48:00:00 e vira "48 HORAS"'),
 ('VOYAGER 1', 'Voyager', 'voyager', 'revelação da silhueta da sonda'),
 ('18 DE NOVEMBRO DE 2026', '18', 'data_18', 'data em tipografia cinética (18 / NOVEMBRO / 2026 no tempo de cada palavra)'),
 ('QUASE 26 BILHÕES DE QUILÔMETROS', '26', 'km', 'grande revelação: 25,9 BILHÕES DE KM -> 1 DIA-LUZ'),
 ('24 HORAS PARA CHEGAR', 'chegar', 'chega', 'frente de onda do sinal alcança a Voyager com o contador em 24:00:00'),
 ('MAIS 24 HORAS PARA VOLTAR', 'voltar', 'volta', 'resposta hipotética chega à Terra com o total em 48:00:00'),
 ('A NASA DEIXOU DE RECEBER OS DADOS', 'transmitir', 'transmitir', 'atmosfera muda desde "Mas"; painel: SINAL DETECTADO / DADOS NÃO RECEBIDOS'),
 ('1977', '1977', 'ano_1977', 'linha do tempo histórica começa'),
 ('ALÉM DO VISÍVEL', 'Além', 'marca', 'assinatura do canal'),
]
sinc = [{'briefing': a, 'palavra_na_narracao': p, 'marco': m, 't': M[m], 'acao': ac} for a, p, m, ac in SINC]
SFX = [  # efeitos: nome, marco, descrição (o instante tocado é o marco encaixado na semicolcheia da grade)
 ('teclas', 'digitar', 'toques de teclado suaves enquanto a mensagem é escrita'), ('envio', 'enviar', 'envio: varredura curta ascendente + bip'),
 ('relogio', 'relogio', 'relógio digital: tiques que aceleram até 48 h'), ('impacto_48', 'h48', 'impacto grave discreto na revelação de 48 HORAS'),
 ('colapso', 'colapso', 'sucção reversa: o número vira um ponto de luz'), ('ponto', 'ponto', 'nota de sino curta: ponto luminoso'),
 ('recuo_camera', 'afasta', 'subida tonal grave: a câmera se afasta da Terra'), ('voyager', 'voyager', 'revelação: sub-grave + acorde em sino'),
 ('data_18', 'data_18', 'impacto tipográfico'), ('data_nov', 'data_nov', 'impacto tipográfico leve'), ('data_2026', 'data_2026', 'impacto tipográfico'),
 ('marco', 'marco', 'tom ascendente: o sol varre a sonda'), ('recuo_escala', 'recuo', 'subida longa: recuo até a escala do Sistema Solar'),
 ('km', 'km', 'revelação da distância (ponto alto da trilha)'), ('dialuz', 'dialuz', 'transformação em 1 DIA-LUZ'),
 ('sinal_ida', 'sinal_sai', 'pulsos de rádio estilizados acompanhando o contador'), ('chegada', 'chega', 'chegada do sinal'),
 ('sinal_volta', 'resposta_sai', 'resposta hipotética'), ('chegada_volta', 'volta', 'chegada da resposta: 48 h'),
 ('clima', 'clima', 'transição para o problema: a trilha recua'), ('data_14', 'data_14', 'impacto tipográfico abafado'),
 ('dados_off', 'dados', 'canal de dados se apaga (bip grave)'), ('portadora', 'sinal_ok', 'portadora: tom contínuo estilizado'),
 ('ano_1977', 'ano_1977', 'impacto: início da linha do tempo'), ('jupiter', 'jupiter', 'passagem'), ('saturno', 'saturno', 'passagem'),
 ('ano_2012', 'ano_2012', 'passagem: espaço interestelar'), ('marca', 'marca', 'assinatura do canal'),
]
sfx = [{'efeito': n, 'marco': m, 'evento_s': M[m], 'na_grade_s': grade(M[m]), 'desvio_ms': round((grade(M[m]) - M[m]) * 1000, 1), 'descricao': d} for n, m, d in SFX]
frases = []
for f in AN['frases']:
    frases.append({'n': f['n'], 'texto': f['texto'], 'nivel_db': f['nivel_db'], 'f0_mediana_hz': f['f0_mediana_hz']})
# tempos das frases pelo alinhamento forçado
k = 0
for f in frases:
    n = len([t for t in f['texto'].split(' ')])
    ws = AL[k:k + n]; k += n
    assert ws[-1]['palavra'][-1] in '.!?', ws[-1]
    f['ini'], f['fim'] = ws[0]['ini'], ws[-1]['fim']
pausas = [{'depois_de': frases[i]['texto'].split(' ')[-1], 'ini': frases[i]['fim'], 'fim': frases[i + 1]['ini'], 'dur': round(frases[i + 1]['ini'] - frases[i]['fim'], 3)} for i in range(len(frases) - 1)]
intens = [
 {'t': frases[0]['ini'], 'nota': 'abertura em tom de convite; frase 1 com a maior variação de altura (f0 ±%.0f Hz)' % AN['frases'][0]['f0_faixa_hz']},
 {'t': frases[1]['ini'], 'nota': 'queda de altura (f0 %.0f Hz): "Não é ficção científica" — virada grave e séria' % frases[1]['f0_mediana_hz']},
 {'t': frases[4]['ini'], 'nota': 'frase mais forte da narração (%.1f dB): o marco do dia-luz' % frases[4]['nivel_db']},
 {'t': frases[8]['ini'], 'nota': '"Mas," sobe a altura (f0 %.0f Hz) e abre a maior pausa do meio (%.2f s antes): virada para o problema' % (frases[8]['f0_mediana_hz'], frases[8]['ini'] - frases[7]['fim'])},
 {'t': frases[11]['ini'], 'nota': 'retomada: linha do tempo com altura alta e ritmo de enumeração (f0 %.0f Hz)' % frases[11]['f0_mediana_hz']},
 {'t': frases[12]['ini'], 'nota': 'contemplativo: nível cai ~3,5 dB (%.1f dB) e o ritmo desacelera' % frases[12]['nivel_db']},
 {'t': frases[13]['ini'], 'nota': 'assinatura: a mais grave e baixa da narração (f0 %.0f Hz, %.1f dB)' % (frases[13]['f0_mediana_hz'], frases[13]['nivel_db'])},
]
rev = [{'t': M['h48'], 'revelacao': '48 horas de espera (ida e volta)'}, {'t': M['dialuz_fala'], 'revelacao': 'um dia-luz de distância da Terra'},
       {'t': M['km'], 'revelacao': 'quase 26 bilhões de km (25,9 bilhões de km, NASA)'}, {'t': M['chega'], 'revelacao': 'o sinal leva 24 h para chegar'},
       {'t': M['volta'], 'revelacao': 'mais 24 h para a resposta voltar (supondo resposta imediata)'},
       {'t': M['transmitir'], 'revelacao': 'desde 14/11 a sonda não envia dados científicos e de engenharia; a portadora é recebida'},
       {'t': M['ano_2012'], 'revelacao': 'espaço interestelar em 2012'}]
mapa = {'fonte': 'narracao_original/Voyager .mp3', 'duracao_narracao_s': DUR_NARR, 'duracao_video_s': DUR, 'fps': 30,
        'metodo': 'texto: faster-whisper large-v3 (conferido; repetição espúria em 55 s removida após passada isolada); tempos: alinhamento forçado CTC wav2vec2 XLSR-53 pt (quadro 20 ms)',
        'grade_musical': {'bpm': BPM, 'fase_s': FASE, 'semicolcheia_s': round(SEMI, 4)},
        'frases': frases, 'pausas': pausas, 'mudancas_de_intensidade': intens, 'revelacoes_cientificas': rev,
        'pontos_de_sincronizacao': sinc, 'cenas': cenas, 'efeitos_sonoros': sfx, 'marcos': M,
        'palavras': [{'p': a['palavra'], 'ini': a['ini'], 'fim': a['fim'], 'conf': a['conf']} for a in AL]}
json.dump(mapa, open('mapa_sincronizacao.json', 'w'), ensure_ascii=False, indent=1)
json.dump({'dur': DUR, 'fps': 30, 'bpm': BPM, 'fase': FASE, 'cenas': cenas, 'marcos': M, 'legendas': leg,
           'palavras': [[a['palavra'], a['ini'], a['fim']] for a in AL]}, open('componentes_animacao/dados/tempos.json', 'w'), ensure_ascii=False)
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}'
open('legendas.srt', 'w').write('\n'.join(f"{c['n']}\n{ts(c['ini'])} --> {ts(c['fim'])}\n{BLOCOS[c['n'] - 1].replace('|', chr(10))}\n" for c in leg))
with open('transcricao_narracao.txt', 'w') as f:
    f.write('TRANSCRIÇÃO DA NARRAÇÃO ORIGINAL — Além do Visível, Episódio 06: Voyager 1\n')
    f.write('Arquivo: narracao_original/Voyager .mp3 (MP3 128 kbps, 44,1 kHz, mono, 65,31 s; MD5 46fb3aefe127e792544777b1e9e28eed)\n')
    f.write('Texto: faster-whisper large-v3, conferido. Tempos: alinhamento forçado (wav2vec2 XLSR-53 pt). Formato: início–fim (s)\n\n')
    for fr in frases: f.write(f"[{fr['ini']:6.2f} – {fr['fim']:6.2f}]  {fr['texto']}\n")
    f.write('\nTEXTO CORRIDO\n\n' + ' '.join(fr['texto'] for fr in frases) + '\n')
    f.write('\nNOTA: a transcrição automática completa registrou "continua atravessando. Atravessando a imensidão" (55 s).\n'
            'A passada isolada do trecho 53,2–57,0 s, com dois modelos (medium e large-v3), ouve uma única ocorrência:\n'
            '"continua atravessando a imensidão". O alinhamento forçado confirma uma só palavra (55,12–55,69 s).\n')
[print('  desvio', x['efeito'], x['desvio_ms'], 'ms') for x in sfx if abs(x['desvio_ms']) > 45]
print('desvio máximo dos efeitos na grade: %.0f ms' % max(abs(s['desvio_ms']) for s in sfx))
for c in cenas: print(c['id'], c['t0'], c['t1'], c['nome'])
