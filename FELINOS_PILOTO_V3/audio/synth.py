"""Som do piloto v3 (12 s, 120 bpm). Etapas:
1) trilha sintetizada na grade de 120 bpm;  2) batidas MEDIDAS na trilha com librosa -> audio/beats.json;
3) efeitos colocados nos eventos de timeline.js e encaixados na batida/meia batida medida mais próxima;
4) mixagem a -14 LUFS (pico <= -1,3 dBTP). Sem voz: a narração do usuário entra depois (ducking -7,5 dB).
Rodar a partir de FELINOS_PILOTO_V3/."""
import json, sys, numpy as np, soundfile as sf, pyloudnorm as pyln, librosa
from pedalboard import Pedalboard, Reverb, HighpassFilter, Compressor
sys.path.insert(0, 'audio')
import instruments as I
from instruments import SR, tv, env, hz, strings, pluck, celesta, drum, choir, noise, whoosh, meow, roar, heartbeat, boing, pop, step, birds, mx

TL = json.loads(open('timeline.js').read().replace('const TL = ', '').rstrip().rstrip(';'))
DUR = TL['dur']; N = int(DUR * SR); BEAT = 60 / TL['bpm']
music, sfx, amb = I.Bus(), I.Bus(), I.Bus()
for b in (music, sfx, amb): b.x = np.zeros((N, 2))
I.N = N

