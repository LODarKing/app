"""Timbres mais naturais para as trilhas (sem amostras): violão dedilhado, piano, piano elétrico (FM),
contrabaixo, percussão de escova, bateria macia, pad e reverberação por convolução. Semente fixa."""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000
rng = np.random.default_rng(21)
def tv(d): return np.arange(int(d * SR)) / SR
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, kind, fs=SR, output='sos'), x)
def env(n, a, r):
    e = np.ones(n); na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def _ks_rapido(f, d, damp, exc_lp):
    """Karplus-Strong vetorizado por blocos (para notas graves/longas)"""
    n = int(SR / f); buf = filt(rng.uniform(-1, 1, n), 'lowpass', exc_lp); out = np.zeros(int(d * SR)); i = 0
    while i < len(out):
        k = min(n, len(out) - i); out[i:i + k] = buf[:k]; buf = 0.5 * (buf + np.roll(buf, -1)) * damp; i += k
    return out

def violao_r(f, d=2.4, forca=1.0):
    """versão rápida do violão (blocos), com corpo e ataque de unha"""
    y = _ks_rapido(f, d, 0.9975, 3600) * forca
    corpo = filt(y, 'bandpass', [80, 260]) * 1.1 + filt(y, 'bandpass', [380, 900]) * 0.4 + filt(y, 'highpass', 2200) * 0.06
    t = tv(d); unha = filt(rng.standard_normal(len(t)), 'bandpass', [2000, 5000]) * np.exp(-t * 400) * 0.05
    return filt(y * 0.45 + corpo + unha, 'lowpass', 6500) * env(len(t), 0.001, 0.15) * 0.6

def piano(f, d=2.5, vel=0.8):
    """parciais inarmônicas (B), duas cordas levemente desafinadas, martelo e queda dupla"""
    t = tv(d); B = 0.00035; out = np.zeros(len(t))
    for k in range(1, 14):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 12000: break
        a = (1 / k ** 1.1) * (vel ** (1 + k * 0.08)); dec = 1.1 + 0.55 * k
        for det in (-0.0009, 0.0011):
            ph = rng.uniform(0, 6.28)
            out += a * 0.5 * np.sin(2 * np.pi * fk * (1 + det) * t + ph) * (0.7 * np.exp(-t * dec) + 0.3 * np.exp(-t * dec * 0.22))
    martelo = filt(rng.standard_normal(len(t)), 'bandpass', [400, 3000]) * np.exp(-t * 90) * 0.06 * vel
    return (out + martelo) * env(len(t), 0.002, 0.25) * 0.35

def rhodes(f, d=2.4, vel=0.8):
    """piano elétrico por FM: índice que cai, sino de ataque e trêmolo leve"""
    t = tv(d); idx = (1.6 * vel) * np.exp(-t * 3.5) + 0.25
    mod = np.sin(2 * np.pi * f * t) * idx
    car = np.sin(2 * np.pi * f * t + mod)
    sino = np.sin(2 * np.pi * f * 7.02 * t) * np.exp(-t * 14) * 0.22 * vel + np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 2.5) * 0.12
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.6 * t)
    return (car * (0.75 * np.exp(-t * 0.9) + 0.25 * np.exp(-t * 0.25)) + sino) * trem * env(len(t), 0.003, 0.3) * 0.3

def baixo(f, d=0.9, vel=1.0):
    """contrabaixo/baixo: KS grave + fundamental senoidal, saturação suave"""
    t = tv(d); y = _ks_rapido(f, d, 0.996, 900) * 0.6 + np.sin(2 * np.pi * f * t) * np.exp(-t * 2.2) * 0.8
    return np.tanh(y * 1.4 * vel) * env(len(t), 0.004, 0.12) * 0.45

def sub(f, d):
    t = tv(d); return np.tanh(np.sin(2 * np.pi * f * t) * 1.3) * env(len(t), 0.01, 0.2) * 0.4

def pad(midis, d, cut=1400, g=0.08):
    """pad quente: serras desafinadas, filtro que abre devagar"""
    t = tv(d); x = np.zeros(len(t))
    for m in midis:
        for det in (-0.006, 0.0, 0.007):
            ph = 2 * np.pi * hz(m) * (1 + det) * t + rng.uniform(0, 6)
            x += sum(np.sin(k * ph) / k for k in range(1, 12))
    lo = filt(x, 'lowpass', cut * 0.5); hi = filt(x, 'lowpass', cut); w = np.clip(t / (d * 0.6), 0, 1)
    return (lo * (1 - w) + hi * w) * env(len(t), min(0.8, d / 3), min(1.0, d / 3)) * g / len(midis)

def bumbo(d=0.5, g=1.0):
    t = tv(d); f = 52 * (1 + 2.2 * np.exp(-t * 32)); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * g * 0.8
def estalo(g=1.0):          # estalo de dedo / caixa macia
    t = tv(0.25); return (filt(rng.standard_normal(len(t)), 'bandpass', [1200, 6000]) * np.exp(-t * 38) + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 40) * 0.3) * g * 0.35
def escova(d=0.3, g=1.0):   # vassourinha na caixa
    t = tv(d); x = filt(rng.standard_normal(len(t)), 'bandpass', [1800, 9000]); return x * (np.exp(-t * 14) * 0.7 + 0.3 * np.exp(-t * 4)) * env(len(t), 0.02, 0.1) * g * 0.12
def chimbal(g=1.0, aberto=False):
    t = tv(0.3 if aberto else 0.08); return filt(rng.standard_normal(len(t)), 'highpass', 7000) * np.exp(-t * (10 if aberto else 70)) * g * 0.12
def ruido(d, lo, hi): return filt(rng.standard_normal(int(d * SR)), 'bandpass', [lo, hi])

def reverb(x, dur=1.8, umido=0.22, pre=0.018, brilho=6000):
    """convolução com resposta sintética (ruído com queda exponencial), estéreo decorrelacionado"""
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros((len(x) + n + int(pre * SR), 2))
    for c in range(2):
        ir = rng.standard_normal(n) * np.exp(-t * 6.9 / dur); ir = filt(ir, 'lowpass', brilho); ir[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
        ir /= np.sqrt(np.sum(ir ** 2))
        wet = fftconvolve(x[:, c] if x.ndim == 2 else x, ir)
        out[int(pre * SR): int(pre * SR) + len(wet), c] += wet * umido
    seco = x if x.ndim == 2 else np.stack([x, x], 1)
    out[: len(seco)] += seco * (1 - umido * 0.5)
    return out[: len(seco)]
