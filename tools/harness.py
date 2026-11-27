# Shared test-page helpers for perf.py and shots.py (and any new tool).
# Serves tools/ on a local port, opens test.html#<year> in headless Chrome
# (software WebGL), closes the intro and moves the camera.
import asyncio, os, subprocess, sys, time, socket, contextlib
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
ARGS = ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']


def free_port():
    with contextlib.closing(socket.socket()) as s:
        s.bind(('127.0.0.1', 0)); return s.getsockname()[1]


@contextlib.asynccontextmanager
async def browser():
    """async with browser() as (b, base): ...  base is the http://localhost:port URL of tools/."""
    if not os.path.exists(os.path.join(ROOT, 'test.html')):
        sys.exit('tools/test.html missing: run python3 build.py in tools/ first')
    if not os.path.exists(os.path.join(ROOT, 'node_modules/three/build/three.min.js')):
        sys.exit('three.js missing: run npm i three@0.128.0 in tools/')
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'],
                           cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(.8)
    try:
        async with async_playwright() as p:
            chrome = '/usr/bin/google-chrome' if os.path.exists('/usr/bin/google-chrome') else None
            b = await p.chromium.launch(executable_path=chrome, args=ARGS)
            try:
                yield b, f'http://127.0.0.1:{port}'
            finally:
                await b.close()
    finally:
        srv.terminate()


async def open_year(b, base, year, w=430, h=900, scale=1, wait=12000):
    """New page at test.html#year with the intro closed. Returns (page, errors list)."""
    pg = await b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=scale)
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:300]))
    await pg.goto(f'{base}/test.html#{year}')
    await pg.wait_for_timeout(wait)
    await pg.evaluate("()=>{const g=document.getElementById('go');if(g&&g.offsetParent!==null)g.click()}")
    await pg.wait_for_timeout(500)
    return pg, errs


async def look(pg, lat, lon, alt, settle=2500):
    """Point the camera at lat/lon from altitude alt (1.5 ground, 10 region, 60 continent)."""
    await pg.evaluate("([la,lo,al])=>{const C=window.__C;C.cam.fly=null;C.cam.tour=false;"
                      "C.cam.t.copy(C.v3(la,lo));C.cam.alt=al}", [lat, lon, alt])
    await pg.wait_for_timeout(settle)


async def stats(pg, ms=3000):
    """Average JS ms/frame, render ms/frame and fps over ms, plus draw calls / triangles of the last frame."""
    await pg.evaluate("()=>{window.__PT={js:0,r:0,n:0};window.__PT.t0=performance.now()}")
    await pg.wait_for_timeout(ms)
    return await pg.evaluate("""()=>{const P=window.__PT,i=window.__R.renderer.info,el=performance.now()-P.t0;
      window.__PT=null;
      return {js:P.n?P.js/P.n:0,render:P.n?P.r/P.n:0,fps:P.n*1000/el,frames:P.n,
        calls:i.render.calls,tris:i.render.triangles,geos:i.memory.geometries,tex:i.memory.textures}}""")
