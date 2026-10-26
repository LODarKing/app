"""Contornos vetoriais (Natural Earth 1:110m, domínio público) -> caminhos SVG para as cenas 5 (Américas) e 9 (Brasil)."""
import json, math, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(R)
d = json.load(open('assets/geo/ne_110m_admin_0_countries.geojson'))
def merc(lon, lat):
    lat = max(-80, min(80, lat))
    return lon, -math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))
def rings(geom):
    if geom['type'] == 'Polygon': return [geom['coordinates'][0]]
    return [p[0] for p in geom['coordinates']]
def fit(features, box, keep=lambda lon, lat: True):
    pts = [merc(lo, la) for f in features for r in rings(f['geometry']) for lo, la in r if keep(lo, la)]
    x0, x1 = min(p[0] for p in pts), max(p[0] for p in pts); y0, y1 = min(p[1] for p in pts), max(p[1] for p in pts)
    bx, by, bw, bh = box; s = min(bw / (x1 - x0), bh / (y1 - y0))
    ox, oy = bx + (bw - (x1 - x0) * s) / 2, by + (bh - (y1 - y0) * s) / 2
    out = []
    for f in features:
        parts = []
        for r in rings(f['geometry']):
            q = [merc(lo, la) for lo, la in r if keep(lo, la)]
            if len(q) < 3: continue
            parts.append('M' + ' L'.join(f'{ox + (x - x0) * s:.1f} {oy + (y - y0) * s:.1f}' for x, y in q) + 'Z')
        if parts:
            cx = sum(merc(lo, la)[0] for r in rings(f['geometry']) for lo, la in r) / sum(len(r) for r in rings(f['geometry']))
            cy = sum(merc(lo, la)[1] for r in rings(f['geometry']) for lo, la in r) / sum(len(r) for r in rings(f['geometry']))
            out.append({'name': f['properties']['NAME'], 'iso': f['properties']['ISO_A3'], 'd': ' '.join(parts), 'c': [round(ox + (cx - x0) * s, 1), round(oy + (cy - y0) * s, 1)]})
    return out
am = [f for f in d['features'] if f['properties']['CONTINENT'] in ('North America', 'South America') and f['properties']['NAME'] != 'Greenland']
americas = fit(am, (140, 420, 800, 860), keep=lambda lo, la: lo < -30 and lo > -170)
br = [f for f in d['features'] if f['properties']['ISO_A3'] == 'BRA']
brazil = fit(br, (190, 430, 700, 700))[0]
json.dump({'americas': americas, 'brazil': brazil}, open('remotion/src/full/geo.json', 'w'))
print(len(americas), 'países nas Américas;', len(brazil['d']), 'bytes Brasil')
