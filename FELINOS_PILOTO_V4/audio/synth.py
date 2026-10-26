"""Som do piloto v4 (cena 02, 21,5 s, 120 bpm). Etapas:
1) trilha sintetizada na grade de 120 bpm;  2) batidas MEDIDAS na trilha com librosa -> audio/beats.json;
3) efeitos colocados nos eventos de timeline.js e encaixados na batida/meia batida medida mais próxima;
4) vozes restauradas (Miguel, Lara, narrador) nos tempos da timeline; trilha abaixa 9,5 dB sob as falas;
5) mixagem a -14 LUFS (pico <= -1,3 dBTP depois do AAC). Rodar a partir de FELINOS_PILOTO_V4/."""
import json, sys, numpy as np, soundfile as sf, pyloudnorm as pyln, librosa
from pedalboard import Pedalboard, Reverb, HighpassFilter, Compressor
sys.path.insert(0, 'audio')
import instruments as I
from instruments import SR, tv, env, hz, strings, pluck, celesta, drum, choir, noise, whoosh, meow, roar, pop, step, birds, sparkle, mx

TL = json.loads(open('timeline.js').read().replace('const TL = ', '').rstrip().rstrip(';'))
DUR = TL['dur']; N = int(DUR * SR); BEAT = 60 / TL['bpm']
music, sfx, amb, vox = I.Bus(), I.Bus(), I.Bus(), I.Bus()
for b in (music, sfx, amb, vox): b.x = np.zeros((N, 2))
I.N = N

