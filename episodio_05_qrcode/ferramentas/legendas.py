"""Legendas a partir do roteiro (legendas/grupos.txt) com os tempos por palavra do Whisper
(audio/narracao_ia_palavras.json). Alinha palavra a palavra (normalizando acentos e pontuação; "QR Code" = 1 token).
Saídas: legendas.srt (raiz do episódio) e projeto_remotion/src/legendas.json."""
import json, re, unicodedata
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)
def tokens(line):
    clean = re.sub(r'[*_]', '', line).replace('QR Codes', 'QR-Codes').replace('QR Code', 'QR-Code')
    return clean.split()
grupos = [l.rstrip('\n') for l in open('legendas/grupos.txt', encoding='utf-8') if l.strip() and not l.startswith('#')]
W0 = json.load(open('audio/narracao_ia_palavras.json')); W = []
for w in W0:  # o Whisper parte "QR-code" em "QR" + "-code": junta de volta
    if W and w['w'].startswith('-'): W[-1] = dict(w=W[-1]['w'] + w['w'], ini=W[-1]['ini'], fim=w['fim'])
    else: W.append(dict(w))
wi, out = 0, []
for g in grupos:
    toks = tokens(g); ini = fim = None; ws = []
    for t in toks:
        while wi < len(W) and norm(W[wi]['w']) != norm(t):
            print('  aviso: pulando', W[wi]['w'], 'esperando', t); wi += 1
        if wi >= len(W): raise SystemExit(f'não alinhou: {t} em "{g}"')
        if ini is None: ini = W[wi]['ini']
        fim = W[wi]['fim']; ws.append(W[wi]['ini']); wi += 1
    out.append(dict(texto=g, ini=ini, fim=fim, palavras=ws))
# cada legenda fica até a próxima começar (no máximo +0,6 s depois da última palavra), nunca sobrepõe
for i, g in enumerate(out):
    nxt = out[i + 1]['ini'] if i + 1 < len(out) else g['fim'] + 0.8
    g['fim'] = round(min(nxt - 0.02, g['fim'] + 0.6), 3)
json.dump(out, open('projeto_remotion/src/legendas.json', 'w'), ensure_ascii=False, indent=1)
def ts(t):
    ms = int(round(t * 1000)); return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}'
with open('legendas.srt', 'w', encoding='utf-8') as f:
    for i, g in enumerate(out, 1): f.write(f"{i}\n{ts(g['ini'])} --> {ts(g['fim'])}\n{re.sub(r'[*_]', '', g['texto'])}\n\n")
print(len(out), 'legendas'); [print(f"{g['ini']:6.2f}-{g['fim']:6.2f} {g['texto']}") for g in out[:10]]
