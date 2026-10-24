import sys, glob, json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import welch
out = {}
for p in sorted(glob.glob(sys.argv[1] + '/*.wav')):
    x, sr = sf.read(p)
    L, R = x[:,0], x[:,1]
    corr = float(np.corrcoef(L, R)[0,1]); diffdb = 20*np.log10(np.std(L-R)/np.std(L+R)+1e-12)
    m = x.mean(1)
    peak = float(np.max(np.abs(x))); clip = int(np.sum(np.abs(x) > 0.999))
    lufs = pyln.Meter(sr).integrated_loudness(x)
    # frame RMS 20ms
    hop = int(0.02*sr); n = len(m)//hop
    fr = m[:n*hop].reshape(n, hop); rms = 20*np.log10(np.sqrt((fr**2).mean(1))+1e-10)
    noise_floor = float(np.percentile(rms, 5)); speech = float(np.percentile(rms, 90))
    # silence segments (rms < floor+10dB) longer than 300ms
    thr = noise_floor + 12
    sil = rms < thr; segs=[]; i=0
    while i < n:
        if sil[i]:
            j=i
            while j<n and sil[j]: j+=1
            if (j-i)*0.02 >= 0.3: segs.append((round(i*0.02,2), round(j*0.02,2)))
            i=j
        else: i+=1
    # noise spectrum in quietest frames
    q = np.argsort(rms)[:max(10,n//20)]
    noise = np.concatenate([fr[k] for k in sorted(q)])
    f, Pn = welch(noise, sr, nperseg=16384)
    f, Ps = welch(m, sr, nperseg=16384)
    bands = {}
    for lo,hi in [(20,60),(60,120),(120,250),(250,500),(500,1000),(1000,2000),(2000,4000),(4000,8000),(8000,12000),(12000,16000),(16000,20000)]:
        s=(f>=lo)&(f<hi); bands[f'{lo}-{hi}'] = [round(10*np.log10(Ps[s].mean()+1e-20),1), round(10*np.log10(Pn[s].mean()+1e-20),1)]
    # hum check 50/60Hz peaks in noise
    def pk(fr0):
        s=(f>fr0-3)&(f<fr0+3); s2=(f>fr0-20)&(f<fr0+20)
        return round(10*np.log10(Pn[s].max()/np.median(Pn[s2])),1)
    # bandwidth: highest freq where speech PSD > noise+? 
    cutoff = float(f[np.where(10*np.log10(Ps+1e-20) > 10*np.log10(Pn+1e-20)+6)[0].max()])
    out[p.split('/')[-1]] = dict(dur=round(len(m)/sr,2), stereo_corr=round(corr,4), side_vs_mid_db=round(diffdb,1), peak_dbfs=round(20*np.log10(peak),2), clipped_samples=clip, lufs=round(lufs,1), noise_floor_db=round(noise_floor,1), speech_p90_db=round(speech,1), snr_est=round(speech-noise_floor,1), hum50=pk(50), hum60=pk(60), hum100=pk(100), hum120=pk(120), speech_over_noise_upto_hz=cutoff, bands_speech_noise_db=bands, silences=segs)
print(json.dumps(out, indent=1))
