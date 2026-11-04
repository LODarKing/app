# Trilha, efeitos e mixagem do episódio completo (Mapa e Bússola, AR-021).
#   node render.mjs --acertos      (exporta audio/acertos.json: cada acerto visual com o seu tipo de efeito)
#   python3 audio/mix.py           -> audio/musica.wav, audio/sfx.wav, audio/voz_timeline.wav, audio/mix.wav (-14 LUFS, pico real <= -1 dBTP),
#                                     audio/beats.json e audio/beats.js (grade MEDIDA na trilha)
# Música: 96 BPM, harmonia e textura por cena (o acorde de cada compasso vem da cena em que o compasso começa).
# Voz: as falas restauradas entram no início de cada cena. Ducking automático: a trilha baixa ~11 dB sob a voz (envelope com ataque 40 ms, soltura 450 ms).
import json, os, subprocess, sys
import numpy as np, soundfile as sf
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, AQUI)
from sintese import SR, place, onepole_lp, hp, reverb, pad_note, pluck, taiko, shaker, sweep_noise, tone, midi, medir_batidas, write_wav, rng

TL = json.loads(open(os.path.join(RAIZ, 'timeline.js')).read().replace('const TL = ', '').rstrip().rstrip(';'))
AC = json.load(open(os.path.join(AQUI, 'acertos.json')))
DUR = TL['dur'] + 1.2
N = int(DUR * SR)
BPM = 96.0; BEAT = 60 / BPM; BAR = 4 * BEAT
cenas = TL['scenes']
def cena_em(t):
    c = cenas[0]
    for s in cenas:
        if t >= s['t0'] - 1e-6: c = s
    return c['id']

# ---------- harmonia e textura por cena ----------
# acordes (notas MIDI) por compasso, em ciclo; energia: pad, pluck, percussão
Dm, Bb, Gm, A, F, C, G, Am = [50, 53, 57, 62], [46, 50, 53, 58], [43, 50, 55, 58], [45, 52, 57, 61], [41, 48, 53, 57], [48, 52, 55, 60], [43, 50, 55, 59], [45, 52, 57, 60]
ARR = {
    's01': dict(prog=[Dm, Bb, Gm, A], pl=1.0, dr=0.8, sh=0.6),
    's02': dict(prog=[F, C, Dm, Bb], pl=1.0, dr=0.3, sh=0.5),
    's03': dict(prog=[Dm, Bb, F, C], pl=0.7, dr=0.6, sh=0.3),
    's04': dict(prog=[Gm, Dm, Bb, A], pl=1.0, dr=0.5, sh=0.7),
    's05': dict(prog=[F, Am, Bb, C], pl=0.6, dr=0.2, sh=0.3),
    's06': dict(prog=[Dm, C, Bb, C], pl=0.9, dr=0.4, sh=1.0),
    's07': dict(prog=[Bb, Gm, Dm, A], pl=0.5, dr=0.5, sh=0.2),
    's08': dict(prog=[Dm, F, C, G], pl=0.9, dr=0.5, sh=0.6),
    's09': dict(prog=[Dm, Bb, F, C], pl=1.0, dr=1.0, sh=1.0),
    's10': dict(prog=[Bb, F, C, Dm], pl=0.8, dr=0.6, sh=0.5),
}
mus_pad, mus_pl, mus_dr, mus_bass = np.zeros(N), np.zeros(N), np.zeros(N), np.zeros(N)
nbar = int(TL['dur'] / BAR) + 1
cont = {}
for b in range(nbar):
    t0 = b * BAR; sid = cena_em(t0 + 0.01); ar = ARR[sid]
    k = cont.get(sid, 0); cont[sid] = k + 1
    notas = ar['prog'][k % len(ar['prog'])]
    final = sid == 's10' and t0 > TL['dur'] - 4.5
    if final: notas = [41, 48, 53, 57, 60, 65, 69]  # Fá maior aberto no cartão final
    dur = BAR * (2.2 if final else 1.0)
    for m in notas: place(mus_pad, pad_note(midi(m), dur, att=0.35, rel=0.8, bright=1.2 if sid in ('s09', 's10') else 0.9), t0)
    place(mus_bass, pad_note(midi(notas[0] - 12), dur, att=0.05, rel=0.5, bright=0.5), t0, 1.5)
    # ostinato em colcheias (arpejo do acorde)
    arp = [notas[0] + 12, notas[2] + 12, notas[3] + 12, notas[1] + 24, notas[3] + 12, notas[2] + 12, notas[1] + 12, notas[2] + 12]
    if not final:
        for i, m in enumerate(arp):
            place(mus_pl, pluck(midi(m), 0.8, bright=1.2 if sid in ('s02', 's09') else 1.0), t0 + i * BEAT / 2, ar['pl'] * (0.7 if i % 2 == 0 else 0.5))
    # percussão: taiko no 1 (e no 3 nas cenas mais intensas), shaker em semicolcheias
    place(mus_dr, taiko(78, 1.3, 0.8 * ar['dr']), t0)
    if ar['dr'] >= 0.8: place(mus_dr, taiko(110, 0.5, 0.4 * ar['dr']), t0 + 2 * BEAT)
    for s16 in range(16):
        if final: break
        place(mus_dr, shaker(), t0 + s16 * BEAT / 4, ar['sh'] * (0.16 if s16 % 2 == 0 else 0.09))
