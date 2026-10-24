"""Writes documentation/SCENE_TIMELINE.json and documentation/ASSET_MANIFEST.json"""
import json, os, hashlib, glob
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SC = json.load(open(f'{R}/documentation/scene_bounds.json'))
OV = json.load(open(f'{R}/documentation/OVERLAY_TEXT.json'))
SFX = json.load(open(f'{R}/documentation/SFX_CUES.json'))
CUES = json.load(open(f'{R}/documentation/SUBTITLE_CUES.json'))
TR = [None, 'dissolve 0.5 s', 'diagonal wipe (yellow band) 0.7 s', 'iris 0.8 s', 'vertical push 0.6 s', 'iris 0.9 s', 'dissolve 0.8 s', 'dissolve 0.8 s', 'diagonal wipe 0.7 s', 'iris 0.9 s']
SHOTS = {
 1: ['0.0 tracking: Pedro rolls into the club, Lucas jogs and climbs the steps, João carries a pennant inside', '4.4 Pedro stops at the steps; push-in on the steps highlighted in red + warning sign (the barrier is the problem)', '7.0 slow-down: Ana notices, "?" appears', '9.6 wide, then two-shot: Ana walks down the steps and stands beside Pedro'],
 2: ['0.15 the steps give way to a gentle ramp with handrails (sparkles)', '1.3 Pedro rolls up the ramp and enters by himself; Ana walks ahead (no pushing)', '3.35 board slides in: person -> brick barrier -> accessibility bridge -> participation', '9.6 CIF triangle: saúde / ambiente / participação (OMS)', '15.4 UN Convention card + rights / opportunities / everyone icons'],
 3: ['knot board (Pedro, físicas) -> Braille card (Clara, visuais) -> signal flags (Rafael, auditivas) -> tent with picture steps (Bia, intelectuais) -> AAC quiz (Theo, múltiplas)', '6.9 Lia paints the banner; close-up on the sunflower lanyard (hidden disabilities)', '10.75 group of seven with skill badges; 16.2 everyone cheers'],
 4: ['0 team cards handed to everyone except Rafael (≠, padlock)', '5.9 Caio and Nina point at João repeatedly (calendar marks), scribbled insults (no words)', '13.35 exclusion card; 14.45 phone with aggressive messages', '15.85 Ana says stop, Lucas stands with João, the director arrives and listens'],
 5: ['0 calendar flips to 1999', '2.1 globe, the Americas highlighted', '4.2 convention document written, signed and sealed (OEA, Guatemala 1999)', '9.7 igualdade / participação / respeito', '12.65 Pathfinders read (Ana), debate (Rafael, Theo via AAC) and write a summary (Lucas)'],
 6: ['0 Bible opens at João 5', '1.3 pool of Bethesda (colonnades); the man sits on his mat; Jesus approaches', '5.9 Jesus kneels at eye level, listens and talks', '9.35 the man rises carrying his mat (gentle light)', '10.4 leaders object (Sabbath sun)', '14 Jesus and the man face to face; wide closing shot'],
 7: ['0 scroll: 2 Samuel 9', '2.0 David on the throne sends the messenger', '4.45 Lo-Debar: the messenger finds Mefibosete seated by his house', '7.55 Mefibosete kneels before the king, insecure; David rises and welcomes him', '13.35 banquet: Mefibosete at the king\'s table'],
 8: ['0 Helen as a child in the garden of her family home', '3.8 Anne Sullivan spells W-A-T-E-R into Helen\'s hand while water runs over the other', '5.45 adult Helen writing at a typewriter', '7.25 Radcliffe graduation 1904', '9.25 Helen speaks for rights, Anne beside her'],
 9: ['0 map of Brazil + Lei 13.146/2015', '3.45 icons: direitos, acessibilidade, educação, participação, igualdade', '9.0 school behind a brick wall; 11.55 the wall crumbles', '12.5 ramp, captioned video, AAC, picture instructions; everyone raises hands'],
 10: ['0 the club (now with the ramp): "is it inclusive?"', '3.0 Lucas inspects barriers: ramp OK, narrow gate not OK', '5.0 Ana writes proposals; 6.6 the group presents them to the director', '8.9 flag raised together (low rope cleat, Pedro pulls, Clara holds, Theo counts down on AAC)', '14.85 final line-up with equal prominence; end titles'],
}
out = []
for i, s in enumerate(SC):
    st, en = s['start'], s['end']
    out.append(dict(scene=i + 1, start=st, end=en, duration=round(en - st, 3), voice=[s['voice_start'], s['voice_end']], transition_in=TR[i],
        narration=s['text'], shots_local_time=SHOTS[i + 1],
        on_screen_text=[dict(t0=o['t0'], t1=min(o['t1'], 180.0), kind=o['kind'], text=o['text'].replace('<em>', '').replace('</em>', '').replace('<b>', '').replace('</b>', '').replace('<br>', ' ')) for o in OV if st - 0.01 <= o['t0'] < en],
        subtitle_cues=[c for c in CUES if st - 0.2 <= c['s'] < en], sfx=[x for x in SFX if st - 0.4 <= x['t'] < en]))
