"""Trilha, efeitos e mixagem do episódio 07 (Além do Visível — 20 de novembro).
Tudo sintetizado em código (numpy), ruído só com semente. A voz é o arquivo do ElevenLabs, sem mudança de
timbre nem de andamento: só EQ suave, de-esser e compressão leve (narracao_tratada.wav, tempos idênticos).

uso (a partir de episodio_07_consciencia_negra/):
  python3 audio/som.py piloto      -> audio/trilha_piloto.wav, audio/beats.json, audio/acertos.json, audio/mix_piloto.wav
Grade: 93 BPM (batida = 0,64516 s), fase 0. Escolhida para que "vinte" (3,24 s), "treze" (5,16 s),
"muito antes" (7,68 s) e "1971" (10,48 s) caiam nas batidas 5, 8, 12 e 16.
Depois de sintetizar, as batidas são MEDIDAS na trilha (fluxo espectral) e gravadas em beats.json.
"""
import json, subprocess, sys
import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
BPM = 93.0
B = 60.0 / BPM
import os
# o arquivo íntegro (quando chegar) substitui o recuperado do zip truncado
VOZ_ORIG = 'narracao/narracao_original.mp3' if os.path.exists('narracao/narracao_original.mp3') else 'narracao/narracao_original_recuperada_60s.mp3'
VOZ_TRAT = 'narracao/narracao_tratada.wav'


def mulberry32(seed):
    s = seed & 0xFFFFFFFF
    def nxt():
        nonlocal s
        s = (s + 0x6D2B79F5) & 0xFFFFFFFF
        t = s
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296.0
    return nxt


def ruido(n, seed):
    # ruído branco com semente (mulberry32 alimenta a semente do gerador vetorial)
    r = mulberry32(seed)
    return np.random.default_rng(int(r() * 2**31)).standard_normal(n)


def hz(nota):
    return 440.0 * 2 ** ((nota - 69) / 12)


def env(n, a, d, sus=0.0, rel=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * (sus + (1 - sus) * np.exp(-t / d))
    if rel:
        e *= np.clip((n / SR - t) / rel, 0, 1)
    return e


def lp(x, f, o=2):
    return sosfilt(butter(o, f / (SR / 2), 'low', output='sos'), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f / (SR / 2), 'high', output='sos'), x)


def bp(x, f1, f2, o=2):
    return sosfilt(butter(o, [f1 / (SR / 2), f2 / (SR / 2)], 'band', output='sos'), x)


def piano(nota, dur=3.0, vel=1.0):
    """Piano abafado (felt): parciais levemente inarmônicos, ataque macio, filtro que fecha."""
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(nota); y = np.zeros(n)
    for k, a in enumerate([1, .45, .22, .12, .06, .03], 1):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        y += a * np.sin(2 * np.pi * fk * t) * np.exp(-t * (0.9 + 0.7 * k))
    y *= env(n, 0.006, 1.6, 0.0, 0.3)
    return lp(y, 2400 + 1500 * vel) * vel


def sino(nota, dur=3.5, vel=1.0):
    """Sino suave (síntese FM leve) para as datas."""
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(nota)
    m = 1.2 * np.exp(-t * 3) * np.sin(2 * np.pi * f * 3.5 * t)
    y = np.sin(2 * np.pi * f * t + m) * np.exp(-t * 1.4) * env(n, 0.003, 9, 1, 0.4)
    return y * vel


def pad(notas, dur, seed):
    """Pad quente: dentes-de-serra levemente desafinados, filtrados, com respiração lenta."""
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n); r = mulberry32(seed)
    for nt in notas:
        for d in (-0.07, 0.0, 0.06):
            f = hz(nt) * 2 ** (d / 12); ph = r() * 2 * np.pi
            saw = 2 * ((f * t + ph / (2 * np.pi)) % 1) - 1
            y += saw / len(notas) / 3
    y = lp(y, 900, 2) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t))
    return y * env(n, 1.2, 99, 1, 1.5)


def sub(nota, dur, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * hz(nota) * t) * env(n, 0.02, 1.2, 0, 0.3) * vel


def tique(seed, vel=1.0):
    """Tique de madeira/relógio de calendário: ruído curto em banda + corpo tonal."""
    n = int(0.06 * SR); t = np.arange(n) / SR
    y = bp(ruido(n, seed), 1800, 5200) * np.exp(-t * 160) + 0.4 * np.sin(2 * np.pi * 1350 * t) * np.exp(-t * 90)
    return y * vel


