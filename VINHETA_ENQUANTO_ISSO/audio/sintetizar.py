"""Trilha + efeitos da vinheta "Enquanto Isso em Amontada…", sintetizados em código (sem amostras).
Lê os tempos de src/timeline.json (120 BPM, batida 0,5 s), gera as faixas separadas, mixa,
normaliza em -14 LUFS (BS.1770, com pico verdadeiro ≤ -1 dBTP) e mede a grade de batidas (audio/beats.json).
Uso: python3 audio/sintetizar.py   (a partir de VINHETA_ENQUANTO_ISSO/)"""
import json, os, wave
import numpy as np
from scipy.ndimage import minimum_filter1d
from scipy.signal import butter, sosfilt, fftconvolve, resample_poly, lfilter

SR = 48000
T = json.load(open('src/timeline.json'))
DUR = T['duracao']; N = int(DUR * SR); BEAT = 60 / T['bpm']
rng = np.random.default_rng(2026)
OUT = 'public/audio'; os.makedirs(OUT + '/stems', exist_ok=True)

def tv(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def env(n, a, r):
    e = np.ones(n); na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def noise(d): return rng.standard_normal(int(d * SR))

class Bus:
    def __init__(s): s.x = np.zeros((2, N + SR))
    def add(s, t, sig, g=1.0, pan=0.0):
        i = int(round(t * SR)); sig = np.asarray(sig)
        if sig.ndim == 1:
            l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
            sig = np.vstack([sig * l * 1.414, sig * r * 1.414])
        j = min(s.x.shape[1], i + sig.shape[1]); s.x[:, i:j] += g * sig[:, :j - i]

def reverb(x, dur=1.4, wet=0.25, bright=5000, seed=0):
    r = np.random.default_rng(seed); t = tv(dur)
    out = []
    for ch in range(2):
        ir = r.standard_normal(len(t)) * np.exp(-t * 6.9 / dur); ir = filt(ir, 'lowpass', bright); ir[:int(0.012 * SR)] = 0
        ir /= np.sqrt(np.sum(ir ** 2))
        out.append(fftconvolve(x[ch] if x.ndim == 2 else x, ir)[: (x.shape[-1])])
    dry = x if x.ndim == 2 else np.vstack([x, x])
    return dry * (1 - wet) + np.array(out) * wet * 0.6

# ---------- timbres ----------
def kick(g=1.0):
    t = tv(0.45); f = 48 + 110 * np.exp(-t * 32); ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5); click = filt(noise(0.45), 'bandpass', [2500, 7000]) * np.exp(-t * 300) * 0.25
    return np.tanh((body + click) * 1.6) * 0.55 * g
def sub(m, d=0.5):
    t = tv(d); return np.tanh(np.sin(2 * np.pi * hz(m) * t) * 1.5) * np.exp(-t * 3) * env(len(t), 0.005, 0.08) * 0.32
def clap(g=1.0):
    t = tv(0.5); n = filt(noise(0.5), 'bandpass', [900, 3200]); e = np.zeros(len(t))
    for k, o in enumerate((0, 0.011, 0.022)): e += (t >= o) * np.exp(-np.clip(t - o, 0, None) * (160 if k < 2 else 22))
    return n * e * 0.45 * g
def snap(g=1.0):
    t = tv(0.12); return (filt(noise(0.12), 'bandpass', [1800, 5000]) * np.exp(-t * 90) + np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 120) * 0.3) * 0.5 * g
def hat(g=1.0, open_=False):
    t = tv(0.25); return filt(noise(0.25), 'highpass', 7500, 4) * np.exp(-t * (18 if open_ else 70)) * 0.22 * g
def saw(f, t, voices=5, spread=0.012):
    y = np.zeros(len(t))
    for v in range(voices):
        d = 1 + spread * (v - (voices - 1) / 2) / ((voices - 1) / 2); ph = rng.uniform(0, 1)
        y += 2 * ((f * d * t + ph) % 1) - 1
    return y / voices
def stab(midis, d=0.7, cut0=5200, cut1=700, g=1.0):
    """acorde glam: serras desafinadas com filtro que fecha (Fm9)"""
    t = tv(d); y = sum(saw(hz(m), t) for m in midis) / len(midis)
    # filtro passa-baixa variável por blocos
    out = np.zeros(len(t)); B = 256
    for i in range(0, len(t), B):
        c = cut1 + (cut0 - cut1) * np.exp(-t[i] * 7)
        out[i:i + B] = sosfilt(butter(2, c, 'lowpass', fs=SR, output='sos'), y[max(0, i - 2048):i + B])[-len(y[i:i + B]):]
    return out * np.exp(-t * 3.2) * env(len(t), 0.004, 0.2) * 0.9 * g
