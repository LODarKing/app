#!/usr/bin/env python3
"""Espectrograma + forma de onda da trilha com os acertos marcados (qa/espectrograma.png)."""
import json
import wave
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src/config/timeline.json").read_text())
BEAT = 60 / TL["bpm"]

with wave.open(str(ROOT / "public/audio/trilha-vinheta.wav")) as w:
    raw = np.frombuffer(w.readframes(w.getnframes()), dtype=np.uint8).reshape(-1, 3)
    v = (raw[:, 0].astype(np.int32) | (raw[:, 1].astype(np.int32) << 8) | (raw[:, 2].astype(np.int32) << 16))
    v = np.where(v >= 1 << 23, v - (1 << 24), v) / 8388608.0
    x = v.reshape(-1, 2)
sr = 48000
t = np.arange(len(x)) / sr
fig, (a1, a2) = plt.subplots(2, 1, figsize=(16, 8), sharex=True, gridspec_kw={"height_ratios": [1, 2]})
a1.plot(t, x[:, 0], lw=0.4, color="#F5C451")
a1.plot(t, x[:, 1], lw=0.4, color="#EF715B", alpha=0.6)
a1.set_ylim(-1, 1)
a2.specgram(x.mean(1), NFFT=2048, Fs=sr, noverlap=1792, cmap="magma", vmin=-120)
a2.set_ylim(20, 16000)
a2.set_yscale("log")
for k, b in TL["cues"].items():
    for a in (a1, a2):
        a.axvline(b * BEAT, color="#9fd", lw=0.7, alpha=0.7)
    a1.text(b * BEAT, 0.92, k, rotation=90, fontsize=7, va="top", color="#246")
a2.set_xlabel("s")
fig.tight_layout()
(ROOT / "qa").mkdir(exist_ok=True)
fig.savefig(ROOT / "qa/espectrograma.png", dpi=90)
print("qa/espectrograma.png")
