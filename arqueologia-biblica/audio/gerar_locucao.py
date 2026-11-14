"""Locução do piloto pela conta ElevenLabs do usuário, com a VOZ SALVA dele (sem clonar de novo, sem voz do sistema).
Chave: neste ambiente de nuvem, a chave fica em "Network secrets" do ambiente e o proxy a injeta no cabeçalho xi-api-key
(o script nunca vê nem registra o valor). No computador local: ELEVENLABS_API_KEY em .env (ignorado pelo git).

Passos:
  python3 audio/gerar_locucao.py --vozes            # lista as vozes da conta (GET /v2/voices, com paginação). Não gasta créditos.
  python3 audio/gerar_locucao.py --voz <ID|nome>    # grava a escolha em audio/piloto/voz.json (configuração não sensível)
  python3 audio/gerar_locucao.py --gerar            # UM take de TTS com tempos por caractere (POST /v1/text-to-speech/{id}/with-timestamps)
  python3 audio/gerar_locucao.py --posicionar       # sem custo: separa as 3 frases nas pausas e posiciona na linha do tempo de 10 s
Regras: só gera se ainda não houver take (use --forcar para um novo take, de propósito); nunca escolhe voz por conta própria
quando há mais de uma voz pessoal salva."""
import base64, json, os, subprocess, sys, urllib.request, urllib.error, urllib.parse
import numpy as np, soundfile as sf
API = 'https://api.elevenlabs.io'
PASTA = 'audio/piloto'
TEXTO = 'Uma pedra de quase três mil anos menciona a casa de Davi. E não é lenda: é arqueologia bíblica!'
CFG_VOZ = f'{PASTA}/voz.json'

def chave_local():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if not k and os.path.exists('.env'):
        for l in open('.env'):
            if l.strip().startswith('ELEVENLABS_API_KEY='): k = l.split('=', 1)[1].strip().strip('"\'')
    return k
def req(metodo, caminho, corpo=None, params=None):
    url = API + caminho + ('?' + urllib.parse.urlencode(params) if params else '')
    h = {'Content-Type': 'application/json', 'Accept': 'application/json'}
    k = chave_local()
    if k: h['xi-api-key'] = k                     # local; na nuvem o proxy injeta o cabeçalho
    r = urllib.request.Request(url, method=metodo, headers=h, data=json.dumps(corpo).encode() if corpo is not None else None)
    try:
        with urllib.request.urlopen(r, timeout=120) as f: return json.loads(f.read())
    except urllib.error.HTTPError as e:
        d = e.read().decode(errors='replace')[:600]
        sys.exit(f'ERRO {e.code} em {caminho}: {d}')

def vozes():
    out, tok = [], None
    while True:
        p = {'page_size': 100, 'include_total_count': 'true'}
        if tok: p['next_page_token'] = tok
        d = req('GET', '/v2/voices', params=p); out += d.get('voices', [])
        if not d.get('has_more'): break
        tok = d.get('next_page_token')
    return out
def pessoais(vs): return [v for v in vs if v.get('category') not in ('premade',)]

def cmd_vozes():
    vs = vozes(); ps = pessoais(vs)
    print(f'{len(vs)} vozes na conta; {len(ps)} pessoais (clonadas/profissionais/geradas):')
    for v in ps: print(f"  {v['voice_id']}  |  {v['name']}  |  {v.get('category')}  |  modelos HQ: {v.get('high_quality_base_model_ids')}")
    if len(ps) == 1: print('Uma única voz pessoal: pode ser escolhida sem ambiguidade (use --voz para confirmar).')
    elif len(ps) > 1: print('Há mais de uma voz pessoal: o usuário precisa indicar qual é a correta (--voz <ID ou nome>).')
    return ps

def cmd_voz(sel):
    ps = pessoais(vozes()); m = [v for v in ps if v['voice_id'] == sel or v['name'].strip().lower() == sel.strip().lower()]
    if len(m) != 1: sys.exit(f'Voz "{sel}" não encontrada de forma inequívoca entre as vozes pessoais ({len(m)} correspondências).')
    v = m[0]; json.dump({'voice_id': v['voice_id'], 'nome': v['name'], 'categoria': v.get('category'), 'modelos_hq': v.get('high_quality_base_model_ids')}, open(CFG_VOZ, 'w'), indent=1, ensure_ascii=False)
    print('voz salva em', CFG_VOZ, '->', v['name'], v['voice_id'])

def escolhe_modelo(voz):
    ms = req('GET', '/v1/models'); ok = []
    for m in ms:
        langs = [l.get('language_id', '').lower() for l in m.get('languages', [])]
        if m.get('can_do_text_to_speech') and any(l.startswith('pt') for l in langs): ok.append(m['model_id'])
    hq = voz.get('modelos_hq') or []
    for pref in ['eleven_v3', 'eleven_multilingual_v2']:                # mais expressivo primeiro; só IDs que a API listou
        if pref in ok and (not hq or pref in hq): return pref, ok
    if hq and any(m in ok for m in hq): return [m for m in hq if m in ok][0], ok
    if not ok: sys.exit('Nenhum modelo de TTS com português disponível nesta conta.')
    return ok[0], ok

