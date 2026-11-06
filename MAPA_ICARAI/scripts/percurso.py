# Percurso infantil: 10 pontos de controle na rua em frente à coordenada da largada (Icaraí, Amontada-CE).
# Geometria da rua: OpenStreetMap (via 789957680), conferida contra a imagem aérea (diferença ~2 m).
# Cada ponto = posição ao longo da rua (s, metros a partir da largada; + para nordeste) e afastamento lateral
# (o, metros; + lado noroeste, - lado sudeste). Saída: dados/percurso.json (local em metros, lat/lon, UTM, rumos).
import sys, math, json; sys.path.insert(0, 'scripts'); import osm
from pyproj import Transformer
from pygeomag import GeoMag
LA0, LO0 = -3.0321152806467957, -39.66096466707304
KX, KY = 111320 * math.cos(math.radians(LA0)), 110574.0
nos, vias, pois = osm.ler('dados/icarai_osm_area1.osm')
rua = next(v for v in vias if v['id'] == '789957680')
P = [((lo - LO0) * KX, (la - LA0) * KY) for la, lo in rua['pts']]
if P[0][0] > P[-1][0]: P = P[::-1]          # de sudoeste para nordeste
# parâmetro s com origem no ponto da rua mais próximo da largada
acc = [0.0]
for i in range(1, len(P)): acc.append(acc[-1] + math.dist(P[i - 1], P[i]))
def proj0():
    best = (1e9, 0)
    for i in range(len(P) - 1):
        (x0, y0), (x1, y1) = P[i], P[i + 1]; dx, dy = x1 - x0, y1 - y0; L2 = dx * dx + dy * dy
        k = max(0, min(1, (-x0 * dx - y0 * dy) / L2)); d = math.hypot(x0 + k * dx, y0 + k * dy)
        if d < best[0]: best = (d, acc[i] + k * math.sqrt(L2))
    return best
d0, S0 = proj0()
def ponto(s, o=0.0):
    t = S0 + s
    for i in range(len(P) - 1):
        if acc[i + 1] >= t or i == len(P) - 2:
            (x0, y0), (x1, y1) = P[i], P[i + 1]; L = acc[i + 1] - acc[i]; k = (t - acc[i]) / L
            ux, uy = (x1 - x0) / L, (y1 - y0) / L
            return (x0 + k * (x1 - x0) - uy * o, y0 + k * (y1 - y0) + ux * o)
CTRL = [  # (s, o, lado, descrição)
    (18, -4.0, 'SE', 'calçada à direita (lado sudeste), logo depois das casas da largada'),
    (40, -5.0, 'SE', 'lado sudeste, ao lado do pequeno cercado de madeira'),
    (63, -3.5, 'SE', 'lado sudeste, no acostamento'),
    (89, -4.5, 'SE', 'lado sudeste, onde a rua começa a curva'),
    (114, -4.0, 'SE', 'lado sudeste, no meio da curva (ponto de virada)'),
    (124, 6.0, 'NO', 'lado noroeste, em frente às casas da curva (TRAVESSIA com monitor)'),
    (98, 6.0, 'NO', 'lado noroeste, perto das casas da curva'),
    (71, 7.0, 'NO', 'lado noroeste, no acostamento largo'),
    (44, 6.0, 'NO', 'lado noroeste, em frente ao muro das casas'),
    (17, 6.5, 'NO', 'lado noroeste, perto das casas em frente à largada'),
]
LETRAS = list('ORIENTAÇÃO')
geo = GeoMag(); DECL = geo.calculate(glat=LA0, glon=LO0, alt=0, time=2026 + 310 / 365).d
utm = Transformer.from_crs('EPSG:4326', 'EPSG:31984', always_xy=True)
def ll(x, y): return LA0 + y / KY, LO0 + x / KX
pts = [{'nome': 'LARGADA', 'x': 0.0, 'y': 0.0}] + [{'nome': str(i + 1), 'x': ponto(s, o)[0], 'y': ponto(s, o)[1], 'lado': ld, 'desc': ds, 'letra': LETRAS[i]} for i, (s, o, ld, ds) in enumerate(CTRL)] + [{'nome': 'CHEGADA', 'x': 0.0, 'y': 0.0}]
for p in pts:
    la, lo = ll(p['x'], p['y']); e, n = utm.transform(lo, la); p.update(lat=round(la, 7), lon=round(lo, 7), utmE=round(e, 1), utmN=round(n, 1))
pernas = []
for a, b in zip(pts[:-1], pts[1:]):
    dx, dy = b['x'] - a['x'], b['y'] - a['y']; d = math.hypot(dx, dy)
    azv = (math.degrees(math.atan2(dx, dy)) + 360) % 360; azm = (azv - DECL) % 360
    pernas.append({'de': a['nome'], 'para': b['nome'], 'dist': round(d, 1), 'az_verdadeiro': round(azv), 'az_magnetico': round(azm), 'passos': round(d / 0.5)})
rua_xy = [(round(x, 2), round(y, 2)) for x, y in P]
json.dump({'largada': {'lat': LA0, 'lon': LO0}, 'declinacao': round(DECL, 1), 'data_decl': '2026-11', 'pontos': pts, 'pernas': pernas, 'rua': rua_xy,
           'dist_largada_rua': round(d0, 1), 'total_m': round(sum(p['dist'] for p in pernas))}, open('dados/percurso.json', 'w'), ensure_ascii=False, indent=1)
print('declinação', round(DECL, 2), '| largada a', round(d0, 1), 'm do eixo da rua | total', round(sum(p['dist'] for p in pernas)), 'm')
for q in pernas: print(f"{q['de']:>8} → {q['para']:<8} {q['dist']:5.1f} m  rumo verd. {q['az_verdadeiro']:3d}°  bússola {q['az_magnetico']:3d}°  ≈{q['passos']} passos")
for p in pts[1:-1]: print(p['nome'], p['letra'], round(p['x'], 1), round(p['y'], 1), p['lat'], p['lon'])
open('kit/js/dados.js', 'w').write('const DADOS = ' + json.dumps(json.load(open('dados/percurso.json')), ensure_ascii=False) + ';\n')
