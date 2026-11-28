# Data checker for public/*.json and public/cards.json.  python3 validate.py [--all]
# ERRORS (exit 1): missing title, year that is not a number or outside the clock
#   (71.25 million years ago .. 2100), lat/lon out of range or exactly 0,0, exact duplicate
#   records, duplicate card ids, cards whose year is outside their season, bad rarity.
# WARNINGS (printed, exit 0): land things (cities, wonders, fossil sites, battles that are not
#   naval) more than ~2 degrees from present-day land in mask.b64, same title twice in one list,
#   cards with no fact, card Wikipedia titles that do not look like titles, plant/species time
#   ranges that run backwards, data files with no source note.
# Run it before pushing any data change.  --all prints every warning instead of the first 8.
import json, os, re, sys, base64
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(ROOT, '..', 'public')
GW, GH = 720, 360
_m = base64.b64decode(open(os.path.join(ROOT, 'mask.b64')).read())
LAND = [(_m[i >> 3] >> (7 - (i & 7))) & 1 for i in range(GW * GH)]
Y0, Y1 = -71.25e6 - 1, 2100.01


def land_near(lat, lon, r=4):  # 4 cells = 2 degrees: the 0.5 degree mask misses small islands
    j0, i0 = int((90 - lat) * 2), int((lon + 180) * 2)
    for b in range(-r, r + 1):
        j = j0 + b
        if 0 <= j < GH and any(LAND[j * GW + (i0 + a) % GW] for a in range(-r, r + 1)):
            return True
    return False


NAVAL = re.compile(r'naval|sea|bay|strait|gulf|ocean|cape|sound|channel|harbou?r|river|lake|island|atoll|reef|convoy|sinking|raid on|attack on|fleet|isle|shoal', re.I)
# file: [(path, year idx, title idx, lat idx, lon idx, land rule, coord-list idx)]
# land rule: 'land' warn if far from land, 'nonnaval' same but skip watery titles, None no check
SCHEMA = {
    'battles.json': [('b', 0, 1, 2, 3, 'nonnaval', None)],
    'quakes_ncei.json': [('q', 0, 1, 2, 3, None, None)],
    'hazards.json': [('v', 0, 1, 2, 3, None, None), ('t', 0, 1, 2, 3, None, None)],
    'deeptime.json': [('dt', 0, 1, 2, 3, None, None)],
    'extinctions.json': [('ext', 0, 1, 3, 4, None, None), ('endg', None, 0, None, None, None, None)],
    'journeys.json': [('jrn', 0, 1, None, None, None, 3)],
    'landforms.json': [('lf', 0, 2, 3, 4, None, None)],
    'quakes.json': [('quakes', 0, 1, 2, 3, None, None), ('volc', 0, 1, 2, 3, None, None)],
    'storms.json': [('st', 0, 2, 3, 4, None, None)],
    'sky.json': [('sky', 0, 2, 3, 4, None, None)],
    'heritage.json': [('wh', 0, 1, 3, 4, None, None)],
    'wrecks.json': [('w', 0, 1, 2, 3, None, None)],
    'skyline.json': [('tb', 0, 1, 2, 3, 'land', None)],
    'wonders.json': [('won', 1, 0, 6, 7, 'land', None)],
    'inventions.json': [('inv', 0, 1, 2, 3, None, None)],
    'cities.json': [(None, None, 0, 1, 2, 'land', None)],
    'events.json': [(None, 0, 1, None, None, None, None)],
    'species.json': [('sp', None, 1, None, None, 'land', 13), ('plants', None, 0, None, None, 'land', 4)],
}
err, warn = defaultdict(list), defaultdict(list)


def num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and x == x


def coord(where, lat, lon, rule, title):
    if not (num(lat) and num(lon) and -90 <= lat <= 90 and -180 <= lon <= 180):
        err[where].append(f'bad coordinates {lat},{lon}: {title}'); return
    if lat == 0 and lon == 0:
        err[where].append(f'0,0 coordinates: {title}'); return
    if rule == 'land' or (rule == 'nonnaval' and not NAVAL.search(str(title))):
        if not land_near(lat, lon):
            warn[where].append(f'in the sea ({lat},{lon}): {title}')


