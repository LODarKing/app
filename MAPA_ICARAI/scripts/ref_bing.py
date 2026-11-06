# Referência visual (não vai para o produto final): mosaico Bing Aerial z19 em volta do ponto, com grade de 10 m.
import math, os, sys, urllib.request, io
from PIL import Image, ImageDraw
la0, lo0 = -3.0321152806467957, -39.66096466707304; z = 19; R = float(sys.argv[1]) if len(sys.argv) > 1 else 90; cache = 'dados/ref_bing'
os.makedirs(cache, exist_ok=True)
n = 2 ** z
def fxy(lat, lon): r = math.radians(lat); return (lon + 180) / 360 * n * 256, (1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * n * 256
def qk(x, y):
    s = ''
    for i in range(z, 0, -1):
        d = 0; m = 1 << (i - 1)
        if x & m: d += 1
        if y & m: d += 2
        s += str(d)
    return s
cx, cy = fxy(la0, lo0); mpp = 156543.03 * math.cos(math.radians(la0)) / n
h = R / mpp; x0, y0, x1, y1 = cx - h, cy - h, cx + h, cy + h
im = Image.new('RGB', (int(x1 // 256 - x0 // 256 + 1) * 256, int(y1 // 256 - y0 // 256 + 1) * 256))
for ty in range(int(y0 // 256), int(y1 // 256) + 1):
    for tx in range(int(x0 // 256), int(x1 // 256) + 1):
        f = f'{cache}/{tx}_{ty}.jpg'
        if not os.path.exists(f): open(f, 'wb').write(urllib.request.urlopen(f'https://ecn.t{(tx+ty)%4}.tiles.virtualearth.net/tiles/a{qk(tx, ty)}.jpeg?g=1', timeout=30).read())
        im.paste(Image.open(f), (int((tx - x0 // 256) * 256), int((ty - y0 // 256) * 256)))
ox, oy = x0 - (x0 // 256) * 256, y0 - (y0 // 256) * 256
im = im.crop((int(ox), int(oy), int(ox + 2 * h), int(oy + 2 * h)))
im.save('dados/ref_bing_z19.png')
s = 1000 / im.size[0]; v = im.resize((1000, 1000), Image.LANCZOS); d = ImageDraw.Draw(v)
for k in range(-20, 21):
    p = 500 + k * 10 / mpp * s; c = (255, 255, 0) if k % 5 == 0 else (255, 255, 255)
    d.line([(p, 0), (p, 1000)], fill=c, width=1); d.line([(0, p), (1000, p)], fill=c, width=1)
d.ellipse([492, 492, 508, 508], outline=(255, 0, 0), width=3)
v.save(sys.argv[2] if len(sys.argv) > 2 else 'dados/ref_bing_grade.png'); print('mpp', mpp, 'tam', im.size)