def cmd_gerar(forcar=False):
    if not os.path.exists(CFG_VOZ): sys.exit('Escolha a voz primeiro: --vozes e depois --voz <ID|nome>.')
    bruto = f'{PASTA}/narracao_piloto_bruta.mp3'
    if os.path.exists(bruto) and not forcar: sys.exit('Já existe um take (narracao_piloto_bruta.mp3). Use --forcar para gerar outro de propósito.')
    voz = json.load(open(CFG_VOZ)); modelo, todos = escolhe_modelo(voz)
    ajustes = {'stability': 0.5, 'similarity_boost': 0.8, 'style': 0.3, 'use_speaker_boost': True, 'speed': 1.0}
    if modelo == 'eleven_v3': ajustes = {'stability': 0.5, 'similarity_boost': 0.8}   # v3 aceita estabilidade 0 / 0,5 / 1
    print(f'modelo: {modelo} (disponíveis com português: {todos}); voz: {voz["nome"]}')
    corpo = {'text': TEXTO, 'model_id': modelo, 'voice_settings': ajustes, 'language_code': 'pt'}
    d = req('POST', f"/v1/text-to-speech/{voz['voice_id']}/with-timestamps", corpo, {'output_format': 'mp3_44100_128'})
    open(bruto, 'wb').write(base64.b64decode(d['audio_base64']))
    json.dump({'modelo': modelo, 'voz': voz['nome'], 'voice_id': voz['voice_id'], 'ajustes': ajustes, 'texto': TEXTO, 'alignment': d.get('alignment'), 'normalized_alignment': d.get('normalized_alignment')}, open(f'{PASTA}/tts_bruto.json', 'w'), ensure_ascii=False, indent=1)
    print('take salvo:', bruto)

def palavras_do_alinhamento(al):
    ch, a, b = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']; ws, cur = [], None
    for c, x, y in zip(ch, a, b):
        if c.isspace():
            if cur: ws.append(cur); cur = None
            continue
        if cur is None: cur = [c, x, y]
        else: cur[0] += c; cur[2] = y
    if cur: ws.append(cur)
    return ws

def cmd_posicionar():
    """Sem custo. Separa as frases nas pausas reais do take e as posiciona: frase 1 em 0,25 s; pausas naturais
    alongadas (até 1,1 s / 0,9 s) para que 'arqueologia' caia perto de 6,5 s (storyboard). A voz NÃO é acelerada nem esticada."""
    j = json.load(open(f'{PASTA}/tts_bruto.json')); ws = palavras_do_alinhamento(j['alignment'])
    wav = f'{PASTA}/_bruta_48k.wav'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{PASTA}/narracao_piloto_bruta.mp3', '-ac', '1', '-ar', '48000', wav], check=True)
    x, sr = sf.read(wav)
    fim = [i for i, w in enumerate(ws) if w[0].endswith(('.', ':', '!'))]
    if len(fim) < 3: sys.exit(f'Esperava 3 frases, encontrei {len(fim)}: {[w[0] for w in ws]}')
    fr = [(0, fim[0]), (fim[0] + 1, fim[1]), (fim[1] + 1, fim[2])]
    corte = lambda i: (ws[i][2] + ws[i + 1][1]) / 2                     # meio da pausa entre frases
    lim = [0.0, corte(fim[0]), corte(fim[1]), len(x) / sr]
    seg = [x[int(lim[k] * sr): int(lim[k + 1] * sr)] for k in range(3)]
    # tempos internos de cada frase (relativos ao início do segmento) e pausas naturais
    d1, d2 = ws[fim[0]][2] - ws[0][1], ws[fim[1]][2] - ws[fr[1][0]][1]
    n12, n23 = ws[fr[1][0]][1] - ws[fim[0]][2], ws[fr[2][0]][1] - ws[fim[1]][2]
    iarq = next(i for i in range(fr[2][0], fim[2] + 1) if 'arqueologia' in ws[i][0].lower())
    off_arq = ws[iarq][1] - ws[fr[2][0]][1]
    base = 0.25 + d1 + n12 + d2 + n23 + off_arq; extra = 6.5 - base
    g12 = n12 + max(0, min(1.1 - n12, extra * 0.6)); g23 = n23 + max(0, min(0.9 - n23, extra - (g12 - n12)))
    inicio = [0.25, 0.25 + d1 + g12, 0.25 + d1 + g12 + d2 + g23]       # início da 1ª palavra de cada frase
    out = np.zeros(int(10.0 * sr)); pal = []
    for k, (i0, i1) in enumerate(fr):
        desloc = inicio[k] - ws[i0][1]                                  # tempo no take -> tempo no vídeo
        a = int((lim[k] + desloc) * sr); s = seg[k]; f = np.ones(len(s)); r = int(0.012 * sr); f[:r] = np.linspace(0, 1, r); f[-r:] = np.linspace(1, 0, r)
        if a < 0: s, f, a = s[-a:], f[-a:], 0
        n = min(len(s), len(out) - a); out[a:a + n] += (s * f)[:n]
        pal += [[w[0], round(w[1] + desloc, 3), round(w[2] + desloc, 3)] for w in ws[i0:i1 + 1]]
    sf.write(f'{PASTA}/narracao_piloto.wav', out.astype(np.float32), sr, subtype='PCM_24')
    json.dump({'fonte': f"ElevenLabs ({j['modelo']}, voz {j['voz']}) — tempos por caractere do próprio take, frases posicionadas sem alterar a velocidade", 'pausas_naturais_s': [round(n12, 3), round(n23, 3)], 'pausas_usadas_s': [round(g12, 3), round(g23, 3)], 'palavras': pal}, open(f'{PASTA}/alinhamento.json', 'w'), ensure_ascii=False, indent=1)
    print('narração posicionada: audio/piloto/narracao_piloto.wav | voz de', pal[0][1], 'a', pal[-1][2], 's | pausas', round(g12, 2), round(g23, 2))

if __name__ == '__main__':
    a = sys.argv[1:]
    if '--vozes' in a: cmd_vozes()
    elif '--voz' in a: cmd_voz(a[a.index('--voz') + 1])
    elif '--gerar' in a: cmd_gerar('--forcar' in a)
    elif '--posicionar' in a: cmd_posicionar()
    else: print(__doc__)
