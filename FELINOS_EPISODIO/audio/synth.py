"""Som do episódio completo (9 min 06 s, 120 bpm). Rodar a partir de FELINOS_EPISODIO/. Etapas:
1) trilha sintetizada por trechos (cada cena tem seu clima), sempre na grade global de 120 bpm;
2) batidas MEDIDAS na trilha pronta com librosa -> audio/beats.json;
3) efeitos: cada onomatopeia desenhada na tela ganha o seu som, e os eventos das cenas (cortes, chegadas,
   revelações) ganham acentos; tudo encaixado na semicolcheia da batida medida mais próxima -> audio/acertos.json;
4) vozes restauradas nos tempos da timeline; a trilha abaixa 9,5 dB sob as falas;
5) mixagem a -14 LUFS, pico -2,6 dBFS (fica abaixo de -1 dBTP depois do AAC)."""
import json, sys, numpy as np, soundfile as sf, pyloudnorm as pyln, librosa
from pedalboard import Pedalboard, Reverb, HighpassFilter, Compressor
sys.path.insert(0, 'audio')
import instruments as I
from instruments import SR, tv, env, hz, pluck, celesta, drum, harp, flute, horn, marimba, glock, timpani, noise, whoosh, meow, roar, pop, step, birds, sparkle, boing, heartbeat, mx

TL = json.loads(open('timeline.js').read().replace('const TL = ', '').rstrip().rstrip(';'))
DUR = TL['dur']; N = int(DUR * SR); BEAT = 60 / TL['bpm']; E8 = BEAT / 2
I.N = N
# instrumentos longos repetem muito (mesma nota, mesma duração): memoriza para sintetizar uma vez só
from functools import lru_cache
_strings, _choir = lru_cache(None)(lambda m, d, cut, a, r: I.strings(m, d, cut, a, r)), lru_cache(None)(lambda m, d: I.choir(m, d))
def strings(m, d, cut=1800, a=0.25, r=0.4): return _strings(m, round(d, 2), cut, round(a, 2), r)
def choir(m, d): return _choir(m, round(d, 2))
_ens, _ch2 = lru_cache(None)(lambda m, d, cut, a, r: I.ensemble(m, d, cut, a, r)), lru_cache(None)(lambda m, d, v: I.choir2(m, d, v))
def ensemble(m, d, cut=2200, a=0.5, r=0.6): return _ens(m, round(d, 2), cut, round(a, 2), round(r, 2))
def choir2(m, d, v='a'): return _ch2(m, round(d, 2), v)
music, sfx, amb, vox = I.Bus(), I.Bus(), I.Bus(), I.Bus()
S = {s['id']: s for s in TL['scenes']}
def T(sid, key, i=None):
    """tempo global de um evento da cena"""
    v = S[sid]['ev'][key]; return S[sid]['t0'] + (v[i] if i is not None else v)
def t0(sid): return S[sid]['t0']
def t1(sid): return S[sid]['t0'] + S[sid]['dur']
def eighths(a, b):
    """índices de colcheia da grade GLOBAL entre os tempos a e b (o tempo 0 cai na batida)"""
    return range(int(np.ceil(a / E8 - 1e-6)), int(np.floor(b / E8 - 1e-6)) + 1)

