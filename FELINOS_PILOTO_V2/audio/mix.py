"""Áudio do piloto de Felinos (10 s): trilha original + efeitos, tudo sintetizado aqui (sem amostras, sem voz).
Os tempos vêm do objeto T de js/shots.js. A narração do usuário entra depois da aprovação.
Saída: audio/piloto_mix.wav (48 kHz, estéreo, -14 LUFS, pico <= -1,3 dBTP). Rodar a partir de FELINOS_PILOTO_V2/."""
import re, json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from pedalboard import Pedalboard, Reverb, Compressor, Limiter, HighpassFilter, Gain

src = open('js/shots.js').read()
T = json.loads(re.sub(r',\s*}', '}', re.sub(r'([A-Z_0-9]+):', r'"\1":', src[src.index('const T = {') + 10:src.index('};', src.index('const T = {')) + 1])))
SR = 48000; DUR = T['DUR']; N = int(DUR * SR); rng = np.random.default_rng(5)
def tv(d): return np.arange(int(d * SR)) / SR
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def env(n, a, r, curve=1.0):
    e = np.ones(n); na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na) ** curve
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
class Bus:
    def __init__(s): s.x = np.zeros((N, 2))
    def put(s, sig, t0, pan=0.0, g=1.0):
        i0 = int(t0 * SR)
        if i0 >= N: return
        if i0 < 0: sig = sig[-i0:]; i0 = 0
        sig = sig[:N - i0] * g; s.x[i0:i0 + len(sig), 0] += sig * np.cos((pan + 1) * np.pi / 4); s.x[i0:i0 + len(sig), 1] += sig * np.sin((pan + 1) * np.pi / 4)
music, sfx, amb = Bus(), Bus(), Bus()
def mx(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out

# ---------------------------------------------------------------- instrumentos
def saw(f, d, n=16):
    t = tv(d); ph = 2 * np.pi * f * t; return sum(np.sin(k * ph + rng.uniform(0, 6)) / k for k in range(1, n))
def strings(m, d, cut=1800, a=0.25, r=0.4):   # naipe de cordas: 3 vozes desafinadas
    x = sum(saw(hz(m) * (1 + dt), d) for dt in (-0.004, 0, 0.005)) / 3
    t = tv(d); x *= 1 + 0.04 * np.sin(2 * np.pi * 5.2 * t)
    return filt(x, 'lowpass', cut) * env(len(x), a, r)
def pluck(f, d=0.5, bright=5000):  # pizzicato (Karplus-Strong vetorizado por blocos)
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(d * SR)); i = 0
    while i < len(out):
        k = min(n, len(out) - i); out[i:i + k] = buf[:k]; buf = 0.5 * (buf + np.roll(buf, -1)) * 0.994; i += k
    return filt(out, 'lowpass', bright) * env(len(out), 0.002, 0.08)
def celesta(f, d=1.2):
    t = tv(d); return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 8)) * np.exp(-t * 3.5) * env(len(t), 0.003, 0.05)
def drum(f=70, d=0.5, noise=0.25, decay=9):
    t = tv(d); body = np.sin(2 * np.pi * f * t * (1 + 0.6 * np.exp(-t * 25))) * np.exp(-t * decay)
    return body + noise * filt(rng.standard_normal(len(t)), 'bandpass', [200, 3000]) * np.exp(-t * 30)
def choir(m, d):  # "aah": pulsos ricos filtrados por formantes de /a/
    x = sum(saw(hz(m) * (1 + dt), d, 30) for dt in (-0.006, 0, 0.007))
    y = sum(filt(x, 'bandpass', [f * 0.85, f * 1.15]) * g for f, g in ((750, 1.0), (1200, 0.6), (2600, 0.25)))
    return y * env(len(y), 0.4, 0.6)
def noise(d, lo, hi): return filt(rng.standard_normal(int(d * SR)), 'bandpass', [lo, hi])
def whoosh(d, lo, hi, up=True):
    from scipy.signal import lfilter
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); blk = 480; zi = None
    for i in range(0, n, blk):
        k = i / n; fc = lo * (hi / lo) ** (k if up else 1 - k)
        bb, aa = butter(2, [fc * 0.6, min(fc * 1.6, 20000)], 'bandpass', fs=SR)
        if zi is None: zi = np.zeros(max(len(aa), len(bb)) - 1)
        out[i:i + blk], zi = lfilter(bb, aa, x[i:i + blk], zi=zi)
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 * 0.5

