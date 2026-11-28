# Builds the page from the parts in tools/src/ (see CODEMAP.md for which file owns what).
#   python3 build.py           join src/* in name order -> tpl.html, run cards.js, write index.html and test.html
#   python3 build.py --force   same, but overwrite a hand-edited tpl.html (its edits are lost)
# tpl.html is a GENERATED file (not in git). Edit the owning file in tools/src/ instead.
import glob, hashlib, os, subprocess, sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))
PARTS = sorted(glob.glob('src/*'))
STAMP = '.tpl.sha'  # sha256 of the tpl.html this script last wrote (not in git)


def sha(s):
    return hashlib.sha256(s.encode()).hexdigest()


def owner(old, new):
    # name the src file that owns the first line where the hand-edited tpl.html differs
    a, b = old.split('\n'), new.split('\n')
    n = next((i for i in range(min(len(a), len(b))) if a[i] != b[i]), min(len(a), len(b)))
    line = 0
    for p in PARTS:
        c = open(p).read().count('\n')
        if n < line + c:
            return p, n - line + 1, n + 1
        line += c
    return PARTS[-1], 0, n + 1


t = ''.join(open(p).read() for p in PARTS)
if os.path.exists('tpl.html') and '--force' not in sys.argv:
    cur = open('tpl.html').read()
    last = open(STAMP).read().strip() if os.path.exists(STAMP) else None
    if cur != t and sha(cur) != last:
        p, ln, tl = owner(t, cur)
        sys.exit(f'''
STOP: tools/tpl.html was edited by hand, but it is now a generated file.
The page source lives in tools/src/ (one file per system; see tools/CODEMAP.md).
The first hand edit is at tpl.html line {tl}, which belongs to {p} (around line {ln}).
Make the same edit in that tools/src/ file, then run: python3 build.py --force
(--force overwrites tpl.html from tools/src/ and drops the hand edits in it.)
''')
open('tpl.html', 'w').write(t)
open(STAMP, 'w').write(sha(t))
subprocess.run(['node', 'cards.js'], check=False)
m = open('mask.b64').read(); tp = open('topo.b64').read()
open('index.html', 'w').write(t.replace('__MASK__', m).replace('__TOPO__', tp).replace('__THREE__', 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'))
open('test.html', 'w').write(t.replace('__MASK__', m).replace('__TOPO__', tp).replace('<script src="__THREE__"></script>', '<script>window.__TEST=1;if(location.hash)window.__TESTY=+location.hash.slice(1)</script><script src="node_modules/three/build/three.min.js"></script>'))