def pluck(m, d=0.6, g=1.0):
    """pluck vítreo (FM leve + harmônico de sino)"""
    t = tv(d); f = hz(m); idx = 2.2 * np.exp(-t * 18)
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * 2 * t)) * np.exp(-t * 7)
    y += np.sin(2 * np.pi * f * 4.01 * t) * np.exp(-t * 22) * 0.18
    y += filt(noise(d), 'highpass', 3000) * np.exp(-t * 400) * 0.25
    return y * env(len(t), 0.001, 0.1) * 0.3 * g
def bell(m, d=1.0, g=1.0):
    t = tv(d); f = hz(m)
    y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for a, r, k in ((1, 1, 3), (0.5, 2.76, 6), (0.25, 5.4, 10), (0.15, 8.93, 16)))
    return y * env(len(t), 0.001, 0.2) * 0.18 * g
def whoosh(d, f0, f1, peak=0.5, g=1.0):
    """ruído com passa-faixa que varre (subida/descida) e envelope assimétrico"""
    t = tv(d); n = noise(d); out = np.zeros(len(t)); B = 512
    for i in range(0, len(t), B):
        u = t[i] / d; c = f0 * (f1 / f0) ** u
        out[i:i + B] = sosfilt(butter(2, [c * 0.6, min(c * 1.6, 20000)], 'bandpass', fs=SR, output='sos'), n[max(0, i - 4096):i + B])[-len(n[i:i + B]):]
    u = t / d; e = np.where(u < peak, (u / peak) ** 2, ((1 - u) / (1 - peak)) ** 1.5)
    return out * e * 0.5 * g
def lipstick_swipe(d, g=1.0):
    """textura cerosa do batom no lábio: ruído médio-agudo com micro-atritos (stick-slip) e chiado discreto"""
    t = tv(d); n = filt(noise(d), 'bandpass', [1400, 6000])
    rate = 90 + 40 * np.sin(2 * np.pi * 3 * t); ph = np.cumsum(rate) / SR
    grains = 0.55 + 0.45 * (np.sin(2 * np.pi * ph) > 0.3) * rng.uniform(0.6, 1, len(t))
    squeak = np.sin(2 * np.pi * np.cumsum(1700 + 500 * t / d) / SR) * 0.05
    u = t / d; e = np.sin(np.pi * np.clip(u, 0, 1)) ** 0.7
    tap = filt(noise(d), 'bandpass', [900, 4000]) * np.exp(-t * 160) * 0.9
    return (n * grains * 0.5 + squeak) * e * 0.55 * g + tap * g * 1.3
def kiss_pop(g=1.0):
    """"mwah": estalo labial — pop tonal que sobe + transiente úmido"""
    t = tv(0.18); f = 260 + 900 * (1 - np.exp(-t * 60)); ph = 2 * np.pi * np.cumsum(f) / SR
    pop = np.sin(ph) * np.exp(-t * 45); wet = filt(noise(0.18), 'bandpass', [600, 2600]) * np.exp(-t * 140) * 0.6
    return (pop + wet) * 0.6 * g
def smack(g=1.0):
    t = tv(0.25); body = np.sin(2 * np.pi * (180 + 300 * np.exp(-t * 50)) * t) * np.exp(-t * 30)
    return (body * 0.7 + filt(noise(0.25), 'bandpass', [800, 4000]) * np.exp(-t * 90) * 0.5) * 0.7 * g

# ---------- partitura (tempos em src/timeline.json) ----------
F2, Ab2, C3, Eb3, G3 = 41, 44, 48, 51, 55
FM9 = [53, 56, 60, 63, 67]                         # Fá menor com nona (F3 Ab3 C4 Eb4 G4)
music, sfx, drums = Bus(), Bus(), Bus()
acertos = []
def hit(t, nome): acertos.append({'t': round(t, 3), 'evento': nome})

# gancho
drums.add(0.0, kick(1.0)); music.add(0.0, sub(29, 0.6)); music.add(0.0, stab(FM9, 0.9, g=0.9)); hit(0.0, 'gancho: bumbo + acorde Fm9')
sfx.add(T['batomEntra'][0], whoosh(0.3, 900, 3000, 0.7, 0.5), pan=0.5)
# grade: chimbal em colcheias, palmas nos tempos 2 e 4
for k in range(1, int(4.0 / (BEAT / 2))):
    tt = k * BEAT / 2
    if tt < 4.0: drums.add(tt, hat(0.9 if k % 2 else 0.55), pan=0.35 if k % 2 else -0.35)
