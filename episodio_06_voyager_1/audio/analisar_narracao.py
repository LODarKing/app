"""Análise da narração original: regiões de fala, pausas, intensidade e altura por frase; corrige a transcrição
(repetição espúria em 55 s, conferida em passada isolada) e grava documentacao/palavras.json.
uso: python3 -I audio/analisar_narracao.py"""
import json, subprocess, numpy as np, librosa
SRC = 'narracao_original/Voyager .mp3'
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', SRC, '-ac', '1', '-ar', '22050', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
y = np.frombuffer(pcm, np.float32).copy(); sr = 22050
d = json.load(open('documentacao/transcricao_bruta.json'))
P = [list(w) for w in d['palavras']]
# correção: a passada completa duplicou "atravessando" na emenda de segmentos (55,40 s, prob. 0,55);
# a passada isolada 53,2–57,0 s com medium e large-v3 ouve uma só ocorrência (54,90–55,66 s)
i = next(k for k, w in enumerate(P) if w[0] == 'Atravessando' and w[1] > 55)
P[i - 1] = ['atravessando', 54.90, 55.66, 1.0]; del P[i]
P[i][1] = 55.66  # "a"
for w in P:
    if w[0] == 'continua': w[2] = 54.90
# regiões de fala por energia (janela 20 ms, limiar relativo)
h = int(0.01 * sr); rms = librosa.feature.rms(y=y, frame_length=2 * h, hop_length=h)[0]; db = 20 * np.log10(rms + 1e-9)
fala = db > (db.max() - 38)
from scipy.ndimage import binary_closing, binary_opening
fala = binary_opening(binary_closing(fala, np.ones(12)), np.ones(4))
reg = []; k = 0
while k < len(fala):
    if fala[k]:
        j = k
        while j < len(fala) and fala[j]: j += 1
        reg.append([round(k * h / sr, 2), round(j * h / sr, 2)]); k = j
    else: k += 1
pausas = [[reg[n][1], reg[n + 1][0], round(reg[n + 1][0] - reg[n][1], 2)] for n in range(len(reg) - 1) if reg[n + 1][0] - reg[n][1] >= 0.15]
f0, vf, _ = librosa.pyin(y, fmin=70, fmax=400, sr=sr, frame_length=1024, hop_length=256)
tf = np.arange(len(f0)) * 256 / sr
# frases (pontuação final)
frases = []; cur = []
for w in P:
    cur.append(w)
    if w[0][-1] in '.!?': frases.append(cur); cur = []
if cur: frases.append(cur)
out = []
for n, f in enumerate(frases):
    a, b = f[0][1], f[-1][2]
    m = (np.arange(len(db)) * h / sr >= a) & (np.arange(len(db)) * h / sr < b)
    mf = (tf >= a) & (tf < b) & vf
    txt = ' '.join(w[0] for w in f).replace(' -', '-')
    out.append({'n': n + 1, 'ini': a, 'fim': b, 'texto': txt, 'nivel_db': round(float(20 * np.log10(np.sqrt(np.mean(rms[m] ** 2)))), 1),
                'f0_mediana_hz': round(float(np.nanmedian(f0[mf])), 1), 'f0_faixa_hz': round(float(np.nanpercentile(f0[mf], 90) - np.nanpercentile(f0[mf], 10)), 1)})
json.dump({'fonte': SRC, 'dur': round(len(y) / sr, 3), 'palavras': P, 'frases': out, 'regioes_fala': reg, 'pausas': pausas}, open('documentacao/palavras.json', 'w'), ensure_ascii=False, indent=1)
for o in out: print(f"{o['n']:2d} {o['ini']:6.2f}-{o['fim']:6.2f} {o['nivel_db']:6.1f} dB  f0 {o['f0_mediana_hz']:5.1f} ±{o['f0_faixa_hz']:5.1f} | {o['texto']}")
print('pausas ≥150 ms:', pausas)
print('fala começa', reg[0][0], 'termina', reg[-1][1])
