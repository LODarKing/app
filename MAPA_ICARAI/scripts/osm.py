# Lê um arquivo .osm (XML da API do OpenStreetMap) e devolve nós, vias e pontos de interesse.
import xml.etree.ElementTree as ET
def ler(path):
    r = ET.parse(path).getroot(); nos, vias, pois = {}, [], []
    for n in r.iter('node'):
        nos[n.get('id')] = (float(n.get('lat')), float(n.get('lon')))
        tags = {t.get('k'): t.get('v') for t in n.iter('tag')}
        if tags and any(k in tags for k in ('amenity', 'shop', 'leisure', 'tourism', 'place', 'natural', 'man_made', 'building', 'religion', 'sport')):
            pois.append({'id': n.get('id'), 'lat': nos[n.get('id')][0], 'lon': nos[n.get('id')][1], 'tags': tags})
    for w in r.iter('way'):
        tags = {t.get('k'): t.get('v') for t in w.iter('tag')}
        refs = [nd.get('ref') for nd in w.iter('nd')]
        pts = [nos[x] for x in refs if x in nos]
        vias.append({'id': w.get('id'), 'tags': tags, 'refs': refs, 'pts': pts})
    return nos, vias, pois
