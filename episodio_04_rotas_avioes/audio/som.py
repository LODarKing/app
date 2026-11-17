"""Trilha e efeitos do episódio 04, 100% sintetizados (numpy), sem amostras de terceiros.

1. trilha(): eletrônica minimalista a 96 BPM (pad Dm9 → B♭maj7 → Fmaj7 → C6, pulso de pluck, sub, tique de chimbal),
   cresce na transformação do mapa e fecha com acorde final.
2. medir_batidas(): mede a grade de batidas da própria trilha (librosa) e grava remotion/src/data/beats.json.
3. efeitos(): cada efeito cai num evento de eventos.json (em batidas) convertido pela grade medida.
4. mixar(): voz à frente, trilha com ducking pela voz, efeitos baixos; -14 LUFS integrados, pico real ≤ -1 dBTP.

Uso: python3 audio/som.py piloto    (14,0 s)      |   python3 audio/som.py episodio
"""
import json, os, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, lfilter

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(ROOT, '..', 'remotion', 'src', 'data')
SR = 48000
BPM = 96.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(20261117)          # ruído com semente fixa (determinístico)

def T(d): return np.arange(int(d * SR)) / SR
def env_adsr(n, a, d, s, r, sr=SR):
    a_n, d_n, r_n = int(a * sr), int(d * sr), int(r * sr)
    s_n = max(0, n - a_n - d_n - r_n)
    e = np.concatenate([np.linspace(0, 1, a_n, endpoint=False), np.linspace(1, s, d_n, endpoint=False), np.full(s_n, s), np.linspace(s, 0, r_n)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]
def lp(x, f, o=2): return sosfilt(butter(o, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, o=2): return sosfilt(butter(o, [f1, f2], 'band', fs=SR, output='sos'), x)
def mtof(m): return 440.0 * 2 ** ((m - 69) / 12)
def add(buf, x, t0, g=1.0):
    i = int(round(t0 * SR));
    if i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += g * x
def pan(x, p):  # p -1..1 -> estéreo (lei de potência constante)
    a = (p + 1) * np.pi / 4; return np.stack([x * np.cos(a), x * np.sin(a)], 1)
def pink(n):
    w = rng.standard_normal(n)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]; a = [1, -2.494956002, 2.017265875, -0.522189400]
    y = lfilter(b, a, w); return y / (np.abs(y).max() + 1e-9)
def saw(f, t, ph=0.0):
    x = (f * t + ph) % 1.0; return 2 * x - 1

# ---------------------------------------------------------------- trilha
ACORDES = [  # (fundamental MIDI, notas do pad)
    (38, [50, 53, 57, 60, 64]),   # Dm9
    (34, [46, 50, 53, 57, 64]),   # B♭maj7(#11 sugerido pelo Mi)
    (41, [48, 53, 57, 60, 64]),   # Fmaj7/C
    (36, [48, 52, 55, 57, 62]),   # C6/9
]
ARP = [0, 2, 3, 4, 3, 2, 1, 2]  # índices nas notas do pad, colcheias

def intensidade(t, plano):
    """curva de energia 0..1 por tempo, interpolada entre pontos de controle"""
    xs, ys = zip(*plano); return np.interp(t, xs, ys)

def trilha(dur, plano, fim_acorde=None):
    n = int(dur * SR); L = np.zeros(n); R = np.zeros(n)
    tt = T(dur)
    E = intensidade(tt, plano)
    # pad: 3 osciladores serrilhados desafinados por nota, filtro que abre com a energia
    pad = np.zeros(n)
    nb = int(np.ceil(dur / (2 * BAR)))
    for k in range(nb):
        root, notas = ACORDES[k % 4]
        t0 = k * 2 * BAR; d = 2 * BAR + 0.6
        tl = T(d)
        x = np.zeros(len(tl))
        for m in notas:
            f = mtof(m)
            for det, ph in ((-0.07, 0.1), (0.0, 0.37), (0.08, 0.71)):
                x += saw(f * 2 ** (det / 12), tl, ph) / len(notas) / 3
        x *= env_adsr(len(tl), 0.9, 0.5, 0.85, 0.9)
        i = int(t0 * SR); j = min(n, i + len(x)); pad[i:j] += x[: j - i]
    # filtro variável por blocos (determinístico)
    out = np.zeros(n); blk = 2400
    for i in range(0, n, blk):
        fc = 500 + 2600 * E[i] ** 1.5
        seg = pad[max(0, i - 4800): i + blk]
        y = lp(seg, fc, 2)[-min(blk, n - i):]
        out[i:i + len(y)] = y
    padL, padR = out * 0.9, np.roll(out, int(0.011 * SR)) * 0.9
    L += padL * 0.32; R += padR * 0.32
    # pluck em colcheias (pulso discreto)
    for k in range(int(dur / (BEAT / 2))):
        t0 = k * BEAT / 2
        root, notas = ACORDES[int(t0 // (2 * BAR)) % 4]
        m = notas[ARP[k % 8]] + 12
        e = intensidade(t0, plano)
        if e < 0.12: continue
        d = 0.42; tl = T(d)
        f = mtof(m)
        x = (np.sin(2 * np.pi * f * tl) + 0.35 * np.sin(2 * np.pi * 2 * f * tl) + 0.25 * saw(f, tl)) * np.exp(-tl * 9)
        x = lp(x, 1800 + 2500 * e)
        acc = 1.0 if k % 2 == 0 else 0.5
        p = 0.35 if k % 2 else -0.35
        st = pan(x * 0.16 * acc * min(1, e * 1.4), p)
        i = int(t0 * SR); j = min(n, i + len(x)); L[i:j] += st[: j - i, 0]; R[i:j] += st[: j - i, 1]
    # sub baixo: semínimas
    for k in range(int(dur / BEAT)):
        t0 = k * BEAT; e = intensidade(t0, plano)
        if e < 0.3: continue
        root, _ = ACORDES[int(t0 // (2 * BAR)) % 4]
        d = BEAT * 0.95; tl = T(d); f = mtof(root)
        x = np.sin(2 * np.pi * f * tl) * env_adsr(len(tl), 0.01, 0.2, 0.6, 0.15) * 0.26 * min(1, (e - 0.3) * 2)
        add(L, x, t0); add(R, x, t0)
    # chimbal discreto nos contratempos
    for k in range(int(dur / (BEAT / 2))):
        if k % 2 == 0: continue
        t0 = k * BEAT / 2; e = intensidade(t0, plano)
        if e < 0.5: continue
        x = hp(rng.standard_normal(int(0.05 * SR)), 7000) * np.exp(-T(0.05) * 70) * 0.03 * (e - 0.5) * 2
        add(L, x * 0.8, t0); add(R, x, t0)
    # bumbo suave nos tempos 1 e 3 quando a energia é alta
    for k in range(int(dur / BEAT)):
        t0 = k * BEAT; e = intensidade(t0, plano)
        if e < 0.62 or k % 2: continue
        tl = T(0.35); f = 50 + 70 * np.exp(-tl * 30)
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tl * 9) * 0.42 * min(1, (e - 0.62) * 3)
        add(L, x, t0); add(R, x, t0)
    if fim_acorde is not None:  # acorde final (Dm add9 aberto) que deixa soar
        t0 = fim_acorde; d = dur - t0; tl = T(d)
        x = np.zeros(len(tl))
        for m in [38, 45, 50, 57, 64, 69]:
            f = mtof(m); x += (np.sin(2 * np.pi * f * tl) + 0.3 * saw(f, tl)) / 6
        x = lp(x, 2200) * np.exp(-tl * 1.2) * 0.5
        # o resto da trilha se recolhe antes do acorde
        g = np.ones(n); i0 = int((t0 - 0.05) * SR); g[i0:] = np.exp(-np.arange(n - i0) / SR * 14)
        L *= g; R *= g
        add(L, x, t0); add(R, np.roll(x, 300), t0)
    return np.stack([L, R], 1)

def medir_batidas(mus, dur):
    """Mede a grade na própria trilha: período pelo tempograma (librosa) e fase por ajuste de pente
    sobre a envoltória de ataques (a fase que mais coincide com os ataques medidos)."""
    import librosa
    mono = lp(mus.mean(1), 1500, 4).astype(np.float32)   # pulsação medida na faixa grave/média (bumbo, pluck, baixo)
    hop = 120  # 2,5 ms
    oenv = librosa.onset.onset_strength(y=mono, sr=SR, hop_length=hop)
    tempo = float(librosa.feature.tempo(onset_envelope=oenv, sr=SR, hop_length=hop, start_bpm=BPM)[0])
    per = 60.0 / tempo
    if abs(per - BEAT) / BEAT > 0.02: per = BEAT  # proteção contra erro de oitava
    ts = librosa.frames_to_time(np.arange(len(oenv)), sr=SR, hop_length=hop)
    from scipy.ndimage import maximum_filter1d
    oenv = maximum_filter1d(oenv, size=int(0.06 * SR / hop) | 1)   # tolerância de ±30 ms por batida
    fases = np.arange(0, per, 0.0025); score = []
    for f in fases:
        ks = np.arange(f, dur, per); score.append(np.interp(ks, ts, oenv).sum())
    fase = float(fases[int(np.argmax(score))])
    if fase > per / 2: fase -= per
    grade = [round(fase + i * per, 4) for i in range(int((dur + 120) / per))]
    grade = [g for g in grade if g >= -0.001]
    return dict(bpm_medido=round(60 / per, 3), periodo_s=round(per, 5), fase_s=round(fase, 4), beats=grade,
                fonte='período: librosa.feature.tempo; fase: ajuste de pente (±30 ms) sobre librosa.onset.onset_strength da trilha filtrada < 1,5 kHz')

# ---------------------------------------------------------------- efeitos
def fx_ping(f=1320, g=1.0):
    tl = T(0.9)
    x = (np.sin(2 * np.pi * f * tl) + 0.4 * np.sin(2 * np.pi * f * 2.01 * tl)) * np.exp(-tl * 7)
    x[:240] *= np.linspace(0, 1, 240)
    click = hp(rng.standard_normal(400), 3000) * np.exp(-np.arange(400) / 60) * 0.3
    x[:400] += click
    return x * 0.22 * g
def fx_traco(d, f0=900, f1=2600, g=1.0):
    n = int(d * SR); x = rng.standard_normal(n)
    out = np.zeros(n); blk = 1200
    for i in range(0, n, blk):
        k = i / n; fc = f0 + (f1 - f0) * k
        out[i:i + blk] = bp(x[max(0, i - 2400): i + blk], fc * 0.8, fc * 1.25)[-min(blk, n - i):]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 0.7
    return out * e * 0.05 * g
def fx_aviao(d):
    n = int(d * SR); x = pink(n)
    k = np.linspace(0, 1, n); e = np.exp(-((k - 0.35) / 0.32) ** 2)
    out = np.zeros(n); blk = 1200
    for i in range(0, n, blk):
        fc = 500 + 1500 * e[i]
        out[i:i + blk] = lp(x[max(0, i - 2400): i + blk], fc)[-min(blk, n - i):]
    return out * e * 0.10
def fx_impacto(g=1.0, f0=95):
    tl = T(0.6); f = f0 * (0.6 + 0.4 * np.exp(-tl * 18))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tl * 7)
    t2 = hp(rng.standard_normal(len(tl)), 2500) * np.exp(-tl * 60) * 0.25
    return (x * 0.36 + t2) * g
def fx_dobra():  # glissando curto ascendente (palavra que se curva)
    tl = T(0.5); f = 420 * 2 ** (tl / 0.5 * 0.7)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tl / 0.5) ** 2
    return x * 0.07
def fx_hachura(d=0.9):
    n = int(d * SR); x = hp(rng.standard_normal(n), 2500)
    mod = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 26 * T(d)))
    return lp(x * mod, 6000) * np.sin(np.pi * np.linspace(0, 1, n)) * 0.022
