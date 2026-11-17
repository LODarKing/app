"""Narração ElevenLabs (fornecida pelo usuário em 17/11/2026) -> narração do episódio.

Sem mudar a velocidade: a fala é cortada nos silêncios entre frases (ponto de menor energia de cada intervalo)
e remontada com pausas maiores onde há revelação visual. Depois: tratamento leve (passa-altas, EQ suave,
de-esser, compressão moderada) e tempos por palavra (Whisper alinhado ao texto falado).

Entrada : audio/elevenlabs/narracao_elevenlabs_original.mp3 (mono, 44,1 kHz, 128 kb/s, 53,0 s)
Saídas  : audio/narracao_ia.wav, audio/narracao_tempos.json, audio/elevenlabs/montagem.json
"""
import json, os, re, difflib
import numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
from scipy.signal import resample_poly
from pedalboard import Pedalboard, HighpassFilter, LowShelfFilter, PeakFilter, Compressor

ROOT = os.path.dirname(os.path.abspath(__file__))
SR = 48000
SRC = os.path.join(ROOT, 'elevenlabs', 'narracao_elevenlabs_original.mp3')

# texto efetivamente falado (ortografia revisada), pausa EXTRA depois da frase (s), cena
FRASES = [
    ("Você já olhou a rota de um avião no mapa e pensou: por que ele está fazendo essa curva enorme?", 0.35, 1),
    ("Parece um desvio, não é?", 0.45, 1),
    ("Mas e se eu te dissesse que essa curva pode ser justamente o caminho mais curto?", 0.60, 1),
    ("O segredo está no próprio mapa.", 0.60, 2),
    ("A Terra é quase esférica.", 0.90, 2),
    ("E quando tentamos representar sua superfície em um mapa plano, as distâncias podem ficar distorcidas.", 0.70, 2),
    ("Por isso, o menor caminho entre dois pontos sobre o globo, chamado de círculo máximo, pode parecer uma curva gigantesca no mapa.", 0.80, 3),
    ("Imagine um voo de Nova York até Tóquio.", 0.40, 3),
    ("No mapa, a rota pode parecer um desvio em direção ao Norte.", 0.90, 3),
    ("Mas quando observamos a Terra como um globo,", 0.50, 3),
    ("tudo começa a fazer sentido.", 2.20, 4),
    ("Só que existe outro detalhe.", 0.40, 5),
    ("Os aviões nem sempre seguem exatamente o caminho mais curto.", 0.60, 5),
    ("Ventos, tempestades e restrições do espaço aéreo também influenciam as rotas.", 0.60, 5),
    ("Ou seja, o caminho mais curto nem sempre é o mais rápido.", 1.00, 5),
    ("Incrível, não é?", 0.50, 6),
    ("Além do Visível, o extraordinário está nos detalhes.", 0.0, 6),
]
INICIO, FIM = 0.30, 0.90


def norm(w): return re.sub(r'[^\wáàâãéêíóôõúç]', '', w.lower())


