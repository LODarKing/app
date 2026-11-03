"""Som do piloto (10 s), sintetizado em código — sem amostras, sem voz. Três estilos de trilha para escolha:
  violao   acústico de acampamento: violão dedilhado, escovinha, pad que entra no mergulho
  piano    documentário: piano com tema curto, cordas sustentadas, pulso grave no mergulho
  moderno  leve para Reels: piano elétrico com acordes de 9ª, batida macia, sub-grave, respiro no mergulho
Etapas: 1) trilha a 100 bpm (Sol maior; Sol–Mi m–Dó–Ré, um acorde por compasso);
2) batidas MEDIDAS na trilha pronta -> audio/beats.json; 3) efeitos nos eventos (config.js) na semicolcheia medida
-> audio/acertos.json; 4) reverberação, mixagem em -14 LUFS e limitador (pico -2 dBFS).
Efeitos (2º argumento):
  nenhum   só a trilha (os acentos ficam por conta da própria música)
  foley    sons reais de corda: atrito em grãos que segue a velocidade da ponta, aperto do nó, fibras se soltando
  musical  sem efeitos avulsos: a trilha "abafa" enquanto a câmera mergulha na corda e abre na chegada, com um grave
  toques   versão anterior (toques de instrumento nos rótulos)
Uso (a partir de NOS_AMARRAS_EPISODIO/):  python3 audio/som_piloto.py [violao|piano|moderno] [nenhum|foley|musical|toques]"""
import json, re, sys, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import minimum_filter1d
from scipy.signal import butter
sys.path.insert(0, 'audio')
from timbres import SR, tv, hz, filt, env, violao_r, piano, rhodes, baixo, sub, pad, bumbo, estalo, escova, chimbal, ruido, reverb

ESTILO = sys.argv[1] if len(sys.argv) > 1 else 'moderno'
EFEITOS = sys.argv[2] if len(sys.argv) > 2 else 'musical'
cfg = open('config.js').read()
BPM = float(re.search(r'bpm:\s*([\d.]+)', cfg).group(1)); BEAT = 60 / BPM; E8 = BEAT / 2; BAR = 4 * BEAT
T = {k: float(v) for k, v in re.findall(r'(\w+):\s*([\d.]+)', re.search(r't:\s*\{([^}]*)\}', cfg).group(1))}
FIM = 10.0; N = int((FIM + 3.0) * SR)

class Bus:
    def __init__(s): s.x = np.zeros((N, 2))
    def put(s, sig, t0, pan=0.0, g=1.0):
        i0 = int(round(t0 * SR))
        if i0 < 0: sig = sig[-i0:]; i0 = 0
        if i0 >= N or len(sig) == 0: return
        sig = sig[: N - i0] * g; s.x[i0:i0 + len(sig), 0] += sig * np.cos((pan + 1) * np.pi / 4); s.x[i0:i0 + len(sig), 1] += sig * np.sin((pan + 1) * np.pi / 4)
music, ritmo, sfx = Bus(), Bus(), Bus()

