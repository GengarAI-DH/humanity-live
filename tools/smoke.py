# Stability check: loads the built test page in headless Chrome at several eras,
# runs big scenes, and fails if any page error happens.  Usage: python3 tools/smoke.py
import asyncio, subprocess, sys, os, time
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.abspath(__file__))
CASES=[(-71000000,""),(-66040010,""),(-30000,""),(-480,"playScene(BIG.find(b=>b.t.includes('Thermopylae')))"),(1500,"tapExtra(200,400)"),(1804,"DONE_.clear();playDisc(1804,'Lewis and Clark set out across the American West')"),(1945,"playScene(BIG.find(b=>b.t==='The atomic bomb'))"),(2011,"playScene(BIG.find(b=>b.t.includes('Tōhoku')))"),(1990,"tornado(cam.t,{ef:4});renderNow();renderWx()"),(2099,"renderExt()"),(1976,"if(QK.length<70||VOLC.length<50)throw new Error('quakes.json not loaded');fireQuake(QK.find(q=>q[1].startsWith('Tangshan')));startPlume(VOLC.find(v=>v.n==='Novarupta'))"),(-50000000,"if(SPX<90||!SP.darwinius||!FOSSIL.darwinius)throw new Error('species.json not loaded');renderExt();if(!aliveNow().includes('coryphodon'))throw new Error('alive list');rebuildWild()"),(1903,"if(JRNX<40||!JRNM['Mansa Musa’s golden pilgrimage']||!DISC.some(d=>d[1]==='Blériot flies across the English Channel'))throw new Error('journeys.json not loaded');DONE_.clear();playDisc(1903,'The first car trip across the United States');playJourney(JRNM['The Vega sails the Northeast Passage']);playJourney(JRNM['Scott\\'s party reaches the South Pole'])"),(-14000000,"if(LFX<100||!GEO.some(g=>g[0]==='Ries crater'&&geoVis(g))||!GEO.find(g=>g[0]==='Himalayas')[7])throw new Error('landforms.json not loaded');updGeo();spotName();DONE_.clear();playDisc(-14.8e6,'An asteroid blasts the Ries crater in Germany');showEvent(-14.8e6,'An asteroid blasts the Ries crater in Germany')"),(1960,"if(!DISC.some(d=>d[1]==='The Colorado River floods in to form the Salton Sea'))throw new Error('landform events');updGeo();spotCard(v3(33.3,-115.8,1));DONE_.clear();playDisc(1905,'The Colorado River floods in to form the Salton Sea');playDisc(-6200,'The Storegga slide sends a tsunami across the North Sea')")]
async def main():
  srv=subprocess.Popen([sys.executable,'-m','http.server','8799'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
  bad=0
  try:
    async with async_playwright() as p:
      chrome='/usr/bin/google-chrome' if os.path.exists('/usr/bin/google-chrome') else None
      b=await p.chromium.launch(executable_path=chrome,args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist'])
      for y,cmd in CASES:
        pg=await b.new_page(viewport={'width':393,'height':760});errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto(f'http://localhost:8799/test.html#{y}');await pg.wait_for_timeout(12000)
        if cmd:
          try: await pg.evaluate("c=>HS.X(c)",cmd)
          except Exception as e: errs.append('CMD '+str(e)[:200])
        await pg.wait_for_timeout(6000)
        ok=await pg.evaluate("typeof simY!=='undefined'||!!document.getElementById('year').textContent")
        print('PASS' if not errs and ok else 'FAIL',y,cmd[:50],errs[:3]);bad+=bool(errs or not ok)
        await pg.close()
      await b.close()
  finally: srv.terminate()
  sys.exit(1 if bad else 0)
asyncio.run(main())
