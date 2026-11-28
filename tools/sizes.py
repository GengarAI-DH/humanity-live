# Size report: where the bytes in the shipped page go.
#   python3 sizes.py               sections of tpl.html (split at '// ====' headers), biggest
#                                  single lines (usually data tables), and the built index.html
#                                  with the embedded mask/topo blobs, raw and gzipped
#   python3 sizes.py --save s.json / --compare s.json   change per section since a saved run
#   python3 sizes.py --top 30      show more of the biggest lines
# Visitors download index.html gzipped, so the gz column is what a change really costs.
import argparse, gzip, json, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
KB = lambda n: n / 1024


def gz(s):
    return len(gzip.compress(s.encode('utf-8'), 6))


def sections(src):
    lines = src.split('\n')
    out, name, buf, start = [], 'head (html, css)', [], 1
    for i, l in enumerate(lines, 1):
        m = re.match(r'\s*// =+ (.*?) =*\s*$', l)
        if m or l.strip() == '</script>' and name != 'tail (html)':
            out.append((name, start, '\n'.join(buf)))
            name, buf, start = (m.group(1) if m else 'tail (html)'), [], i
        buf.append(l)
    out.append((name, start, '\n'.join(buf)))
    return out


def label(line):
    m = re.match(r'\s*(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)', line)
    if m:
        return m.group(1)
    m = re.match(r'\s*([A-Za-z_$][\w$.]*)\s*=', line)
    return m.group(1) if m else line.strip()[:30]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--top', type=int, default=15)
    ap.add_argument('--save'); ap.add_argument('--compare')
    a = ap.parse_args()
    src = open(os.path.join(ROOT, 'tpl.html'), encoding='utf-8').read()
    old = json.load(open(a.compare)) if a.compare else {}
    rec = {}
    print(f"{'section':<44}{'line':>6}{'KB':>9}{'gz KB':>8}")
    for name, start, txt in sections(src):
        k, g = KB(len(txt.encode())), KB(gz(txt))
        rec[name] = round(g, 1)
        d = f'  {g - old[name]:+.1f} gz' if name in old and abs(g - old[name]) >= .1 else ''
        print(f'{name[:43]:<44}{start:>6}{k:9.1f}{g:8.1f}{d}')
    t, tg = KB(len(src.encode())), KB(gz(src))
    print(f"{'tpl.html total':<50}{t:9.1f}{tg:8.1f}" + (f"  {tg - old.get('_total', tg):+.1f} gz" if old else ''))
    rec['_total'] = round(tg, 1)
    print(f'\nbiggest single lines (data tables):')
    lines = src.split('\n')
    big = sorted(range(len(lines)), key=lambda i: -len(lines[i]))[:a.top]
    for i in big:
        print(f'  line {i + 1:>5}  {KB(len(lines[i].encode())):7.1f} KB  {KB(gz(lines[i])):6.1f} gz  {label(lines[i])}')
    for f in ('mask.b64', 'topo.b64'):
        p = os.path.join(ROOT, f)
        if os.path.exists(p):
            print(f'  {f:<14} {KB(os.path.getsize(p)):7.1f} KB embedded at build')
    p = os.path.join(ROOT, 'index.html')
    if os.path.exists(p):
        s = open(p, encoding='utf-8').read()
        print(f'\nbuilt index.html  {KB(len(s.encode())):.1f} KB, {KB(gz(s)):.1f} KB gzipped (run build.py first for current numbers)')
        rec['_index_gz'] = round(KB(gz(s)), 1)
    if a.save:
        json.dump(rec, open(a.save, 'w'), indent=1)


if __name__ == '__main__':
    main()
