"""Transcreve as 10 gravações originais com tempo por palavra (faster-whisper, CPU).
Entrada: ../ENTRADA_NARRACOES/mapa_bussola/wav/MBnn.wav  ->  documentacao/transcricao_originais.json
Uso: python3 audio/transcrever.py [modelo] [pasta_wav] [saida.json]"""
import json, glob, os, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
mod = sys.argv[1] if len(sys.argv) > 1 else 'medium'
pasta = sys.argv[2] if len(sys.argv) > 2 else '../ENTRADA_NARRACOES/mapa_bussola/wav'
saida = sys.argv[3] if len(sys.argv) > 3 else 'documentacao/transcricao_originais.json'
m = WhisperModel(mod, device='cpu', compute_type='int8', cpu_threads=8)
PROMPT = 'Mapa e bússola, rosa dos ventos, Norte, Sul, Leste, Oeste, Nordeste, Sudeste, Sudoeste, Noroeste, topográfico, curvas de nível, escala, ortofoto, azimute, declinação magnética, Desbravadores.'
out = {}
for f in sorted(glob.glob(os.path.join(pasta, '*.wav'))):
    a, sr = sf.read(f); a16 = resample_poly(a, 1, 3).astype(np.float32)
    segs, _ = m.transcribe(a16, language='pt', beam_size=5, word_timestamps=True, vad_filter=False, initial_prompt=PROMPT)
    segs = list(segs); n = os.path.basename(f)[:-4]
    out[n] = {'dur': round(len(a) / sr, 3), 'texto': ' '.join(s.text.strip() for s in segs),
              'palavras': [[w.word.strip(), round(w.start, 3), round(w.end, 3), round(w.probability, 3)] for s in segs for w in s.words]}
    print(n, out[n]['dur'], '|', out[n]['texto'], flush=True)
json.dump(out, open(saida, 'w'), ensure_ascii=False, indent=1)
