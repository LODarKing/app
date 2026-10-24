import sys, glob, json, os, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
model_name = sys.argv[3] if len(sys.argv) > 3 else "large-v3-turbo"
m = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=4)
prompt = ("Educação Inclusiva, Desbravadores, discriminação, CIF, CDPD, bullying, Convenção Interamericana, "
          "Mefibosete, Jônatas, Helen Keller, Anne Sullivan, Lei Brasileira de Inclusão, João 5, Segunda Samuel 9, OEA, ONU, Betesda.")
res = {}
for p in sorted(glob.glob(sys.argv[1] + '/*.wav')):
    x, sr = sf.read(p, dtype='float32'); x = x.mean(1) if x.ndim > 1 else x
    a16 = resample_poly(x, 1, sr // 16000).astype(np.float32)
    segs, info = m.transcribe(a16, language="pt", word_timestamps=True, initial_prompt=prompt, vad_filter=False, beam_size=5, condition_on_previous_text=False)
    words = []; text = []
    for s in segs:
        text.append(s.text.strip())
        for w in s.words: words.append(dict(w=w.word, s=round(w.start,3), e=round(w.end,3), p=round(w.probability,3)))
    res[os.path.basename(p)] = dict(text=" ".join(text), words=words)
    print(os.path.basename(p), "|", " ".join(text), flush=True)
json.dump(res, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
