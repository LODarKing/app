"""Mixagem do piloto: voz à frente, trilha com ducking pela voz, efeitos; -14 LUFS integrado e pico verdadeiro <= -1,5 dBTP.
Entradas: audio/piloto/stem_trilha.wav, stem_efeitos.wav e (se existir) audio/piloto/narracao_piloto.wav (voz real posicionada).
Saída:    audio/piloto/mix_piloto.wav  (com voz)   ou   audio/piloto/mix_previa_SEM_VOZ.wav (quando ainda não há locução)
Uso: python3 audio/mix_piloto.py"""
import os, json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import resample_poly, butter, sosfilt
SR = 48000; FIM = 10.0; N = int(FIM * SR)
def le(p):
    x, sr = sf.read(p, always_2d=True); x = x.astype(np.float64)
    if sr != SR: x = resample_poly(x, SR, sr, axis=0)
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    o = np.zeros((N, 2)); o[: min(N, len(x))] = x[:N]; return o
tri, efe = le('audio/piloto/stem_trilha.wav'), le('audio/piloto/stem_efeitos.wav')
tem_voz = os.path.exists('audio/piloto/narracao_piloto.wav')
meter = pyln.Meter(SR)
if tem_voz:
    voz = le('audio/piloto/narracao_piloto.wav')
    voz = sosfilt(butter(2, 80, 'highpass', fs=SR, output='sos'), voz, axis=0)
    voz = pyln.normalize.loudness(voz, meter.integrated_loudness(voz), -16.0)
    # ducking: envelope da voz (RMS suavizado) -> até -9,5 dB na trilha, ataque rápido e soltura lenta
    e = np.sqrt(uniform_filter1d(voz.mean(1) ** 2, int(0.05 * SR))); e = e / (e.max() + 1e-9)
    alvo = 1 - np.clip(e * 4, 0, 1) * (1 - 10 ** (-9.5 / 20)); g = np.empty_like(alvo); cur = 1.0
    at, re = np.exp(-1 / (0.02 * SR)), np.exp(-1 / (0.35 * SR))
    for i in range(N): a = at if alvo[i] < cur else re; cur = a * cur + (1 - a) * alvo[i]; g[i] = cur
    mix = voz * 1.0 + tri * g[:, None] * 0.55 + efe * 0.7
else:
    mix = tri * 0.7 + efe * 0.8
fo = int(0.12 * SR); mix[-fo:] *= np.linspace(1, 0.6, fo)[:, None]       # fim aberto: só alivia o último instante, sem corte seco
def pico_verdadeiro(x):                                                 # sobreamostragem 4x (BS.1770)
    return 20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max() + 1e-12)
def limitador(x, teto, look=0.003, rel=0.06):
    pk = np.abs(x).max(1); g = np.minimum(1.0, teto / np.maximum(pk, 1e-9)); g = minimum_filter1d(g, int(look * SR) * 2 + 1)
    g = uniform_filter1d(g, int(look * SR)); g = np.minimum(g, minimum_filter1d(np.minimum(1.0, teto / np.maximum(pk, 1e-9)), 3))
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); cur = 1.0
    for i in range(len(g)): cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]; out[i] = cur
    return x * out[:, None]
teto = 10 ** (-2.2 / 20)
for _ in range(6):
    mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0); mix = limitador(mix, teto)
    if pico_verdadeiro(mix) <= -1.5: break
    teto *= 10 ** (-0.3 / 20)
lufs, tp = meter.integrated_loudness(mix), pico_verdadeiro(mix)
ajuste = min(-14.0 - lufs, -1.5 - tp)                                   # acerto fino sem passar do teto de pico
mix *= 10 ** (ajuste / 20); lufs, tp = meter.integrated_loudness(mix), pico_verdadeiro(mix)
saida = 'audio/piloto/mix_piloto.wav' if tem_voz else 'audio/piloto/mix_previa_SEM_VOZ.wav'
sf.write(saida, mix.astype(np.float32), SR, subtype='PCM_24')
info = {'arquivo': saida, 'com_voz': tem_voz, 'lufs_integrado': round(float(lufs), 2), 'pico_verdadeiro_dbtp': round(float(tp), 2), 'clipping': bool(np.abs(mix).max() >= 0.999)}
json.dump(info, open('audio/piloto/mix_medicao.json', 'w'), indent=1, ensure_ascii=False); print(info)
