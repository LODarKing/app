"""Trilha e efeitos do piloto (10 s), sintetizados em código — sem amostras de terceiros.
Etapas: 1) trilha a 120 bpm em Ré frígio (bordão, pandeiro de moldura, chocalho, alaúde, flauta de cana; Ré maior no título)
2) batidas MEDIDAS na trilha pronta -> audio/piloto/beats.json
3) efeitos de areia, pedra, pincel, papiro, cliques e descoberta nos eventos da linha do tempo (audio/piloto/ancoras.json),
   encaixados na semicolcheia da grade medida -> audio/piloto/acertos.json
4) stems: audio/piloto/stem_trilha.wav e audio/piloto/stem_efeitos.wav (a mixagem com a voz é feita em mix_piloto.py)
Uso (a partir de arqueologia-biblica/):  python3 audio/trilha_piloto.py"""
import json, sys, numpy as np, soundfile as sf
sys.path.insert(0, 'audio')
from timbres import SR, tv, hz, filt, env, sub, bumbo, ruido, reverb, tambor_moldura, chocalho, alaude, flauta_ney, drone

A = json.load(open('audio/piloto/ancoras.json')); T = A['T']
BPM = T['bpm']; BEAT = 60 / BPM; SEMI = BEAT / 4; BAR = 4 * BEAT; FIM = 10.0; N = int((FIM + 2.5) * SR)
class Bus:
    def __init__(s): s.x = np.zeros((N, 2))
    def put(s, sig, t0, pan=0.0, g=1.0):
        i0 = int(round(t0 * SR))
        if i0 < 0: sig = sig[-i0:]; i0 = 0
        if i0 >= N or len(sig) == 0: return
        sig = sig[: N - i0] * g; s.x[i0:i0 + len(sig), 0] += sig * np.cos((pan + 1) * np.pi / 4); s.x[i0:i0 + len(sig), 1] += sig * np.sin((pan + 1) * np.pi / 4)
mus, rit, sfx = Bus(), Bus(), Bus()

# ---------------------------------------------------------------- 1) trilha
# Ré frígio: Ré Mi♭ Fá Sol Lá Si♭ Dó (Ré = 62). No título, a terça sobe (Fá♯): Ré maior, abertura e esperança.
mus.put(drone([38, 45], T['s5'] + 0.6, 0.11, 700), 0.0, 0)                       # bordão Ré–Lá desde o quadro 0
mus.put(drone([38, 45, 54], FIM - T['s5'] + 2.0, 0.12, 1100), T['s5'] - 0.05, 0)   # no título, entra o Fá♯ (Ré maior)
# pandeiro de moldura: esparso no gancho, levada a partir do corte 2, preenchimento antes do carimbo
DUM, TEK = {0, 6, 10}, {4, 12}
for i in range(int(FIM / SEMI) + 1):
    t = i * SEMI; st = i % 16
    if t < T['s2']:
        if st in (0,) and t > 0: rit.put(tambor_moldura(0.7, True), t, -0.1)
        if st == 12: rit.put(tambor_moldura(0.5, False), t, 0.15)
        continue
    if T['s4'] <= t < T['carimbo']:                                                 # preenchimento: tek em semicolcheias crescendo
        k = (t - T['s4']) / max(0.1, T['carimbo'] - T['s4']); rit.put(tambor_moldura(0.25 + 0.6 * k, False), t, 0.2 * (1 if i % 2 else -1)); continue
    if T['carimbo'] <= t < T['s5'] and t - T['carimbo'] < 0.5: continue               # respiro depois do carimbo
    if st in DUM: rit.put(tambor_moldura(0.8, True), t, -0.1)
    if st in TEK: rit.put(tambor_moldura(0.6, False), t, 0.15)
    if st in (14, 15) and t > T['s3']: rit.put(tambor_moldura(0.22, False), t, 0.3)
    if i % 2 == 0: rit.put(chocalho(0.1, 0.9 if st % 4 == 0 else 0.6), t, 0.35)
# alaúde: motivo em colcheias (frase 1 no plano da estela, frase 2 no mapa), trêmulo no mecanismo, arpejo de Ré maior no título
def frase(t0, notas, g=0.8):
    for j, m in enumerate(notas):
        if m is not None: mus.put(alaude(hz(m), 1.2, g), t0 + j * 2 * SEMI, -0.25 + 0.05 * (j % 3))
