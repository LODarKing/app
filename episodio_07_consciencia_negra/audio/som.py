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
VOZ_ORIG = 'narracao/narracao_original_recuperada_60s.mp3'
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


def trilha_piloto(dur):
    n = int(dur * SR); L = np.zeros(n); R = np.zeros(n); ac = []
    b = lambda k: k * B
    # pad em Ré menor com 9ª; a partir da batida 12 abre para Si bemol (memória); 1971 cai em Sol menor/Ré
    mono = np.zeros(n)
    por(mono, pad([50, 57, 62, 64, 65], b(12) + 1.5, 11), 0.0, 0.16)
    por(mono, pad([46, 53, 58, 62, 65], b(17) - b(11.5) + 1.0, 12), b(11.5), 0.15)
    por(mono, pad([43, 50, 55, 58, 62], dur - b(16.5), 13), b(16.5), 0.17)
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
    mono = reverb(mono, 900, 2.4, 0.28)
    # estéreo discreto: pad ligeiramente alargado por atraso curto
    d = int(0.011 * SR)
    L = mono.copy(); R = np.concatenate([np.zeros(d), mono[:-d]]) * 0.96 + mono * 0.04
    # cauda: desce nos últimos 0,35 s (sem corte brusco)
    f = int(0.35 * SR); w = np.linspace(1, 0, f) ** 2; L[-f:] *= w; R[-f:] *= w
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
        if tp <= -1.05: break
        # limitador suave: ganho que só atua nos picos, com soltura de 60 ms
        a = np.abs(out).max(1); lim = 10 ** (-1.2 / 20)
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
