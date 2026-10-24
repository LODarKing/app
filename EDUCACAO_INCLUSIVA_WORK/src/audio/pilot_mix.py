"""Audio for the 10.6 s pilot: voice (0-10.6 s of voice_edited) + music (ducked) + SFX synced to the
pilot staging (remotion/src/timing.json) -> remotion/public/piloto_mix.wav at -14 LUFS / <= -1 dBTP."""
import json, sys, numpy as np, soundfile as sf, pyloudnorm as pyln
sys.path.insert(0, 'src/audio')
from dsp import tp_limiter
T = json.load(open('remotion/src/timing.json'))
DUR = T['DUR']; SR = 48000; N = int(DUR * SR)
# reuse the synth helpers of sfx.py (definitions only)
src = open('src/audio/sfx.py').read().split('# ---- scene transitions')[0].replace('DUR = 180.0', f'DUR = {DUR}')
G = {}; exec(src, G)
put, roll, whoosh, thud, click, pop, chime, step, bell, add = (G[k] for k in ['put', 'roll', 'whoosh', 'thud', 'click', 'pop', 'chime', 'step', 'bell', 'add'])

# Theo rolling in; push accents when the hands grab the rims
put(roll(T['T_STOP'] + 0.1) * 1.4, 0.0, pan=-0.35, gain=1.0, name='wheelchair rolling')
RW = T['R_TIRE'] * T['THEO_SCALE']; tot = (T['AXLE_STOP'] - T['AXLE_START']) / RW
phi = ((0.7 - (tot % T['CYCLE'])) % T['CYCLE'] + T['CYCLE']) % T['CYCLE']
xs = lambda t: T['AXLE_START'] + (T['AXLE_STOP'] - T['AXLE_START']) * (1 - (1 - min(1, t / T['T_STOP'])) ** 2.2)
prev = None
for i in range(int(T['T_STOP'] * 200)):
    t = i / 200; ph = (((xs(t) - T['AXLE_START']) / RW + phi) % T['CYCLE'])
    if prev is not None and ph < prev - 1: put(add(thud(180, 0.08, 0.05), whoosh(0.22, 400, 1800) * 0.5), t, pan=-0.3, gain=0.8, name='push')
    prev = ph
put(add(thud(120, 0.15, 0.12), click(0.03) * 0.15), T['T_STOP'] - 0.05, pan=-0.1, gain=1.0, name='hands brake the rims')
# friends wave
put(chime(1318, 2, 0.07) * 0.35, T['WAVES']['gab'][0] + 0.2, pan=0.3, gain=0.8, name='wave')
# barrier (low, soft — about the stairs, never about the person)
for tb in T['BARRIER']: put(add(thud(62, 0.45, 0.35), whoosh(0.35, 150, 600) * 0.3), tb, 0.15, 0.9, 'barrier pulse')
put(pop(500, 1200), T['QUESTION'], 0.1, 0.8, 'question mark')
# footsteps on the wooden porch / concrete steps
for who, pan in (('GIRL_WALK', 0.05), ('GAB_WALK', 0.3)):
    t0, d, st = T[who]; k = 0
    while t0 + k * st < min(DUR, t0 + d): put(step(), t0 + k * st + 0.12, pan, 0.9, 'footstep'); k += 1
sfx = np.stack([G['L'], G['R']], 1)[:N]

def fit(x):
    x = x if x.ndim == 2 else np.stack([x, x], 1)
    out = np.zeros((N, 2)); n = min(N, len(x)); out[:n] = x[:n]; return out
voice = fit(sf.read('audio/voice_edited.wav')[0]); music = fit(sf.read('audio/music.wav')[0])
meter = pyln.Meter(SR)
full_music = sf.read('audio/music.wav')[0]
mg = -24.0 - meter.integrated_loudness(full_music)
v = np.abs(voice.mean(1)); blk = 480
e = np.sqrt(np.add.reduceat(v ** 2, np.arange(0, N, blk)) / blk); act = (20 * np.log10(e + 1e-9) > -45).astype(float)
smv = np.zeros_like(act); s = 0.0
for i, a in enumerate(act): s += (a - s) * (0.33 if a > s else 0.022); smv[i] = s
duck = np.repeat(10 ** (-7.5 * smv / 20), blk)[:N]
x = voice + music * 10 ** (mg / 20) * duck[:, None] + sfx * 10 ** (-2 / 20)
# fades: in 30 ms, out over the last 0.45 s (music/sfx tail only; the last word ends ~10.5 s)
fade = np.ones(N); fi = int(0.03 * SR); fo = int(0.45 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
x *= fade[:, None]
y = x
for _ in range(3):   # limiter costs a little loudness: iterate the make-up gain
    gain = -14.0 - meter.integrated_loudness(y)
    x = x * 10 ** (gain / 20); y = tp_limiter(x, -1.2, sr=SR)[0]
x = y
loud = meter.integrated_loudness(x)
sf.write('remotion/public/piloto_mix.wav', x.astype(np.float32), SR, subtype='PCM_24')
print('pilot mix', round(loud, 2), 'LUFS peak', round(20 * np.log10(np.abs(x).max()), 2), 'dBFS')
