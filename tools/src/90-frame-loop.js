// ================== main loop ==================
let syncT=45,last=performance.now(),acc=0,hudT=0,saveT=0,nightT=0,herdT=0;
function rebuildAll(){for(const s of S){s.bkey='';}checkBuilds(true);rebuildAnimals();rebuildWild();rebuildPoints();rebuildRails();rebuildTrees();colorsDirty=true}
function siteKey(s){const t=tierAt(s,simY);if(t<-1)return'x';const lms=s.lm.filter(l=>simY>=l[0]&&(!l[2]||simY<l[2])).length;const lake=s.x.lake?Math.round(clamp((simY-1600)/300,0,1)*4):0;const hg=s.k==='istanbul'&&simY>=1453?1:0;return t+'|'+lms+'|'+lake+'|'+hg+(s.dirty?'|d'+Math.random():'')}
function checkBuilds(all){let ch=false;for(const s of S){const k=siteKey(s);if(k!==s.bkey){s.dirty=false;buildSite(s,siteKey(s));ch=true;if(!all)break}}
 if(ch&&!all){rebuildPoints();rebuildRails();rebuildAnimals()}return ch}
let cbT=0,IMS=null,imsN=-1;
// upload only the part of each instance buffer that is in use (three.js would otherwise send the whole buffer every frame)
function trimUploads(){if(!IMS||imsN!==scene.children.length){IMS=[];scene.traverse(o=>{if(o.isInstancedMesh)IMS.push(o)});imsN=scene.children.length}
 for(const m of IMS){const c=Math.min(m.count,m.instanceMatrix.count);if(m.instanceMatrix.version&&m.instanceMatrix.updateRange)m.instanceMatrix.updateRange.count=Math.max(16,c*16);if(m.instanceColor&&m.instanceColor.updateRange)m.instanceColor.updateRange.count=Math.max(3,c*3)}}
function frame(T){requestAnimationFrame(frame);const now=performance.now(),_t0=now,dt=Math.min(.1,(now-last)/1000);last=now;cam.idle+=dt;
 const Y=yearAt(curDay());
 updTM(dt);updFinale(dt);try{updAurora(dt);updSkyX(dt);updFStrip(dt)}catch(e){console.error(e)}advance(Y);updImpact(dt);updPlumes(dt);updMig(dt);updBig(dt);dynT-=dt;if(dynT<=0){dynT=1.2;updDyn()}
 // climate
 if(now-climT>(catching?1500:5000)){climT=now;if(season()!==SEASM){SEASM=new Date().getUTCMonth();if(SEASM!==-1&&simY>-3e6){CLIM.sig=null;applyClimate(simY,true);treesDirty=true}}if(applyClimate(simY)){for(const s of S)if(s.built)buildTrees(s,s.rt!==undefined&&s.tier<0?s.rt:s.tier);wildPlants()}}
 treeCull(dt);cbT-=dt;if(cbT<=0){cbT=catching?.15:.4;if(checkBuilds(false))treesDirty=true}if(treesDirty)rebuildTrees();
 herdT-=dt;if(herdT<=0){herdT=3;if(S.some(s=>s.built&&s.tier>=0&&herdFor(s,simY,s.tier).map(x=>x[0]).join()!==s.hkey))rebuildAnimals();if(WZ.some(z=>faunaFor(z,simY).map(x=>x.join(':')).join()!==z.key)){rebuildWild();rebuildPoints()}}
 nightT-=dt;if(nightT<=0){nightT=.25;updSun();nightCols()}
 boatN=0;updAgents(dt,now/1000);boatM.instanceMatrix.needsUpdate=true;boatM.instanceColor.needsUpdate=true;HUMN=0;updAnimals(dt,now/1000);updWild(dt,now/1000);try{updPlay(dt)}catch(e){}try{updHome()}catch(e){}updTransport(dt);
 camUpdate(dt);hrTick(dt);updDisasters(dt);updFX(dt);updSpectacle(dt);try{updLive(dt)}catch(e){}updWeather(dt);updSound(dt);updCaravans(dt);
 const sel=AM.get(selId);if(sel&&sel.vis&&sel.wx!==undefined){pin.visible=true;const s=Math.max(.008,cam.alt*.018);pin.scale.set(s*.6,s,s*.6);const u=new THREE.Vector3(sel.wx,sel.wy,sel.wz).normalize();pin.position.set(sel.wx,sel.wy,sel.wz).addScaledVector(u,.032+Math.abs(Math.sin(now/300))*.006);pin.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),u)}else pin.visible=false;
 hudT-=dt;if(hudT<=0){hudT=.25;updHud();updPlace()}try{updBigLabels()}catch(e){}
 if(QG.lvl===0||(QG.alt=!QG.alt)){updLabels();updGeo()}if(borderL){borderL.visible=simY>=1945&&cam.alt>3;borderL.material.opacity=clamp((cam.alt-3)/20,0,.35)}cityT-=dt;if(cityT<=0){cityT=.5;updCityLabels();cityCT-=.5;if(Math.floor(simY)!==Math.floor(cityT0)||cityCT<=0){cityCT=4;updCities();cityT0=simY}}tagT-=dt;if(tagT<=0){tagT=.12;updTags()}
 saveT-=dt;if(saveT<=0){saveT=DB?60:20;save()}syncT-=dt;if(syncT<=0){syncT=45;syncCheck()}
