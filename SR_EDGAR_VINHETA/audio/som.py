"""SR. EDGAR — trilha e efeitos sintetizados em código (sem amostras), semente fixa.
Ré menor, 80 bpm. Os eventos vêm de timeline.json (em batidas) — os mesmos que a animação usa.
Saída: audio/trilha.wav (música), audio/efeitos.wav (foley), audio/mix.wav (master -14 LUFS, pico real ≤ -1 dBTP),
       audio/beats.json (grade MEDIDA por onsets da música) e audio/beats.js (grade + timeline para a página).
Uso: python3 audio/som.py   (rodar da pasta do projeto)"""
import json, numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly
from scipy.ndimage import uniform_filter1d, minimum_filter1d
import pyloudnorm as pyln

SR = 48000
rng = np.random.default_rng(2016)
TL = json.load(open('timeline.json'))
BPM = TL['bpm']; P = 60 / BPM; DUR = TL['dur']
def B(k): return k * P                      # grade planejada (a medida é conferida no fim)
EV = {k: ([B(x) for x in v] if isinstance(v, list) else B(v)) for k, v in TL['eventos'].items()}
N = int(DUR * SR)

# ------------------------------------------------------------------ utilidades
def tv(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def env(n, a, r):
    e = np.ones(n); na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na) ** 1.5
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e
def ruido(n): return rng.standard_normal(n)

class Bus:
    def __init__(s, n=N + SR * 3): s.x = np.zeros((n, 2))
    def put(s, sig, t, pan=0.0, g=1.0):
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.stack([sig * l, sig * r], 1) * np.sqrt(2)
        i = int(round(t * SR))
        if i < 0: sig = sig[-i:]; i = 0
        k = min(len(sig), len(s.x) - i)
        if k > 0: s.x[i:i + k] += sig[:k] * g

def reverb(x, dur=2.2, umido=0.25, pre=0.02, brilho=5500, semente=7):
    r = np.random.default_rng(semente); n = int(dur * SR); t = np.arange(n) / SR
    out = np.zeros_like(x)
    for c in range(2):
        ir = r.standard_normal(n) * np.exp(-t * 6.9 / dur)
        ir = filt(ir, 'lowpass', brilho) * (1 - 0.5 * np.exp(-t * 30))
        ir[: int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR)); ir /= np.sqrt(np.sum(ir ** 2))
        wet = fftconvolve(x[:, c], ir)[: len(x)]
        p = int(pre * SR); out[p:, c] += wet[: len(x) - p] * umido
    return x * (1 - umido * 0.4) + out

# ------------------------------------------------------------------ timbres orgânicos
def cello(f, d, vel=0.8, att=0.18, rel=0.5, vozes=3, brilho=1500):
    """naipe de cordas graves: serra aditiva com queda suave de harmônicos (sem nasal), vibrato que entra devagar,
    formantes de corpo de madeira (≈ 250 Hz e 650 Hz), ruído de arco discreto"""
    t = tv(d); out = np.zeros(len(t))
    for v in range(vozes):
        det = (v - (vozes - 1) / 2) * 0.0026; vr = 4.9 + v * 0.37; ph0 = rng.uniform(0, 6.28)
        vib = 1 + 0.0032 * np.clip((t - 0.3) / 0.5, 0, 1) * np.sin(2 * np.pi * vr * t + ph0)
        ph = 2 * np.pi * np.cumsum(f * (1 + det) * vib) / SR
        nh = int(max(3, min(40, brilho * 2.5 / f)))
        out += sum(np.sin(k * ph + ph0 * k) / k ** 1.25 * (1 / (1 + (k * f / brilho) ** 2)) for k in range(1, nh + 1))
    out /= vozes
    corpo = out + filt(out, 'bandpass', [200, 320]) * 0.6 + filt(out, 'bandpass', [520, 800]) * 0.35
    arco = filt(ruido(len(t)), 'bandpass', [700, 2500]) * 0.008
    y = filt(corpo + arco, 'lowpass', brilho * 1.4)
    e = env(len(t), att, rel)
    return y * e * vel * 0.30

