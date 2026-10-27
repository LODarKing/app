"""Transcreve cada gravação original com tempos por palavra (faster-whisper, medium, CPU).
Saída: documentacao/transcricao_originais.json"""
import json, glob, os, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
m = WhisperModel('medium', device='cpu', compute_type='int8', cpu_threads=4)
out = {}
for f in sorted(glob.glob('originais_wav/*.wav')):
    a, sr = sf.read(f); a16 = resample_poly(a, 1, 3).astype(np.float32)
    segs, _ = m.transcribe(a16, language='pt', beam_size=5, word_timestamps=True, vad_filter=False, initial_prompt='Felinos, Pingo, Lara, Miguel, Desbravadores, Felidae, Carnivora, onça-pintada, jaguatirica, suçuarana, guepardo, vibrissas, coxins, tapetum lucidum, Sansão, Benaia, Daniel, Timna.')
    segs = list(segs); n = os.path.basename(f)[:-4]
    out[n] = {'dur': round(len(a) / sr, 3), 'texto': ' '.join(s.text.strip() for s in segs), 'palavras': [[w.word.strip(), round(w.start, 3), round(w.end, 3), round(w.probability, 3)] for s in segs for w in s.words]}
    print(n, '|', out[n]['texto'], flush=True)
json.dump(out, open('documentacao/transcricao_originais.json', 'w'), ensure_ascii=False, indent=1)
