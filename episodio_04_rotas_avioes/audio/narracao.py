"""Narração por IA do episódio 04 (Além do Visível).

Motor: Kokoro v1.0 (ONNX, pesos Apache-2.0), voz pm_santa, pt-br, velocidade 1.0 (sem aceleração).
Cada frase é sintetizada separadamente; as pausas entre frases são escolhidas aqui para cair nas revelações visuais.
Depois: tratamento (passa-altas, EQ suave, de-esser, compressão moderada, limitador -1 dBTP).
Tempos por palavra: Whisper (faster-whisper medium) sobre cada frase, alinhado ao texto do roteiro.

Saídas:
  audio/narracao_bruta.wav     voz crua 48 kHz (frases + pausas)
  audio/narracao_ia.wav        voz tratada 48 kHz 24 bits
  audio/narracao_tempos.json   frases, início/fim, palavras com tempos
Rodar: python3 audio/narracao.py   (a partir de episodio_04_rotas_avioes/)
"""
import json, os, re, difflib, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln, librosa
from scipy.signal import resample_poly, butter, sosfilt
from pedalboard import Pedalboard, HighpassFilter, LowShelfFilter, PeakFilter, HighShelfFilter, Compressor, Limiter

ROOT = os.path.dirname(os.path.abspath(__file__))
MOD = os.path.join(ROOT, '..', '..', 'VOZES', 'modelos')
SR = 48000
VOZ, LANG = 'pm_santa', 'pt-br'

# (texto falado, pausa depois em s, velocidade, cena)
FRASES = [
    ("Já viu a rota de um avião no mapa e pensou:", 0.22, 1.0, 1),
    ("por que tanta curva?", 0.70, 0.97, 1),
    ("Parece um desvio.", 0.50, 1.0, 1),
    ("Mas olha só...", 0.30, 0.97, 1),
    ("talvez o mapa esteja te enganando!", 0.85, 1.0, 1),
    ("A Terra é redonda.", 0.55, 0.97, 2),
    ("E quando transformamos sua superfície em um mapa plano, as distâncias ficam distorcidas.", 0.75, 1.0, 2),
    ("No globo, o caminho mais curto entre dois pontos segue um arco chamado círculo máximo.", 0.50, 1.0, 3),
    ("Só que, em muitos mapas, esse arco parece uma curva enorme!", 0.85, 1.0, 3),
    ("Agora compare as duas rotas sobre a Terra.", 0.95, 1.0, 3),
    ("Surpresa:", 0.30, 0.97, 3),
    ("aquela curva do mapa pode representar a menor distância!", 1.05, 1.0, 3),
    ("Mas atenção: os aviões reais nem sempre seguem exatamente esse caminho.", 0.55, 1.0, 5),
    ("Ventos, tempestades, espaços aéreos restritos e controle de tráfego também influenciam as rotas.", 0.65, 1.0, 5),
    ("Por isso, o caminho mais curto nem sempre é o mais rápido ou o mais adequado.", 0.85, 1.0, 5),
    ("Da próxima vez que olhar um voo no mapa, lembre-se:", 0.30, 1.0, 6),
    ("o desenho não conta a história toda.", 1.00, 1.0, 6),
    ("Além do Visível.", 0.40, 0.97, 6),
    ("O extraordinário está nos detalhes.", 0.0, 0.97, 6),
]
INICIO = 0.30   # silêncio antes da primeira palavra
FIM = 0.80


def sintetizar():
    from kokoro_onnx import Kokoro
    K = Kokoro(os.path.join(MOD, 'kokoro-v1.0.onnx'), os.path.join(MOD, 'voices-v1.0.bin'))
    clips = []
    for txt, _, sp, _ in FRASES:
        a, sr = K.create(txt, voice=VOZ, speed=sp, lang=LANG)
        a = resample_poly(a, SR, sr).astype(np.float32)
        # apara silêncio das bordas (limiar -45 dB) mantendo 25 ms
        idx = np.where(np.abs(a) > 10 ** (-45 / 20))[0]
        pad = int(0.025 * SR)
        a = a[max(0, idx[0] - pad): idx[-1] + pad]
        n = int(0.012 * SR); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n)
        clips.append(a)
    return clips


def montar(clips):
    partes, t, info = [np.zeros(int(INICIO * SR), np.float32)], INICIO, []
    for (txt, pausa, _, cena), a in zip(FRASES, clips):
        d = len(a) / SR
        info.append(dict(texto=txt, cena=cena, inicio=round(t, 3), fim=round(t + d, 3)))
        partes += [a, np.zeros(int(pausa * SR), np.float32)]
        t += d + pausa
    partes.append(np.zeros(int(FIM * SR), np.float32))
    return np.concatenate(partes), info