def check_file(fn):
    p = os.path.join(PUB, fn)
    if not os.path.exists(p): return
    d = json.load(open(p))
    if isinstance(d, dict) and fn not in ('species.json', 'extinctions.json', 'journeys.json',
                                          'landforms.json', 'quakes.json', 'cities.json') and 'src' not in d:
        warn[fn].append('no "src" source note in the file')
    for key, yi, ti, la, lo, rule, cl in SCHEMA[fn]:
        recs = d if key is None else d.get(key)
        where = fn + (f':{key}' if key else '')
        if not isinstance(recs, list):
            err[where].append('list missing'); continue
        seen, titles = Counter(), Counter()
        for n, r in enumerate(recs):
            if not isinstance(r, list):
                err[where].append(f'record {n} is not a list'); continue
            t = r[ti] if ti is not None and ti < len(r) else None
            if key == 'lf': t = r[2] or r[9] or r[8]  # some landforms only carry an event title
            if not isinstance(t, str) or not t.strip():
                err[where].append(f'record {n}: missing title'); t = f'#{n}'
            if yi is not None:
                y = r[yi] if yi < len(r) else None
                if num(y) and y < Y0 and fn == 'events.json':
                    warn[where].append(f'before the clock starts, never shown ({y:g}): {t}')
                elif not num(y) or not (Y0 <= y <= Y1):
                    err[where].append(f'impossible year {y!r}: {t}')
            if la is not None and not (key == 'lf' and r[la] is None):  # null = keep the page's own spot
                coord(where, r[la] if la < len(r) else None, r[lo] if lo < len(r) else None, rule, t)
            if cl is not None:
                pts = r[cl] if cl < len(r) else None
                if not isinstance(pts, list):
                    err[where].append(f'place list missing: {t}')
                elif not pts:
                    warn[where].append(f'no fossil sites listed: {t}')
                else:
                    for q in pts:
                        coord(where, q[0], q[1], rule, f'{t} @ {q[2] if len(q) > 2 and isinstance(q[2], str) else q[:2]}')
                        if key == 'plants' and len(q) > 3 and num(q[2]) and num(q[3]) and q[2] < q[3]:
                            warn[where].append(f'time range runs backwards {q[2]}..{q[3]} Ma: {t}')
            if key == 'sp' and len(r) > 5 and num(r[4]) and num(r[5]) and r[4] < r[5]:
                warn[where].append(f'time range runs backwards {r[4]}..{r[5]} Ma: {t}')
            seen[json.dumps(r, sort_keys=True)] += 1; titles[(t, round(r[yi]) if yi is not None and num(r[yi]) else None)] += 1
        for s, c in seen.items():
            if c > 1: err[where].append(f'exact duplicate x{c}: {s[:100]}')
        for (t, y), c in titles.items():
            if c > 1 and key is not None: warn[where].append(f'same title and year x{c}: {t} ({y})')


def check_interactions():
    p = os.path.join(PUB, 'interactions.json')
    if not os.path.exists(p): return
    w = 'interactions.json'; seen = Counter()
    for n, r in enumerate(json.load(open(p)).get('rules', [])):
        if not isinstance(r, list) or len(r) < 6:
            err[w].append(f'rule {n} needs [actor, target, kind, weight, text, source]: {r}'); continue
        if not (num(r[3]) and 0 <= r[3] <= 1): err[w].append(f'weight {r[3]!r} not 0-1: rule {n}')
        if not (isinstance(r[5], str) and r[5].strip()): warn[w].append(f'unsourced rule {n}: {r[:3]}')
        seen[tuple(map(str, r[:3]))] += 1
    for k, c in seen.items():
        if c > 1: warn[w].append(f'same actor/target/kind x{c}: {k}')


WIKI_BAD = re.compile(r'[\[\]{}|<>#_]|https?:|^\s|\s$|\s\s')


def check_cards():
    p = os.path.join(PUB, 'cards.json')
    if not os.path.exists(p): return
    d = json.load(open(p)); seas = {s[0]: s for s in d['seasons']}
    ids = Counter(c[0] for c in d['cards'])
    for i, c in ids.items():
        if c > 1: err['cards.json'].append(f'duplicate id x{c}: {i}')
    nofact = 0
    for c in d['cards']:
        cid, se, kind, name, rar, y, fact, wiki = c[:8]
        s = seas.get(se)
        if not s: err['cards.json'].append(f'unknown season {se}: {cid}'); continue
        if not (s[2] - 1 <= y <= s[3] + 1): err['cards.json'].append(f'year {y} outside {se}: {cid}')
        if rar not in (1, 2, 3, 4, 5): err['cards.json'].append(f'bad rarity {rar}: {cid}')
        if not name: err['cards.json'].append(f'no name: {cid}')
        if not isinstance(wiki, str) or not wiki or WIKI_BAD.search(wiki) or len(wiki) > 120:
            warn['cards.json'].append(f'odd Wikipedia title {wiki!r}: {cid}')
        if not fact: nofact += 1
    if nofact: warn['cards.json'].append(f'{nofact} of {len(d["cards"])} cards have no fact line')


if __name__ == '__main__':
    every = '--all' in sys.argv
    for fn in SCHEMA: check_file(fn)
    check_interactions()
    check_cards()
    for lab, D in (('ERROR', err), ('warn', warn)):
        for where, L in sorted(D.items()):
            print(f'{lab} {where}: {len(L)}')
            for l in (L if every else L[:8]): print('   ', l)
            if not every and len(L) > 8: print(f'    ... {len(L) - 8} more (--all)')
    ne = sum(map(len, err.values())); nw = sum(map(len, warn.values()))
    print(f'{ne} errors, {nw} warnings')
    sys.exit(1 if ne else 0)
