"""Conferência e tempos por palavra: transcreve audio/narracao_ia.wav com Whisper (faster-whisper small, CPU)
e grava audio/palavras.json. A transcrição serve para conferir a pronúncia; o TEXTO das legendas vem do roteiro."""
import json, sys, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
src = sys.argv[1] if len(sys.argv) > 1 else 'audio/narracao_ia.wav'
a, sr = sf.read(src, dtype='float32')
a16 = resample_poly(a, 1, 3).astype(np.float32)
W = WhisperModel(sys.argv[2] if len(sys.argv) > 2 else 'small', device='cpu', compute_type='int8')
segs, _ = W.transcribe(a16, language='pt', word_timestamps=True, beam_size=5)
words = []
for s in segs:
    print(f'{s.start:6.2f}–{s.end:6.2f} {s.text}')
    for w in s.words: words.append(dict(w=w.word.strip(), ini=round(w.start, 3), fim=round(w.end, 3)))
json.dump(words, open(src.replace('.wav', '_palavras.json'), 'w'), ensure_ascii=False, indent=0)
