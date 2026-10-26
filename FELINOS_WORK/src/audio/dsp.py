"""Voice restoration DSP helpers (mono float64 @ 48 kHz)."""
import numpy as np
from scipy.signal import butter, sosfiltfilt, sosfilt, stft, istft
from scipy.linalg import solve_toeplitz, lstsq

SR = 48000

def find_clip_runs(x, thr=0.97, min_len=2):
    idx = np.where(np.abs(x) >= thr)[0]
    if not len(idx): return []
    br = np.split(idx, np.where(np.diff(idx) > 1)[0] + 1)
    return [(b[0], b[-1] + 1) for b in br if len(b) >= min_len]

def _ar_coeffs(seg, p):
    r = np.correlate(seg, seg, 'full')[len(seg)-1:len(seg)+p]
    r[0] *= 1.0001
    return solve_toeplitz(r[:p], r[1:p+1])

def declip(x, thr=0.97, p=32, ctx=400):
    """Least-squares AR interpolation of clipped runs (Janssen-style, one pass),
    constrained so restored samples keep the sign and exceed the clip level."""
    y = x.copy(); runs = find_clip_runs(x, thr)
    for a, b in runs:
        a0 = max(0, a - ctx); b0 = min(len(x), b + ctx)
        seg = y[a0:b0].copy(); miss = np.arange(a - a0, b - a0)
        known = np.setdiff1d(np.arange(len(seg)), miss)
        c = _ar_coeffs(seg[known], p)
        h = np.concatenate([[1.0], -c])
        n = len(seg) - p
        A = np.zeros((n, len(seg)))
        for i in range(n): A[i, i:i+p+1] = h[::-1]
        Am, Ak = A[:, miss], A[:, known]
        sol = lstsq(Am, -Ak @ seg[known])[0]
        sgn = np.sign(seg[miss]); sol = sgn * np.maximum(np.abs(sol), np.abs(seg[miss]))
        seg[miss] = sol; y[a0:b0] = seg
    return y, runs

def frame_rms_db(x, hop=480):
    n = len(x) // hop
    return 20*np.log10(np.sqrt((x[:n*hop].reshape(n, hop)**2).mean(1)) + 1e-10)

def spectral_denoise(x, noise_clip, reduction_db=10.0, smooth=3, floor_over=1.5):
    """Conservative stationary spectral subtraction with a gain floor (limits
    max attenuation) and time/frequency smoothing of the gain mask to avoid
    musical noise."""
    nper = 2048; nov = 1536
    _, _, N = stft(noise_clip, SR, nperseg=nper, noverlap=nov)
    nprof = np.sqrt((np.abs(N)**2).mean(1, keepdims=True)) * floor_over
    f, t, Z = stft(x, SR, nperseg=nper, noverlap=nov)
    mag = np.abs(Z)
    g = np.clip(1 - (nprof / (mag + 1e-12))**2, 0, 1)
    gmin = 10**(-reduction_db/20)
    g = np.maximum(np.sqrt(g), gmin)
    from scipy.ndimage import uniform_filter
    g = uniform_filter(g, size=(smooth, smooth*2+1), mode='nearest')
    _, y = istft(Z * g, SR, nperseg=nper, noverlap=nov)
    return y[:len(x)]

def biquad_peak(f0, gain_db, q):
    A = 10**(gain_db/40); w = 2*np.pi*f0/SR; al = np.sin(w)/(2*q)
    b = [1+al*A, -2*np.cos(w), 1-al*A]; a = [1+al/A, -2*np.cos(w), 1-al/A]
    return np.array([[b[0]/a[0], b[1]/a[0], b[2]/a[0], 1, a[1]/a[0], a[2]/a[0]]])

def deess(x, lo=4800, hi=9500, thresh_db=4.0, max_red_db=7.0, att=0.002, rel=0.06):
    """Split-band dynamic de-esser: when 4.8–9.5 kHz band energy exceeds the
    300–3000 Hz band by > thresh_db, only that band is attenuated."""
    sos_b = butter(4, [lo, hi], 'bandpass', fs=SR, output='sos')
    sos_m = butter(2, [300, 3000], 'bandpass', fs=SR, output='sos')
    band = sosfiltfilt(sos_b, x); mid = sosfiltfilt(sos_m, x)
    def env(s):
        e = np.abs(s); out = np.empty_like(e); v = 0.0
        ca = np.exp(-1/(att*SR)); cr = np.exp(-1/(rel*SR))
        for i, s_ in enumerate(e):
            c = ca if s_ > v else cr; v = c*v + (1-c)*s_; out[i] = v
        return out
    eb, em = env(band), env(mid)
    over = 20*np.log10((eb+1e-9)/(em+1e-9)) - thresh_db
    red = np.clip(over * 0.6, 0, max_red_db)
    # ignore near-silence (no de-essing of noise)
    lvl = 20*np.log10(eb+em+1e-9); red[lvl < -50] = 0
    g = 10**(-red/20)
    return x - band + band*g, red

def tp_limiter(x, ceiling_db=-1.5, lookahead_ms=3.0, release_ms=120.0, sr=SR):
    """Look-ahead true-peak limiter. x: (N,) or (N,C). Peak detection on a 4x
    oversampled signal; gain = min over look-ahead window, exponential release.
    No makeup gain."""
    from scipy.signal import resample_poly
    from scipy.ndimage import minimum_filter1d
    X = x if x.ndim == 2 else x[:, None]
    up = np.abs(resample_poly(X, 4, 1, axis=0)).max(1)
    pk = up.reshape(-1, 4).max(1)[:len(X)]
    c = 10**(ceiling_db/20)
    g = np.minimum(1.0, c/(pk + 1e-12))
    la = int(lookahead_ms*sr/1000)
    g = minimum_filter1d(g, size=2*la+1, origin=0)
    # release smoothing (attack instantaneous thanks to look-ahead min)
    rel = np.exp(-1/(release_ms*sr/1000)); out = np.empty_like(g); v = 1.0
    for i in range(len(g)):
        v = g[i] if g[i] < v else rel*v + (1-rel)*g[i]; out[i] = v
    # short smoothing of attack to avoid clicks
    k = np.hanning(la*2+1); k /= k.sum()
    out = np.minimum(out, np.convolve(out, k, 'same'))
    Y = X * out[:, None]
    return (Y if x.ndim == 2 else Y[:, 0]), out
