"""Assinatura sonora "Enquanto Isso em Amontada…" (Rackel Sousa) — GLAM POP NEWS.

Tudo sintetizado em código (numpy/scipy), sem amostras nem modelos de terceiros. Semente fixa: o resultado é idêntico
a cada execução. Os tempos vêm de src/timeline.json (os mesmos que a animação usa).

DNA: 120 BPM, Fá menor. Motivo Dó5 → Fá5 → Mi♭5 · (pausa) · Lá♭5 → Fá5 em semicolcheias 0, 1, 3, 6, 8.
  - 0,000 s  provocação: as três primeiras notas (clique "pock" + nota de vidro) — pergunta sem resposta
  - 2,000 s  motivo completo: beijo (Dó) → "Enquanto" (Fá) → "Isso" (Mi♭) → pausa → batom em "Amontada" (Lá♭) → impacto (Fá)
  - 3,25 s   eco nas reticências (Mi♭6 Lá♭6 Fá6) — a última nota fecha e serve de encerramento em outros conteúdos

Uso (a partir de VINHETA_ENQUANTO_ISSO/):  python3 audio/sonic_logo.py
Saídas: entregaveis/rackel-sonic-logo/ (final, mp3, instrumental, curta, stems, estudos A/B/C)
        public/audio/vinheta_mix.wav (som do vídeo) e audio/beats.json (grade medida)."""
import json, os, subprocess, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly, lfilter, iirpeak, lfilter_zi

SR = 48000
T = json.load(open('src/timeline.json'))
DUR = T['duracao']; N = int(round(DUR * SR)); BEAT = 60 / T['bpm']; S16 = BEAT / 4
OUT = 'entregaveis/rackel-sonic-logo'
os.makedirs(OUT + '/rackel-sonic-logo-stems', exist_ok=True); os.makedirs(OUT + '/estudos', exist_ok=True)
os.makedirs('public/audio', exist_ok=True)

def tv(d): return np.arange(int(round(d * SR))) / SR
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def adsr(n, a, d, s, r):
    e = np.full(n, s, float); na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n); e[:na] = np.linspace(0, 1, na, endpoint=False) if na else e[:na]
    nd = min(nd, n - na); e[na:na + nd] = np.linspace(1, s, nd) if nd else e[na:na + nd]
    if nr and n > nr: e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e
def fade_out(x, r):
    nr = min(len(x), int(r * SR)); x = x.copy(); x[-nr:] *= np.linspace(1, 0, nr) ** 2; return x

class Rng:
    """ruído e humanização com semente própria por camada (independe da ordem das chamadas)"""
    def __init__(s, seed): s.g = np.random.default_rng(seed)
    def noise(s, d): return s.g.standard_normal(int(round(d * SR)))
    def u(s, a, b): return float(s.g.uniform(a, b))

# ------------------------------------------------------------------ osciladores
def additive(freq_t, n_harm_fn, weight_fn, t):
    """oscilador aditivo limitado em banda com glide: freq_t é a frequência instantânea (array)"""
    ph = 2 * np.pi * np.cumsum(freq_t) / SR; f0 = float(np.max(freq_t)); y = np.zeros(len(t))
    for k in range(1, n_harm_fn(f0) + 1):
        if k * f0 > 16000: break
        w = weight_fn(k, t)
        if np.isscalar(w) and w == 0: continue
        y += w * np.sin(k * ph)
    return y

def glide(f_from, f_to, t, tau=0.012):
    return f_to if f_from is None else f_to + (f_from - f_to) * np.exp(-t / tau)

# ------------------------------------------------------------------ TIMBRES
def lead_signature(m, d, vel=1.0, prev=None, r=None, bright=1.0):
    """timbre-assinatura: 'pock' (estalo curto e afinado, como a tampa do batom) + corpo de vidro FM + pulso quente
    com glide de 12 ms vindo da nota anterior e vibrato tardio nas notas longas"""
    t = tv(d); f = hz(m); fr = glide(None if prev is None else hz(prev), f, t)
    ph = 2 * np.pi * np.cumsum(fr * np.ones(len(t))) / SR
    pock = np.sin(2 * np.pi * np.cumsum(f * (1 + 1.4 * np.exp(-t / 0.004))) / SR) * np.exp(-t * 230)
    pock += filt(r.noise(d), 'bandpass', [1600, 5200]) * np.exp(-t * 520) * 0.5
    idx = 1.9 * np.exp(-t * 11) + 0.35
    glass = np.sin(ph + idx * np.sin(2 * ph)) * (0.75 * np.exp(-t * 5.5) + 0.25 * np.exp(-t * 1.6))
    vib = 1 + (t > 0.16) * 0.0035 * np.sin(2 * np.pi * 5.6 * t) * np.clip((t - 0.16) / 0.15, 0, 1)
    ph2 = 2 * np.pi * np.cumsum(fr * vib * np.ones(len(t))) / SR
    fc = (1300 + 3200 * bright * np.exp(-t * 9))
    pulse = np.zeros(len(t))
    for k in range(1, 40, 2):
        if k * f > 14000: break
        pulse += np.sin(k * ph2) / k * np.exp(-(k * f) / fc)
    pulse *= adsr(len(t), 0.006, 0.16, 0.55, 0.06)
    y = 0.55 * pock + 0.5 * glass + 0.42 * pulse
    return y * adsr(len(t), 0.0015, 0.0, 1.0, min(0.12, d * 0.4)) * 0.5 * vel