# ---------------------------------------------------------------- vozes de animais
def meow(d=0.62, f0=(560, 820, 470), F1=(380, 950, 520), F2=(2400, 1500, 950), g=0.5):
    t = tv(d); k = t / d; ctr = lambda v: np.interp(k, [0, 0.35, 1], v)
    f = ctr(f0) * (1 + 0.012 * np.sin(2 * np.pi * 6 * t)); ph = 2 * np.pi * np.cumsum(f) / SR; f1, f2 = ctr(F1), ctr(F2); out = np.zeros(len(t))
    for h in range(1, 26):
        fh = f * h; out += np.sin(h * ph) * (np.exp(-((fh - f1) / 260) ** 2) + 0.7 * np.exp(-((fh - f2) / 380) ** 2) + 0.15 * np.exp(-((fh - 3300) / 500) ** 2)) / h ** 0.6
    out += noise(d, 2000, 7000) * 0.05
    return out / np.abs(out).max() * np.minimum(1, t / 0.05) * np.clip((d - t) / 0.22, 0, 1) ** 1.3 * g
def roar(d=0.8, g=0.9):
    t = tv(d); k = t / d
    f = np.interp(k, [0, 0.2, 1], [100, 132, 78]) * (1 + 0.03 * np.sin(2 * np.pi * 7 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    tone = filt(sum(np.sin(h * ph) / h ** 0.75 for h in range(1, 32)), 'lowpass', 1600) + 0.6 * filt(np.sin(ph / 2), 'lowpass', 220)
    grit = noise(d, 220, 3400) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 33 * t)))
    x = tone * (1 + 0.55 * np.sin(2 * np.pi * 29 * t)) + grit * 1.5
    return x / np.abs(x).max() * np.minimum(1, t / 0.07) ** 1.5 * np.clip((d - t) / 0.45, 0, 1) ** 1.1 * g
def heartbeat():
    out = np.zeros(int(0.5 * SR)); a, b = drum(54, 0.28, 0.05, 14), drum(46, 0.28, 0.04, 14) * 0.7
    out[:len(a)] += a; j = int(0.2 * SR); out[j:j + len(b)] += b[:len(out) - j]; return out
def birds(d, n):
    out = np.zeros(int(d * SR))
    for _ in range(n):
        s = rng.uniform(0, d - 0.35); f0 = rng.uniform(2600, 4300)
        for c in range(rng.integers(2, 5)):
            tt = tv(0.07); f = f0 * (1 + 0.35 * np.sin(np.pi * tt / 0.07)); ch = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.07) ** 2 * 0.06
            j = int((s + c * 0.1) * SR); out[j:j + len(ch)] += ch[:len(out) - j]
    return out
