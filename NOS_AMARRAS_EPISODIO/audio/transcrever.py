"""Transcreve as narrações originais com tempo de cada palavra (faster-whisper medium, CPU, int8).
Saída: narracao/transcricao_originais.json   ·   uso: python3 audio/transcrever.py [pasta] [saida.json]"""
import json, glob, os, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
pasta = sys.argv[1] if len(sys.argv) > 1 else 'narracao/originais'; saida = sys.argv[2] if len(sys.argv) > 2 else 'narracao/transcricao_originais.json'
m = WhisperModel('medium', device='cpu', compute_type='int8', cpu_threads=4)
PROMPT = 'Nós e Amarras, Desbravadores, cordões, trançado triplo, sisal, juta, seio, ponta corrediça, chicote, alça de azelha, volta do fiel, volta da ribeira, poliéster, polipropileno, nylon, Eclesiastes.'
out = {}
for f in sorted(glob.glob(pasta + '/*.wav')):
    a, sr = sf.read(f); a16 = resample_poly(a, 1, 3).astype(np.float32)
    segs, _ = m.transcribe(a16, language='pt', beam_size=5, word_timestamps=True, vad_filter=False, initial_prompt=PROMPT)
    segs = list(segs); n = os.path.basename(f)[:-4]
    out[n] = {'dur': round(len(a) / sr, 3), 'texto': ' '.join(s.text.strip() for s in segs), 'palavras': [[w.word.strip(), round(w.start, 3), round(w.end, 3), round(w.probability, 3)] for s in segs for w in s.words]}
    print(n, f"{out[n]['dur']:.1f}s", '|', out[n]['texto'], flush=True)
json.dump(out, open(saida, 'w'), ensure_ascii=False, indent=1)
