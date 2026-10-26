"""Diagnóstico das gravações originais: nível, pico, clipping, piso de ruído, relação sinal/ruído, banda útil."""
import glob, json, os, numpy as np, soundfile as sf, pyloudnorm as pyln
rep = {}
for f in sorted(glob.glob('originais_wav/*.wav')):
    a, sr = sf.read(f); n = os.path.basename(f)[:-4]
    fr = int(0.02 * sr); rms = np.array([np.sqrt(np.mean(a[i:i + fr] ** 2) + 1e-12) for i in range(0, len(a) - fr, fr)]); db = 20 * np.log10(rms)
    floor, speech = np.percentile(db, 10), np.percentile(db, 90)
    spec = np.abs(np.fft.rfft(a * np.hanning(len(a)))) ** 2; fq = np.fft.rfftfreq(len(a), 1 / sr); c = np.cumsum(spec) / spec.sum()
    rep[n] = dict(lufs=round(pyln.Meter(sr).integrated_loudness(a), 1), pico_dbfs=round(20 * np.log10(np.abs(a).max()), 2), amostras_clip=int((np.abs(a) > 0.99).sum()),
                  piso_ruido_db=round(floor, 1), fala_db=round(speech, 1), snr_db=round(speech - floor, 1), banda_99pct_hz=int(fq[np.searchsorted(c, 0.99)]))
    print(f"{n:24s} {rep[n]['lufs']:6.1f} LUFS  pico {rep[n]['pico_dbfs']:6.2f}  clip {rep[n]['amostras_clip']:4d}  ruído {floor:6.1f}  SNR {speech - floor:5.1f}  banda {rep[n]['banda_99pct_hz']}")
json.dump(rep, open('documentacao/diagnostico_originais.json', 'w'), indent=1)