def _ks(f, d, damp, exc_lp):
    n = int(SR / f); buf = filt(rng.uniform(-1, 1, n), 'lowpass', exc_lp); out = np.zeros(int(d * SR)); i = 0
    while i < len(out):
        k = min(n, len(out) - i); out[i:i + k] = buf[:k]; buf = 0.5 * (buf + np.roll(buf, -1)) * damp; i += k
    return out

def contrabaixo(f, d=1.4, vel=1.0):
    """pizzicato de contrabaixo: corda (Karplus-Strong) + fundamental; brilho do ataque some rápido (como a corda real)"""
    t = tv(d); y = _ks(f, d, 0.993, 800) * 0.8 + np.sin(2 * np.pi * f * t) * np.exp(-t * 3.0) * 0.8
    dedo = filt(ruido(len(t)), 'bandpass', [500, 2000]) * np.exp(-t * 140) * 0.15
    y = np.tanh((y + dedo) * 1.15 * vel)
    y = filt(y, 'lowpass', 2600) * np.exp(-t * 10) * 1.2 + filt(y, 'lowpass', 420) * 0.6 + filt(y, 'bandpass', [150, 900]) * 0.7 * np.exp(-t * 3)
    return y * env(len(t), 0.003, 0.2) * 0.45

def piano(f, d=3.0, vel=0.8):
    t = tv(d); Bi = 0.00035; out = np.zeros(len(t))
    for k in range(1, 16):
        fk = k * f * np.sqrt(1 + Bi * k * k)
        if fk > 11000: break
        a = (1 / k ** 1.15) * (vel ** (1 + k * 0.07)); dec = 0.9 + 0.5 * k
        for det in (-0.0009, 0.0011):
            out += a * 0.5 * np.sin(2 * np.pi * fk * (1 + det) * t + rng.uniform(0, 6.28)) * (0.65 * np.exp(-t * dec) + 0.35 * np.exp(-t * dec * 0.2))
    martelo = filt(ruido(len(t)), 'bandpass', [300, 2600]) * np.exp(-t * 80) * 0.05 * vel
    return (out + martelo) * env(len(t), 0.002, 0.3) * 0.32

def timpano(f, d=2.4, vel=1.0):
    """tímpano: modos de membrana com pele, baqueta de feltro"""
    t = tv(d); out = np.zeros(len(t)); gl = 1 + 0.012 * np.exp(-t * 25)
    for r, a, dc in [(1, 1, 1.7), (1.504, 0.55, 2.6), (1.742, 0.3, 3.4), (2.0, 0.32, 3.8), (2.245, 0.18, 4.6), (2.494, 0.14, 5.5)]:
        out += a * np.sin(2 * np.pi * np.cumsum(f * r * gl) / SR + rng.uniform(0, 6)) * np.exp(-t * dc)
    feltro = filt(ruido(len(t)), 'lowpass', 900) * np.exp(-t * 45) * 0.35
    return np.tanh((out + feltro) * 1.2 * vel) * env(len(t), 0.002, 0.4) * 0.5

def tambor(f0=95, d=0.9, vel=1.0):
    """tambor de moldura grave (pele, mão)"""
    t = tv(d); f = f0 * (1 + 0.6 * np.exp(-t * 30))
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    pele = filt(ruido(len(t)), 'bandpass', [180, 1400]) * np.exp(-t * 32) * 0.25
    return np.tanh((corpo + pele) * 1.4 * vel) * env(len(t), 0.001, 0.15) * 0.55

def impacto(d=3.2, vel=1.0):
    """batida cinematográfica grave: sub com queda de altura + corpo saturado (aparece no alto-falante do celular) + ar"""
    t = tv(d); f = 36 + 40 * np.exp(-t * 7)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.25)
    corpo = np.tanh(np.sin(2 * np.pi * np.cumsum(f * 2.0) / SR) * 2.2) * np.exp(-t * 4) * 0.35
    soco = filt(ruido(len(t)), 'bandpass', [90, 700]) * np.exp(-t * 28) * 0.6
    ar = filt(ruido(len(t)), 'lowpass', 2500) * np.exp(-t * 3.2) * 0.07 * np.clip(t / 0.02, 0, 1)
    estalo = filt(ruido(len(t)), 'highpass', 2500) * np.exp(-t * 300) * 0.25
    return (sub * 0.55 + corpo * 1.3 + soco + ar + estalo) * env(len(t), 0.0015, 0.6) * vel * 0.8