def lead_supersaw(m, d, vel=1.0, prev=None, r=None, bright=1.0):
    """estudo A: serras desafinadas filtradas + campana FM curta"""
    t = tv(d); f = hz(m); y = np.zeros(len(t))
    fc = 900 + 4200 * bright * np.exp(-t * 7)
    for v, det in enumerate((-0.011, -0.004, 0.0, 0.005, 0.012)):
        ph = 2 * np.pi * f * (1 + det) * t + r.u(0, 6.28)
        for k in range(1, 60):
            if k * f > 13000: break
            y += np.sin(k * ph) / k * np.exp(-(k * f) / fc) * 0.2
    bell = np.sin(2 * np.pi * f * t + 1.4 * np.exp(-t * 14) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 7) * 0.5
    return (y * adsr(len(t), 0.004, 0.2, 0.45, 0.08) + bell) * 0.45 * vel

def lead_marimba(m, d, vel=1.0, prev=None, r=None, bright=1.0):
    """estudo C: madeira afinada (parciais 1, 3,93 e 9,2) com batida de baqueta"""
    t = tv(d); f = hz(m)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 6) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 26) + 0.12 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 60)
    mallet = filt(r.noise(d), 'bandpass', [1500, 6000]) * np.exp(-t * 600) * 0.4
    return (y + mallet) * adsr(len(t), 0.001, 0, 1, 0.05) * 0.55 * vel

def glass_pluck(m, d=0.45, vel=1.0, r=None):
    t = tv(d); f = hz(m)
    y = np.sin(2 * np.pi * f * t + 2.4 * np.exp(-t * 26) * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 8)
    y += np.sin(2 * np.pi * f * 4.01 * t) * np.exp(-t * 30) * 0.15 + filt(r.noise(d), 'highpass', 3500) * np.exp(-t * 500) * 0.12
    return y * adsr(len(t), 0.001, 0, 1, 0.08) * 0.28 * vel

def bell(m, d=1.0, vel=1.0):
    t = tv(d); f = hz(m)
    y = sum(a * np.sin(2 * np.pi * f * k_ * t) * np.exp(-t * dk) for a, k_, dk in ((1, 1, 2.6), (0.45, 2.76, 5.5), (0.22, 5.4, 9), (0.12, 8.93, 15)))
    return y * adsr(len(t), 0.001, 0, 1, 0.25) * 0.16 * vel

def bass_punch(m, d=0.4, vel=1.0):
    """baixo curto e encorpado: serra filtrada com envelope + seno sub; saturação suave gera harmônicos
    (2º–5º) que o alto-falante de celular reproduz, mantendo o fundamental controlado"""
    t = tv(d); f = hz(m); ph = 2 * np.pi * f * t
    fc = 420 + 1700 * np.exp(-t * 16)
    y = np.zeros(len(t))
    for k in range(1, 50):
        if k * f > 6000: break
        y += np.sin(k * ph) / k * np.exp(-(k * f) / fc)
    y = 0.85 * y + 0.24 * np.sin(ph) + 0.34 * np.sin(2 * ph) + 0.16 * np.sin(3 * ph)   # 2º e 3º harmônicos: corpo no celular
    y = np.tanh(2.6 * y) / np.tanh(2.6)
    return y * adsr(len(t), 0.003, 0.0, 1.0, 0.05) * np.exp(-t * 3.2) * 0.42 * vel

def bass_muted(m, d=0.35, vel=1.0, r=None):
    """estudo C: baixo abafado (Karplus-Strong curto)"""
    f = hz(m); n = int(SR / f); buf = filt(r.noise(n / SR), 'lowpass', 900); out = np.zeros(int(d * SR)); i = 0
    while i < len(out):
        k = min(n, len(out) - i); out[i:i + k] = buf[:k]; buf = 0.5 * (buf + np.roll(buf, -1)) * 0.985; i += k
    t = tv(d); return np.tanh((out * 1.5 + 0.4 * np.sin(2 * np.pi * f * t) * np.exp(-t * 6)) * 1.5) * 0.35 * vel

