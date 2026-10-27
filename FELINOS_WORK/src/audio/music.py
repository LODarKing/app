"""Original instrumental score, synthesised from scratch (no samples).
Key: D major, 92 BPM. Arrangement follows the scene map in documentation/scene_bounds.json.
Output: audio/music.wav (48 kHz stereo float)."""
import json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
DUR = 180.0
N = int(DUR * SR)
BPM = 92.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(7)
SC = json.load(open('documentation/scene_bounds.json'))
B = [s['start'] for s in SC] + [180.0]

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
NOTE = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
def chord(name):
    """'D', 'Bm', 'G', 'A', 'Em', 'F#m', 'A/C#', 'D/F#', 'Gmaj7', 'Asus4'"""
    bass = None
    if '/' in name: name, bass = name.split('/')
    minor = name.endswith('m') and not name.endswith('maj7')
    root = name.rstrip('m') if minor else name.replace('maj7', '').replace('sus4', '').replace('add9', '')
    r = NOTE[root]
    iv = [0, 3, 7] if minor else [0, 4, 7]
    if 'sus4' in name: iv = [0, 5, 7]
    if 'maj7' in name: iv = [0, 4, 7, 11]
    if 'add9' in name: iv = [0, 4, 7, 14]
    b = NOTE[bass] if bass else r
    return r, iv, b

def env_adsr(n, a, d, s, r, sr=SR):
    e = np.ones(n) * s
    na, nd, nr = int(a * sr), int(d * sr), int(r * sr)
    na = min(na, n); e[:na] = np.linspace(0, 1, na, endpoint=False)
    nd = min(nd, n - na); e[na:na + nd] = np.linspace(1, s, nd, endpoint=False)
    if nr > 0 and n > nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def lp(x, fc, order=2): return sosfilt(butter(order, fc, 'lowpass', fs=SR, output='sos'), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, 'highpass', fs=SR, output='sos'), x)
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)

L = np.zeros(N); R = np.zeros(N)
def put(sig, t0, pan=0.0, gain=1.0):
    i0 = int(t0 * SR)
    if i0 >= N: return
    sig = sig[:N - i0] * gain
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i0:i0 + len(sig)] += sig * gl; R[i0:i0 + len(sig)] += sig * gr
def put_st(sl, sr_, t0, gain=1.0):
    i0 = int(t0 * SR)
    if i0 >= N: return
    n = min(len(sl), N - i0)
    L[i0:i0 + n] += sl[:n] * gain; R[i0:i0 + n] += sr_[:n] * gain

# ---------------------------------------------------------------- instruments
def epiano(f, dur, vel=0.6):
    n = int((dur + 1.2) * SR); t = np.arange(n) / SR
    idx = 1.8 * vel * np.exp(-t * 3.5)
    mod = np.sin(2 * np.pi * f * t) * idx
    car = np.sin(2 * np.pi * f * t + mod) + 0.25 * np.sin(2 * np.pi * 2 * f * t + 0.5 * mod)
    e = np.exp(-t * (1.4 + f / 900)) * np.minimum(1, t * 300)
    rel = np.ones(n); k = int(dur * SR)
    if k < n: rel[k:] = np.exp(-(np.arange(n - k) / SR) * 6)
    return car * e * rel * vel * 0.32

def pad(freqs, dur, bright=1100, att=1.2, rel=1.8):
    n = int((dur + rel) * SR); t = np.arange(n) / SR
    sl = np.zeros(n); sr_ = np.zeros(n)
    for f in freqs:
        for det, side in [(-0.11, 0), (0.0, 1), (0.12, 2)]:
            ph = rng.uniform(0, 2 * np.pi)
            ff = f * 2 ** (det / 12)
            w = 2 * (t * ff + ph / (2 * np.pi) - np.floor(0.5 + t * ff + ph / (2 * np.pi)))   # saw
            w = 0.6 * w + 0.4 * np.sin(2 * np.pi * ff * t + ph)
            if side == 0: sl += w
            elif side == 2: sr_ += w
            else: sl += 0.6 * w; sr_ += 0.6 * w
    e = env_adsr(n, att, 0.5, 0.85, rel)
    lfo = 1 + 0.08 * np.sin(2 * np.pi * 0.23 * t)
    sl = lp(sl * e * lfo, bright, 2); sr_ = lp(sr_ * e * lfo, bright * 1.05, 2)
    g = 0.035 / max(1, len(freqs) * 0.7)
    return sl * g, sr_ * g