# ---------------------------------------------------------------- 1) trilha
# suspense (0–2,5): cordas graves em trêmulo + pulso grave em cada batida (o coração)
d = TL['cut1'] + 0.1
music.put(strings(38, d, 650, 0.5, 0.15) * (1 + 0.3 * np.sin(2 * np.pi * 8 * tv(d))) * 0.9, 0.0, 0)
music.put(strings(81, d, 4200, 0.8, 0.1) * 0.10, 0.2, 0.4)
for k in range(int(TL['cut1'] / BEAT)): music.put(drum(48, 0.4, 0.05, 10) * 0.55, k * BEAT, 0)
# brincadeira (2,5–5,5): pizzicato em colcheias + celesta, Ré maior
notes = [62, 66, 69, 74, 69, 66, 69, 71, 73, 71, 69, 66]
for i in range(int((TL['leap'] - TL['cut1']) / (BEAT / 2))):
    tt = TL['cut1'] + i * BEAT / 2
    music.put(pluck(hz(notes[i % 12]), 0.5) * 1.6, tt, -0.3 + 0.6 * (i % 2))
    if i % 2 == 0: music.put(pluck(hz(38 + 5 * ((i // 8) % 2)), 0.8, 1500) * 2.0, tt, 0)
    if i % 8 == 4: music.put(celesta(hz(86 + 2 * ((i // 8) % 2))) * 0.25, tt, 0.35)
music.put(strings(50, TL['leap'] - TL['cut1'], 1200, 0.4, 0.3) * 0.22, TL['cut1'], -0.4)
# subida (5,5–6,0)
d = TL['cover'] - TL['leap'] + 0.05; st_ = strings(50, d, 3000, d * 0.8, 0.02)
music.put(mx(whoosh(d, 150, 6000) * 1.3, st_ * np.linspace(0.1, 0.7, len(st_))), TL['leap'], 0)
# aventura (6,0–8,0): taiko na batida, toms na meia batida, baixo em colcheias, cordas (Rém, Si♭, Dó, Lá)
prog = [(50, [62, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67]), (45, [61, 64, 69])]
for b in range(int((TL['cut4'] - TL['cover']) / BEAT)):
    tb = TL['cover'] + b * BEAT; root, ch = prog[(b // 2) % 4]
    music.put(drum(62 if b % 2 == 0 else 84, 0.6, 0.3, 7) * 0.95, tb, 0.15 * (-1) ** b)
    music.put(drum(110, 0.3, 0.4, 14) * 0.35, tb + BEAT / 2, -0.2)
    for e8 in range(2): music.put(I.filt(I.saw(hz(root - 12), 0.24), 'lowpass', 500) * env(int(0.24 * SR), 0.005, 0.1) * 0.35, tb + e8 * BEAT / 2, 0)
    if b % 2 == 0:
        for j, m in enumerate(ch): music.put(strings(m, 1.0, 2400, 0.06, 0.3) * 0.18, tb, -0.35 + 0.35 * j)
# tensão (8,0–9,0): trêmulo grave, cai em silêncio meia batida antes do rugido
d = TL['roar'] - TL['cut4']; music.put(strings(38, d, 900, 0.1, 0.1) * (1 + 0.4 * np.sin(2 * np.pi * 12 * tv(d))) * 0.9, TL['cut4'], 0)
# título (9,0–12,0): tutti em Ré maior + coro + tímpano; motivo de celesta nas batidas
d = DUR - TL['cut5'] + 0.2
for m in (38, 50, 57, 62, 66, 69, 74): music.put(strings(m, d, 3200, 0.02, 0.8) * (0.3 if m < 50 else 0.2), TL['cut5'], (m % 5 - 2) * 0.15)
for m in (62, 66, 69): music.put(choir(m, d) * 0.45, TL['cut5'] + 0.02, (m - 66) * 0.08)
music.put(drum(45, 1.4, 0.4, 3) * 1.4, TL['cut5'], 0)
for k, m in enumerate([74, 78, 81, 86, 81, 78]): music.put(celesta(hz(m), 1.0) * 0.22, TL['write'] + k * BEAT / 2, 0.2)
music.put(drum(45, 1.0, 0.3, 4) * 1.0, TL['dive'], 0)

def stereo_master(x, wet, room):
    return Pedalboard([HighpassFilter(30), Reverb(room_size=room, wet_level=wet, dry_level=1.0, width=1.0)])(x.T.astype(np.float32), SR).T
m = stereo_master(music.x, 0.26, 0.7)

# ---------------------------------------------------------------- 2) batidas medidas
mono = librosa.resample(m.mean(1).astype(np.float32), orig_sr=SR, target_sr=22050)
HOP = 128   # ~6 ms de resolução
tempo, frames = librosa.beat.beat_track(y=mono, sr=22050, hop_length=HOP, start_bpm=TL['bpm'], tightness=400, units='frames')
beats = librosa.frames_to_time(frames, sr=22050, hop_length=HOP)
# ajuste linear (início + período) sobre todas as batidas detectadas; a grade cobre também a introdução sem ataques claros
idx = np.round((beats - beats[0]) / BEAT).astype(int); per, t0 = np.polyfit(idx, beats, 1)
tempo = 60 / per; first = t0 - np.floor(t0 / per) * per
grid = [round(float(first + i * per), 3) for i in range(int((DUR - first) / per) + 1)]
resid = float(np.abs(np.polyval([per, t0], idx) - beats).max() * 1000)
json.dump({'bpm_medido': round(float(tempo), 2), 'periodo_s': round(float(per), 4), 'residuo_max_ms': round(resid, 1), 'detectadas': [round(float(b), 3) for b in beats], 'beats': grid}, open('audio/beats.json', 'w'), indent=1)
half = sorted(grid + [round((a + b) / 2, 3) for a, b in zip(grid, grid[1:])])
def snap(t): return min(half, key=lambda g: abs(g - t))
print(f'batidas: {tempo:.2f} bpm medidos, período {per:.4f} s, {len(beats)} detectadas (resíduo máx. {resid:.0f} ms); grade com {len(grid)}, primeira em {first:.3f} s')

# ---------------------------------------------------------------- 3) efeitos (encaixados na grade medida)
hits = []
def hit(sig, t, pan=0.0, g=1.0, name=''):
    ts = snap(t); sfx.put(sig, ts, pan, g); hits.append({'evento': name, 'timeline': t, 'grade': ts, 'desvio_ms': round((ts - t) * 1000, 1)})
for h in TL['heart']: hit(heartbeat() * 0.9, h, 0, 1, 'batimento')
hit(meow(), TL['meow'], 0.05, 1.0, 'miado')
hit(whoosh(0.8, 120, 1400), TL['push'], 0, 1.2, 'câmera entra no olho')
hit(mx(whoosh(0.3, 900, 9000, up=False) * 1.2, drum(60, 0.3, 0.5, 12) * 0.4), TL['cut1'], 0, 1, 'corte para a mesa')
hit(pop(700, 1200, 0.1), TL['tilt'], -0.1, 0.8, 'inclina a cabeça')
hit(boing(), TL['boing'], 0.15, 1.0, 'efeito divertido')
hit(meow(0.32, (700, 920, 760), (420, 700, 600), (2300, 1800, 1600), 0.28), TL['crouch'], 0.05, 1, 'miadinho (prepara o salto)')
hit(whoosh(0.6, 100, 900) * 2.0, TL['leap'], 0, 1, 'vento no salto')
hit(mx(drum(55, 0.6, 0.6, 6) * 0.7, whoosh(0.4, 3000, 10000, up=False)), TL['cover'], 0, 1, 'entra na floresta')
for k in range(4): hit(step(), TL['cover'] + 0.25 + k * BEAT / 2, -0.2 + 0.1 * k, 1, 'passo da onça')
hit(whoosh(0.3, 300, 7000) * 2.2, TL['whip'], 0.6, 1, 'chicote de câmera')
for k in range(4): hit(step(), TL['whip'] + 0.25 + k * BEAT / 2, 0.3 - 0.12 * k, 1, 'passo do tigre')
hit(mx(whoosh(0.3, 900, 9000, up=False), drum(70, 0.3, 0.4, 12) * 0.3), TL['cut4'], 0, 1, 'corte para a savana')
hit(roar(), TL['roar'], 0.15, 1.0, 'rugido')
hit(whoosh(0.45, 4000, 12000, up=False) * 1.2, TL['cut5'], 0, 1, 'impacto do título')
for i, tp in enumerate(TL['paws']): hit(mx(drum(80 + 12 * i, 0.3, 0.5, 11) * 0.8, pop(300, 520, 0.08) * 0.6), tp, -0.45 + 0.3 * i, 1, 'pegada')
hit(noise(0.7, 2500, 7000) * np.sin(np.pi * np.linspace(0, 1, int(0.7 * SR))) * 0.05, TL['write'], -0.2, 1, 'pena escrevendo')
for k in range(6): hit(I.filt(noise(0.03, 2000, 6000), 'bandpass', [2500, 5000]) * np.exp(-tv(0.03) * 80) * 0.5, TL['sub'] + k * 0.25 * BEAT * 2 / 2, 0, 1, 'datilografia')
hit(mx(drum(70, 0.3, 0.5, 12) * 0.6, pop(400, 800, 0.1)), TL['en'], 0, 1, 'carimbo da insígnia')
hit(whoosh(0.5, 300, 8000) * 2.0, TL['dive'], 0, 1, 'câmera atravessa a pegada')
amb.put(birds(TL['leap'] - TL['cut1'], 8), TL['cut1'], 0.3, 1.1)
amb.put(birds(1.0, 7) + noise(1.0, 4500, 6500) * 0.02, TL['cover'], -0.25, 1.0)
amb.put(noise(1.0, 300, 1500) * 0.05, TL['whip'], 0.2)
amb.put(noise(1.0, 150, 700) * 0.1 * env(int(1.0 * SR), 0.2, 0.2), TL['cut4'], -0.1)
json.dump(hits, open('audio/acertos.json', 'w'), ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- 4) mixagem
meter = pyln.Meter(SR)
s = stereo_master(sfx.x, 0.12, 0.4); a = stereo_master(amb.x, 0.2, 0.6)
m *= 10 ** ((-23 - meter.integrated_loudness(m)) / 20)
act = np.zeros(N)
for w in TL['words']: act[int((w[1] - 0.1) * SR):int((w[2] + 0.15) * SR)] = 1
k = np.convolve(act, np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same'); m *= (10 ** ((-7.5 if '--com-voz' in sys.argv else -3.0) * k / 20))[:, None]
x = m + s * 10 ** (-3 / 20) + a * 10 ** (-6 / 20)
fo = int(0.08 * SR); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
x = Pedalboard([Compressor(threshold_db=-16, ratio=2.0, attack_ms=15, release_ms=150)])(x.T.astype(np.float32), SR).T
def limiter(x, ceil_db, look=0.003, rel=0.08):
    from scipy.ndimage import minimum_filter1d
    c = 10 ** (ceil_db / 20); g = minimum_filter1d(np.minimum(1, c / np.maximum(np.abs(x).max(1), 1e-9)), 2 * int(look * SR) + 1)
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); v = 1.0
    for i in range(len(g)): v = g[i] if g[i] < v else a * v + (1 - a) * g[i]; out[i] = v
    return x * out[:, None]
for _ in range(4): x = limiter(x * 10 ** ((-14 - meter.integrated_loudness(x)) / 20), -2.6)
sf.write('audio/mix.wav', x.astype(np.float32), SR, subtype='PCM_24')
print('mix', round(meter.integrated_loudness(x), 2), 'LUFS | pico', round(20 * np.log10(np.abs(x).max()), 2), 'dBFS | desvio máx. dos acertos', max(abs(h['desvio_ms']) for h in hits), 'ms')
