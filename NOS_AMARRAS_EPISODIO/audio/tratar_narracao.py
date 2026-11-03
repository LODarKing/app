"""Tratamento LEVE da narração + ajuste de tempo autorizado pelo usuário.
Cadeia (por cena; as regiões de fala usam histerese para não cortar finais fracos de palavra):
  1) picos estourados refeitos por interpolação cúbica;
  2) passa-altas 80 Hz; redução de ruído estacionária suave (noisereduce, 55%);
  3) compressão leve 2,5:1 (RMS, ataque 10 ms, liberação 120 ms);
  4) pausas encurtadas SÓ no silêncio: até 0,45 s após ponto/interrogação, 0,28 s após vírgula/dois-pontos, 0,15 s nos demais;
     cortes de frases inteiras somente quando listados em CORTES (com autorização);
  5) andamento: rubberband (altura e formantes preservados), fator FATOR;
  6) -18 LUFS por cena, pico <= -1,5 dBFS.
Também grava o mapa de tempos de cada palavra (original -> tratado) para sincronia e legendas.
Com --estudio, o áudio passa pela cadeia "som de estúdio" (audio/estudio_voz.py). As regiões de fala, as pausas
e o andamento são calculados exatamente como antes, então os tempos das palavras (e a imagem) não mudam.
Uso: python3 audio/tratar_narracao.py FATOR [saida] [cenas...] [--estudio]      ex.: python3 audio/tratar_narracao.py 1.12"""
import json, os, sys, subprocess, numpy as np, soundfile as sf, pyloudnorm as pyln, noisereduce as nr
from scipy.signal import butter, sosfilt
from scipy.interpolate import CubicSpline
sys.path.insert(0, 'audio')

ESTUDIO = '--estudio' in sys.argv; sys.argv = [a for a in sys.argv if a != '--estudio']
FATOR = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
SAIDA = sys.argv[2] if len(sys.argv) > 2 else f'narracao/tratadas_{FATOR:.2f}'
CENAS = sys.argv[3:] or [f'cena{i:02d}' for i in range(1, 10)]
CORTES = json.load(open('narracao/cortes.json')) if os.path.exists('narracao/cortes.json') else {}   # {"cena01": [[i0, i1]], ...} índices de palavras
TR = json.load(open('narracao/transcricao_originais.json'))
os.makedirs(SAIDA, exist_ok=True); SR = 48000; M = pyln.Meter(SR)

def declip(x, lim=0.98):
    y = x.copy(); bad = np.abs(x) >= lim; i = 0; n = len(x)
    while i < n:
        if bad[i]:
            j = i
            while j < n and bad[j]: j += 1
            a, b = max(0, i - 8), min(n, j + 8); ok = [k for k in range(a, b) if not bad[k]]
            if len(ok) >= 4: y[i:j] = CubicSpline(ok, x[ok])(np.arange(i, j))
            i = j
        else: i += 1
    return y

def compressor(x, thr_db=-24, ratio=2.5, att=0.01, rel=0.12):
    h = 240; rms = np.sqrt(np.convolve(x ** 2, np.ones(h) / h, 'same') + 1e-12); lvl = 20 * np.log10(rms)
    gr = np.where(lvl > thr_db, (lvl - thr_db) * (1 - 1 / ratio), 0.0)
    a, r = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR)); g = np.zeros_like(gr); c = 0.0
    for i in range(len(gr)):
        c = a * c + (1 - a) * gr[i] if gr[i] > c else r * c + (1 - r) * gr[i]; g[i] = c
    return x * 10 ** (-g / 20)

def regioes_fala(x):
    h = int(0.01 * SR); e = 20 * np.log10(np.sqrt(np.array([np.mean(x[i:i + h] ** 2) for i in range(0, len(x) - h, h)])) + 1e-9)
    fl = np.percentile(e, 8); on = e > fl + 14; idx = np.where(on)[0]; reg = []; s = p = idx[0]
    for i in idx[1:]:
        if i - p > 8: reg.append([s, p + 1]); s = i
        p = i
    reg.append([s, p + 1])
    # histerese: cada região se estende enquanto a energia ficar 6 dB acima do piso (finais de palavra fracos, como "-co" em "tranco")
    for r in reg:
        while r[0] > 0 and e[r[0] - 1] > fl + 6: r[0] -= 1
        while r[1] < len(e) and e[r[1]] > fl + 6: r[1] += 1
    out = [[max(0, a * h - int(0.03 * SR)), min(len(x), b * h + int(0.06 * SR))] for a, b in reg]
    fund = [out[0]]
    for a, b in out[1:]:
        if a <= fund[-1][1]: fund[-1][1] = max(fund[-1][1], b)
        else: fund.append([a, b])
    return fund

