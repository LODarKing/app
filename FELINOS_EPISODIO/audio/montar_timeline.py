"""Monta timeline.js do episódio completo: 18 cenas + créditos, em sequência.
Cada cena tem eventos em tempo LOCAL (s) e falas [quem, arquivo, início local, (corte início, corte fim)].
A duração da cena é a do campo 'dur'. Saída: tempos globais das falas e palavras (com a grafia corrigida
para as legendas) e o envelope de cada fala (boca dos personagens, 24 valores/s). Rodar a partir de FELINOS_EPISODIO/."""
import json, os, numpy as np, soundfile as sf
AUD = '../FELINOS_AUDIO'
TR = json.load(open(f'{AUD}/documentacao/transcricao_editada.json'))
N = lambda k: f'Narrador_Felinos_{k:02d}'
L = lambda k: f'Lara_Felinos_{k:02d}'
M = lambda k: f'Miguel_Felinos_{k:02d}'
# grafia correta nas legendas (o reconhecedor de fala errou estes nomes; o áudio está certo)
FIX = {'Felidia,': 'Felidae,', 'Ciamês': 'siamês', 'MineCon': 'Maine Coon', 'pulma': 'puma', 'angora': 'angorá', 'golias,': 'Golias,',
       'bíblia?': 'Bíblia?', 'Brasileiro.': 'brasileiro.', 'atração': 'tração', '4': 'quatro', '7': 'sete', 'desses': 'dentes', 'Felidae,': 'Felidae,'}
FIX_AT = {(N(1), 8): 'a'}   # "Mas a família dele..." (o reconhecedor ouviu "da")

