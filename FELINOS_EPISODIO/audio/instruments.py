"""Instrumentos e efeitos sintetizados (sem amostras): cordas, pizzicato, celesta, percussão, coro,
whoosh, miado (síntese aditiva com formantes), rugido, batimento. Semente fixa: resultado reprodutível."""
import numpy as np
from scipy.signal import butter, sosfilt
SR = 48000; rng = np.random.default_rng(5)
DUR = 12.0; N = int(DUR * SR)
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


# ---------------------------------------------------------------- instrumentos melódicos (trilha refinada)
def harp(f, d=2.4):
    """harpa: Karplus-Strong com pouco amortecimento + ataque brilhante + corpo"""
    n = int(SR / f); buf = rng.uniform(-1, 1, n) * np.hanning(n) * 1.6; out = np.zeros(int(d * SR)); i = 0
    while i < len(out):
        k = min(n, len(out) - i); out[i:i + k] = buf[:k]; buf = 0.5 * (buf + np.roll(buf, -1)) * 0.9985; i += k
    t = tv(d); return filt(out, 'lowpass', 6500) * np.exp(-t * 1.4) * env(len(out), 0.002, 0.2) * 0.9
def flute(m, d, vib=0.8):
    """flauta: fundamental + 2º/3º harmônicos leves, sopro e vibrato que entra devagar"""
    t = tv(d); f = hz(m) * (1 + 0.006 * np.sin(2 * np.pi * 5.0 * t) * np.clip(t / 0.4, 0, 1) * vib); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph) + filt(rng.standard_normal(len(t)), 'bandpass', [hz(m) * 0.9, hz(m) * 4]) * 0.05
    return x * env(len(t), min(0.08, d / 3), min(0.18, d / 3)) * 0.5
def horn(m, d):
    """trompa: dente de serra filtrado, ataque macio, timbre arredondado"""
    t = tv(d); f = hz(m) * (1 + 0.003 * np.sin(2 * np.pi * 4.6 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(k * ph) / k ** 1.3 for k in range(1, 14)); bright = np.clip(t / 0.25, 0, 1) * 0.6 + 0.4
    return filt(x * bright, 'lowpass', 1300) * env(len(t), min(0.12, d / 3), min(0.25, d / 3)) * 0.42
def marimba(f, d=0.6):
    t = tv(d); return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30) + 0.1 * np.sin(2 * np.pi * f * 9.9 * t) * np.exp(-t * 60)) * np.exp(-t * 6) * env(len(t), 0.002, 0.05) * 0.6
def glock(f, d=1.4):
    t = tv(d); return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4) + 0.2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 9)) * np.exp(-t * 2.6) * env(len(t), 0.001, 0.08) * 0.35
def timpani(f=55, d=1.6, roll=0.0):
    t = tv(d); body = np.sin(2 * np.pi * f * t * (1 + 0.08 * np.exp(-t * 10))) * np.exp(-t * 2.2) + 0.4 * np.sin(2 * np.pi * f * 1.5 * t) * np.exp(-t * 3)
    x = body + 0.15 * filt(rng.standard_normal(len(t)), 'bandpass', [80, 900]) * np.exp(-t * 18)
    if roll: x *= 1 + roll * 0.3 * np.sin(2 * np.pi * 14 * t)
    return x * env(len(t), 0.004, 0.3) * 0.8
def ensemble(m, d, cut=2200, a=0.5, r=0.6, voices=5):
    """naipe de cordas mais cheio: 5 vozes desafinadas, vibrato e abertura do filtro com a dinâmica"""
    x = sum(saw(hz(m) * (1 + dt), d, 18) for dt in np.linspace(-0.007, 0.007, voices)) / voices
    t = tv(d); x *= 1 + 0.03 * np.sin(2 * np.pi * 5.3 * t + 1.0)
    lo = filt(x, 'lowpass', cut * 0.55); hi = filt(x, 'lowpass', cut); sw = np.clip(t / max(a, 1e-3), 0, 1)
    return (lo * (1 - sw * 0.5) + hi * sw * 0.5) * env(len(x), a, r)
def choir2(m, d, vowel='a'):
    """coro mais natural: vozes desafinadas, vibrato, formantes de /a/ ou /o/, ataque lento"""
    F = {'a': ((730, 1.0), (1090, 0.55), (2440, 0.2)), 'o': ((500, 1.0), (850, 0.5), (2600, 0.12))}[vowel]
    t = tv(d); x = 0
    for dt, vp in ((-0.006, 0.0), (0.0, 1.3), (0.007, 2.6), (0.012, 3.9)):
        f = hz(m) * (1 + dt) * (1 + 0.005 * np.sin(2 * np.pi * 5.1 * t + vp)); ph = 2 * np.pi * np.cumsum(f) / SR
        x = x + sum(np.sin(k * ph) / k for k in range(1, 28))
    y = sum(filt(x, 'bandpass', [fc * 0.86, fc * 1.14]) * gg for fc, gg in F) + 0.04 * filt(rng.standard_normal(len(t)), 'bandpass', [2000, 6000])
    return y * env(len(y), min(0.6, d / 3), min(0.8, d / 3)) * 0.35