def supersaw_chord(midis, d, vel=1.0, fc0=3800, fc1=700, kfc=7.0, att=0.004, r=None):
    """acorde glam: 5 serras desafinadas por nota, filtro que fecha"""
    t = tv(d); y = np.zeros(len(t)); fc = fc1 + (fc0 - fc1) * np.exp(-t * kfc)
    for m in midis:
        f = hz(m)
        for det in (-0.012, -0.005, 0.0, 0.006, 0.011):
            ph = 2 * np.pi * f * (1 + det) * t + r.u(0, 6.28)
            for k in range(1, 70):
                if k * f > 11000: break
                y += np.sin(k * ph) / k * np.exp(-(k * f) / fc)
    y /= (len(midis) * 5)
    return y * adsr(len(t), att, 0.0, 1.0, min(0.15, d * 0.3)) * 1.4 * vel

def pad(midis, d, vel=1.0, fc0=500, fc1=2600, r=None):
    """pad que abre o filtro (expectativa do mapa)"""
    t = tv(d); y = np.zeros(len(t)); fc = fc0 * (fc1 / fc0) ** (t / d)
    for m in midis:
        f = hz(m)
        for det in (-0.006, 0.0, 0.007):
            ph = 2 * np.pi * f * (1 + det) * t + r.u(0, 6.28)
            for k in range(1, 50):
                if k * f > 9000: break
                y += np.sin(k * ph) / k * np.exp(-(k * f) / fc)
    return y / (len(midis) * 3) * adsr(len(t), 0.06, 0, 1, 0.12) * 0.9 * vel

def rhodes_chord(midis, d, vel=1.0):
    t = tv(d); y = np.zeros(len(t))
    for m in midis:
        f = hz(m); idx = 1.3 * np.exp(-t * 4) + 0.2
        y += np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t)) * (0.7 * np.exp(-t * 2) + 0.3 * np.exp(-t * 0.5))
    return y / len(midis) * adsr(len(t), 0.003, 0, 1, 0.15) * 0.5 * vel

# --- percussão
def kick(vel=1.0, r=None, tight=True):
    t = tv(0.32); f = 50 + 120 * np.exp(-t * (38 if tight else 26)); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * (11 if tight else 7))
    click = filt(r.noise(0.32), 'bandpass', [2500, 8000]) * np.exp(-t * 420) * 0.3
    return np.tanh((body + click) * 1.5) * 0.55 * vel
def clap(vel=1.0, r=None):
    t = tv(0.4); n = filt(r.noise(0.4), 'bandpass', [1000, 3600]); e = np.zeros(len(t))
    for k, o in enumerate((0, 0.009, 0.019, 0.027)): e += (t >= o) * np.exp(-np.clip(t - o, 0, None) * (190 if k < 3 else 24))
    return n * e * 0.38 * vel
def snap(vel=1.0, r=None):
    t = tv(0.14); return (filt(r.noise(0.14), 'bandpass', [1900, 5200]) * np.exp(-t * 95) + np.sin(2 * np.pi * 2350 * t) * np.exp(-t * 140) * 0.25) * 0.45 * vel
def shaker(vel=1.0, r=None):
    t = tv(0.09); return filt(filt(r.noise(0.09), 'highpass', 5200, 3), 'lowpass', 12000) * adsr(len(t), 0.004, 0.0, 1, 0.0) * np.exp(-t * 55) * 0.16 * vel
def rim(vel=1.0, r=None):
    t = tv(0.08); return (np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 180) + filt(r.noise(0.08), 'bandpass', [2500, 7000]) * np.exp(-t * 300) * 0.5) * 0.3 * vel
def ink_tick(vel=1.0, r=None):
    """estalo de caneta/tecla — o "jornalismo autoral" discreto (estudo C, e no traço do mapa da final)"""
    t = tv(0.05); return filt(r.noise(0.05), 'bandpass', [2200, 6500]) * np.exp(-t * 650) * 0.32 * vel
def lip_smack(vel=1.0, r=None):
    t = tv(0.22); body = np.sin(2 * np.pi * (170 + 340 * np.exp(-t * 55)) * t) * np.exp(-t * 32)
    return (body * 0.6 + filt(r.noise(0.22), 'bandpass', [700, 3800]) * np.exp(-t * 95) * 0.45) * 0.55 * vel

# --- efeitos que viram ritmo
def resonant_noise(d, fc_t, q, r, gate=None):
    """ruído por filtro ressonante (iirpeak) com frequência variando (blocos de 128 com estado contínuo)"""
    n = r.noise(d); out = np.zeros(len(n)); B = 128; zi = None
    for i in range(0, len(n), B):
        f = float(np.clip(fc_t[min(i, len(fc_t) - 1)], 80, 18000)); b, a = iirpeak(f, q, fs=SR)
        if zi is None: zi = lfilter_zi(b, a) * 0
        out[i:i + B], zi = lfilter(b, a, n[i:i + B], zi=zi)
    out = out / (np.std(out) + 1e-9)
    return out * (gate if gate is not None else 1)

def silk_grain(fc, d=0.1, vel=1.0, r=None, q=14):
    """grão de seda: o gesto do batom transformado em nota percussiva afinada (sem fricção áspera)"""
    t = tv(d); y = resonant_noise(d, np.full(len(t), fc), q, r) * 0.6 + resonant_noise(d, np.full(len(t), fc * 2), q, r) * 0.18
    y = filt(y, 'lowpass', 9000)
    return y * adsr(len(t), 0.007, 0.0, 1, 0.0) * np.exp(-t * 34) * 0.12 * vel

