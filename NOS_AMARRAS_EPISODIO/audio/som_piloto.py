"""Som do piloto (10 s), sintetizado em código — sem amostras, sem voz.
1) trilha discreta a 100 bpm (Sol maior): marimba em arpejo, baixo de pizzicato, cama de cordas, chocalho leve;
2) batidas MEDIDAS na trilha pronta (onset do bumbo/baixo por energia) -> audio/beats.json;
3) efeitos nos eventos da imagem (config.js), cada um encaixado na semicolcheia medida mais próxima -> audio/acertos.json;
4) mixagem em -14 LUFS, pico -2 dBFS.
Rodar a partir de NOS_AMARRAS_EPISODIO/:  python3 audio/som_piloto.py"""
import json, re, sys, numpy as np, soundfile as sf, pyloudnorm as pyln
sys.path.insert(0, 'audio')
import instruments as I
from instruments import SR, tv, env, hz, pluck, marimba, noise, whoosh, drum, glock, mx

cfg = open('config.js').read()
BPM = float(re.search(r'bpm:\s*([\d.]+)', cfg).group(1)); BEAT = 60 / BPM; E8 = BEAT / 2; S16 = BEAT / 4
DUR = 10.0 + 0.6; N = int(DUR * SR); I.N = N
T = {k: float(v) for k, v in re.findall(r'(\w+):\s*([\d.]+)', re.search(r't:\s*\{([^}]*)\}', cfg).group(1))}
music, sfx = I.Bus(), I.Bus()

# ---------------------------------------------------------------- 1) trilha
G = [(43, [59, 62, 67]), (40, [59, 64, 67]), (36, [60, 64, 67]), (38, [62, 66, 69])]      # Sol  Mi-m  Dó  Ré
def ch(i): return G[(i // 8) % 4]                                                         # 1 acorde por compasso (8 colcheias)
nE = int(10.0 / E8) + 1
for i in range(nE):
    t = i * E8; root, c = ch(i)
    fade = min(1.0, 0.55 + 0.45 * t / 2.4)                                                # entra já presente, cresce até o título
    n = c[(0, 1, 2, 1, 2, 1, 0, 2)[i % 8]] + (12 if i % 4 == 3 else 0)
    music.put(marimba(hz(n + 12), 0.55) * 0.55 * fade, t, -0.35 + 0.7 * (i % 2))
    if i % 2 == 0: music.put(pluck(hz(root - 12), 0.9, 1400) * 1.1 * fade, t, 0)
    if i % 4 == 0: music.put(drum(58, 0.45, 0.05, 10) * 0.55 * fade, t, 0)                # bumbo macio nos tempos 1 e 3
    music.put(noise(0.05, 5000, 11000) * np.exp(-tv(0.05) * 70) * (0.05 if i % 2 else 0.028) * fade, t, 0.3)  # chocalho
# cama de cordas (um acorde por compasso)
for b in range(0, nE, 8):
    root, c = ch(b); d = 8 * E8 + 0.4
    for j, m in enumerate([root] + c): music.put(I.strings(m, d, 1300, 0.4, 0.5) * (0.07 if j else 0.09), b * E8, -0.4 + 0.27 * j)
# final: acorde de Sol sustentado
for j, m in enumerate([43, 59, 62, 67]): music.put(I.strings(m, 1.6, 1300, 0.05, 1.2) * 0.08, 9.6, -0.3 + 0.2 * j)
music.put(glock(hz(79), 1.6) * 0.5, 9.6, 0.2)

# ---------------------------------------------------------------- 2) batidas medidas (onset de energia grave)
mono = music.x.mean(1); lo = I.filt(mono, 'lowpass', 160); hop = 240
e = np.array([np.sum(lo[k:k + hop] ** 2) for k in range(0, len(lo) - hop, hop)]); flux = np.maximum(0, np.diff(e, prepend=0))
cand = [k for k in range(1, len(flux) - 1) if flux[k] > flux[k - 1] and flux[k] >= flux[k + 1] and flux[k] > 0.25 * flux.max()]
on = []
for k in cand:
    t = k * hop / SR
    if not on or t - on[-1] > E8 * 0.6: on.append(t)
# grade ajustada aos onsets (período e fase por mínimos quadrados)
idx = np.round(np.array(on) / E8); A = np.vstack([idx, np.ones_like(idx)]).T; per, fase = np.linalg.lstsq(A, np.array(on), rcond=None)[0]
res = np.abs(np.array(on) - (idx * per + fase)).max() * 1000
batidas = [round(fase + k * per * 2, 3) for k in range(int(10.0 / (per * 2)) + 1)]
json.dump({'bpm_medido': round(60 / (per * 2), 2), 'fase_s': round(fase, 3), 'residuo_max_ms': round(res, 1), 'onsets': [round(x, 3) for x in on], 'batidas': batidas}, open('audio/beats.json', 'w'), indent=1)
print(f'bpm medido {60 / (per * 2):.2f}, fase {fase * 1000:.1f} ms, resíduo {res:.1f} ms, {len(on)} onsets')
def grade(t): return fase + round((t - fase) / (per / 2)) * (per / 2)                    # semicolcheia medida mais próxima

# ---------------------------------------------------------------- 3) efeitos
def deslize(d, g=0.5):    # corda deslizando: ruído de fibra filtrado com textura de atrito
    x = noise(d, 900, 5200) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 23 * tv(d)))); return x * env(len(x), 0.12, 0.35) * g
