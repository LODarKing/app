"""Som do episódio: trilha + efeitos sintetizados em código, narração tratada, mixagem em -14 LUFS (pico real ≤ -1 dBTP).
A trilha usa a grade escolhida pelas palavras-âncora (101,5 bpm, fase 0,136 s); as batidas são MEDIDAS na trilha pronta
(audio/beats.json) e cada efeito cai no marco visual encaixado na semicolcheia medida (audio/acertos.json).
Progressão (piloto = até 12,55 s): suspense minimalista (drone + pulsos) -> relógio que acelera -> impacto discreto em 48 h ->
silêncio/sucção no colapso -> pad e pulsos voltam com a Terra -> subida tonal no recuo -> revelação da Voyager (sub + sino)
-> impactos tipográficos da data -> brilho e tom ascendente no marco.
uso: python3 -I audio/som.py [fim_s] [saida.wav]      (sem argumentos: episódio inteiro -> audio/mix.wav)"""
import json, sys, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.ndimage import uniform_filter1d, maximum_filter1d, minimum_filter1d
sys.path.insert(0, 'audio')
from timbres import SR, tv, hz, filt, env, rhodes, piano, sub, pad, reverb, pluck, sino, sub_boom, baque, tique, tecla, envio, subida, reverso, drone, tom_marco, chimbal, bumbo

TT = json.load(open('componentes_animacao/dados/tempos.json')); M = TT['marcos']
FIM = float(sys.argv[1]) if len(sys.argv) > 1 else TT['dur']
SAIDA = sys.argv[2] if len(sys.argv) > 2 else 'audio/mix.wav'
BPM, FASE = TT['bpm'], TT['fase']; B = 60 / BPM; E8 = B / 2; S16 = B / 4; S32 = B / 8; BAR = 4 * B
N = int((FIM + 3.0) * SR)
def g16(t): return FASE + round((t - FASE) / S16) * S16
class Bus:
    def __init__(s): s.x = np.zeros((N, 2))
    def put(s, sig, t0, pan=0.0, g=1.0):
        i0 = int(round(t0 * SR))
        if i0 < 0: sig = sig[-i0:]; i0 = 0
        if i0 >= N or len(sig) == 0: return
        sig = sig[: N - i0] * g; s.x[i0:i0 + len(sig), 0] += sig * np.cos((pan + 1) * np.pi / 4); s.x[i0:i0 + len(sig), 1] += sig * np.sin((pan + 1) * np.pi / 4)
mus, puls, sfx, voz = Bus(), Bus(), Bus(), Bus()

# ---------------------------------------------------------------- 1) trilha
# harmonia: Ré menor (suspense) -> Si bemol maj7 na revelação -> Fá/Lá (abre) -> Sol m9 ...
D2, A2, D3, F3, A3, E4 = 38, 45, 50, 53, 57, 64
mus.put(drone(hz(26), M['colapso'] + 0.3, 1.0, 300), 0.0, 0, 1.0)                 # Ré grave sustentado (abertura)
mus.put(drone(hz(38), M['colapso'] + 0.3, 0.7, 500), 0.0, 0, 1.0)
# pulsos em colcheia: Ré3 / Lá2 alternados, crescem até o colapso e param (silêncio de suspense)
k = 0; t = FASE
while t < M['colapso'] - 0.05:
    v = 0.45 + 0.55 * min(1, t / M['h48']); nota = D3 if k % 2 == 0 else A2
    if k % 8 == 6: nota = F3
    puls.put(pluck(hz(nota), 0.4, 1400 + 1200 * min(1, t / M['h48'])), t, -0.25 if k % 2 else 0.25, 0.55 * v); t += E8; k += 1
# impacto 48 h: piano grave em oitava + sub (discreto)
for m, gg in ((26, 0.9), (38, 0.7), (50, 0.35)): mus.put(piano(hz(m), 4.0, 0.9), g16(M['h48']), 0, gg)
# Terra: pad Ré m(add9) cresce; pulsos voltam mais graves e largos; batida de coração a partir do recuo
mus.put(pad([D3, F3, A3, E4], M['voyager'] - M['terra'] + 0.6, cut=1100, g=0.55), M['terra'] - 0.25, 0, 1.0)
mus.put(drone(hz(26), M['voyager'] - M['terra'] + 0.4, 0.8, 260), M['terra'] - 0.2, 0, 1.0)
t = g16(M['terra']); k = 0
while t < M['voyager'] - 0.05:
    puls.put(pluck(hz(D3 + (12 if k % 4 == 3 else 0)), 0.35, 1100 + 1500 * (t - M['terra']) / (M['voyager'] - M['terra'])), t, 0.3 if k % 2 else -0.3, 0.42); t += E8; k += 1