trimUploads(); const _t1=performance.now();renderer.render(scene,camera);if(window.__PT){__PT.js+=_t1-_t0;__PT.r+=performance.now()-_t1;__PT.n++}if(REC.on)recFrame()}
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
// ---- time machine (owner only): open any era on this device; the shared world is never touched ----
const PVQ=(()=>{const m=/^#preview=(-?\d+(?:\.\d+)?)$/.exec(location.hash);return m&&!window.__TEST&&LS.get('hl_admin')?+m[1]:null})();let PV=null;
async function pvCheck(){if(PVQ===null)return;let ok=false;try{const r=await fetch('/api/admin/check',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:LS.get('hl_admin')})});ok=r.ok&&(await r.json()).ok}catch(e){}if(!ok){location.hash='';location.reload();return new Promise(()=>{})}PV=clamp(PVQ,-71.2e6,2100)}
function pvBanner(){const d=document.createElement('div');d.id='pvBar';d.title='Time machine: only on this device';d.innerHTML=`⏳ <b>${esc(fmtY(PV))}</b> preview<br><button id="pvBack">Live</button><button id="pvPick">Change</button>`;document.body.appendChild(d);$('pvBack').onclick=()=>{location.hash='';location.reload()};$('pvPick').onclick=openTimeMachine}
const TM_ERAS=[['Last dinosaurs',-68e6],['The asteroid hits',-66040300],['Rise of the mammals',-55e6],['Age of grasslands',-15e6],['First humans',-2e6],['Ice Age peak',-20000],['First farms',-9000],['Ancient world',-500],['Middle Ages',1200],['Age of exploration',1500],['Industrial age',1850],['World War II',1942],['Moon landing',1969],['Today',2026],['The future',2080]];
function openTimeMachine(){$('setBody').innerHTML=`<div class="sm">Look at any time on this device only. Nobody else sees it, and the shared live world keeps running.</div><div class="btns" style="flex-wrap:wrap;margin-top:10px">${TM_ERAS.map((e,i)=>`<button data-e="${i}">${esc(e[0])}<br><span class="sm">${esc(fmtY(e[1]))}</span></button>`).join('')}</div><div class="sm" style="margin-top:12px">Or a year (use minus for BC, e.g. -3000, or -66000000)</div><div class="row2"><input id="tmY" inputmode="numeric" placeholder="1776"><button id="tmGo">Go</button></div>`;
 const go=y=>{if(!isFinite(y))return toast('Type a year like 1776 or -3000');location.hash='preview='+Math.round(clamp(y,-71.2e6,2100));location.reload()};
 $('setBody').querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>go(TM_ERAS[+b.dataset.e][1]));$('tmGo').onclick=()=>go(parseFloat(String($('tmY').value).replace(/,/g,'')));openSheet('shSet')}
