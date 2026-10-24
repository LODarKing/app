"""Narration edit: energy-accurate phrase boundaries, context-aware pause
shortening, phrase-level gentle gain riding, equal-power micro-crossfades.
Outputs audio/voice_edited_natural.wav + documentation/edit_decisions.json."""
import sys; sys.path.insert(0, 'src/audio')
import numpy as np, soundfile as sf, json, os
import pyloudnorm as pyln
from dsp import SR

T = json.load(open('documentation/transcript_raw_takes.json'))
TAKES = ['Narrac_a_o_Educac_a_o_Inclusiva_%02d' % i for i in range(1, 9)] + ['Narrac_a_o_09_e_10']
HOP = 480  # 10 ms
TARGET = {',': 0.22, '.': 0.34, '?': 0.42, '!': 0.40, ':': 0.26, '': 0.16}
SCENE_GAP = 0.52
LEAD, TAIL = 0.25, 0.0
XF = int(0.012 * SR)

def rms_db(x):
    n = len(x)//HOP; return 20*np.log10(np.sqrt((x[:n*HOP].reshape(n, HOP)**2).mean(1)) + 1e-10)

def speech_regions(x):
    r = rms_db(x); peak = np.percentile(r, 99); floor = np.percentile(r, 10)
    # hysteresis relative to both the speech peak and the take's own noise floor
    on = r > max(floor + 20, peak - 30)
    keep = r > max(floor + 9, peak - 44)
    act = np.zeros_like(on); i = 0; n = len(r)
    while i < n:
        if on[i]:
            j = i
            while j > 0 and keep[j-1]: j -= 1
            k = i
            while k < n and keep[k]: k += 1
            act[j:k] = True; i = k
        else: i += 1
    # merge gaps < 90 ms (stop consonant closures)
    regs = []; i = 0
    while i < n:
        if act[i]:
            j = i
            while j < n and act[j]: j += 1
            regs.append([i, j]); i = j
        else: i += 1
    merged = [regs[0]]
    for a, b in regs[1:]:
        if a - merged[-1][1] < 9: merged[-1][1] = b
        else: merged.append([a, b])
    # drop tiny blips < 60 ms far from speech (mouth clicks)
    # a region counts as speech only with >= 80 ms of clearly voiced energy
    merged = [m for m in merged if m[1]-m[0] >= 6 and (r[m[0]:m[1]] > peak - 22).sum() >= 8]
    # split at unvoiced stretches >= 150 ms (breaths / soft pauses inside a region)
    out = []; breaths = []
    for a, b in merged:
        seg = r[a:b] < peak - 26; cur = a; i = a
        while i < b:
            if seg[i-a]:
                j = i
                while j < b and seg[j-a]: j += 1
                if j - i >= 15 and i > cur + 5 and j < b - 5:
                    out.append([cur, i]); cur = j
                    if r[i:j].max() > floor + 15: breaths.append((i*HOP/SR, j*HOP/SR))
                i = j
            else: i += 1
        out.append([cur, b])
    for i in range(len(out) - 1):   # breaths in true silent gaps too
        a, b = out[i][1], out[i+1][0]
        if b - a >= 15:
            sub = r[a:b]; hot = np.where(sub > floor + 15)[0]
            if len(hot) >= 10: breaths.append(((a + hot[0])*HOP/SR, (a + hot[-1] + 1)*HOP/SR))
    speech_regions.breaths = breaths
    return [(a*HOP/SR, b*HOP/SR) for a, b in out], r

def punct_before(words, t):
    prev = [w for w in words if w['e'] <= t + 0.12]
    if not prev: return ''
    w = prev[-1]['w'].strip()
    return w[-1] if w and w[-1] in ',.?!:' else ''