for tt in (0.5, 1.5, 3.5): drums.add(tt, clap(0.8))
# batom nos lábios: inferior (direita→esquerda), superior (esquerda→direita)
a, b = T['labioInferior']; L = lipstick_swipe(b - a); sfx.add(a, np.vstack([L * np.linspace(1.2, 0.6, len(L)), L * np.linspace(0.6, 1.2, len(L))]), 0.9); hit(a, 'batom: lábio inferior')
a, b = T['labioSuperior']; L = lipstick_swipe(b - a); sfx.add(a, np.vstack([L * np.linspace(0.6, 1.2, len(L)), L * np.linspace(1.2, 0.6, len(L))]), 0.9); hit(a, 'batom: lábio superior')
drums.add(0.5, snap(0.6)); music.add(0.5, pluck(72, 0.4, 0.5))
# "mwah" + recuo da câmera
m = T['mwah']; sfx.add(m, kiss_pop(1.0)); drums.add(m, kick(0.9)); music.add(m, sub(29, 0.45)); hit(m, 'mwah (estalo do beijo)')
z0, z1 = T['zoom']; sfx.add(z0, whoosh(z1 - z0 + 0.15, 4200, 500, 0.25, 0.8))
# mapa: arpejo ascendente em semicolcheias enquanto o batom desenha
arp = [65, 68, 72, 75, 77, 80, 84, 87]
for k, n_ in enumerate(arp):
    tt = T['batomVoa'][0] + k * BEAT / 4; music.add(tt, pluck(n_, 0.5, 0.75 + 0.05 * k), pan=-0.4 + 0.1 * k)
hit(T['batomVoa'][0], 'mapa: arpejo começa (batom sai da boca)')
# beijo no mapa
bm = T['beijoMapa']; sfx.add(bm, smack(1.0)); drums.add(bm, kick(1.0)); music.add(bm, sub(29, 0.5))
for k, n_ in enumerate((84, 87, 91)): music.add(bm + k * 0.03, bell(n_, 1.0, 0.8), pan=(k - 1) * 0.5)
hit(bm, 'beijo no mapa (carimbo + sino)')
# "Enquanto Isso"
e0 = T['enquantoIsso'][0]; sfx.add(e0 - 0.18, whoosh(0.2, 800, 5000, 0.9, 0.35)); drums.add(e0, snap(0.9)); hit(e0, 'Enquanto Isso')
# "em" + "Amontada": impacto elegante e passada do batom
a0, a1 = T['amontada']; drums.add(a0, kick(1.0)); drums.add(a0, clap(1.0)); music.add(a0, sub(29, 0.9)); music.add(a0, stab(FM9 + [72], 1.1, 6500, 900, 1.0))
L = lipstick_swipe(a1 - a0, 0.7); sfx.add(a0, np.vstack([L * np.linspace(1.2, 0.5, len(L)), L * np.linspace(0.5, 1.2, len(L))]))
music.add(T['em'], pluck(79, 0.3, 0.6)); hit(a0, 'Amontada: impacto + passada')
# reticências
for k, (tt, n_) in enumerate(zip(T['pontos'], (84, 87, 89))): music.add(tt, pluck(n_, 0.45, 0.9), pan=-0.3 + 0.3 * k); hit(tt, f'ponto {k + 1}')
drums.add(3.0, kick(0.6))
# saída
s0, s1 = T['saida']; sfx.add(s0 - 0.25, whoosh(0.26, 300, 1800, 0.95, 0.35)); sfx.add(s0, whoosh(s1 - s0 + 0.05, 900, 7000, 0.45, 0.9)); drums.add(s0, clap(0.9))
drums.add(s0, kick(1.3)); music.add(s0, sub(29, 0.5)); music.add(s0, stab([53, 56, 60, 65], 0.5, 4000, 600, 0.7)); hit(s0, 'saída: passada final')

def cut(x): return x[:, :N]
fade = np.ones(N); nf = int(0.08 * SR); fade[-nf:] = np.linspace(1, 0, nf)
stems = {'trilha': cut(reverb(music.x, 1.6, 0.3, 6000, 1)), 'bateria': cut(reverb(drums.x, 0.8, 0.12, 7000, 2)), 'efeitos': cut(reverb(sfx.x, 1.0, 0.18, 7000, 3))}
gains = {'trilha': 1.1, 'bateria': 0.8, 'efeitos': 1.6}
mix = sum(stems[k] * gains[k] for k in stems) * fade

