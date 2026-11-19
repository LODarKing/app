"""Confere a narração dentro de um MP4: atraso em relação ao arquivo original (correlação cruzada por trechos)
e presença de cada palavra do trecho (energia da voz no intervalo alinhado). uso: python3 -I audio/verificar_sincronia.py video.mp4 [fim_s]"""
import sys, json, subprocess, numpy as np
from scipy.signal import correlate, butter, sosfiltfilt
SR = 16000
def dec(src, extra=()):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', src, *extra, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout, np.float32).astype(np.float64)
v, o = dec(sys.argv[1]), dec('narracao_original/Voyager .mp3'); fim = float(sys.argv[2]) if len(sys.argv) > 2 else len(v) / SR
bp = butter(4, [300, 3400], 'bandpass', fs=SR, output='sos'); vf, of = sosfiltfilt(bp, v), sosfiltfilt(bp, o)
print('trecho   atraso(ms)  correlação')
for a in np.arange(0, fim - 2.0, 2.0):
    i0, i1 = int(a * SR), int((a + 2.0) * SR); x, y = vf[i0:i1], of[i0:i1]
    if np.sqrt(np.mean(y ** 2)) < 1e-3: continue
    c = correlate(x, y, 'full'); k = np.argmax(np.abs(c)) - (len(y) - 1)
    r = np.corrcoef(x[max(0, k):len(x) + min(0, k)], y[max(0, -k):len(y) - max(0, k)])[0, 1]
    print(f'{a:5.1f}-{a + 2:4.1f}s  {k / SR * 1000:+7.2f}     {r:.3f}')
P = json.load(open('documentacao/alinhamento.json'))['palavras']
falta = [w['palavra'] for w in P if w['fim'] <= fim and np.sqrt(np.mean(vf[int(w['ini'] * SR):int(w['fim'] * SR) + 1] ** 2)) < 0.25 * np.sqrt(np.mean(of[int(w['ini'] * SR):int(w['fim'] * SR) + 1] ** 2))]
n = sum(1 for w in P if w['fim'] <= fim)
print(f'palavras no trecho: {n}; com energia de voz preservada: {n - len(falta)}' + (f'; FALTANDO: {falta}' if falta else ''))
