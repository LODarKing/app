"""Gera js/fotos_creditos.js a partir de documentacao/fotos_creditos.json (usado pelos PIPs)."""
import json
creds = json.load(open('documentacao/fotos_creditos.json'))
open('js/fotos_creditos.js', 'w').write('// gerado por fotos/gerar_js.py\nwindow.FOTO_CRED = ' + json.dumps({k: {'autor': v['autor'], 'licenca': v['licenca']} for k, v in creds.items()}, ensure_ascii=False) + ';\n')
print(len(creds), 'créditos')