def tecla(seed, vel=1.0):
    """Tecla de máquina de escrever (sintetizada): estalo + batida grave curta."""
    n = int(0.12 * SR); t = np.arange(n) / SR
    y = hp(ruido(n, seed), 2500) * np.exp(-t * 220) + 0.6 * np.sin(2 * np.pi * 210 * t) * np.exp(-t * 60)
    return y * vel


def sopro(dur, f1, f2, seed, sobe=True):
    """Passagem de ar (filtro que abre) — usada no recuo da linha do tempo; termina em zero."""
    n = int(dur * SR); x = ruido(n, seed); t = np.arange(n) / n
    lo = lp(x, f1); hi = lp(x, f2)
    w = t if sobe else 1 - t
    e = np.sin(np.pi * np.clip(t, 0, 1)) ** 1.5
    return (lo * (1 - w) + hi * w) * e


def papel(seed, dur=0.35):
    """Folha de papel assentando: ruído filtrado com dois grãos."""
    n = int(dur * SR); t = np.arange(n) / SR; x = ruido(n, seed)
    y = bp(x, 600, 4000) * (np.exp(-t * 18) + 0.5 * np.exp(-np.maximum(t - 0.07, 0) * 30) * (t > 0.07))
    return y


def por(buf, x, t, g=1.0):
    i = int(round(t * SR)); j = min(len(buf), i + len(x))
    if i < len(buf):
        buf[i:j] += g * x[: j - i]


def reverb(x, seed, tam=2.2, mix=0.25):
    """Reverberação por convolução com cauda de ruído com semente (decaimento exponencial)."""
    n = int(tam * SR); t = np.arange(n) / SR
    ir = ruido(n, seed) * np.exp(-t * 6.9 / tam); ir = lp(ir, 5000); ir /= np.sqrt(np.sum(ir ** 2))
    from scipy.signal import fftconvolve
    w = fftconvolve(x, ir)[: len(x)]
    return (1 - mix) * x + mix * w


def tratar_voz():
    """EQ suave, de-esser e compressão moderada (FFmpeg). Sem alterar velocidade, tom ou tempos."""
    cadeia = ','.join([
        'aresample=48000',
        'highpass=f=70:poles=2',
        'equalizer=f=220:t=q:w=1.0:g=-1.5',   # tira um pouco de "caixa"
        'equalizer=f=3200:t=q:w=1.2:g=1.2',   # presença leve
        'deesser=i=0.35:m=0.5:f=0.55:s=o',
        'acompressor=threshold=-20dB:ratio=2.2:attack=12:release=180:makeup=1.5',
    ])
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', VOZ_ORIG, '-af', cadeia, '-ac', '1', '-c:a', 'pcm_s24le', VOZ_TRAT], check=True)
    v, sr = sf.read(VOZ_TRAT); assert sr == SR
    return v