def celesta(f, d=1.6, vel=0.5):
    """sino suave (celesta de feltro): FM com índice que cai"""
    t = tv(d); idx = 1.4 * np.exp(-t * 7) + 0.15
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 3.5 * t)) * (0.7 * np.exp(-t * 3) + 0.3 * np.exp(-t * 0.9))
    return y * env(len(t), 0.002, 0.3) * vel * 0.22

def brilho_metal(d, f0=2900, vel=0.3):
    """chiado de metal arqueado (prato/crotal): parciais inarmônicos com batimento, ataque lento"""
    t = tv(d); y = np.zeros(len(t))
    for r, a in [(1, 1), (1.47, 0.7), (2.09, 0.5), (2.73, 0.35), (3.41, 0.25)]:
        for det in (0, 1.7):
            y += a * np.sin(2 * np.pi * (f0 * r + det) * t + rng.uniform(0, 6))
    return y * env(len(t), d * 0.45, d * 0.5) * vel * 0.05

def sopro(d, lo, hi, att, g=1.0):
    """subida de ar (névoa / linha de luz) — ruído filtrado que cresce"""
    t = tv(d); x = filt(ruido(len(t)), 'bandpass', [lo, hi])
    return x * (np.clip(t / (d * att), 0, 1) ** 2) * env(len(t), 0.01, 0.08) * g

# ------------------------------------------------------------------ foley de metal
def modos(t, parciais, vel):
    return sum(a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t * dc) for f, a, dc in parciais) * vel

def tesoura_fecha(vel=1.0, d=0.7):
    """corte: lâminas deslizando (atrito que sobe de altura até as pontas) → batida das lâminas + anel metálico + pino"""
    t = tv(d); n = len(t)
    sl = int(0.075 * SR); x = ruido(n)
    fc = 2600 + 6000 * np.clip(t / 0.075, 0, 1) ** 1.6
    desl = np.zeros(n)                      # atrito com filtro que varre (blocos)
    for i in range(0, sl, 240):
        j = min(i + 240, sl); f = fc[i]
        desl[i:j] = filt(x[max(0, i - 800):j], 'bandpass', [f * 0.7, min(f * 1.35, 20000)])[-(j - i):]
    desl *= np.clip(t / 0.06, 0, 1) ** 0.7 * (t < 0.075) * 0.55
    t2 = np.clip(t - 0.075, 0, None); on = t >= 0.075
    anel = modos(t2, [(2350, 1, 28), (3915, 0.7, 34), (5480, 0.55, 40), (7130, 0.4, 48), (9020, 0.3, 60), (4410, 0.3, 22)], 0.35) * on
    clique = filt(ruido(n), 'highpass', 3000) * np.exp(-t2 * 900) * on * 0.9
    pino = np.sin(2 * np.pi * 820 * t2) * np.exp(-t2 * 70) * on * 0.25 + np.sin(2 * np.pi * 190 * t2) * np.exp(-t2 * 55) * on * 0.3
    return (desl + anel + clique + pino) * vel * 0.8

def tesoura_abre(d=0.32, vel=1.0):
    """abertura: atrito suave descendo + estalinho do pino no fim"""
    t = tv(d); x = ruido(len(t)); y = np.zeros(len(t))
    for i in range(0, len(t), 240):
        j = min(i + 240, len(t)); f = 5200 - 2600 * (i / len(t))
        y[i:j] = filt(x[max(0, i - 800):j], 'bandpass', [f * 0.75, f * 1.3])[-(j - i):]
    y *= np.sin(np.pi * np.clip(t / (d * 0.85), 0, 1)) ** 1.5 * 0.22
    tc = np.clip(t - d * 0.8, 0, None); on = t >= d * 0.8
    tic = (filt(ruido(len(t)), 'highpass', 3500) * np.exp(-tc * 700) * 0.35 + modos(tc, [(3100, 1, 60), (5200, 0.6, 80)], 0.1)) * on
    return (y + tic) * vel