def deesser(y, thr_db=-30, max_red_db=6):
    """De-esser de banda: detecta energia 5–9 kHz e reduz só essa banda quando passa do limiar."""
    sos = butter(4, [5000, 9500], btype='band', fs=SR, output='sos')
    band = sosfilt(sos, y)
    win = int(0.005 * SR)
    env = np.sqrt(np.convolve(band ** 2, np.ones(win) / win, mode='same') + 1e-12)
    env_db = 20 * np.log10(env)
    red_db = np.clip(env_db - thr_db, 0, max_red_db)
    g = 10 ** (-red_db / 20)
    return y - band + band * g


def tratar(y):
    y = Pedalboard([HighpassFilter(80), LowShelfFilter(cutoff_frequency_hz=180, gain_db=1.5),
                    PeakFilter(cutoff_frequency_hz=320, gain_db=-1.5, q=1.0),
                    PeakFilter(cutoff_frequency_hz=3200, gain_db=1.8, q=0.9),
                    HighShelfFilter(cutoff_frequency_hz=11000, gain_db=-1.0)])(y.reshape(1, -1), SR)[0]
    y = deesser(y)
    y = Pedalboard([Compressor(threshold_db=-22, ratio=3.0, attack_ms=6, release_ms=110)])(y.reshape(1, -1), SR)[0]
    m = pyln.Meter(SR); y = y * 10 ** ((-16 - m.integrated_loudness(y)) / 20)
    y = Pedalboard([Limiter(threshold_db=-1.5, release_ms=80)])(y.reshape(1, -1), SR)[0]
    return y.astype(np.float32)


def norm(w):
    return re.sub(r'[^\wáàâãéêíóôõúç]', '', w.lower())


def tempos(clips, info):
    from faster_whisper import WhisperModel
    m = WhisperModel('medium', device='cpu', compute_type='int8')
    ouvido_total = []
    for fr, a in zip(info, clips):
        y16 = resample_poly(a, 16000, SR).astype(np.float32)
        segs, _ = m.transcribe(y16, language='pt', word_timestamps=True, initial_prompt=fr['texto'])
        ws = [w for s in segs for w in s.words]
        ouvido = ' '.join(w.word.strip() for w in ws)
        ouvido_total.append(ouvido)
        alvo = fr['texto'].split()
        a_n, o_n = [norm(w) for w in alvo], [norm(w.word) for w in ws]
        sm = difflib.SequenceMatcher(a=a_n, b=o_n, autojunk=False)
        mapa = {}
        for blk in sm.get_matching_blocks():
            for k in range(blk.size): mapa[blk.a + k] = blk.b + k
        d = len(a) / SR
        pals = []
        for i, w in enumerate(alvo):
            if i in mapa:
                ww = ws[mapa[i]]; s0, s1 = ww.start, ww.end
            else:
                s0 = s1 = None
            pals.append([w, s0, s1])
        # interpola palavras sem correspondência
        for i, p in enumerate(pals):
            if p[1] is None:
                prev = next((pals[j][2] for j in range(i - 1, -1, -1) if pals[j][2] is not None), 0.0)
                nxt = next((pals[j][1] for j in range(i + 1, len(pals)) if pals[j][1] is not None), d)
                p[1], p[2] = prev, max(prev, nxt)
        fr['palavras'] = [dict(p=w, i=round(fr['inicio'] + s0, 3), f=round(fr['inicio'] + min(s1, d), 3)) for w, s0, s1 in pals]
        fr['whisper'] = ouvido
        fr['palavras_sem_alinhamento'] = [alvo[i] for i in range(len(alvo)) if i not in mapa]
    return info


if __name__ == '__main__':
    clips = sintetizar()
    bruta, info = montar(clips)
    sf.write(os.path.join(ROOT, 'narracao_bruta.wav'), bruta, SR, subtype='PCM_24')
    tratada = tratar(bruta)
    sf.write(os.path.join(ROOT, 'narracao_ia.wav'), tratada, SR, subtype='PCM_24')
    info = tempos(clips, info)
    dur = len(tratada) / SR
    json.dump(dict(voz=VOZ, motor='kokoro-onnx v1.0', duracao=round(dur, 3), frases=info),
              open(os.path.join(ROOT, 'narracao_tempos.json'), 'w'), ensure_ascii=False, indent=1)
    print('duração total %.2f s' % dur)
    for fr in info:
        print('%6.2f–%6.2f [c%d] %s' % (fr['inicio'], fr['fim'], fr['cena'], fr['texto']))
        if fr['palavras_sem_alinhamento']: print('        ⚠ sem alinhamento:', fr['palavras_sem_alinhamento'], '| ouviu:', fr['whisper'])