def mouth_pop(target_m, vel=1.0, r=None):
    """"mwah" afinado: estalo labial que sobe até a nota-alvo"""
    t = tv(0.2); f1 = hz(target_m); f = f1 * (0.35 + 0.65 * (1 - np.exp(-t * 70)))
    pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 34)
    wet = filt(r.noise(0.2), 'bandpass', [600, 2600]) * np.exp(-t * 150) * 0.5
    return (pop + wet) * 0.45 * vel

def whoosh(d, f0, f1, peak, vel, r):
    t = tv(d); fc = f0 * (f1 / f0) ** (t / d)
    y = resonant_noise(d, fc, 1.2, r); u = t / d
    e = np.where(u < peak, (u / peak) ** 2, ((1 - u) / (1 - peak)) ** 1.6)
    return filt(y, 'lowpass', 11000) * e * 0.1 * vel

def riser(d, m0, m1, vel, r):
    t = tv(d); f = hz(m0) * (hz(m1) / hz(m0)) ** (t / d)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    nz = resonant_noise(d, f * 4, 3, r) * 0.08
    return (tone + nz) * (t / d) ** 2.2 * adsr(len(t), 0, 0, 1, 0.02) * 0.35 * vel

# ------------------------------------------------------------------ espaço
def make_ir(dur, bright, seed, pre=0.015, decorr=0.6):
    g = np.random.default_rng(seed); t = tv(dur)
    base = g.standard_normal(len(t)); irs = []
    for ch in range(2):
        own = g.standard_normal(len(t)); x = (1 - decorr) * base + decorr * own   # descorrelação parcial (mono-compatível)
        x = filt(x, 'lowpass', bright) * np.exp(-t * 6.9 / dur); x[:int(pre * SR)] = 0; irs.append(x / np.sqrt(np.sum(x ** 2)))
    return irs
IR_PLATE, IR_ROOM, IR_HALL = make_ir(1.3, 7000, 11), make_ir(0.7, 8000, 12, 0.008), make_ir(2.0, 5500, 13, 0.025)
def space(st, ir, wet):
    out = np.zeros_like(st)
    for c in range(2): out[c] = st[c] * (1 - wet) + fftconvolve(st[c], ir[c])[:st.shape[1]] * wet
    return out
def pingpong(st, delay, fb, mix, lp=5000):
    d = int(delay * SR); y = np.zeros_like(st); src = filt(st.mean(0), 'lowpass', lp)
    for k in range(1, 4):
        if k * d >= st.shape[1]: break
        c = (k + 1) % 2; y[c, k * d:] += src[:st.shape[1] - k * d] * (fb ** (k - 1)) * mix
    return st + y