SCENES = [
    {'id': 's01', 'dur': 14.25, 'ev': {'heart': [0.0, 0.5, 1.0, 1.5], 'eyesOpen': 0.25, 'meow': 0.75, 'light': 1.25, 'push': 1.75, 'cut1': 2.5,
        'reveal': 3.0, 'tilt': 3.5, 'slowBlink': 4.0, 'boing': 4.5, 'crouch': 5.5, 'leap': 6.0, 'cover': 6.5, 'whip': 8.0, 'cut4': 9.5, 'raise': 10.0,
        'roar': 10.75, 'roarEnd': 11.25, 'cut5': 11.25, 'paws': [11.25, 11.5, 11.75, 12.0], 'write': 12.0, 'sub': 12.75, 'en': 13.0, 'dive': 13.75, 'dur': 14.25},
     'vox': [['narrador', N(1), 2.75, (0.0, 3.35)], ['narrador', N(1), 6.5, (3.45, None)]]},
    {'id': 's02', 'dur': 20.5, 'ev': {'paw': 0.5, 'coverOpen': 1.0, 'riffle': 1.25, 'cutB': 1.75, 'cards': [2.0, 2.5, 3.0], 'miguelLook': 2.0, 'cutB2': 5.0, 'laraPoint': 6.0,
        'cutC': 7.5, 'meow': 7.5, 'crouch': 7.75, 'leap': 8.0, 'splash': 8.25, 'portal': 9.0, 'whip': 11.5, 'cutLion': 13.5, 'cutFam': 16.0, 'fam': [16.25, 16.75, 17.25], 'pingoLand': 18.5},
     'vox': [['miguel', 'Miguel_Felinos_D01', 2.0], ['lara', 'Lara_Felinos_D01', 5.0], ['narrador', N(2), 9.0]]},
    {'id': 's03', 'dur': 25.0, 'ev': {'tree': 0.0, 'reorg': 4.5, 'title': 5.5, 'parade': 10.0, 'traits': [14.5, 15.25, 16.0, 16.75, 17.5], 'lara': 18.5, 'proud': 20.5, 'butterfly': 21.5, 'land': 23.5},
     'vox': [['miguel', 'Miguel_Felinos_D02', 0.75], ['narrador', N(3), 4.25], ['lara', 'Lara_Felinos_D02', 18.75]]},
    {'id': 's04', 'dur': 41.0, 'ev': {'bridge': 0.0, 'crec': 2.5, 'whisper': 3.25, 'freeze': 7.25, 'digi': 7.5, 'pads': 11.0, 'claws': 18.0, 'retract': 20.6, 'extend': 21.75, 'count': 22.75, 'lara': 26.0, 'cheetah': 30.0, 'grip': 34.5, 'pawFill': 39.5},
     'vox': [['miguel', M(1), 3.25], ['narrador', N(4), 7.5], ['lara', L(1), 26.25], ['narrador', N(5), 30.5]]},
    {'id': 's05', 'dur': 26.0, 'ev': {'pupilIn': 0.0, 'dusk': 0.75, 'miguel': 2.25, 'face': 5.5, 'binoc': 9.0, 'pupils': 13.0, 'tapetum': 15.2, 'split': 18.0, 'lara': 20.5, 'pounce': 24.5},
     'vox': [['miguel', M(2), 2.5], ['narrador', N(6), 5.5], ['lara', L(2), 20.75]]},
    {'id': 's06', 'dur': 26.5, 'ev': {'bowl': 0.0, 'split': 8.5, 'canines': 9.5, 'carnassial': 12.0, 'kids': 19.0, 'clean': 25.0},
     'vox': [['narrador', N(7), 1.0], ['miguel', 'Miguel_Felinos_D03', 19.0], ['lara', 'Lara_Felinos_D03', 23.0]]},
    {'id': 's07', 'dur': 24.0, 'ev': {'gap': 0.0, 'touch': 3.5, 'follicle': 8.0, 'through': 15.5, 'miguel': 19.5, 'look': 22.5},
     'vox': [['narrador', N(8), 1.5], ['miguel', M(3), 19.75]]},
    {'id': 's08', 'dur': 22.5, 'ev': {'leaf': 0.25, 'earTurn': 0.75, 'headTurn': 1.25, 'waves': 4.75, 'anatomy': 8.5, 'hairs': 12.0, 'particles': 15.0, 'relax': 19.75, 'leafBook': 21.0},
     'vox': [['narrador', N(9), 1.75]]},
    {'id': 's09', 'dur': 56.0, 'ev': {'sign': 0.0, 'persa': 2.0, 'siames': 15.0, 'maine': 27.5, 'angora': 40.5, 'photo': 53.5, 'flash': 54.75},
     'vox': [['narrador', N(10), 2.5], ['lara', L(3), 15.5], ['narrador', N(11), 18.5], ['miguel', M(4), 29.0], ['narrador', N(12), 32.0], ['narrador', N(13), 41.0]]},
    {'id': 's10', 'dur': 42.0, 'ev': {'house': 0.0, 'win': [1.0, 5.0, 8.0, 13.8, 16.6], 'lara': 20.0, 'icons': [22.2, 23.6, 24.6, 25.6], 'indoor': 28.0, 'catio': 33.0, 'birds': 36.0, 'pet': 38.5, 'pawBook': 40.5},
     'vox': [['narrador', N(14), 1.0], ['lara', L(4), 20.0], ['narrador', N(15), 28.0]]},
    {'id': 's11', 'dur': 73.0, 'ev': {'map': 0.0, 'dots': [2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5], 'sp': [8.5, 17.5, 26.5, 35.5, 45.0, 54.0, 63.0], 'fold': 71.5},
     'vox': [['narrador', N(16), 0.5]] + [['narrador', N(17 + i), 9.0 + [0, 9.0, 18.0, 27.0, 36.5, 45.5, 54.5][i]] for i in range(7)]},
    {'id': 's12', 'dur': 62.0, 'ev': {'jingle': 0.0, 'q1': 2.0, 'reveal1': 7.0, 'q2': 14.0, 'reveal2': 17.0, 'q3': 26.5, 'run': 27.5, 'q4': 38.0, 'crown': 39.0, 'crownOff': 45.0, 'pride': 48.0, 'territory': 51.5, 'hunt': 53.25, 'males': 56.5, 'roar': 60.5},
     'vox': [['miguel', M(5), 2.5], ['narrador', N(24), 7.5], ['lara', L(5), 14.5], ['narrador', N(25), 17.5], ['narrador', N(26), 27.0], ['miguel', M(6), 38.5], ['narrador', N(27), 41.0]]},
    {'id': 's13', 'dur': 13.5, 'ev': {'gold': 0.0, 'bible': 4.5, 'vignettes': [6.0, 6.5, 7.0, 7.5], 'open': 12.5},
     'vox': [['lara', L(6), 0.5], ['narrador', N(28), 5.0]]},
    {'id': 's14', 'dur': 15.0, 'ev': {'path': 0.0, 'lion': 3.5, 'spirit': 6.4, 'fight': 8.0, 'won': 11.2, 'page': 14.0},
     'vox': [['narrador', N(29), 0.75]]},
    {'id': 's15', 'dur': 14.0, 'ev': {'dawn': 0.0, 'stray': 3.0, 'shadow': 5.9, 'run': 7.0, 'safe': 8.6, 'page': 13.0},
     'vox': [['narrador', N(30), 0.75]]},
    {'id': 's16', 'dur': 13.0, 'ev': {'snow': 0.0, 'walk': 1.0, 'roar': 4.5, 'pit': 6.0, 'descend': 7.4, 'shadows': 8.5, 'lights': 11.5},
     'vox': [['narrador', N(31), 0.75]]},
    {'id': 's17', 'dur': 26.0, 'ev': {'city': 0.0, 'soldiers': 2.2, 'den': 4.3, 'beam': 6.6, 'angel': 7.6, 'calm': 8.9, 'night': 10.7, 'morning': 12.8, 'lara': 16.5, 'outro': 22.25},
     'vox': [['narrador', N(32), 0.75], ['lara', L(7), 17.0]]},
    {'id': 's18', 'dur': 23.0, 'ev': {'table': 0.0, 'close': 0.75, 'miguel': 2.0, 'stretch': 6.25, 'meow': 7.25, 'rise': 8.0, 'ident': 17.75, 'paw': 21.0},
     'vox': [['miguel', M(7), 2.0], ['narrador', N(33), 8.5]]},
    {'id': 'cred', 'dur': 9.0, 'ev': {'in': 0.0, 'lines': [0.5, 1.75, 3.0, 4.25, 5.5], 'out': 8.5}, 'vox': []},
]

