"""Annoyance check: counts automatic popups per minute in 3 eras.
Run from tools/ after build.py: python3 annoy.py   (fails if any view shows more than 3 a minute)
"""
import asyncio,sys,subprocess,time,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,'-m','http.server','8781'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
BAD=[]
from playwright.async_api import async_playwright
VIEWS=[(-71200000,'deep',1.5),(1500,'med',2),(1995,'mod',2)]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
    for y,tag,alt in VIEWS:
      pg=await b.new_page(viewport={'width':430,'height':900})
      await pg.add_init_script("localStorage.setItem('hl_tour','1');window.__TC=[];")
      await pg.goto(f'http://localhost:8781/test.html#{y}');await pg.wait_for_timeout(8000)
      await pg.evaluate("document.getElementById('go')&&document.getElementById('go').click()")
      # put the camera on the busiest wildlife zone
      await pg.evaluate("HS.X(`{let best=null,bn=-1;for(const z of WZ){const n=(z.animals||[]).length;if(z.U&&n>bn){bn=n;best=z}}if(best)cam.t.copy(best.U);cam.alt=%s;cam.fly=null}`)"%alt)
      await pg.evaluate("HS.X(`{const o=showT;window.__TC=[];showT=function(h,ms,k){window.__TC.push([performance.now()|0,String(h).replace(/<[^>]+>/g,'').slice(0,70)]);return o.apply(this,arguments)}}`)")
      await pg.wait_for_timeout(60000)
      tc=await pg.evaluate("window.__TC");sheets=await pg.evaluate("document.querySelectorAll('.sheet.on').length")
      n=len([t for t in tc if t[1]!='null']);print(tag,alt,'popups/min',n,'open sheets',sheets);n>3 and BAD.append((tag,alt,n));[print('   ',t) for t in tc[:8]]
      await pg.close()
    await b.close()
try:
  asyncio.run(main())
finally:
  srv.terminate()
print('FAIL' if BAD else 'PASS',BAD);sys.exit(1 if BAD else 0)