# ------------------------------------------------------------------ mixagem por camadas
class Layer:
    def __init__(s, length): s.x = np.zeros((2, length))
    def add(s, t, sig, g=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0: sig = sig[-i:]; i = 0
        l, r = np.cos((pan + 1) * np.pi / 4) * 1.4142, np.sin((pan + 1) * np.pi / 4) * 1.4142
        j = min(s.x.shape[1], i + len(sig)); s.x[0, i:j] += g * l * sig[:j - i]; s.x[1, i:j] += g * r * sig[:j - i]

def sidechain(st, hits, depth=0.45, rel=0.16, length=None):
    """'respiração' do pad/acordes nos bumbos (groove de eletropop)"""
    g = np.ones(st.shape[1]); t = np.arange(st.shape[1]) / SR
    for h in hits:
        m = t >= h; g[m] = np.minimum(g[m], 1 - depth * np.exp(-(t[m] - h) / rel) * (t[m] - h < 0.5))
    return st * g

# ------------------------------------------------------------------ composição (parametrizada para os estudos)
FM9 = [53, 56, 60, 63, 67]                 # Fá3 Lá♭3 Dó4 Mi♭4 Sol4
DBMAJ7, EBADD9 = [49, 53, 56, 60], [51, 55, 58, 65]

def compose(cfg, length=N, offset=0.0, sfx_on=True, only_logo=False):
    """cfg: motif, lead, kit, harm, humanize. offset desloca tudo (para a versão curta)."""
    R = {k: Rng(s) for k, s in (('lead', 101), ('harm', 202), ('bass', 303), ('drum', 404), ('fx', 505), ('hum', 606))}
    L = {k: Layer(length) for k in ('melodia', 'harmonia', 'baixo', 'percussao', 'efeitos')}
    lead_fn = {'signature': lead_signature, 'supersaw': lead_supersaw, 'marimba': lead_marimba}[cfg['lead']]
    mot = cfg['motif']; kit = cfg['kit']
    H = R['hum']
    def hum(ms=4): return H.u(-ms, ms) / 1000 if cfg.get('humanize', True) else 0.0
    def vel(v, spread=0.1): return v * (1 + H.u(-spread, spread))
    o = offset

    def kick_(t, v=1.0):
        if kit == 'editorial': L['percussao'].add(t + o, kick(v * 0.6, R['drum'], tight=False))
        else: L['percussao'].add(t + o, kick(v, R['drum']))
    def back_(t, v=1.0, big=False):   # contratempo: palma / estalo / aro conforme o kit
        if kit == 'electro': L['percussao'].add(t + o, clap(v, R['drum']))
        elif kit == 'pop':
            L['percussao'].add(t + o, clap(v * 0.9, R['drum'])); L['percussao'].add(t + o + 0.004, snap(v * 0.6, R['drum']), pan=0.15)
            if big: L['percussao'].add(t + o, lip_smack(v * 0.8, R['drum']))
        else: L['percussao'].add(t + o, rim(v, R['drum'])); L['percussao'].add(t + o, snap(v * 0.7, R['drum']), pan=-0.2)

    def play_motif(times, notes, vel_list, durs, register=0, layer='melodia', pan=0.0, bright=1.0):
        prev = None
        for tt, m, v, d in zip(times, notes, vel_list, durs):
            L[layer].add(tt + o, lead_fn(m + register, d, v, prev=prev, r=R['lead'], bright=bright), pan=pan); prev = m + register

    m_full = T['motivo']['completo']; tz = T['motivo']['provocacao']; eco = T['motivo']['eco_final']
    if only_logo:
        # versão curta: o motivo + impacto + eco curto, começando em 0
        base = [0.0, S16, 3 * S16, 6 * S16, 8 * S16]
        play_motif(base, mot, [0.95, 0.9, 0.85, 1.0, 1.1], [0.14, 0.26, 0.2, 0.26, 0.75])
        kick_(0.0, 0.7); L['baixo'].add(o + 0.0, bass_punch(41, 0.2, 0.8))
        L['baixo'].add(o + 6 * S16, bass_punch(37, 0.25, 0.85)); kick_(8 * S16, 1.0); back_(8 * S16, 1.0, big=True)
        L['baixo'].add(o + 8 * S16, bass_punch(41, 0.55, 1.0))
        L['harmonia'].add(o + 8 * S16, supersaw_chord(FM9, 0.7, 0.75, r=R['harm']))
        for k, m in enumerate((84, 87, 91)): L['harmonia'].add(o + 8 * S16 + 0.012 * k, bell(m, 0.9, 0.6), pan=(k - 1) * 0.4)
        for k, s in enumerate(range(9, 13)): L['percussao'].add(o + s * S16 + hum(), shaker(vel(0.7 if k % 2 else 0.45), R['drum']), pan=0.3)
        return {k: v.x for k, v in L.items()}

    # ---- 0,00–0,375 ATRAÇÃO: provocação (3 primeiras notas, sem resolver)
    play_motif(tz, mot[:3], [1.05, 0.95, 0.85], [0.14, 0.26, 0.4], bright=1.15)
    kick_(0.0, 0.85); L['baixo'].add(o + 0.0, bass_punch(41, 0.22, 0.8))
    if kit == 'pop': L['percussao'].add(o + 0.0, ink_tick(0.9, R['drum']), pan=0.1)       # o "clique elegante" do primeiro instante
    # ---- 0,375–1,00 BATOM: o gesto vira ritmo (grãos de seda afinados em fusas, acento nas semicolcheias)
    li, ls = T['labioInferior'], T['labioSuperior']
    if sfx_on:
        tones_low = [77, 80, 84, 87, 89]       # sobe (lábio inferior, da direita p/ esquerda)
        tones_up = [89, 87, 84, 80, 84]        # desce e volta (arco do lábio superior)
        for seg, tones, p0, p1 in ((li, tones_low, 0.55, -0.55), (ls, tones_up, -0.55, 0.55)):
            n = int(round((seg[1] - seg[0]) / (S16 / 2)))
            for k in range(n):
                tt = seg[0] + k * S16 / 2; u = k / max(1, n - 1)
                acc = 1.0 if (k == 0 or abs((tt / S16) - round(tt / S16)) < 1e-6) else 0.55
                m = tones[min(len(tones) - 1, int(u * len(tones)))]
                L['efeitos'].add(tt + o + (hum(2) if acc < 1 else 0), silk_grain(hz(m), 0.11, vel(acc * (1.6 if k == 0 else 1.25), 0.06), R['fx']), pan=p0 + (p1 - p0) * u)
    for k in range(3, 8):     # shaker discreto por baixo (também no instrumental)
        L['percussao'].add(k * S16 * 2 + o + 0.0 + hum(), shaker(vel(0.4 if k % 2 else 0.6), R['drum']), pan=-0.3)
    back_(0.5, 0.55); L['baixo'].add(o + 0.5, bass_punch(41, 0.16, 0.55)); L['baixo'].add(o + 0.875, bass_punch(53, 0.12, 0.5))
    # ---- 1,00–2,00 MAPA: "mwah" afinado, arpejo que sobe (D♭maj7 → E♭add9), traço ressonante ritmado, subida para o beijo
    m0 = T['mwah']
    if sfx_on:
        L['efeitos'].add(o + m0, mouth_pop(84, 1.0, R['fx']))
        L['efeitos'].add(o + m0, whoosh(0.55, 3800, 700, 0.22, 0.8, R['fx']), pan=0.2)
    kick_(m0, 0.9); L['baixo'].add(o + m0, bass_punch(37, 0.3, 0.9)); L['baixo'].add(o + 1.5, bass_punch(39, 0.3, 0.9)); L['baixo'].add(o + 1.75, bass_punch(39, 0.14, 0.6))
    if cfg['harm'] == 'rhodes':
        L['harmonia'].add(o + m0, rhodes_chord(DBMAJ7, 0.5, 0.9)); L['harmonia'].add(o + 1.5, rhodes_chord(EBADD9, 0.5, 0.9))
    elif cfg.get('glam', True):
        L['harmonia'].add(o + m0, pad(DBMAJ7, 0.5, 0.75, 500, 1600, R['harm'])); L['harmonia'].add(o + 1.5, pad(EBADD9, 0.5, 0.85, 900, 3200, R['harm']))
    else:   # B puro: acordes em plucks de vidro (sem o pad de serras do estudo A)
        for k, m in enumerate(DBMAJ7): L['harmonia'].add(o + m0 + 0.008 * k, glass_pluck(m + 12, 0.5, 0.45, R['harm']))
        for k, m in enumerate(EBADD9): L['harmonia'].add(o + 1.5 + 0.008 * k, glass_pluck(m + 12, 0.5, 0.45, R['harm']))
    arp = [61, 65, 68, 72, 63, 67, 70, 75]
    for k, m in enumerate(arp):
        tt = m0 + k * S16
        fn = (lambda mm, v: lead_marimba(mm, 0.3, v, r=R['harm'])) if cfg['lead'] == 'marimba' else (lambda mm, v: glass_pluck(mm, 0.45, v, R['harm']))
        L['harmonia'].add(o + tt + (hum(3) if k else 0), fn(m + 12 * (cfg['lead'] == 'marimba') * 0, vel(0.75 + 0.04 * k, 0.05)), pan=-0.35 + 0.1 * k)
    tm = T['tracoMapa']
    if sfx_on:
        d = tm[1] - tm[0]; t_ = tv(d)
        fc = hz(72) * (hz(91) / hz(72)) ** (t_ / d)                  # o traço sobe com o desenho
        gate = np.zeros(len(t_))
        for k in range(int(round(d / S16))):
            i0 = int(k * S16 * SR); seg = np.arange(len(t_) - i0)[: int(S16 * SR)] / SR
            gate[i0:i0 + len(seg)] = np.exp(-seg * 22) * (1.0 if k % 2 == 0 else 0.6)
        tr = resonant_noise(d, fc, 9, R['fx'], gate) * 0.055
        L['efeitos'].add(o + tm[0], fade_out(tr, 0.05), pan=0.1)
    if cfg.get('ink', kit == 'editorial'):
        for k in range(int(round((tm[1] - tm[0]) / (2 * S16)))):
            L['percussao'].add(o + tm[0] + k * 2 * S16 + hum(2), ink_tick(vel(0.7 if k % 2 == 0 else 0.45), R['drum']), pan=0.35 if k % 2 else -0.35)
    if kit == 'electro':
        for tt in (1.5,): kick_(tt, 0.75)
        for k in range(4): L['percussao'].add(o + m0 + 0.25 + k * 0.25 + hum(), shaker(vel(0.9), R['drum']), pan=0.4)
    back_(1.5, 0.6)
    L['efeitos' if sfx_on else 'harmonia'].add(o + 1.5, riser(0.5, 63, 75, 0.9, R['fx']))
    # ---- 2,00–3,00 TÍTULO: o motivo completo, cada nota uma palavra
    times = m_full; vels = [1.0, 0.95, 0.9, 1.05, 1.15]; durs = [0.14, 0.26, 0.2, 0.26, 0.6]
    play_motif(times, mot, vels, durs)
    L['melodia'].add(o + times[4], lead_fn(mot[4] - 12, 0.6, 0.45, r=R['lead'], bright=0.7))      # oitava abaixo engorda a resolução
    bm = T['beijoMapa']
    kick_(bm, 1.0); L['baixo'].add(o + bm, bass_punch(41, 0.24, 0.95))
    if sfx_on: L['efeitos'].add(o + bm, lip_smack(0.75, R['fx']))
    L['harmonia'].add(o + bm, bell(84, 0.8, 0.55), pan=-0.3)
    for k in range(1, 8):     # groove de semicolcheias com swing leve no título
        tt = bm + k * S16 + (0.012 if k % 2 else 0)
        if min(abs(tt - x) for x in m_full) < 0.03: continue     # a melodia fica sozinha nas notas do motivo
        L['percussao'].add(o + tt + hum(3), shaker(vel(0.85 if k % 2 == 0 else 0.5), R['drum']), pan=0.3 if k % 2 else -0.3)
    back_(T['em'], 0.55)                                                       # "em": só um estalo, a melodia respira (síncope)
    a0, a1 = T['amontada']
    L['baixo'].add(o + a0, bass_punch(37, 0.24, 0.9))                         # Lá♭ sobre D♭ — sobe a tensão
    if sfx_on:
        n = 4
        for k in range(n):
            L['efeitos'].add(o + a0 + k * S16 / 2, silk_grain(hz(80 + 3 * k), 0.1, 0.9 - 0.1 * k, R['fx']), pan=-0.5 + 0.33 * k)
    # IMPACTO em "Amontada"
    kick_(a1, 1.15); back_(a1, 1.05, big=True)
    L['baixo'].add(o + a1, bass_punch(41, 0.5, 1.15))
    if cfg['harm'] == 'rhodes': L['harmonia'].add(o + a1, rhodes_chord(FM9, 0.9, 1.0))
    elif cfg.get('glam', True): L['harmonia'].add(o + a1, supersaw_chord(FM9, 0.8, 0.85, r=R['harm']))
    else:
        for k, m in enumerate(FM9): L['harmonia'].add(o + a1 + 0.006 * k, glass_pluck(m + 12, 0.7, 0.55, R['harm']))
    for k, m in enumerate((84, 87, 91, 96)):
        L['harmonia'].add(o + a1 + 0.01 * k, bell(m, 1.0, 0.55 - 0.08 * k), pan=(-0.45, -0.15, 0.15, 0.45)[k])
    # ---- 3,25–3,5 ECO nas reticências + FINALIZAÇÃO
    play_motif(eco, [mot[2] + 12, mot[3] + 12, mot[4] + 12], [0.5, 0.55, 0.75], [0.14, 0.14, 0.85], pan=0.0, bright=0.9)
    L['baixo'].add(o + eco[2], bass_punch(41, 0.5, 0.6)); back_(eco[2], 0.35)
    L['harmonia'].add(o + eco[2], pad([53, 60, 63, 67], 0.9, 0.35, 1400, 800, R['harm']))
    s0, s1 = T['saida']
    if sfx_on: L['efeitos'].add(o + s0 - 0.05, whoosh(s1 - s0 + 0.1, 900, 5200, 0.5, 0.45, R['fx']), pan=-0.2)

    kicks = [0.0, m0, bm, a1] + ([1.5] if kit == 'electro' else [])
    out = {k: v.x for k, v in L.items()}
    out['harmonia'] = sidechain(out['harmonia'], [k + o for k in kicks], 0.35)
    return out

# ------------------------------------------------------------------ processamento por camada e master
def process(stems):
    st = dict(stems)
    st['melodia'] = pingpong(space(st['melodia'], IR_PLATE, 0.16), 3 * S16, 0.45, 0.16)
    st['melodia'] = np.vstack([filt(filt(c, 'highpass', 180), 'lowpass', 15000) for c in st['melodia']])
    st['harmonia'] = space(np.vstack([filt(c, 'highpass', 150) for c in st['harmonia']]), IR_HALL, 0.22)
    st['baixo'] = np.vstack([filt(c, 'highpass', 35, 4) for c in st['baixo']]); st['baixo'] = np.tile(st['baixo'].mean(0), (2, 1))   # baixo mono
    st['percussao'] = space(st['percussao'], IR_ROOM, 0.1)
    st['efeitos'] = space(np.vstack([filt(c, 'highpass', 120) for c in st['efeitos']]), IR_ROOM, 0.14)
    return st
GAINS = {'melodia': 1.25, 'harmonia': 0.6, 'baixo': 1.2, 'percussao': 0.8, 'efeitos': 0.75}

def lufs(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1, -2, 1], [1, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=1), axis=1); blk, hop = int(0.4 * SR), int(0.1 * SR)
    if y.shape[1] < blk: blk = y.shape[1]
    z = np.array([np.mean(y[:, i:i + blk] ** 2, axis=1).sum() for i in range(0, y.shape[1] - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(z + 1e-12); z = z[l > -70]
    rel = -0.691 + 10 * np.log10(z.mean()) - 10; z = z[-0.691 + 10 * np.log10(z) > rel]
    return -0.691 + 10 * np.log10(z.mean())
def true_peak(x): return 20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1, axis=1))) + 1e-12)

