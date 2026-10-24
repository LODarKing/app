import sys; sys.path.insert(0,'src/audio')
import numpy as np, soundfile as sf, glob, os, subprocess, json
from dsp import *
from scipy.signal import stft
def ff(inp, out, af):
    subprocess.run(['ffmpeg','-v','error','-y','-i',inp,'-af',af,'-c:a','pcm_f32le',out], check=True)
res={}
for p in sorted(glob.glob('audio/work/*_declip.wav')):
    k=os.path.basename(p)[:-11]; x=sf.read(p)[0]
    r=frame_rms_db(x); fl=np.percentile(r,5)
    quiet=np.concatenate([x[i*480:(i+1)*480] for i in range(len(r)) if r[i] < fl+6])
    C=spectral_denoise(x, quiet, reduction_db=10)
    sf.write(f'audio/work/{k}_dnC.wav', C, SR, subtype='FLOAT')
    ff(p, f'audio/work/{k}_dnB.wav', 'afftdn=nr=10:nf=-62:tn=1')
    ff(p, f'audio/work/{k}_dnD.wav', 'aresample=48000,arnndn=m=assets/generated_assets/models/rnnoise_cb.rnnn:mix=0.6')
    out={}
    for tag,y in [('A',x),('B',sf.read(f'audio/work/{k}_dnB.wav')[0]),('C',C),('D',sf.read(f'audio/work/{k}_dnD.wav')[0])]:
        y=y[:len(x)]
        f,t,Z=stft(y,SR,nperseg=2048,noverlap=1024); P=np.abs(Z)**2
        f2,t2,Z0=stft(x,SR,nperseg=2048,noverlap=1024); P0=np.abs(Z0)**2
        tot0=10*np.log10(P0.sum(0)+1e-20); hf0=P0[(f>4000)&(f<9000)].sum(0); mid0=P0[(f>300)&(f<3000)].sum(0)
        fric=(hf0>mid0)&(tot0>np.percentile(tot0,60)-25)   # fricative frames (from original)
        sil=tot0<np.percentile(tot0,8)
        fr_loss=10*np.log10(P[(f>4000)&(f<9000)][:,fric].sum()/hf0[fric].sum())
        sp=tot0>np.percentile(tot0,50)
        sp_loss=10*np.log10(P[:,sp].sum()/P0[:,sp].sum())
        sil_db=10*np.log10(P[:,sil].mean()+1e-20)
        # musical-noise proxy: temporal std of per-bin dB in silence 1-6 kHz
        band=(f>1000)&(f<6000); mn=float(np.std(10*np.log10(P[band][:,sil]+1e-20),axis=1).mean())
        out[tag]=dict(silence_db=round(sil_db,1), fricative_loss_db=round(fr_loss,2), speech_loss_db=round(sp_loss,2), silence_flicker_db=round(mn,1))
    res[k]=out; print(k[-6:], out)
json.dump(res, open('documentation/denoise_comparison.json','w'), indent=1)
