"""Transcreve a narração com tempo de cada palavra (faster-whisper, CPU, int8).
uso: python3 audio/transcrever.py entrada.mp3 saida.json [modelo]"""
import json, sys
from faster_whisper import WhisperModel
ent, sai = sys.argv[1], sys.argv[2]; mod = sys.argv[3] if len(sys.argv) > 3 else 'medium'
m = WhisperModel(mod, device='cpu', compute_type='int8', cpu_threads=4)
PROMPT = 'Consciência Negra, vinte de novembro, treze de maio, Lei Áurea, Porto Alegre, Grupo Palmares, Oliveira Silveira, Zumbi dos Palmares, Além do Visível.'
import soundfile as sf, numpy as np
a, sr = sf.read(ent, dtype="float32")
segs, info = m.transcribe(a, language='pt', beam_size=5, word_timestamps=True, vad_filter=False, initial_prompt=PROMPT)
segs = list(segs)
out = {'arquivo': ent, 'modelo': mod, 'dur': round(info.duration, 3), 'texto': ' '.join(s.text.strip() for s in segs),
       'segmentos': [[round(s.start, 3), round(s.end, 3), s.text.strip()] for s in segs],
       'palavras': [[w.word.strip(), round(w.start, 3), round(w.end, 3), round(w.probability, 3)] for s in segs for w in s.words]}
json.dump(out, open(sai, 'w'), ensure_ascii=False, indent=1)
print(out['texto'])
for s in out['segmentos']: print(s)