def navalha(d=1.2, vel=1.0):
    """navalha: lâmina deslizando (ressonância que sobe 1,8→6,5 kHz) + anel longo de aço com batimento"""
    t = tv(d); x = ruido(len(t)); y = np.zeros(len(t)); ds = 0.5
    for i in range(0, int(ds * SR), 240):
        j = min(i + 240, len(t)); u = i / (ds * SR); f = 1800 + 4700 * u ** 0.8
        y[i:j] = filt(x[max(0, i - 1200):j], 'bandpass', [f * 0.82, f * 1.2], 2)[-(j - i):]
    y *= np.sin(np.pi * np.clip(t / ds, 0, 1)) ** 1.2 * (t < ds) * 0.5
    t2 = np.clip(t - 0.2, 0, None); on = (t >= 0.2) * np.clip((t - 0.2) / 0.08, 0, 1)
    anel = sum(a * (np.sin(2 * np.pi * f * t2) + np.sin(2 * np.pi * (f + 2.3) * t2)) * np.exp(-t2 * dc) for f, a, dc in [(3170, 1, 3.5), (4870, 0.7, 4.5), (6630, 0.5, 5.5), (8410, 0.3, 7)]) * on * 0.045
    return (y + anel) * env(len(t), 0.005, 0.25) * vel

def clique_metal(vel=1.0):
    t = tv(0.35)
    return (filt(ruido(len(t)), 'highpass', 2500) * np.exp(-t * 600) * 0.6 + modos(t, [(1850, 1, 30), (2930, 0.6, 38), (4400, 0.4, 50)], 0.25) + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 40) * 0.35) * vel * 0.7

def pena(d=0.5, vel=1.0):
    """traço de pena/pincel para 'Barbearia' (muito discreto)"""
    t = tv(d); x = filt(ruido(len(t)), 'bandpass', [2500, 7000])
    mod = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * t))
    return x * mod * np.sin(np.pi * np.clip(t / d, 0, 1)) * 0.05 * vel

# ------------------------------------------------------------------ 1) música
mus = Bus(); perc = Bus(); ritmo = Bus()   # ritmo = contrabaixo (vai junto com a percussão na medição da grade)
D1, A1, D2, F2, A2, D3, E3, F3, G3, A3, C4, D4, E4, F4, A4, D5 = 26, 33, 38, 41, 45, 50, 52, 53, 55, 57, 60, 62, 64, 65, 69, 74
Bb1, G1, C2, Bb2, G2, C3, Cs3 = 34, 31, 36, 46, 43, 48, 49
# 0 → 1,5 s: escuro; nota pedal grave que respira
mus.put(cello(hz(D2), 2.0, 0.34, att=0.9, rel=0.6, vozes=3, brilho=700), 0.05, -0.1)
mus.put(cello(hz(A2), 1.8, 0.18, att=0.9, rel=0.6, vozes=2, brilho=700), 0.25, 0.15)
# 1,5 → 3 s: construção — contrabaixo e tambor de moldura no tempo, cordas em quintas
for k, m in [(2, D2), (3, D2), (3.5, A1), (4, D2)]:
    ritmo.put(contrabaixo(hz(m), 1.2, 0.9 if k % 1 == 0 else 0.6), B(k), 0, 0.95)
for k, v in [(2, 0.7), (3, 1.0), (3.5, 0.45), (4, 0.8), (4.25, 0.35)]:
    perc.put(tambor(92, 0.9, v), B(k), 0, 0.8)
