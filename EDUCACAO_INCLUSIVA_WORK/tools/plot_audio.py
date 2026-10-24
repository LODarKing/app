# Usage: python3 tools/plot_audio.py in.wav out.png  -> spectrogram + 1 s RMS curve with scene markers
import sys, json, numpy as np, soundfile as sf, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
x, sr = sf.read(sys.argv[1]); m = x.mean(1) if x.ndim > 1 else x
B = [s['start'] for s in json.load(open('documentation/scene_bounds.json'))]
fig, ax = plt.subplots(2, 1, figsize=(16, 7))
ax[0].specgram(m[::2], NFFT=4096, Fs=sr // 2, noverlap=1024, cmap='magma', vmin=-150); ax[0].set_ylim(0, 8000)
c = np.concatenate([[0], np.cumsum(m ** 2)]); w = sr; idx = np.arange(0, len(m) - w, sr // 10)
r = 10 * np.log10((c[idx + w] - c[idx]) / w + 1e-12)
ax[1].plot((idx + w / 2) / sr, r); ax[1].set_ylim(-60, -5)
for b in B: ax[0].axvline(b, color='c', lw=1); ax[1].axvline(b, color='r', lw=1)
plt.tight_layout(); plt.savefig(sys.argv[2], dpi=60)
print('DC', round(m.mean(), 6))