# viradas de cena: taiko grave no compasso em que a cena começa
for c in cenas[1:]:
    place(mus_dr, taiko(70, 1.6, 0.7), round(c['t0'] / BEAT) * BEAT)
musica = reverb(0.42 * mus_pad, 2.6, 0.35) + reverb(0.45 * mus_pl, 1.8, 0.28, 3) + 0.55 * mus_bass + reverb(mus_dr, 1.4, 0.18, 5)
# respiro no "sem sinal" da cena 1 (a música recua por uma batida)
for e in AC:
    if e['tipo'] == 'erro' and e['cena'] == 's01':
        i0, i1 = int(e['t'] * SR), int((e['t'] + BEAT) * SR); musica[i0:i1] *= np.linspace(1, 0.4, i1 - i0) ** 2
musica[-int(1.0 * SR):] *= np.linspace(1, 0, int(1.0 * SR)) ** 2

# ---------- grade de batidas MEDIDA na trilha ----------
bpm_med, beats = medir_batidas(musica)
beats = beats[beats >= -0.02]
# refinamento: para cada batida estimada, o pico de ataque mais próximo (±80 ms); depois reta de mínimos quadrados (robusta)
def fluxo(x, hop=256, win=1024):
    fr = 1 + (len(x) - win) // hop; idx = np.arange(win)[None, :] + hop * np.arange(fr)[:, None]
    Sx = np.log1p(np.abs(np.fft.rfft(x[idx] * np.hanning(win), axis=1)) * 10); f = np.maximum(0, np.diff(Sx, axis=0)).sum(1)
    return f, (np.arange(len(f)) + 1) * hop / SR + win / 2 / SR
fl, tf = fluxo(musica)
picos = []
for k, tb in enumerate(beats):
    m = (tf > tb - 0.08) & (tf < tb + 0.08)
    if m.sum() > 2: picos.append((k, tf[m][np.argmax(fl[m])]))
kk, pp = np.array(picos).T
for _ in range(3):
    bfit, afit = np.polyfit(kk, pp, 1); res = np.abs(pp - (afit + bfit * kk)); ok = res < max(0.006, np.percentile(res, 80))
    kk, pp = kk[ok], pp[ok]
beats = afit + bfit * np.arange(len(beats))
bpm_med = 60 / bfit
beats = np.clip(beats, 0, None)
nom = np.arange(len(beats)) * BEAT
desvio = float(np.abs(beats - nom).max())
print(f'grade medida: {bpm_med:.2f} BPM, {len(beats)} batidas, desvio máx. da grade nominal {desvio * 1000:.1f} ms')
dd = beats - nom
print('primeiras', np.round(beats[:3], 4), '| deriva início/fim (ms)', round(dd[0] * 1000, 1), round(dd[-1] * 1000, 1))
assert desvio < 0.012, 'grade medida diverge da nominal'
bl = [round(float(x), 4) for x in beats]
json.dump({'bpm_medido': round(bpm_med, 2), 'beats': bl, 'fonte': 'medido na trilha (fluxo espectral + autocorrelação)'}, open(os.path.join(AQUI, 'beats.json'), 'w'))
open(os.path.join(AQUI, 'beats.js'), 'w').write('const BEATS = ' + json.dumps(bl) + ';\n')

