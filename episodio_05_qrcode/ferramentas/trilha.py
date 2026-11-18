"""Trilha e efeitos sintetizados em código (sem amostras de terceiros) + mixagem.
Eletrônica minimalista em 120 BPM, lá menor. Os efeitos caem na grade de colcheias (0,25 s) da timeline,
que é a mesma lida pelo Remotion (projeto_remotion/src/timeline.json). Ruído com semente fixa (determinístico).
Uso: python3 ferramentas/trilha.py piloto   -> audio/piloto_trilha.wav, audio/piloto_sfx.wav, audio/piloto_mix.wav, beats.json"""
import sys, json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly
from pedalboard import Pedalboard, Reverb, Limiter, Compressor, HighpassFilter, LowpassFilter

SR = 48000; BPM = 120; BEAT = 60 / BPM
TL = json.load(open('projeto_remotion/src/timeline.json'))
nome = sys.argv[1] if len(sys.argv) > 1 else 'piloto'
E = dict(TL['piloto'], **TL['episodio']) if nome == 'episodio' else TL[nome]
EP = nome == 'episodio'
DUR = E['duracao']; N = int(DUR * SR) + SR // 2
def fora(t, *janelas): return all(not (a <= t < b) for a, b in janelas)
PAUSAS = [(28.25, 29.5), (38.75, 40.25)] if EP else []   # respiro antes da revelação e corte na falha
rng = np.random.default_rng(5)  # semente fixa
t_all = np.arange(N) / SR

def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, o=2): return sosfilt(butter(o, [f1, f2], 'band', fs=SR, output='sos'), x)
def put(buf, x, t, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x))
    if i < len(buf): buf[i:j] += g * x[: j - i]
def env(n, a, d, curve=4.0):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4)); return e
def midi(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- MÚSICA
mus = np.zeros(N); pad = np.zeros(N); arp = np.zeros(N); low = np.zeros(N); perc = np.zeros(N)
CH = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [48, 55, 60, 64, 67], [52, 55, 59, 64, 67]]  # Am9, Fmaj7, Cadd9, Em7
BAR = 4 * BEAT
for k in range(int(DUR / (2 * BAR)) + 2):  # cada acorde dura 2 compassos
    t0 = k * 2 * BAR; ch = CH[k % 4]; n = int(2 * BAR * SR) + SR
    tt = np.arange(n) / SR; s = np.zeros(n)
    for m in ch:
        for det in (-0.06, 0.06):
            f = midi(m + det); s += (2 * ((tt * f) % 1) - 1) * 0.5 + np.sin(2 * np.pi * f * tt)
    s = lp(s, 900) * np.minimum(1, tt / 1.2) * np.minimum(1, np.maximum(0, (2 * BAR + 0.9 - tt)) / 0.9)
    put(pad, s, t0, 0.05)
