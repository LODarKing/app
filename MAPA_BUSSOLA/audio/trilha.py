# Trilha e efeitos do piloto, sintetizados em código (numpy). Nenhuma amostra de terceiros: licença própria do projeto.
#   python3 audio/trilha.py           -> audio/musica.wav, audio/beats.json (medido), audio/beats.js, audio/sfx.wav, audio/mix.wav (-14 LUFS)
# Ordem: 1) sintetiza a música; 2) MEDE a grade de batidas na própria música (fluxo espectral + autocorrelação);
#        3) posiciona os efeitos nas batidas medidas; 4) mixa e normaliza (loudnorm em duas passadas, pico real <= -1 dBTP).
import json, os, subprocess, sys, wave
import numpy as np

AQUI = os.path.dirname(os.path.abspath(__file__))
SR, DUR, BPM = 48000, 10.6, 96.0
BEAT = 60.0 / BPM
N = int(SR * DUR)
rng = np.random.default_rng(20210421)  # ruído com semente
t_all = np.arange(N) / SR


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, sig, t0, gain=1.0):
    i0 = int(round(t0 * SR))
    if i0 >= len(buf):
        return
    j0 = max(0, -i0)
    sig = sig[j0:]
    i0 = max(0, i0)
    n = min(len(sig), len(buf) - i0)
    buf[i0:i0 + n] += gain * sig[:n]


def onepole_lp(x, fc):
    # passa-baixa de 1 polo via FFT (resposta exata do filtro, sem laço em Python)
    a = np.exp(-2 * np.pi * fc / SR)
    n = len(x)
    nf = 1 << int(np.ceil(np.log2(2 * n)))
    w = np.fft.rfftfreq(nf) * 2 * np.pi
    Hf = (1 - a) / (1 - a * np.exp(-1j * w))
    return np.fft.irfft(np.fft.rfft(x, nf) * Hf, nf)[:n]


def hp(x, fc):
    return x - onepole_lp(x, fc)


def reverb(x, secs=2.2, mix=0.25, seed=7):
    r = np.random.default_rng(seed)
    n = int(secs * SR)
    tt = np.arange(n) / SR
    ir = r.standard_normal(n) * np.exp(-tt * 6.9 / secs)
    ir = onepole_lp(ir, 5200)
    ir[: int(0.012 * SR)] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    nf = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, nf) * np.fft.rfft(ir, nf), nf)[: len(x)]
    return (1 - mix) * x + mix * wet * 0.6


# ---------- instrumentos ----------
def pad_note(f, dur, att=0.6, rel=0.9, bright=1.0):
    n = int((dur + rel) * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.11, 0.0, 0.13):
        ff = f * 2 ** (det / 12)
        for h in range(1, 9):
            s += np.sin(2 * np.pi * ff * h * tt + h * 1.3 + det * 40) / h ** (1.9 - 0.4 * bright)
    env = np.minimum(1, tt / att) * np.where(tt < dur, 1.0, np.exp(-(tt - dur) * 5 / rel))
    vib = 1 + 0.08 * np.sin(2 * np.pi * 0.23 * tt)
    return s * env * vib / 6


