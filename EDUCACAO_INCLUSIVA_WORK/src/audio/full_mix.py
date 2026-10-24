"""Áudio do vídeo completo (Remotion v3): voz editada + música (com ducking) + efeitos sintetizados
sincronizados com a nova animação -> remotion/public/completo_mix.wav, audio/master_v3.wav (-14 LUFS, <= -1 dBTP),
documentation/SFX_CUES_v3.json."""
import json, sys, numpy as np, soundfile as sf, pyloudnorm as pyln
sys.path.insert(0, 'src/audio')
from dsp import tp_limiter
DUR = 180.0; SR = 48000; N = int(DUR * SR)
src = open('src/audio/sfx.py').read().split('# ---- scene transitions')[0]
G = {}; exec(src, G)
put, roll, whoosh, thud, click, pop, chime, step, bell, add, pageflip, scribble, water, typing, crumble, stamp, buzz, shimmer = (G[k] for k in
    ['put', 'roll', 'whoosh', 'thud', 'click', 'pop', 'chime', 'step', 'bell', 'add', 'pageflip', 'scribble', 'water', 'typing', 'crumble', 'stamp', 'buzz', 'shimmer'])
S = [s['start'] for s in json.load(open('documentation/scene_bounds.json'))]
T = json.load(open('remotion/src/timing.json'))
P = lambda sc, t: S[sc - 1] + t
popk = lambda k=0, g=0.6: (lambda t, pan=0.0: put(pop(420 + 60 * k, 980 + 120 * k, 0.1), t, pan, g, 'pop'))

# ---- transições entre cenas
for i in range(1, 10): put(whoosh(0.7, 250, 3600, up=i % 2 == 0), S[i] - 0.35, 0.25 * (-1) ** i, 0.9, f'transição para a cena {i + 1}')

# ---- CENA 1 (igual ao piloto aprovado + fecho)
for i in range(7): put(pop(520 + 70 * i, 1100 + 120 * i, 0.08), 0.12 + i * 0.045, (i - 3) * 0.12, 0.5, 'letra IMAGINE')
put(shimmer() * 0.7, 0.75, 0, 0.8, 'título da série'); put(add(whoosh(0.45, 300, 6000), thud(90, 0.2, 0.25)), 0.86, 0, 1.0, 'revelação')
put(whoosh(0.9, 200, 2500, up=False), 1.5, 0.2, 0.9, 'câmera sobe')
for i in range(6): put(pop(700 + 150 * i, 1500 + 200 * i, 0.06), 2.05 + i * 0.05, 0.3 + 0.05 * i, 0.45, 'confete')
put(chime(1568, 3, 0.05) * 0.6, 3.02, 0, 0.7, 'participar'); put(whoosh(0.5, 600, 5000) * 0.6, 3.25, 0, 0.6, 'selo vai ao canto')
put(roll(T['T_STOP'] + 0.1) * 1.4, 0.0, -0.35, 1.0, 'cadeira de rodas rolando')
RW = T['R_TIRE'] * T['THEO_SCALE']; tot = (T['AXLE_STOP'] - T['AXLE_START']) / RW
phi = ((0.7 - (tot % T['CYCLE'])) % T['CYCLE'] + T['CYCLE']) % T['CYCLE']
xs = lambda t: T['AXLE_START'] + (T['AXLE_STOP'] - T['AXLE_START']) * (1 - (1 - min(1, t / T['T_STOP'])) ** 2.2)
prev = None
for i in range(int(T['T_STOP'] * 200)):
    t = i / 200; ph = (((xs(t) - T['AXLE_START']) / RW + phi) % T['CYCLE'])
    if prev is not None and ph < prev - 1: put(add(thud(180, 0.08, 0.05), whoosh(0.22, 400, 1800) * 0.5), t, -0.3, 0.8, 'impulso')
    prev = ph
put(add(thud(120, 0.15, 0.12), click(0.03) * 0.15), T['T_STOP'] - 0.05, -0.1, 1.0, 'mãos freiam o aro')
put(chime(1318, 2, 0.07) * 0.35, 2.0, 0.3, 0.8, 'aceno')
for tb in T['BARRIER']: put(add(thud(62, 0.45, 0.35), whoosh(0.35, 150, 600) * 0.3), tb, 0.15, 0.9, 'barreira (pulso)')
put(pop(500, 1200), T['QUESTION'], 0.1, 0.8, 'ponto de interrogação')
for i in range(12): put(pop(600 + 50 * i, 1300 + 90 * i, 0.07), 10.75 + i * 0.03, (i - 6) * 0.08, 0.4, 'letra NINGUÉM FICA DE FORA')
put(shimmer(), 11.0, 0, 0.8, 'confete final da cena 1')