mus.put(cello(hz(D3), 1.9, 0.5, att=0.35, rel=0.5, brilho=3000), B(2), -0.35)
mus.put(cello(hz(A3), 1.5, 0.38, att=0.45, rel=0.5, brilho=3000), B(2.5), 0.35)
mus.put(cello(hz(F3), 1.0, 0.36, att=0.3, rel=0.35, brilho=3000), B(3.5), 0.1)
# subida para o nome + respiro (silêncio curto antes do impacto)
pre = Bus(); pre.put(sopro(B(5) - 2.0, 300, 4000, 0.92, 0.12), 2.0, 0)
fade_pre = np.ones(len(pre.x)); a_, b_ = int((B(5) - 0.09) * SR), int(B(5) * SR); fade_pre[a_:b_] = np.linspace(1, 0, b_ - a_); fade_pre[b_:] = 0
mus.x += pre.x * fade_pre[:, None]
# 3,75 s: SR.EDGAR — impacto grave, tímpano, piano grave, naipe em ré menor
hit = EV['nome']
mus.put(impacto(3.4, 1.0), hit, 0, 1.5)
mus.put(timpano(hz(D2), 2.6, 1.0), hit, 0, 0.8)
for m, g in [(D1, 0.7), (D2, 0.8), (A2, 0.6), (D3, 0.6), (F3, 0.4), (A3, 0.4), (D4, 0.35)]: mus.put(piano(hz(m), 3.2, 0.95), hit, 0, g)
for m, pan, g in [(D2, -0.2, 0.55), (A2, 0.2, 0.45), (D3, -0.4, 0.45), (F3, 0.4, 0.42), (A3, 0, 0.36)]:
    mus.put(cello(hz(m), B(6) - hit + 0.25, g * 0.8, att=0.03, rel=0.35, brilho=3200), hit, pan)
# violas/violinos em surdina: ar no médio-agudo do impacto até o fim
for m, pan, g, t0, d in [(A4, -0.5, 0.20, hit, DUR - hit + 0.6), (D5, 0.5, 0.15, hit + 0.02, DUR - hit + 0.6), (F4, 0, 0.14, B(6), DUR - B(6) + 0.6)]:
    mus.put(cello(hz(m), d, g, att=0.35, rel=1.2, vozes=4, brilho=4200), t0, pan)
# cadência i – VI – III – iv – V → i (assinatura)
prog = [(6, Bb1, [Bb2, D3, F3]), (7, F2, [A2, C3, F3]), (8, G1, [G2, Bb2, D3]), (8.5, A1, [A2, Cs3, E3])]
for i, (k, baixo_, ac) in enumerate(prog):
    d = (prog[i + 1][0] if i + 1 < len(prog) else 9) - k
    ritmo.put(contrabaixo(hz(baixo_), max(d * P + 0.4, 0.8), 0.85), B(k), 0, 0.9)
    for j, m in enumerate(ac): mus.put(cello(hz(m), d * P + 0.3, 0.32, att=0.12, rel=0.3, vozes=2, brilho=3200), B(k), -0.4 + 0.4 * j)
for k, v in [(6, 0.75), (7, 0.8), (7.5, 0.35), (8, 0.85), (8.5, 0.6), (8.75, 0.45)]:
    perc.put(tambor(90, 0.9, v), B(k), 0, 0.75)
# ostinato de piano abafado em colcheias (registro médio): pulsação e presença no alto-falante do celular
ARP = {2: [D4 - 12 + 12, A3, F4, A3], 4: [D4, A3, F4, A3], 6: [Bb2 + 24, F4 - 12 + 12, D4, F4], 7: [A3, C4, F4, C4], 8: [G3, Bb2 + 12, D4, Bb2 + 12], 8.5: [A3, Cs3 + 12, E4, Cs3 + 12]}
def arpejo(k0, k1, notas, g):
    k = k0; i = 0
    while k < k1 - 1e-6:
        if not (B(5) - 0.3 < B(k) < B(5)):
            mus.put(filt(piano(hz(notas[i % len(notas)]), 1.1, 0.45), 'lowpass', 2600), B(k), 0.25 if i % 2 else -0.15, g * (1.0 if i % 2 == 0 else 0.75))
        k += 0.5; i += 1