frase(T['s2'] + 2 * SEMI, [62, 63, 65, 67, 65, 63, 62, None, 62, 63, 65, 63])
frase(T['s3'] + 2 * SEMI, [57, 58, 60, 62, 60, 58, 57, None, 57, 60, 62, 63])
for i in range(int((T['carimbo'] - T['s4']) / SEMI)): mus.put(alaude(hz(62), 0.3, 0.35 + 0.4 * i / 12), T['s4'] + i * SEMI, 0.1)
for j, m in enumerate([50, 57, 62, 66, 69]): mus.put(alaude(hz(m), 2.2, 0.85), T['s5'] + j * SEMI, -0.3 + 0.15 * j)
# flauta de cana: frase curta no título, terminando em Fá♯ sustentado (abre para a próxima cena)
fl = [(T['rolo0'], 69, 4 * SEMI), (T['rolo0'] + 4 * SEMI, 74, 4 * SEMI), (T['rolo1'], 78, FIM - T['rolo1'] + 1.0)]
for t0, m, d in fl: mus.put(flauta_ney(hz(m), d, 1.0), t0, 0.2)
# pulso grave na chegada do título e no carimbo
mus.put(sub(hz(26), 1.6) * env(int(1.6 * SR), 0.005, 1.2) * 0.9, T['carimbo'], 0)
mus.put(sub(hz(26), 1.4) * env(int(1.4 * SR), 0.005, 1.0) * 0.6, T['rolo1'], 0)

# ---------------------------------------------------------------- 2) batidas medidas (onsets do pandeiro e do alaúde)
mono = rit.x.mean(1)[: int(FIM * SR)]; hop = 48          # ataques secos do pandeiro
rms = np.sqrt(np.array([np.mean(mono[k:k + hop * 2] ** 2) for k in range(0, len(mono) - hop * 2, hop)]) + 1e-12)
flux = np.maximum(0, np.diff(np.log(rms), prepend=np.log(rms[0])))
cand = [k for k in range(1, len(flux) - 1) if flux[k] > flux[k - 1] and flux[k] >= flux[k + 1] and flux[k] > 0.12 * flux.max()]
on = []
for k in cand:
    t = k * hop / SR
    if not on or t - on[-1] > SEMI * 0.6: on.append(t)
on = np.array(on); usa = np.abs(on - np.round(on / SEMI) * SEMI) < 0.03
for _ in range(3):
    idx = np.round(on / SEMI); M = np.vstack([idx[usa], np.ones(usa.sum())]).T
    per, fase = np.linalg.lstsq(M, on[usa], rcond=None)[0]; r = np.abs(on - (idx * per + fase)); usa = r < 0.03
batidas = [round(fase + k * per * 4, 3) for k in range(int(FIM / (per * 4)) + 1)]
json.dump({'bpm_medido': round(60 / (per * 4), 2), 'fase_s': round(fase, 4), 'residuo_max_ms': round(float(r[usa].max() * 1000), 1), 'onsets_na_grade': int(usa.sum()), 'onsets': int(len(on)), 'batidas': batidas}, open('audio/piloto/beats.json', 'w'), indent=1)
print(f'bpm medido {60 / (per * 4):.2f}, fase {fase * 1000:.1f} ms, {usa.sum()} de {len(on)} onsets na grade')
def grade(t): return fase + round((t - fase) / per) * per

# ---------------------------------------------------------------- 3) efeitos (sintetizados)
R = np.random.default_rng(33)
def graos(d, dens, lo, hi, amp, seed, curva=None):        # textura granular (areia, pedra, papiro, pena)
    rr = np.random.default_rng(seed); n = int(d * SR); out = np.zeros(n + 4000); t = 0.0
    while t < d:
        k = curva(t / d) if curva else 1.0
        if k > 0.02:
            m = int(rr.uniform(0.002, 0.012) * SR); g = rr.standard_normal(m) * np.hanning(m) * rr.uniform(0.3, 1) * k; j = int(t * SR); out[j:j + m] += g
        t += 1 / (dens * max(k, 0.05))
    return filt(out[:n], 'bandpass', [lo, hi]) * amp