def fx_bolha(f):
    tl = T(0.45); ff = f * (1 + 0.5 * np.exp(-tl * 40))
    x = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-tl * 11)
    return x * 0.15
def fx_whoosh(d, desce=True, g=1.0):
    n = int(d * SR); x = pink(n); out = np.zeros(n); blk = 1200
    for i in range(0, n, blk):
        k = i / n; fc = (2600 - 2200 * k) if desce else (400 + 2600 * k)
        out[i:i + blk] = lp(x[max(0, i - 2400): i + blk], fc)[-min(blk, n - i):]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return out * e * 0.14 * g
def fx_transformacao(d):
    n = int(d * SR); tl = T(d); k = tl / d
    f = 55 * (1 + 0.5 * k)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.5 + np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR) * 0.25
    nz = pink(n); out = np.zeros(n); blk = 1200
    for i in range(0, n, blk):
        out[i:i + blk] = bp(nz[max(0, i - 2400): i + blk], 200 + 900 * k[i], 600 + 2400 * k[i])[-min(blk, n - i):]
    e = np.clip(k * 1.3, 0, 1) ** 1.6 * np.clip((1 - k) * 8, 0, 1)
    return (x * 0.20 + out * 0.10) * e

def efeitos(dur, ev, B):
    bt = lambda k: float(np.interp(k, np.arange(len(B)), B))
    n = int(dur * SR); L = np.zeros(n); R = np.zeros(n)
    def put(x, t, p=0.0, g=1.0):
        st = pan(x * g, p); i = int(round(t * SR))
        if i < 0: st = st[-i:]; i = 0
        if i >= n: return
        j = min(n, i + len(st)); L[i:j] += st[: j - i, 0]; R[i:j] += st[: j - i, 1]
    put(fx_ping(1175), bt(ev['ny']), 0.45)                      # Nova York (à direita na tela)
    put(fx_ping(1568), bt(ev['tk']), -0.45)                     # Tóquio (à esquerda)
    put(fx_traco(bt(ev['retaFim']) - bt(ev['retaIni']), 1200, 1500), bt(ev['retaIni']), 0.0, 0.8)
    put(fx_traco(bt(ev['curvaFim']) - bt(ev['curvaIni']), 700, 2600), bt(ev['curvaIni']), 0.0)
    put(fx_aviao(bt(ev['aviaoFim']) - bt(ev['aviaoIni'])), bt(ev['aviaoIni']), 0.0)
    put(fx_impacto(0.8), bt(ev['titulo1']))
    put(fx_impacto(1.0, 80), bt(ev['titulo2']))
    put(fx_dobra(), bt(ev['tituloCurva']))
    put(fx_hachura(), bt(ev['desvio']), -0.1)
    put(fx_impacto(0.45, 140), bt(ev['desvioTxt']))
    if 'destaque' in ev: put(fx_traco(0.6, 1800, 3200, 0.9), bt(ev['destaque']), -0.1)   # a curva ciano engrossa
    if 'curtoTxt' in ev: put(fx_ping(1760, 0.6), bt(ev['curtoTxt']), 0.0)               # rótulo "o caminho mais curto?"
    for i, k in enumerate(ev['tissot']):                         # círculos maiores, notas mais graves
        put(fx_bolha([1047, 880, 740, 587, 440][i]), bt(k), 0.0)
    put(fx_whoosh(1.6, True), bt(ev['recua']) - 0.1)
    put(fx_transformacao(bt(ev['sFim']) - bt(ev['uIni'])), bt(ev['uIni']))
    return np.stack([L, R], 1)