arpejo(2.5, 4.5, ARP[2], 0.20); arpejo(5.5, 6, ARP[4], 0.18); arpejo(6, 7, ARP[6], 0.2); arpejo(7, 8, ARP[7], 0.2); arpejo(8, 8.5, ARP[8], 0.2); arpejo(8.5, 9, ARP[8.5], 0.2)
# camada metálica no impacto (anel de tesoura uma oitava abaixo): liga a batida à marca
_t = tv(2.0); mus.put(modos(_t, [(1175, 1, 3.2), (1957, 0.7, 4), (2740, 0.5, 5), (3565, 0.35, 6)], 0.05) * env(len(_t), 0.002, 0.3), EV['nome'], 0, 1.0)
# melodia discreta de piano para "Barbearia" e "EST. 2016"
for k, m, g in [(7, A4, 0.32), (7.5, D5, 0.26), (8, F4, 0.22), (8.5, E4, 0.24)]: mus.put(piano(hz(m), 2.2, 0.55), B(k), 0.2, g)
# estrelas: sininhos de feltro no reflexo de cada uma
est0 = EV['estrelas'][0]
for ord_, m in zip(range(4), [86, 89, 93, 98]):
    mus.put(celesta(hz(m), 1.4, 0.55), est0 + 0.32 + ord_ * 0.09 + 0.15, [-0.6, -0.3, 0.6, 0.3][ord_], 0.8)
# brilho metálico que percorre o emblema
mus.put(brilho_metal(EV['brilho'][1] - EV['brilho'][0] + 0.3, 2900, 0.5), EV['brilho'][0], 0.1)
# 6,75 s: assinatura final — ré menor com nona, contrabaixo, tímpano suave, impacto menor
fin = EV['corte_final']; dfin = DUR - fin + 1.5
mus.put(impacto(2.6, 0.55), fin, 0, 1.0)
mus.put(timpano(hz(D2), 2.2, 0.6), fin, 0, 0.6)
ritmo.put(contrabaixo(hz(D2), 2.0, 1.0), fin, 0, 0.9)
for m, g in [(D2, 0.7), (A2, 0.5), (D3, 0.45), (F3, 0.38), (E4, 0.22), (A4, 0.2)]: mus.put(piano(hz(m), dfin, 0.75), fin, 0.1, g)
for m, pan, g in [(D2, -0.2, 0.45), (A2, 0.2, 0.38), (D3, -0.4, 0.34), (F3, 0.4, 0.3), (A3, 0, 0.26)]:
    mus.put(cello(hz(m), dfin, g, att=0.05, rel=1.0, brilho=3200), fin, pan)

musica = reverb(mus.x + ritmo.x, 2.6, 0.30, brilho=5200, semente=11) + reverb(perc.x, 1.4, 0.18, brilho=4500, semente=12)
# respiro antes do nome: a música recua ~12 dB nos 130 ms anteriores ao impacto (o golpe chega no "vácuo")
duck = np.ones(len(musica)); a_, b_, c_ = int((B(5) - 0.30) * SR), int((B(5) - 0.13) * SR), int((B(5) - 0.004) * SR)
duck[a_:b_] = np.linspace(1, 0.25, b_ - a_); duck[b_:c_] = 0.25; duck[c_:int(B(5) * SR)] = np.linspace(0.25, 1, int(B(5) * SR) - c_)
musica *= duck[:, None]
# EQ da música para ler no celular: graves −5 dB abaixo de ~110 Hz, presença +5 dB em 0,7–3 kHz
def eq(x):
    lo = filt(x.T, 'lowpass', 110, 2).T; pres = filt(x.T, 'bandpass', [700, 3000], 2).T
    return x - 0.44 * lo + 0.75 * pres
musica = eq(musica)