json.dump(dict(fps=60, width=1080, height=1920, duration=180.0, time_rule='t = frame / fps; all motion is a pure function of t', scenes=out), open(f'{R}/documentation/SCENE_TIMELINE.json', 'w'), ensure_ascii=False, indent=1)

def sha(p): return hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]
man = {
 'input_audio': [dict(file=os.path.relpath(p, R), sha256=sha(p), source='user recording (narration)') for p in sorted(glob.glob(f'{R}/assets/original_audio/*.m4a'))],
 'fonts': [dict(file='assets/generated_assets/fonts/Poppins-*.ttf', license='SIL Open Font License 1.1 (OFL.txt included)', source='github.com/google/fonts')],
 'libraries': [dict(name='three', version='0.180.0', license='MIT'), dict(name='gsap', version='3.13.0', license='GSAP Standard License (no-charge)'), dict(name='hyperframes', version='0.8.150', license='Apache-2.0'),
               dict(name='esbuild', version='0.25.10', license='MIT'), dict(name='faster-whisper (large-v3-turbo)', license='MIT'), dict(name='pedalboard', version='0.9.26', license='GPL-3.0'), dict(name='Rubber Band Library / CLI', version='3.3.0', license='GPL-2.0+'),
               dict(name='FFmpeg', version='6.1.1'), dict(name='NumPy / SciPy / librosa / pyloudnorm / soundfile')],
 'generated_by_code': {
   'characters': {'file': 'src/characters/humanoid.js + src/characters/cast.js', 'cast': list(json.load(open(f'{R}/documentation/cast_list.json')).keys()) if os.path.exists(f'{R}/documentation/cast_list.json') else 'see cast.js'},
   'rig': 'src/rigs/ik.js (2-bone IK), joint hierarchy in humanoid.js',
   'accessibility_objects': 'src/objects/accessibility.js (manual wheelchair, power wheelchair, AAC tablet, long white cane, phone, Bible, documents, pencil)',
   'icons_fx': 'src/objects/fx.js', 'environments': 'src/environments/outdoor.js, indoor.js, bible.js', 'scenes': 'src/scenes/s01..s10, kit.js, ui.js', 'compositor': 'src/core/stage.js',
   'music': 'src/audio/music.py (original, synthesised, no samples)', 'sfx': 'src/audio/sfx.py (synthesised, no samples)', 'overlay_titles_subtitles': 'tools/build_overlay.py -> hyperframes/main/index.html'},
 'not_used': ['official Pathfinder logos/emblems (not obtained — no substitute emblem was drawn)', 'image cut-outs, stock art, generative video', 'synthetic voice'],
 'standard_public_symbols': ['International Symbol of Access (wheelchair pictogram) drawn as simple geometry on the ramp sign', 'sunflower lanyard (Lei 14.624/2023) drawn as a green strap with yellow flowers'],
}
json.dump(man, open(f'{R}/documentation/ASSET_MANIFEST.json', 'w'), ensure_ascii=False, indent=1)
print('ok', len(out))
