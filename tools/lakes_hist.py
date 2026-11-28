# Adds dated historic lake outlines to public/water.json as key "h": [name, fullUntil, goneBy, [[lon,lat],...]].
# Source: Natural Earth 1:10m "Historic lakes" (ne_10m_lakes_historic, public domain, naturalearthdata.com).
# Usage: python3 lakes_hist.py /path/to/ne_10m_lakes_historic.geojson
import json, sys
DATES = {  # lake at its historic size until the first year, gone (shrunk to today's outline) by the second
  'Aral Sea': (1960, 2000),       # Soviet irrigation from the Amu Darya and Syr Darya
  'Lake Chad': (1963, 1987),      # Sahel droughts and irrigation
  'Lake Texcoco': (1600, 1910),   # drained from the 1607 Huehuetoca drain to the 1900 Gran Canal
  'Lop Nur': (1950, 1972),        # Tarim River dammed upstream; dry by 1972
}
def simp(pts, tol):
    out = [pts[0]]
    for p in pts[1:]:
        if abs(p[0]-out[-1][0]) + abs(p[1]-out[-1][1]) >= tol: out.append(p)
    return out
src = json.load(open(sys.argv[1]))
H = []
for f in src['features']:
    n = f['properties']['name']; g = f['geometry']
    polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    for poly in polys:
        ring = [[round(x, 2), round(y, 2)] for x, y in poly[0]]
        ring = simp(ring, 0.04)
        if len(ring) >= 4: H.append([n, DATES[n][0], DATES[n][1], ring])
p = '../public/water.json'; w = json.load(open(p)); w['h'] = H
json.dump(w, open(p, 'w'), separators=(',', ':'), ensure_ascii=False)
print(len(H), sum(len(h[3]) for h in H), 'points')