def compressor(x, thr_db=-16, ratio=2.0, att=0.008, rel=0.12):
    lvl = np.sqrt(filt(x.mean(0) ** 2, 'lowpass', 40, 1).clip(1e-12))
    db = 20 * np.log10(lvl); over = np.maximum(0, db - thr_db); gr = -over * (1 - 1 / ratio)
    g = np.empty_like(gr); a_, r_ = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR)); prev = 0.0
    for i, v in enumerate(gr):
        c = a_ if v < prev else r_; prev = c * prev + (1 - c) * v; g[i] = prev
    return x * 10 ** (g / 20)
def limiter(x, ceil_db=-1.3, look=0.0025, rel_s=0.06):
    from scipy.ndimage import minimum_filter1d
    c = 10 ** (ceil_db / 20)
    up = np.abs(resample_poly(x, 4, 1, axis=1)).max(0)[: x.shape[1] * 4].reshape(-1, 4).max(1)[: x.shape[1]]
    g = minimum_filter1d(np.minimum(1, c / np.maximum(up, 1e-9)), 2 * int(look * SR) + 1)
    out = np.copy(g); a = 1 / (rel_s * SR)
    for i in range(1, len(out)): out[i] = min(g[i], out[i - 1] + a)
    w = int(look * SR); return x * np.convolve(out, np.ones(w) / w, 'same')