# ---- CENA 2
for t, k in [(0.55, 0), (2.35, 2), (3.7, 1), (3.95, 2), (7.5, 4), (12.85, 3), (13.75, 4), (14.6, 5), (17.7, 3), (18.5, 5)]: popk(k)(P(2, t))
put(whoosh(0.5, 300, 4000), P(2, 1.35), 0, 0.8, '≠ gira'); put(buzz(), P(2, 2.62), 0, 1.0, 'incapacidade riscada')
for i in range(12): put(thud(140 + 10 * i, 0.12, 0.12), P(2, 4.9 + i * 0.16 + 0.3), 0.1, 0.8, 'tijolo')
put(buzz(), P(2, 6.55), 0.2, 0.7, 'BARREIRA'); put(crumble(1.0), P(2, 7.25), 0.1, 1.0, 'muro desmorona'); put(chime(784, 3, 0.08) * 0.8, P(2, 7.6), 0, 0.7, 'acessibilidade')
put(add(whoosh(0.6, 200, 3000), thud(90, 0.2, 0.2)), P(2, 10.35), 0, 0.9, 'CIF'); put(whoosh(0.5, 400, 3000), P(2, 15.45), 0, 0.8, 'cartão da ONU')
put(shimmer(), P(2, 19.7), 0, 0.9, 'para todos')

# ---- CENA 3
popk(0)(P(3, 0.45))
for i, t in enumerate([2.05, 2.9, 3.8, 4.85, 5.83]): put(add(pop(500 + 90 * i, 1100 + 160 * i), chime(660 + 110 * i, 1) * 0.4), P(3, t), (i - 2) * 0.2, 0.7, 'tipo de deficiência')
put(whoosh(0.5, 300, 3000), P(3, 6.35), 0, 0.7, 'troca de quadro'); put(chime(988, 3, 0.07), P(3, 9.65), 0, 0.7, 'cordão de girassol'); put(shimmer() * 0.6, P(3, 10.0), 0, 0.7, 'brilho')
for t, k in [(12.75, 2), (13.65, 3), (14.4, 4)]: popk(k)(P(3, t))
put(chime(1046, 4, 0.08) * 0.7, P(3, 15.6), 0, 0.7, 'amigos acenam'); put(shimmer(), P(3, 16.75), 0, 0.8, 'respeitar as diferenças')

# ---- CENA 4 (tom sério, sem exageros)
put(thud(70, 0.35, 0.4), P(4, 0.2), 0, 0.9, 'DISCRIMINAÇÃO'); put(whoosh(0.6, 200, 1500), P(4, 1.0), 0, 0.6, 'balança'); popk(1)(P(4, 2.65))
put(stamp(), P(4, 5.2), 0, 1.0, 'DIREITOS NEGADOS'); put(thud(70, 0.35, 0.4), P(4, 6.75), 0, 0.9, 'BULLYING'); popk(2)(P(4, 7.75))
for i in range(4): put(pop(400, 800, 0.08), P(4, 8.0 + i * 0.12), 0, 0.4, 'calendário'); put(buzz(0.15), P(4, 8.6 + i * 0.38), 0.1, 0.5, 'repetição')
for t, k in [(10.5, 1), (11.7, 2), (13.45, 3), (14.45, 4)]: popk(k)(P(4, t))
put(whoosh(0.5, 300, 3000), P(4, 15.6), 0, 0.7, 'virada'); popk(3)(P(4, 16.2)); put(add(stamp(), chime(784, 3, 0.07) * 0.6), P(4, 16.95), 0, 1.0, 'COMBATER!')

# ---- CENA 5
put(whoosh(0.4, 300, 3000), P(5, 0.05), 0, 0.7, 'calendário')
for i in range(9): put(click(0.03) * 0.5, P(5, 0.15 + i * 0.12), 0, 0.6, 'contador')
put(chime(1175, 3, 0.06), P(5, 1.25), 0, 0.8, '1999')
for i in range(12): put(pop(600 + 40 * i, 1200 + 70 * i, 0.06), P(5, 2.9 + i * 0.08), (i % 5 - 2) * 0.2, 0.35, 'países')
put(whoosh(0.5, 400, 4000), P(5, 4.25), 0.3, 0.8, 'documento'); put(scribble(1.1) * 0.7, P(5, 5.3), 0.3, 0.8, 'assinatura'); put(stamp(), P(5, 6.1), 0.2, 0.9, 'carimbo')
for i, t in enumerate([9.7, 10.95, 12.1]): put(add(whoosh(0.5, 200, 2000), chime(660 + 130 * i, 2) * 0.5), P(5, t), (i - 1) * 0.4, 0.8, 'valor')
for i, t in enumerate([12.7, 14.85, 16.4]): popk(i + 1)(P(5, t), (i - 1) * 0.3)
for i in range(3): put(pop(700, 1400, 0.07), P(5, 15.0 + i * 0.3), (i - 1) * 0.4, 0.4, 'balão do debate')
put(scribble(1.4), P(5, 16.8), 0, 0.9, 'resumo sendo escrito')