def trilha_piloto(dur, n_total=None, fim_pad=None, cauda=True, so_mono=False):
    n = int((n_total or dur) * SR); L = np.zeros(n); R = np.zeros(n); ac = []
    b = lambda k: k * B
    # pad em Ré menor com 9ª; a partir da batida 12 abre para Si bemol (memória); 1971 cai em Sol menor/Ré
    mono = np.zeros(n)
    por(mono, pad([50, 57, 62, 64, 65], b(12) + 1.5, 11), 0.0, 0.16)
    por(mono, pad([46, 53, 58, 62, 65], b(17) - b(11.5) + 1.0, 12), b(11.5), 0.15)
    por(mono, pad([43, 50, 55, 58, 62], (fim_pad or dur) - b(16.5), 13), b(16.5), 0.17)
    # tiques do cursor do calendário (semicolcheias da grade) até a batida 5, diminuindo
    for i in range(0, 20):
        t = i * B / 4; v = 0.22 * (1 - i / 22)
        por(mono, tique(100 + i, v), t); ac.append(['tique', round(t, 3)])
    # abertura: piano no tempo 0 (gancho no primeiro segundo)
    por(mono, piano(62, 3, 0.55), 0.0); por(mono, sub(38, 1.6, 0.35), 0.0); ac.append(['piano Ré4 (abertura)', 0.0])
    por(mono, piano(57, 2.5, 0.35), b(2)); por(mono, piano(60, 2.5, 0.3), b(3.5))
    # "vinte" — batida 5: sino dourado (Lá) + piano
    por(mono, sino(81, 4, 0.20), b(5)); por(mono, piano(69, 3, 0.55), b(5)); por(mono, sub(45, 1.2, 0.3), b(5)); ac.append(['sino Lá5 — 20 em dourado', round(b(5), 3)])
    # "treze" — batida 8: piano mais grave, sem brilho (registro respeitoso, não diminuído)
    por(mono, piano(65, 3, 0.5), b(8)); por(mono, piano(57, 3, 0.35), b(8)); por(mono, sub(41, 1.2, 0.3), b(8)); ac.append(['piano Fá4 — 13 de maio', round(b(8), 3)])
    # título "POR QUE 20 DE NOVEMBRO?" — teclas nas semicolcheias
    for i, k in enumerate([9, 9.25, 9.75, 10]):
        por(mono, tecla(200 + i, 0.30), b(k)); ac.append(['tecla', round(b(k), 3)])
    por(mono, piano(64, 2.5, 0.35), b(10)); por(mono, piano(69, 2.5, 0.3), b(10.5))
    # "muito antes" — batida 12: grave longo + sopro que abre (o calendário cai)
    por(mono, sub(34, 2.5, 0.45), b(12)); por(mono, piano(58, 3, 0.45), b(12)); por(mono, piano(53, 3, 0.35), b(12)); ac.append(['grave Si♭ — muito antes', round(b(12), 3)])
    por(mono, sopro(b(1.0), 300, 2500, 300), b(11)); ac.append(['sopro (entrada)', round(b(11), 3)])
    # batida 13: a borda vira linha do tempo (pulso curto)
    por(mono, sino(77, 2.0, 0.08), b(13)); ac.append(['sino Fá5 — linha do tempo nasce', round(b(13), 3)])
    # etiquetas dos cartões (LEI ÁUREA / CONSCIÊNCIA NEGRA) e o "2"/"6" que completam 2026: teclas leves
    for i, k in enumerate([10.5, 10.75, 13.5, 13.75]):
        por(mono, tecla(220 + i, 0.2 if k < 13 else 0.28), b(k)); ac.append(['tecla', round(b(k), 3)])
    # 2026 → 2024 (b14 → b14.5): marco do feriado nacional com sino curto; pausa até b15.25
    por(mono, tique(390, 0.14), b(14)); por(mono, sino(76, 2.5, 0.09), b(14.5)); ac.append(['sino Mi5 — 2024 feriado nacional', round(b(14.5), 3)])
    # recuo b15.25 → b17: semicolcheias crescendo + sopro que abre
    for i, k in enumerate([15.25, 15.5, 15.75, 16, 16.25, 16.5, 16.75]):
        por(mono, tique(400 + i, 0.1 + 0.025 * i), b(k))
    ac.append(['tiques do recuo (semicolcheias)', round(b(15.25), 3)])
    por(mono, sopro(b(1.75), 2600, 400, 301, sobe=True), b(15.25)); ac.append(['sopro (recuo no tempo)', round(b(15.25), 3)])
    # 1971 — batida 17: pouso (grave + acorde de piano + papel)
    por(mono, sub(31, 2.5, 0.55), b(17)); por(mono, papel(500, 0.4), b(17), 0.35)
    for nt in (55, 58, 62): por(mono, piano(nt, 3.5, 0.42), b(17))
    ac.append(['pouso em 1971: grave Sol + acorde + papel', round(b(17), 3)])
    # batida 18: ponto de Porto Alegre (nota alta e curta)
    por(mono, sino(86, 1.8, 0.07), b(18)); ac.append(['ponto de Porto Alegre', round(b(18), 3)])
    if so_mono:
        return mono, ac
    mono = reverb(mono, 900, 2.4, 0.28)
    # estéreo discreto: pad ligeiramente alargado por atraso curto
    d = int(0.011 * SR)
    L = mono.copy(); R = np.concatenate([np.zeros(d), mono[:-d]]) * 0.96 + mono * 0.04
    # cauda: desce nos últimos 0,35 s (sem corte brusco)
    if cauda:
        f = int(0.35 * SR); w = np.linspace(1, 0, f) ** 2; L[-f:] *= w; R[-f:] *= w
    return np.stack([L, R], 1), ac


