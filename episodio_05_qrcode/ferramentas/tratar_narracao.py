"""Tratamento leve da narração fornecida pelo usuário (audio/usuario/narracao_original.mp3 -> 48 kHz).
Não altera tempos nem pausas: só EQ corretiva suave, controle de sibilância, compressão moderada e nível de trabalho -18 LUFS
(a mixagem final leva a -14 LUFS). Saída: audio/narracao_ia.wav (48 kHz, 24 bit)."""
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from pedalboard import Pedalboard, HighpassFilter, LowShelfFilter, PeakFilter, Compressor, Limiter
SR = 48000
a, sr = sf.read('audio/usuario/narracao_48k.wav', dtype='float32'); assert sr == SR
# de-esser dinâmico: reduz até 6 dB a faixa 5–9 kHz só quando ela domina o sinal
s = sosfilt(butter(4, [5000, 9000], 'band', fs=SR, output='sos'), a)
def envl(x, ms): k = int(SR * ms / 1000); return np.sqrt(np.convolve(x ** 2, np.ones(k) / k, 'same') + 1e-12)
ratio = envl(s, 5) / envl(a, 5)
g = np.clip(1 - np.clip((ratio - 0.35) / 0.4, 0, 1) * (1 - 10 ** (-6 / 20)), 10 ** (-6 / 20), 1)
g = np.convolve(g, np.ones(96) / 96, 'same')
a = (a - s) + s * g
fx = Pedalboard([HighpassFilter(70), LowShelfFilter(cutoff_frequency_hz=150, gain_db=0.8),
                 PeakFilter(cutoff_frequency_hz=300, gain_db=-1.0, q=1.0), PeakFilter(cutoff_frequency_hz=3000, gain_db=1.0, q=0.9),
                 Compressor(threshold_db=-24, ratio=2.0, attack_ms=10, release_ms=120)])
y = fx(a.reshape(1, -1), SR)[0]
m = pyln.Meter(SR); y = y * 10 ** ((-18 - m.integrated_loudness(y)) / 20)
y = Pedalboard([Limiter(threshold_db=-3.0, release_ms=80)])(y.reshape(1, -1).astype(np.float32), SR)[0] * 10 ** (-3 / 20)
sf.write('audio/narracao_ia.wav', y.astype(np.float32), SR, subtype='PCM_24')
print(f'{len(y)/SR:.3f} s, {m.integrated_loudness(y):.1f} LUFS, pico {20*np.log10(np.abs(y).max()):.1f} dBFS')
