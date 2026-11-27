# Screenshots of any list of views, plus a labelled contact sheet.
#   python3 shots.py 1500,43.7,11.2,1.5 1500,43.7,11.2,10 -70000000,47,-107,60
#   python3 shots.py --file views.txt --out shots/after
#   python3 shots.py --pair shots/before shots/after     side-by-side sheet of two runs
# A view is year,lat,lon,alt[,js] where alt is 1.5 ground, 10 region, 60 continent and the
# optional js runs in the page first (HS.X scope, e.g. "cam.yaw=1"). views.txt holds one view
# per line (# comments allowed). Pages are reused per year so a run of 10 views is quick.
# --hide-ui hides the panels so only the 3D world shows. --scale 2 for shots a person will see.
import asyncio, argparse, os, re, sys
from harness import browser, open_year, look
from PIL import Image, ImageDraw


def parse(v):
    p = v.split(',', 4)
    return float(p[0]), float(p[1]), float(p[2]), float(p[3]), (p[4] if len(p) > 4 else '')


def name(v):
    y, la, lo, al, js = v
    return re.sub(r'[^0-9A-Za-z_.-]', '_', f'{int(y)}_{la:g}_{lo:g}_a{al:g}') + ('_js' if js else '')


HIDE = """()=>{if(document.getElementById('__hide'))return;const s=document.createElement('style');s.id='__hide';
s.textContent='body>*:not(canvas){visibility:hidden!important} canvas{visibility:visible!important}';
document.head.appendChild(s)}"""


async def run(views, out, scale, hide, settle):
    os.makedirs(out, exist_ok=True)
    files = []
    async with browser() as (b, base):
        pg = None; cur = None
        for v in views:
            if v[0] != cur:
                if pg: await pg.close()
                pg, errs = await open_year(b, base, int(v[0]), scale=scale); cur = v[0]
                if hide: await pg.evaluate(HIDE)
            if v[4]: await pg.evaluate('c=>HS.X(c)', v[4])
            await look(pg, v[1], v[2], v[3], settle)
            f = os.path.join(out, name(v) + '.png')
            await pg.screenshot(path=f); files.append((f, name(v)))
            print(f, ('ERR ' + errs[-1][:100]) if errs else '', flush=True)
        if pg: await pg.close()
    return files


def sheet(cols, path, thumb=300):
    """cols: list of columns, each a list of (file, label). Rows line up across columns."""
    rows = max(len(c) for c in cols)
    ims = {}
    for c in cols:
        for f, _ in c:
            im = Image.open(f).convert('RGB'); im.thumbnail((thumb, thumb * 3)); ims[f] = im
    h = max(im.height for im in ims.values()) + 22
    S = Image.new('RGB', (thumb * len(cols) + 4 * (len(cols) - 1), h * rows), (20, 20, 24))
    d = ImageDraw.Draw(S)
    for ci, c in enumerate(cols):
        for ri, (f, lab) in enumerate(c):
            x, y = ci * (thumb + 4), ri * h
            S.paste(ims[f], (x, y + 22)); d.text((x + 4, y + 5), lab[:48], fill=(235, 235, 235))
    S.save(path); print('sheet', path)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('views', nargs='*'); ap.add_argument('--file')
    ap.add_argument('--out', default='shots/now'); ap.add_argument('--scale', type=int, default=1)
    ap.add_argument('--hide-ui', action='store_true'); ap.add_argument('--settle', type=int, default=3000)
    ap.add_argument('--pair', nargs=2, metavar=('BEFORE_DIR', 'AFTER_DIR'))
    # views can start with '-' (BCE years), so pull them out before argparse sees them
    argv = sys.argv[1:]; pos = [x for x in argv if re.match(r'^-?[0-9.e]+,', x)]
    a = ap.parse_args([x for x in argv if x not in pos]); a.views = pos + a.views
    if a.pair:
        A, B = a.pair
        both = sorted(set(os.listdir(A)) & set(f for f in os.listdir(B)) - {'sheet.png'})
        both = [f for f in both if f.endswith('.png')]
        sheet([[(os.path.join(A, f), 'before ' + f[:-4]) for f in both],
               [(os.path.join(B, f), 'after ' + f[:-4]) for f in both]], os.path.join(B, 'pair.png'))
    else:
        vs = list(a.views)
        if a.file:
            vs += [l.strip() for l in open(a.file) if l.strip() and not l.lstrip().startswith('#')]
        if not vs: ap.error('give views or --file')
        views = [parse(v) for v in vs]
        files = asyncio.run(run(views, a.out, a.scale, a.hide_ui, a.settle))
        sheet([files[i:i + 3] for i in range(0, len(files), 3)], os.path.join(a.out, 'sheet.png'))