# ---- CENA 6 (João 5)
put(pageflip(0.5), P(6, 0.2), 0, 1.0, 'Bíblia abre'); put(shimmer() * 0.6, P(6, 0.9), 0, 0.7, 'luz da página')
for i in range(6): put(step() * 0.7, P(6, 1.1 + i * 0.42), -0.3 + i * 0.08, 0.7, 'passos')
put(water(2.5) * 0.25, P(6, 1.0), 0.3, 0.6, 'água do tanque'); popk(2)(P(6, 4.65))
for t in (7.15, 7.85): popk(1)(P(6, t))
put(chime(523, 4, 0.12), P(6, 9.45), 0, 0.7, 'cura (suave)'); popk(3)(P(6, 11.7), 0.3); popk(2)(P(6, 12.95), 0.3)
put(chime(659, 3, 0.1) * 0.7, P(6, 14.65), 0, 0.7, 'atenção à pessoa'); popk(4)(P(6, 17.8)); put(shimmer() * 0.6, P(6, 19.0), 0, 0.6, 'ideia')

# ---- CENA 7 (2 Samuel 9)
put(pageflip(0.5), P(7, 0.2), 0, 1.0, 'Bíblia abre'); put(shimmer() * 0.6, P(7, 0.9), 0, 0.7, 'luz da página'); popk(1)(P(7, 2.3))
for i in range(5): put(step() * 0.6, P(7, 4.4 + i * 0.42), 0.3 - i * 0.1, 0.6, 'passos do mensageiro')
for t in (7.4, 11.95): put(whoosh(0.35, 500, 5000) * 0.7, P(7, t), 0, 0.7, 'corte')
for t in (3.2, 4.6, 9.8, 11.4, 13.55, 17.7): popk(2)(P(7, t))
put(add(shimmer(), chime(523, 4, 0.1) * 0.6), P(7, 12.2), 0, 0.8, 'acolhimento'); put(pop(600, 1300), P(7, 18.5), 0, 0.6, 'coração')

# ---- CENA 8 (Helen Keller)
put(water(3.8), P(8, 1.3), 0.3, 0.8, 'bomba d’água'); popk(1)(P(8, 0.9))
for i in range(5): put(pop(800 + 80 * i, 1500 + 120 * i, 0.07), P(8, 3.95 + i * 0.24), (i - 2) * 0.15, 0.5, 'letra W-A-T-E-R')
for t in (5.45, 7.25, 9.8): put(whoosh(0.35, 500, 5000) * 0.7, P(8, t), 0, 0.7, 'corte')
put(typing(1.7), P(8, 5.5), 0.2, 0.9, 'máquina de escrever'); put(bell(2093, 0.6, 0.06), P(8, 7.1), 0.2, 1.0, 'sino da máquina')
put(chime(784, 3, 0.07) * 0.7, P(8, 7.75), 0, 0.7, 'diploma'); put(whoosh(0.6, 500, 4000), P(8, 8.4), 0, 0.6, 'capelos'); popk(3)(P(8, 9.9))
for i in range(3): put(whoosh(0.6, 200, 1800) * 0.6, P(8, 10.6 + i * 0.55), (i - 1) * 0.3, 0.6, 'porta se abre')
put(chime(988, 3, 0.07), P(8, 12.9), 0, 0.8, 'oportunidades'); put(shimmer() * 0.7, P(8, 13.7), 0, 0.7, 'brilho')

# ---- CENA 9 (LBI)
put(whoosh(0.9, 200, 2500), P(9, 0.1), 0, 0.7, 'mapa do Brasil'); put(whoosh(0.5, 400, 3500), P(9, 1.15), 0, 0.7, 'cartão da Lei')
popk(1)(P(9, 3.0))
for i, t in enumerate([3.45, 4.45, 5.5, 6.5]): put(add(pop(500 + 90 * i, 1100 + 160 * i), chime(660 + 110 * i, 1) * 0.4), P(9, t), (i - 1.5) * 0.2, 0.7, 'direito')
popk(4)(P(9, 7.7))
for i in range(6): put(thud(130 + 8 * i, 0.12, 0.1), P(9, 9.05 + i * 0.07), 0, 0.6, 'muro')
put(crumble(1.2), P(9, 11.65), 0, 1.0, 'barreira eliminada'); put(add(shimmer(), chime(659, 4, 0.1) * 0.6), P(9, 12.3), 0, 0.9, 'todos participam'); popk(3)(P(9, 13.3))