def step(): return mx(drum(75, 0.16, 0.12, 22) * 0.35, noise(0.06, 300, 1500) * np.exp(-tv(0.06) * 50) * 0.08)
def pop(f0, f1, d=0.1): t = tv(d); f = f0 + (f1 - f0) * (t / d) ** 0.5; return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26) * 0.3
def boing(d=0.45): t = tv(d); f = 330 * (1 + 0.9 * np.exp(-t * 7)) * (1 + 0.08 * np.sin(2 * np.pi * 16 * t) * np.exp(-t * 4)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * 0.35
def sparkle(d=1.0):
    out = np.zeros(int(d * SR))
    for i, m in enumerate((88, 92, 95, 100)):
        c = celesta(hz(m), 0.9) * 0.22; j = int(i * 0.06 * SR); out[j:j + len(c)] += c[:len(out) - j]
    return out

# ---------------------------------------------------------------- MÚSICA (Ré menor → Ré maior no título)
# 1) suspense: cordas graves em trêmulo + pulsação
d = T['CUT1'] + 0.15
music.put(strings(38, d, 700, 0.6, 0.2) * (1 + 0.3 * np.sin(2 * np.pi * 9 * tv(d))) * 0.9, 0.0, 0)
music.put(strings(81, d, 4000, 0.9, 0.1) * 0.12, 0.2, 0.4)              # harmônico agudo frio
# 2) momento fofo: pizzicato + celesta (Ré maior, 120 bpm)
B = 0.25; notes = [62, 66, 69, 74, 69, 66, 69, 71, 73, 71, 69, 66]; i = 0; tt = T['CUT1'] + 0.02
while tt < T['LEAP'] - 0.05:
    music.put(pluck(hz(notes[i % 12]), 0.5) * 1.6, tt, -0.3 + 0.6 * (i % 2))
    if i % 4 == 0: music.put(pluck(hz(38 + 5 * ((i // 8) % 2)), 0.8, 1500) * 2.2, tt, 0)
    if i % 8 == 2: music.put(celesta(hz(86 + 2 * ((i // 8) % 2))) * 0.25, tt, 0.35)
    tt += B; i += 1
music.put(strings(50, T['LEAP'] - T['CUT1'], 1200, 0.5, 0.3) * 0.25, T['CUT1'], -0.4)
# 3) subida no salto
d = T['COVER'] - T['LEAP'] + 0.1
w_ = whoosh(d, 150, 6000) * 1.4; st_ = strings(50, d, 3000, d * 0.8, 0.02); music.put(mx(w_, st_ * np.linspace(0.1, 0.6, len(st_))), T['LEAP'], 0)
# 4) aventura: percussão (estilo taiko), baixo em ostinato, cordas em acordes (Rém, Si♭, Dó, Lá)
t0 = T['COVER']; prog = [(50, [62, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67]), (45, [61, 64, 69])]
b = 0
while t0 + b * 0.5 < T['CUT5'] - 0.05:
    tb = t0 + b * 0.5; root, ch = prog[(b // 2) % 4]
    music.put(drum(62 if b % 2 == 0 else 84, 0.6, 0.3, 7) * 0.9, tb, 0.15 * (-1) ** b)
    music.put(drum(110, 0.3, 0.4, 14) * 0.35, tb + 0.25, -0.2)
    for e8 in range(2): music.put(filt(saw(hz(root - 12), 0.24), 'lowpass', 500) * env(int(0.24 * SR), 0.005, 0.1) * 0.35, tb + e8 * 0.25, 0)
    if b % 2 == 0:
        for m in ch: music.put(strings(m, 1.0, 2400, 0.08, 0.3) * 0.18, tb, -0.35 + 0.35 * ch.index(m))
    b += 1
# antes do título: pequena pausa de respiração e o rugido no comando
# 5) título: tutti em Ré maior + coro + tímpano
d = DUR - T['CUT5'] + 0.2
for m in (38, 50, 57, 62, 66, 69, 74): music.put(strings(m, d, 3200, 0.02, 0.6) * (0.3 if m < 50 else 0.2), T['CUT5'], (m % 5 - 2) * 0.15)
for m in (62, 66, 69): music.put(choir(m, d) * 0.5, T['CUT5'] + 0.05, (m - 66) * 0.08)
music.put(drum(45, 1.4, 0.4, 3) * 1.4, T['CUT5'], 0)
for k in range(12): music.put(drum(48, 0.25, 0.1, 14) * (0.25 + 0.03 * k), T['CUT5'] + 0.5 + k * 0.06, 0)
music.put(drum(45, 1.0, 0.3, 4) * 1.2, T['LETTERS'], 0)

# ---------------------------------------------------------------- EFEITOS sincronizados
for h in T['HEART']: sfx.put(heartbeat() * 0.9, h, 0)
sfx.put(noise(0.4, 3000, 8000) * np.sin(np.pi * np.linspace(0, 1, int(0.4 * SR))) * 0.05, T['EYES_OPEN'], 0)
sfx.put(meow(), T['MEOW'], 0.05, 1.0)
sfx.put(whoosh(0.85, 120, 1400), T['PUSH'] - 0.05, 0, 1.2)
sfx.put(mx(whoosh(0.35, 900, 9000, up=False) * 1.2, drum(60, 0.3, 0.5, 12) * 0.4), T['CUT1'] - 0.03, 0)
amb.put(birds(T['LEAP'] - T['CUT1'], 9), T['CUT1'], 0.3, 1.2)
amb.put(noise(T['COVER'] - T['CUT1'], 300, 2000) * 0.015, T['CUT1'], -0.3)
sfx.put(pop(700, 1200, 0.1), T['TILT'] + 0.05, -0.1, 0.8)
sfx.put(sparkle() * 0.9, T['HEARTS'], 0.1)
sfx.put(boing(), T['BOING'], 0.15, 1.0)
sfx.put(meow(0.32, (700, 920, 760), (420, 700, 600), (2300, 1800, 1600), 0.28), T['CROUCH'] - 0.05, 0.05)
sfx.put(whoosh(0.7, 100, 900) * 2.0, T['LEAP'], 0)
sfx.put(whoosh(0.5, 400, 5000) * 1.8, T['COVER'] - 0.3, 0)
sfx.put(mx(drum(55, 0.6, 0.6, 6) * 0.7, whoosh(0.4, 3000, 10000, up=False)), T['COVER'], 0)
amb.put(birds(1.2, 8) + noise(1.2, 4500, 6500) * 0.02 * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * tv(1.2)) ** 2), T['COVER'], -0.25, 1.1)
for k in range(5): sfx.put(step(), T['COVER'] + 0.1 + k * 0.28, -0.2 + 0.1 * k)
sfx.put(whoosh(0.32, 300, 7000) * 2.2, T['WHIP'] - 0.08, 0.6)
amb.put(noise(1.0, 300, 1500) * 0.05 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * tv(1.0))) + birds(1.0, 3), T['WHIP'] + 0.05, 0.2)
for k in range(4): sfx.put(step(), T['WHIP'] + 0.2 + k * 0.28, 0.3 - 0.12 * k)
sfx.put(mx(whoosh(0.3, 900, 9000, up=False), drum(70, 0.3, 0.4, 12) * 0.3), T['CUT4'] - 0.03, 0)
amb.put(noise(T['CUT5'] - T['CUT4'], 150, 700) * 0.1 * env(int((T['CUT5'] - T['CUT4']) * SR), 0.2, 0.2), T['CUT4'], -0.1)
sfx.put(roar(), T['ROAR'] - 0.03, 0.15, 1.0)
sfx.put(whoosh(0.5, 4000, 12000, up=False) * 1.2, T['CUT5'], 0)
for i, tp in enumerate(T['PAWS']): sfx.put(mx(drum(80 + 12 * i, 0.3, 0.5, 11) * 0.7, pop(300, 520, 0.08) * 0.6), tp + 0.15, -0.45 + 0.3 * i)
for i in range(7): sfx.put(pop(520 + 70 * i, 1100 + 120 * i, 0.08) * 0.7, T['LETTERS'] + i * 0.045, (i - 3) * 0.12)
sfx.put(sparkle(1.2) * 1.2, T['LETTERS'] + 0.35, 0)
for k in ('SUB', 'EN', 'SERIES'): sfx.put(pop(480, 900, 0.1) * 0.6, T[k], 0)
sfx.put(whoosh(0.3, 300, 8000) * 2.0, T['DIVE'], 0)

# ---------------------------------------------------------------- mixagem e masterização
def fx(bus, wet, room):
    return Pedalboard([HighpassFilter(30), Reverb(room_size=room, wet_level=wet, dry_level=1.0, width=1.0)])(bus.x.T.astype(np.float32), SR).T
meter = pyln.Meter(SR)
m = fx(music, 0.28, 0.75); s = fx(sfx, 0.14, 0.45); a = fx(amb, 0.2, 0.6)
m *= 10 ** ((-23 - meter.integrated_loudness(m)) / 20)
# espaço reservado para a narração: a trilha recua 3 dB onde a voz vai entrar (−7,5 dB com a voz real)
act = np.zeros(N)
for a0, a1 in [(2.25, 4.7), (5.3, 8.0)]: act[int(a0 * SR):int(a1 * SR)] = 1
k = np.convolve(act, np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same'); m *= (10 ** (-3 * k / 20))[:, None]
x = m + s * 10 ** (-3 / 20) + a * 10 ** (-6 / 20)
fade = np.ones(N); fo = int(0.06 * SR); fade[-fo:] = np.linspace(1, 0, fo); x *= fade[:, None]
x = Pedalboard([Compressor(threshold_db=-16, ratio=2.0, attack_ms=15, release_ms=150)])(x.T.astype(np.float32), SR).T
def limiter(x, ceil_db=-1.5, look=0.003, rel=0.08):
    from scipy.ndimage import minimum_filter1d
    c = 10 ** (ceil_db / 20); pk = np.abs(x).max(1); g = np.minimum(1, c / np.maximum(pk, 1e-9))
    L = int(look * SR); g = minimum_filter1d(g, 2 * L + 1)              # olha à frente: a redução começa antes do pico
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); s_ = 1.0
    for i in range(len(g)): s_ = g[i] if g[i] < s_ else a * s_ + (1 - a) * g[i]; out[i] = s_
    return x * out[:, None]
for _ in range(4):
    x = x * 10 ** ((-14 - meter.integrated_loudness(x)) / 20)
    x = limiter(x, -1.9)
sf.write('audio/piloto_mix.wav', x.astype(np.float32), SR, subtype='PCM_24')
print('mix', round(meter.integrated_loudness(x), 2), 'LUFS | pico', round(20 * np.log10(np.abs(x).max()), 2), 'dBFS')
