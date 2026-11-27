# Speed report: JS ms per frame, render ms, fps, draw calls and triangles in 5 eras,
# each seen from continent height and from the ground.
#   python3 perf.py                      print the table
#   python3 perf.py --save before.json   also save the numbers
#   python3 perf.py --compare before.json  print % change against a saved run,
#                                          flag anything more than 5% worse (exit 2)
#   python3 perf.py --eras 1500 1960     only these years (uses the default spot for each
#                                        known year, else 40N 10E)
# Needs tools/test.html (python3 build.py). Software WebGL is slow and noisy: compare runs
# made on the same machine, and treat JS ms changes under ~1 ms as noise.
import asyncio, json, sys, argparse
from harness import browser, open_year, look, stats

ERAS = [  # year, lat, lon, label
    (-70000000, 47.0, -107.0, 'Late Cretaceous, Montana'),
    (-30000, 45.0, 1.0, 'Ice Age, France'),
    (-480, 38.0, 23.7, 'Classical Greece'),
    (1500, 43.7, 11.2, 'Renaissance Italy'),
    (1960, 40.7, -74.0, 'New York 1960'),
]
ALTS = [(60, 'continent'), (1.5, 'ground')]
KEYS = ['js', 'render', 'fps', 'calls', 'tris']


async def run(eras, ms):
    out = {}
    async with browser() as (b, base):
        for y, la, lo, lab in eras:
            pg, errs = await open_year(b, base, y)
            for alt, an in ALTS:
                await look(pg, la, lo, alt, settle=3500)
                s = await stats(pg, ms)
                k = f'{y}@{an}'
                out[k] = {**s, 'label': lab, 'errors': errs[:3]}
                print(f"{k:>22}  js {s['js']:6.2f} ms  render {s['render']:6.1f} ms  fps {s['fps']:5.1f}  "
                      f"calls {s['calls']:4d}  tris {s['tris']:8d}" + ('  ERR ' + errs[0][:80] if errs else ''), flush=True)
            await pg.close()
    return out


def compare(old, new):
    worse = 0
    print('\nchange vs saved run (+ is worse for js/render/calls/tris, - is worse for fps)')
    for k, n in new.items():
        o = old.get(k)
        if not o: continue
        row = []
        for m in KEYS:
            a, c = o.get(m, 0), n.get(m, 0)
            pct = (c - a) / a * 100 if a else 0
            bad = (pct > 5 if m != 'fps' else pct < -5) and not (m == 'js' and abs(c - a) < 1)
            worse += bad and m in ('js', 'tris', 'calls')
            row.append(f"{m} {pct:+5.1f}%{'!' if bad else ' '}")
        print(f'{k:>22}  ' + '  '.join(row))
    tot = lambda d, m: sum(v.get(m, 0) for k, v in d.items() if k in new and k in old)
    for m in ('js', 'tris', 'calls'):
        a, c = tot(old, m), tot(new, m)
        if a: print(f'  total {m}: {a:.1f} -> {c:.1f} ({(c-a)/a*100:+.1f}%)')
    return worse


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--save'); ap.add_argument('--compare')
    ap.add_argument('--eras', nargs='*', type=float)
    ap.add_argument('--ms', type=int, default=3000, help='sampling time per view')
    a = ap.parse_args()
    eras = ERAS
    if a.eras:
        known = {e[0]: e for e in ERAS}
        eras = [known.get(int(y), (int(y), 40.0, 10.0, str(int(y)))) for y in a.eras]
    res = asyncio.run(run(eras, a.ms))
    if a.save: json.dump(res, open(a.save, 'w'), indent=1)
    if a.compare:
        sys.exit(2 if compare(json.load(open(a.compare)), res) else 0)