# ---------- efeitos nos acertos ----------
sfx = np.zeros(N)
def env_hann(n): return np.hanning(n)
def soma(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def atraso(x, s): return np.concatenate([np.zeros(int(s * SR)), x])
def S_mergulho(): n = int(1.0 * SR); return sweep_noise(1.0, 6000, 350, 0.7) * np.exp(-np.linspace(0, 3.5, n)) * np.minimum(1, np.arange(n) / (0.01 * SR))
def S_deslize(): return sweep_noise(0.35, 900, 4000, 1.0) * env_hann(int(0.35 * SR))
def S_traco(): n = int(0.5 * SR); return hp(rng.standard_normal(n), 2500) * (0.5 + 0.5 * np.sin(np.linspace(0, 40, n)) ** 2) * env_hann(n) * 0.25
def S_papel():
    n = int(0.9 * SR); pap = hp(rng.standard_normal(n), 1200) * np.exp(-np.linspace(0, 5, n)); crk = np.zeros(n)
    for _ in range(22): i = int(rng.uniform(0, 0.75) * SR); crk[i:i + 240] += rng.standard_normal(240) * np.exp(-np.arange(240) / 50)
    return onepole_lp(pap * 0.6 + crk, 6000)
def S_marca(): n = int(0.3 * SR); return onepole_lp(hp(rng.standard_normal(n), 1800) * np.sin(np.linspace(0, np.pi, n)) ** 2, 7000) * 0.5
def S_pop(): return soma(tone(880, 0.12, 'sine', 30) * 0.5, tone(1320, 0.06, 'sine', 60) * 0.25)
def S_tique(): return tone(1400, 0.06, 'sq', 70) * 0.3
def S_tiquinho(): return tone(2100, 0.04, 'sine', 90) * 0.3
def S_giro(): return soma(sweep_noise(0.45, 600, 2600, 1.0) * env_hann(int(0.45 * SR)) * 0.6, tone(2400, 0.03, 'sine', 120) * 0.3)
def S_confirma(): return soma(tone(988, 0.16, 'sine', 18) * 0.35, atraso(tone(1318, 0.22, 'sine', 14) * 0.35, 0.09))
def S_erro(): return soma(tone(440, 0.16, 'sq', 16) * 0.22, atraso(tone(330, 0.22, 'sq', 12) * 0.22, 0.17))
def S_risco(): n = int(0.7 * SR); return hp(rng.standard_normal(n), 3000) * (0.6 + 0.4 * np.sin(np.linspace(0, 70, n))) * env_hann(n) * 0.18
def S_passo(): return soma(*[atraso(onepole_lp(rng.standard_normal(int(0.08 * SR)), 900) * np.exp(-np.linspace(0, 6, int(0.08 * SR))), k * 0.12) for k in range(4)]) * 0.6
def S_subida(): n = int(1.25 * SR); return sweep_noise(1.25, 300, 7000, 1.6) * np.linspace(0, 1, n) ** 2 * 0.5
def S_final(): return soma(taiko(70, 2.0, 1.0), tone(1760, 1.2, 'sine', 2.5) * 0.12, tone(2637, 1.2, 'sine', 3.0) * 0.08)
GER = {'mergulho': S_mergulho, 'deslize': S_deslize, 'traco': S_traco, 'papel': S_papel, 'marca': S_marca, 'pop': S_pop, 'tique': S_tique,
       'tiquinho': S_tiquinho, 'giro': S_giro, 'confirma': S_confirma, 'erro': S_erro, 'risco': S_risco, 'passo': S_passo, 'final': S_final,
       'baque': lambda: soma(taiko(120, 0.5, 0.9), tone(1800, 0.05, dec=90) * 0.25), 'bipe1': lambda: tone(1318, 0.12, 'sq', 22) * 0.3,
       'bipe2': lambda: tone(988, 0.12, 'sq', 22) * 0.3, 'bussola_entra': lambda: soma(S_deslize() * 0.8, tone(2400, 0.03, 'sine', 120) * 0.4),
       'interroga1': lambda: tone(660, 0.18, 'sine', 14) * 0.35, 'interroga2': lambda: tone(825, 0.18, 'sine', 14) * 0.35, 'interroga3': lambda: tone(1031, 0.18, 'sine', 14) * 0.35}
for e in AC:
    tp = e['tipo']
    if tp == 'subida_fim': place(sfx, S_subida(), e['t'] - 1.25, e.get('ganho', 1)); continue
    if tp == 'deslize' or tp == 'mergulho': place(sfx, GER[tp](), e['t'] - (0.2 if tp == 'deslize' else 0), e.get('ganho', 1)); continue
    if tp == 'marca': place(sfx, GER[tp](), e['t'] - 0.12, e.get('ganho', 1)); continue
    place(sfx, GER[tp](), e['t'], e.get('ganho', 1))
sfx = reverb(sfx, 0.9, 0.15, 11)

# ---------- voz (falas restauradas no início de cada cena) ----------
voz = np.zeros(N)
for c in cenas:
    x, sr = sf.read(os.path.join(RAIZ, c['voz'])); assert sr == SR
    place(voz, x, c['t0'])

# ---------- ducking ----------
def envelope(x, att=0.04, rel=0.45):
    w = int(0.02 * SR); e = np.sqrt(np.convolve(x ** 2, np.ones(w) / w, mode='same'))
    # segue o pico com ataque/soltura (em blocos de 10 ms)
    hop = int(0.01 * SR); nb = len(e) // hop; b = e[:nb * hop].reshape(nb, hop).max(1); out = np.zeros(nb); a_a = np.exp(-0.01 / att); a_r = np.exp(-0.01 / rel)
    for i in range(1, nb): out[i] = a_a * out[i - 1] + (1 - a_a) * b[i] if b[i] > out[i - 1] else a_r * out[i - 1] + (1 - a_r) * b[i]
    return np.repeat(out, hop)[:len(x)].tolist() + [0.0] * (len(x) - nb * hop)
ev = np.array(envelope(voz)); ev = ev / (np.percentile(ev[ev > 1e-4], 90) + 1e-9)
duck_db = -11.0 * np.clip(ev, 0, 1)
gm = 10 ** (duck_db / 20)

# ---------- níveis e loudness ----------
import pyloudnorm as pyln
meter = pyln.Meter(SR)
def lufs(x): return meter.integrated_loudness(x)
voz = voz * 10 ** ((-16.0 - lufs(voz)) / 20)
musica = musica * 10 ** ((-25.0 - lufs(musica)) / 20)     # leito: ~9 dB abaixo da voz antes do ducking
sfx = sfx * 10 ** ((-27.0 - lufs(sfx)) / 20)
musica_d = musica * gm
d = int(0.011 * SR)
def st(x, larg=0.0): r = np.concatenate([np.zeros(d), x[:-d]]); return np.stack([x, (1 - larg) * x + larg * r], 1)
mix = st(voz) + st(musica_d, 0.35) + st(sfx)
write_wav(os.path.join(AQUI, 'musica.wav'), st(musica, 0.35) / max(1e-9, np.abs(musica).max()) * 0.9)
write_wav(os.path.join(AQUI, 'sfx.wav'), st(sfx) / max(1e-9, np.abs(sfx).max()) * 0.9)
sf.write(os.path.join(AQUI, 'voz_timeline.wav'), voz.astype(np.float32), SR, subtype='FLOAT')
raw = os.path.join(AQUI, '_mix_bruto.wav'); sf.write(raw, (mix / max(1.0, np.abs(mix).max() / 0.95)).astype(np.float32), SR, subtype='FLOAT')
out = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-2.2:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(out[out.rindex('{'):out.rindex('}') + 1])
af = (f"loudnorm=I=-14:TP=-2.2:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true:print_format=json")
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', raw, '-af', af, '-ar', str(SR), '-c:a', 'pcm_s16le', os.path.join(AQUI, 'mix.wav')], check=True)
os.remove(raw)
print('mix.wav pronto; antes da normalização:', js['input_i'], 'LUFS,', js['input_tp'], 'dBTP')