# ---------------------------------------------------------------- 1) trilha (Ré maior)
# gancho (0–1,75): pedal grave + celesta subindo quando a capa abre
d = TL['cutB'] + 0.2
music.put(strings(38, d, 700, 0.3, 0.2) * 0.8, 0.0, 0); music.put(strings(57, d, 2600, 0.6, 0.2) * 0.12, 0.0, 0.3)
for k in range(int(TL['cutB'] / BEAT)): music.put(drum(50, 0.35, 0.05, 12) * 0.45, k * BEAT, 0)
for k, m in enumerate([74, 78, 81, 86, 90]): music.put(celesta(hz(m), 0.9) * 0.18, TL['coverOpen'] + k * BEAT / 4, -0.3 + 0.15 * k)
# mesa de estudos (1,75–7,5): pizzicato leve em colcheias + pad (fica por baixo das falas)
notes = [62, 66, 69, 74, 69, 66, 69, 71, 73, 71, 69, 66]
for i in range(round(TL['cutB'] / (BEAT / 2)), round(TL['cutC'] / (BEAT / 2))):   # colcheias na grade global: baixo sempre no tempo
    tt = i * BEAT / 2
    music.put(pluck(hz(notes[i % 12]), 0.5) * 1.1, tt, -0.3 + 0.6 * (i % 2))
    if i % 2 == 0: music.put(pluck(hz(38 + 5 * ((i // 8) % 2)), 0.8, 1500) * 1.6, tt, 0)
for j, m in enumerate((50, 57, 62, 66)): music.put(strings(m, TL['cutC'] - TL['cutB'], 1500, 0.6, 0.6) * 0.1, TL['cutB'], -0.3 + 0.2 * j)
# salto e portal (7,5–9,0): cordas sobem com o whoosh
d = TL['portal'] - TL['crouch']; st_ = strings(50, d, 3200, d * 0.8, 0.05)
music.put(st_ * np.linspace(0.05, 0.6, len(st_)), TL['crouch'], 0)
# aventura sob o narrador (9,0–16,0): taiko suave, baixo em colcheias, progressão Rém–Si♭–Dó–Lá
prog = [(50, [62, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67]), (45, [61, 64, 69])]
for b in range(int((TL['cutFam'] - TL['portal']) / BEAT)):
    tb = TL['portal'] + b * BEAT; root, ch = prog[(b // 4) % 4]
    music.put(drum(62 if b % 2 == 0 else 84, 0.5, 0.25, 8) * 0.7, tb, 0.15 * (-1) ** b)
    if b % 2: music.put(drum(110, 0.25, 0.4, 14) * 0.22, tb + BEAT / 2, -0.2)
    for e8 in range(2): music.put(I.filt(I.saw(hz(root - 12), 0.24), 'lowpass', 450) * env(int(0.24 * SR), 0.005, 0.1) * 0.3, tb + e8 * BEAT / 2, 0)
    if b % 4 == 0:
        for j, m in enumerate(ch): music.put(strings(m, 2.1, 2200, 0.2, 0.4) * 0.15, tb, -0.35 + 0.35 * j)
# família (16,0–21,5): tutti em Ré maior + coro; celesta a cada felino que chega; acorde final na escrita do título
d = DUR - TL['cutFam'] + 0.2
for m in (38, 50, 57, 62, 66, 69): music.put(strings(m, d, 2800, 0.8, 1.0) * (0.24 if m < 50 else 0.14), TL['cutFam'], (m % 5 - 2) * 0.15)
for m in (62, 66, 69): music.put(choir(m, DUR - TL['pingoLand']) * 0.3, TL['pingoLand'], (m - 66) * 0.08)
for k, tf in enumerate(TL['fam']): music.put(celesta(hz([81, 86, 90][k]), 1.0) * 0.22, tf, -0.3 + 0.3 * k)
for k, m in enumerate([74, 78, 81, 86, 81, 78, 74]): music.put(celesta(hz(m), 1.0) * 0.18, TL['write'] + k * BEAT / 2, 0.2)
music.put(drum(45, 1.4, 0.4, 3) * 1.1, TL['write'], 0)

def stereo_master(x, wet, room):
    return Pedalboard([HighpassFilter(30), Reverb(room_size=room, wet_level=wet, dry_level=1.0, width=1.0)])(x.T.astype(np.float32), SR).T
m = stereo_master(music.x, 0.26, 0.7)

# ---------------------------------------------------------------- 2) batidas medidas
mono = librosa.resample(m.mean(1).astype(np.float32), orig_sr=SR, target_sr=22050)
perc = librosa.effects.percussive(mono, margin=2.0)        # só os ataques (taiko, pizzicato), sem as cordas longas
HOP = 128
tempo, frames = librosa.beat.beat_track(y=perc, sr=22050, hop_length=HOP, start_bpm=TL['bpm'], tightness=600, units='frames')
beats = librosa.frames_to_time(frames, sr=22050, hop_length=HOP)
# ajuste linear robusto (início + período): descarta batidas detectadas fora da grade (> 40 ms) e reajusta
idx = np.round((beats - beats[0]) / BEAT).astype(int); keep = np.ones(len(beats), bool)
for _ in range(5):
    per, t0 = np.polyfit(idx[keep], beats[keep], 1); r = np.abs(np.polyval([per, t0], idx) - beats); keep = r < max(0.04, np.percentile(r, 70))
per, t0 = np.polyfit(idx[keep], beats[keep], 1)
tempo = 60 / per; first = t0 - np.floor(t0 / per) * per
grid = [round(float(first + i * per), 3) for i in range(int((DUR - first) / per) + 1)]
resid = float(np.abs(np.polyval([per, t0], idx[keep]) - beats[keep]).max() * 1000)
json.dump({'bpm_medido': round(float(tempo), 2), 'periodo_s': round(float(per), 4), 'residuo_max_ms': round(resid, 1), 'detectadas': [round(float(b), 3) for b in beats], 'beats': grid}, open('audio/beats.json', 'w'), indent=1)
half = sorted(grid + [round((a + b) / 2, 3) for a, b in zip(grid, grid[1:])])
def snap(t): return min(half, key=lambda g: abs(g - t))
print(f'batidas: {tempo:.2f} bpm medidos, período {per:.4f} s, {len(beats)} detectadas, {keep.sum()} na grade (resíduo máx. {resid:.0f} ms); grade com {len(grid)}, primeira em {first:.3f} s')

# ---------------------------------------------------------------- 3) efeitos (encaixados na grade medida)
hits = []
def hit(sig, t, pan=0.0, g=1.0, name=''):
    ts = snap(t); sfx.put(sig, ts, pan, g); hits.append({'evento': name, 'timeline': t, 'grade': ts, 'desvio_ms': round((ts - t) * 1000, 1)})
def riffle(d=0.6, n=7):
    out = np.zeros(int(d * SR))
    for k in range(n):
        f = I.filt(noise(0.07, 1500, 9000), 'highpass', 1200) * np.exp(-tv(0.07) * 40) * 0.5; j = int(k * d / n * SR); out[j:j + len(f)] += f[:len(out) - j]
    return out
hit(mx(drum(95, 0.25, 0.3, 18) * 0.7, pop(500, 300, 0.08) * 0.8), TL['paw'], 0.2, 1, 'pata toca a capa')
hit(sparkle(1.0) * 0.8, TL['paw'] + 0.02, 0.1, 1, 'pegada acende (brilho discreto)')
hit(mx(whoosh(0.35, 400, 4000) * 0.9, drum(70, 0.3, 0.2, 10) * 0.3), TL['coverOpen'], -0.2, 1, 'capa abre')
hit(riffle(0.75, 9), TL['riffle'], 0, 1.1, 'páginas correm')
for k, tc in enumerate(TL['cards']): hit(mx(whoosh(0.4, 800, 7000) * 0.6, celesta(hz([86, 90, 93][k]), 0.8) * 0.18), tc, -0.5 + 0.5 * k, 1, 'ilustração sai do livro')
hit(meow(), TL['meow'], 0.25, 1.0, 'miado do Pingo')
hit(meow(0.32, (700, 920, 760), (420, 700, 600), (2300, 1800, 1600), 0.28), TL['crouch'] + 0.25, 0.25, 0.7, 'miadinho (prepara o salto)')
hit(whoosh(0.5, 120, 1500) * 1.6, TL['leap'], 0.1, 1, 'salto')
hit(mx(drum(140, 0.3, 0.2, 16) * 0.5, pop(900, 250, 0.14) * 1.2, sparkle(1.0) * 0.6), TL['splash'], 0, 1, 'mergulho na página (PLOFT)')
hit(whoosh(0.7, 200, 9000) * 1.6, TL['splash'] + 0.25, 0, 1, 'câmera entra na ilustração')
hit(mx(drum(55, 0.6, 0.5, 6) * 0.5, whoosh(0.4, 3000, 10000, up=False) * 0.6), TL['portal'], 0, 1, 'chegada na floresta')
for k in range(8): hit(step() * 0.8, TL['portal'] + 0.25 + k * BEAT / 2, -0.2 + 0.05 * k, 1, 'passo da onça')
hit(whoosh(0.3, 300, 7000) * 2.0, TL['whip'], 0.6, 1, 'chicote de câmera')
for k in range(6): hit(step() * 0.8, TL['whip'] + 0.25 + k * BEAT / 2, 0.3 - 0.1 * k, 1, 'passo do tigre')
hit(mx(whoosh(0.3, 900, 9000, up=False) * 0.8, drum(70, 0.3, 0.4, 12) * 0.25), TL['cutLion'], 0, 1, 'corte para a savana')
hit(roar(0.6, 0.35) * 0.5, TL['cutLion'] + 1.5, 0.2, 1, 'rosnado baixo do leão')
for k, tf in enumerate(TL['fam']): hit(mx(whoosh(0.35, 300, 3000) * 0.5, step()), tf, -0.5 + 0.5 * k, 1, 'felino chega')
hit(mx(drum(60, 0.5, 0.3, 8) * 0.9, pop(300, 520, 0.08) * 0.6), TL['pingoLand'], 0, 1, 'Pingo pousa (TUM)')
hit(noise(0.8, 2500, 7000) * np.sin(np.pi * np.linspace(0, 1, int(0.8 * SR))) * 0.05, TL['write'], -0.2, 1, 'pena escrevendo')
amb.put(birds(TL['cutC'] - TL['cutB'], 9) * 0.7, TL['cutB'], 0.3, 1.0)
amb.put(birds(TL['whip'] - TL['portal'], 7) + noise(TL['whip'] - TL['portal'], 4500, 6500) * 0.02, TL['portal'], -0.25, 1.0)
amb.put(noise(TL['cutLion'] - TL['whip'], 300, 1500) * 0.04, TL['whip'], 0.2)
amb.put(noise(DUR - TL['cutLion'], 150, 700) * 0.07 * env(int((DUR - TL['cutLion']) * SR), 0.3, 0.5), TL['cutLion'], -0.1)
json.dump(hits, open('audio/acertos.json', 'w'), ensure_ascii=False, indent=1)

# ---------------------------------------------------------------- 4) vozes (já restauradas a -18 LUFS; sala curta e discreta)
for v in TL['voices']:
    a, sr = sf.read(v['arquivo']); assert sr == SR
    vox.put(a, v['inicio'], {'miguel': 0.12, 'lara': -0.12}.get(v['quem'], 0.0), 1.0)
vx = Pedalboard([Reverb(room_size=0.18, wet_level=0.06, dry_level=1.0, width=0.5)])(vox.x.T.astype(np.float32), SR).T

# ---------------------------------------------------------------- 5) mixagem
meter = pyln.Meter(SR)
s = stereo_master(sfx.x, 0.12, 0.4); a = stereo_master(amb.x, 0.2, 0.6)
m *= 10 ** ((-23 - meter.integrated_loudness(m)) / 20)
act = np.zeros(N)
for w in TL['words']: act[int((w[1] - 0.12) * SR):int((w[2] + 0.18) * SR)] = 1
k = np.convolve(act, np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same'); duck = (10 ** (-9.5 * k / 20))[:, None]
vx *= 10 ** ((-17 - meter.integrated_loudness(vx)) / 20)
x = m * duck + s * 10 ** (-4 / 20) * (1 - 0.35 * k[:, None]) + a * 10 ** (-7 / 20) * duck + vx * 10 ** (6.5 / 20)
fo = int(0.5 * SR); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
x = Pedalboard([Compressor(threshold_db=-16, ratio=2.0, attack_ms=15, release_ms=150)])(x.T.astype(np.float32), SR).T
def limiter(x, ceil_db, look=0.003, rel=0.08):
    from scipy.ndimage import minimum_filter1d
    c = 10 ** (ceil_db / 20); g = minimum_filter1d(np.minimum(1, c / np.maximum(np.abs(x).max(1), 1e-9)), 2 * int(look * SR) + 1)
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); v = 1.0
    for i in range(len(g)): v = g[i] if g[i] < v else a * v + (1 - a) * g[i]; out[i] = v
    return x * out[:, None]
for _ in range(4): x = limiter(x * 10 ** ((-14 - meter.integrated_loudness(x)) / 20), -2.6)
sf.write('audio/mix.wav', x.astype(np.float32), SR, subtype='PCM_24')
# relação voz/fundo nas falas (inteligibilidade): energia da voz contra trilha+efeitos nos trechos falados
on = act > 0.5; V = vx * 10 ** (6.5 / 20); MB = m * duck; SB = s * 10 ** (-4 / 20) * (1 - 0.35 * k[:, None]); AB = a * 10 ** (-7 / 20) * duck
db = lambda y: 10 * np.log10(np.mean(y[on] ** 2) + 1e-12)
vr = db(V) - db(MB + SB + AB)
print(f'nas falas: voz {db(V):.1f} | trilha {db(MB):.1f} | efeitos {db(SB):.1f} | ambiente {db(AB):.1f} dB')
print('mix', round(meter.integrated_loudness(x), 2), 'LUFS | pico', round(20 * np.log10(np.abs(x).max()), 2), 'dBFS | voz acima do fundo', round(vr, 1), 'dB | desvio máx. dos acertos', max(abs(h['desvio_ms']) for h in hits), 'ms')
