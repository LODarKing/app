"""Cadeia "som de estúdio" para a narração (processamento de sinal clássico, sem rede neural):
 1) picos estourados refeitos por interpolação autorregressiva (dsp_voz.declip) e margem de -3 dBFS;
 2) passa-altas 80 Hz (4ª ordem) — tira ronco e vento;
 3) redução de ruído espectral com perfil tirado de TODAS as pausas da gravação (noisereduce, suavizada no tempo e
    na frequência para não criar "ruído musical");
 4) controle de plosivas ("p" e "b" estourados): o grave é abaixado só quando passa dos médios;
 5) EQ de estúdio: corpo (+1,5 dB em 150 Hz), tira o som de caixa (-2,5 dB em 350 Hz), presença (+2 dB em 3,5 kHz)
    e ar (+1,5 dB acima de 10 kHz);
 6) de-esser em banda dividida (4,8–9,5 kHz);
 7) compressão em dois estágios: 3:1 rápida (dinâmica da fala) + 1,8:1 lenta (nivelamento entre frases);
 8) fora das regiões de fala e das palavras transcritas (respirações, estalos de boca, ambiente) o sinal é abaixado
    30 dB com transições de 20 ms.
Os limites das regiões de fala vêm do mesmo detector usado na edição, então nenhum final de palavra é cortado."""
import numpy as np, noisereduce as nr
from scipy.signal import butter, sosfilt, sosfiltfilt
from pedalboard import Pedalboard, HighpassFilter, PeakFilter, HighShelfFilter, LowShelfFilter, Compressor
from dsp_voz import declip, deess, frame_rms_db, SR

def plosivas(x, fc=130, max_red_db=10.0):
    low = sosfiltfilt(butter(2, fc, 'lowpass', fs=SR, output='sos'), x); rest = x - low
    mid = sosfiltfilt(butter(2, [300, 3000], 'bandpass', fs=SR, output='sos'), x)
    env = lambda s: np.sqrt(np.convolve(s ** 2, np.ones(int(0.008 * SR)) / int(0.008 * SR), 'same'))
    red = np.clip(20 * np.log10((env(low) + 1e-9) / (env(mid) + 1e-9)) * 0.8, 0, max_red_db)
    k = np.hanning(int(0.01 * SR)); red = np.convolve(red, k / k.sum(), 'same')
    return rest + low * 10 ** (-red / 20)

def pb(x, fx): return fx(x.astype(np.float32), SR).astype(np.float64)

def estudio(x, regioes, palavras=()):
    if np.abs(x).max() > 0.95:
        x = x / max(1.0, np.percentile(np.abs(x), 99.99)); x, _ = declip(x, thr=0.9, p=32, ctx=400)
    x = x * 10 ** ((-3 - 20 * np.log10(np.abs(x).max() + 1e-9)) / 20)
    x = pb(x, Pedalboard([HighpassFilter(80), HighpassFilter(80)]))
    # perfil de ruído: todas as pausas (fora das regiões de fala), com folga de 60 ms
    mask = np.ones(len(x), bool)
    for a, b in regioes: mask[max(0, a - int(0.06 * SR)):min(len(x), b + int(0.06 * SR))] = False
    ruido = x[mask] if mask.sum() > SR * 0.3 else None
    x = nr.reduce_noise(y=x, sr=SR, y_noise=ruido, stationary=True, prop_decrease=0.9, n_std_thresh_stationary=1.5, freq_mask_smooth_hz=300, time_mask_smooth_ms=60)
    x = plosivas(x)
    x = pb(x, Pedalboard([LowShelfFilter(150, 1.5, 0.7), PeakFilter(350, -2.5, 1.1), PeakFilter(3500, 2.0, 0.9), HighShelfFilter(10000, 1.5, 0.7)]))
    x, _ = deess(x, thresh_db=3.0, max_red_db=8.0)
    r = frame_rms_db(x); fala = np.percentile(r[r > np.percentile(r, 40)], 85)
    x = pb(x, Pedalboard([Compressor(threshold_db=float(fala - 6), ratio=3.0, attack_ms=10, release_ms=120), Compressor(threshold_db=float(fala - 12), ratio=1.8, attack_ms=30, release_ms=400)]))
    # respirações e ambiente entre frases: -30 dB (não é silêncio digital), transições de 20 ms.
    # Protege também o intervalo de cada palavra transcrita (inícios fracos, como o "m" de "mastro")
    g = np.full(len(x), 10 ** (-30 / 20)); fd = int(0.02 * SR)
    prot = list(regioes) + [[int(max(0, w[1] - 0.06) * SR), int((w[2] + 0.06) * SR)] for w in palavras]
    for a, b in prot:
        a0, b0 = max(0, a - fd), min(len(x), b + fd); g[a0:b0] = 1.0
        g[a0:a0 + fd] = np.minimum(g[a0:a0 + fd], np.linspace(10 ** (-1.5), 1, min(fd, b0 - a0)))
        if b0 - fd > a0: g[b0 - fd:b0] = np.minimum(g[b0 - fd:b0], np.linspace(1, 10 ** (-1.5), fd))
    return x * g
