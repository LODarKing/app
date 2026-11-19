"""Vetoriza o contorno do município de Amontada a partir do mapa de referência (raster).
Saída: src/mapa/contorno.json (pontos normalizados) + out/mapa_conferencia.png (contorno sobre a referência).
Uso: python3 tools/vetorizar_mapa.py"""
import json, numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage import measure

im = Image.open('assets/mapa_amontada_referencia.png').convert('L')
a = np.array(im).astype(int)
H, W = a.shape
m = a < 245                                   # cinza do município + traço preto + textos
m[:160, :170] = False                         # recorte do mapa do Ceará (detalhe no canto) fica fora
m = ndi.binary_opening(m, np.ones((3, 3)))    # tira as linhas de 1 px das coordenadas (39°45', 3°15')
m = ndi.binary_fill_holes(m)
lab, n = ndi.label(m)
sizes = ndi.sum(m, lab, range(1, n + 1))
m = lab == (1 + int(np.argmax(sizes)))
m = ndi.binary_closing(m, np.ones((3, 3)))
m = ndi.binary_fill_holes(m)
c = max(measure.find_contours(m.astype(float), 0.5), key=len)    # (linha, coluna)
pts = np.c_[c[:, 1], c[:, 0]]
pts = measure.approximate_polygon(pts, tolerance=0.9)
# suavização de Chaikin (2 passadas) para o traço ficar "de batom", sem degraus de pixel
def chaikin(p, k=2):
    for _ in range(k):
        q = np.r_[p, p[:1]]
        p = np.concatenate([np.c_[0.75 * q[:-1] + 0.25 * q[1:]], np.c_[0.25 * q[:-1] + 0.75 * q[1:]]], axis=1).reshape(-1, 2)
    return p
pts = chaikin(pts[:-1] if np.allclose(pts[0], pts[-1]) else pts)
x0, y0 = pts.min(0); x1, y1 = pts.max(0)
print('bbox ref (px):', x0, y0, x1, y1, 'pontos:', len(pts))
json.dump({'fonte': 'assets/mapa_amontada_referencia.png', 'bbox_ref': [float(x0), float(y0), float(x1), float(y1)],
           'pontos': [[round(float(x), 2), round(float(y), 2)] for x, y in pts]}, open('src/mapa/contorno.json', 'w'))
big = Image.open('assets/mapa_amontada_referencia.png').convert('RGB').resize((W * 3, H * 3))
d = ImageDraw.Draw(big)
d.line([(x * 3, y * 3) for x, y in np.r_[pts, pts[:1]]], fill=(217, 4, 41), width=3)
big.save('out/mapa_conferencia.png')