relat = {}
for cena in CENAS:
    x, sr = sf.read(f'narracao/originais/{cena}.wav'); assert sr == SR; x_orig = x.copy()
    x = declip(x); x = sosfilt(butter(4, 80, 'highpass', fs=SR, output='sos'), x)
    reg = regioes_fala(x); P = TR[cena]['palavras']
    # finais de palavra ditos baixinho (ex.: "mas-tro." caindo no piso): a região vai até o fim da palavra transcrita
    for k in range(len(reg)):
        prox = reg[k + 1][0] if k + 1 < len(reg) else len(x)
        fins = [int((p_[2] + 0.04) * SR) for p_ in P if reg[k][1] < p_[2] * SR < prox and p_[1] * SR < reg[k][1]]
        if fins: reg[k][1] = min(max(fins), prox)

    # amostra de ruído: maior trecho fora da fala
    gaps = [(reg[i][1], reg[i + 1][0]) for i in range(len(reg) - 1)] + [(0, reg[0][0]), (reg[-1][1], len(x))]
    g0 = max(gaps, key=lambda g: g[1] - g[0]); ruido = x[g0[0]:g0[1]] if g0[1] - g0[0] > SR * 0.15 else None
    x = nr.reduce_noise(y=x, sr=SR, y_noise=ruido, stationary=True, prop_decrease=0.55)
    x = compressor(x)
    if ESTUDIO:
        from estudio_voz import estudio
        x = estudio(x_orig, reg, P)
    # cortes autorizados (frases inteiras): remove do início da 1ª palavra até o início da palavra seguinte ao trecho
    remov = []
    for i0, i1 in CORTES.get(cena, []):
        a = P[i0][1]; b = P[i1 + 1][1] if i1 + 1 < len(P) else len(x) / SR; remov.append((int(a * SR), int(b * SR)))
    def removido(s): return any(a <= s < b for a, b in remov)
    # monta: regiões de fala (fora dos cortes) com pausas limitadas pela pontuação
    segs, partes, t_out = [], [], 0.0
    reg = [r for r in reg if not removido((r[0] + r[1]) // 2)]
    lead = int(0.12 * SR); fade = int(0.015 * SR)
    partes.append(np.zeros(lead)); t_out = lead
    for k, (a, b) in enumerate(reg):
        seg = x[a:b].copy()
        if k == 0: seg[:fade] *= np.linspace(0, 1, fade)
        if k == len(reg) - 1: seg[-fade:] *= np.linspace(1, 0, fade)
        segs.append((a, b, t_out)); partes.append(seg); t_out += len(seg)
        if k + 1 < len(reg):
            g = reg[k + 1][0] - b; tt = b / SR
            w = min(P, key=lambda p: abs(p[2] - tt))[0]
            alvo = 0.45 if w[-1] in '.?!' else 0.28 if w[-1] in ',:;' else 0.15
            # a pausa mantém o som original (consoantes fracas e ambiente); se for longa, sai só o miolo, com transição
            n = int(min(g / SR, alvo) * SR)
            if g <= n: pausa = x[b:b + g].copy()
            else:
                h2 = n // 2; ini, fim = x[b:b + h2 + fade].copy(), x[reg[k + 1][0] - (n - h2) - fade:reg[k + 1][0]].copy()
                ini[-fade:] *= np.linspace(1, 0, fade); fim[:fade] *= np.linspace(0, 1, fade)
                pausa = np.concatenate([ini[:-fade], ini[-fade:] + fim[:fade], fim[fade:]])
            partes.append(pausa); t_out += len(pausa)
    partes.append(np.zeros(int(0.15 * SR)))
    y = np.concatenate(partes)
    # andamento (rubberband via ffmpeg), preservando altura e formantes
    tmp_in, tmp_out = f'{SAIDA}/_{cena}_in.wav', f'{SAIDA}/_{cena}_out.wav'
    sf.write(tmp_in, y.astype(np.float32), SR, subtype='FLOAT')
    if abs(FATOR - 1) > 1e-3:
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp_in, '-af', f'rubberband=tempo={FATOR}:pitchq=quality:formant=preserved:transients=smooth', '-c:a', 'pcm_f32le', tmp_out], check=True)
        y, _ = sf.read(tmp_out)
    os.remove(tmp_in); os.path.exists(tmp_out) and os.remove(tmp_out)
    y = pyln.normalize.loudness(y, M.integrated_loudness(y), -18.0); pk = np.abs(y).max()
    if ESTUDIO:
        from dsp_voz import tp_limiter
        y, _ = tp_limiter(y, ceiling_db=-1.5)
    elif pk > 10 ** (-1.5 / 20): y *= 10 ** (-1.5 / 20) / pk
    sf.write(f'{SAIDA}/{cena}.wav', y.astype(np.float32), SR, subtype='PCM_24')
    # mapa de tempos das palavras
    def mapa(t):
        s = t * SR
        for a, b, o in segs:
            if a <= s <= b: return round((o + s - a) / SR / FATOR, 3)
        best = min(segs, key=lambda q: min(abs(s - q[0]), abs(s - q[1]))); a, b, o = best
        return round((o + (0 if abs(s - a) < abs(s - b) else b - a)) / SR / FATOR, 3)
    palavras = [[p[0], mapa(p[1]), mapa(p[2])] for i, p in enumerate(P) if not removido(int(p[1] * SR))]
    relat[cena] = {'dur_original': TR[cena]['dur'], 'dur_tratada': round(len(y) / SR, 3), 'fator': FATOR, 'cortes': CORTES.get(cena, []), 'palavras': palavras}
    print(f"{cena}: {TR[cena]['dur']:.1f} s -> {len(y) / SR:.1f} s", flush=True)
json.dump(relat, open(f'{SAIDA}/tempos.json', 'w'), ensure_ascii=False, indent=1)
print(f'total: {sum(v["dur_tratada"] for v in relat.values()):.1f} s')