os.makedirs('audio/vozes', exist_ok=True)
t0 = 0.0; out_sc, voices, words = [], [], []
for sc in SCENES:
    for who, name, ls, *cut in sc['vox']:
        a, sr = sf.read(f'{AUD}/falas/{name}.flac'); c0, c1 = (cut[0] if cut else (0.0, None)); c1 = c1 if c1 is not None else len(a) / sr
        clip = a[int(c0 * sr):int(c1 * sr)]; f = 8; n = int(0.008 * sr); clip = clip.copy(); clip[:n] *= np.linspace(0, 1, n); clip[-n:] *= np.linspace(1, 0, n)
        fn = f'audio/vozes/{name}{"" if not cut else f"_{int(c0 * 100)}"}.wav'; sf.write(fn, clip, sr, subtype='PCM_24')
        gs = round(t0 + ls, 3); hop = sr // 24
        r = np.array([np.sqrt(np.mean(clip[i:i + hop] ** 2)) for i in range(0, len(clip), hop)]); v = np.clip(r / (np.percentile(r, 90) + 1e-9), 0, 1.2) ** 0.8
        voices.append({'quem': who, 'arquivo': fn, 'inicio': gs, 'dur': round(len(clip) / sr, 3), 'cena': sc['id'], 'boca': [round(float(x), 2) for x in v]})
        for i, (w, s, e) in enumerate(TR[name]['palavras']):
            if s < c0 - 0.05 or s > c1: continue
            w = FIX_AT.get((name, i), FIX.get(w, w))
            if w.startswith('-') and words: words[-1][0] += w; words[-1][2] = round(gs + e - c0, 3); continue
            words.append([w, round(gs + s - c0, 3), round(gs + e - c0, 3), who])
        end = ls + len(clip) / sr
        if end > sc['dur'] - 0.2: print(f"!! {sc['id']}: fala {name} termina em {end:.2f}s, cena dura {sc['dur']}s")
    out_sc.append({'id': sc['id'], 't0': round(t0, 3), 'dur': sc['dur'], 'ev': sc['ev']}); t0 += sc['dur']
TL = {'fps': 30, 'dur': round(t0, 3), 'bpm': 120, 'scenes': out_sc, 'voices': voices, 'words': words}
open('timeline.js', 'w').write('const TL = ' + json.dumps(TL, ensure_ascii=False) + ';\n')
print(f'timeline.js: {len(out_sc)} cenas, {len(voices)} falas, {len(words)} palavras, duração {t0:.1f} s ({t0 / 60:.1f} min)')
for sc in out_sc: print(f"  {sc['id']}: {sc['t0']:7.2f}–{sc['t0'] + sc['dur']:7.2f}")