# ------------------------------------------------------------------ 2) grade medida (onsets graves da música)
mono = perc.x.mean(1)[:N]; lo_ = filt(mono, 'bandpass', [400, 4000]); hop = 48   # transientes (pele, dedo na corda)
# envelope de energia (janela de 4 ms olhando para trás) → fluxo positivo do log, com porta de nível
e = uniform_filter1d(lo_ ** 2, 144, origin=71)[::hop]; lvl = 10 * np.log10(e + 1e-12)
flux = np.maximum(0, lvl[8:] - np.maximum.accumulate(lvl)[:-8] * 0 - lvl[:-8]); flux = np.r_[np.zeros(8), flux]
gate = lvl > lvl.max() - 40
cand = [k for k in range(1, len(flux) - 1) if gate[k] and flux[k] > 10 and flux[k] >= flux[k - 1] and flux[k] >= flux[k + 1]]
on = []
for k in cand:
    t = k * hop / SR
    if not on or t - on[-1] > P * 0.3: on.append(t - 8 * hop / SR * 0.5)
print('onsets:', [round(x, 3) for x in on])
on = np.array(on); E8 = P / 2
usa = np.abs(on - np.round(on / E8) * E8) < 0.04
for _ in range(3):
    idx = np.round(on / E8); A = np.vstack([idx[usa], np.ones(usa.sum())]).T
    per, fase = np.linalg.lstsq(A, on[usa], rcond=None)[0]; r = np.abs(on - (idx * per + fase)); usa = r < 0.02
periodo = per * 2
batidas = [round(fase + k * periodo, 4) for k in range(int(DUR / periodo) + 1)]
info = {'bpm_medido': round(60 / periodo, 3), 'fase_s': round(float(fase), 4), 'periodo_s': round(float(periodo), 5),
        'residuo_max_ms': round(float(r[usa].max() * 1000), 1), 'onsets_na_grade': int(usa.sum()), 'onsets_total': int(len(on)), 'batidas': batidas}
json.dump(info, open('audio/beats.json', 'w'), indent=1)
open('audio/beats.js', 'w').write('window.BEATS=' + json.dumps({'fase': info['fase_s'], 'periodo': info['periodo_s'], 'batidas': batidas}) + ';\nwindow.TIMELINE=' + json.dumps(TL) + ';\n')
print(f"grade medida: {info['bpm_medido']} bpm, fase {fase * 1000:.1f} ms, {usa.sum()}/{len(on)} onsets na grade, resíduo máx {info['residuo_max_ms']} ms")
def Bm(k): return fase + k * periodo          # efeitos sincronizados pela grade MEDIDA
EVm = {k: ([Bm(x) for x in v] if isinstance(v, list) else Bm(v)) for k, v in TL['eventos'].items()}

# ------------------------------------------------------------------ 3) efeitos (sincronizados aos movimentos)
fx = Bus()
fx.put(tesoura_abre(0.30, 0.9), EVm['tesoura_abre'][0] - 0.02, -0.25)
fx.put(tesoura_fecha(1.0), EVm['tesoura_corte'] - 0.075, -0.2)           # o choque das lâminas cai na batida
fx.put(tesoura_abre(0.36, 0.7), EVm['tesoura_reabre'][0], -0.2)
fx.put(navalha(1.3, 0.9), EVm['navalha_desliza'][0] - 0.03, 0.35)
fx.put(sopro(0.55, 200, 2400, 0.7, 0.05), EVm['cena2'] - 0.3, 0)           # ar do recuo da câmera
fx.put(clique_metal(0.9), EVm['encaixe'], -0.45); fx.put(clique_metal(0.75), EVm['encaixe'] + 0.012, 0.45)
fx.put(brilho_metal(1.1, 3400, 0.35), EVm['aneis'][0], -0.3); fx.put(brilho_metal(1.1, 3550, 0.35), EVm['aneis'][0] + 0.03, 0.3)
fx.put(sopro(0.9, 1500, 7000, 0.5, 0.025), EVm['arcos_baixo'][0], 0)
fx.put(sopro(0.6, 1800, 7500, 0.5, 0.03), EVm['faixa'][0], 0)
fx.put(pena(0.5, 1.0), EVm['barbearia'] - 0.05, 0.1)
fx.put(tesoura_fecha(1.0), EVm['corte_final'] - 0.075, -0.25)             # o corte final é a assinatura
efeitos = reverb(fx.x, 0.9, 0.16, pre=0.008, brilho=8000, semente=13)