def master(premix, target=-14.0, tail_end=None):
    x = np.vstack([filt(c, 'highpass', 28, 2) for c in premix])
    x = compressor(x)
    if tail_end is not None:
        n = int(tail_end * SR); fade = np.ones(x.shape[1]); nf = int(0.35 * SR); fade[n - nf:n] = np.linspace(1, 0, nf) ** 2; fade[n:] = 0; x = x * fade
    g_total = 1.0
    for _ in range(8):
        g = 10 ** ((target - lufs(x)) / 20); x = limiter(x * g); g_total *= g
    return x, g_total

def mixdown(stems, keys=None):
    keys = keys or list(stems)
    return sum(stems[k] * GAINS[k] for k in keys)

# ------------------------------------------------------------------ exportação
def wav24(path, x):
    x = np.clip(x, -1, 1 - 2 ** -23); d = np.round(x.T * (2 ** 23 - 1)).astype('<i4')
    b = d.reshape(-1).view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR); w.writeframes(b)
def wav16(path, x):
    d = (np.clip(x, -1, 1).T * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())

CFG = {
    'A': {'nome': 'estudo-A-glam-electro', 'motif': [68, 72, 79, 75, 77], 'lead': 'supersaw', 'kit': 'electro', 'harm': 'saw'},
    'B': {'nome': 'estudo-B-pop-signature', 'motif': [72, 77, 75, 80, 77], 'lead': 'signature', 'kit': 'pop', 'harm': 'saw', 'glam': False, 'ink': False},
    'C': {'nome': 'estudo-C-editorial-chic', 'motif': [77, 72, 75, 74, 72], 'lead': 'marimba', 'kit': 'editorial', 'harm': 'rhodes'},
}
# FINAL = B (motivo e timbre-assinatura) + A (acorde glam e pad que abre) + C (tique de caneta no traço do mapa)
FINAL = {'motif': T['motivo']['notas_midi'], 'lead': 'signature', 'kit': 'pop', 'harm': 'saw', 'glam': True, 'ink': True}