def bass(f, dur, vel=0.7):
    n = int((dur + 0.3) * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t)
    x = np.tanh(1.4 * x) / np.tanh(1.4)
    e = env_adsr(n, 0.008, 0.2, 0.7, 0.25)
    return x * e * vel * 0.22

def kick(vel=0.8):
    n = int(0.45 * SR); t = np.arange(n) / SR
    f = 48 + 90 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * vel * 0.5

def shaker(vel=0.4):
    n = int(0.09 * SR); t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 5500, 11000)
    return x * np.exp(-t * 55) * np.minimum(1, t * 900) * vel * 0.16

def clap(vel=0.5):
    n = int(0.3 * SR); t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 1100, 4200)
    e = np.exp(-t * 22) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0) * (t < 0.03))
    return x * e * vel * 0.12

def bell(f, vel=0.4):
    n = int(2.5 * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t + 2.0 * np.exp(-t * 4) * np.sin(2 * np.pi * f * 3.5 * t))
    return x * np.exp(-t * 2.2) * vel * 0.12

def swell(dur=1.6, vel=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    x = bp(rng.standard_normal(n), 2500, 9000)
    e = (t / dur) ** 2.5 * np.exp(-np.maximum(0, t - dur * 0.92) * 40)
    return x * e * vel * 0.08

# ---------------------------------------------------------------- arrangement
# section = (start, end, progression, density, drums, key-offset, pad brightness)
SECT = [
    (0.0, B[1], ['Bm', 'G', 'D', 'A'], 'sparse', False, 0, 900),        # 1: questioning
    (B[1], B[3], ['D', 'A/C#', 'Bm', 'G'], 'groove', True, 0, 1300),     # 2–3: learning, light groove
    (B[3], B[4] - 2.6, ['Bm', 'G', 'Em', 'F#m'], 'dark', False, 0, 800),  # 4: bullying (restrained)
    (B[4] - 2.6, B[5], ['G', 'D', 'A', 'D'], 'groove', True, 0, 1300),   # 4 end + 5: rights
    (B[5], B[8], ['G', 'D/F#', 'Em', 'Asus4'], 'soft', False, 0, 950),   # 6–8: biblical & historical
    (B[8], B[9], ['D', 'A/C#', 'Bm', 'G'], 'groove', True, 0, 1300),     # 9: law
    (B[9], 180.0, ['G', 'A', 'Bm', 'D'], 'build', True, 0, 1500),        # 10: hope
]
slowdown = (7.0, 8.75)   # scene 1 "Será que isso é inclusão?" -> hold

for (s0, s1, prog, mode, drums, ko, bright) in SECT:
    t = s0; i = 0
    while t < s1 - 0.05:
        cname = prog[i % len(prog)]
        r, iv, b = chord(cname)
        bar_end = min(t + BAR, s1)
        d = bar_end - t
        root = 50 + r if r < 7 else 38 + r          # around D3
        notes = [root + x for x in iv]
        pl, pr = pad([hz(n) for n in notes] + ([hz(root + 12)] if mode in ('build', 'groove') else []), d + 0.6, bright=bright, att=0.35 if mode != 'sparse' else 1.2, rel=1.4)
        g = {'sparse': 0.8, 'groove': 1.0, 'dark': 0.75, 'soft': 0.9, 'build': 1.15}[mode]
        put_st(pl, pr, t, g)
        # bass
        if mode != 'sparse' or t > 8.7:
            bf = hz(26 + b if b < 7 else 26 + b - 12 + 12)
            bf = hz((26 + b) if (26 + b) >= 33 else (38 + b))
            for k in range(2 if mode in ('groove', 'build') else 1):
                bt = t + k * 2 * BEAT
                blen = 2 * BEAT * 0.9 if mode in ('groove', 'build') else d * 0.95
                if bt < bar_end - 0.1: put(bass(bf, blen, 0.8 if mode != 'dark' else 0.6), bt, 0.0)
        # arpeggio (electric piano)
        arp = [notes[0] + 12, notes[1] + 12, notes[2] + 12, notes[1] + 12, notes[2] + 12, notes[0] + 24, notes[2] + 12, notes[1] + 12]
        step = BEAT / 2 if mode in ('groove', 'build') else BEAT
        if mode == 'dark': step = BEAT
        k = 0; tt = t
        while tt < bar_end - 0.05:
            if not (slowdown[0] <= tt < slowdown[1]):
                if mode != 'sparse' or k % 2 == 0:
                    vel = (0.5 if k % 4 == 0 else 0.34) * (0.8 if mode == 'dark' else 1.0)
                    put(epiano(hz(arp[k % len(arp)]), step * 1.6, vel), tt, pan=0.35 * np.sin(k * 1.3))
            k += 1; tt += step
        # drums
        if drums:
            for bt_i in range(4):
                bt = t + bt_i * BEAT
                if bt >= bar_end - 0.02: break
                if bt_i in (0, 2): put(kick(0.75 if mode == 'build' else 0.6), bt, 0.0)
                if mode == 'build' and bt_i in (1, 3) and t > B[9] + 8.5: put(clap(0.6), bt, 0.1)
                for h in range(2): put(shaker(0.5 if h == 0 else 0.32), bt + h * BEAT / 2, 0.45)
        t = bar_end; i += 1

# bells on emphasis points (sparing)
for tb, n in [(B[1] + 0.2, 74), (B[3] - 0.1, 81), (B[5] + 0.3, 78), (B[8] - 0.3, 74), (B[9] + 15.0, 78), (B[9] + 15.4, 81), (B[9] + 15.8, 86)]:
    put(bell(hz(n), 0.5), tb, pan=0.2)
# final resolving chord rings out
fl, fr = pad([hz(n) for n in [50, 57, 62, 66, 69]], 2.6, bright=1700, att=0.4, rel=2.0)
put_st(fl, fr, 177.4, 1.3)
put(epiano(hz(74), 2.0, 0.6), 177.6, -0.2); put(epiano(hz(78), 2.0, 0.5), 177.75, 0.2); put(epiano(hz(81), 2.0, 0.5), 177.9, 0.0)

# ---------------------------------------------------------------- space & tone
def reverb_ir(dur=2.2, seed=1):
    r = np.random.default_rng(seed); n = int(dur * SR); t = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-t * 3.2); ir = lp(ir, 6000); ir[:int(0.012 * SR)] = 0
    return ir / np.sqrt(np.sum(ir ** 2))
