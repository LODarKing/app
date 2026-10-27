"""Áudio do piloto de Felinos (0–10 s): trilha original + efeitos sintetizados, sincronizados com
remotion/src/felinos/timing.json. Sem voz: a narração do usuário entra depois da aprovação
(os trechos dela já recebem ducking de -7,5 dB na música). Saída: remotion/public/piloto_felinos_mix.wav,
-14 LUFS, pico <= -1,3 dBTP. Rodar a partir de FELINOS_WORK/."""
import json, sys, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
sys.path.insert(0, 'src/audio')
from dsp import tp_limiter

T = json.load(open('remotion/src/felinos/timing.json'))
WORDS = json.load(open('remotion/src/words_all.json'))
DUR = T['DUR']; SR = 48000; N = int(DUR * SR)
# auxiliares de síntese do sfx.py da série (só as definições)
src = open('src/audio/sfx.py').read().split('# ---- scene transitions')[0]
src = src.replace('DUR = 180.0', f'DUR = {DUR}').replace("B = [s['start'] for s in json.load(open('documentation/scene_bounds.json'))]", 'B = []')
G = {}; exec(src, G)
put, whoosh, thud, click, pop, chime, bell, add, shimmer, tvec, lp, bp = (G[k] for k in ['put', 'whoosh', 'thud', 'click', 'pop', 'chime', 'bell', 'add', 'shimmer', 'tvec', 'lp', 'bp'])
rng = np.random.default_rng(24)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'highpass', fs=SR, output='sos'), x)
def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e

# ---------------------------------------------------------------- vozes de animais (síntese aditiva com formantes)
def meow(d=0.62, f0=(560, 820, 470), F1=(380, 950, 520), F2=(2400, 1500, 950), gain=0.3):
    """'mi-au': contorno de f0 sobe e desce; formantes passam de /i/ para /a/ e /u/."""
    t = tvec(d); k = t / d
    def ctr(v): return np.interp(k, [0, 0.35, 1], v)
    f = ctr(f0) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    f1, f2 = ctr(F1), ctr(F2); out = np.zeros(len(t))
    for h in range(1, 26):
        fh = f * h
        w = np.exp(-((fh - f1) / 260) ** 2) + 0.7 * np.exp(-((fh - f2) / 380) ** 2) + 0.15 * np.exp(-((fh - 3300) / 500) ** 2)
        out += np.sin(h * ph) * w / h ** 0.6
    out += bp(rng.standard_normal(len(t)), 2000, 7000) * 0.05      # sopro
    e = np.minimum(1, t / 0.05) * np.clip((d - t) / 0.22, 0, 1) ** 1.3
    return out / np.abs(out).max() * e * gain
def roar(d=0.62, gain=0.55):
    t = tvec(d); k = t / d
    f = np.interp(k, [0, 0.25, 1], [95, 128, 82]) * (1 + 0.04 * rng.standard_normal(len(t)).cumsum() / np.sqrt(np.arange(1, len(t) + 1)))
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = sum(np.sin(h * ph) / h ** 0.8 for h in range(1, 30))
    tone = lp(tone, 1400, 2) + 0.5 * lp(np.sin(ph / 2), 200)       # sub-harmônico
    grit = bp(rng.standard_normal(len(t)), 250, 3200) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 34 * t)))
    x = tone * (1 + 0.5 * np.sin(2 * np.pi * 31 * t)) + grit * 1.4
    e = np.minimum(1, t / 0.07) ** 1.5 * np.clip((d - t) / 0.35, 0, 1) ** 1.2 * (0.85 + 0.15 * np.sin(np.pi * k))
    return x / np.abs(x).max() * e * gain
def heartbeat():
    return add(thud(52, 0.22, 0.6), np.concatenate([np.zeros(int(0.16 * SR)), thud(46, 0.2, 0.42)]))
def boing(d=0.42):
    t = tvec(d); f = 330 * (1 + 0.9 * np.exp(-t * 7)) * (1 + 0.08 * np.sin(2 * np.pi * 16 * t) * np.exp(-t * 4))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * np.minimum(1, t * 300) * 0.2
