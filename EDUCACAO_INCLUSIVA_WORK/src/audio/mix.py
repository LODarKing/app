"""Final mix: voice (lead) + music (voice-keyed ducking) + SFX -> master -14 LUFS / -1 dBTP.
Outputs audio/master.wav (48 kHz stereo 24-bit) and documentation/mix_report.json"""
import sys, json, numpy as np, soundfile as sf, pyloudnorm as pyln
sys.path.insert(0, 'src/audio')
from dsp import tp_limiter
SR = 48000; N = int(180.0 * SR)
meter = pyln.Meter(SR)
def fit(x):
    x = x if x.ndim == 2 else np.stack([x, x], 1)
    out = np.zeros((N, 2)); n = min(N, len(x)); out[:n] = x[:n]; return out
voice = fit(sf.read('audio/voice_edited.wav')[0])
music = fit(sf.read('audio/music.wav')[0])
sfx = fit(sf.read('audio/sfx.wav')[0])

# voice activity envelope (attack 60 ms, release 450 ms) -> music ducking
v = np.abs(voice.mean(1)); blk = 480
e = np.sqrt(np.add.reduceat(v ** 2, np.arange(0, N, blk)) / blk)
act = (20 * np.log10(e + 1e-9) > -45).astype(float)
sm = np.zeros_like(act); s = 0.0
for i, a in enumerate(act):
    c = 0.33 if a > s else 0.022
    s += (a - s) * c; sm[i] = s
duck_db = -7.5 * sm
g = np.repeat(10 ** (duck_db / 20), blk)[:N]

music_gain_db = -24.0 - meter.integrated_loudness(music)     # music alone ~ -24 LUFS before ducking
sfx_gain_db = -2.0
m = music * 10 ** (music_gain_db / 20) * g[:, None]
x = voice + m + sfx * 10 ** (sfx_gain_db / 20)
pre = meter.integrated_loudness(x)
x *= 10 ** ((-14.0 - pre) / 20)
x, gr = tp_limiter(x, -1.3, lookahead_ms=3.0, release_ms=100.0)
post = meter.integrated_loudness(x)
x *= 10 ** ((-14.0 - post) / 20)
x, gr2 = tp_limiter(x, -1.3)
sf.write('audio/master.wav', x, SR, subtype='PCM_24')
# stems at mix level (for review / future edits)
sf.write('audio/music_mixlevel.wav', m * 10 ** ((-14.0 - pre) / 20), SR, subtype='PCM_24')
rep = dict(music_gain_db=round(music_gain_db, 2), duck_db_max=-7.5, sfx_gain_db=sfx_gain_db, pre_lufs=round(pre, 2), final_lufs=round(meter.integrated_loudness(x), 2),
           limiter_max_gr_db=round(-20 * np.log10(min(gr.min(), gr2.min())), 2), limiter_time_over_1db_ms=int((np.minimum(gr, gr2) < 10 ** (-1 / 20)).sum() / SR * 1000))
json.dump(rep, open('documentation/mix_report.json', 'w'), indent=1); print(rep)