# ---- CENA 10
for t, k in [(0.6, 1), (2.3, 3), (3.05, 2)]: popk(k)(P(10, t))
put(whoosh(0.9, 300, 2500) * 0.6, P(10, 3.1), 0, 0.6, 'lupa'); put(whoosh(0.5, 400, 3500), P(10, 5.0), 0, 0.7, 'projeto'); put(scribble(0.9) * 0.7, P(10, 5.3), 0, 0.8, 'desenho da rampa')
put(whoosh(0.5, 400, 3500), P(10, 6.55), 0.2, 0.7, 'proposta')
for i in range(3): put(pop(700, 1400, 0.07), P(10, 6.9 + i * 0.3), 0, 0.5, 'item da proposta')
put(add(stamp(), chime(784, 3, 0.07) * 0.6), P(10, 7.95), 0.2, 1.0, 'APROVADO!')
put(whoosh(0.4, 500, 5000), P(10, 8.85), 0, 0.8, 'corte para a rampa')
for i in range(4): put(thud(110, 0.15, 0.15), P(10, 9.0 + i * 0.25), -0.2 + i * 0.15, 0.7, 'construção da rampa')
put(chime(880, 3, 0.07), P(10, 10.0), 0, 0.8, 'rampa pronta'); put(roll(4.4) * 1.3, P(10, 10.2), 0, 1.0, 'Theo sobe a rampa')
for i in range(8): put(add(thud(180, 0.08, 0.05), whoosh(0.22, 400, 1800) * 0.5), P(10, 10.4 + i * 0.52), 0, 0.6, 'impulso')
put(add(shimmer(), chime(1046, 4, 0.08) * 0.7), P(10, 14.4), 0, 1.0, 'chegou à sede!')
for t in (14.5, 16.4, 16.6): [put(pop(700 + 140 * i, 1500 + 200 * i, 0.06), P(10, t) + i * 0.05, (i - 3) * 0.1, 0.4, 'confete') for i in range(6)]
for i in range(20): put(pop(560 + 30 * i, 1200 + 60 * i, 0.07), P(10, 14.95 + i * 0.03), (i % 7 - 3) * 0.1, 0.35, 'letra do título final')
put(add(whoosh(0.6, 300, 5000), chime(659, 4, 0.12) * 0.7), P(10, 16.9), 0, 0.9, 'emblema final')
sfx = np.stack([G['L'], G['R']], 1)[:N]
json.dump(G['LOG'], open('documentation/SFX_CUES_v3.json', 'w'), ensure_ascii=False, indent=1)

def fit(x):
    x = x if x.ndim == 2 else np.stack([x, x], 1)
    out = np.zeros((N, 2)); n = min(N, len(x)); out[:n] = x[:n]; return out
voice = fit(sf.read('audio/voice_edited.wav')[0]); music = fit(sf.read('audio/music.wav')[0])
meter = pyln.Meter(SR)
mg = -24.0 - meter.integrated_loudness(music)
v = np.abs(voice.mean(1)); blk = 480
e = np.sqrt(np.add.reduceat(v ** 2, np.arange(0, N, blk)) / blk); act = (20 * np.log10(e + 1e-9) > -45).astype(float)
smv = np.zeros_like(act); s = 0.0
for i, a in enumerate(act): s += (a - s) * (0.33 if a > s else 0.022); smv[i] = s
duck = np.repeat(10 ** (-7.5 * smv / 20), blk)[:N]
x = voice + music * 10 ** (mg / 20) * duck[:, None] + sfx * 10 ** (-3 / 20)
fade = np.ones(N); fi = int(0.03 * SR); fo = int(1.2 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
x *= fade[:, None]
y = x
for _ in range(3):
    gain = -14.0 - meter.integrated_loudness(y)
    x = x * 10 ** (gain / 20); y = tp_limiter(x, -1.3, sr=SR)[0]
x = y
sf.write('remotion/public/completo_mix.wav', x.astype(np.float32), SR, subtype='PCM_24')
sf.write('audio/master_v3.wav', x.astype(np.float32), SR, subtype='PCM_24')
print('mix completo', round(meter.integrated_loudness(x), 2), 'LUFS | pico', round(20 * np.log10(np.abs(x).max()), 2), 'dBFS | efeitos', len(G['LOG']))
