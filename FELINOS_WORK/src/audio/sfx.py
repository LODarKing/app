"""Sound effects, synthesised (no samples), placed on the scene timeline.
Output: audio/sfx.wav (48 kHz stereo float) and documentation/SFX_CUES.json"""
import json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, lfilter

SR = 48000; DUR = 180.0; N = int(DUR * SR)
rng = np.random.default_rng(11)
B = [s['start'] for s in json.load(open('documentation/scene_bounds.json'))]
L = np.zeros(N); R = np.zeros(N); LOG = []

def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'lowpass', fs=SR, output='sos'), x)
def tvec(d): return np.arange(int(d * SR)) / SR
def put(sig, t0, pan=0.0, gain=1.0, name=''):
    i0 = int(t0 * SR)
    if i0 >= N or i0 < 0: return
    sig = sig[:N - i0] * gain
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i0:i0 + len(sig)] += sig * gl; R[i0:i0 + len(sig)] += sig * gr
    LOG.append(dict(t=round(t0, 3), sfx=name))

def add(*xs):
    n = max(len(x) for x in xs); out = np.zeros(n)
    for x in xs: out[:len(x)] += x
    return out
def whoosh(d=0.7, lo=300, hi=3500, up=True):
    n = int(d * SR); x = rng.standard_normal(n); out = np.zeros(n); blk = 480; zi = None
    for i in range(0, n, blk):
        k = i / n; fc = lo * (hi / lo) ** (k if up else 1 - k)
        b, a = butter(2, [fc * 0.6, min(fc * 1.6, 20000)], 'bandpass', fs=SR)
        if zi is None: zi = np.zeros(max(len(a), len(b)) - 1)
        out[i:i + blk], zi = lfilter(b, a, x[i:i + blk], zi=zi)
    t = tvec(d); e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return out * e * 0.18
def pop(f0=420, f1=980, d=0.11):
    t = tvec(d); f = f0 + (f1 - f0) * (t / d) ** 0.5
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * np.minimum(1, t * 2000) * 0.22
def pluck(f, d=0.6):
    n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = 0.5 * (buf[i % n] + buf[(i + 1) % n]) * 0.996
    return lp(out, 5000) * 0.25
def bell(f, d=1.6, v=0.2):
    t = tvec(d); return (np.sin(2 * np.pi * f * t + 1.6 * np.exp(-t * 5) * np.sin(2 * np.pi * f * 2.76 * t))) * np.exp(-t * 3) * v
def chime(base=880, n=3, gap=0.08):
    out = np.zeros(int((n * gap + 1.6) * SR))
    for i in range(n):
        s = bell(base * 2 ** ([0, 4, 7, 12][i % 4] / 12), 1.5, 0.12); j = int(i * gap * SR); out[j:j + len(s)] += s
    return out
def click(d=0.05):
    t = tvec(d); return bp(rng.standard_normal(len(t)), 1800, 6000) * np.exp(-t * 120) * 0.35
def thud(f=85, d=0.25, v=0.5):
    t = tvec(d); return (np.sin(2 * np.pi * f * t * (1 + 0.5 * np.exp(-t * 30))) * np.exp(-t * 18) + 0.15 * lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 30)) * v
def pageflip(d=0.32):
    t = tvec(d); x = bp(rng.standard_normal(len(t)), 900, 7000)
    return x * (np.sin(np.pi * t / d) ** 2) * (0.6 + 0.4 * np.sin(2 * np.pi * 38 * t)) * 0.12
def scribble(d=1.6):
    t = tvec(d); x = bp(rng.standard_normal(len(t)), 2500, 7500)
    m = np.abs(np.sin(2 * np.pi * 7 * t + 2 * np.sin(2 * np.pi * 1.3 * t))) ** 3
    return x * m * 0.07 * np.minimum(1, t * 20) * np.minimum(1, (d - t) * 20)
def water(d=1.8):
    t = tvec(d); x = bp(rng.standard_normal(len(t)), 400, 4500) * 0.08
    for _ in range(26):
        s = rng.uniform(0, d - 0.06); f = rng.uniform(500, 1400); tt = tvec(0.05)
        b = np.sin(2 * np.pi * (f + 3000 * tt) * tt) * np.exp(-tt * 70) * 0.06; j = int(s * SR); x[j:j + len(b)] += b
    return x * np.minimum(1, t * 6) * np.minimum(1, (d - t) * 4)