def birds(d, n=9):
    out = np.zeros(int(d * SR))
    for _ in range(n):
        s = rng.uniform(0, d - 0.3); f0 = rng.uniform(2600, 4200)
        for c in range(rng.integers(2, 5)):
            tt = tvec(0.07); f = f0 * (1 + 0.35 * np.sin(np.pi * tt / 0.07)); ch = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.07) ** 2 * 0.05
            j = int((s + c * 0.1) * SR); out[j:j + len(ch)] += ch[:len(out) - j]
    return out
def insects(d):
    t = tvec(d); return bp(rng.standard_normal(len(t)), 4500, 6500) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * t) ** 2) * 0.03 * env(len(t), 0.2, 0.2)
def rustle(d):
    t = tvec(d); return bp(rng.standard_normal(len(t)), 900, 5000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 2.2 * t))) * 0.05 * env(len(t), 0.1, 0.2)
def wind(d, lo=200, hi=900):
    t = tvec(d); return bp(rng.standard_normal(len(t)), lo, hi) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)) * 0.12 * env(len(t), 0.25, 0.3)
def soft_step(): return add(thud(70, 0.14, 0.16), lp(rng.standard_normal(int(0.06 * SR)), 1200) * 0.03)

# ---------------------------------------------------------------- efeitos sincronizados
for h in T['HEART']: put(heartbeat(), h, 0, 0.55, 'batimento')
put(whoosh(0.5, 2000, 6000) * 0.25, T['EYES_OPEN'] - 0.05, 0, 0.6, 'olhos se abrem')
put(meow(), T['MEOW'], 0.0, 1.0, 'miado')
put(whoosh(0.9, 150, 1200, up=True), T['PUSH0'] - 0.1, 0, 1.0, 'câmera entra no olho')
put(add(whoosh(0.35, 800, 8000, up=False), click(0.03)), T['CUT1'] - 0.04, 0, 1.1, 'corte')
put(birds(2.6, 8), T['CUT1'], 0.3, 1.2, 'pássaros (área de estudos)')
put(pop(700, 1200, 0.1), T['TILT'] + 0.05, -0.1, 0.5, 'inclina a cabeça')
put(chime(1568, 3, 0.07) * 0.5, T['HEARTS'], 0.0, 0.6, 'corações')
put(boing(), T['BOING'], 0.15, 1.0, 'efeito divertido (piscada lenta)')
put(meow(0.32, (700, 900, 760), (420, 700, 600), (2300, 1800, 1600), 0.16), T['CROUCH'] - 0.05, 0.05, 1.0, 'miadinho (prepara o salto)')
put(whoosh(0.7, 120, 900, up=True) * 1.4, T['LEAP'], 0, 1.0, 'vento no salto')
put(whoosh(0.5, 400, 4000, up=True), T['COVER'] - 0.25, 0, 1.2, 'silhueta passa pela lente')
put(add(thud(60, 0.4, 0.6), whoosh(0.4, 3000, 9000, up=False) * 0.6), T['COVER'] + 0.02, 0, 0.9, 'entra na floresta')
put(birds(1.3, 7) + insects(1.3) + rustle(1.3), T['COVER'], -0.2, 1.0, 'floresta tropical')
for k in range(4): put(soft_step(), T['COVER'] + 0.15 + k * 0.24, -0.2 + 0.1 * k, 0.9, 'passos da onça')
put(whoosh(0.3, 300, 6000) * 1.6, T['WHIP'] - 0.08, 0.6, 1.0, 'chicote de câmera')
put(wind(1.0, 300, 1500) + rustle(1.0) * 0.6 + birds(1.0, 3), T['WHIP'] + 0.05, 0.2, 0.9, 'bambuzal')
for k in range(3): put(soft_step(), T['WHIP'] + 0.2 + k * 0.28, 0.3 - 0.15 * k, 1.0, 'passos do tigre')
put(add(whoosh(0.3, 800, 8000, up=False), click(0.03)), T['CUT4'] - 0.04, 0, 1.0, 'corte savana')
put(wind(1.2, 150, 700) * 1.3, T['CUT4'], -0.1, 1.0, 'vento da savana')
put(roar(), T['ROAR'] - 0.02, 0.1, 1.0, 'rugido')
# o rugido vira impacto musical no título
put(add(thud(42, 0.9, 0.9), whoosh(0.6, 4000, 12000, up=False) * 0.8), T['CUT5'], 0, 1.1, 'impacto do título')
for i, tp in enumerate(T['PAWS']): put(add(thud(85 + 10 * i, 0.22, 0.5), click(0.03) * 0.4, pop(300, 520, 0.08)), tp + 0.15, -0.45 + 0.3 * i, 0.9, 'pegada')
for i in range(7): put(pop(520 + 70 * i, 1100 + 120 * i, 0.08), T['LETTERS'] + i * 0.04, (i - 3) * 0.12, 0.5, 'letra')
put(shimmer() * 0.7, T['LETTERS'] + 0.2, 0, 0.8, 'título brilha')
for i in range(6): put(pop(700 + 150 * i, 1500 + 200 * i, 0.06), T['LETTERS'] + 0.12 + i * 0.05, 0.3 - 0.12 * i, 0.4, 'confete')
for k, name in (('SUB', 'selo'), ('EN', 'selo'), ('SERIES', 'selo')): put(pop(480, 900, 0.1), T[k], 0, 0.45, name)
put(whoosh(0.32, 300, 7000, up=True) * 1.5, T['DIVE'], 0, 1.0, 'câmera atravessa a pegada')
sfx = np.stack([G['L'], G['R']], 1)[:N]

