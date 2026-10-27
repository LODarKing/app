"""Restauração e edição das vozes (narrador, Lara, Miguel) — som de estúdio a partir de gravações de celular.
Cadeia por gravação: reconstrução dos picos estourados (interpolação AR) -> margem -3 dB -> redução de ruído por rede neural
(DeepFilterNet 3, 48 kHz) -> passa-altas 80 Hz -> controle de plosivas -> EQ corretiva -> de-esser -> compressão
-> atenuação de respirações -> encurtamento de pausas -> -18 LUFS -> limitador de pico real.
Os cortes usam os tempos por palavra da transcrição (documentacao/transcricao_originais.json).
As gravações com Lara e Miguel juntos são separadas por personagem.
Saída: falas/<nome>.flac (48 kHz, mono, 24 bits) e documentacao/edicao.json. Rodar a partir de FELINOS_AUDIO/."""
import json, os, sys, glob, re, numpy as np, soundfile as sf, pyloudnorm as pyln
from pedalboard import Pedalboard, HighpassFilter, PeakFilter, HighShelfFilter, LowShelfFilter, Compressor
sys.path.insert(0, '../EDUCACAO_INCLUSIVA_WORK/src/audio')
from dsp import declip, deess, frame_rms_db, tp_limiter, SR
import torch
from df.enhance import init_df, enhance
DF_MODEL, DF_STATE, _ = init_df()
from scipy.signal import butter, sosfiltfilt

TR = json.load(open('documentacao/transcricao_originais.json'))
os.makedirs('falas', exist_ok=True)
meter = pyln.Meter(SR)

def plosive_control(x, fc=130, max_red_db=10.0):
    low = sosfiltfilt(butter(2, fc, 'lowpass', fs=SR, output='sos'), x); rest = x - low
    mid = sosfiltfilt(butter(2, [300, 3000], 'bandpass', fs=SR, output='sos'), x)
    env = lambda s: np.sqrt(np.convolve(s ** 2, np.ones(int(0.008 * SR)) / int(0.008 * SR), 'same'))
    red = np.clip(20 * np.log10((env(low) + 1e-9) / (env(mid) + 1e-9)) * 0.8, 0, max_red_db)
    k = np.hanning(int(0.01 * SR)); red = np.convolve(red, k / k.sum(), 'same')
    return rest + low * 10 ** (-red / 20)

def chain(x):
    runs = 0
    if np.abs(x).max() > 0.95:                                                     # gravação estourada: refaz os picos
        x = x / max(1.0, np.percentile(np.abs(x), 99.99)) * 1.0
        x, r = declip(x, thr=0.9, p=32, ctx=400); runs = len(r)
    x = x * 10 ** ((-3 - 20 * np.log10(np.abs(x).max() + 1e-9)) / 20)            # margem: pico em -3 dBFS
    x = enhance(DF_MODEL, DF_STATE, torch.from_numpy(x.astype(np.float32))[None], atten_lim_db=30).numpy()[0].astype(np.float64)
    x = Pedalboard([HighpassFilter(80), HighpassFilter(80)])(x.astype(np.float32), SR).astype(np.float64)
    x = plosive_control(x)
    x = Pedalboard([LowShelfFilter(120, 1.0, 0.7), PeakFilter(350, -2.5, 1.1), PeakFilter(3500, 2.0, 0.9), HighShelfFilter(10000, 1.5, 0.7)])(x.astype(np.float32), SR).astype(np.float64)
    x, _ = deess(x, thresh_db=3.0, max_red_db=8.0)
    r = frame_rms_db(x); sp = np.percentile(r[r > np.percentile(r, 40)], 85)
    x = Pedalboard([Compressor(threshold_db=float(sp - 6), ratio=3.0, attack_ms=10, release_ms=120)])(x.astype(np.float32), SR).astype(np.float64)
    return x, runs