def typing(d=1.7):
    out = np.zeros(int(d * SR)); t = 0.0
    while t < d - 0.1:
        c = click(0.03) * rng.uniform(0.5, 1.0); j = int(t * SR); out[j:j + len(c)] += c * 0.6; t += rng.uniform(0.07, 0.14)
    return out
def ping(): return add(bell(1568, 0.5, 0.08), bell(2093, 0.5, 0.05))
def crumble(d=1.0):
    out = np.zeros(int(d * SR))
    for _ in range(26):
        s = rng.uniform(0, d - 0.25); th = thud(rng.uniform(70, 160), 0.22, rng.uniform(0.08, 0.2)); j = int(s * SR); out[j:j + len(th)] += th
    return out + bp(rng.standard_normal(len(out)), 300, 2500) * 0.04 * np.exp(-tvec(d) * 3)
def roll(d=4.0):
    t = tvec(d); x = lp(rng.standard_normal(len(t)), 320, 2) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * t) ** 2)
    return x * np.minimum(1, t * 3) * np.minimum(1, (d - t) * 3) * 0.12
def step(): return add(thud(110, 0.12, 0.12), click(0.02) * 0.08)
def stamp(): return add(thud(70, 0.3, 0.55), click(0.04) * 0.6)
def buzz(d=0.22):
    t = tvec(d); return lp(np.sign(np.sin(2 * np.pi * 140 * t)), 900) * np.exp(-t * 8) * 0.06
def shimmer(): return add(chime(1046, 4, 0.06) * 0.8, whoosh(1.0, 3000, 9000) * 0.3)

# ---- scene transitions
for i, b in enumerate(B[1:], 2):
    put(whoosh(0.75, 250, 3200, up=i % 2 == 0), b - 0.35, pan=0.25 * (-1) ** i, gain=0.9, name=f'transition into scene {i}')