# acordes: (baixo, quinta do baixo, notas do meio)
AC = [('Sol', 43, 50, [55, 59, 62, 67]), ('Mi m', 40, 47, [55, 59, 64, 67]), ('Dó', 48, 43, [55, 60, 64, 67]), ('Ré', 50, 45, [54, 57, 62, 66])]
def acorde(t): return AC[int(t // BAR) % 4]
NB = int(np.ceil(FIM / BAR))                           # compassos (o 5º começa em 9,6 s: resolução em Sol)

# ---------------------------------------------------------------- 1) trilhas
if ESTILO == 'violao':
    # rasqueado curto no tempo 0 (o gancho já começa com som), depois dedilhado em colcheias
    for j, m in enumerate([43, 50, 55, 59, 62, 67]): music.put(violao_r(hz(m), 2.6, 0.9), j * 0.014, -0.25 + 0.1 * j, 0.8)
    dedo = [None, 3, 1, 2, None, 3, 1, 2]                       # baixo nas colcheias 0 e 4 (alternado), agudos nas outras
    for i in range(1, int(FIM / E8) + 1):
        t = i * E8; nome, b1, b5, mid = acorde(t); k = i % 8
        if k == 0: music.put(violao_r(hz(b1), 2.0, 1.0), t, -0.15, 1.25)
        elif k == 4: music.put(violao_r(hz(b5), 1.6, 0.8), t, -0.15, 1.05)
        else: music.put(violao_r(hz(mid[dedo[k]] + (12 if k == 5 and i // 8 % 2 else 0)), 1.6, 0.65), t, 0.2 + 0.1 * (k % 2), 0.62)
    # escovinha nos tempos 2 e 4 a partir do 2º compasso; pad discreto a partir do mergulho
    for i in range(int(BAR / BEAT), int(FIM / BEAT) + 1):
        if i % 2 == 1: ritmo.put(escova(0.35, 0.9), i * BEAT, 0.1)
        ritmo.put(escova(0.12, 0.35), i * BEAT + E8, -0.1)
    for b in range(2, NB):
        nome, b1, b5, mid = AC[b % 4]; d = BAR + 0.6; g = 0.05 if b == 2 else 0.08
        music.put(pad([b1 + 12] + mid, d, 1500, g), b * BAR, 0)
    music.put(violao_r(hz(43), 3.0, 1.0), 9.6, -0.2, 0.9); music.put(violao_r(hz(67), 3.0, 0.7), 9.6 + 0.02, 0.2, 0.6)
    RV = dict(dur=1.6, umido=0.2)

elif ESTILO == 'piano':
    tema = [(0, 74), (1, 71), (2, 67), (3, 71), (4, 76), (5, 71), (6, 67), (7, 64), (8, 72), (9, 76), (10, 79), (11, 76), (12, 74), (13, 78), (14, 81), (15, 78)]
    for b in range(NB):
        nome, b1, b5, mid = AC[b % 4]; t = b * BAR
        music.put(piano(hz(b1), 3.0, 0.75), t, -0.3); music.put(piano(hz(b1 + 12), 3.0, 0.55), t, -0.3)
        for j, m in enumerate(mid[1:]): music.put(piano(hz(m), 2.6, 0.5), t + 0.01 * j + BEAT * 2, -0.05 + 0.1 * j, 0.7)
        music.put(pad([b1 + 12] + mid, BAR + 0.8, 1200, 0.07 if b else 0.04), t, 0)
    for q, m in tema: music.put(piano(hz(m), 1.8, 0.62), q * BEAT, 0.25)
    # pulso grave em colcheias durante o mergulho, preparando a chegada no chicote
    for i in range(int(T['zoom0'] / E8), int(T['zoom1'] / E8)):
        k = (i * E8 - T['zoom0']) / (T['zoom1'] - T['zoom0']); ritmo.put(sub(hz(38), 0.26) * (0.4 + 0.6 * k), i * E8, 0)
    ritmo.put(bumbo(0.9, 0.9), T['zoom1'], 0)
    music.put(piano(hz(43), 3.2, 0.8), 9.6, -0.3); music.put(piano(hz(79), 3.2, 0.6), 9.6, 0.25)
    RV = dict(dur=2.4, umido=0.28)

elif ESTILO == 'moderno':
    EXT = {'Sol': [55, 59, 62, 66, 69], 'Mi m': [52, 55, 59, 62, 66], 'Dó': [52, 55, 59, 62, 64], 'Ré': [54, 57, 62, 64, 69]}
    for b in range(NB):
        nome, b1, b5, mid = AC[b % 4]; t = b * BAR
        for j, m in enumerate(EXT[nome]): music.put(rhodes(hz(m), 2.2, 0.75), t + 0.008 * j, -0.3 + 0.15 * j, 0.8)
        for j, m in enumerate(EXT[nome][1:4]): music.put(rhodes(hz(m + 12), 0.9, 0.5), t + 3 * BEAT + E8, 0.2, 0.45)   # contratempo
        music.put(sub(hz(b1 - 12 if b1 > 45 else b1), BAR * 0.9), t, 0, 0.42)
    for i in range(int(FIM / E8) + 1):
        t = i * E8; k = i % 8; dentro = not (T['zoom0'] <= t < T['zoom1'])       # respiro: a batida some no mergulho
        g = 0.55 if t < BAR else 1.0
        if not dentro: continue
        if k in (0, 5): ritmo.put(bumbo(0.5, 0.85 * g), t, 0)
        if k in (2, 6): ritmo.put(estalo(0.9 * g), t, 0.05)
        ritmo.put(chimbal(1.1 * g * (1.0 if k % 2 else 0.6)), t, 0.25)
    sw = ruido(T['zoom1'] - T['zoom0'], 2000, 9000) * np.linspace(0, 1, int((T['zoom1'] - T['zoom0']) * SR)) ** 2 * 0.08
    ritmo.put(sw, T['zoom0'], 0)
    for j, m in enumerate(EXT['Sol']): music.put(rhodes(hz(m), 3.0, 0.7), 9.6 + 0.01 * j, -0.3 + 0.15 * j, 0.8)
    RV = dict(dur=1.4, umido=0.18)
else:
    sys.exit('estilo desconhecido: ' + ESTILO)

# ---------------------------------------------------------------- 2) batidas medidas (onset de energia grave + percussão)
mono = (music.x + ritmo.x).mean(1)[: int(FIM * SR)]; hop = 120
rms = np.sqrt(np.array([np.mean(mono[k:k + hop * 2] ** 2) for k in range(0, len(mono) - hop * 2, hop)]) + 1e-12)
flux = np.maximum(0, np.diff(np.log(rms), prepend=np.log(rms[0])))
cand = [k for k in range(1, len(flux) - 1) if flux[k] > flux[k - 1] and flux[k] >= flux[k + 1] and flux[k] > 0.35 * flux.max()]
on = []
for k in cand:
    t = k * hop / SR
    if not on or t - on[-1] > E8 * 0.5: on.append(t)
on = np.array(on)
# ajuste robusto: grade de colcheias (período e fase) por mínimos quadrados, descartando onsets fora da grade
usa = np.abs(on - np.round(on / E8) * E8) < 0.04          # inliers iniciais: perto da grade nominal
for _ in range(3):
    idx = np.round(on / E8); A = np.vstack([idx[usa], np.ones(usa.sum())]).T
    per, fase = np.linalg.lstsq(A, on[usa], rcond=None)[0]; r = np.abs(on - (idx * per + fase)); usa = r < 0.04
res = r[usa].max() * 1000
batidas = [round(fase + k * per * 2, 3) for k in range(int(FIM / (per * 2)) + 1)]
json.dump({'estilo': ESTILO, 'bpm_medido': round(60 / (per * 2), 2), 'fase_s': round(fase, 3), 'residuo_max_ms': round(res, 1), 'onsets': [round(float(x), 3) for x in on[usa]], 'batidas': batidas}, open('audio/beats.json', 'w'), indent=1)
print(f'[{ESTILO}] bpm medido {60 / (per * 2):.2f}, fase {fase * 1000:.1f} ms, resíduo {res:.1f} ms, {usa.sum()} de {len(on)} onsets na grade')
def grade(t): return fase + round((t - fase) / (per / 2)) * (per / 2)

# ---------------------------------------------------------------- 3) efeitos (discretos, no timbre da trilha)
def deslize(d, g):        # atrito de corda: ruído de fibra, banda média, textura lenta
    t = tv(d); x = ruido(d, 500, 2600) * (0.7 + 0.3 * np.sin(2 * np.pi * 9 * t) ** 2); return x * env(len(t), 0.18, 0.4) * g
def toque(m, g):
    if ESTILO == 'violao': return violao_r(hz(m), 1.4, 0.6) * g * 1.2
    if ESTILO == 'piano': return piano(hz(m), 1.6, 0.5) * g * 1.3
    return rhodes(hz(m), 1.4, 0.6) * g * 1.4
def mx2(a, b):
    o = np.zeros(max(len(a), len(b))); o[:len(a)] += a; o[:len(b)] += b; return o
def fibras(d):            # fibras se soltando: estalinhos finos
    out = np.zeros(int(d * SR)); R = np.random.default_rng(9)
    for _ in range(34):
        j = int(R.uniform(0, d - 0.03) * SR); c = ruido(0.012, 3000, 9000) * np.exp(-tv(0.012) * 400) * R.uniform(0.03, 0.1); out[j:j + len(c)] += c
    return out * env(len(out), 0.1, 0.3)
def mergulho(d):          # ar passando: banda que sobe, sem "whoosh" de desenho animado
    n = int(d * SR); x = ruido(d, 250, 1200) * np.linspace(0.2, 1, n) ** 2 + ruido(d, 1200, 5000) * np.linspace(0, 1, n) ** 3 * 0.5
    return x * env(n, 0.3, 0.12) * 0.35
ac = []
def poe(nome, t, sig, pan=0.0):
    tg = grade(t); sfx.put(sig, tg, pan); ac.append({'efeito': nome, 'evento_s': round(t, 3), 'na_grade_s': round(tg, 3), 'desvio_ms': round((tg - t) * 1000, 1)})
def atrito(t0, t1, vel, g, semente):
    """atrito de corda: grãos curtos de ruído (stick-slip); a densidade e o volume seguem a velocidade da ponta"""
    R = np.random.default_rng(semente); d = t1 - t0; out = np.zeros(int(d * SR) + SR // 10); t = 0.0
    while t < d:
        v = vel((t0 + t - t0) / d)                                   # 0..1
        if v > 0.03:
            gr = ruido(R.uniform(0.004, 0.012), R.uniform(250, 600), R.uniform(1400, 2600)); n = len(gr); gr = gr * np.hanning(n) * R.uniform(0.4, 1.0) * v
            j = int(t * SR); out[j:j + n] += gr[: len(out) - j]
        t += 1 / (25 + 140 * v)
    return out * g
def rangido(d, g, semente):   # aperto: grãos graves e ressonantes, como fibra sendo comprimida
    R = np.random.default_rng(semente); out = np.zeros(int(d * SR) + 2400)
    for k in range(int(d * 90)):
        j = int(R.uniform(0, d) * SR); n = int(0.006 * SR); f0 = R.uniform(140, 380)
        gr = np.sin(2 * np.pi * f0 * tv(n / SR)) * np.hanning(n) * R.uniform(0.3, 1.0); out[j:j + n] += gr
    return filt(out, 'lowpass', 1400) * env(len(out), 0.04, 0.15) * g
def baque(g):                 # pano/corda assentando: grave curto e abafado
    t = tv(0.25); return (filt(ruido(0.25, 60, 500), 'lowpass', 400) * np.exp(-t * 28) + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 22) * 0.4) * g
vel_o = lambda k: (2.1 * (1 - k) ** 2 + 0.3) / 2.4          # derivada de 0,7·ease.o + 0,3·linear (normalizada), como a ponta no vídeo
vel_io = lambda k: 1 - (2 * k - 1) ** 2                     # derivada da cúbica entra-sai (forma)
if EFEITOS == 'toques':
    poe('deslize do nó', 0.0, deslize(T['noFim'] + 0.2, 0.12), -0.2)
    poe('deslize do título', T['noFim'] + 0.15, deslize(T['tituloFim'] - T['noFim'], 0.1), 0.3)
    poe('título completo', T['tituloFim'] + 0.15, toque(79, 0.35), -0.1)
    poe('mergulho', T['zoom0'], mergulho(T['zoom1'] - T['zoom0']), 0)
    poe('cordões se abrem', T['zoom1'] + 0.05, fibras(1.1), 0.2)
    poe('rótulo 3 CORDÕES', T['zoom1'] + 0.6, toque(74, 0.28), 0.25)
    poe('fios se abrem', T['abre1'] + 0.1, fibras(1.0) * 0.8, -0.2)
    poe('rótulo FIOS', T['abre1'] + 0.6, toque(76, 0.26), -0.25)
    poe('rótulo FIBRAS', T['fios1'], toque(78, 0.26), 0.3)
elif EFEITOS == 'foley':
    poe('atrito: a ponta desenha o nó', 0.0, atrito(0.0, T['noFim'], vel_o, 0.16, 1), -0.15)
    poe('aperto do nó', T['noFim'], rangido(0.3, 0.05, 2), 0.1)
    poe('atrito: a ponta corre sob o título', T['noFim'], atrito(T['noFim'], T['tituloFim'], vel_io, 0.13, 3), 0.25)
    poe('corda assenta', T['tituloFim'], baque(0.22), 0)
    poe('cordões se destorcem', T['zoom1'], mx2(rangido(1.0, 0.035, 4), fibras(1.1) * 0.6), 0.15)
    poe('fios se abrem', T['abre1'], fibras(1.0) * 0.45, -0.2)
elif EFEITOS == 'musical':
    ac.append({'efeito': 'trilha abafa no mergulho e abre na chegada (filtro na própria música) + grave na chegada', 'evento_s': T['zoom0'], 'na_grade_s': grade(T['zoom0']), 'desvio_ms': 0.0})
    poe('grave na chegada ao chicote', T['zoom1'], sub(hz(31), 1.4) * env(int(1.4 * SR), 0.005, 1.0) * 0.9, 0)
json.dump(ac, open('audio/acertos.json', 'w'), indent=1, ensure_ascii=False)
print('maior desvio da grade:', max([abs(a['desvio_ms']) for a in ac] or [0]), 'ms')

# ---------------------------------------------------------------- 4) mixagem
mus = reverb(music.x, **RV) + reverb(ritmo.x, dur=0.9, umido=0.12)
if EFEITOS == 'musical':
    # mergulho "para dentro" da corda: passa-baixas que fecha até ~500 Hz e reabre de uma vez na chegada
    from scipy.signal import sosfilt as _sf
    blk = 480; out = np.zeros_like(mus); zi = None; a0, a1 = int(T['zoom0'] * SR), int(T['zoom1'] * SR)
    for i in range(0, len(mus), blk):
        if i < a0 or i >= a1 + int(0.25 * SR): fc = 18000
        elif i < a1: fc = 18000 * (500 / 18000) ** (((i - a0) / (a1 - a0)) ** 0.7)
        else: fc = 500 * (18000 / 500) ** ((i - a1) / (0.25 * SR))
        sos = butter(2, min(fc, 20000), 'lowpass', fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2, 2))
        for c in range(2):
            out[i:i + blk, c], zi[:, c, :] = _sf(sos, mus[i:i + blk, c], zi=zi[:, c, :])
    mus = out
mixw = mus * 0.9 + reverb(sfx.x, dur=0.8, umido=0.1)
mixw = filt(mixw.T, 'highpass', 35).T
mixw = mixw[: int(FIM * SR)]
fo = int(0.5 * SR); mixw[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
def limitador(x, teto, look=0.005, rel=0.08):
    pk = np.abs(x).max(1); g = np.minimum(1.0, teto / np.maximum(pk, 1e-9)); g = minimum_filter1d(g, int(look * SR) * 2 + 1)
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]; out[i] = cur
    return x * out[:, None]
meter = pyln.Meter(SR); lim = 10 ** (-2 / 20)
for _ in range(4): mixw = pyln.normalize.loudness(mixw, meter.integrated_loudness(mixw), -14.0); mixw = limitador(mixw, lim * 0.97)
print(f'LUFS {meter.integrated_loudness(mixw):.2f}, pico {20 * np.log10(np.abs(mixw).max()):.2f} dBFS')
sf.write(f'audio/trilha_piloto_{ESTILO}_{EFEITOS}.wav', mixw.astype(np.float32), SR, subtype='PCM_24')