wetL = fftconvolve(L, reverb_ir(seed=1))[:N]; wetR = fftconvolve(R, reverb_ir(seed=2))[:N]
L2 = L + 0.32 * wetL; R2 = R + 0.32 * wetR
# carve space for the voice: gentle dip 1–3.5 kHz
def peak_cut(x, f0, g_db, q):
    A = 10 ** (g_db / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]; a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return sosfilt(np.array([[b[0] / a[0], b[1] / a[0], b[2] / a[0], 1, a[1] / a[0], a[2] / a[0]]]), x)
L2 = hp(peak_cut(L2, 2000, -4.0, 0.7), 35); R2 = hp(peak_cut(R2, 2000, -4.0, 0.7), 35)
# fades
fi = int(0.4 * SR); L2[:fi] *= np.linspace(0, 1, fi); R2[:fi] *= np.linspace(0, 1, fi)
fo = int(1.2 * SR); L2[-fo:] *= np.linspace(1, 0, fo) ** 2; R2[-fo:] *= np.linspace(1, 0, fo) ** 2
y = np.stack([L2, R2], 1)
y /= np.abs(y).max() / 0.7
sf.write('audio/music.wav', y.astype(np.float32), SR, subtype='FLOAT')
print('music written', y.shape, 'peak', np.abs(y).max())
