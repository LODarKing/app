"""Tratamento técnico leve da narração original (sem alterar tempo, texto, entonação ou timbre):
1) decodifica o MP3 e reamostra 44,1 -> 48 kHz (polifásico);  2) passa-altas 60 Hz e corte suave de 2 dB em 250 Hz
(fase zero: sosfiltfilt — nenhuma palavra muda de lugar);  3) de-esser em banda (5,5–10 kHz), no máx. -4 dB;
4) compressão moderada 2:1 (ataque 8 ms, soltura 140 ms);  5) nível: -16 LUFS (a mixagem final leva a -14 LUFS).
Conferência: mesma duração (amostra a amostra, após reamostragem) e correlação com o original.
uso: python3 -I audio/tratar_narracao.py"""
import subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfiltfilt, resample_poly
from scipy.ndimage import uniform_filter1d
SR = 48000
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'narracao_original/Voyager .mp3', '-f', 'f32le', '-ac', '1', '-'], capture_output=True, check=True).stdout
x44 = np.frombuffer(pcm, np.float32).astype(np.float64)
x = resample_poly(x44, 160, 147)
y = sosfiltfilt(butter(2, 60, 'highpass', fs=SR, output='sos'), x)
# corte suave em 250 Hz (sino via soma de bandas, fase zero)
b = sosfiltfilt(butter(2, [200, 320], 'bandpass', fs=SR, output='sos'), y); y = y - b * (1 - 10 ** (-2 / 20))
# de-esser: envelope da banda sibilante x envelope total
sib = sosfiltfilt(butter(4, [5500, 10000], 'bandpass', fs=SR, output='sos'), y)
es = np.sqrt(uniform_filter1d(sib ** 2, int(0.004 * SR)) + 1e-12); et = np.sqrt(uniform_filter1d(y ** 2, int(0.004 * SR)) + 1e-12)
exc = np.clip(20 * np.log10(es / et) + 8, 0, None)            # sibilância acima de -8 dB relativos ao sinal
g_s = 10 ** (-np.minimum(exc * 0.8, 4) / 20); g_s = uniform_filter1d(g_s, int(0.002 * SR))
y = y - sib + sib * g_s
# compressor 2:1 (detector RMS 10 ms)
lv = 20 * np.log10(np.sqrt(uniform_filter1d(y ** 2, int(0.01 * SR)) + 1e-12))
thr = np.percentile(lv[lv > -50], 70) - 2
gr = -np.maximum(lv - thr, 0) * (1 - 1 / 2)
a_at, a_rel = np.exp(-1 / (0.008 * SR)), np.exp(-1 / (0.14 * SR)); g = np.empty_like(gr); cur = 0.0
for i in range(len(gr)):
    cur = a_at * cur + (1 - a_at) * gr[i] if gr[i] < cur else a_rel * cur + (1 - a_rel) * gr[i]; g[i] = cur
y = y * 10 ** (g / 20)
from scipy.ndimage import minimum_filter1d
def limitador(x, teto, look=0.004, rel=0.06):
    # limitador com antecipação: só age nos picos isolados (consoantes plosivas), sem colorir a voz
    g = np.minimum(1.0, teto / np.maximum(np.abs(x), 1e-9)); g = minimum_filter1d(g, int(look * SR) * 2 + 1)
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]; out[i] = cur
    return x * uniform_filter1d(out, int(look * SR))
m = pyln.Meter(SR)
for _ in range(3): y = pyln.normalize.loudness(y, m.integrated_loudness(y), -16.0); y = limitador(y, 10 ** (-1.8 / 20))
sf.write('narracao_tratada.wav', y.astype(np.float32), SR, subtype='PCM_24')
c = np.corrcoef(x[:len(y)], y)[0, 1]
import warnings
print(f'narração tratada: {len(y) / SR:.3f} s (original {len(x44) / 44100:.3f} s), {m.integrated_loudness(y):.1f} LUFS, pico {20 * np.log10(np.abs(y).max()):.1f} dBFS, '
      f'redução máx. do compressor {-g.min():.1f} dB, de-esser máx. {-20 * np.log10(g_s.min()):.1f} dB, correlação com o original {c:.4f}')
