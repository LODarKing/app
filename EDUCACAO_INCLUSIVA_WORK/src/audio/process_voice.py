"""Voice restoration chain, applied per take after declip (+ -6 dB headroom).
Order: spectral denoise (C) -> HPF 80 Hz -> dynamic plosive control -> corrective EQ
-> split-band de-esser -> gentle compression -> take loudness alignment."""
import sys; sys.path.insert(0, 'src/audio')
import numpy as np, soundfile as sf, glob, os, json
import pyloudnorm as pyln
from pedalboard import Pedalboard, Compressor, HighpassFilter, PeakFilter, HighShelfFilter
from scipy.signal import butter, sosfiltfilt, sosfilt
from dsp import *

def plosive_control(x, fc=130, max_red_db=10.0):
    lo_sos = butter(2, fc, 'lowpass', fs=SR, output='sos')
    low = sosfiltfilt(lo_sos, x); rest = x - low
    sos_m = butter(2, [300, 3000], 'bandpass', fs=SR, output='sos'); mid = sosfiltfilt(sos_m, x)
    def env(s, ms=8):
        k = int(ms*SR/1000); return np.sqrt(np.convolve(s**2, np.ones(k)/k, 'same'))
    el, em = env(low), env(mid)
    over = 20*np.log10((el+1e-9)/(em+1e-9)) - 0.0     # LF burst louder than the mids
    red = np.clip(over*0.8, 0, max_red_db)
    red = np.convolve(red, np.hanning(int(0.01*SR))/np.hanning(int(0.01*SR)).sum(), 'same')
    return rest + low*10**(-red/20), red

def chain(x):
    log = {}
    r = frame_rms_db(x); fl = np.percentile(r, 5)
    quiet = np.concatenate([x[i*480:(i+1)*480] for i in range(len(r)) if r[i] < fl+6])
    x = spectral_denoise(x, quiet, reduction_db=10)
    x = Pedalboard([HighpassFilter(80)])(x.astype(np.float32), SR).astype(np.float64)
    x = Pedalboard([HighpassFilter(80)])(x.astype(np.float32), SR).astype(np.float64)  # 2nd-order total 12 dB/oct
    x, pr = plosive_control(x); log['plosive_frames_reduced_gt3db_ms'] = int((pr > 3).sum()/SR*1000)
    if os.environ.get('EQ_PRESET') == 'v1':   # first-pass EQ, kept only to reproduce the v1 edit timing analysis
        eq = Pedalboard([PeakFilter(420, -3.0, 1.3), PeakFilter(3400, 2.5, 1.0), PeakFilter(160, -1.0, 0.9)])
    else:
        eq = Pedalboard([PeakFilter(420, -2.0, 1.2), PeakFilter(3200, 0.6, 1.2), PeakFilter(160, -1.0, 0.9), HighShelfFilter(7500, -1.5, 0.7)])
    x = eq(x.astype(np.float32), SR).astype(np.float64)
    x, dr = deess(x); log['deess_active_ms'] = int((dr > 1).sum()/SR*1000); log['deess_max_db'] = round(float(dr.max()), 1)
    r = frame_rms_db(x); sp = np.percentile(r[r > np.percentile(r, 40)], 85)
    thr = float(sp - 3.0)
    comp = Pedalboard([Compressor(threshold_db=thr, ratio=2.5, attack_ms=12, release_ms=140)])
    y = comp(x.astype(np.float32), SR).astype(np.float64)
    gr = frame_rms_db(x) - frame_rms_db(y); act = frame_rms_db(x) > thr - 10
    log['comp_threshold_db'] = round(thr, 1); log['comp_avg_gr_active_db'] = round(float(gr[act].mean()), 2); log['comp_max_gr_db'] = round(float(gr.max()), 2)
    return y, log

if __name__ == '__main__':
    OUT = os.environ.get('OUT_DIR', 'audio/clean_takes')
    os.makedirs(OUT, exist_ok=True)
    meter = pyln.Meter(SR); logs = {}
    for p in sorted(glob.glob('audio/work/*_declip.wav')):
        k = os.path.basename(p)[:-11]; x = sf.read(p)[0]
        y, log = chain(x)
        L = meter.integrated_loudness(y); g = -19.0 - L
        y *= 10**(g/20); log['take_gain_to_-19LUFS_db'] = round(g, 2)
        sf.write(f'{OUT}/{k}.wav', y, SR, subtype='FLOAT')
        logs[k] = log; print(k[-6:], log)
    if OUT == 'audio/clean_takes': json.dump(logs, open('documentation/voice_chain_log.json', 'w'), indent=1)