def build():
    meter = pyln.Meter(SR); out = [np.zeros(int(LEAD*SR))]; t_out = LEAD
    decisions = []; scenes = []; words_out = []
    for take in TAKES:
        x = sf.read(f'audio/clean_takes/{take}.wav')[0]
        # edit points are analysed on the v1-processed take so timing stays fixed when the tonal EQ is refined
        regs, r = speech_regions(sf.read(f'audio/clean_takes_vad/{take}.wav')[0])
        words = T[take + '.wav']['words']
        # scene split for combined take 09_e_10 at "participar." -> "E o seu clube"
        splits = []
        if take.endswith('09_e_10'):
            idx = next(i for i, w in enumerate(words) if w['w'].strip() == 'participar.')
            splits = [(words[idx]['e'] + words[idx+1]['s'])/2]
        # phrases: group regions separated by pauses
        phr = [list(regs[0])]
        for a, b in regs[1:]:
            phr.append([a, b])
        scene_start = t_out; seg_scene = []
        split_idx = set()
        for sp_t in splits:
            split_idx.add(int(np.argmin([abs((phr[i][1] + phr[i+1][0])/2 - sp_t) for i in range(len(phr)-1)])))
        for i, (a, b) in enumerate(phr):
            pre = 0.025; post = 0.14
            a0 = max(0, a - pre)
            if i + 1 < len(phr):
                gap = phr[i+1][0] - b
                is_split = i in split_idx
                p = punct_before(words, b)
                tgt = SCENE_GAP if is_split else TARGET.get(p, TARGET[''])
                if gap <= tgt + 0.03 and not is_split:
                    b0 = phr[i+1][0] - pre  # keep natural gap untouched
                    keep_gap = gap; mode = 'kept'
                else:
                    b0 = min(b + post, b + tgt*0.6)
                    keep_gap = tgt; mode = 'shortened'
                decisions.append(dict(take=take, at=round(b, 3), punct=p, orig_gap=round(gap, 3), new_gap=round(keep_gap, 3), mode=mode, scene_split=is_split))
            else:
                b0 = min(len(x)/SR, b + 0.22)
            seg = x[int(a0*SR):int(b0*SR)].copy()
            seg_scene.append(dict(seg=seg, a0=a0, b0=b0, a=a, b=b, next_a=(phr[i+1][0] if i + 1 < len(phr) else None), gap_after=(keep_gap if i+1 < len(phr) else None), split=(i+1 < len(phr) and i in split_idx)))
        # phrase-level gain riding: half of deviation toward take median, clamp +-2 dB
        louds = []
        for s in seg_scene:
            L = meter.integrated_loudness(s['seg']) if len(s['seg']) > 0.45*SR else np.nan
            louds.append(L)
        med = np.nanmedian(louds)
        for s, L in zip(seg_scene, louds):
            dev = 0 if np.isnan(L) else med - L
            # only correct the part of a deviation beyond +-1.5 dB (keeps expressive dynamics)
            g = float(np.clip(np.sign(dev)*max(0, abs(dev) - 1.5)*0.6, -2.5, 2.5))
            s['gain'] = g; s['seg'] *= 10**(g/20)
        for s in seg_scene:
            seg = s['seg']; fade = min(XF, len(seg)//4)
            w = np.sin(np.linspace(0, np.pi/2, fade))**2
            seg[:fade] *= w; seg[-fade:] *= w[::-1]
            # map words (take time -> output time)
            for wd in words:
                mid = (wd['s'] + wd['e'])/2
                if s['a0'] - 0.05 <= mid < s['b0'] + 0.05:
                    words_out.append(dict(w=wd['w'].strip(), s=round(t_out + max(0, wd['s'] - s['a0']), 3), e=round(t_out + min(wd['e'], s['b0']) - s['a0'], 3), take=take))
            out.append(seg); t_out += len(seg)/SR
            if s['gap_after'] is not None:
                g_len = s['gap_after'] - (s['b0'] - s['b']) - 0.025
                g_len = max(g_len, 0.06)
                br = [bb for bb in speech_regions.breaths if s['b0'] <= bb[0] and bb[1] <= s['next_a'] + 0.01]
                gap_audio = np.zeros(int(g_len*SR))
                if br and s['gap_after'] >= 0.3:
                    ba, bb = br[-1]; ba = max(ba - 0.03, s['b0']); bb = min(bb + 0.03, s['next_a'] - 0.025)
                    breath = x[int(ba*SR):int(bb*SR)] * 10**(-6/20)
                    fl = min(len(breath)//3, int(0.04*SR)); w = np.sin(np.linspace(0, np.pi/2, fl))**2
                    breath[:fl] *= w; breath[-fl:] *= w[::-1]
                    if len(breath) + int(0.08*SR) > len(gap_audio):
                        gap_audio = np.zeros(len(breath) + int(0.08*SR)); g_len = len(gap_audio)/SR
                    gap_audio[-len(breath):] += breath; s['breath_kept'] = round(bb - ba, 3)
                out.append(gap_audio); t_out += g_len
                if s['split']:
                    scenes.append((scene_start, t_out - g_len)); scene_start = t_out
        scenes.append((scene_start, t_out))
        out.append(np.zeros(int(SCENE_GAP*SR))); t_out += SCENE_GAP
    # remove last scene gap, add tail
    y = np.concatenate(out)[:int((t_out - SCENE_GAP)*SR)]
    y = np.concatenate([y, np.zeros(int(TAIL*SR))])
    return y, decisions, scenes, words_out

if __name__ == '__main__':
    y, dec, scenes, words = build()
    sf.write('audio/voice_edited_natural_mono.wav', y, SR, subtype='FLOAT')
    json.dump(dict(decisions=dec, scenes=scenes, words=words), open('documentation/edit_decisions.json', 'w'), ensure_ascii=False, indent=1)
    print('total', round(len(y)/SR, 2), 'scenes', [(round(a, 2), round(b, 2)) for a, b in scenes])
    print('shortened', sum(d['mode'] == 'shortened' for d in dec), 'kept', sum(d['mode'] == 'kept' for d in dec),
          'saved', round(sum(d['orig_gap'] - d['new_gap'] for d in dec), 2))