def pluck(f, dur=0.9, bright=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for h in range(1, 12):
        s += np.sin(2 * np.pi * f * h * tt + h) * np.exp(-tt * (2.6 + 3.2 * h / bright)) / h ** 1.15
    s *= np.minimum(1, tt / 0.003)
    return s / 2


def taiko(f0=82, dur=1.2, gain=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = f0 * (0.55 + 0.45 * np.exp(-tt * 14))
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-tt * 4.2)
    skin = onepole_lp(rng.standard_normal(n), 1400) * np.exp(-tt * 28) * 0.9
    return (body + skin) * gain


def shaker(dur=0.09):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    return hp(rng.standard_normal(n), 5000) * np.exp(-tt * 55) * np.minimum(1, tt / 0.006)


def sweep_noise(dur, f0, f1, curve=1.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = rng.standard_normal(n)
    # banco de passa-baixas em blocos com corte variando (aproximação de varredura)
    out = np.zeros(n)
    blk = 2048
    for i in range(0, n, blk):
        k = (i / n) ** curve
        fc = f0 * (f1 / f0) ** k
        seg = x[max(0, i - blk): i + blk]
        y = onepole_lp(onepole_lp(seg, fc), fc)
        out[i: i + blk] = y[(i - max(0, i - blk)):(i - max(0, i - blk)) + min(blk, n - i)]
    return out


def tone(f, dur, kind='sine', dec=18):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    if kind == 'sq':
        s = np.zeros(n)
        for h in (1, 3, 5, 7):
            s += np.sin(2 * np.pi * f * h * tt) / h
    else:
        s = np.sin(2 * np.pi * f * tt)
    return s * np.exp(-tt * dec) * np.minimum(1, tt / 0.004)


# ---------- 1) música ----------
def b(i):
    return i * BEAT


mus_pad, mus_pl, mus_dr, mus_bass = np.zeros(N), np.zeros(N), np.zeros(N), np.zeros(N)
# acordes de 4 batidas: Ré m | Si♭ | Sol m -> Lá | Fá (resposta)
acordes = [(0, 4, [50, 53, 57, 62]), (4, 4, [46, 50, 53, 57]), (8, 2, [43, 50, 55, 58]), (10, 2, [45, 52, 57, 61]), (12, 5, [41, 48, 53, 57, 60, 67])]
for (b0, nb, notas) in acordes:
    for m in notas:
        place(mus_pad, pad_note(midi(m), nb * BEAT, att=0.35 if b0 else 0.02, rel=0.6, bright=1.3 if b0 >= 12 else 1.0), b(b0))
    place(mus_bass, pad_note(midi(notas[0] - 12), nb * BEAT, att=0.05, rel=0.4, bright=0.5), b(b0), 1.6)
# ostinato em colcheias (arpejo); some na batida 7 ("sem sinal") e volta na 8
arp = {0: [62, 69, 74, 77, 74, 69, 65, 69], 4: [58, 65, 70, 74, 70, 65, 62, 65], 8: [55, 62, 67, 70], 10: [57, 64, 69, 73], 12: [65, 72, 77, 81, 79, 77, 72, 77, 84, 81]}
for b0, seq in arp.items():
    for k, m in enumerate(seq):
        tb = b0 + k * 0.5
        if 7 <= tb < 8:
            continue
        place(mus_pl, pluck(midi(m), 0.9, bright=1.4 if b0 >= 12 else 1.0), b(tb), 0.55 if k % 2 else 0.75)
# percussão: taiko nas frases (0, 4, 8, 12), condução nas batidas da subida (8–11), shaker
for bi, g in [(0, 1.0), (4, 0.6), (8, 0.8), (12, 1.0)]:
    place(mus_dr, taiko(78, 1.4, g), b(bi))
for bi in [9, 10, 11, 11.5, 13, 14, 15]:
    place(mus_dr, taiko(110, 0.5, 0.45), b(bi))
for k in range(8 * 4, 17 * 4):
    tb = k / 4
    if 7 <= tb < 8:
        continue
    place(mus_dr, shaker(), b(tb), 0.10 if k % 2 else 0.17)
# subida de ruído para a passagem floresta -> mapa (termina na batida 12)
sw = sweep_noise(1.25, 300, 7000, 1.6) * np.linspace(0, 1, int(1.25 * SR)) ** 2
place(mus_dr, sw, b(12) - 1.25, 0.35)

musica = reverb(0.42 * mus_pad, 2.6, 0.35) + reverb(0.5 * mus_pl, 1.8, 0.28, 3) + 0.55 * mus_bass + reverb(mus_dr, 1.4, 0.18, 5)
# respiro de 1 batida no "sem sinal": a música recua (mantém a cauda da reverberação)
gate = np.ones(N)
i7, i8 = int(b(7) * SR), int(b(8) * SR)
gate[i7:i8] = np.linspace(1, 0.35, i8 - i7) ** 2
musica *= gate
musica[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR)) ** 2

# ---------- 2) medir a grade de batidas na música ----------
def medir_batidas(x):
    hop, win = 256, 1024
    frames = 1 + (len(x) - win) // hop
    idx = np.arange(win)[None, :] + hop * np.arange(frames)[:, None]
    S = np.abs(np.fft.rfft(x[idx] * np.hanning(win), axis=1))
    S = np.log1p(S * 10)
    flux = np.maximum(0, np.diff(S, axis=0)).sum(axis=1)
    flux = flux - np.convolve(flux, np.ones(16) / 16, mode='same')
    flux = np.maximum(flux, 0)
    fps = SR / hop
    ac = np.correlate(flux, flux, mode='full')[len(flux) - 1:]
    lo, hi = int(0.4 * fps), int(1.0 * fps)
    lag = lo + int(np.argmax(ac[lo:hi]))
    # refina o período com interpolação parabólica
    y0, y1, y2 = ac[lag - 1], ac[lag], ac[lag + 1]
    per = (lag + 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2)) / fps
    # fase: maximiza a energia de ataque nos pontos da grade
    best, fase = -1, 0
    for ph in np.arange(0, per, 1 / fps):
        pts = (np.arange(ph, len(x) / SR - 0.05, per) * fps).astype(int) - 1
        pts = pts[(pts >= 0) & (pts < len(flux))]
        v = flux[pts].sum() + flux[np.minimum(pts + 1, len(flux) - 1)].sum()
        if v > best:
            best, fase = v, ph
    # o índice i do fluxo corresponde ao instante (i+1)*hop + win/2 (centro da janela que viu o ataque)
    beats = np.arange(fase, len(x) / SR - 0.3, per) + (win / 2) / SR
    while beats[0] - per > -0.03:  # a grade continua para trás até o início
        beats = np.concatenate([[beats[0] - per], beats])
    return 60 / per, beats


