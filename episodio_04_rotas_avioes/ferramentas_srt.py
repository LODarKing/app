"""Gera legendas.srt e roteiro_final.txt a partir de audio/narracao_tempos.json (mesma regra de blocos da tela)."""
import json, re
d = json.load(open('audio/narracao_tempos.json'))
FUNC = set('a o as os um uma de do da dos das no na nos nas em e que por para se te ao à com sua seu mais é esse esta está entre chamado'.split())
chunks = []
for fr in d['frases']:
    ws = fr['palavras']; cur = []
    for i, w in enumerate(ws):
        cur.append(w); rest = len(ws) - i - 1
        if re.search(r'[,:.!?…]$', w['p']) or (len(cur) >= 4 and rest > 1 and w['p'].lower() not in FUNC) or len(cur) >= 6:
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
def ts(t):
    ms = int(round(max(0, t) * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'
out = []
for k, c in enumerate(chunks):
    t0 = c[0]['i'] - 0.08; t1 = c[-1]['f'] + 0.45
    if k + 1 < len(chunks): t1 = min(t1, chunks[k + 1][0]['i'] - 0.1)
    out.append(f"{k+1}\n{ts(t0)} --> {ts(t1)}\n{' '.join(w['p'] for w in c).replace('...', '…')}\n")
open('legendas.srt', 'w').write('\n'.join(out))
print(len(chunks), 'blocos'); [print(' ', ' '.join(w['p'] for w in c)) for c in chunks[:12]]