def marcador(seed, dur=0.3):
    """Marca-texto passando no papel: ruído em banda que sobe."""
    n = int(dur * SR); t = np.arange(n) / n
    return bp(ruido(n, seed), 1500, 6000) * np.sin(np.pi * t) * (0.5 + 0.5 * t)


def carimbo(seed):
    """Carimbo/selo: batida grave curta + papel."""
    n = int(0.5 * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * 70 * t * (1 - 0.3 * t)) * np.exp(-t * 18) * 0.9 + 0.5 * papel(seed, 0.5)[:n]
    return y


def grade16(t):
    """encaixa um instante na semicolcheia mais próxima da grade (para tempos estimados do fim)."""
    q = B / 4
    return round(t / q) * q


def trilha_episodio(dur, fala):
    b = lambda k: k * B
    mono, ac = trilha_piloto(356 / 30, n_total=dur, fim_pad=b(35), cauda=False, so_mono=True)
    n = len(mono)
    def P(nt, t, v=0.4, d=3.0): por(mono, piano(nt, d, v), t)
    def S(nt, t, v=0.08, d=3.0): por(mono, sino(nt, d, v), t)
    def A(nome, t): ac.append([nome, round(t, 3)])
    # ---------- CENA 02 · 1971: atmosfera documental (Sol menor), ostinato de piano abafado em colcheias ----------
    padrao = [55, 62, 58, 62]
    for i, k in enumerate(np.arange(18.5, 34.0, 0.5)):
        P(padrao[i % 4], b(k), 0.11 + 0.03 * (i % 4 == 0), 1.6)
    for k in (20, 24, 28, 32):
        por(mono, sub(31 if k != 28 else 27, 2.4, 0.3), b(k))
    for k in (19.25, 19.5):
        por(mono, tecla(600 + int(k * 4), 0.2), b(k))
    A('teclas — DITADURA MILITAR · 1964–1985', b(19.25))
    S(86, b(23), 0.07); P(74, b(23), 0.35); A('sino + piano — PORTO ALEGRE', b(23))
    por(mono, papel(610, 0.45), b(24), 0.4); por(mono, sopro(b(1), 400, 2200, 611), b(23.25), 0.6); A('papel — entra a ficha de pesquisa', b(24))
    for i, k in enumerate([24.75, 25.25]):
        por(mono, tecla(620 + i, 0.36), b(k)); A('tecla forte — GRUPO / PALMARES', b(k))
    for i, k in enumerate([25.75, 26.5, 27.75, 29, 30.5]):
        por(mono, tecla(630 + i, 0.22), b(k)); A('tecla — linha da ficha', b(k))
    for i in range(6):
        por(mono, tecla(640 + i, 0.14), b(30.75 + i * 0.25))
    A('teclas — integrantes', b(30.75))
    por(mono, marcador(650), b(32.75), 0.25); A('marca-texto — Oliveira Silveira', b(32.75))
    P(67, b(33.5), 0.35); P(74, b(33.5), 0.2); A('piano — POETA', b(33.5))
    # ---------- CENA 03 · contraponto: Mi♭ maj7 → Dó menor ----------
    por(mono, pad([51, 55, 58, 62], b(41.5) - b(34) + 1.2, 21), b(34), 0.14)
    por(mono, pad([48, 55, 60, 63, 62], b(48) - b(41.25) + 1.2, 22), b(41.25), 0.14)
    S(72, b(34.5), 0.07); A('sino Dó5 — divisória', b(34.5))
    por(mono, papel(660, 0.45), b(35), 0.35); A('papel — documento', b(35))
    por(mono, carimbo(661), b(39.5), 0.55); P(51, b(39.5), 0.3); A('carimbo — LEI ÁUREA', b(39.5))
    P(63, b(40.75), 0.28); P(67, b(40.75), 0.22)
    por(mono, sopro(b(1.5), 300, 2200, 662), b(41.5), 0.7); P(48, b(41.5), 0.35); P(60, b(41.5), 0.3); A('sopro + acorde — documento vira relevo', b(41.5))
    for nt in (56, 60, 63): P(nt, b(43), 0.34, 3.5)
    S(79, b(43), 0.07); A('acorde Lá♭ + sino — LIBERDADE TAMBÉM É RESISTÊNCIA', b(43))
    for i, k in enumerate(np.arange(42.0, 49.75, 0.5)):
        por(mono, tique(680 + i, 0.09 * (1 - i / 18)), b(k))
    A('tiques — contador recua 1971 → 1695', b(42))
    por(mono, sopro(b(1.0), 2000, 300, 663, sobe=False), b(46.5), 0.4)
    # ---------- CENA 04 · 1695: solene, sem dramatizar (Ré menor → Si♭ → Fá) ----------
    por(mono, pad([38, 45, 50, 53, 57], b(54) - b(47.5) + 1.2, 31), b(47.5), 0.17)
    por(mono, pad([34, 46, 50, 53, 58], b(57) - b(53.75) + 1.2, 32), b(53.75), 0.16)
    por(mono, pad([41, 48, 53, 57, 60], b(61) - b(56.75) + 1.2, 33), b(56.75), 0.15)
    P(50, b(48), 0.3); P(57, b(48), 0.25); A('piano — "vinte de novembro de"', b(48))
    por(mono, sub(26, 3.0, 0.6), b(49.75)); por(mono, papel(670, 0.4), b(49.75), 0.3)
    for nt in (50, 53, 57): P(nt, b(49.75), 0.42, 4)
    S(74, b(49.75), 0.06); A('pouso em 1695: grave Ré + acorde + papel', b(49.75))
    por(mono, sub(22, 3.0, 0.45), b(54))
    for nt in (46, 50, 53, 58): P(nt, b(54), 0.3, 4)
    A('acorde Si♭ — ZUMBI DOS PALMARES', b(54))
    for nt, k in ((77, 57.5), (81, 58), (84, 58.5)): S(nt, b(k), 0.05)
    P(65, b(58.5), 0.32); P(72, b(58.5), 0.24); A('arpejo — fio 1695 → 1971 / 276 ANOS', b(57.5))
    # ---------- CENA 05 · a ideia se espalha: pulso crescente ----------
    acordes = [(60.75, [46, 53, 57, 60, 62]), (64.25, [48, 55, 60, 64, 67]), (68.0, [50, 57, 62, 65]), (71.5, [46, 53, 58, 62])]
    for i, (k, nts) in enumerate(acordes):
        fim = acordes[i + 1][0] if i + 1 < len(acordes) else 74.25
        por(mono, pad(nts, b(fim) - b(k) + 1.0, 40 + i), b(k), 0.13 + 0.01 * i)
    for i, k in enumerate(np.arange(60.75, 74.25, 0.5)):
        por(mono, tique(700 + i, 0.05 + 0.06 * (k - 60.75) / 13.5), b(k))
        if (k * 2) % 2 == 0: por(mono, sub(34 if k < 64.25 else 36 if k < 68 else 38 if k < 71.5 else 34, 0.5, 0.18), b(k))
    A('pulso em colcheias (crescente)', b(60.75))
    r = mulberry32(77); notas = [77, 79, 81, 84, 86]
    for i in range(14):
        k = 60.75 + int(r() * 14) * 0.25; S(notas[int(r() * 5)], b(k), 0.025, 1.2)
    A('notas leves — pontos acendendo', b(60.75))
    S(81, b(64.25), 0.08); for_ = [P(nt, b(64.25), 0.3) for nt in (60, 64, 67)]; A('sino + acorde — 1978 MNU', b(64.25))
    S(84, b(66), 0.08); P(72, b(66), 0.3); A('sino Dó6 — 2011', b(66))
    por(mono, tecla(720, 0.24), b(68.25)); A('tecla — LEI Nº 12.519', b(68.25))
    por(mono, sopro(b(2.75), 300, 3000, 721), b(71.5), 0.55)
    for i, k in enumerate(np.arange(72.0, 74.25, 0.25)):
        por(mono, tique(730 + i, 0.08 + 0.02 * i), b(k))
    A('suspense: sopro + semicolcheias até 2024', b(71.5))
    por(mono, sub(29, 3.5, 0.7), b(74.25)); S(89, b(74.25), 0.09, 4.5); por(mono, papel(740, 0.4), b(74.25), 0.25)
    for nt in (41, 48, 53, 57, 60, 67): P(nt, b(74.25), 0.4, 4.5)
    A('REVELAÇÃO 2024: grave Fá + acorde aberto + sino', b(74.25))
    # ---------- CENA 06 · presente: harmonia aberta (Fá maior), arpejo mais claro ----------
    blocos = [(76.5, [41, 48, 53, 57, 60, 67]), (80.0, [46, 53, 57, 62, 65]), (83.5, [50, 57, 60, 65]), (86.5, [40, 48, 55, 60, 64])]
    for i, (k, nts) in enumerate(blocos):
        fim = blocos[i + 1][0] if i + 1 < len(blocos) else 88.5
        por(mono, pad(nts, b(fim) - b(k) + 1.2, 50 + i), b(k), 0.13)
    arp = [65, 69, 72, 76, 72, 69]
    for i, k in enumerate(np.arange(77.0, 88.25, 0.5)):
        P(arp[i % 6], b(k), 0.12, 1.4)
    por(mono, sopro(b(1), 2500, 600, 750, sobe=False), b(76.25), 0.4); A('virada para o presente (Hoje)', b(76.5))
    for nome, k, nt in (('MEMÓRIA', 79.75, 81), ('CULTURA', 82.5, 84), ('RESISTÊNCIA', 84.75, 86), ('IGUALDADE', 86.25, 89)):
        S(nt, b(k), 0.07); P(nt - 12, b(k), 0.3); A(f'sino — {nome}', b(k))
    # ---------- CENA 07 · encerramento ----------
    por(mono, sopro(b(1.5), 400, 2600, 760), b(88.25), 0.45); A('quadros se juntam', b(88.25))
    por(mono, pad([41, 48, 53, 57, 60, 64], 4.0, 61), b(90.75), 0.14); por(mono, sopro(b(1.25), 300, 3000, 761), b(90.75), 0.5); A('transforma → 20', b(90.75))
    for nt in (53, 57, 60, 65): P(nt, b(92), 0.36, 4)
    S(84, b(92), 0.07); A('20 dourado', b(92))
    tp = grade16(fala['presente']); P(72, tp, 0.3); A('NOVEMBRO (presente)', tp)
    ta = grade16(fala['alem']); te = grade16(fala['extra'])
    por(mono, pad([41, 48, 53, 57, 60, 67, 72], dur - ta, 70), ta, 0.17)
    por(mono, sub(29, 5.0, 0.55), ta)
    for nt in (41, 53, 57, 60, 64, 67): P(nt, ta, 0.38, 6)
    S(89, ta, 0.08, 6); A('marca AV — acorde final', ta)
    S(84, te, 0.06, 5); P(77, te, 0.22, 5); A('O EXTRAORDINÁRIO ESTÁ NOS DETALHES', te)
    mono = reverb(mono, 901, 2.6, 0.3)
    d = int(0.011 * SR)
    L = mono.copy(); R = np.concatenate([np.zeros(d), mono[:-d]]) * 0.96 + mono * 0.04
    f = int(1.6 * SR); w = np.linspace(1, 0, f) ** 2; L[-f:] *= w; R[-f:] *= w
    return np.stack([L, R], 1), ac