S = lambda i, t: B[i - 1] + t
# ---- scene 1
put(roll(4.2), S(1, 0.25), -0.3, 1.0, 'wheelchair rolling'); [put(step(), S(1, 0.35 + k * 0.42), 0.2, 1.0, 'footstep') for k in range(8)]
put(pop(300, 700), S(1, 5.15), 0, 0.9, 'warning sign pop'); put(pop(500, 1200), S(1, 7.15), 0, 0.9, 'question mark pop')
# ---- scene 2
put(chime(784, 3), S(2, 0.4), 0.2, 0.7, 'ramp appears'); put(roll(3.8, ), S(2, 1.3), -0.2, 0.8, 'rolling up the ramp')
put(whoosh(0.5, 200, 2000), S(2, 3.3), 0, 0.7, 'board slides in')
put(crumble(0.5) * 0.8, S(2, 6.45), 0, 1.0, 'bricks drop'); put(buzz(), S(2, 6.75), 0, 1.0, 'blocked')
put(whoosh(0.6, 400, 5000), S(2, 7.25), 0, 0.6, 'bricks scatter'); put(chime(988, 3), S(2, 7.4), 0, 0.7, 'accessibility bridge')
put(pluck(392), S(2, 12.85), -0.3, 1, 'node saúde'); put(pluck(494), S(2, 13.75), 0.3, 1, 'node ambiente'); put(pluck(587), S(2, 14.65), 0, 1, 'node participação')
put(pageflip(), S(2, 15.4), 0, 1.0, 'document'); [put(pop(380 + 120 * k, 900 + 200 * k), S(2, ta), 0, 0.6, 'icon') for k, ta in enumerate([17.6, 18.45, 19.6])]
# ---- scene 3
put(chime(1046, 2), S(3, 6.05), 0.2, 0.6, 'quiz correct'); put(shimmer(), S(3, 8.6), 0, 0.6, 'sunflower lanyard')
put(chime(784, 4, 0.1), S(3, 16.3), 0, 0.8, 'group cheer')
# ---- scene 4 (serious: few, soft sounds)
put(buzz(0.3), S(4, 2.75), 0, 0.8, 'unequal'); put(click(), S(4, 4.8), 0, 0.9, 'padlock'); put(thud(90, 0.2, 0.25), S(4, 4.8), 0, 1, 'padlock thud')
[put(thud(120, 0.15, 0.15), S(4, 9.25 + k * 0.22), 0, 1, 'tally') for k in range(3)]
[put(ping(), S(4, 14.55 + k * 0.2), 0.2, 0.9, 'notification') for k in range(5)]
put(chime(659, 3, 0.12), S(4, 16.2), 0, 0.6, 'stand up for respect')
# ---- scene 5
[put(pageflip(0.2), S(5, 0.1 + k * 0.33), 0, 0.8, 'calendar page') for k in range(4)]
put(pop(300, 800), S(5, 2.1), 0, 0.7, 'globe'); put(pop(400, 900), S(5, 4.2), 0, 0.6, 'document'); put(scribble(1.6), S(5, 6.0), 0.1, 1, 'signature')
put(stamp(), S(5, 7.7), 0, 0.8, 'seal'); [put(pop(400 + 150 * k, 1000 + 200 * k), S(5, ta), 0, 0.6, 'value icon') for k, ta in enumerate([9.7, 10.9, 12.1])]
put(whoosh(0.5, 200, 2500, up=False), S(5, 12.6), 0, 0.6, 'board out'); put(scribble(2.2) * 0.8, S(5, 16.3), 0.2, 1, 'writing summary')
# ---- scene 6
put(pageflip(0.45), S(6, 0.2), 0, 1.0, 'bible opens'); put(chime(523, 4, 0.12), S(6, 8.9), 0, 0.7, 'healing (gentle)')
# ---- scene 7
put(pageflip(0.6) * 0.8, S(7, 0.1), 0, 1, 'scroll unrolls')
# ---- scene 8
put(water(1.7), S(8, 3.75), -0.2, 1.0, 'water pump'); [put(pop(900, 1500, 0.07), S(8, 3.95 + k * 0.25), 0, 0.35, 'letter') for k in range(5)]
put(typing(1.7), S(8, 5.5), 0.2, 1.0, 'typewriter'); put(bell(2093, 0.6, 0.06), S(8, 7.15), 0.2, 1, 'typewriter bell')
put(whoosh(0.6, 500, 4000), S(8, 8.0), 0, 0.6, 'caps tossed')
# ---- scene 9
put(pop(250, 600), S(9, 0.05), 0, 0.7, 'map'); put(thud(140, 0.15, 0.3), S(9, 0.95), 0, 1, 'pin')
[put(pop(380 + 90 * k, 900 + 150 * k), S(9, ta), 0, 0.55, 'rights icon') for k, ta in enumerate([3.45, 4.45, 5.45, 6.55, 7.65])]
put(whoosh(0.5, 200, 2500, up=False), S(9, 9.0), 0, 0.6, 'board out'); put(crumble(1.0), S(9, 11.55), 0, 1.0, 'barrier crumbles')
# ---- scene 10
put(pop(500, 1200), S(10, 1.4), 0, 0.7, 'question'); put(chime(988, 2), S(10, 3.45), -0.2, 0.6, 'ramp ok'); put(buzz(), S(10, 4.5), 0.2, 0.8, 'gate too narrow')
put(scribble(1.6), S(10, 5.0), 0.1, 1, 'writing proposals'); put(pageflip(0.3), S(10, 7.9), 0, 1, 'proposal handed over')
put(chime(659, 4, 0.14), S(10, 13.6), 0, 0.7, 'flag at the top'); put(shimmer(), S(10, 15.0), 0, 0.8, 'finale'); put(shimmer(), S(10, 17.6), 0, 0.6, 'end card')

y = np.stack([L, R], 1)
sf.write('audio/sfx.wav', y.astype(np.float32), SR, subtype='FLOAT')
json.dump(LOG, open('documentation/SFX_CUES.json', 'w'), ensure_ascii=False, indent=1)
print('sfx events', len(LOG), 'peak', np.abs(y).max())