t = g16(M['afasta'])
while t < M['voyager'] - 0.1: mus.put(bumbo(0.5, 0.5), t, 0, 0.55); t += B
# Voyager: Si bemol maj7 em pad + sinos; baixo em colcheias; chimbal leve em semicolcheias
TV = g16(M['voyager'])
blocos = [(TV, [46, 53, 57, 62], 34), (FASE + np.ceil((TV + 2.0 - FASE) / BAR) * BAR, [45, 53, 57, 60], 41)]
blocos.append((blocos[1][0] + BAR, [43, 50, 53, 57, 62], 31))
for i, (t0, notas, baixo) in enumerate(blocos):
    t1 = blocos[i + 1][0] if i + 1 < len(blocos) else FIM + 2.5
    if t0 >= FIM: break
    mus.put(pad(notas, t1 - t0 + 0.8, cut=1500 + 300 * i, g=0.6), t0 - 0.05, 0, 1.0)
    t = t0
    while t < min(t1, FIM + 0.5): puls.put(pluck(hz(baixo), 0.32, 900), t, 0, 0.5); puls.put(pluck(hz(baixo + 12), 0.25, 1600), t + E8, 0.2, 0.25); t += B
t = TV + S16 * 4
while t < FIM + 0.5: puls.put(chimbal(0.55 if (round((t - FASE) / S16) % 4) == 2 else 0.3), t, 0.35, 0.8); t += S16

# ---------------------------------------------------------------- 2) batidas MEDIDAS na trilha pronta
import librosa
mono = filt(puls.x.mean(1), 'highpass', 150)[: int(FIM * SR)]          # mede nos pulsos (ataque nítido), não nos pads
on = librosa.onset.onset_detect(y=mono.astype(np.float32), sr=SR, hop_length=96, units='time', backtrack=False, delta=0.05)
idx = np.round((on - FASE) / S16); usa = np.abs(on - FASE - idx * S16) < 0.03
for _ in range(3):
    A = np.vstack([idx[usa], np.ones(usa.sum())]).T
    p16, fase = np.linalg.lstsq(A, on[usa], rcond=None)[0]; r = np.abs(on - (idx * p16 + fase)); usa = r < 0.03
per = p16 * 2                                                          # (per = colcheia, como antes)
batidas = [round(fase + k * per * 2, 3) for k in range(int((FIM - fase) / (per * 2)) + 1)]
json.dump({'bpm_medido': round(60 / (per * 2), 3), 'fase_s': round(fase, 4), 'residuo_max_ms': round(r[usa].max() * 1000, 1), 'onsets_na_grade': int(usa.sum()), 'ate_s': FIM, 'batidas': batidas}, open('audio/beats.json', 'w'), indent=1)
print(f'batidas medidas: {60 / (per * 2):.3f} bpm, fase {fase * 1000:.1f} ms, {usa.sum()} onsets na grade (resíduo máx. {r[usa].max() * 1000:.1f} ms)')
def grade(t): return fase + round((t - fase) / (per / 2)) * (per / 2)

# ---------------------------------------------------------------- 3) efeitos (cada um no marco encaixado na semicolcheia medida)
ac = []
def poe(nome, marco, sig, pan=0.0, g=1.0, desloc=0.0, div=1):
    t = M[marco] + desloc; tg = grade(t) if div == 1 else fase + round((t - fase) / (per / 4)) * (per / 4)
    if tg >= FIM: return
    sfx.put(sig, tg, pan, g); ac.append({'efeito': nome, 'marco': marco, 'evento_s': round(t, 3), 'na_grade_s': round(tg, 3), 'desvio_ms': round((tg - t) * 1000, 1)})
def poe_fim(nome, marco, sig, pan=0.0, g=1.0):          # o FIM do som cai no marco (sucções e subidas)
    tg = grade(M[marco]); t0 = tg - len(sig) / SR
    if tg >= FIM + 0.3: return
    sfx.put(sig, t0, pan, g); ac.append({'efeito': nome, 'marco': marco, 'evento_s': M[marco], 'na_grade_s': round(tg, 3), 'desvio_ms': round((tg - M[marco]) * 1000, 1), 'termina_no_marco': True})
# teclas: uma a cada fusa enquanto a mensagem é digitada
nt = int(round((M['enviar'] - 0.08 - M['digitar']) / S32))
for i in range(nt): poe('tecla %d' % (i + 1), 'digitar', tecla(0.8 + 0.4 * ((i * 7) % 3) / 2), 0.15 * ((i % 3) - 1), 1.0, desloc=i * S32, div=2)
poe('envio', 'enviar', envio(), 0.2, 1.1)
# relógio: semicolcheias, depois fusas, acelerando até 48 h
t = M['conta_ini']; i = 0
while t < M['h48'] - 0.03:
    passo = S16 if t < (M['conta_ini'] + M['h48']) / 2 else S32
    poe('relógio %d' % (i + 1), 'conta_ini', tique(0.7 + 0.5 * (t - M['conta_ini']) / (M['h48'] - M['conta_ini']), 2600 + 40 * (i % 2)), 0.1 * (-1) ** i, 1.0, desloc=t - M['conta_ini'], div=2); t += passo; i += 1
