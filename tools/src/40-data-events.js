// ---- historic earthquakes and more eruptions (quakes.json: USGS, Smithsonian GVP) ----
// ---- more prehistoric species with real fossil sites (species.json: museum pages, peer-reviewed papers) ----
// ---- more historic journeys on their real routes (journeys.json: Britannica, NPS, Smithsonian, museums) ----
// ---- landforms forming in their real years (landforms.json: USGS, NASA, NPS, Smithsonian GVP, UNESCO, BGS, peer-reviewed papers) ----
let LFX=0;const LFE={};
function geoVis(g){return g[5]!==undefined?(simY>=g[5]&&(g[6]==null||simY<g[6])):simY>-3e6}
function geoPaleo(o){const g=o.g;if(simY<-5e6){const ep=Math.round(simY/2e5);if(o.ep!==ep){o.ep=ep;const p=paleoPos(g[1],g[2],simY);o.v=v3(p[0],p[1],R+.3)}}else if(o.ep!==undefined){o.ep=undefined;o.v=v3(g[1],g[2],R+.3)}}
async function loadLandforms(){try{const r=await fetch('landforms.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1])),GM={};for(const g of GEO)GM[g[0]]=g;
 for(const e of j.lf||[]){if(!e||typeof e[0]!=='number')continue;const[fr,to,lab,la,lo,k,t,fact,wk,ev]=e;let lat=la,lon=lo;
  if(lab&&GM[lab]){const g=GM[lab];g[7]=fact;if(fr<-3e6||(k==='m'&&fr<-1e5))g[5]=fr;if(to)g[6]=to;lat=g[1];lon=g[2]}
  else if(lab&&lat!=null){const g=[lab,lat,lon,k||'m',t||3,fr,to,fact];GEO.push(g);GM[lab]=g;if(GEOD.length){const d=document.createElement('div');d.className='geo '+g[3];d.textContent=g[0];d.style.display='none';document.body.appendChild(d);GEOD.push({g,d,v:v3(lat,lon,R+.3)})}}
  if(lat==null)continue;LFX++;
  if(ev&&!have.has(ev)){have.add(ev);EVLOC[ev]=[lat,lon];if(wk)WIKI[ev]=wk;if(fact)LFE[ev]=fact;let p=DISC.length;while(p>0&&DISC[p-1][0]>fr)p--;DISC.splice(p,0,[fr,ev]);if(p<discI||(p===discI&&fr<=simY))discI++}}}catch(e){}}
// ---- deep-time milestones 72 to 2.5 million years ago (deeptime.json: first fossils, fossil sites, climate swings, impacts; sources on each card) ----
let DTX=0;const DTE={},DTK={};
async function loadDeepTime(){try{const r=await fetch('deeptime.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1]));for(const e of j.dt||[]){if(!e||typeof e[0]!=='number'||!e[1]||have.has(e[1]))continue;const[y,t,la,lo,k,f,wk,s,d]=e;have.add(t);EVLOC[t]=[la,lo];DTK[t]=k;DTE[t]={f,s,d};if(wk)WIKI[t]=wk;DTX++;let q=DISC.length;while(q>0&&DISC[q-1][0]>y)q--;DISC.splice(q,0,[y,t]);if(q<discI||(q===discI&&y<=simY))discI++}}catch(e){}}
// ---- historic storms, tornadoes, floods, blizzards, heatwaves (storms.json: NOAA NHC/AOML, NWS/SPC/NCEI, JMA, JTWC, IMD, BoM, Météo-France, HKO, WMO, Met Office, USGS, ReliefWeb) ----
let STX=0;const SWX={};
async function loadStorms(){try{const r=await fetch('storms.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1]));
 for(const e of j.st||[]){if(!e||e.length<9||typeof e[0]!=='number')continue;const[y,k,t,la,lo,w,p,d,f,wk]=e;if(have.has(t))continue;have.add(t);SWX[t]={k,w,p,d,f};EVLOC[t]=[la,lo];if(wk)WIKI[t]=wk;STX++;let q=DISC.length;while(q>0&&DISC[q-1][0]>y)q--;DISC.splice(q,0,[y,t]);if(q<discI||(q===discI&&y<=simY))discI++}}catch(e){}}
function swCat(w){return w>=252?5:w>=209?4:w>=178?3:w>=154?2:1}
// ---- sky events: total solar eclipses 1900-2100, famous eclipses, great comets, naked-eye supernovae, transits of Venus, great aurorae, meteor storms (sky.json: NASA GSFC Five Millennium Catalog of Solar Eclipses (Espenak), NASA, JPL, ESA, ESO, NOAA SWPC, USGS, papers) ----
let SKYX=0;const SKX={};const SKYK={eclipse:'Total solar eclipse',comet:'Great comet',supernova:'Supernova (a "new star")',transit:'Transit of Venus',aurora:'Great aurora (geomagnetic storm)',meteors:'Meteor storm or fireball'};
async function loadSky(){try{const r=await fetch('sky.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1]));
 for(const e of j.sky||[]){if(!e||typeof e[0]!=='number'||e[3]==null||e[4]==null||!SKYK[e[1]])continue;const[y,k,t,la,lo,f,wk,s,x]=e;if(!t||have.has(t))continue;have.add(t);SKX[t]={y,k,f,s,x:x||{}};EVLOC[t]=[la,lo];if(wk)WIKI[t]=wk;SKYX++;let q=DISC.length;while(q>0&&DISC[q-1][0]>y)q--;DISC.splice(q,0,[y,t]);if(q<discI||(q===discI&&y<=simY))discI++}}catch(e){}}
function skyFacts(title,L){const e=SKX[title];if(!e)return;const x=e.x;L.push(['What',x.c==='H'?'Hybrid solar eclipse (total along part of the path)':SKYK[e.k]]);if(e.f)L.push(['What happened',e.f]);if(x.d)L.push([e.k==='eclipse'?'Longest totality':'Duration',x.d>=60?Math.floor(x.d/60)+' min '+(x.d%60)+' s':x.d+' s']);if(x.wd)L.push(['Path of totality','up to '+x.wd+' km wide']);if(x.mag!=null)L.push(['Peak brightness','magnitude '+x.mag+' (lower is brighter; Venus is about −4.6)']);if(x.days)L.push(['Seen by eye for','about '+x.days+' days']);if(x.alat!=null)L.push(['Seen as far as',x.alat+'° from the equator']);if(x.rate)L.push(['Peak rate','about '+Number(x.rate).toLocaleString('en-US')+' meteors an hour']);if(e.s)L.push(['Source',e.s])}
// ---- more world wonders built in their real years (wonders.json: UNESCO, Britannica, NPS, CTBUH, English Heritage, Met Museum, official sites) ----
let WONX=0;const WFE={};
function mkParts(g,P){for(const p of P){const t=p[0];let m=null;
 if(t==='b')m=GBox(p[1],p[2],p[3],p[4],p[5],p[6],p[7]);else if(t==='c')m=GCyl(p[1],p[2],p[3],p[4],p[5],p[6],p[7],p[8]);else if(t==='d')m=GDome(p[1],p[2],p[3],p[4],p[5]);else if(t==='p')m=GPyr(p[1],p[2],p[3],p[4],p[5]);
 else if(t==='k'||t==='k2'){m=new THREE.Mesh(new THREE.ConeGeometry(p[1],p[2],p[7]||8),lm(p[6]));m.position.set(p[3],p[4]+p[2]/2,p[5]);if(t==='k2'){m.rotation.z=-p[3]*60;m.rotation.x=p[5]*60}}
 else if(t==='o'){m=new THREE.Mesh(new THREE.SphereGeometry(p[1],10,8),lm(p[5]));m.position.set(p[2],p[3],p[4])}
 else if(t==='r'){m=new THREE.Mesh(new THREE.CylinderGeometry(p[1],p[1],p[2],24,1,true),lm2(p[6]));m.position.set(p[3],p[4]+p[2]/2,p[5])}
 else if(t==='t'){m=new THREE.Mesh(new THREE.TorusGeometry(p[1],p[2],6,24,Math.PI),lm(p[6]));m.position.set(p[3],p[4],p[5])}
 if(m)g.add(m)}}
const lm2=c=>LMAT[c+'d']||(LMAT[c+'d']=new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide}));
let WONL=0;async function loadWonders(){try{const r=await fetch('wonders.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1])),names=new Set(WONDERS.map(w=>w.n));
 const addD=(y,ev,w)=>{if(!ev||have.has(ev))return;have.add(ev);EVLOC[ev]=[w.lat,w.lon];WIKI[ev]=w.w;WFE[ev]=w.f;let p=DISC.length;while(p>0&&DISC[p-1][0]>y)p--;DISC.splice(p,0,[y,ev]);if(p<discI||(p===discI&&y<=simY))discI++};
 for(const e of j.won||[]){if(!e||names.has(e[0])||!Array.isArray(e[12]))continue;const[n,y0,y1,y2,y3,ru,lat,lon,wk,f,ev,ev2,P]=e;const w={n,y0,y1:y1==null?y0:y1,lat,lon,w:wk,f,mk:g=>mkParts(g,P)};if(y2!=null)w.y2=y2;if(y3!=null)w.y3=y3;if(ru!=null)w.ru=ru;WONDERS.push(w);names.add(n);WONX++;addD(y0,ev,w);if(ev2)addD(ev2[0],ev2[1],w)}}catch(e){}WONL=1}
// ---- more extinctions and endangered species (extinctions.json: IUCN Red List, BirdLife, USFWS, NOAA, museums, peer-reviewed papers) ----
let EXTX=0;const EXF={},EXS={};
async function loadExtinctions(){try{const r=await fetch('extinctions.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1])),en=new Set(EXT.map(e=>e[1])),gn=new Set(ENDG.map(e=>e[0]));
 for(const e of j.ext||[]){if(!e||e.length<6||en.has(e[1]))continue;let p=EXT.length;while(p>0&&EXT[p-1][0]>e[0])p--;EXT.splice(p,0,e);en.add(e[1]);EXTX++;const t='The last '+e[1]+' dies out';EXF[t]=e[2];if(e[6])EXS[t]=e[6];if(have.has(t))continue;have.add(t);EVLOC[t]=[e[3],e[4]];let q=DISC.length;while(q>0&&DISC[q-1][0]>e[0])q--;DISC.splice(q,0,[e[0],t]);if(q<discI||(q===discI&&e[0]<=simY))discI++}
 for(const e of j.endg||[]){if(e&&e.length>=4&&!gn.has(e[0])){ENDG.push(e);gn.add(e[0])}}}catch(e){}}
let JRNX=0;async function loadJourneys(){try{const r=await fetch('journeys.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1]));for(const e of j.jrn||[]){if(!e||!e[3]||e[3].length<2||JRNM[e[1]])continue;JRN.push(e);JRNM[e[1]]=e;if(e[5])WIKI[e[1]]=e[5];JRNX++;if(have.has(e[1]))continue;have.add(e[1]);let p=DISC.length;while(p>0&&DISC[p-1][0]>e[0])p--;DISC.splice(p,0,[e[0],e[1]]);if(p<discI||(p===discI&&e[0]<=simY))discI++}}catch(e){}}
// ---- inventions and things people made, at their real first places and years (inventions.json: peer-reviewed papers, Smithsonian, Science Museum Group, British Museum, UNESCO, NASA, IEEE) ----
let INVX=0;const INF={},INVC={tool:'tool',weapon:'tool',textile:'tool',money:'tool',material:'tool',writing:'tool',medicine:'science',machine:'science',comms:'signal',computer:'signal',power:'power',future:'power',space:'space',building:'build',road:'build',farm:'farm',boat:'voyage',music:'art',art:'art'};
async function loadInventions(){try{const r=await fetch('inventions.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1]));
 for(const e of j.inv||[]){if(!e||e.length<10||typeof e[0]!=='number')continue;const[y,t,la,lo,k,f,wk,src,pl,nm,ln]=e;if(INF[t])continue;if(ln&&!have.has(t))continue;INF[t]={k,f,src,pl,nm,c:ln?null:(k==='vehicle'?(/fl(y|ies|ight)|balloon|jet/i.test(t)?'flight':'tool'):INVC[k]||'tool')};if(!EVLOC[t])EVLOC[t]=[la,lo];if(wk&&!WIKI[t])WIKI[t]=wk;INVX++;if(have.has(t))continue;have.add(t);let q=DISC.length;while(q>0&&DISC[q-1][0]>y)q--;DISC.splice(q,0,[y,t]);if(q<discI||(q===discI&&y<=simY))discI++}}catch(e){}}
let SPX=0;async function loadSpecies(){try{const r=await fetch('species.json');if(!r.ok)return;const j=await r.json();for(const e of j.sp||[]){const[k,n,mesh,col,fr,to,pl,pred,hab,len,diet,fact,up,fos]=e;if(SP[k])continue;SP[k]=[n,mesh,col,e[14]||1,fr,to,pl,pred,hab,1,fact];LEN[k]=len;if(diet==='carnivore'||diet==='insectivore'||pred)CARN.add(k);else if(diet==='omnivore')OMNI.add(k);if(diet==='insectivore')XDIET[k]='insect eater';if(up)UPX.add(k);if(fos&&fos.length&&hab!=='s')FOSSIL[k]=fos;SPX++}
 for(const k in j.fix||{}){const f=j.fix[k];if(!SP[k]||!f)continue;if(f[0]!=null)SP[k][4]=f[0];if(f[1]!=null)SP[k][5]=f[1];if(f[2]&&f[2].length&&SP[k][8]!=='s'){FOSSIL2[k]=f[2];SP[k][6]=[...new Set(f[2].map(q=>plateOf(q[0],q[1])))].join(',')}AUDX++}
 for(const q of j.plants||[])if(q&&q[4]&&q[4].length)PLDB.push(q);for(const k in fosCache)delete fosCache[k];try{if(simY<-70000&&typeof wildM!=='undefined'&&wildM){wildPlants();rebuildWild()}}catch(e){}}catch(e){}}
let AUDX=0;const PLDB=[],plC={};
function plantPick(type,lat,lon,Y,r){const my=-Y/1e6,ep=Math.round(Y/2e5),U=v3(lat,lon,1),c=[];for(const q of PLDB){if(q[1]!==type||my>q[2]||my<q[3])continue;const key=q[0]+ep;let P=plC[key];if(!P){const w=Math.max(.5,my*.08);P=plC[key]=q[4].filter(f=>f[2]>=my-w&&f[3]<=my+w).map(f=>{const p=paleoPos(f[0],f[1],Y);return v3(p[0],p[1],1)})}if(P.some(v=>v.angleTo(U)<12*DEG))c.push(q[0])}return c.length?c[(r*c.length)|0]:null}
function aliveNow(){const my=-simY/1e6;return Object.keys(SP).filter(k=>my<=SP[k][4]&&my>=SP[k][5]).sort((a,b)=>SP[a][0].localeCompare(SP[b][0]))}
async function loadQuakes(){try{const r=await fetch('quakes.json');if(!r.ok)return;const j=await r.json();const have=new Set(VOLC.map(v=>v.n));for(const v of j.volc||[]){if(have.has(v[1]))continue;VEI[v[1]]=v[4];VOLC.push({y:v[0],n:v[1],lat:v[2],lon:v[3],km3:v[5]||0,note:v[6]||'',done:simY>=v[0]})}
 QK=(j.quakes||[]).slice().sort((a,b)=>a[0]-b[0]);qkI=0;while(qkI<QK.length&&simY>=QK[qkI][0])qkI++}catch(e){}loadNCEI()}
// ---- significant earthquakes since 2150 BCE (quakes_ncei.json: NOAA NCEI/WDS Global Significant Earthquake Database, doi:10.7289/V5TD9V7K) ----
let QNX=0;const QWX={};const QORD=['','a few (up to about 50)','some (about 51 to 100)','many (about 101 to 1,000)','very many (over 1,000)'];
async function loadNCEI(){try{const r=await fetch('quakes_ncei.json');if(!r.ok)return;const j=await r.json();const old=QK.slice(),have=new Set(DISC.map(d=>d[1])),dq=DISC.filter(d=>/earthquake/i.test(d[1])),add=[];
 for(const e of j.q||[]){if(!e||typeof e[0]!=='number'||e[2]==null||e[3]==null)continue;const[y,t,la,lo]=e;if(have.has(t)||QWX[t])continue;
  if(old.some(q=>Math.abs(q[0]-y)<.1&&Math.abs(q[2]-la)<4&&Math.abs(q[3]-lo)<4))continue;
  if(dq.some(d=>Math.floor(d[0])===Math.floor(y)&&(!EVLOC[d[1]]||(Math.abs(EVLOC[d[1]][0]-la)<5&&Math.abs(EVLOC[d[1]][1]-lo)<5))))continue;
  QWX[t]=e;const q=[y,t,la,lo,e[4]||0,'',''];q.nc=e;add.push(q);QNX++}
 QK=QK.concat(add).sort((a,b)=>a[0]-b[0]);qkI=0;while(qkI<QK.length&&simY>=QK[qkI][0])qkI++}catch(e){}loadHazards()}
function qnBig(e){return (e[5]||0)>=1000||e[6]>=4||(e[4]||0)>=8}
function qnToll(e){return e[5]?Number(e[5]).toLocaleString('en-US'):e[6]?QORD[e[6]]:''}
// ---- tsunamis and volcanic eruptions (hazards.json: NOAA NCEI/WDS Global Historical Tsunami Database, doi:10.7289/V5PN93H7; Global Significant Volcanic Eruptions Database, doi:10.7289/V5JW8BSH) ----
let HZX=0,HZ=[],hzI=0;const TSX={},VNX={},TSQ={};
const TSC=['unknown','an earthquake','a probable earthquake','an earthquake and landslide','a volcano and earthquake','a volcano, earthquake and landslide','a volcanic eruption','a volcano and landslide','a landslide','the weather (a meteotsunami)','an explosion','an astronomical tide'];
const VAG={A:'debris avalanches and landslides',E:'lightning',F:'floods',G:'volcanic gas',I:'famine and disease afterwards',L:'lava flows',M:'mudflows (lahars)',m:'mudflows after the eruption',P:'pyroclastic flows',S:'volcanic earthquakes',T:'falling ash and rock',W:'tsunami waves'};
async function loadHazards(){try{const r=await fetch('hazards.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1])),dv=DISC.filter(d=>/erupt|eruption/i.test(d[1])),dt=DISC.filter(d=>/tsunami/i.test(d[1])),add=[];
 for(const e of j.v||[]){if(!e||typeof e[0]!=='number'||e[2]==null||e[3]==null)continue;const[y,t,la,lo]=e;if(have.has(t)||VNX[t])continue;
  if(VOLC.some(v=>v.lat!=null&&Math.abs(v.y-y)<2&&Math.abs(v.lat-la)<1.5&&Math.abs(v.lon-lo)<1.5))continue;
  if(dv.some(d=>Math.abs(d[0]-y)<1.5&&EVLOC[d[1]]&&Math.abs(EVLOC[d[1]][0]-la)<2&&Math.abs(EVLOC[d[1]][1]-lo)<2))continue;
  VNX[t]=e;add.push({y,v:e});HZX++}
 for(const e of j.t||[]){if(!e||typeof e[0]!=='number'||e[2]==null||e[3]==null)continue;const[y,t,la,lo]=e;if(e[13]){if(!TSQ[e[13]]||(e[6]||0)>(TSQ[e[13]][6]||0))TSQ[e[13]]=e;HZX++;continue}if(have.has(t)||TSX[t])continue;
  if(dt.some(d=>Math.floor(d[0])===Math.floor(y)&&(!EVLOC[d[1]]||(Math.abs(EVLOC[d[1]][0]-la)<6&&Math.abs(EVLOC[d[1]][1]-lo)<6))))continue;
  if(QK.some(q=>!q.nc&&Math.abs(q[0]-y)<.1&&Math.abs(q[2]-la)<5&&Math.abs(q[3]-lo)<5))continue;
  TSX[t]=e;add.push({y,t:e});HZX++}
 HZ=add.sort((a,b)=>a.y-b.y);hzI=0;while(hzI<HZ.length&&simY>=HZ[hzI].y)hzI++}catch(e){}}
function tsReach(e){const h=e[6]||0;return e[4]===8||e[4]===9?3:Math.max(5,Math.min(30,5+Math.sqrt(h)*4+((e[7]||0)>=1000?8:0)))}
function vnToll(e){return e[5]?Number(e[5]).toLocaleString('en-US'):e[6]?QORD[e[6]]:''}
function fireHazard(h){if(h.v){const e=h.v,t=e[1],vei=e[4],U=v3(e[2],e[3],1);EVLOC[t]=[e[2],e[3]];addEv(Math.floor(e[0]),t,null,false);const big=(vei||0)>=5||(e[5]||0)>=1000||e[6]>=4,mid=(vei||0)>=4||(e[5]||0)>=100;
  if(big||mid){const k=vnToll(e);toast(`<b>${esc(t)}</b>${k?' · '+esc(k)+' killed':''}${e[11]?' · it raised a tsunami':''}<br><small>NOAA NCEI significant volcanic eruptions</small>`,big?7000:4500)}
  if(big&&(U.angleTo(cam.t)<.5||cam.alt>30))eruptScene(U,{vei:vei||5,dur:50,name:e[14]});else if(U.angleTo(cam.t)<.3&&cam.alt<30)slabel(U,'🌋 '+t,15)}
 else if(h.t){const e=h.t,t=e[1],U=v3(e[2],e[3],1);EVLOC[t]=[e[2],e[3]];addEv(Math.floor(e[0]),t,null,false);const big=(e[6]||0)>=10||(e[7]||0)>=1000||e[8]>=4;
  if(big){const k=qnToll([0,0,0,0,0,e[7],e[8]]);toast(`<b>🌊 ${esc(t)}</b>${k?' · '+esc(k)+' killed':''}<br><small>NOAA NCEI historical tsunamis</small>`,7000);if(U.angleTo(cam.t)<.6||cam.alt>30)tsunami(U,Math.min(60,e[6]||10),tsReach(e),t)}
  else if(U.angleTo(cam.t)<.3&&cam.alt<30)slabel(U,'🌊 '+t,15)}}
function hzFacts(title,L){const v=VNX[title];if(v){if(v[4]!=null)L.push(['Size',`VEI ${v[4]} of 8 on the Volcanic Explosivity Index (each step is about 10 times more material)`]);const k=vnToll(v);if(k)L.push(['Lives lost',k]);const ag=[...new Set((v[7]||'').split(''))].map(c=>VAG[c]).filter(Boolean);if(ag.length)L.push(['What killed or harmed people',ag.join(', ')]);if(v[8])L.push(['Houses destroyed',Number(v[8]).toLocaleString('en-US')]);if(v[9])L.push(['Damage',`about $${Number(v[9]).toLocaleString('en-US')} million (money of the time)`]);if(v[13])L.push(['Volcano type',v[13]]);if(v[11])L.push(['Tsunami','This eruption raised a tsunami']);if(v[12])L.push(['Earthquake','Linked to an earthquake']);L.push(['Source','NOAA NCEI Global Significant Volcanic Eruptions Database'])}
 const t=TSX[title]||TSQ[title];if(t){if(t[6])L.push(['Highest wave',`${t[6]} m (highest water level measured or reported)`]);L.push(['Tsunami caused by',TSC[t[4]]||'unknown']);if(TSX[title]){const k=qnToll([0,0,0,0,0,t[7],t[8]]);if(k)L.push(['Lives lost',k]);if(t[9])L.push(['Houses destroyed',Number(t[9]).toLocaleString('en-US')]);if(t[10])L.push(['Damage',`about $${Number(t[10]).toLocaleString('en-US')} million (money of the time)`]);if(t[5])L.push(['Earthquake',`magnitude ${t[5]}`])}if(t[11])L.push(['Places the wave was recorded',Number(t[11]).toLocaleString('en-US')]);L.push(['Tsunami source','NOAA NCEI Global Historical Tsunami Database'])}}
function fireNCEI(q){const e=q.nc,t=e[1],M=e[4],U=v3(e[2],e[3],1);EVLOC[t]=[e[2],e[3]];addEv(Math.floor(e[0]),t,null,false);
 const ts=TSQ[t];if(qnBig(e)||(ts&&(ts[6]||0)>=10)){const k=qnToll(e);toast(`<b>${esc(t)}</b>${k?' · '+esc(k)+' killed':''}${ts&&ts[6]?' · tsunami up to '+ts[6]+' m':e[7]?' · it raised a tsunami':''}<br><small>NOAA NCEI significant earthquakes and tsunamis</small>`,7000);if(U.angleTo(cam.t)<.5||cam.alt>30)quakeScene(U,Object.assign({M:M||7.5,label:t,dur:50},ts&&(ts[6]||0)>=3?{ts:Math.min(60,ts[6]),tsAt:[ts[2],ts[3]],tsR:tsReach(ts)}:{}))}
 else if(U.angleTo(cam.t)<.3&&cam.alt<30)slabel(U,t,15)}
// ---- battles and sieges (battles.json: Wikidata, CC0 — battles, sieges and naval battles with a date, a place and articles in 12+ Wikipedia languages) ----
let BTX=0,BT=[],btI=0;const BTW={};
async function loadBattles(){try{const r=await fetch('battles.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1]).concat(BIG.map(b=>b.t)));
 for(const e of j.b||[]){if(!e||typeof e[0]!=='number'||e[2]==null||e[3]==null||!e[1])continue;const t=e[1];if(have.has(t)||BTW[t])continue;BTW[t]=e;if(e[5])WIKI[t]=e[5]===1?t:e[5];BT.push(e);BTX++}
 BT.sort((a,b)=>a[0]-b[0]);btI=0;while(btI<BT.length&&simY>=BT[btI][0])btI++}catch(e){}}
function btDup(e){const y=Math.floor(e[0]);return BIG.some(b=>Math.floor(b.y)===y&&b.lat!=null&&Math.abs(b.lat-e[2])<1.5&&Math.abs(b.lon-e[3])<1.5)||DISC.some(d=>Math.floor(d[0])===y&&EVLOC[d[1]]&&Math.abs(EVLOC[d[1]][0]-e[2])<1.5&&Math.abs(EVLOC[d[1]][1]-e[3])<1.5)}
function fireBattle(e,re){const t=e[1],U=v3(e[2],e[3],1);EVLOC[t]=[e[2],e[3]];if(!re){if(btDup(e))return;addEv(Math.floor(e[0]),t,null,false)}
 if(e[4]>=40&&!re)toast(`<b>⚔ ${esc(t)}</b>${e[6]?' · '+esc(e[6]):''}<br><small>Battles from Wikidata</small>`,5000);
 if(re||(U.angleTo(cam.t)<.35&&cam.alt<30))slabel(U,'⚔ '+t,re?20:12)}
function btFacts(title,L){const e=BTW[title];if(!e)return;if(e[6])L.push(['Part of',e[6]]);if(e[7]&&e[7].length)L.push(['Who took part',e[7].join(', ')]);if(e[8]&&e[8].length)L.push(['Victor',e[8].join(', ')]);if(e[9])L.push(['Deaths recorded',Number(e[9]).toLocaleString('en-US')]);L.push(['Date known to the',e[10]>=11?'day':e[10]>=10?'month':'year']);L.push(['Source','Wikidata (battles with articles in '+e[4]+' Wikipedia languages)'])}