# ---------------------------------------------------------------- mixagem
def duck(voz, dur, prof_db=-5.0, at=0.08, rl=0.35):
    v = np.abs(voz) if voz.ndim == 1 else np.abs(voz).max(1)
    win = int(0.03 * SR); envv = np.convolve(v, np.ones(win) / win, 'same')
    ativo = (envv > 10 ** (-40 / 20)).astype(float)
    # suaviza (ataque/relaxamento)
    g = np.zeros_like(ativo); a_c = np.exp(-1 / (at * SR)); r_c = np.exp(-1 / (rl * SR)); s = 0.0
    for i in range(0, len(ativo), 48):
        tgt = ativo[i]; c = a_c ** 48 if tgt > s else r_c ** 48
        s = tgt + (s - tgt) * c; g[i:i + 48] = s
    return 10 ** (prof_db * g / 20)

def limitar(x, teto_db=-1.2, look=0.004, rel=0.12):
    """limitador de picos com antecipação (sem ganho de compensação), detecção em 4× sobreamostragem"""
    from scipy.signal import resample_poly
    from scipy.ndimage import minimum_filter1d
    up = np.abs(resample_poly(x, 4, 1, axis=0)).max(1)
    pk = up.reshape(-1, 4).max(1)[: len(x)]
    pk = np.pad(pk, (0, len(x) - len(pk)), mode='edge')
    teto = 10 ** (teto_db / 20)
    g = np.minimum(1.0, teto / np.maximum(pk, 1e-9))
    la = int(look * SR)
    g = minimum_filter1d(g, size=2 * la + 1, origin=0)
    # relaxamento exponencial (subida lenta), descida imediata
    out = np.empty_like(g); s_ = 1.0; c = np.exp(-1 / (rel * SR))
    for i in range(len(g)):
        s_ = g[i] if g[i] < s_ else g[i] + (s_ - g[i]) * c
        out[i] = s_
    sm = np.convolve(out, np.ones(la) / la, 'same')
    return x * np.minimum(out, sm)[:, None]

