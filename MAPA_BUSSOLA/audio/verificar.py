# Conferência final: transcreve de novo a voz como ela está na timeline (audio/voz_timeline.wav) e compara com as legendas (timeline.js):
# palavras perdidas e diferença de tempo de início de cada palavra. Saída: documentacao/verificacao_sincronia.json
import json, os, sys, re, unicodedata, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.dirname(AQUI)
TL = json.loads(open(os.path.join(RAIZ, 'timeline.js')).read().replace('const TL = ', '').rstrip().rstrip(';'))
m = WhisperModel(sys.argv[1], device='cpu', compute_type='int8', cpu_threads=8)
a, sr = sf.read(os.path.join(AQUI, 'voz_timeline.wav')); a16 = resample_poly(a, 1, 3).astype(np.float32)
segs, _ = m.transcribe(a16, language='pt', beam_size=5, word_timestamps=True, vad_filter=False)
ws = [(w.word.strip(), w.start) for s in segs for w in s.words]
norm = lambda w: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', w.lower()).encode('ascii', 'ignore').decode())
# alinhamento guloso por palavra normalizada (janela de busca)
difs, faltam, j = [], [], 0
for p in TL['palavras']:
    alvo = norm(p['w']); achou = False
    for k in range(j, min(j + 6, len(ws))):
        if norm(ws[k][0]) == alvo: difs.append(ws[k][1] - p['t0']); j = k + 1; achou = True; break
    if not achou: faltam.append(p['w'])
d = np.abs(np.array(difs))
res = {'palavras_legenda': len(TL['palavras']), 'casadas': len(difs), 'nao_casadas': faltam,
       'dif_media_ms': round(float(d.mean() * 1000), 1), 'dif_p95_ms': round(float(np.percentile(d, 95) * 1000), 1), 'dif_max_ms': round(float(d.max() * 1000), 1)}
json.dump(res, open(os.path.join(RAIZ, 'documentacao/verificacao_sincronia.json'), 'w'), ensure_ascii=False, indent=1)
print(res)
