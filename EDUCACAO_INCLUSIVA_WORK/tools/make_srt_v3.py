"""Legendas SRT do vídeo v3 com a mesma divisão de frases das legendas dinâmicas (remotion/src/full/Captions.tsx)."""
import json, re, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(R)
W = json.load(open('remotion/src/words_all.json'))
phrases, cur = [], []
def L(ids): return sum(len(W[j]['w']) + 1 for j in ids)
def flush():
    global cur
    if not cur: return
    total, acc, cut = L(cur), 0, len(cur)
    for k, j in enumerate(cur):
        acc += len(W[j]['w']) + 1
        if acc >= total / 2: cut = k + 1; break
    lines = [cur] if total <= 16 or len(cur) == 1 else [l for l in (cur[:cut], cur[cut:]) if l]
    phrases.append((cur, lines)); cur = []
for i, w in enumerate(W):
    if cur and (W[cur[0]]['sc'] != w['sc'] or w['s'] - W[cur[-1]]['e'] > 0.45): flush()
    cur.append(i)
    if re.search(r'[.?!]$', w['w']) or (w['w'].endswith(',') and L(cur) > 14) or len(cur) >= 6 or L(cur) > 30: flush()
flush()
ts = lambda x: f'{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{int(x % 60):02d},{int(round((x % 1) * 1000)) % 1000:03d}'
out = []
for n, (ids, lines) in enumerate(phrases):
    s = W[ids[0]]['s']; e = W[ids[-1]]['e'] + 0.5
    if n + 1 < len(phrases): e = min(e, W[phrases[n + 1][0][0]]['s'] - 0.02)
    out.append(f"{n + 1}\n{ts(s)} --> {ts(e)}\n" + '\n'.join(' '.join(W[j]['w'] for j in l) for l in lines) + '\n')
open('subtitles/final.srt', 'w').write('\n'.join(out))
print(len(phrases), 'legendas')
