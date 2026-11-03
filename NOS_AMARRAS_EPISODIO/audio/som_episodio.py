"""Som do episódio completo (timeline.js), sintetizado em código + narração tratada do usuário.
1) trilha "moderno" (aprovada): piano elétrico, sub-grave e batida macia a 100 bpm; a batida respira na cena 8 (texto bíblico)
   e o fim resolve em Sol com o acorde sustentado sob a insígnia;
2) batidas MEDIDAS na trilha pronta -> audio/beats.json;
3) foley de corda (aprovado): atrito que segue a revelação da corda, aperto dos nós, fibras e baques leves,
   nos mesmos acertos das cenas (palavras da narração), encaixados na semicolcheia medida -> audio/acertos.json;
4) narração em cada cena (t0 + vo); a trilha abaixa sob a voz (envelope da fala, -10 dB);
5) mixagem em -14 LUFS, pico -1,5 dBFS.
Uso (a partir de NOS_AMARRAS_EPISODIO/):  python3 audio/som_episodio.py"""
import json, re, sys, unicodedata, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import resample_poly
sys.path.insert(0, 'audio')
from timbres import SR, tv, hz, filt, env, rhodes, sub, bumbo, estalo, chimbal, ruido, reverb

TL = json.loads(open('timeline.js').read().replace('const TL = ', '').rstrip().rstrip(';'))
DUR = TL['dur']; BEAT = 60 / TL['bpm']; E8 = BEAT / 2; BAR = 4 * BEAT; N = int((DUR + 2.5) * SR)
S = {c['id']: c for c in TL['cenas']}
class Bus:
    def __init__(s): s.x = np.zeros((N, 2))
    def put(s, sig, t0, pan=0.0, g=1.0):
        i0 = int(round(t0 * SR))
        if i0 < 0: sig = sig[-i0:]; i0 = 0
        if i0 >= N or len(sig) == 0: return
        sig = sig[: N - i0] * g; s.x[i0:i0 + len(sig), 0] += sig * np.cos((pan + 1) * np.pi / 4); s.x[i0:i0 + len(sig), 1] += sig * np.sin((pan + 1) * np.pi / 4)