bpm_med, beats = medir_batidas(musica)
beats = beats[beats >= -0.02]
desvio = np.abs(beats[: 17] - np.arange(len(beats[:17])) * BEAT).max()
print(f'grade medida: {bpm_med:.2f} BPM, 1ª batida {beats[0]*1000:.1f} ms, desvio máx. da grade nominal {desvio*1000:.1f} ms')
beats = np.clip(beats, 0, None)
bl = [round(float(x), 4) for x in beats]
json.dump({'bpm_medido': round(bpm_med, 2), 'beats': bl, 'fonte': 'medido na trilha sintetizada (fluxo espectral + autocorrelação)'}, open(os.path.join(AQUI, 'beats.json'), 'w'), indent=1)
open(os.path.join(AQUI, 'beats.js'), 'w').write('const BEATS = ' + json.dumps(bl) + ';\n')
B = lambda i: bl[i]

# ---------- 3) efeitos nas batidas medidas ----------
sfx = np.zeros(N)
# t=0: mergulho da câmera (sopro descendente)
wh = sweep_noise(1.0, 6000, 350, 0.7) * np.exp(-np.linspace(0, 3.5, int(1.0 * SR))) * np.minimum(1, np.arange(int(1.0 * SR)) / (0.01 * SR))
place(sfx, wh, 0.0, 0.9)
# batida 1: o marcador "você" assenta (baque grave + clique)
place(sfx, taiko(120, 0.5, 0.9), B(1)); place(sfx, tone(1800, 0.05, dec=90), B(1), 0.25)
# batida 2: chamada "VOCÊ ESTÁ AQUI" (tique de interface)
place(sfx, tone(1400, 0.06, 'sq', 70), B(2), 0.12)
# batida 4: celular entra (deslize curto)
place(sfx, sweep_noise(0.35, 900, 4000, 1.0) * np.hanning(int(0.35 * SR)), B(4) - 0.2, 0.45)
# batidas 5, 6: perde rede / GPS (bipes descendentes); 7: erro duplo
place(sfx, tone(1318, 0.12, 'sq', 22), B(5), 0.16)
place(sfx, tone(988, 0.12, 'sq', 22), B(6), 0.16)
place(sfx, tone(440, 0.16, 'sq', 16), B(7), 0.2); place(sfx, tone(330, 0.22, 'sq', 12), B(7) + 0.17, 0.2)
# batida 8: celular sai
place(sfx, sweep_noise(0.4, 4000, 700, 1.0) * np.hanning(int(0.4 * SR)), B(8) - 0.1, 0.4)
# batidas 8, 9, 10: o traço amarelo corre; 9, 10, 11: "?" acerta
for bi in (8, 9, 10):
    sc = hp(rng.standard_normal(int(0.55 * SR)), 2500) * (0.5 + 0.5 * np.sin(np.linspace(0, 40, int(0.55 * SR))) ** 2) * np.hanning(int(0.55 * SR))
    place(sfx, sc, B(bi), 0.07)
    place(sfx, tone(660 * (1.25 ** (bi - 8)), 0.18, 'sine', 14), B(bi + 1), 0.18)