def toque(f, g=0.5): return mx(marimba(hz(f), 0.5) * 0.9, glock(hz(f + 12), 0.6) * 0.25) * g
def abre(d=0.9):          # fibras se soltando: estalos finos com semente
    out = np.zeros(int(d * SR)); R = np.random.default_rng(9)
    for _ in range(40):
        j = int(R.uniform(0, d - 0.03) * SR); c = noise(0.012, 3000, 9000) * np.exp(-tv(0.012) * 400) * R.uniform(0.05, 0.16); out[j:j + len(c)] += c
    return out * env(len(out), 0.1, 0.3)
ac = []
def poe(nome, t, sig, pan=0.0, g=1.0):
    tg = grade(t); sfx.put(sig * g, tg, pan); ac.append({'efeito': nome, 'evento_s': round(t, 3), 'na_grade_s': round(tg, 3), 'desvio_ms': round((tg - t) * 1000, 1)})
poe('deslize do nó', 0.0, deslize(T['noFim'] + 0.2, 0.32), -0.2)
poe('nó completo', T['noFim'], toque(74, 0.55), 0.1)
poe('deslize do título', T['noFim'] + 0.15, deslize(T['tituloFim'] - T['noFim'], 0.26), 0.3)
poe('título completo', T['tituloFim'] + 0.15, toque(79, 0.5), -0.1)
poe('mergulho', T['zoom0'], whoosh(T['zoom1'] - T['zoom0'], 300, 3200) * 0.9, 0)
poe('chegada no chicote', T['zoom1'], mx(drum(70, 0.35, 0.1, 12) * 0.5, toque(67, 0.45)), 0)
poe('rótulo CORDA', T['zoom1'], toque(71, 0.0), 0)            # (marcador; o toque já soou na chegada)
poe('cordões se abrem', T['zoom1'] + 0.05, abre(1.1), 0.2)
poe('rótulo 3 CORDÕES', T['zoom1'] + 0.6, toque(74, 0.42), 0.25)
poe('fios se abrem', T['abre1'] + 0.1, abre(1.0) * 0.8, -0.2)
poe('rótulo FIOS', T['abre1'] + 0.6, toque(76, 0.4), -0.25)
poe('rótulo FIBRAS', T['fios1'], toque(79, 0.4), 0.3)
json.dump(ac, open('audio/acertos.json', 'w'), indent=1, ensure_ascii=False)
print('maior desvio da grade:', max(abs(a['desvio_ms']) for a in ac), 'ms')

# ---------------------------------------------------------------- 4) mixagem
mixw = music.x * 0.8 + sfx.x
mixw = mixw[:int(10.0 * SR)]
fo = int(0.35 * SR); mixw[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
from scipy.ndimage import minimum_filter1d
def limitador(x, teto, look=0.005, rel=0.08):
    # ganho necessário por amostra, antecipado (lookahead) e com liberação exponencial
    pk = np.abs(x).max(1); g = np.minimum(1.0, teto / np.maximum(pk, 1e-9)); g = minimum_filter1d(g, int(look * SR) * 2 + 1)
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]; out[i] = cur
    return x * out[:, None]
meter = pyln.Meter(SR); lufs0 = meter.integrated_loudness(mixw); lim = 10 ** (-2 / 20)
for _ in range(4):
    mixw = pyln.normalize.loudness(mixw, meter.integrated_loudness(mixw), -14.0); mixw = limitador(mixw, lim * 0.97)
print(f'LUFS antes {lufs0:.1f} -> depois {meter.integrated_loudness(mixw):.2f}, pico {20 * np.log10(np.abs(mixw).max()):.2f} dBFS')
sf.write('audio/trilha_piloto.wav', mixw.astype(np.float32), SR, subtype='PCM_24')