music, ritmo, sfx, voz = Bus(), Bus(), Bus(), Bus()
def norm(s): return re.sub(r'[^\w-]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def tp(cid, p, n=0, fim=False):
    k = 0
    for w in S[cid]['palavras']:
        if norm(w[0]).startswith(norm(p)):
            if k == n: return S[cid]['t0'] + (w[2] if fim else w[1])
            k += 1
    raise KeyError((cid, p, n))
t0 = lambda cid: S[cid]['t0']; t1 = lambda cid: S[cid]['t0'] + S[cid]['dur']

# ---------------------------------------------------------------- 1) trilha
AC = [('Sol', 43), ('Mi m', 40), ('Dó', 48), ('Ré', 50)]
EXT = {'Sol': [55, 59, 62, 66, 69], 'Mi m': [52, 55, 59, 62, 66], 'Dó': [52, 55, 59, 62, 64], 'Ré': [54, 57, 62, 64, 69]}
FIM_MUS = t1('s9') - 3.4                                       # o último compasso resolve sob a insígnia
nb = int(np.ceil(FIM_MUS / BAR))
from functools import lru_cache
_rh = lru_cache(None)(lambda m, d, v: rhodes(hz(m), d, v)); _sb = lru_cache(None)(lambda f, d: sub(hz(f), d))
for b in range(nb):
    nome, b1 = AC[b % 4]; t = b * BAR
    for j, m in enumerate(EXT[nome]): music.put(_rh(m, 2.2, 0.75), t + 0.008 * j, -0.3 + 0.15 * j, 0.8)
    for j, m in enumerate(EXT[nome][1:4]): music.put(_rh(m + 12, 0.9, 0.5), t + 3 * BEAT + E8, 0.2, 0.45)
    music.put(_sb(b1 - 12 if b1 > 45 else b1, round(BAR * 0.9, 3)), t, 0, 0.42)
resp = (t0('s8') - 0.3, t1('s8') - 0.4)                         # respiro: sem batida no texto bíblico
_bb, _es, _ch = bumbo(0.5, 1.0), estalo(1.0), {True: chimbal(1.0), False: chimbal(0.6)}
for i in range(int(FIM_MUS / E8)):
    t = i * E8; k = i % 8
    if resp[0] <= t < resp[1]: continue
    g = 0.55 if t < BAR else 1.0
    if k in (0, 5): ritmo.put(_bb, t, 0, 0.85 * g)
    if k in (2, 6): ritmo.put(_es, t, 0.05, 0.9 * g)
    ritmo.put(_ch[k % 2 == 1], t, 0.25, 1.1 * g)
for j, m in enumerate(EXT['Sol']): music.put(rhodes(hz(m), 4.5, 0.7), nb * BAR + 0.01 * j, -0.3 + 0.15 * j, 0.85)
music.put(sub(hz(31), 4.0), nb * BAR, 0, 0.4)

# ---------------------------------------------------------------- 2) batidas medidas
mono = (music.x + ritmo.x).mean(1)[: int(DUR * SR)]; hop = 120
rms = np.sqrt(uniform_filter1d(mono ** 2, hop * 2)[::hop] + 1e-12)
flux = np.maximum(0, np.diff(np.log(rms), prepend=np.log(rms[0])))
cand = [k for k in range(1, len(flux) - 1) if flux[k] > flux[k - 1] and flux[k] >= flux[k + 1] and flux[k] > 0.35 * flux.max()]
on = []
for k in cand:
    t = k * hop / SR
    if not on or t - on[-1] > E8 * 0.5: on.append(t)
on = np.array(on); usa = np.abs(on - np.round(on / E8) * E8) < 0.04
for _ in range(3):
    idx = np.round(on / E8); A = np.vstack([idx[usa], np.ones(usa.sum())]).T
    per, fase = np.linalg.lstsq(A, on[usa], rcond=None)[0]; r = np.abs(on - (idx * per + fase)); usa = r < 0.04
batidas = [round(fase + k * per * 2, 3) for k in range(int(DUR / (per * 2)) + 1)]
json.dump({'bpm_medido': round(60 / (per * 2), 3), 'fase_s': round(fase, 4), 'residuo_max_ms': round(r[usa].max() * 1000, 1), 'onsets_na_grade': int(usa.sum()), 'batidas': batidas}, open('audio/beats.json', 'w'), indent=1)
print(f'bpm medido {60 / (per * 2):.3f}, fase {fase * 1000:.1f} ms, {usa.sum()} onsets na grade')
def grade(t): return fase + round((t - fase) / (per / 2)) * (per / 2)

# ---------------------------------------------------------------- 3) foley de corda
def atrito(d, g, semente, vel=lambda k: 1.0):
    R = np.random.default_rng(semente); out = np.zeros(int(d * SR) + SR // 10); t = 0.0
    while t < d:
        v = max(0.0, min(1.0, vel(t / d)))
        if v > 0.03:
            gr = ruido(R.uniform(0.004, 0.012), R.uniform(250, 600), R.uniform(1400, 2600)); gr = gr * np.hanning(len(gr)) * R.uniform(0.4, 1.0) * v
            j = int(t * SR); out[j:j + len(gr)] += gr[: len(out) - j]
        t += 1 / (25 + 140 * v)
    return out * g
def rangido(d, g, semente):
    R = np.random.default_rng(semente); out = np.zeros(int(d * SR) + 2400)
    for _ in range(int(d * 90)):
        j = int(R.uniform(0, d) * SR); n = int(0.006 * SR); gr = np.sin(2 * np.pi * R.uniform(140, 380) * tv(n / SR)) * np.hanning(n) * R.uniform(0.3, 1.0); out[j:j + n] += gr
    return filt(out, 'lowpass', 1400) * env(len(out), 0.04, 0.15) * g
def baque(g):
    t = tv(0.25); return (filt(ruido(0.25, 60, 500), 'lowpass', 400) * np.exp(-t * 28) + np.sin(2 * np.pi * 70 * t) * np.exp(-t * 22) * 0.4) * g
def fibras(d, g=1.0):
    out = np.zeros(int(d * SR)); R = np.random.default_rng(9)
    for _ in range(34):
        j = int(R.uniform(0, d - 0.03) * SR); c = ruido(0.012, 3000, 9000) * np.exp(-tv(0.012) * 400) * R.uniform(0.03, 0.1); out[j:j + len(c)] += c
    return out * env(len(out), 0.1, 0.3) * g
vel_o = lambda k: (2.1 * (1 - k) ** 2 + 0.3) / 2.4
vel_io = lambda k: 1 - (2 * k - 1) ** 2
ac = []; sem = [100]
def poe(nome, t, sig, pan=0.0):
    tg = grade(t); sfx.put(sig, tg, pan); ac.append({'efeito': nome, 'evento_s': round(t, 3), 'na_grade_s': round(tg, 3), 'desvio_ms': round((tg - t) * 1000, 1)})
def corre(nome, a, b, g=0.13, vel=vel_io, pan=0.0):
    sem[0] += 1; poe(nome, a, atrito(max(0.2, b - a), g, sem[0], vel), pan)
# cena 1: a ponta desenha o nó, corre até o título e sublinha
corre('s1 nó oito', t0('s1'), t0('s1') + 2.6, 0.16, vel_o, -0.15); poe('s1 aperto do nó', t0('s1') + 2.6, rangido(0.3, 0.05, 2), 0.1)
corre('s1 a ponta segue', tp('s1', 'eu'), tp('s1', 'especialidade') - 0.2, 0.08, vel_io, 0.2)
corre('s1 título', tp('s1', 'especialidade') - 0.2, tp('s1', 'amarras', 0, True), 0.13, vel_io, 0.25); poe('s1 corda assenta', tp('s1', 'amarras', 0, True), baque(0.2))
# cena 2: cordões se soltam, fios e fibras, voltam a torcer; trança; cartões
poe('s2 cordões se destorcem', t0('s2') + 1.0, rangido(1.0, 0.035, 4) + 0 * 1, 0.15); poe('s2 fibras', t0('s2') + 1.0, fibras(1.1, 0.6), 0.15)
poe('s2 fios se abrem', tp('s2', 'fios', 1) - 0.3, fibras(1.0, 0.45), -0.2)
poe('s2 volta a torcer', tp('s2', 'trava'), rangido(0.8, 0.04, 5), 0.1)
corre('s2 corda puxada', tp('s2', 'trancado') - 0.45, tp('s2', 'trancado') + 0.05, 0.12, vel_io, -0.3)
corre('s2 trança', tp('s2', 'trancado') - 0.1, tp('s2', 'trancado') + 1.7, 0.09, vel_io, 0.3)
for p in ('sisal', 'algodao', 'juta', 'coco'): poe('s2 cartão ' + p, tp('s2', p) - 0.1, baque(0.1), 0.2)
# cena 3: cada forma nasce guiada pela ponta
corre('s3 balanço da ponta', tp('s3', 'movimenta') - 0.3, tp('s3', 'movimenta') + 1.3, 0.08, vel_io, 0.3)
poe('s3 desfiado', tp('s3', 'extremidade'), fibras(0.8, 0.5), 0.3); poe('s3 falcaça', tp('s3', 'acabamento'), rangido(0.6, 0.03, 6), 0.3)
corre('s3 recolhe', tp('s3', 'dobrada') - 0.05, tp('s3', 'dobrada') + 0.35, 0.1, vel_io, -0.2)
corre('s3 seio', tp('s3', 'dobrada') + 0.35, tp('s3', 'seio'), 0.12, vel_o, 0.0)
corre('s3 volta', tp('s3', 'cruzou'), tp('s3', 'volta'), 0.12, vel_io, 0.1)
corre('s3 nó superior', tp('s3', 'passe'), tp('s3', 'superior'), 0.13, vel_io, -0.1); poe('s3 aperto', tp('s3', 'superior'), rangido(0.3, 0.05, 7), 0)
corre('s3 desfaz', tp('s3', 'mesmo'), tp('s3', 'mesmo') + 0.9, 0.1, vel_io, 0.1)
corre('s3 azelha', tp('s3', 'mesmo') + 0.9, tp('s3', 'azelha') + 0.2, 0.12, vel_io, -0.1); poe('s3 não corre (puxão)', tp('s3', 'corre', 1) - 0.1, rangido(0.4, 0.05, 8), 0)
poe('s3 mastro chega', tp('s3', 'amarra') - 0.2, baque(0.22), 0); corre('s3 volta do fiel', tp('s3', 'amarra') + 0.1, tp('s3', 'objeto') + 0.6, 0.13, vel_io, 0.1); poe('s3 aperto fiel', tp('s3', 'objeto') + 0.6, rangido(0.3, 0.05, 9), 0)
corre('s3 nó de fita A', tp('s3', 'curva') - 0.1, tp('s3', 'une'), 0.11, vel_io, 0.2); corre('s3 nó de fita B', tp('s3', 'une') - 0.2, tp('s3', 'pontas') + 0.4, 0.11, vel_io, -0.2)
poe('s3 cordas se encontram', tp('s3', 'emenda'), rangido(0.5, 0.04, 10), 0); poe('s3 cordões entrelaçam', tp('s3', 'emenda') + 0.2, fibras(1.0, 0.5), 0)
# cena 4: pesos caem, cordas esticam; cartões
poe('s4 carga dinâmica', tp('s4', 'dinamica') + 0.3, baque(0.3), -0.25); poe('s4 estica (dinâmica)', tp('s4', 'dinamica') + 0.3, rangido(0.9, 0.05, 11), -0.25)
poe('s4 carga estática', tp('s4', 'estatica') + 0.2, baque(0.3), 0.25); poe('s4 estica (estática)', tp('s4', 'estatica') + 0.2, rangido(0.3, 0.04, 12), 0.25)
for p in ('poliester', 'sisal', 'nylon', 'polipropileno'): poe('s4 cartão ' + p, tp('s4', p) - 0.25, baque(0.12), 0)
poe('s4 etiquetas', tp('s4', 'etiqueta') - 0.2, baque(0.12), 0)
# cena 5 e 6: itens e estações
for p in ('apodrecem', 'leves', 'umidade', 'derretem', 'escorregam', 'sol', 'biodegradavel'): poe('s5 item ' + p, tp('s5', p) - 0.2, baque(0.09), 0)
corre('s6 lupa percorre a corda', tp('s6', 'cortes') - 0.4, tp('s6', 'desgarte') + 0.2, 0.06, vel_io, 0.2)
for p in ('limpe', 'seque', 'guarde'): poe('s6 estação ' + p, tp('s6', p) - 0.2, baque(0.1), 0)
poe('s6 aposentada', tp('s6', 'critico') - 0.2, baque(0.25), 0)
# cena 7: volta do fiel e volta da ribeira nos mastros
poe('s7 mastros', t0('s7') + 0.05, baque(0.2), 0)
corre('s7 volta do fiel', tp('s7', 'fiel') - 0.2, tp('s7', 'mastro') + 0.4, 0.13, vel_io, 0.1); poe('s7 aperto fiel', tp('s7', 'mastro') + 0.4, rangido(0.3, 0.05, 13), 0)
poe('s7 paus em X', tp('s7', 'diagonal') - 0.2, baque(0.2), 0)
corre('s7 volta da ribeira', tp('s7', 'ribeira') - 0.3, tp('s7', 'abraca') + 0.5, 0.13, vel_io, -0.1); poe('s7 aproxima', tp('s7', 'aproxima') - 0.1, rangido(0.8, 0.05, 14), 0)
# cena 8: três cordões se juntam e se torcem
corre('s8 cordões chegam', t0('s8') + 0.1, tp('s8', 'cordao') - 0.2, 0.09, vel_io, 0)
poe('s8 torção', tp('s8', 'cordao') - 0.6, rangido(2.0, 0.035, 15), 0)
# cena 9: lista, quadro, frases sublinhadas pela corda
for p in ('teoria', 'pratica', 'memoria', 'demonstrar', 'quadro'): poe('s9 item ' + p, tp('s9', p) - 0.2, baque(0.1), 0)
for p in ('entenda', 'pratique', 'fortaleca'): corre('s9 sublinha ' + p, tp('s9', p), tp('s9', p) + 0.9, 0.1, vel_io, 0)
poe('s9 insígnia', tp('s9', 'uniao', 0, True) - 0.2, baque(0.2), 0)
json.dump(ac, open('audio/acertos.json', 'w'), indent=1, ensure_ascii=False)
print(len(ac), 'efeitos; maior desvio da grade:', max(abs(a['desvio_ms']) for a in ac), 'ms')

# ---------------------------------------------------------------- 4) narração e trilha recuando sob a voz
for c in TL['cenas']:
    y, sr = sf.read(c['fala']); y = y if y.ndim == 1 else y.mean(1)
    if sr != SR: y = resample_poly(y, SR, sr)
    voz.put(y, c['t0'] + c['vo'], 0, 1.0)
# presença de fala (envelope suavizado) -> a trilha recua 10 dB onde há voz, com subida/descida de ~0,3 s
v = np.abs(voz.x).max(1); envv = uniform_filter1d(v, int(0.05 * SR)); fala = (envv > 0.01).astype(float)
fala = np.maximum(fala, minimum_filter1d(fala, int(0.6 * SR)) * 0)            # (lacunas curtas entre palavras continuam "fala")
from scipy.ndimage import maximum_filter1d
fala = uniform_filter1d(maximum_filter1d(fala, int(0.5 * SR)), int(0.3 * SR))
duck = 10 ** (-10 * fala / 20)
mus = (reverb(music.x, dur=1.4, umido=0.18) + reverb(ritmo.x, dur=0.9, umido=0.12)) * duck[:, None]
fx = reverb(sfx.x, dur=0.8, umido=0.1)
# calibra a trilha para a voz ficar ~17 dB acima do fundo musical nos trechos de fala
m = fala > 0.9; vr = np.sqrt(np.mean(voz.x[m] ** 2)); mr = np.sqrt(np.mean(mus[m] ** 2)) + 1e-12
gm = vr / mr * 10 ** (-17 / 20)
mixw = mus * gm + fx * 0.9 + voz.x
mixw = filt(mixw.T, 'highpass', 35).T[: int(DUR * SR)]
fo = int(1.2 * SR); mixw[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.3
def limitador(x, teto, look=0.005, rel=0.08):
    pk = np.abs(x).max(1); g = np.minimum(1.0, teto / np.maximum(pk, 1e-9)); g = minimum_filter1d(g, int(look * SR) * 2 + 1)
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]; out[i] = cur
    return x * out[:, None]
meter = pyln.Meter(SR); lim = 10 ** (-1.5 / 20)
for _ in range(3): mixw = pyln.normalize.loudness(mixw, meter.integrated_loudness(mixw), -14.0); mixw = limitador(mixw, lim * 0.97)
# conferência: voz x fundo
vz = voz.x[: len(mixw)].mean(1); fundo = (mus * gm).mean(1)[: len(mixw)]; m = fala[: len(mixw)] > 0.9
print(f'mix: {meter.integrated_loudness(mixw):.2f} LUFS, pico {20 * np.log10(np.abs(mixw).max()):.2f} dBFS; voz {20 * np.log10(np.sqrt(np.mean(vz[m] ** 2)) / (np.sqrt(np.mean(fundo[m] ** 2)) + 1e-12)):.1f} dB acima da trilha nas falas')
sf.write('audio/mix.wav', mixw.astype(np.float32), SR, subtype='PCM_24')