def boom(d=1.3, f0=58, f1=30, g=1.0):
    t = tv(d); f = f1 + (f0 - f1) * np.exp(-t * 4); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2) * g
def whoosh(d, lo=300, hi=3000, g=0.3, pico=0.6):
    n = int(d * SR); t = np.arange(n) / n; e = np.where(t < pico, (t / pico) ** 2, ((1 - t) / (1 - pico)) ** 1.5)
    return (filt(ruido(d, lo, hi), 'lowpass', hi) * e) * g
def clique(g=1.0, f=2400):
    t = tv(0.08); return (filt(ruido(0.08, f * 0.6, f * 2.2), 'bandpass', [f * 0.6, f * 2]) * np.exp(-t * 160) + np.sin(2 * np.pi * f * t) * np.exp(-t * 120) * 0.3) * g
def sino(f, g=1.0, d=1.6):                                    # sininho de descoberta (parciais inarmônicas)
    t = tv(d); return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dec) for r, a, dec in [(1, 1, 2.5), (2.76, 0.5, 4), (5.4, 0.25, 7), (8.9, 0.1, 9)]) * g * 0.12
def tok(g=1.0, f=640):
    t = tv(0.2); return (np.sin(2 * np.pi * f * t) * np.exp(-t * 30) + filt(ruido(0.2, 300, 2500), 'bandpass', [300, 2500]) * np.exp(-t * 70) * 0.4) * g * 0.5
def baque(g=1.0):                                            # carimbo de madeira no papel
    t = tv(0.5); return (np.sin(2 * np.pi * 66 * t) * np.exp(-t * 16) + filt(ruido(0.5, 60, 500), 'lowpass', 600) * np.exp(-t * 22) * 0.8 + filt(ruido(0.5, 500, 3500), 'bandpass', [500, 3500]) * np.exp(-t * 60) * 0.35) * g
def claque(g=1.0):                                           # pedra encaixa + bronze
    t = tv(0.6); x = filt(ruido(0.6, 200, 4000), 'bandpass', [200, 4000]) * np.exp(-t * 45)
    res = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) * a for f, d, a in [(1180, 14, 0.25), (2730, 18, 0.16), (4120, 22, 0.08)])
    return (x * 0.7 + res + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 20) * 0.5) * g
ac = []
def mx(*xs):
    o = np.zeros(max(len(x) for x in xs))
    for x in xs: o[:len(x)] += x
    return o
def poe(nome, t, sig, pan=0.0, g=1.0):
    tg = grade(t); sfx.put(sig, tg, pan, g); ac.append({'efeito': nome, 'evento_s': round(t, 3), 'na_grade_s': round(tg, 3), 'desvio_ms': round((tg - t) * 1000, 1)})
# plano 1: pedra sobe, areia escorre, palavras do gancho batem
poe('pedra sobe: subgrave', 0.0, boom(1.6, 62, 30, 0.9))
poe('pedra sobe: atrito de rocha na areia', 0.0, mx(graos(1.15, 260, 80, 900, 0.5, 1, lambda k: 1 - k ** 2), filt(ruido(1.15, 30, 160), 'lowpass', 160) * env(int(1.15 * SR), 0.02, 0.5) * 0.4), -0.1)
poe('areia escorre dos ombros da pedra', 0.0, graos(1.4, 420, 2200, 9000, 0.22, 2, lambda k: np.sin(np.pi * min(1, k * 1.4)) ), 0.3)
for j, (tq, w) in enumerate(zip(T['gancho'][1:], ['SE', 'FOSSE', 'REAL?'])):
    if j == 0: continue
    poe(f'gancho: "{w}" bate', tq, mx(tambor_moldura(0.9 if w == 'REAL?' else 0.6, w == 'REAL?'), tok(0.6, 420)), 0.0)
# plano 2: pincel limpa as linhas, lupa circula e pousa em "casa de Davi"
aL = lambda i: T['R0'] + i * (T['R1'] - T['R0'] - 0.26) / 9
esfrega = np.zeros(int((T['R1'] - T['R0'] + 0.4) * SR))
for i in range(10):
    s = graos(0.26, 900, 2500, 9500, 0.16, 10 + i, lambda k: np.sin(np.pi * k)); j = int((aL(i) - T['R0']) * SR); esfrega[j:j + len(s)] += s[: len(esfrega) - j]