def activity(x):
    """por quadro de 10 ms: nível (dB), atividade (acima do silêncio) e vozeamento (periodicidade de 66 a 400 Hz)"""
    from scipy.signal import resample_poly
    hop = int(0.01 * SR); n = len(x) // hop
    edb = np.array([10 * np.log10(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    y = resample_poly(x, 1, 3); y = sosfiltfilt(butter(4, 900, 'lowpass', fs=16000, output='sos'), y)
    voiced = np.zeros(n, bool); L = 640
    for i in range(n):
        f = y[i * 160: i * 160 + L]
        if len(f) < L or edb[i] < -60: continue
        f = f - f.mean(); ac = np.correlate(f, f, 'full')[L - 1:]; ac /= ac[0] + 1e-12
        voiced[i] = ac[40:242].max() > 0.55
    cent = np.zeros(n); fr = np.fft.rfftfreq(960, 1 / SR); win = np.hanning(960)
    for i in range(n):
        f = x[i * hop:i * hop + 960]
        if len(f) == 960: S = np.abs(np.fft.rfft(f * win)) ** 2; cent[i] = (S * fr).sum() / (S.sum() + 1e-12)
    loud = np.percentile(edb, 95)
    active = edb > loud - 38
    return edb, active, voiced, cent, loud

def runs_of(mask):
    d = np.diff(np.concatenate([[0], mask.astype(int), [0]])); return list(zip(np.where(d == 1)[0], np.where(d == -1)[0]))

def edit(x, words, name):
    """remove respirações e encurta pausas: a detecção é pelo próprio sinal (atividade + vozeamento);
    a pontuação da transcrição só decide o tamanho natural de cada pausa"""
    n = len(x); log = {'respiracoes': 0, 'pausas_encurtadas': 0, 'removido_s': 0.0}
    edb, active, voiced, cent, loud = activity(x)
    # 1) respiração = trecho sem voz (só ar) de 150 ms a 1 s, bem mais baixo que a fala e com espectro de sopro
    #    (centroide 1,2–4,2 kHz; o "s" fica acima disso e é preservado)
    speech = active.copy()
    for a, b in runs_of(active & ~voiced):
        if 15 <= b - a <= 100 and edb[a:b].mean() < loud - 18 and 1200 < cent[a:b].mean() < 4200:
            speech[a:b] = False; log['respiracoes'] += 1
    # fecha buracos curtos entre trechos de fala (consoantes, oclusivas)
    for a, b in runs_of(~speech):
        if b - a < 8 and a > 0 and b < len(speech): speech[a:b] = True
    gain = np.ones(n)
    def silence(s0, s1, att_db=-40):
        s0, s1 = int(s0), int(s1)
        if s1 - s0 < 40: return
        g = np.full(s1 - s0, 10 ** (att_db / 20)); fd = min(int(0.02 * SR), (s1 - s0) // 2)
        g[:fd] = np.linspace(1, g[fd], fd); g[-fd:] = np.linspace(g[-fd - 1], 1, fd); gain[s0:s1] = np.minimum(gain[s0:s1], g)
    hop = int(0.01 * SR)
    sp = runs_of(speech)
    # tudo fora da fala (respirações, ruído de boca, resto de sala) é abaixado; 40 ms de folga em volta da fala
    edges = [0] + [v for r in sp for v in r] + [len(speech)]
    for i in range(0, len(edges), 2):
        a, b = edges[i], edges[i + 1]
        silence((a * hop + (0.04 * SR if i > 0 else 0)), (b * hop - (0.03 * SR if i + 1 < len(edges) - 1 else 0)))
    x = x * gain
    # 2) pausas: alvo natural pela pontuação da palavra que termina mais perto do início da pausa
    ends = [(e, w) for w, s_, e, p_ in words]
    def target(t):
        if not ends: return 0.3
        e, w = min(ends, key=lambda q: abs(q[0] - t))
        return 0.42 if re.search(r'[.!?]$', w) else 0.26 if re.search(r'[,;:]$', w) else 0.13
    cuts = []
    if sp:
        lead = sp[0][0] * 0.01
        if lead > 0.1: cuts.append((0.0, lead - 0.1))
        for (a0, a1), (b0, b1) in zip(sp[:-1], sp[1:]):
            ga, gb = a1 * 0.01, b0 * 0.01; tgt = target(ga)
            if gb - ga > tgt + 0.04:
                cuts.append((ga + tgt * 0.55, gb - tgt * 0.45)); log['pausas_encurtadas'] += 1
        tail = sp[-1][1] * 0.01
        if n / SR - tail > 0.35: cuts.append((tail + 0.35, n / SR))
    # aplica os cortes (no silêncio) com transição de 15 ms
    out, pos, xf = [], 0, int(0.015 * SR); tmap = []
    for a, b in cuts:
        s0, s1 = int(a * SR), int(b * SR)
        if s0 <= pos: s0 = pos
        if s1 - s0 < 2 * xf: continue
        out.append(x[pos:s0]); tmap.append((pos / SR, s0 / SR)); pos = s1; log['removido_s'] += (s1 - s0) / SR
    out.append(x[pos:]); tmap.append((pos / SR, n / SR))
    y = out[0]
    for seg in out[1:]:
        if len(y) > xf and len(seg) > xf:
            r = np.linspace(0, 1, xf); y = np.concatenate([y[:-xf], y[-xf:] * (1 - r) + seg[:xf] * r, seg[xf:]])
        else: y = np.concatenate([y, seg])
    log['removido_s'] = round(log['removido_s'], 2)
    return y, log, tmap

def remap(t, tmap):
    """tempo do original -> tempo no editado (para as palavras)"""
    acc = 0.0
    for a, b in tmap:
        if t < a: return acc
        if t <= b: return acc + (t - a)
        acc += b - a
    return acc

# frase do primeiro personagem nas gravações com os dois (Miguel fala primeiro nas três)
SPLIT_AFTER = {'Lara_e_Miguel_Felinos_01': 'livro?', 'Lara_e_Miguel_Felinos_02': 'tigre?', 'Lara_e_Miguel_Felinos_03': 'carne?'}
report = {}
ONLY = sys.argv[1:]
for f in sorted(glob.glob('originais_wav/*.wav')):
    name = os.path.basename(f)[:-4]
    if ONLY and name not in ONLY: continue
    x, sr = sf.read(f); assert sr == SR
    y, runs = chain(x)
    words = TR[name]['palavras']
    y, log, tmap = edit(y, words, name)
    wmap = [[w, round(remap(s, tmap), 3), round(remap(e, tmap), 3)] for w, s, e, p in words]
    parts = [(name, y, wmap)]
    if name in SPLIT_AFTER:
        k = next(i for i, w in enumerate(wmap) if w[0].lower().endswith(SPLIT_AFTER[name]))
        cut = (wmap[k][2] + wmap[k + 1][1]) / 2; c = int(cut * SR)
        num = name[-2:]
        parts = [(f'Miguel_Felinos_D{num}', y[:c], [w for w in wmap[:k + 1]]), (f'Lara_Felinos_D{num}', y[c:], [[w, round(s - cut, 3), round(e - cut, 3)] for w, s, e in wmap[k + 1:]])]
    for pn, py, pw in parts:
        fo = np.minimum(len(py), int(0.01 * SR)); py = py.copy(); py[:fo] *= np.linspace(0, 1, fo); py[-fo:] *= np.linspace(1, 0, fo)
        py = py * 10 ** ((-18 - meter.integrated_loudness(py)) / 20); py = tp_limiter(py, ceiling_db=-1.5)[0]
        sf.write(f'falas/{pn}.flac', py, SR, subtype='PCM_24')
        report[pn] = {'origem': name, 'duracao_original_s': TR[name]['dur'], 'duracao_editada_s': round(len(py) / SR, 3), 'picos_reconstruidos': runs, **log, 'palavras': pw}
        print(f"{pn:26s} {TR[name]['dur']:6.2f}s -> {len(py) / SR:6.2f}s  respirações {log['respiracoes']}  pausas {log['pausas_encurtadas']}")
old = json.load(open('documentacao/edicao.json')) if os.path.exists('documentacao/edicao.json') else {}
old.update(report); json.dump(old, open('documentacao/edicao.json', 'w'), ensure_ascii=False, indent=1)