poe('impacto 48 h', 'h48', sub_boom(2.2, 64, 30), 0, 0.9); poe('impacto 48 h (corpo)', 'h48', baque(0.8, 140, 50), 0, 0.8)
poe('HORAS', 'push48', sino(hz(81), 2.2, 0.35, 0.6), 0.3, 1.0)
poe_fim('sucção (colapso)', 'colapso', reverso(1.0, 1.0, 600, 7000), 0, 1.2)
poe('ponto de luz', 'ponto', sino(hz(81), 2.5, 0.8) + sino(hz(88), 2.5, 0.4), 0.1, 1.0)
poe('Terra: abertura', 'terra', sino(hz(69), 3.0, 0.4, 0.5), -0.2, 1.0)
poe_fim('recuo da câmera (subida)', 'voyager', subida(M['voyager'] - M['afasta'] - 0.05, 110, 520, 1.0), 0, 1.0)
poe('revelação Voyager (sub)', 'voyager', sub_boom(3.2, 58, 29), 0, 1.0)
for j, m in enumerate((74, 77, 81, 88)): poe('revelação Voyager (sino %d)' % (j + 1), 'voyager', sino(hz(m), 4.0, 0.45, 0.7), -0.3 + 0.2 * j, 1.0, desloc=j * S32 * 0)
poe('data: 18', 'data_18', baque(0.75, 130, 60), -0.1, 1.0); poe('data: 18 (tique)', 'data_18', tique(0.6, 3200), -0.1, 1.0)
poe('data: novembro', 'data_nov', baque(0.5, 150, 70), 0.1, 1.0)
poe('data: 2026', 'data_2026', baque(0.9, 120, 50), 0, 1.0); poe('data: 2026 (sino)', 'data_2026', sino(hz(86), 2.5, 0.35), 0.2, 1.0)
for j, m in enumerate((86, 93, 98, 105)): poe('luz na sonda %d' % (j + 1), 'luz_sonda', sino(hz(m), 1.8, 0.18, 0.5), -0.4 + 0.25 * j, 1.0, desloc=j * S16)
poe('marco (tom ascendente)', 'marco', tom_marco(1.3), 0.2, 1.0)
json.dump(ac, open('audio/acertos.json', 'w'), indent=1, ensure_ascii=False)
print(len(ac), 'efeitos; maior desvio da grade medida:', max(abs(a['desvio_ms']) for a in ac), 'ms')

# ---------------------------------------------------------------- 4) narração (tratada) e mixagem
y, sr = sf.read('narracao_tratada.wav'); assert sr == SR
voz.put(y[: int(FIM * SR)], 0.0, 0, 1.0)
v = np.abs(voz.x).max(1); fala = (uniform_filter1d(v, int(0.05 * SR)) > 0.012).astype(float)
fala = uniform_filter1d(maximum_filter1d(fala, int(0.45 * SR)), int(0.25 * SR))
duck = 10 ** (-9 * fala / 20)
musw = (reverb(mus.x, dur=2.6, umido=0.3) + reverb(puls.x, dur=1.6, umido=0.25)) * duck[:, None]
fxw = reverb(sfx.x, dur=1.8, umido=0.22) * (10 ** (-3 * fala / 20))[:, None]
m = fala > 0.9; vr = np.sqrt(np.mean(voz.x[m] ** 2)); mr = np.sqrt(np.mean(musw[m] ** 2)) + 1e-12
gm = vr / mr * 10 ** (-16 / 20)                              # trilha ~16 dB abaixo da voz nas falas
mix = musw * gm + fxw * gm * 1.4 + voz.x
mix = filt(mix.T, 'highpass', 30).T[: int(FIM * SR)]
fo = int(0.45 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
def limitador(x, teto, look=0.005, rel=0.08):
    pk = np.abs(x).max(1); g = np.minimum(1.0, teto / np.maximum(pk, 1e-9)); g = minimum_filter1d(g, int(look * SR) * 2 + 1)
    a = np.exp(-1 / (rel * SR)); out = np.empty_like(g); cur = 1.0
    for i in range(len(g)):
        cur = g[i] if g[i] < cur else a * cur + (1 - a) * g[i]; out[i] = cur
    return x * uniform_filter1d(out, int(look * SR))[:, None]
meter = pyln.Meter(SR)
for _ in range(3): mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0); mix = limitador(mix, 10 ** (-1.6 / 20))
vz = voz.x[: len(mix)].mean(1); fundo = (musw * gm).mean(1)[: len(mix)]; mm = fala[: len(mix)] > 0.9
print(f'mix: {meter.integrated_loudness(mix):.2f} LUFS, pico {20 * np.log10(np.abs(mix).max()):.2f} dBFS; voz {20 * np.log10(np.sqrt(np.mean(vz[mm] ** 2)) / (np.sqrt(np.mean(fundo[mm] ** 2)) + 1e-12)):.1f} dB acima da trilha nas falas')
sf.write(SAIDA, mix.astype(np.float32), SR, subtype='PCM_24'); print('->', SAIDA)
sf.write(SAIDA.replace('.wav', '_trilha_efeitos.wav'), ((musw * gm + fxw * gm * 1.4)[: len(mix)] / max(1e-9, np.abs(mix).max()) * 0.5).astype(np.float32), SR, subtype='PCM_24')