# ------------------------------------------------------------------ 4) master
def sat(x, k=1.0): return np.tanh(x * k) / np.tanh(k)
mix = musica * 0.95 + efeitos * 0.75
mix = mix[: N]
fo = int(0.30 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
fi = int(0.004 * SR); mix[:fi] *= np.linspace(0, 1, fi)[:, None]
mix = filt(mix.T, 'highpass', 34).T                              # tira subgrave inútil
# compressão suave (RMS, 3:1 acima de -18 dB)
lvl = np.sqrt(uniform_filter1d((mix ** 2).mean(1), int(0.03 * SR)) + 1e-12)
db = 20 * np.log10(lvl); gr = np.where(db > -14, (db + 14) * (1 - 1 / 2), 0); gain = 10 ** (-gr / 20)
mix = mix * uniform_filter1d(gain, int(0.01 * SR))[:, None]
meter = pyln.Meter(SR)
def tp(x): return np.abs(resample_poly(x, 4, 1, axis=0)).max()
def limitar(x, teto):
    """limitador com antecipação de 5 ms e soltura de 80 ms, medindo pico real (4×)"""
    up = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)[: len(x) * 4].reshape(-1, 4).max(1)
    need = np.minimum(1, teto / np.maximum(up, 1e-9)); w = int(0.005 * SR)
    g = uniform_filter1d(minimum_filter1d(need, 2 * w + 1), w)
    rel = np.exp(-1 / (0.08 * SR)); out = np.empty_like(g); c = 1.0
    for i in range(len(g)):
        c = g[i] if g[i] < c else g[i] + (c - g[i]) * rel; out[i] = c
    return x * out[:, None]
teto = 10 ** (-1.2 / 20)
for _ in range(4):
    L = meter.integrated_loudness(mix); mix = mix * 10 ** ((-14.0 - L) / 20); mix = limitar(mix, teto)
L = meter.integrated_loudness(mix); TP = 20 * np.log10(tp(mix))
print(f'master: {L:.2f} LUFS integrados, pico real {TP:.2f} dBTP')
import soundfile as sf
sf.write('audio/mix.wav', mix.astype(np.float32), SR, subtype='PCM_24')
sf.write('audio/trilha.wav', (musica[:N] * 0.5).astype(np.float32), SR, subtype='PCM_24')
sf.write('audio/efeitos.wav', (efeitos[:N] * 0.5).astype(np.float32), SR, subtype='PCM_24')
json.dump({'lufs_integrado': round(L, 2), 'pico_real_dbtp': round(TP, 2), 'grade': {k: v for k, v in info.items() if k != 'batidas'},
           'efeitos_s': {k: (round(v, 3) if not isinstance(v, list) else [round(x, 3) for x in v]) for k, v in EVm.items()}},
          open('audio/relatorio_audio.json', 'w'), indent=1, ensure_ascii=False)

# ------------------------------------------------------------------ 5) conferência: energia por banda em cada cena (dB rel. ao total)
def bandas(x):
    m = x.mean(1); out = []
    for lo, hi in [(30, 120), (120, 500), (500, 2000), (2000, 6000), (6000, 16000)]:
        out.append(10 * np.log10(np.mean(filt(m, 'bandpass', [lo, hi], 4) ** 2) + 1e-12))
    return out
print('cena          LUFS   30-120 120-500 500-2k 2k-6k 6k-16k')
for nome, a, b in [('c1 0-1.5', 0, 1.5), ('c2 1.5-3', 1.5, 3), ('c3 3-5', 3, 5), ('c4 5-6.5', 5, 6.5), ('c5 6.5-8', 6.5, 8)]:
    x = mix[int(a * SR): int(b * SR)]; bd = bandas(x)
    print(f'{nome:12s} {meter.integrated_loudness(x):6.1f} ' + ' '.join(f'{v:6.1f}' for v in bd))
