import json
tm = json.load(open('documentation/timemap.json')); sc = json.load(open('documentation/edit_decisions.json'))['scenes']
(a, b), (ta, tb), r = tm['phrase'], tm['mapped'], tm['outside_ratio']
def warp(t):
    if t <= a: return t/r
    if t <= b: return ta + (t-a)/1.05
    return tb + (t-b)/r
W = json.load(open('documentation/transcricao_timestamps.json'))['words']
out = []
for k, (s, e) in enumerate(sc):
    out.append(dict(scene=k+1, voice_start=round(warp(s), 3), voice_end=round(warp(e), 3)))
for k, s in enumerate(out):
    s['start'] = 0.0 if k == 0 else round((out[k-1]['voice_end'] + s['voice_start'])/2, 3)
starts = ['Imagine', 'Ter', 'Existem', 'Discriminação', 'Em', 'Em', 'Em', 'Helen', 'No', 'E']
idx = []; j = 0
for st in starts:
    while W[j]['w'].rstrip(',.?') != st: j += 1
    idx.append(j); j += 1
idx.append(len(W))
for k, s in enumerate(out):
    s['end'] = round(out[k+1]['start'], 3) if k+1 < len(out) else 180.0
    s['dur'] = round(s['end'] - s['start'], 3)
    s['words'] = [dict(w) for w in W[idx[k]:idx[k+1]]]
    s['words'][0]['s'] = max(s['words'][0]['s'], s['voice_start'])
    s['words'][-1]['e'] = min(s['words'][-1]['e'], s['voice_end'])
    for w in s['words']:
        w['s'] = min(max(w['s'], s['voice_start']), s['voice_end']); w['e'] = min(max(w['e'], w['s'] + 0.05), s['voice_end'])
    s['text'] = ' '.join(w['w'] for w in s['words'])
json.dump(out, open('documentation/scene_bounds.json', 'w'), ensure_ascii=False, indent=1)
json.dump(dict(json.load(open('documentation/transcricao_timestamps.json')), words=[w for s in out for w in s['words']]), open('documentation/transcricao_timestamps.json', 'w'), ensure_ascii=False, indent=1)
for s in out: print(s['scene'], s['start'], s['end'], s['dur'], 'voice', s['voice_start'], s['voice_end'], '|', s['text'][:50], '...', s['text'][-25:])
