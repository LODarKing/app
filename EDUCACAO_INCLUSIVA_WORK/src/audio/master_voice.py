import sys; sys.path.insert(0, 'src/audio')
import numpy as np, soundfile as sf, pyloudnorm as pyln, glob
from dsp import SR, tp_limiter
from edit_voice import TAKES
meter = pyln.Meter(SR)
def stereo(m): return np.stack([m, m], 1)
def finish(m, target_lufs):
    g = target_lufs - meter.integrated_loudness(stereo(m)); m = m * 10**(g/20)
    m, gr = tp_limiter(m, -1.5)
    print('limiter max GR dB', round(-20*np.log10(gr.min()), 2), 'ms >0.5dB', int((gr < 10**(-0.5/20)).sum()/SR*1000))
    return m
gap = np.zeros(int(0.8*SR))
orig = np.concatenate(sum([[sf.read(f'audio/takes_original/{t}.wav')[0][:, 0], gap] for t in TAKES], []))
sf.write('audio/voice_original.wav', stereo(orig), SR, subtype='PCM_24')
clean = np.concatenate(sum([[sf.read(f'audio/clean_takes/{t}.wav')[0], gap] for t in TAKES], []))
sf.write('audio/voice_clean.wav', stereo(finish(clean, -16.0)), SR, subtype='PCM_24')
nat = sf.read('audio/voice_edited_natural_mono.wav')[0]
sf.write('audio/voice_edited_natural_tempo.flac', stereo(finish(nat, -16.0)), SR, subtype='PCM_24', format='FLAC')
st = sf.read('audio/work/voice_stretched_mono.wav')[0]
sf.write('audio/voice_edited.wav', stereo(finish(st, -16.0)), SR, subtype='PCM_24')