# ---------- loudness (BS.1770-4) e pico verdadeiro ----------
def lufs(x):
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1, -2, 1], [1, -1.99004745483398, 0.99007225036621]
    y = lfilter(b2, a2, lfilter(b1, a1, x, axis=1), axis=1)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    z = np.array([np.mean(y[:, i:i + blk] ** 2, axis=1).sum() for i in range(0, y.shape[1] - blk + 1, hop)])
    l = -0.691 + 10 * np.log10(z + 1e-12); z = z[l > -70]
    rel = -0.691 + 10 * np.log10(z.mean()) - 10
    z = z[-0.691 + 10 * np.log10(z) > rel]
    return -0.691 + 10 * np.log10(z.mean())
def true_peak(x): return 20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1, axis=1))) + 1e-12)
def limiter(x, ceil_db=-1.5, look=0.003, rel_s=0.05):
    """limitador com antecipação: ganho pedido pelo pico sobreamostrado (4×), mínimo na janela e suavização"""
    c = 10 ** (ceil_db / 20)
    up = np.abs(resample_poly(x, 4, 1, axis=1)).max(0)[: x.shape[1] * 4].reshape(-1, 4).max(1)[: x.shape[1]]
    g = np.minimum(1, c / np.maximum(up, 1e-9)); w = int(look * SR)
    g = minimum_filter1d(g, 2 * w + 1)
    out = np.copy(g); a = 1 / (rel_s * SR)
    for i in range(1, len(out)): out[i] = min(g[i], out[i - 1] + a)
    return x * np.convolve(out, np.ones(w) / w, 'same')
for _ in range(8):
    gain = 10 ** ((-14 - lufs(mix)) / 20); mix = limiter(mix * gain)
print(f'loudness: {lufs(mix):.2f} LUFS  pico verdadeiro: {true_peak(mix):.2f} dBTP')

def wav(path, x):
    x = np.clip(x, -1, 1); d = (x.T * 32767).astype('<i2')
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())
wav(f'{OUT}/vinheta_mix.wav', mix)
for k, v in stems.items(): wav(f'{OUT}/stems/{k}.wav', v * gain * gains[k] * fade)

# ---------- medição da grade (fluxo espectral nos transientes) ----------
mono = np.r_[np.zeros(int(0.1 * SR)), mix.mean(0)]; hopn, win = 240, 1024
frames = np.lib.stride_tricks.sliding_window_view(np.pad(mono, (0, win)), win)[::hopn] * np.hanning(win)
S = np.abs(np.fft.rfft(frames, axis=1)); flux = np.maximum(0, np.diff(np.log1p(S * 10), axis=0)).sum(1)
flux = (flux - np.median(flux)) / (np.std(flux) + 1e-9); times = ((np.arange(len(flux)) + 1) * hopn + win / 2) / SR - 0.1
onsets = [times[i] for i in range(8, len(flux) - 8) if flux[i] > 1.0 and flux[i] == flux[i - 8:i + 9].max()]
grid = [round(k * BEAT, 3) for k in range(int(DUR / BEAT) + 1) if k * BEAT < DUR]
for a_ in acertos:
    near = min(onsets, key=lambda o: abs(o - a_['t'])) if onsets else None
    a_['medido'] = round(near, 3) if near is not None else None
    a_['desvio_ms'] = round((near - a_['t']) * 1000, 1) if near is not None else None
    a_['na_grade'] = abs((a_['t'] / (BEAT / 4)) - round(a_['t'] / (BEAT / 4))) < 1e-6
json.dump({'bpm': T['bpm'], 'batida_s': BEAT, 'batidas': grid, 'onsets_medidos': [round(o, 3) for o in onsets], 'acertos': acertos,
           'loudness_lufs': round(lufs(mix), 2), 'pico_verdadeiro_dbtp': round(true_peak(mix), 2)}, open('audio/beats.json', 'w'), indent=1, ensure_ascii=False)
bad = [a_ for a_ in acertos if a_['desvio_ms'] is None or abs(a_['desvio_ms']) > 25 or not a_['na_grade']]
print('acertos:', len(acertos), 'fora da grade/medição >25 ms:', bad if bad else 'nenhum')