async function boot(){
 await pvCheck();
 $('load').textContent=PV!==null?'Opening the time machine…':'Connecting to the shared world…';DB=PV!==null?null:await getDB();let meta=null;
 if(DB){try{const m=await Promise.race([DB.doc('world/meta').get(),new Promise((_,j)=>setTimeout(()=>j('t'),10000))]);if(m.exists)meta=m.data()}catch(e){DB=null}}
 if(DB&&meta){started=meta.start;$('load').textContent='Loading the world…';const ok=await loadShared(meta);if(!ok){await new Promise(r=>setTimeout(r,3000));const m2=await DB.doc('world/meta').get();if(m2.exists)await loadShared(m2.data())}await lease()}
 else if(DB){await lease();started=Date.now();newWorld();if(LEAD)await saveShared()}
 else{let ws=null;try{const r=await fetch('/api/world',{cache:'no-store'});if(r.ok)ws=await r.json()}catch(e){}const st0=ws&&ws.start?ws.start:+LS.get(KEY+'_start');started=st0||Date.now();if(!st0)LS.set(KEY+'_start',String(started));if(ws&&ws.start)window.__WEB=1;const sv=loadLocal();if(sv&&sv.start===started)restore(sv);else newWorld();$('clock').dataset.local='1'}
 if((window.__TEST&&window.__TESTY!==undefined)||PV!==null){const Y=PV!==null?PV:window.__TESTY;window.__OFF=dayAt(Y)-(Date.now()-started)/864e5;if(Y>=-70000){regen(Y)}else{simY=Y;A=[];AM.clear()}}
 for(const s of S){s.tier=tierAt(s,simY);if(s.tier===-1)s.rt=ruinTier(s);frameSite(s)}
 favSync(false);tally();applyClimate(simY,true);updSun();for(const z of WZ)frameSite(z);placeZones(simY);rebuildAll();
 if(A.length){const best=S.filter(x=>x.pop>0).sort((a,b)=>b.tier-a.tier||b.pop-a.pop);const fa=followId&&AM.get(followId);cam.t.copy(fa?S[fa.s].U:(best.length?pick(best.slice(0,6)).U:SK.omo.U))}
 else{const z=WZ.filter(z=>!z.water&&z.type!=='ocean').sort((a,b)=>b.key.length-a.key.length)[0];cam.t.copy(z?z.U:new THREE.Vector3(1,0,0))}
 cam.alt=1.1;setBtn();updHud()}
function newWorld(){A=[];AM.clear();D.clear();simY=yearAt(0);NID=1;discI=0;EV=[];while(discI<DISC.length&&DISC[discI][0]<=simY){const d=DISC[discI++];EV.unshift({y:d[0],t:d[1],k:d[2]})}}
async function start(){setTimeout(()=>{loadCities();applyLite()},2500);initGeo();initTerrain();initPlates();applyClimate(-70000,true);makeGlobe();initMeshes();initLabels();initTags();initGeo2();initSpace();resize();await boot();
 $('load').style.display='none';if(PV!==null)pvBanner();if(!LS.get(KEY+'_seen')){$('intro').style.display='grid'}else builders();requestAnimationFrame(frame)}
$('go').onclick=()=>{$('intro').style.display='none';LS.set(KEY+'_seen','1');builders();if(LS.get('hl_tour')!=='1')setTimeout(()=>runTour(0),1200)};
if(window.__TEST)window.HS={X:c=>eval(c),get S(){return S},get A(){return A},get WA(){return WA},cam,fly:(k,alt)=>{const s=SK[k]||WZ[k];cam.t.copy(s.U);cam.alt=alt||.8;cam.fly=null},flyV:(la,lo,alt)=>{cam.t.copy(v3(la,lo,1));cam.alt=alt;cam.fly=null},impact:startImpact};
setTimeout(()=>{start().catch(err=>{$('load').textContent='Something went wrong: '+err.message;console.error(err)})},30);
}