def true_peak_db(x):
    from scipy.signal import resample_poly
    up = resample_poly(x, 4, 1, axis=0); return 20 * np.log10(np.abs(up).max() + 1e-12)

def mixar(modo):
    ev = json.load(open(os.path.join(DATA, 'eventos.json')))
    voz, sr = sf.read(os.path.join(ROOT, 'narracao_ia.wav')); assert sr == SR
    if modo == 'piloto':
        dur = 17.2
        plano = [(0, 0.25), (1.8, 0.35), (4.5, 0.45), (7.2, 0.5), (10.3, 0.56), (12.2, 0.62), (14.1, 0.72), (16.2, 0.95), (17.2, 0.9)]
        fim = None  # definido pela grade medida (batida 21)
        corte = 16.6  # fim de "A Terra é quase esférica." (16,24 s) + respiro; a frase seguinte (17,4 s) fica para o episódio
        voz = voz[: int(corte * SR)].copy(); nf_ = int(0.06 * SR); voz[-nf_:] *= np.linspace(1, 0, nf_)
    else:
        raise SystemExit('episódio completo: só depois da aprovação do piloto')
    med = medir_batidas(trilha(dur, plano, None), dur)
    fim = med['beats'][27] if modo == 'piloto' else fim
    mus = trilha(dur, plano, fim_acorde=fim)
    json.dump(med, open(os.path.join(DATA, 'beats.json'), 'w'), ensure_ascii=False, indent=0)
    B = med['beats']
    fx = efeitos(dur, ev, B)
    vz = np.pad(voz, (0, int(dur * SR) - len(voz)))
    vst = np.stack([vz, vz], 1)
    d = duck(vz, dur)[:, None]
    mix = vst * 1.0 + mus * d * 0.72 + fx * 1.1
    # fade de saída de 0,35 s no fim do piloto
    nf = int(0.35 * SR); mix[-nf:] *= np.linspace(1, 0, nf)[:, None]
    m = pyln.Meter(SR); lu = m.integrated_loudness(mix)
    mix *= 10 ** ((-14 - lu) / 20)
    for _ in range(3):
        mix = limitar(mix, -1.3)
        lu = m.integrated_loudness(mix); mix *= 10 ** ((-14 - lu) / 20)
    tp = true_peak_db(mix)
    if tp > -1.0: mix *= 10 ** ((-1.05 - tp) / 20); tp = true_peak_db(mix)
    lu2 = m.integrated_loudness(mix)
    os.makedirs(os.path.join(ROOT, 'mix'), exist_ok=True)
    sf.write(os.path.join(ROOT, 'mix', f'{modo}_mix.wav'), mix, SR, subtype='PCM_24')
    sf.write(os.path.join(ROOT, 'mix', f'{modo}_trilha.wav'), mus, SR, subtype='PCM_24')
    sf.write(os.path.join(ROOT, 'mix', f'{modo}_efeitos.wav'), fx, SR, subtype='PCM_24')
    rel = dict(modo=modo, lufs_integrado=round(float(lu2), 2), true_peak_dbtp=round(float(tp), 2), bpm_medido=med['bpm_medido'],
               fase=med['fase_s'], amostras_clip=int((np.abs(mix) >= 1.0).sum()))
    json.dump(rel, open(os.path.join(ROOT, 'mix', f'{modo}_niveis.json'), 'w'), indent=1)
    print(rel)

if __name__ == '__main__':
    mixar(sys.argv[1] if len(sys.argv) > 1 else 'piloto')