# batida 12: floresta vira mapa (papel abrindo)
pap = hp(rng.standard_normal(int(0.9 * SR)), 1200) * np.exp(-np.linspace(0, 5, int(0.9 * SR)))
crk = np.zeros(int(0.9 * SR))
for k in range(22):
    i = int(rng.uniform(0, 0.75) * SR); crk[i:i + 240] += rng.standard_normal(240) * np.exp(-np.arange(240) / 50)
place(sfx, onepole_lp(pap * 0.6 + crk, 6000), B(12), 0.5)
# batidas 13, 15: marca-texto (MAPA, BÚSSOLA)
for bi, dt in ((14, 0.02), (15, 0.1)):
    mk = hp(rng.standard_normal(int(0.3 * SR)), 1800) * np.sin(np.linspace(0, np.pi, int(0.3 * SR))) ** 2
    place(sfx, onepole_lp(mk, 7000), B(bi) + dt - 0.12, 0.22)
# batida 14: bússola desliza e a agulha oscila (tiques nos cruzamentos do Norte, decaindo)
place(sfx, sweep_noise(0.5, 500, 2500, 1.0) * np.hanning(int(0.5 * SR)), B(14) - 0.3, 0.35)
place(sfx, tone(2400, 0.03, 'sine', 120) + tone(3100, 0.03, 'sine', 140), B(14), 0.25)
for k in range(5):
    tz = (np.pi / 2 + k * np.pi) / 9
    place(sfx, tone(3600, 0.02, 'sine', 160), B(14) + tz, 0.12 * np.exp(-3 * tz))

sfx = reverb(sfx, 0.9, 0.15, 11)

# ---------- 4) mixagem e loudness ----------
def write_wav(path, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], 1) if x.ndim == 1 else x
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())


def estereo(x, larg=0.0, seed=1):
    # alarga levemente com um atraso curto (Haas) no lado direito
    d = int(0.011 * SR)
    r = np.concatenate([np.zeros(d), x[:-d]])
    return np.stack([x, (1 - larg) * x + larg * r], 1)


mus_st = estereo(musica, 0.35)
sfx_st = estereo(sfx, 0.0)
peak = np.abs(mus_st).max()
mus_st /= peak
mix = 0.62 * mus_st + 0.55 * sfx_st / np.abs(sfx_st).max()
write_wav(os.path.join(AQUI, 'musica.wav'), mus_st * 0.9)
write_wav(os.path.join(AQUI, 'sfx.wav'), sfx_st / np.abs(sfx_st).max() * 0.9)
raw = os.path.join(AQUI, '_mix_bruto.wav')
write_wav(raw, mix / np.abs(mix).max() * 0.9)

# loudnorm em duas passadas: -14 LUFS integrado, pico real -2,2 dBTP (margem para o AAC)
out = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-2.2:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(out[out.rindex('{'):out.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-2.2:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true:print_format=json")
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), '-c:a', 'pcm_s16le', os.path.join(AQUI, 'mix.wav')], check=True)
os.remove(raw)
print('mix.wav pronto')
