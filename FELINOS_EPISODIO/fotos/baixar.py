"""Baixa as fotos reais dos animais (imagem principal do artigo da Wikipédia, hospedada no Wikimedia Commons)
com autor e licença. As imagens ficam em assets/fotos/ (fora do git: material de terceiros); os créditos vão para
documentacao/fotos_creditos.json, e cada PIP mostra o crédito sobre a foto (exigência das licenças CC BY / CC BY-SA).
Uso: python3 fotos/baixar.py   (rodar a partir de FELINOS_EPISODIO/)"""
import json, re, sys, time, urllib.parse, urllib.request
UA = {'User-Agent': 'FelinosEducationalVideo/1.0 (https://github.com/LODarKing/app)'}
# chave -> (artigo da Wikipédia em inglês, ou 'File:...' para escolher uma foto específica do Commons)
FOTOS = {
    'tigre': 'Tiger', 'leao': 'Lion', 'onca': 'Jaguar', 'guepardo': 'Cheetah', 'leopardo': 'Leopard',
    'sucuarana': 'Cougar', 'jaguatirica': 'Ocelot', 'gato': 'Cat',
    'persa': 'Persian cat', 'siames': 'Siamese cat', 'mainecoon': 'Maine Coon', 'angora': 'Turkish Angora',
}
def get(url):
    for k in range(8):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
        except Exception as e:
            print('  tentando de novo:', e); time.sleep(30 * (k + 1))
    raise SystemExit('falhou: ' + url)
def api(**q):
    q.update(format='json'); return json.loads(get('https://en.wikipedia.org/w/api.php?' + urllib.parse.urlencode(q)))
sel = sys.argv[1:] or list(FOTOS)
creds = {}
try: creds = json.load(open('documentacao/fotos_creditos.json'))
except FileNotFoundError: pass
for key in sel:
    src = FOTOS[key]
    if src.startswith('File:'): ftitle = src
    else:
        s = json.loads(get('https://en.wikipedia.org/api/rest_v1/page/summary/' + urllib.parse.quote(src.replace(' ', '_'))))
        parts = s['originalimage']['source'].split('?')[0].split('/')   # .../commons/thumb/b/b0/<arquivo>/3840px-<arquivo>
        ftitle = 'File:' + urllib.parse.unquote(parts[-2] if '/thumb/' in s['originalimage']['source'] else parts[-1])
    d = api(action='query', titles=ftitle, prop='imageinfo', iiprop='extmetadata|url|size', iiurlwidth=1600)
    ii = list(d['query']['pages'].values())[0]['imageinfo'][0]; m = ii['extmetadata']
    clean = lambda k: re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', m.get(k, {}).get('value', ''))).strip()
    open(f'assets/fotos/{key}.jpg', 'wb').write(get(ii.get('thumburl', ii['url'])))
    creds[key] = {'arquivo': ftitle, 'autor': clean('Artist'), 'licenca': clean('LicenseShortName'), 'url_licenca': clean('LicenseUrl'),
                  'pagina': ii['descriptionurl'], 'tamanho_original': [ii['width'], ii['height']]}
    json.dump(creds, open('documentacao/fotos_creditos.json', 'w'), ensure_ascii=False, indent=1)   # salva a cada foto
    open('js/fotos_creditos.js', 'w').write('// gerado por fotos/baixar.py\nwindow.FOTO_CRED = ' + json.dumps({k: {'autor': v['autor'], 'licenca': v['licenca']} for k, v in creds.items()}, ensure_ascii=False) + ';\n')
    print(key, '|', ftitle, '|', creds[key]['autor'], '|', creds[key]['licenca'], flush=True); time.sleep(20)
