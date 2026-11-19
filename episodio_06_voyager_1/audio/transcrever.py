"""Transcreve a narração original com tempo de cada palavra (faster-whisper large-v3, CPU, int8).
uso: python3 -I audio/transcrever.py "narracao_original/Voyager .mp3" documentacao/transcricao_bruta.json"""
import json, sys, subprocess, numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(pcm, np.float32)
m = WhisperModel('large-v3', device='cpu', compute_type='int8', cpu_threads=4)
PROMPT = 'Voyager 1, NASA, JPL, dia-luz, 18 de novembro de 2026, bilhões de quilômetros, Júpiter, Saturno, espaço interestelar, Além do Visível.'
segs, info = m.transcribe(a, language='pt', beam_size=5, word_timestamps=True, vad_filter=False, initial_prompt=PROMPT)
segs = list(segs)
res = {'arquivo': src, 'dur': round(len(a) / 16000, 3), 'modelo': 'faster-whisper large-v3 int8',
       'segmentos': [{'ini': round(s.start, 3), 'fim': round(s.end, 3), 'texto': s.text.strip()} for s in segs],
       'palavras': [[w.word.strip(), round(w.start, 3), round(w.end, 3), round(w.probability, 3)] for s in segs for w in s.words]}
json.dump(res, open(out, 'w'), ensure_ascii=False, indent=1)
for s in res['segmentos']: print(f"{s['ini']:6.2f}-{s['fim']:6.2f} | {s['texto']}")