def medir_batidas(x, dur):
    """Mede os inícios (fluxo espectral) e ajusta a grade de batidas (período fixo pelo BPM, fase medida)."""
    m = x.mean(1); hop = 480; win = 2048
    fr = np.lib.stride_tricks.sliding_window_view(np.pad(m, (0, win)), win)[::hop] * np.hanning(win)
    S = np.abs(np.fft.rfft(fr, axis=1)); fl = np.maximum(0, np.diff(np.log1p(S * 50), axis=0)).sum(1)
    thr = np.median(fl) + 2.5 * np.std(fl)
    on = [i for i in range(1, len(fl) - 1) if fl[i] > thr and fl[i] >= fl[i - 1] and fl[i] >= fl[i + 1]]
    ons = np.array([((i + 1) * hop + win / 2) / SR for i in on])  # centro da janela
    # fase: mediana do resíduo dos inícios sobre a grade de semicolcheias
    q = B / 4; res = ((ons + q / 2) % q) - q / 2; fase = float(np.median(res))
    na_grade = int(np.sum(np.abs(res - fase) < 0.025))
    bat = [round(max(0.0, fase + k * B), 3) for k in range(int(dur / B) + 1)]
    return {'bpm_medido': round(60 / B, 3), 'fase_s': round(fase, 4), 'residuo_max_ms': round(float(np.max(np.abs(res - fase))) * 1000, 1),
            'onsets': len(ons), 'onsets_na_grade': na_grade, 'batidas': bat}


