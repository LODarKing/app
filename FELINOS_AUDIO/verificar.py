"""Confere as falas editadas: transcreve de novo (tempos por palavra finais, usados nas legendas e na boca),
compara com o texto original (nenhuma palavra pode ter sido cortada) e mede volume e pico.
Uso: python3 verificar.py [nomes...]  ->  documentacao/transcricao_editada.json"""
import json, glob, os, sys, re, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
m = WhisperModel('medium', device='cpu', compute_type='int8', cpu_threads=4)
ed = json.load(open('documentacao/edicao.json')); orig = json.load(open('documentacao/transcricao_originais.json'))
outp = 'documentacao/transcricao_editada.json'; out = json.load(open(outp)) if os.path.exists(outp) else {}
norm = lambda s: re.sub(r'[^a-zà-ú ]', '', s.lower().replace('-', ' ')).split()
ONLY = sys.argv[1:]
for f in sorted(glob.glob('falas/*.flac')):
    n = os.path.basename(f)[:-4]
    if ONLY and n not in ONLY: continue
    a, sr = sf.read(f)
    segs, _ = m.transcribe(resample_poly(a, 1, 3).astype(np.float32), language='pt', beam_size=5, word_timestamps=True, vad_filter=False,
                           initial_prompt='Felinos, Pingo, Lara, Miguel, Desbravadores, Felidae, Carnivora, onça-pintada, jaguatirica, suçuarana, guepardo, vibrissas, coxins.')
    segs = list(segs); txt = ' '.join(s.text.strip() for s in segs)
    ref = ' '.join(w[0] for w in ed[n]['palavras'])
    A, B = norm(ref), norm(txt); miss = [w for w in A if w not in B]
    lufs = pyln.Meter(sr).integrated_loudness(a); pk = 20 * np.log10(np.abs(a).max())
    out[n] = {'dur': round(len(a) / sr, 3), 'texto': txt, 'lufs': round(lufs, 1), 'pico_dbfs': round(pk, 1), 'palavras_faltando': miss,
              'palavras': [[w.word.strip(), round(w.start, 3), round(w.end, 3)] for s in segs for w in s.words]}
    print(f"{n:26s} {len(a)/sr:5.2f}s {lufs:6.1f} LUFS pico {pk:5.1f} | {txt}" + (f"  !! faltando {miss}" if miss else ''), flush=True)
json.dump(out, open(outp, 'w'), ensure_ascii=False, indent=1)