for b in range(int(DUR / BEAT) + 1):  # pulso grave: tempos 1 e 3 (coração do "sistema")
    t0 = b * BEAT
    if b % 2 or not fora(t0, PAUSAS[0] if EP else (0, 0)) or (EP and t0 > 60.5): continue
    root = CH[int(t0 // (2 * BAR)) % 4][0] - 12; n = int(0.45 * SR); tt = np.arange(n) / SR
    put(low, np.sin(2 * np.pi * midi(root) * tt) * env(n, 0.008, 0.35, 3), t0, 0.32)
ordem = E.get('ordem', 0)
for s16 in range(int(DUR / (BEAT / 4))):  # arpejo digital em semicolcheias: só depois que a ordem volta
    t0 = s16 * BEAT / 4
    if t0 < ordem: continue
    sorte = rng.random()
    if EP and (not fora(t0, *PAUSAS) or t0 > 59.9): continue
    if EP and t0 >= E['c7Ini'] and s16 % 4: continue                  # desafio: só uma nota por tempo
    ch = CH[int(t0 // (2 * BAR)) % 4]; step = [0, 2, 1, 3, 4, 2, 3, 1][s16 % 8]
    if sorte < 0.18: continue
    clim = EP and E['c5Recupera'] <= t0 < E['c5DanoB']
    f = midi(ch[step] + (24 if clim else 12)); n = int(0.16 * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * tt + 1.4 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 30)) * env(n, 0.002, 0.09, 4)
    put(arp, x, t0, 0.07 * (0.8 if s16 % 4 else 1.0) * (1.25 if (EP and E['c5Recupera'] <= t0 < E['c5DanoB']) else 1.0))
for e8 in range(int(DUR / (BEAT / 2))):  # chimbal digital discreto em colcheias (entra com o título)
    t0 = e8 * BEAT / 2
    if t0 < E.get('titulo', ordem): continue
    if EP and (not fora(t0, *PAUSAS) or t0 >= E['c7Ini']): continue
    n = int(0.05 * SR); x = hp(rng.standard_normal(n), 7000) * env(n, 0.001, 0.025, 5)
    put(perc, x, t0, 0.035 if e8 % 2 else 0.02)
if 'mergulho' in E:  # bumbo suave a partir do mergulho: a pergunta ganha corpo
    for b in range(int(E['mergulho'] / BEAT), int(DUR / BEAT) + 1):
        t0 = b * BEAT
        if EP and (not fora(t0, *PAUSAS) or t0 >= E['c7Ini']): continue
        n = int(0.3 * SR); tt = np.arange(n) / SR
        f = 50 + 90 * np.exp(-tt * 40); x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.22, 4)
        put(perc, x, t0, 0.22)
mus = pad + low + arp + perc
mus = Pedalboard([Reverb(room_size=0.5, wet_level=0.18, dry_level=0.9, damping=0.5)])(mus.reshape(1, -1).astype(np.float32), SR)[0][:N]
# entrada da música no gancho: sobe em 0,3 s (sem cortar seco), saída suave no fim
mus *= np.minimum(1, t_all / 0.3) * np.clip((DUR + 0.3 - t_all) / (1.6 if EP else 0.6), 0, 1)

# ---------------- EFEITOS
sfx = np.zeros(N)
def sweep(t0, d, f1, f2, g):
    n = int(d * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n); out = np.zeros(n); seg = 512
    for i in range(0, n, seg):
        fc = f1 * (f2 / f1) ** (i / n); out[i:i + seg] = bp(x[max(0, i - 2048):i + seg], fc * 0.8, fc * 1.25)[-len(out[i:i + seg]):]
    put(sfx, out * np.sin(np.pi * tt / d) ** 1.5, t0, g)
def click(t0, f=2400, g=0.25, d=0.03):
    n = int(d * SR); tt = np.arange(n) / SR; put(sfx, np.sin(2 * np.pi * f * tt) * env(n, 0.0005, d * 0.4, 5), t0, g)
def thump(t0, f=70, g=0.5, d=0.35):
    n = int(d * SR); tt = np.arange(n) / SR; ff = f + 60 * np.exp(-tt * 30)
    put(sfx, np.sin(2 * np.pi * np.cumsum(ff) / SR) * env(n, 0.003, d * 0.7, 4), t0, g)
def blip(t0, f, g=0.18, d=0.12):
    n = int(d * SR); tt = np.arange(n) / SR; put(sfx, (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * env(n, 0.002, d * 0.5, 4), t0, g)
def ping(t0, f=1320, g=0.16, d=0.7):  # pulso de leitura: senoide limpa com eco curto
    n = int(d * SR); tt = np.arange(n) / SR; x = np.sin(2 * np.pi * f * tt) * env(n, 0.01, d * 0.6, 5)
    put(sfx, x, t0, g); put(sfx, x, t0 + BEAT / 2, g * 0.35)
def chatter(t0, d, g=0.09):  # dados embaralhados: blips curtos em semifusas, alturas da escala
    k = 0
    while k * BEAT / 8 < d:
        if rng.random() < 0.7: blip(t0 + k * BEAT / 8, midi(rng.choice([69, 72, 76, 79, 81, 84])), g * rng.uniform(0.5, 1), 0.03)
        k += 1
def crunch(t0, g=0.3):  # dano: ruído "quantizado" curto (reduz a resolução), sem exagero
    n = int(0.28 * SR); x = rng.standard_normal(n); x = np.round(lp(x, 3000) * 3) / 3
    put(sfx, x * env(n, 0.002, 0.15, 4), t0, g); thump(t0, 55, 0.35, 0.3)

g = E['gancho']; sweep(g, 1.0, 300, 5000, 0.22); thump(g, 60, 0.55, 0.5)
click(E['assentou'], 1800, 0.22)
chatter(E['baguncaIni'], E['ordem'] - E['baguncaIni'] - 0.05, 0.08)
click(E['ordem'], 2200, 0.25); click(E['ordem'] + 0.06, 3300, 0.18); thump(E['ordem'], 80, 0.35, 0.25)
for k, nota in (('chipTexto', 76), ('chipSite', 79)):
    if k in E: blip(E[k], midi(nota), 0.15); click(E[k], 2600, 0.1)
if 'quadradinhos' in E:  # onda diagonal pelos módulos: tiques rápidos subindo de altura, em fusas
    for i in range(8): click(E['quadradinhos'] + i * BEAT / 8, 1800 + 260 * i, 0.07, 0.018)
ping(E['leitura']); sweep(E['leitura'], 0.6, 1500, 4000, 0.06)
if 'dano' in E: crunch(E['dano'])
sweep(E['mergulho'] - 0.15, 0.9, 4000, 250, 0.16); thump(E['mergulho'] + 0.5, 50, 0.3, 0.6)
if 'titulo' in E: click(E['titulo'], 1600, 0.2); click(E['titulo'] + 0.0625, 2400, 0.12)
for i in range(int(((E['c2Ini'] if EP else DUR - 0.2) - E['zigzag']) / (BEAT / 4))):  # cada palavra de código acesa = um tique
    click(E['zigzag'] + i * BEAT / 4, 3000 + 200 * (i % 4), 0.07, 0.02)
def chime(t0, notas=(76, 83), g=0.14):
    for k, m in enumerate(notas): blip(t0 + k * BEAT / 4, midi(m), g, 0.35)
def ticks(t0, d, passo=BEAT / 4, f=3000, g=0.06):
    for i in range(int(d / passo)): click(t0 + i * passo, f + 180 * (i % 4), g, 0.02)
def erro(t0):
    for k, m in enumerate((52, 47)): blip(t0 + k * BEAT / 2, midi(m), 0.2, 0.3)
if EP:
    for i in range(int((E['c2Ini'] - E['zigzag']) / (BEAT / 4)), int((E['c2Recua'] - E['zigzag']) / (BEAT / 4))):
        click(E['zigzag'] + i * BEAT / 4, 3000 + 200 * (i % 4), 0.07, 0.02)
    MAPA = {
        'c2Recua': lambda t: sweep(t, 0.9, 3000, 600, 0.08), 'c2Texto': lambda t: ticks(t, 0.75, BEAT / 4, 2600, 0.05),
        'c2Cripto': lambda t: blip(t, midi(71), 0.1), 'c2Bits': lambda t: ticks(t, 1.25, BEAT / 4, 3200, 0.05),
        'c2Nota': lambda t: click(t, 1800, 0.1), 'c2Voo': lambda t: (sweep(t, 0.5, 800, 3000, 0.08), thump(t + 0.5, 90, 0.3, 0.25), click(t + 0.5, 2600, 0.18)),
        'c2Onda': lambda t: sweep(t, 0.75, 500, 6000, 0.09), 'c2ChipTexto': lambda t: (blip(t, midi(76), 0.15), click(t, 2600, 0.1)),
        'c2ChipSite': lambda t: (blip(t, midi(79), 0.15), click(t, 2600, 0.1)),
        'c3Ini': lambda t: sweep(t, 0.75, 400, 2000, 0.06), 'c3Titulo': lambda t: (click(t, 1600, 0.2), click(t + BEAT / 8, 2400, 0.12)),
        'c3F1': lambda t: blip(t, midi(76), 0.16, 0.2), 'c3F2': lambda t: blip(t, midi(79), 0.16, 0.2), 'c3F3': lambda t: blip(t, midi(83), 0.16, 0.2),
        'c3Razao': lambda t: ticks(t, 0.625, BEAT / 4, 2200, 0.07), 'c3Celular': lambda t: (thump(t, 80, 0.25, 0.25), click(t, 2000, 0.12)),
        'c3Localizar': lambda t: [blip(t + k * BEAT / 4, midi(88), 0.1, 0.08) for k in range(3)], 'c3Orientar': lambda t: sweep(t, 0.75, 1200, 2400, 0.05),
        'c3Sinc': lambda t: (click(t, 1600, 0.15), click(t + BEAT / 8, 2000, 0.1)), 'c3Amostra': lambda t: ticks(t, 0.5, BEAT / 8, 3600, 0.04),
        'c4Conteudo': lambda t: chime(t), 'c5Suspense': lambda t: sweep(t, 1.1, 200, 900, 0.07),
        'c5Morph': lambda t: chatter(t, 0.75, 0.07), 'c5Rotulo': lambda t: (click(t, 1600, 0.2), click(t + BEAT / 8, 2400, 0.12)),
        'c5Leitura': lambda t: ping(t), 'c5DanoA': lambda t: crunch(t, 0.32), 'c5Blocos': lambda t: ticks(t + 0.15, 0.6, BEAT / 8, 2400, 0.05),
        'c5Recupera': lambda t: ([blip(t + k * BEAT / 4, midi(m), 0.11, 0.12) for k, m in enumerate((69, 72, 76, 79, 81, 84, 88, 91))], chime(t + 1.0, (84, 91), 0.13)),
        'c5DanoB': lambda t: crunch(t, 0.42), 'c5Falha': lambda t: erro(t),
        'c6Ini': lambda t: sweep(t, 0.6, 2500, 500, 0.07), 'c6Titulo': lambda t: (click(t, 1600, 0.2), click(t + BEAT / 8, 2400, 0.12)),
        'c6SemNet': lambda t: blip(t, midi(64), 0.12), 'c6Ler': lambda t: (ping(t, 1320, 0.12), chime(t + 0.5, (76, 83), 0.1)),
        'c6Link': lambda t: blip(t, midi(79), 0.12), 'c6Botao': lambda t: click(t, 2400, 0.16), 'c6Conexao': lambda t: ticks(t + 0.2, 1.5, BEAT / 4, 2800, 0.045),
        'c6Site': lambda t: chime(t, (79, 86), 0.12), 'c7Ini': lambda t: sweep(t, 0.7, 2500, 300, 0.07),
        'c7Titulo': lambda t: (click(t, 1600, 0.2), click(t + BEAT / 8, 2400, 0.12)), 'c7Qr': lambda t: (ticks(t + 0.25, 0.5, BEAT / 8, 3000, 0.05), thump(t + 0.5, 70, 0.35, 0.35), click(t + 0.5, 2200, 0.18)),
        'c7Icone': lambda t: (click(t, 2000, 0.14), click(t + BEAT / 4, 2000, 0.1)), 'c7Sublinha': lambda t: click(t, 1800, 0.1),
        'c7Assinatura': lambda t: chime(t, (69, 76), 0.1), 'c7Frase': lambda t: blip(t, midi(88), 0.07, 0.4),
    }
    for k, fn in MAPA.items(): fn(E[k])
sfx = Pedalboard([Reverb(room_size=0.25, wet_level=0.12, dry_level=1.0)])(sfx.reshape(1, -1).astype(np.float32), SR)[0][:N]

# ---------------- MIXAGEM: voz à frente, música abaixa sob a fala
voz, sr = sf.read('audio/narracao_ia.wav', dtype='float32'); voz = voz[:N]; voz = np.pad(voz, (0, N - len(voz)))
fala = np.convolve(np.abs(voz) > 0.01, np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')
# nível da música: 0,55 (-4,3 dB em relação à 1ª mixagem, que o usuário achou alta) e abaixamento de ~-9 dB sob a voz
MUSICA = 0.55
duck = 1 - 0.645 * np.clip(fala * 3, 0, 1)           # ~ -9 dB sob a voz
duck = np.convolve(duck, np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
mix = voz * 1.0 + mus * duck * MUSICA + sfx * (0.6 + 0.4 * duck)
mix = mix[: int(DUR * SR)]
m = pyln.Meter(SR)
for _ in range(4):  # -14 LUFS integrados com pico real <= -1 dBTP (limitador + medição com sobreamostragem 4x)
    mix = mix * 10 ** ((-14 - m.integrated_loudness(mix)) / 20)
    # o Limiter do pedalboard (JUCE) soma ganho igual ao limiar e satura em 0 dBFS: desfaço o ganho -> teto em -1,8 dBFS
    mix = Pedalboard([Limiter(threshold_db=-1.8, release_ms=60)])(mix.reshape(1, -1).astype(np.float32), SR)[0] * 10 ** (-1.8 / 20)
mix = mix * 10 ** ((-14 - m.integrated_loudness(mix)) / 20)  # ajuste final de ganho (só desce)
lufs = m.integrated_loudness(mix); tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1)).max())
print(f'{nome}: {lufs:.2f} LUFS, pico real {tp:.2f} dBTP')
sf.write(f'audio/{nome}_trilha.wav', mus.astype(np.float32), SR); sf.write(f'audio/{nome}_sfx.wav', sfx.astype(np.float32), SR)
sf.write(f'audio/{nome}_mix.wav', mix.astype(np.float32), SR, subtype='PCM_24')
