# Instrumentos e utilidades de síntese (numpy), compartilhados pela trilha do piloto e do episódio completo.
# Tudo sintetizado em código: sem amostras de terceiros. Ruído sempre com semente.
import wave
import numpy as np
SR = 48000
rng = np.random.default_rng(20210421)

def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, sig, t0, gain=1.0):
    i0 = int(round(t0 * SR))
    if i0 >= len(buf):
        return
    j0 = max(0, -i0)
    sig = sig[j0:]
    i0 = max(0, i0)
    n = min(len(sig), len(buf) - i0)
    buf[i0:i0 + n] += gain * sig[:n]


def onepole_lp(x, fc):
    # passa-baixa de 1 polo via FFT (resposta exata do filtro, sem laço em Python)
    a = np.exp(-2 * np.pi * fc / SR)
    n = len(x)
    nf = 1 << int(np.ceil(np.log2(2 * n)))
    w = np.fft.rfftfreq(nf) * 2 * np.pi
    Hf = (1 - a) / (1 - a * np.exp(-1j * w))
    return np.fft.irfft(np.fft.rfft(x, nf) * Hf, nf)[:n]


def hp(x, fc):
    return x - onepole_lp(x, fc)


def reverb(x, secs=2.2, mix=0.25, seed=7):
    r = np.random.default_rng(seed)
    n = int(secs * SR)
    tt = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-tt * 6.9 / secs)
    ir = onepole_lp(ir, 5200)
    ir[: int(0.012 * SR)] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    nf = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[: len(x)]
    return (1 - mix) * x + mix * wet * 0.6


# ---------- instrumentos ----------
def pad_note(f, dur, att=0.6, rel=0.9, bright=1.0):
    n = int((dur + rel) * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.11, 0.0, 0.13):
        ff = f * 2 ** (det / 12)
        for h in range(1, 9):
            s += np.sin(2 * np.pi * ff * h * tt + h * 1.3 + det * 40) / h ** (1.9 - 0.4 * bright)
    env = np.minimum(1, tt / att) * np.where(tt < dur, 1.0, np.exp(-(tt - dur) * 5 / rel))
    vib = 1 + 0.08 * np.sin(2 * np.pi * 0.23 * tt)
    return s * env * vib / 6


def pluck(f, dur=0.9, bright=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for h in range(1, 12):
        s += np.sin(2 * np.pi * f * h * tt + h) * np.exp(-tt * (2.6 + 3.2 * h / bright)) / h ** 1.15
    s *= np.minimum(1, tt / 0.003)
    return s / 2


def taiko(f0=82, dur=1.2, gain=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = f0 * (0.55 + 0.45 * np.exp(-tt * 14))
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt * 4.2)
    skin = onepole_lp(rng.standard_normal(n), 1400) * np.exp(-tt * 28) * 0.9
    return (body + skin) * gain


def shaker(dur=0.09):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 5000) * np.exp(-tt * 55) * np.minimum(1, tt / 0.006)


def sweep_noise(dur, f0, f1, curve=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = rng.standard_normal(n)
    # banco de passa-baixas em blocos com corte variando (aproximação de varredura)
    out = np.zeros(n)
    blk = 2048
    for i in range(0, n, blk):
        k = (i / n) ** curve
        fc = f0 * (f1 / f0) ** k
        seg = x[max(0, i - blk): i + blk]
        y = onepole_lp(onepole_lp(seg, fc), fc)
        out[i: i + blk] = y[(i - max(0, i - blk)):(i - max(0, i - blk)) + min(blk, n - i)]
    return out


def tone(f, dur, kind='sine', dec=18):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    if kind == 'sq':
        s = np.zeros(n)
        for h in (1, 3, 5, 7):
            s += np.sin(2 * np.pi * f * h * tt) / h
    else:
        s = np.sin(2 * np.pi * f * tt)
    return s * np.exp(-tt * dec) * np.minimum(1, tt / 0.004)


def medir_batidas(x):
    hop, win = 256, 1024
    frames = 1 + (len(x) - win) // hop
    idx = np.arange(win)[None, :] + hop * np.arange(frames)[:, None]
    S = np.abs(np.fft.rfft(x[idx] * np.hanning(win), axis=1))
    S = np.log1p(S * 10)
    flux = np.maximum(0, np.diff(S, axis=0)).sum(axis=1)
    flux = flux - np.convolve(flux, np.ones(16) / 16, mode='same')
    flux = np.maximum(flux, 0)
    fps = SR / hop
    ac = np.correlate(flux, flux, mode='full')[len(flux) - 1:]
    lo, hi = int(0.4 * fps), int(1.0 * fps)
    lag = lo + int(np.argmax(ac[lo:hi]))
    # refina o período com interpolação parabólica
    y0, y1, y2 = ac[lag - 1], ac[lag], ac[lag + 1]
    per = (lag + 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2)) / fps
    # fase: maximiza a energia de ataque nos pontos da grade
    best, fase = -1, 0
    for ph in np.arange(0, per, 1 / fps):
        pts = (np.arange(ph, len(x) / SR - 0.05, per) * fps).astype(int) - 1
        pts = pts[(pts >= 0) & (pts < len(flux))]
        v = flux[pts].sum() + flux[np.minimum(pts + 1, len(flux) - 1)].sum()
        if v > best:
            best, fase = v, ph
    # o índice i do fluxo corresponde ao instante (i+1)*hop + win/2 (centro da janela que viu o ataque)
    beats = np.arange(fase, len(x) / SR - 0.3, per) + (win / 2) / SR
    while beats[0] - per > -0.03:  # a grade continua para trás até o início
        beats = np.concatenate([[beats[0] - per], beats])
    return 60 / per, beats


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], 1) if x.ndim == 1 else x
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())