# ---------------------------------------------------------------- trilha original (Ré, 120 BPM)
BEAT = 0.5
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def saw(f, d, cut=2500):
    t = tvec(d); x = sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 14)); return lp(x, cut, 2)
mus = np.zeros((N, 2))
def mput(sig, t0, pan=0.0, g=1.0):
    i0 = int(t0 * SR); sig = sig[:max(0, N - i0)] * g
    if i0 >= N or len(sig) == 0: return
    mus[i0:i0 + len(sig), 0] += sig * np.cos((pan + 1) * np.pi / 4); mus[i0:i0 + len(sig), 1] += sig * np.sin((pan + 1) * np.pi / 4)
# 1) suspense: drone grave + harmônico frio
d = T['CUT1'] + 0.1; t = tvec(d)
mput((np.sin(2 * np.pi * hz(38) * t) * 0.5 + saw(hz(45), d, 500) * 0.25) * env(len(t), 0.4, 0.15) * 0.18, 0, 0)
mput(np.sin(2 * np.pi * hz(81) * t) * 0.04 * env(len(t), 0.8, 0.1) * (1 + 0.3 * np.sin(2 * np.pi * 5 * t)), 0, 0.3)
# 2) brincadeira: pizzicato leve (cordas dedilhadas) até o salto
notes = [62, 66, 69, 66, 74, 69, 66, 69, 62, 66, 69, 71, 73, 71, 69, 66]
tt = T['CUT1'] + 0.05; i = 0
while tt < T['LEAP'] - 0.05:
    mput(G['pluck'](hz(notes[i % len(notes)]), 0.5) * 2.6, tt, -0.25 + 0.5 * (i % 2), 1.0)
    if i % 4 == 0: mput(G['pluck'](hz(38 + (i // 8) % 2 * 5), 0.7) * 3.0, tt, 0, 1.0)
    if i % 8 == 4: mput(G['bell'](hz(86 + (i // 8) % 2 * 2), 0.6, 0.05), tt, 0.3, 1.0)
    tt += BEAT / 2; i += 1
# 3) subida (riser) no salto
d = T['COVER'] - T['LEAP'] + 0.1; t = tvec(d)
mput((whoosh(d, 200, 5000) * 2 + np.sin(2 * np.pi * np.cumsum(np.linspace(hz(50), hz(74), len(t))) / SR) * 0.08) * np.linspace(0.3, 1, len(t)), T['LEAP'], 0)
# 4) aventura: tambores, baixo em ostinato e acordes (Ré menor, Dó, Si bemol, Dó)
t0 = T['COVER']; chords = [(50, [62, 65, 69]), (48, [60, 64, 67]), (46, [58, 62, 65]), (48, [60, 64, 67])]
nb = int((T['CUT5'] - t0) / BEAT) + 1
for b in range(nb):
    tb = t0 + b * BEAT
    if tb >= T['CUT5'] - 0.02: break
    root, ch = chords[(b // 2) % 4]
    for e in range(2):
        te = tb + e * BEAT / 2
        if te < T['CUT5'] - 0.02: mput(saw(hz(root - 12), 0.22, 600) * env(int(0.22 * SR), 0.005, 0.1) * 0.35, te, 0)
    mput(thud(95 if b % 2 else 70, 0.3, 0.55), tb, -0.2 if b % 2 else 0.2)                    # tom-tons
    if b % 2 == 0:
        d = BEAT * 2; t = tvec(d)
        pad = sum(saw(hz(m), d, 1800) for m in ch) * env(len(t), 0.08, 0.2) * 0.07
        mput(pad, tb, -0.3); mput(pad, tb + 0.01, 0.3)
# 5) título: acorde cheio de Ré maior com tímpano, até o fim
d = DUR - T['CUT5']; t = tvec(d)
hit = sum(saw(hz(m), d, 2600) for m in [50, 57, 62, 66, 69, 74]) * np.exp(-t * 1.1) * 0.07
mput(hit, T['CUT5'], -0.25); mput(hit, T['CUT5'] + 0.012, 0.25)
for k in range(10): mput(thud(48, 0.25, 0.25), T['CUT5'] + 0.6 + k * 0.07, 0, 0.6 + 0.04 * k)   # rufar
mput(add(G['bell'](hz(86), 1.5, 0.12), G['bell'](hz(90), 1.5, 0.08)), T['LETTERS'] + 0.3, 0)

# ---------------------------------------------------------------- mixagem
meter = pyln.Meter(SR)
mg = -26.0 - meter.integrated_loudness(mus)
# ducking nos trechos reservados para a narração (planejados em words_all.json)
act = np.zeros(N)
for w in WORDS: act[int((w['s'] - 0.1) * SR):int((w['e'] + 0.15) * SR)] = 1
blk = 480; a = act[::blk]; smv = np.zeros_like(a); s = 0.0
for i, v in enumerate(a): s += (v - s) * (0.33 if v > s else 0.022); smv[i] = s
# sem a voz (piloto de imagem) o ducking é leve; com a narração do usuário volta a -7,5 dB
DUCK_DB = -7.5 if len(sys.argv) > 1 and sys.argv[1] == '--com-voz' else -3.0
duck = np.repeat(10 ** (DUCK_DB * smv / 20), blk)[:N]
x = mus * 10 ** (mg / 20) * duck[:, None] + sfx * 10 ** (-1 / 20)
fade = np.ones(N); fi = int(0.02 * SR); fo = int(0.25 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
x *= fade[:, None]
y = x
for _ in range(3):
    gain = -14.0 - meter.integrated_loudness(y)
    x = x * 10 ** (gain / 20); y = tp_limiter(x, -1.3, sr=SR)[0]
x = y
sf.write('remotion/public/piloto_felinos_mix.wav', x.astype(np.float32), SR, subtype='PCM_24')
json.dump(G['LOG'], open('documentation/SFX_CUES_piloto.json', 'w'), ensure_ascii=False, indent=1)
print('mix piloto', round(meter.integrated_loudness(x), 2), 'LUFS, pico', round(20 * np.log10(np.abs(x).max()), 2), 'dBFS,', len(G['LOG']), 'efeitos')
