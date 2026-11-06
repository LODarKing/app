# Baixa e monta um mosaico de imagens de satélite (Esri World Imagery) para uma caixa lat/lon.
# Uso: python3 -I tiles.py z lat_min lon_min lat_max lon_max saida.png pasta_cache
import math, os, sys, time, io, urllib.request
from PIL import Image
z = int(sys.argv[1]); la0, lo0, la1, lo1 = map(float, sys.argv[2:6]); out = sys.argv[6]; cache = sys.argv[7]
def xy(lat, lon):
    n = 2 ** z; x = (lon + 180) / 360 * n; r = math.radians(lat); y = (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n
    return x, y
x0, y0 = xy(la1, lo0); x1, y1 = xy(la0, lo1)
tx0, ty0, tx1, ty1 = int(x0), int(y0), int(x1), int(y1)
W, H = (tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256
im = Image.new('RGB', (W, H))
os.makedirs(cache, exist_ok=True)
for ty in range(ty0, ty1 + 1):
    for tx in range(tx0, tx1 + 1):
        f = os.path.join(cache, f'{z}_{tx}_{ty}.jpg')
        if not os.path.exists(f):
            req = urllib.request.Request(f'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{ty}/{tx}', headers={'User-Agent': 'MapaBussolaDesbravadores/1.0'})
            open(f, 'wb').write(urllib.request.urlopen(req, timeout=60).read()); time.sleep(0.05)
        im.paste(Image.open(f).convert('RGB'), ((tx - tx0) * 256, (ty - ty0) * 256))
# recorta exatamente a caixa
cx0, cy0 = (x0 - tx0) * 256, (y0 - ty0) * 256; cx1, cy1 = (x1 - tx0) * 256, (y1 - ty0) * 256
im.crop((int(cx0), int(cy0), int(cx1), int(cy1))).save(out)
print(out, int(cx1 - cx0), 'x', int(cy1 - cy0))