# ================================================================= 1) trilha: blocos de construção
D_MAJ = [(50, [62, 66, 69]), (47, [62, 66, 71]), (43, [62, 67, 71]), (45, [61, 64, 69])]          # Ré  Si-m  Sol  Lá
D_MIN = [(50, [62, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67]), (45, [61, 64, 69])]          # Ré-m  Si♭  Dó  Lá
G_MAJ = [(43, [59, 62, 67]), (40, [59, 64, 67]), (48, [60, 64, 67]), (50, [62, 66, 69])]          # Sol  Mi-m  Dó  Ré
F_MAJ = [(41, [60, 65, 69]), (46, [58, 62, 65]), (48, [60, 64, 67]), (41, [60, 65, 69])]          # Fá  Si♭  Dó  Fá
def chord_at(prog, i, per=16):
    """acorde da progressão para a colcheia global i (troca a cada `per` colcheias = 2 compassos)"""
    return prog[(i // per) % len(prog)]
def pad(a, b, prog, g=0.1, cut=1600, per=16):
    """cordas longas seguindo a progressão (um acorde por bloco)"""
    i = eighths(a, b)
    if not len(i): return
    k = i[0]
    while k * E8 < b:
        k2 = max(k + 1, min((k // per + 1) * per, int(np.ceil(b / E8 - 1e-6)))); d = min(k2 * E8, b) - k * E8 + 0.35; root, ch = chord_at(prog, k, per)
        for j, m in enumerate([root] + ch): music.put(ensemble(m, d, cut, 0.35, 0.4) * (g * 1.3 if j == 0 else g), k * E8, -0.4 + 0.27 * j)
        k = k2
def pizz(a, b, prog, g=1.0, per=16, bass=True, pat=(0, 1, 2, 1, 2, 1, 0, 2), inst='pluck'):
    """arpejo em colcheias (pizzicato, marimba ou harpa) + baixo no tempo"""
    for i in eighths(a, b):
        root, ch = chord_at(prog, i, per); n = ch[pat[i % len(pat)]] + (12 if (i // 4) % 2 and i % 4 == 3 else 0)
        note = pluck(hz(n), 0.45) * 0.9 if inst == 'pluck' else marimba(hz(n + 12), 0.5) * 0.8 if inst == 'marimba' else harp(hz(n), 1.6) * 0.55
        music.put(note * g, i * E8, -0.3 + 0.6 * (i % 2))
        if bass and i % 2 == 0: music.put(pluck(hz(root - 12 + (7 if i % 8 == 4 else 0)), 0.8, 1500) * 1.4 * g, i * E8, 0)
def taiko(a, b, prog, g=1.0, per=16, busy=1):
    """aventura: tambores no tempo, baixo em colcheias, acentos a cada compasso"""
    for i in eighths(a, b):
        root, _ = chord_at(prog, i, per)
        if i % 2 == 0: music.put(drum(62 if i % 4 == 0 else 84, 0.5, 0.25, 8) * 0.7 * g, i * E8, 0.15 * (-1) ** (i // 2))
        elif busy and i % 4 == 3: music.put(drum(110, 0.25, 0.4, 14) * 0.22 * g, i * E8, -0.2)
        music.put(I.filt(I.saw(hz(root - 12), 0.24), 'lowpass', 450) * env(int(0.24 * SR), 0.005, 0.1) * 0.3 * g, i * E8, 0)
        if busy > 1 and i % 2: music.put(drum(180, 0.12, 0.6, 30) * 0.12 * g, i * E8, 0.4)
def bells(a, b, prog, g=0.16, every=4, per=16, seed=0):
    """celesta pontuando a melodia do acorde (a cada `every` colcheias)"""
    r = np.random.default_rng(seed)
    for i in eighths(a, b):
        if i % every: continue
        _, ch = chord_at(prog, i, per); music.put(celesta(hz(ch[r.integers(0, 3)] + 12), 1.0) * g, i * E8, r.uniform(-0.5, 0.5))
def groove(a, b, prog, g=1.0, per=16):
    """passarela: bumbo/palma, baixo sincopado, acordes curtos no contratempo"""
    for i in eighths(a, b):
        root, ch = chord_at(prog, i, per)
        if i % 4 == 0: music.put(drum(55, 0.35, 0.1, 10) * 0.9 * g, i * E8, 0)
        if i % 4 == 2: music.put(mx(noise(0.12, 900, 4000) * np.exp(-tv(0.12) * 35) * 0.6, drum(200, 0.1, 0.5, 30) * 0.2) * g, i * E8, 0.1)
        if i % 8 in (0, 3, 6): music.put(pluck(hz(root - 12), 0.4, 1200) * 1.6 * g, i * E8, 0)
        if i % 2: [music.put(pluck(hz(m), 0.18, 6000) * 0.5 * g, i * E8, -0.4 + 0.4 * j) for j, m in enumerate(ch)]
        music.put(noise(0.04, 7000, 12000) * np.exp(-tv(0.04) * 80) * 0.12 * g, i * E8, 0.5)   # chimbal
def sacred(a, b, prog, g=1.0, per=16, voices=True):
    """trechos bíblicos: cordas e coro longos, tímpano suave a cada 2 compassos"""
    pad(a, b, prog, 0.12 * g, 1400, per)
    if voices:
        k = eighths(a, b)
        for i in k:
            if i % per == 0: _, ch = chord_at(prog, i, per); [music.put(choir2(m, min(per * E8, b - i * E8) + 0.6, 'o' if j % 2 else 'a') * 0.5 * g, i * E8, -0.25 + 0.25 * j) for j, m in enumerate(ch)]
    for i in eighths(a, b):
        if i % per == 0: music.put(timpani(hz(chord_at(prog, i, per)[0] - 12), 1.8) * 0.45 * g, i * E8, 0)
def stab(t, prog_chord, g=0.5):
    """acorde curto de orquestra (para revelações)"""
    root, ch = prog_chord
    for j, m in enumerate([root, root + 12] + ch + [ch[0] + 12]): music.put(strings(m, 0.6, 3400, 0.01, 0.4) * g * (1.4 if j < 2 else 1), t, -0.4 + 0.15 * j)
    for j, m in enumerate(ch): music.put(horn(m, 0.7) * g * 0.9, t, -0.2 + 0.2 * j)
    music.put(timpani(hz(root - 12), 1.2) * g * 1.2, t, 0)
def rise(a, b, g=0.6, m=50):
    """cordas subindo de intensidade até b (preparação)"""
    d = b - a; s = strings(m, d, 3200, d * 0.8, 0.05); music.put(s * np.linspace(0.05, 1, len(s)) * g, a, 0)

# ================================================================= melodias (tema recorrente do episódio)
# tema "Felinos" (Ré maior, 8 compassos): (batida, nota MIDI, duração em batidas)
THEME = [(0, 74, 1), (1, 78, 0.5), (1.5, 81, 0.5), (2, 83, 1), (3, 81, 1), (4, 78, 1.5), (5.5, 76, 0.5), (6, 74, 2), (8, 79, 1), (9, 78, 0.5), (9.5, 76, 0.5), (10, 78, 1), (11, 81, 1), (12, 76, 4),
         (16, 74, 1), (17, 78, 0.5), (17.5, 81, 0.5), (18, 86, 2), (20, 85, 1), (21, 83, 1), (22, 81, 2), (24, 79, 1), (25, 83, 1), (26, 81, 1), (27, 78, 1), (28, 74, 4)]
THEME_CH = [D_MAJ[0], D_MAJ[1], D_MAJ[2], D_MAJ[3], D_MAJ[0], (42, [61, 66, 69]), (43, [62, 67, 71]), D_MAJ[0]]   # um acorde por compasso
SACRED = [(0, 69, 2), (2, 69, 1), (3, 70, 1), (4, 69, 2), (6, 67, 2), (8, 65, 2), (10, 64, 2), (12, 65, 2), (14, 67, 1), (15, 69, 1), (16, 74, 4), (20, 73, 2), (22, 74, 6)]
PASTORAL = [(0, 79, 1.5), (1.5, 81, 0.5), (2, 83, 2), (4, 81, 1), (5, 79, 1), (6, 76, 2), (8, 74, 1), (9, 76, 1), (10, 79, 1.5), (11.5, 81, 0.5), (12, 79, 4)]
def onbeat(t): return round(t / BEAT) * BEAT
def melody(t0, notes, inst, g=0.5, pan=0.0, b0=0, b1=99, tr=0):
    """toca as notas entre as batidas b0 e b1 da melodia a partir de t0 (na batida); legato com leve sobreposição"""
    t0 = onbeat(t0)
    for b, m, d in notes:
        if b < b0 or b >= b1: continue
        dur = d * BEAT * 1.05; tt = t0 + (b - b0) * BEAT; m += tr
        sig = flute(m, dur) if inst == 'flute' else horn(m - 12, dur) if inst == 'horn' else glock(hz(m + 12), 1.4) * 0.8 if inst == 'glock' else harp(hz(m), 2.0) * 0.7
        music.put(sig * g, tt, pan)
def harpArp(t0, bars, g=0.35, chords=THEME_CH, bar0=0):
    """harpa arpejando o acorde de cada compasso (colcheias subindo)"""
    t0 = onbeat(t0)
    for k in range(bars):
        root, ch = chords[(bar0 + k) % len(chords)]
        for q, m in enumerate([root, ch[0], ch[1], ch[2], ch[0] + 12, ch[2], ch[1], ch[0]]): music.put(harp(hz(m), 1.8) * g, t0 + k * 4 * BEAT + q * E8, -0.4 + 0.1 * q)

# ================================================================= trilha por cena
# s01 — gancho: pedal grave + batimentos (efeitos); salto e aventura; rugido; tutti na escrita do título
pad(0, T('s01', 'leap'), [(38, [50, 57, 62])], 0.13, 700, per=64)
bells(T('s01', 'reveal'), T('s01', 'crouch'), D_MAJ, 0.13, 4, seed=1)
taiko(T('s01', 'leap'), T('s01', 'cut5') - 0.01, D_MIN, 0.9)
rise(T('s01', 'raise'), T('s01', 'roar'), 0.5)
stab(T('s01', 'cut5'), D_MAJ[0], 0.45); pad(T('s01', 'cut5'), t1('s01'), D_MAJ, 0.1, 2400)
for k, m in enumerate([74, 78, 81, 86, 81, 78, 74]): music.put(celesta(hz(m), 1.0) * 0.18, T('s01', 'write') + k * E8, 0.2)
# s02 — o piloto aprovado (mesmos clichês e mesma estrutura, agora na grade global)
music.put(strings(38, T('s02', 'cutB') - t0('s02') + 0.2, 700, 0.3, 0.2) * 0.8, t0('s02'), 0)
for k, m in enumerate([74, 78, 81, 86, 90]): music.put(celesta(hz(m), 0.9) * 0.18, T('s02', 'coverOpen') + k * BEAT / 4, -0.3 + 0.15 * k)
pizz(T('s02', 'cutB'), T('s02', 'cutC') - 0.01, D_MAJ, 1.0, pat=(0, 1, 2, 1, 2, 1, 2, 1))
pad(T('s02', 'cutB'), T('s02', 'cutC'), D_MAJ, 0.09, 1500)
rise(T('s02', 'crouch'), T('s02', 'portal'), 0.6)
taiko(T('s02', 'portal'), T('s02', 'cutFam') - 0.01, D_MIN, 1.0)
for m in (38, 50, 57, 62, 66, 69): music.put(strings(m, t1('s02') - T('s02', 'cutFam') + 0.3, 2800, 0.8, 1.0) * (0.24 if m < 50 else 0.14), T('s02', 'cutFam'), (m % 5 - 2) * 0.15)
for m in (62, 66, 69): music.put(choir(m, t1('s02') - T('s02', 'pingoLand')) * 0.3, T('s02', 'pingoLand'), (m - 66) * 0.08)
for k, tf in enumerate(S['s02']['ev']['fam']): music.put(celesta(hz([81, 86, 90][k]), 1.0) * 0.22, t0('s02') + tf, -0.3 + 0.3 * k)
# s03 — família Felidae: árvore (estudo), desfile (aventura leve), Lara e a borboleta (estudo + celesta)
pizz(t0('s03'), T('s03', 'parade') - 0.01, D_MAJ, 0.9); pad(t0('s03'), T('s03', 'parade'), D_MAJ, 0.07)
taiko(T('s03', 'parade'), T('s03', 'lara') - 0.01, D_MAJ, 0.75, busy=0); pad(T('s03', 'parade'), T('s03', 'lara'), D_MAJ, 0.09, 2200)
pizz(T('s03', 'lara'), t1('s03') - 0.01, G_MAJ, 0.85, inst='harp'); bells(T('s03', 'butterfly'), t1('s03'), G_MAJ, 0.14, 2, seed=3)
# s04 — patas: ponte na ponta dos pés (pizz em Ré menor, contido), congela, ciência (estudo), guepardo (aventura rápida)
pizz(t0('s04'), T('s04', 'freeze') - 0.01, D_MIN, 0.7, bass=True, pat=(0, 2, 1, 2))
pizz(T('s04', 'digi'), T('s04', 'cheetah') - 0.01, D_MAJ, 0.8); pad(T('s04', 'digi'), T('s04', 'cheetah'), D_MAJ, 0.06)
bells(T('s04', 'lara'), T('s04', 'cheetah'), D_MAJ, 0.12, 8, seed=4)
taiko(T('s04', 'cheetah'), T('s04', 'grip') - 0.01, D_MIN, 1.0, busy=2); pad(T('s04', 'cheetah'), T('s04', 'grip'), D_MIN, 0.1, 2600)
pizz(T('s04', 'grip'), t1('s04') - 0.01, D_MAJ, 0.8)
# s05 — olhos: crepúsculo misterioso, binóculo e pupilas (estudo), bote no fim
pad(t0('s05'), T('s05', 'binoc'), D_MIN, 0.1, 1100); bells(t0('s05'), T('s05', 'binoc'), D_MIN, 0.12, 6, seed=5)
pizz(T('s05', 'binoc'), T('s05', 'pounce') - 0.01, D_MAJ, 0.8); pad(T('s05', 'tapetum'), T('s05', 'split'), D_MAJ, 0.07, 1800)
rise(T('s05', 'lara') + 2, T('s05', 'pounce'), 0.45); stab(T('s05', 'pounce'), D_MAJ[0], 0.4)
# s06 — dentes: tigela (estudo), mandíbula no escuro (Ré menor, tambores suaves), crianças (estudo)
pizz(t0('s06'), T('s06', 'split') - 0.01, G_MAJ, 0.8)
taiko(T('s06', 'split'), T('s06', 'kids') - 0.01, D_MIN, 0.55, busy=0); pad(T('s06', 'split'), T('s06', 'kids'), D_MIN, 0.08, 1200)
pizz(T('s06', 'kids'), t1('s06') - 0.01, D_MAJ, 0.85)
# s07 — bigodes: estudo; folículo em clima de descoberta (pad + celesta)
pizz(t0('s07'), T('s07', 'follicle') - 0.01, D_MAJ, 0.8)
pad(T('s07', 'follicle'), T('s07', 'through'), G_MAJ, 0.09, 1500); bells(T('s07', 'follicle'), T('s07', 'through'), G_MAJ, 0.13, 4, seed=7)
pizz(T('s07', 'through'), t1('s07') - 0.01, D_MAJ, 0.85)
# s08 — ouvidos: folha (silêncio quase total), ondas e anatomia (pad + celesta), relaxa (ronrom, só celesta)
bells(t0('s08'), T('s08', 'waves'), D_MAJ, 0.08, 8, seed=8)
pad(T('s08', 'waves'), T('s08', 'relax'), D_MAJ, 0.09, 1300); bells(T('s08', 'waves'), T('s08', 'relax'), D_MAJ, 0.12, 4, seed=9)
pad(T('s08', 'relax'), t1('s08'), G_MAJ, 0.07, 1000)
# s09 — desfile das raças: groove de passarela; cada raça muda a cor do acorde
for k, (a, b) in enumerate([(t0('s09'), T('s09', 'persa')), (T('s09', 'persa'), T('s09', 'siames')), (T('s09', 'siames'), T('s09', 'maine')), (T('s09', 'maine'), T('s09', 'angora')), (T('s09', 'angora'), T('s09', 'photo'))]):
    groove(a, b - 0.01, [D_MAJ, F_MAJ, G_MAJ, D_MIN, D_MAJ][k], 0.75 if k else 0.9)
for i in eighths(T('s09', 'photo'), T('s09', 'flash') - 0.01): [music.put(drum(190, 0.08, 0.7, 40) * (0.12 + 0.25 * (i * E8 - T('s09', 'photo')) / (T('s09', 'flash') - T('s09', 'photo'))), i * E8 + q * E8 / 2, 0.1) for q in range(2)]   # rufar até o clique
pad(T('s09', 'photo'), T('s09', 'flash'), [(50, [62, 66, 69])], 0.06, 1400, per=64)
stab(T('s09', 'flash'), D_MAJ[0], 0.45); pad(T('s09', 'flash'), t1('s09'), D_MAJ, 0.08)
# s10 — companheiros: estudo caloroso em Sol, carinho no fim com celesta
pizz(t0('s10'), T('s10', 'pet') - 0.01, G_MAJ, 0.8); pad(T('s10', 'indoor'), T('s10', 'pet'), G_MAJ, 0.06)
pad(T('s10', 'pet'), t1('s10'), G_MAJ, 0.08, 1300); bells(T('s10', 'pet'), t1('s10'), G_MAJ, 0.13, 2, seed=10)
# s11 — expedição: mapa e sete habitats (aventura, cada habitat com a sua progressão)
taiko(t0('s11'), T('s11', 'sp', 0) - 0.01, D_MAJ, 0.6, busy=0); pad(t0('s11'), T('s11', 'sp', 0), D_MAJ, 0.08, 2000)
sp = S['s11']['ev']['sp'] + [S['s11']['ev']['fold']]
for k in range(7):
    a, b = t0('s11') + sp[k], t0('s11') + sp[k + 1]; prog = [D_MIN, D_MAJ, G_MAJ, D_MIN, F_MAJ, D_MAJ, G_MAJ][k]
    taiko(a, b - 0.01, prog, 0.7, busy=k % 2 + 1); pad(a, b, prog, 0.08, 2000)
stab(T('s11', 'fold'), D_MAJ[0], 0.35); bells(T('s11', 'fold'), t1('s11'), D_MAJ, 0.12, 2, seed=11)
# s12 — desafio: vinheta, perguntas (tique-taque, pizz em Fá), revelações (acordes), corrida (aventura rápida), coroa (fanfarra)
for k, ch in enumerate([F_MAJ[0], F_MAJ[1], F_MAJ[2], F_MAJ[0]]): stab(t0('s12') + k * BEAT / 2 + (0.25 if k == 3 else 0), ch, 0.3 + 0.08 * k)   # vinheta "Desafio Felino!"
for k, m in enumerate([77, 81, 84, 89]): music.put(celesta(hz(m), 0.8) * 0.2, t0('s12') + 1.5 + k * E8 / 2, -0.3 + 0.2 * k)
for (a, b) in [(T('s12', 'q1'), T('s12', 'reveal1')), (T('s12', 'q2'), T('s12', 'reveal2')), (T('s12', 'q3'), T('s12', 'run'))]:
    pizz(a, b - 0.01, F_MAJ, 0.7, bass=True, pat=(0, 2), inst='marimba')
for (a, b) in [(T('s12', 'reveal1'), T('s12', 'q2')), (T('s12', 'reveal2'), T('s12', 'q3'))]:
    pizz(a, b - 0.01, D_MAJ, 0.8); pad(a, b, D_MAJ, 0.06)
taiko(T('s12', 'run'), T('s12', 'q4') - 0.01, D_MAJ, 1.0, busy=2); pad(T('s12', 'run'), T('s12', 'q4'), D_MAJ, 0.08, 2600)
pizz(T('s12', 'q4'), T('s12', 'crown') - 0.01, F_MAJ, 0.7, pat=(0, 2), inst='marimba')
pad(T('s12', 'crown'), T('s12', 'pride'), D_MAJ, 0.12, 3000); bells(T('s12', 'crown'), T('s12', 'pride'), D_MAJ, 0.15, 2, seed=12)
taiko(T('s12', 'pride'), T('s12', 'roar') - 0.01, D_MAJ, 0.8, busy=1); pad(T('s12', 'pride'), T('s12', 'roar'), D_MAJ, 0.09, 2400)
rise(T('s12', 'males'), T('s12', 'roar'), 0.5); stab(T('s12', 'roar'), D_MAJ[0], 0.45)
# s13 — o Diário dourado e a Bíblia: pad quente, celesta, coro entra quando a Bíblia aparece
pad(t0('s13'), T('s13', 'bible'), D_MAJ, 0.08, 1300); bells(t0('s13'), T('s13', 'bible'), D_MAJ, 0.12, 4, seed=13)
sacred(T('s13', 'bible'), t1('s13'), D_MIN, 0.8)   # combina com o coral sacro (Ré menor)
# s14 — Sansão: Ré menor solene; vitória em Ré maior
sacred(t0('s14'), T('s14', 'won'), D_MIN, 1.0); taiko(T('s14', 'lion'), T('s14', 'won') - 0.01, D_MIN, 0.5, busy=0)
sacred(T('s14', 'won'), t1('s14'), D_MAJ, 0.9)
# s15 — Davi: amanhecer calmo; sombra (tensão), corrida, ovelha salva (alívio)
pad(t0('s15'), T('s15', 'shadow'), G_MAJ, 0.08, 1200); bells(t0('s15'), T('s15', 'shadow'), G_MAJ, 0.1, 4, seed=15)
rise(T('s15', 'shadow'), T('s15', 'safe'), 0.4, 45); taiko(T('s15', 'run'), T('s15', 'safe') - 0.01, D_MIN, 0.6, busy=1)
sacred(T('s15', 'safe'), t1('s15'), G_MAJ, 0.8)
# s16 — Benaia: neve (pad frio), rugido, descida na cova (tensão), luzes (resolução)
pad(t0('s16'), T('s16', 'pit'), D_MIN, 0.08, 900); bells(t0('s16'), T('s16', 'roar'), D_MIN, 0.08, 8, seed=16)
rise(T('s16', 'pit'), T('s16', 'lights'), 0.35, 45); taiko(T('s16', 'shadows'), T('s16', 'lights') - 0.01, D_MIN, 0.45, busy=0)
sacred(T('s16', 'lights'), t1('s16'), D_MAJ, 0.8)
# s17 — Daniel (a mais emocional): Ré menor contido; silêncio na luz; coro em Ré maior; noite (celesta); manhã (cordas)
sacred(t0('s17'), T('s17', 'beam') - 0.3, D_MIN, 0.75, voices=False)
sacred(T('s17', 'angel'), T('s17', 'night'), D_MAJ, 0.9)
pad(T('s17', 'night'), T('s17', 'morning'), D_MAJ, 0.05, 900); bells(T('s17', 'night'), T('s17', 'morning'), D_MAJ, 0.1, 4, seed=17)
pad(T('s17', 'morning'), T('s17', 'lara'), D_MAJ, 0.11, 2600); bells(T('s17', 'morning'), T('s17', 'lara'), D_MAJ, 0.12, 2, seed=18)
pad(T('s17', 'lara'), t1('s17'), G_MAJ, 0.12, 1800); bells(T('s17', 'lara'), t1('s17'), G_MAJ, 0.13, 4, seed=19)
rise(T('s17', 'outro'), t1('s17'), 0.35)
# s18 — encerramento: o Diário fecha (pizz suave), a câmera sobe (tutti com coro), identidade (acordes finais)
pizz(t0('s18'), T('s18', 'rise') - 0.01, D_MAJ, 0.7)
pad(T('s18', 'rise'), T('s18', 'ident'), D_MAJ, 0.12, 2800); pizz(T('s18', 'rise'), T('s18', 'ident') - 0.01, D_MAJ, 0.6)
for i in eighths(T('s18', 'rise'), T('s18', 'ident')):
    if i % 16 == 0: _, ch = chord_at(D_MAJ, i); [music.put(choir(m, 16 * E8 + 0.4) * 0.12, i * E8, -0.2 + 0.2 * j) for j, m in enumerate(ch)]
for k, (tt, ch) in enumerate([(T('s18', 'ident'), D_MAJ[2]), (T('s18', 'ident') + 1.0, D_MAJ[3]), (T('s18', 'ident') + 2.0, D_MAJ[0])]): stab(tt, ch, 0.35 + 0.1 * k)
pad(T('s18', 'ident') + 2.0, t1('s18'), D_MAJ[:1], 0.1, 2400, per=64); bells(T('s18', 'ident') + 2.0, t1('s18'), D_MAJ[:1], 0.12, 2, seed=20)
# créditos — canção de ninar em celesta sobre cordas, fade no fim
pad(t0('cred'), t1('cred'), THEME_CH, 0.14, 1600, per=8); bells(t0('cred'), t1('cred') - 1, THEME_CH, 0.18, 4, per=8, seed=21)   # mesma harmonia do tema
for i in eighths(t0('cred'), t1('cred') - 1):
    if i % 4 == 0: music.put(pluck(hz(chord_at(THEME_CH, i, 8)[0] - 12), 0.8, 1500) * 1.2, i * E8, 0)   # baixo suave


# o tema aparece nos momentos-chave
melody(T('s01', 'write'), THEME, 'glock', 0.7, 0.2, 0, 4)
melody(T('s02', 'cutFam'), THEME, 'horn', 0.9, -0.1, 0, 8); melody(T('s02', 'cutFam'), THEME, 'glock', 0.35, 0.3, 0, 8)
melody(T('s03', 'title'), THEME, 'flute', 0.6, 0.15, 16, 24)
melody(t0('s11'), THEME, 'horn', 0.8, -0.1, 0, 16); melody(t0('s11') + 8 * BEAT, THEME, 'flute', 0.45, 0.2, 8, 16)
melody(T('s18', 'rise'), THEME, 'flute', 0.65, 0.15, 0, 16); harpArp(T('s18', 'rise'), 4, 0.3)
melody(T('s18', 'rise') + 8 * BEAT, THEME, 'horn', 0.7, -0.15, 8, 16)
melody(T('s18', 'ident'), THEME, 'horn', 0.9, 0.0, 24, 32); melody(T('s18', 'ident'), THEME, 'flute', 0.55, 0.2, 24, 32)
harpArp(t0('cred'), 4, 0.32, THEME_CH, 0); melody(t0('cred') + 2 * BEAT, THEME, 'flute', 0.4, 0.1, 0, 14)
# coral sacro e melodias das histórias
melody(T('s13', 'bible'), SACRED, 'horn', 0.6, -0.1, 0, 16, tr=0)
melody(T('s14', 'won'), THEME, 'horn', 0.75, 0.0, 16, 22)                                      # vitória de Sansão: tema em maior
melody(t0('s15'), PASTORAL, 'flute', 0.6, 0.2, 0, 12)                                            # o pastor ao amanhecer
melody(T('s15', 'safe'), PASTORAL, 'flute', 0.5, 0.2, 8, 16)
for k, m in enumerate([86, 90, 93, 98]): music.put(glock(hz(m), 1.6) * 0.5, onbeat(T('s16', 'lights')) + k * E8, -0.3 + 0.2 * k)
melody(t0('s17'), SACRED, 'flute', 0.5, 0.15, 0, 8)                                              # a oração de Daniel
harpArp(T('s17', 'beam'), 2, 0.28, [(50, [62, 66, 69]), (43, [62, 67, 71])])                     # a luz desce
melody(T('s17', 'angel'), SACRED, 'horn', 0.55, -0.1, 16, 28)
harpArp(T('s17', 'night'), 1, 0.22, [(50, [62, 66, 69])])                                       # a noite passa
music.put(timpani(hz(38), 2.6, roll=1.0) * 0.6, onbeat(T('s17', 'morning')) - 1.0, 0)           # rufar até o amanhecer
melody(T('s17', 'morning'), THEME, 'horn', 0.8, 0.0, 16, 24); melody(T('s17', 'morning'), THEME, 'flute', 0.45, 0.25, 16, 24)

def stereo_master(x, wet, room):
    return Pedalboard([HighpassFilter(30), Reverb(room_size=room, wet_level=wet, dry_level=1.0, width=1.0)])(x.T.astype(np.float32), SR).T
m = stereo_master(music.x, 0.26, 0.7); del music

# ================================================================= 2) batidas medidas
mono = librosa.resample(m.mean(1).astype(np.float32), orig_sr=SR, target_sr=22050)
perc = librosa.effects.percussive(mono, margin=2.0)
HOP = 128
tempo, frames = librosa.beat.beat_track(y=perc, sr=22050, hop_length=HOP, start_bpm=TL['bpm'], tightness=600, units='frames')
beats = librosa.frames_to_time(frames, sr=22050, hop_length=HOP)
idx = np.round((beats - beats[0]) / BEAT).astype(int); keep = np.ones(len(beats), bool)
for _ in range(5):
    per, b0 = np.polyfit(idx[keep], beats[keep], 1); r = np.abs(np.polyval([per, b0], idx) - beats); keep = r < max(0.04, np.percentile(r, 70))
per, b0 = np.polyfit(idx[keep], beats[keep], 1)
tempo = 60 / per; first = b0 - np.floor(b0 / per) * per
grid = [round(float(first + i * per), 3) for i in range(int((DUR - first) / per) + 1)]
resid = float(np.abs(np.polyval([per, b0], idx[keep]) - beats[keep]).max() * 1000)
json.dump({'bpm_medido': round(float(tempo), 2), 'periodo_s': round(float(per), 4), 'residuo_max_ms': round(resid, 1), 'detectadas': [round(float(b), 3) for b in beats], 'beats': grid}, open('audio/beats.json', 'w'), indent=1)
# grade de encaixe: semicolcheias da batida medida (eventos ligados às palavras ficam a no máx. ~60 ms = 2 quadros do som)
half = np.array(sorted(round(a + q * (b - a) / 4, 3) for a, b in zip(grid, grid[1:]) for q in range(4)))
def snap(t): return float(half[np.abs(half - t).argmin()])
print(f'batidas: {tempo:.2f} bpm medidos, período {per:.4f} s, {len(beats)} detectadas, {keep.sum()} na grade (resíduo máx. {resid:.0f} ms); grade com {len(grid)}, primeira em {first:.3f} s')

# ================================================================= 3) efeitos
hits = []
def hit(sig, t, pan=0.0, g=1.0, name='', exact=False):
    ts = t if exact else snap(t); sfx.put(sig, ts, pan, g); hits.append({'evento': name, 'timeline': round(t, 3), 'grade': round(ts, 3), 'desvio_ms': round((ts - t) * 1000, 1)})
def riffle(d=0.6, n=7):
    out = np.zeros(int(d * SR))
    for k in range(n):
        f = I.filt(noise(0.07, 1500, 9000), 'highpass', 1200) * np.exp(-tv(0.07) * 40) * 0.5; j = int(k * d / n * SR); out[j:j + len(f)] += f[:len(out) - j]
    return out
def crunch(d=0.35): out = np.zeros(int(d * SR)); r = np.random.default_rng(3); [out.__setitem__(slice(j, j + 1200), out[j:j + 1200] + noise(0.025, 800, 6000) * np.exp(-tv(0.025) * 120) * r.uniform(0.3, 0.8)) for j in r.integers(0, len(out) - 1300, 14)]; return out
def purr(d=1.6): t = tv(d); return noise(d, 60, 400) * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * t)) ** 2 * env(len(t), 0.2, 0.4) * 0.9
def flap(n=3): out = np.zeros(int(n * 0.16 * SR) + 6000); [out.__setitem__(slice(int(k * 0.16 * SR), int(k * 0.16 * SR) + 4800), out[int(k * 0.16 * SR):int(k * 0.16 * SR) + 4800] + noise(0.1, 300, 2500) * np.sin(np.pi * np.linspace(0, 1, 4800)) * 0.5) for k in range(n)]; return out
def click(f=3000): return mx(noise(0.012, f, min(f * 3, 20000)) * np.exp(-tv(0.012) * 300) * 0.8, pop(f / 2, f / 3, 0.03))
def shh(d=0.6): return noise(d, 2500, 9000) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** 2 * 0.25
def slurp(d=0.5): t = tv(d); f = 300 + 900 * t / d; return mx(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-((t - d / 2) / (d / 3)) ** 2) * 0.15, noise(d, 600, 2500) * 0.06)
def crack(): return mx(noise(0.05, 1500, 9000) * np.exp(-tv(0.05) * 70) * 1.2, drum(160, 0.12, 0.5, 30) * 0.4)
def growl(d=1.2): return I.filt(roar(d, 0.6), 'lowpass', 900)
def yawn(): return meow(1.1, (420, 520, 300), (500, 900, 400), (1500, 1300, 900), 0.4)
def camera(): return mx(click(4000), whoosh(0.15, 2000, 9000) * 0.4, sparkle(0.6) * 0.3)
def thump(f=60): return mx(drum(f, 0.5, 0.3, 8) * 0.9, pop(300, 520, 0.08) * 0.4)
ONO = {   # onomatopeia desenhada na tela -> som
    'TUM': lambda: heartbeat() * 0.9, 'TUM!': lambda: thump(), 'miau...': lambda: meow(0.7, g=0.4), 'miau!': lambda: meow(), 'miau?': lambda: meow(0.5, (500, 640, 820), (380, 800, 900), (2200, 1700, 1900), 0.45),
    'BOING!': lambda: boing(), 'FIUUU!': lambda: whoosh(0.6, 200, 3000) * 1.6, 'ROOAAR!': lambda: roar(), 'ROAR!': lambda: roar(0.9, 0.8), 'GRRR...': lambda: growl(),
    'TAP!': lambda: mx(drum(95, 0.25, 0.3, 18) * 0.7, pop(500, 300, 0.08) * 0.8, sparkle(0.8) * 0.5), 'FRRRT!': lambda: riffle(0.75, 9), 'PLOFT!': lambda: mx(drum(140, 0.3, 0.2, 16) * 0.5, pop(900, 250, 0.14) * 1.2, sparkle(1.0) * 0.6),
    'FLAP': lambda: flap(), 'CREC!': lambda: crack(), 'psiu...': lambda: shh(), 'VUUSH!': lambda: whoosh(0.5, 300, 8000) * 1.6, 'NHAC!': lambda: mx(drum(120, 0.2, 0.6, 20) * 0.6, crack() * 0.5),
    'crunch': lambda: crunch(), 'slurp': lambda: slurp(), 'tic': lambda: click(2500), 'crrsh': lambda: noise(0.4, 1500, 6000) * env(int(0.4 * SR), 0.02, 0.3) * 0.25, '?': lambda: pop(500, 900, 0.15) * 1.3,
    'ronrom...': lambda: purr(), 'ronrom': lambda: purr(), 'TCHUM!': lambda: mx(thump(70), sparkle(0.9) * 0.6), 'CLIQUE!': lambda: camera(), 'bocejo...': lambda: yawn(),
    'TAN-TAN!': lambda: mx(drum(70, 0.3, 0.3, 10), np.concatenate([np.zeros(int(0.25 * SR)), drum(70, 0.4, 0.3, 8)])) * 0.6, 'TCHAN!': lambda: mx(drum(60, 0.6, 0.4, 6) * 0.7, sparkle(1.0) * 0.6), 'VRUUUM!': lambda: whoosh(1.0, 80, 2500) * 2.0,
}
ono = json.load(open('audio/onomatopeias.json'))
for txt, t in ono: hit(ONO[txt](), t, 0.0, 1.0, f'onomatopeia {txt}')
# acentos de eventos (cortes de cena e chegadas); passagem suave entre as cenas
for s in TL['scenes'][2:]:
    if s['id'] not in ('s14', 's15', 's16', 's17', 'cred'): hit(whoosh(0.5, 300, 5000) * 0.6, s['t0'] - 0.2, 0, 1, f'passagem para {s["id"]}')
E = lambda sid: S[sid]['ev']
for k in range(4): hit(heartbeat() * 0.5, T('s01', 'heart', k), 0, 1, 'batimento')
hit(sparkle(1.0) * 0.6, T('s01', 'light'), 0.1, 1, 'luz no olho'); hit(whoosh(0.4, 400, 6000), T('s01', 'whip'), 0.5, 1, 'chicote de câmera')
for k in range(4): hit(step(), T('s01', 'paws', k), -0.3 + 0.2 * k, 1, 'pegada no título')
hit(whoosh(0.7, 200, 9000) * 1.4, T('s01', 'dive'), 0, 1, 'mergulho na página')
for k, tc in enumerate(E('s02')['cards']): hit(mx(whoosh(0.4, 800, 7000) * 0.6, celesta(hz([86, 90, 93][k]), 0.8) * 0.18), t0('s02') + tc, -0.5 + 0.5 * k, 1, 'ilustração sai do livro')
hit(meow(0.32, (700, 920, 760), (420, 700, 600), (2300, 1800, 1600), 0.28), T('s02', 'crouch') + 0.25, 0.25, 0.7, 'miadinho')
hit(whoosh(0.5, 120, 1500) * 1.6, T('s02', 'leap'), 0.1, 1, 'salto'); hit(whoosh(0.7, 200, 9000) * 1.4, T('s02', 'splash') + 0.25, 0, 1, 'entra na ilustração')
hit(mx(drum(55, 0.6, 0.5, 6) * 0.5, whoosh(0.4, 3000, 10000, up=False) * 0.6), T('s02', 'portal'), 0, 1, 'chegada na floresta')
for k in range(8): hit(step() * 0.8, T('s02', 'portal') + 0.25 + k * E8, -0.2 + 0.05 * k, 1, 'passo da onça')
hit(whoosh(0.3, 300, 7000) * 2.0, T('s02', 'whip'), 0.6, 1, 'chicote de câmera')
for k in range(6): hit(step() * 0.8, T('s02', 'whip') + 0.25 + k * E8, 0.3 - 0.1 * k, 1, 'passo do tigre')
hit(roar(0.6, 0.35) * 0.5, T('s02', 'cutLion') + 1.5, 0.2, 1, 'rosnado baixo do leão')
for k, tf in enumerate(E('s02')['fam']): hit(mx(whoosh(0.35, 300, 3000) * 0.5, step()), t0('s02') + tf, -0.5 + 0.5 * k, 1, 'felino chega')
hit(mx(whoosh(0.4, 400, 4000) * 0.5, sparkle(1.0) * 0.5), T('s03', 'title'), 0, 1, 'título Felidae')
for k, tt in enumerate(E('s03')['traits']): hit(mx(pop(600 + 80 * k, 900 + 80 * k, 0.1), celesta(hz(81 + 2 * k), 0.6) * 0.15), t0('s03') + tt, -0.4 + 0.2 * k, 1, 'característica')
hit(thump(80) * 0.6, T('s03', 'land'), 0, 1, 'pouso da borboleta / zoom nas patas')
hit(mx(drum(45, 0.8, 0.2, 4) * 0.6, whoosh(0.3, 2000, 6000, up=False) * 0.4), T('s04', 'freeze'), 0, 1, 'congela')
hit(click(1800) * 1.2, T('s04', 'retract'), 0.2, 1, 'garras recolhem'); hit(mx(click(3500), whoosh(0.2, 2000, 8000) * 0.5), T('s04', 'extend'), 0.2, 1, 'garras saem')
for k in range(5): hit(pop(700 + 60 * k, 900 + 60 * k, 0.08), T('s04', 'count') + k * E8, -0.3 + 0.15 * k, 1, 'conta os dedos')
hit(whoosh(0.5, 200, 4000) * 1.2, T('s04', 'cheetah'), 0, 1, 'guepardo dispara'); hit(thump(70) * 0.7, T('s04', 'pawFill'), 0, 1, 'pegada no diário')
hit(whoosh(0.5, 200, 3000), T('s05', 'binoc'), 0, 1, 'binóculo'); hit(sparkle(1.0) * 0.5, T('s05', 'tapetum'), 0.2, 1, 'tapete lúcido brilha')
hit(whoosh(0.4, 400, 6000), T('s05', 'split'), 0, 1, 'tela dividida'); hit(whoosh(0.5, 150, 3000) * 1.5, T('s05', 'pounce'), 0, 1, 'bote')
hit(whoosh(0.4, 300, 5000), T('s06', 'split'), 0, 1, 'mandíbula'); hit(mx(crack() * 0.5, sparkle(0.6) * 0.3), T('s06', 'canines'), 0, 1, 'caninos')
hit(mx(crack() * 0.5, sparkle(0.6) * 0.3), T('s06', 'carnassial'), 0, 1, 'carniceiros')
hit(whoosh(0.5, 300, 3000), T('s07', 'follicle'), 0, 1, 'zoom no folículo'); hit(mx(whoosh(0.4, 600, 5000), sparkle(0.6) * 0.4), T('s07', 'through'), 0, 1, 'passa pela fresta')
hit(whoosh(0.6, 200, 6000) * 0.8, T('s08', 'waves'), 0, 1, 'ondas sonoras'); hit(whoosh(0.4, 400, 3000), T('s08', 'anatomy'), 0, 1, 'anatomia do ouvido')
for k in ('persa', 'siames', 'maine', 'angora'): hit(mx(whoosh(0.4, 400, 6000) * 0.6, sparkle(1.0) * 0.5), T('s09', k), 0, 1, f'entra {k}')
for k, tw in enumerate(E('s10')['win']): hit(mx(click(2000) * 0.5, celesta(hz(74 + 3 * k), 0.6) * 0.14), t0('s10') + tw, -0.4 + 0.2 * k, 1, 'janela acende')
for k, ti in enumerate(E('s10')['icons']): hit(pop(600 + 100 * k, 1000 + 100 * k, 0.1), t0('s10') + ti, -0.3 + 0.2 * k, 1, 'ícone')
for k in ('indoor', 'catio', 'birds'): hit(whoosh(0.4, 400, 5000) * 0.7, T('s10', k), 0, 1, k)
hit(thump(70) * 0.6, T('s10', 'pawBook'), 0, 1, 'pegada no diário')
for k, td in enumerate(E('s11')['dots']): hit(mx(pop(500 + 80 * k, 800 + 80 * k, 0.1), celesta(hz(74 + [0, 2, 4, 7, 9, 12, 14][k]), 0.7) * 0.14), t0('s11') + td, -0.6 + 0.2 * k, 1, 'ponto no mapa')
for k, ts in enumerate(E('s11')['sp']): hit(whoosh(0.8, 150, 6000) * 1.2, t0('s11') + ts, 0, 1, 'mergulho no habitat')
hit(whoosh(0.5, 3000, 300, up=True) * 0.8, T('s11', 'fold'), 0, 1, 'mapa dobra')
for k in ('reveal1', 'reveal2'): hit(mx(sparkle(1.0) * 0.6, drum(60, 0.4, 0.3, 8) * 0.5), T('s12', k), 0, 1, 'resposta')
for k in ('q1', 'q2', 'q3', 'q4'): hit(mx(pop(400, 800, 0.12), drum(90, 0.2, 0.3, 16) * 0.4), T('s12', k), 0, 1, 'pergunta')
hit(mx(sparkle(1.0) * 0.7, whoosh(0.4, 600, 8000) * 0.5), T('s12', 'crown'), 0, 1, 'coroa'); hit(whoosh(0.4, 2000, 300, up=False) * 0.5, T('s12', 'crownOff'), 0, 1, 'coroa sai')
hit(mx(sparkle(1.2) * 0.6, whoosh(0.6, 300, 6000) * 0.4), T('s13', 'gold'), 0, 1, 'diário dourado'); hit(sparkle(1.0) * 0.5, T('s13', 'bible'), 0, 1, 'Bíblia')
for k, tv_ in enumerate(E('s13')['vignettes']): hit(celesta(hz(78 + [0, 3, 7, 12][k]), 0.8) * 0.16, t0('s13') + tv_, -0.3 + 0.2 * k, 1, 'vinheta')
hit(whoosh(0.7, 200, 6000) * 1.0, T('s13', 'open'), 0, 1, 'entra na página')
hit(whoosh(0.5, 300, 4000) * 0.6, T('s14', 'spirit'), 0, 1, 'força'); hit(mx(drum(50, 0.7, 0.3, 5) * 0.7, whoosh(0.4, 200, 3000) * 0.5), T('s14', 'fight'), 0, 1, 'Sansão enfrenta o leão (sem violência)')
hit(whoosh(0.6, 400, 5000) * 0.6, T('s14', 'page'), 0, 1, 'página'); hit(whoosh(0.5, 300, 5000) * 0.7, T('s15', 'run'), 0, 1, 'Davi corre')
hit(mx(meow(0.6, (300, 360, 280), (500, 700, 500), (1400, 1300, 1100), 0.3), sparkle(0.6) * 0.3), T('s15', 'safe') + 0.2, -0.2, 0.8, 'ovelha salva (bé)')
hit(whoosh(0.6, 400, 5000) * 0.6, T('s15', 'page'), 0, 1, 'página'); hit(whoosh(0.8, 2000, 200, up=False) * 0.6, T('s16', 'descend'), 0, 1, 'desce na cova')
hit(sparkle(1.2) * 0.5, T('s16', 'lights'), 0, 1, 'luzes')
for k in range(4): hit(step() * 0.6, T('s17', 'soldiers') + 0.25 + k * BEAT, 0, 1, 'passos dos soldados')
hit(mx(drum(45, 0.9, 0.2, 4) * 0.6, whoosh(0.6, 1500, 200, up=False) * 0.4), T('s17', 'den'), 0, 1, 'cova')
hit(growl(1.4) * 0.5, T('s17', 'den') + 0.75, 0.3, 1, 'leões rosnam baixo')
hit(sparkle(1.4) * 0.45, T('s17', 'beam'), 0, 1, 'feixe de luz (suave)')
hit(mx(drum(70, 0.6, 0.2, 6) * 0.5, sparkle(1.0) * 0.4), T('s18', 'close') + 0.75, 0, 1, 'diário fecha')
hit(mx(sparkle(1.2) * 0.6), T('s18', 'ident') + 0.25, 0, 1, 'insígnia')
for k in range(6): hit(step() * 0.5, T('s18', 'paw') + 0.25 + k * 0.27, -0.6 + 0.24 * k, 1, 'passos do Pingo')
hit(mx(drum(95, 0.25, 0.3, 18) * 0.6, sparkle(0.8) * 0.4), T('s18', 'paw') + 1.5, 0.4, 1, 'pegada final')
for k, tl in enumerate(E('cred')['lines']): hit(celesta(hz([74, 78, 81, 86, 90][k]), 0.8) * 0.12, t0('cred') + tl, -0.3 + 0.15 * k, 1, 'crédito')
# ambiente: pássaros na mesa de estudos e nos habitats, vento na savana e na neve, grilos na noite de Daniel
amb.put(birds(T('s02', 'cutC') - T('s02', 'cutB'), 9) * 0.7, T('s02', 'cutB'), 0.3)
amb.put(birds(T('s02', 'whip') - T('s02', 'portal'), 7) + noise(T('s02', 'whip') - T('s02', 'portal'), 4500, 6500) * 0.02, T('s02', 'portal'), -0.25)
for sid in ('s03', 's07', 's10', 's18'): d = S[sid]['dur']; amb.put(birds(d, int(d / 2.5)) * 0.5, t0(sid), 0.3)
for k in range(7):
    a, b = t0('s11') + sp[k], t0('s11') + sp[k + 1]; d = b - a
    amb.put(birds(d, 6) * 0.6 if k in (0, 2, 4) else noise(d, 200, 1400) * 0.05 * env(int(d * SR), 0.5, 0.5), a, 0.2)
for sid, lo, hi, g in (('s12', 150, 700, 0.04), ('s14', 200, 1200, 0.04), ('s16', 400, 3000, 0.06)): d = S[sid]['dur']; amb.put(noise(d, lo, hi) * g * env(int(d * SR), 0.5, 0.5), t0(sid), 0)
d = T('s17', 'morning') - T('s17', 'night'); cr = np.zeros(int(d * SR))
for k in range(int(d * 3)): c = np.sin(2 * np.pi * 4300 * tv(0.05)) * np.sin(np.pi * np.linspace(0, 1, int(0.05 * SR))) * 0.02; j = int(k / 3 * SR); cr[j:j + len(c)] += c[:len(cr) - j]
amb.put(cr, T('s17', 'night'), 0.3)
json.dump(hits, open('audio/acertos.json', 'w'), ensure_ascii=False, indent=1)

# ================================================================= 4) vozes
for v in TL['voices']:
    a, sr = sf.read(v['arquivo']); assert sr == SR
    vox.put(a, v['inicio'], {'miguel': 0.12, 'lara': -0.12}.get(v['quem'], 0.0), 1.0)
vx = Pedalboard([Reverb(room_size=0.18, wet_level=0.06, dry_level=1.0, width=0.5)])(vox.x.T.astype(np.float32), SR).T; del vox

# ================================================================= 5) mixagem
meter = pyln.Meter(SR)
s = stereo_master(sfx.x, 0.12, 0.4); a = stereo_master(amb.x, 0.2, 0.6); del sfx, amb
m *= 10 ** ((-23 - meter.integrated_loudness(m)) / 20)
act = np.zeros(N, np.float32)
for w in TL['words']: act[max(0, int((w[1] - 0.12) * SR)):int((w[2] + 0.18) * SR)] = 1
k = np.convolve(act, np.ones(int(0.15 * SR), np.float32) / int(0.15 * SR), 'same'); duck = (10 ** (-9.5 * k / 20))[:, None]
vx *= 10 ** ((-17 - meter.integrated_loudness(vx)) / 20)
MB, SB, AB, V = m * duck, s * 10 ** (-4 / 20) * (1 - 0.35 * k[:, None]), a * 10 ** (-7 / 20) * duck, vx * 10 ** (6.5 / 20)
x = MB + SB + AB + V
fi = int(0.05 * SR); x[:fi] *= np.linspace(0, 1, fi)[:, None]; fo = int(0.8 * SR); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
x = Pedalboard([Compressor(threshold_db=-16, ratio=2.0, attack_ms=15, release_ms=150)])(x.T.astype(np.float32), SR).T
def limiter(x, ceil_db, look=0.003, rel=0.08):
    from scipy.ndimage import minimum_filter1d
    from scipy.signal import lfilter
    c = 10 ** (ceil_db / 20); g = minimum_filter1d(np.minimum(1, c / np.maximum(np.abs(x).max(1), 1e-9)), 2 * int(look * SR) + 1)
    # ataque instantâneo, liberação exponencial: mínimo entre o ganho pedido e o ganho liberado (iterado em blocos)
    al = np.exp(-1 / (rel * SR)); out = np.empty_like(g); v = 1.0; B = 4800
    for i in range(0, len(g), B):
        gb = g[i:i + B]; rel_ = lfilter([1 - al], [1, -al], gb, zi=[al * v])[0]; o = np.minimum(gb, rel_)
        # passo exato para os blocos onde o ganho cai (raro): laço curto
        if (o < rel_ - 1e-9).any():
            for j in range(len(gb)): v = gb[j] if gb[j] < v else al * v + (1 - al) * gb[j]; o[j] = v
        else: v = o[-1]
        out[i:i + B] = o
    return x * out[:, None]
for _ in range(4): x = limiter(x * 10 ** ((-14 - meter.integrated_loudness(x)) / 20), -2.6)
sf.write('audio/mix.wav', x.astype(np.float32), SR, subtype='PCM_24')
on = act > 0.5
db = lambda y: 10 * np.log10(np.mean(y[on] ** 2) + 1e-12)
print(f'nas falas: voz {db(V):.1f} | trilha {db(MB):.1f} | efeitos {db(SB):.1f} | ambiente {db(AB):.1f} dB')
print('mix', round(meter.integrated_loudness(x), 2), 'LUFS | pico', round(20 * np.log10(np.abs(x).max()), 2), 'dBFS | voz acima do fundo', round(db(V) - db(MB + SB + AB), 1), 'dB | acertos', len(hits), '| desvio máx.', max(abs(h['desvio_ms']) for h in hits), 'ms')