poe('pincel limpa a escrita (10 linhas)', T['R0'], esfrega, 0.25)
poe('lupa: ar ao circular', T['L0'], whoosh(T['pouso'] - T['L0'], 200, 1500, 0.16, 0.8), -0.2)
poe('lupa pousa: clique', T['pouso'], clique(0.5, 2200), 0.1)
poe('destaque CASA DE DAVI: sininho', T['pouso'] + 0.125, sino(hz(74), 1.0), 0.15)
# transição: nuvem de areia; plano 3: papiro, tinta, gesto, marcador
poe('nuvem de areia (transição)', T['s3'] - 0.375, mx(whoosh(0.85, 400, 7000, 0.42, 0.45), graos(0.85, 500, 2000, 9000, 0.2, 21, lambda k: np.sin(np.pi * k))), 0.0)
poe('papiro: lâmina do mapa assenta', T['s3'] + 0.125, graos(0.5, 160, 900, 6000, 0.35, 22, lambda k: 1 - k), -0.1)
poe('pena desenha a costa', T['s3'], graos(0.75, 300, 3000, 8000, 0.08, 23), -0.2)
poe('gesto: braço do egípcio', T['a0'], whoosh(0.4, 300, 2000, 0.1, 0.5), -0.3)
poe('seta de tinta até Tel Dan', T['setaA'], graos(T['setaB'] - T['setaA'], 340, 3000, 8000, 0.09, 24), 0.2)
poe('marcador de Tel Dan', T['dan'], mx(tok(0.8, 700), sino(hz(81), 0.5)), 0.3)
# plano 4: mecanismo, trava, carimbo
poe('estela desce', T['s4'] + 0.125, whoosh(max(0.2, T['trava'] - T['s4'] - 0.125), 150, 1200, 0.22, 0.85), 0.0)
poe('pino entra na argola: claque', T['trava'], claque(0.8), 0.0)
poe('trava de bronze gira', T['trava'] + 0.125, clique(0.45, 3200), 0.15)
poe('carimbo VESTÍGIO HISTÓRICO', T['carimbo'], baque(1.0), 0.0)
poe('fio de tinta até o lugar do achado', T['trava'], graos(T['carimbo'] + 0.3 - T['trava'], 300, 3000, 8000, 0.07, 25), 0.25)
# plano 5: rolo sobe e se desenrola, título, câmera desce ao solo
poe('peças saem (ar)', T['s5'], whoosh(0.35, 400, 4000, 0.2, 0.3), 0.0)
poe('rolo de papiro se desenrola', T['rolo0'], graos(T['rolo1'] - T['rolo0'], 220, 700, 6000, 0.3, 26, lambda k: 0.6 + 0.4 * np.sin(np.pi * k)), 0.0)
poe('título aberto: pandeiro + sininho', T['rolo1'], mx(tambor_moldura(0.9, True), sino(hz(78), 0.7)), 0.0)
poe('câmera desce às camadas do solo', T['desce'], filt(ruido(FIM - T['desce'] + 0.6, 30, 220), 'lowpass', 220) * np.linspace(0, 1, int((FIM - T['desce'] + 0.6) * SR)) ** 1.5 * 0.5, 0.0)
json.dump(ac, open('audio/piloto/acertos.json', 'w'), indent=1, ensure_ascii=False)
print('efeitos:', len(ac), '| maior desvio da grade:', max(abs(a['desvio_ms']) for a in ac), 'ms')

# ---------------------------------------------------------------- 4) stems
trilha = reverb(mus.x, dur=2.2, umido=0.24) + reverb(rit.x, dur=1.0, umido=0.14)
efeitos = reverb(sfx.x, dur=0.9, umido=0.12)
sf.write('audio/piloto/stem_trilha.wav', trilha[: int(FIM * SR)].astype(np.float32), SR, subtype='FLOAT')
sf.write('audio/piloto/stem_efeitos.wav', efeitos[: int(FIM * SR)].astype(np.float32), SR, subtype='FLOAT')
print('stems gravados')
