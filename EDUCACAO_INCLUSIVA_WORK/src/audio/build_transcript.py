import json, re, difflib, unicodedata
takes = json.load(open('documentation/transcript_clean_takes.json'))
order = ['Narrac_a_o_Educac_a_o_Inclusiva_%02d.wav' % i for i in range(1, 9)] + ['Narrac_a_o_09_e_10.wav']
FIX = {'Ellen': 'Helen', 'Killer': 'Keller', 'Mephibosete': 'Mefibosete', 'Jônadas': 'Jônatas', 'porque': 'por que'}
ref = []
for k in order:
    for w in takes[k]['words']:
        t = w['w'].strip()
        core = re.sub(r'[^\wÀ-ÿ]', '', t)
        if core in FIX: t = t.replace(core, FIX[core])
        ref.append(t)
fin = json.load(open('documentation/transcript_final_raw.json'))['voice_edited.wav']['words']
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)
A = [norm(w) for w in ref]; B = [norm(w['w']) for w in fin]
sm = difflib.SequenceMatcher(a=A, b=B, autojunk=False)
out = []
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == 'equal':
        for i, j in zip(range(i1, i2), range(j1, j2)):
            out.append(dict(w=ref[i], s=fin[j]['s'], e=fin[j]['e']))
    else:
        # distribute reference words over the matched final span
        s = fin[j1]['s'] if j1 < len(fin) and j2 > j1 else out[-1]['e']
        e = fin[j2-1]['e'] if j2 > j1 else s + 0.3*(i2-i1)
        n = max(1, i2-i1)
        for k, i in enumerate(range(i1, i2)):
            out.append(dict(w=ref[i], s=round(s+(e-s)*k/n, 3), e=round(s+(e-s)*(k+1)/n, 3)))
        print('realigned', op, ref[i1:i2], [fin[j]['w'] for j in range(j1, j2)])
merged = []
for w in out:
    if w['w'].startswith('-') and merged:
        merged[-1]['w'] += w['w']; merged[-1]['e'] = w['e']
    else: merged.append(w)
out = merged
json.dump(dict(source='audio/voice_edited.wav', note='Word timestamps from Whisper large-v3-turbo on the final edited voice; spelling and punctuation reconciled with the per-take transcripts and manually reviewed terms.', words=out), open('audio/../documentation/transcricao_timestamps.json', 'w'), ensure_ascii=False, indent=1)
txt = ' '.join(w['w'] for w in out)
open('documentation/transcricao_final.txt', 'w').write(txt + '\n')
print(txt)