if __name__ == '__main__':
    TAIL = DUR - 0.05
    report = {}
    for key, cfg in CFG.items():
        st = process(compose(cfg)); mx, _ = master(mixdown(st), tail_end=TAIL)
        wav24(f'{OUT}/estudos/{cfg["nome"]}.wav', mx); report[key] = {'lufs': round(lufs(mx), 2), 'tp': round(true_peak(mx), 2)}
        print('estudo', key, report[key])
    stems = process(compose(FINAL))
    final, g = master(mixdown(stems), tail_end=TAIL)
    wav24(f'{OUT}/rackel-sonic-logo-final.wav', final); wav16('public/audio/vinheta_mix.wav', final)
    for k in stems: wav24(f'{OUT}/rackel-sonic-logo-stems/{k}.wav', np.clip(stems[k] * GAINS[k] * g, -1, 1))
    inst_st = process(compose(FINAL, sfx_on=False))
    inst, _ = master(mixdown(inst_st, ['melodia', 'harmonia', 'baixo', 'percussao']), tail_end=TAIL)
    wav24(f'{OUT}/rackel-sonic-logo-instrumental.wav', inst)
    SH = 1.75
    short_st = process(compose(FINAL, length=int(SH * SR), only_logo=True))
    short, _ = master(mixdown(short_st, ['melodia', 'harmonia', 'baixo', 'percussao']), tail_end=SH - 0.02)
    wav24(f'{OUT}/rackel-sonic-logo-short.wav', short)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{OUT}/rackel-sonic-logo-final.wav', '-c:a', 'libmp3lame', '-b:a', '320k', f'{OUT}/rackel-sonic-logo-final.mp3'], check=True)
    for nm, x in (('final', final), ('instrumental', inst), ('short', short)):
        print(f'{nm}: {lufs(x):.2f} LUFS, pico verdadeiro {true_peak(x):.2f} dBTP, {x.shape[1] / SR:.2f} s')