def main():
    y, sr = librosa.load(SRC, sr=None, mono=True)
    y = resample_poly(y, SR, sr).astype(np.float32)
    W = json.load(open(os.path.join(ROOT, 'elevenlabs', 'whisper_palavras.json')))  # [palavra, ini, fim]
    # alinha as palavras do texto às palavras ouvidas, frase a frase
    alvo = [(fi, w) for fi, (txt, _, _) in enumerate(FRASES) for w in txt.split()]
    sm = difflib.SequenceMatcher(a=[norm(w) for _, w in alvo], b=[norm(w[0]) for w in W], autojunk=False)
    mapa = {}
    for blk in sm.get_matching_blocks():
        for k in range(blk.size): mapa[blk.a + k] = blk.b + k
    # interpola palavras sem correspondência (ex.: "tempestades" ouvida como "tentestades")
    tw = []
    for i in range(len(alvo)):
        if i in mapa: tw.append([W[mapa[i]][1], W[mapa[i]][2]])
        else: tw.append(None)
    for i in range(len(tw)):
        if tw[i] is None:
            prev = next(tw[j][1] for j in range(i - 1, -1, -1) if tw[j] is not None)
            nxt = next(tw[j][0] for j in range(i + 1, len(tw)) if tw[j] is not None)
            tw[i] = [prev, nxt]
    sem = [alvo[i][1] for i in range(len(alvo)) if i not in mapa]
    # limites de cada frase no original
    idx = {}
    for i, (fi, _) in enumerate(alvo): idx.setdefault(fi, []).append(i)
    rms = librosa.feature.rms(y=y, frame_length=480, hop_length=120)[0]
    t_rms = np.arange(len(rms)) * 120 / SR
    cortes = [0.0]
    for fi in range(len(FRASES) - 1):
        a = tw[idx[fi][-1]][1] - 0.06; b = tw[idx[fi + 1][0]][0] + 0.03
        sel = (t_rms >= a) & (t_rms <= b)
        cortes.append(float(t_rms[sel][np.argmin(rms[sel])]) if sel.any() else (a + b) / 2)
    cortes.append(len(y) / SR)
    # remonta: cada frase com microdesvanecimento de 8 ms nos cortes + pausa extra em silêncio digital
    partes = [np.zeros(int(INICIO * SR), np.float32)]; t = INICIO; frases = []; mont = []
    nf = int(0.008 * SR)
    for fi, (txt, extra, cena) in enumerate(FRASES):
        a, b = cortes[fi], cortes[fi + 1]
        seg = y[int(a * SR): int(b * SR)].copy()
        seg[:nf] *= np.linspace(0, 1, nf); seg[-nf:] *= np.linspace(1, 0, nf)
        off = t - a
        pal = [dict(p=alvo[i][1], i=round(tw[i][0] + off, 3), f=round(tw[i][1] + off, 3)) for i in idx[fi]]
        frases.append(dict(texto=txt, cena=cena, inicio=pal[0]['i'], fim=pal[-1]['f'], palavras=pal))
        mont.append(dict(frase=fi + 1, original=[round(a, 3), round(b, 3)], destino=round(t, 3), pausa_extra=extra))
        partes += [seg, np.zeros(int(extra * SR), np.float32)]
        t += len(seg) / SR + extra
    partes.append(np.zeros(int(FIM * SR), np.float32))
    voz = np.concatenate(partes)
    # tratamento leve (o arquivo do ElevenLabs já vem limpo)
    voz = Pedalboard([HighpassFilter(70), LowShelfFilter(cutoff_frequency_hz=160, gain_db=1.0),
                      PeakFilter(cutoff_frequency_hz=3000, gain_db=1.0, q=0.9)])(voz.reshape(1, -1), SR)[0]
    from narracao import deesser
    voz = deesser(voz, thr_db=-32, max_red_db=5)
    voz = Pedalboard([Compressor(threshold_db=-20, ratio=2.5, attack_ms=8, release_ms=120)])(voz.reshape(1, -1), SR)[0]
    m = pyln.Meter(SR); voz = voz * 10 ** ((-16 - m.integrated_loudness(voz)) / 20)
    pk = np.abs(voz).max()
    if pk > 0.89: voz *= 0.89 / pk
    sf.write(os.path.join(ROOT, 'narracao_ia.wav'), voz.astype(np.float32), SR, subtype='PCM_24')
    dur = len(voz) / SR
    json.dump(dict(voz='ElevenLabs (arquivo fornecido pelo usuário)', motor='ElevenLabs', duracao=round(dur, 3),
                   palavras_sem_alinhamento=sem, frases=frases),
              open(os.path.join(ROOT, 'narracao_tempos.json'), 'w'), ensure_ascii=False, indent=1)
    json.dump(dict(fonte=SRC, cortes_no_original=cortes, montagem=mont, velocidade='inalterada (1,0×)'),
              open(os.path.join(ROOT, 'elevenlabs', 'montagem.json'), 'w'), ensure_ascii=False, indent=1)
    print('duração %.2f s | sem alinhamento: %s' % (dur, sem))
    for f in frases: print('%6.2f–%6.2f [c%d] %s' % (f['inicio'], f['fim'], f['cena'], f['texto']))


if __name__ == '__main__':
    import sys; sys.path.insert(0, ROOT); main()