def mix(voz, mus, dur, nome):
    n = int(dur * SR); v = np.zeros(n); v[: min(n, len(voz))] = voz[:n]
    # a voz termina antes de "durante" (11,94 s): rampa de 20 ms no silêncio para não cortar nada
    # duck: envelope da voz (RMS 50 ms) abaixa a trilha ~6 dB sob a fala, com ataque/soltura suaves
    k = int(0.05 * SR); e = np.sqrt(np.convolve(v ** 2, np.ones(k) / k, 'same')); e = e / (e.max() + 1e-9)
    g = 1 - 0.5 * np.clip(e * 4, 0, 1); g = np.convolve(g, np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')
    M = mus[:n] * g[:, None]
    out = np.stack([v, v], 1) * 1.0 + M * 0.55
    # loudness -14 LUFS integrado, depois limitador de pico verdadeiro (-1 dBTP, sobreamostragem 4×)
    met = pyln.Meter(SR); lu = met.integrated_loudness(out); out *= 10 ** ((-14 - lu) / 20)
    for _ in range(6):
        tp = 20 * np.log10(np.max(np.abs(resample_poly(out, 4, 1, axis=0))) + 1e-12)
        if tp <= -1.5: break
        # limitador suave: ganho que só atua nos picos, com soltura de 60 ms
        a = np.abs(out).max(1); lim = 10 ** (-1.8 / 20)
        from scipy.ndimage import minimum_filter1d, uniform_filter1d
        gr = np.minimum(1, lim / np.maximum(a, 1e-9)); w = int(0.06 * SR)
        gr = uniform_filter1d(minimum_filter1d(gr, w), w)   # mínimo à frente + suavização: sem distorção nos picos
        out *= gr[:, None]
        lu = met.integrated_loudness(out); out *= 10 ** ((-14 - lu) / 20)
    lu = met.integrated_loudness(out); tp = 20 * np.log10(np.max(np.abs(resample_poly(out, 4, 1, axis=0))))
    sf.write(nome, out, SR, subtype='PCM_24')
    return round(lu, 2), round(tp, 2)


if __name__ == '__main__':
    modo = sys.argv[1] if len(sys.argv) > 1 else 'piloto'
    voz = tratar_voz()
    if modo == 'piloto':
        DUR = 356 / 30
        mus, ac = trilha_piloto(DUR)
        sf.write('audio/trilha_piloto.wav', mus, SR, subtype='PCM_24')
        bt = medir_batidas(mus, DUR); json.dump(bt, open('audio/beats.json', 'w'), indent=1)
        json.dump({'grade': 'beats.json', 'acertos': ac}, open('audio/acertos.json', 'w'), ensure_ascii=False, indent=1)
        lu, tp = mix(voz, mus, DUR, 'audio/mix_piloto.wav')
        print('beats:', {k: v for k, v in bt.items() if k != 'batidas'}, '| mix:', lu, 'LUFS', tp, 'dBTP')
    elif modo == 'episodio':
        fala = json.load(open('remotion/src/data/fala.json'))
        DUR = round((fala['fimFala'] + 5.1) * 30) / 30
        if fala.get('corteVoz'):   # arquivo truncado: a voz para no fim da última palavra completa (sem o fragmento cortado)
            c = int(fala['corteVoz'] * SR); r = int(0.012 * SR); voz = voz.copy(); voz[c - r:c] *= np.linspace(1, 0, r); voz[c:] = 0
        mus, ac = trilha_episodio(DUR, fala)
        sf.write('audio/trilha_episodio.wav', mus, SR, subtype='PCM_24')
        bt = medir_batidas(mus, DUR); json.dump(bt, open('audio/beats.json', 'w'), indent=1)
        json.dump({'grade': 'beats.json', 'acertos': ac}, open('audio/acertos.json', 'w'), ensure_ascii=False, indent=1)
        lu, tp = mix(voz, mus, DUR, 'audio/mix_episodio.wav')
        print('dur', DUR, 'beats:', {k: v for k, v in bt.items() if k != 'batidas'}, '| mix:', lu, 'LUFS', tp, 'dBTP', '| acertos', len(ac))
