"""A/B file: 1 beep = ORIGINAL excerpt, 2 beeps = TREATED excerpt; both at -19 LUFS (mono)
so the comparison is not biased by loudness. Output audio/voice_comparison.wav"""
import numpy as np, soundfile as sf, pyloudnorm as pyln
SR = 48000; m = pyln.Meter(SR)
EX = [('Narrac_a_o_Educac_a_o_Inclusiva_01', 2.0, 9.0), ('Narrac_a_o_Educac_a_o_Inclusiva_04', 1.5, 9.5),
      ('Narrac_a_o_Educac_a_o_Inclusiva_07', 1.0, 10.5), ('Narrac_a_o_Educac_a_o_Inclusiva_05', 0.0, 8.0)]
tone = 0.25 * np.sin(2 * np.pi * 880 * np.arange(int(0.12 * SR)) / SR) * np.hanning(int(0.12 * SR))
out = []
for k, a, b in EX:
    o = sf.read(f'audio/takes_original/{k}.wav')[0][int(a * SR):int(b * SR), 0]
    c = sf.read(f'audio/clean_takes/{k}.wav')[0][int(a * SR):int(b * SR)]
    o = o * 10 ** ((-19 - m.integrated_loudness(o)) / 20); c = c * 10 ** ((-19 - m.integrated_loudness(c)) / 20)
    f = np.hanning(int(0.02 * SR)); h = len(f) // 2
    for s in (o, c): s[:h] *= f[:h]; s[-h:] *= f[h:]
    out += [tone, np.zeros(int(0.3 * SR)), o, np.zeros(int(0.8 * SR)), tone, np.zeros(int(0.08 * SR)), tone, np.zeros(int(0.3 * SR)), c, np.zeros(int(1.2 * SR))]
y = np.concatenate(out); y = y / max(1, np.abs(y).max() / 0.85)
sf.write('audio/voice_comparison.wav', np.stack([y, y], 1), SR, subtype='PCM_24')
print('A/B seconds', round(len(y) / SR, 1))
