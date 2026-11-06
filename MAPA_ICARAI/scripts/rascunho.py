# Rascunho de planejamento: imagem z17 + vias do OSM + cruzamentos numerados (candidatos a ponto de controle)
import sys, math, json, collections; sys.path.insert(0, 'scripts'); import osm
from PIL import Image, ImageDraw, ImageFont
la0, lo0, la1, lo1 = -3.0420, -39.6730, -3.0220, -39.6490
im = Image.open('dados/visao_z17.png').convert('RGB'); Wd, Hd = im.size
def px(lat, lon):
    z = 17; n = 2 ** z
    f = lambda la, lo: ((lo + 180) / 360 * n, (1 - math.log(math.tan(math.radians(la)) + 1 / math.cos(math.radians(la))) / math.pi) / 2 * n)
    X0, Y0 = f(la1, lo0); X, Y = f(lat, lon); return ((X - X0) * 256, (Y - Y0) * 256)
nos, vias, pois = osm.ler('dados/icarai_osm_area1.osm')
d = ImageDraw.Draw(im); fnt = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', 22)
uso = collections.Counter(); ends = collections.Counter()
cores = {'secondary': (255, 80, 80), 'tertiary': (255, 160, 0), 'residential': (255, 255, 255), 'unclassified': (255, 255, 255), 'service': (200, 200, 255), 'track': (255, 230, 120), 'footway': (120, 255, 120), 'path': (120, 255, 120)}
for v in vias:
    hw = v['tags'].get('highway')
    if hw:
        d.line([px(*p) for p in v['pts']], fill=cores.get(hw, (255, 0, 255)), width=3)
        for r in v['refs']: uso[r] += 1
        ends[v['refs'][0]] += 1; ends[v['refs'][-1]] += 1
    elif v['tags'].get('natural') == 'water' or v['tags'].get('amenity') in ('school', 'place_of_worship', 'clinic') or v['tags'].get('leisure') in ('park', 'pitch'):
        d.line([px(*p) for p in v['pts']], fill=(0, 255, 255), width=3)
cand = [r for r in nos if (uso[r] >= 2 or ends[r] == 1 and uso[r] == 1) and la0 < nos[r][0] < la1 and lo0 < nos[r][1] < lo1]
cand = [r for r in cand if uso[r] >= 1]
lista = {}
for i, r in enumerate(sorted(cand, key=lambda r: (-nos[r][0], nos[r][1]))):
    x, y = px(*nos[r]); tipo = 'X' if uso[r] >= 2 else 'F'
    d.ellipse([x - 7, y - 7, x + 7, y + 7], outline=(255, 0, 255) if tipo == 'X' else (0, 255, 0), width=3)
    d.text((x + 8, y - 26), str(i), fill=(255, 255, 0), font=fnt, stroke_width=3, stroke_fill=(0, 0, 0)); lista[i] = (r, nos[r][0], nos[r][1], tipo)
x, y = px(-3.0321152806467957, -39.66096466707304); d.polygon([(x, y - 22), (x + 20, y + 14), (x - 20, y + 14)], outline=(255, 0, 0), width=5)
im.save('dados/rascunho.png'); json.dump(lista, open('dados/candidatos.json', 'w'))
im.resize((Wd // 2, Hd // 2)).save('/tmp/claude-0/-home-user-app/0c264449-9bc8-5ff8-bcef-9fb42a0b41ca/scratchpad/rascunho_meio.png')
print(len(lista), 'candidatos', im.size)
