// ================== shared world ==================
const KEY='humanity_live_v2';
let lastResync=Date.now(),DB=null,LEAD=false,SID='',loadedSaved=0,saving=false;const HOLDER=Math.random().toString(36).slice(2);
const CH=280;
const packA=a=>[a.id,a.n,a.sx,+a.b.toFixed(2),a.s,a.p,a.mo,a.fa,a.k.slice(-10),a.fr,a.j,a.jc,a.tl,a.jtr,+a.skin.toFixed(3),a.cl,a.ev.slice(-6),a.lb,a.ill||0,a.illY||0,a.imm||0,a.tr2||0,Math.round(a.sk||0)];
const unpackA=r=>({id:r[0],n:r[1],sx:r[2],b:r[3],s:r[4],p:r[5],mo:r[6],fa:r[7],k:r[8]||[],fr:r[9]||[],j:r[10],jc:r[11],tl:r[12],jtr:r[13],skin:r[14],cl:r[15],ev:r[16]||[],lb:r[17],ill:r[18]||null,illY:r[19]||0,imm:r[20]||null,tr2:r[21]||['curious','kind'],sk:r[22]||0});
const packD=d=>[d.id,d.n,d.sx,+d.b.toFixed(1),+d.d.toFixed(1),d.c,d.s,d.p,d.mo,d.fa,(d.k||[]).slice(-10),d.j];
const unpackD=r=>({id:r[0],n:r[1],sx:r[2],b:r[3],d:r[4],c:r[5],s:r[6],p:r[7],mo:r[8],fa:r[9],k:r[10]||[],j:r[11]});
function webDB(){const doc=path=>({async get(){const r=await fetch('/api/wdoc?path='+encodeURIComponent(path),{cache:'no-store'});const j=r.ok?await r.json():null;return{exists:j!==null,data:()=>j}},
 async set(v){const r=await fetch('/api/wdoc?path='+encodeURIComponent(path)+'&holder='+HOLDER,{method:'PUT',body:JSON.stringify(v)});if(!r.ok)throw Object.assign(new Error('write refused'),{code:r.status})},
 async acquire(o){const r=await fetch('/api/wlease',{method:'POST',body:JSON.stringify({holder:o.holder,ttlMs:o.ttlMs})});return r.ok?await r.json():{acquired:false}}});return{doc}}
async function getDB(){try{if(!(window.claude&&window.claude.use)){try{const r=await fetch('/api/world',{cache:'no-store'});const j=r.ok?await r.json():null;if(j&&j.name==='Humanity, Live')return webDB()}catch(e){}}for(let i=0;i<60&&!(window.claude&&window.claude.use);i++)await new Promise(r=>setTimeout(r,100));if(!(window.claude&&window.claude.use))return null;return await Promise.race([window.claude.use('db'),new Promise(r=>setTimeout(()=>r(null),10000))])}catch(e){return null}}
async function lease(){if(!DB)return false;try{const r=await DB.doc('world/lease').acquire({holder:HOLDER,ttlMs:90000});LEAD=!!r.acquired}catch(e){LEAD=false}return LEAD}
function snapshot(){return{v:2,lead:S.map(s=>[s.lead||0,s.dyn||'']),start:started,simY,NID,discI,EV:EV.slice(0,160).map(e=>({y:e.y,t:e.t,k:e.k||''})),saved:Date.now()}}
async function saveShared(){if(!DB||!LEAD||saving||catching)return;saving=true;try{const sid=Math.random().toString(36).slice(2),meta=snapshot();const nA=Math.ceil(A.length/CH);
  for(let i=0;i<nA;i++)await DB.doc('world/a'+i).set({sid,l:A.slice(i*CH,(i+1)*CH).map(packA)});
  const dl=[...D.values()].slice(-1200),nD=Math.ceil(dl.length/600);for(let i=0;i<nD;i++)await DB.doc('world/d'+i).set({sid,l:dl.slice(i*600,(i+1)*600).map(packD)});
  meta.sid=sid;meta.nA=nA;meta.nD=nD;await DB.doc('world/meta').set(meta);SID=sid;loadedSaved=meta.saved}catch(e){console.warn('save failed',e&&e.code)}saving=false}
async function loadShared(meta){const A_=[],D_=[];for(let i=0;i<(meta.nA||0);i++){const d=await DB.doc('world/a'+i).get();if(!d.exists)continue;const x=d.data();if(x.sid!==meta.sid)return false;A_.push(...x.l.map(unpackA))}
 for(let i=0;i<(meta.nD||0);i++){const d=await DB.doc('world/d'+i).get();if(d.exists&&d.data().sid===meta.sid)D_.push(...d.data().l.map(unpackD))}
 restore({simY:meta.simY,NID:meta.NID||1,discI:meta.discI||0,EV:meta.EV||[],A:A_,D:D_});if(meta.lead)meta.lead.forEach((x,i)=>{if(S[i]){S[i].lead=x[0];S[i].dyn=x[1]}});SID=meta.sid;loadedSaved=meta.saved||0;return true}
function save(){if(PV!==null)return;if(DB){saveShared();return}const st={v:2,start:started,simY,NID,followId,discI,EV:EV.slice(0,150),A:A.map(packA),D:[...D.values()].slice(-1500).map(packD)};
 if(!LS.set(KEY,JSON.stringify(st))){st.D=[];st.EV=st.EV.slice(0,40);LS.set(KEY,JSON.stringify(st))}}
function loadLocal(){const raw=LS.get(KEY);if(!raw)return null;try{const s=JSON.parse(raw);s.A=(s.A||[]).map(unpackA);s.D=(s.D||[]).map(unpackD);return s}catch(e){return null}}
function restore(st){A=[];AM.clear();D.clear();simY=st.simY;NID=st.NID;discI=st.discI||0;EV=st.EV||[];if(st.followId)followId=st.followId;
 for(const s of S){s.tier=tierAt(s,simY);if(s.tier===-1)s.rt=ruinTier(s);frameSite(s);s.pop=0;s.pend=0}
 for(const o of st.A){const a=Object.assign({},o);A.push(a);AM.set(a.id,a);initVis(a)}for(const d of st.D||[])D.set(d.id,d);colorsDirty=true}
async function syncCheck(){if(!DB)return;try{if(LEAD){await lease();return}const got=await lease();if(!got&&Date.now()-lastResync<300000)return;lastResync=Date.now();const m=await DB.doc('world/meta').get();if(!m.exists)return;const meta=m.data();if(meta.sid&&meta.sid!==SID&&(meta.saved||0)>loadedSaved){if(await loadShared(meta)){tally();rebuildAll()}}}catch(e){}}
const TM={mode:'normal',lag:0,t:0,rate:1/365.25,speed:4,ev:''};
function realDay(){return(Date.now()-started)/864e5+(window.__OFF||0)}
function curDay(){return realDay()-TM.lag/86400}
function slowFor(b){if(catching||TM.mode==='slow')return;if(yps(curDay())<.2)return;TM.mode='slow';TM.t=b.t.startsWith('Asteroid')?120:90;TM.ev=b.t}
function updTM(dt){if(TM.mode==='slow'){TM.lag+=dt*(1-TM.rate);TM.t-=dt;if(TM.t<=0)TM.mode='catch'}else if(TM.mode==='catch'){TM.lag-=dt*(TM.speed-1);if(TM.lag<=0){TM.lag=0;TM.mode='normal'}}
 const el=$('tm');if(TM.mode==='normal'){el.style.display='none';return}el.style.display='block';el.innerHTML=TM.mode==='slow'?`⏸ <b>Slow motion:</b> ${esc(TM.ev)} · 1 second = 1 day · ${Math.ceil(TM.t)}s`:`⏩ <b>Catching up to the present</b> · 4 years per second · ${Math.ceil(TM.lag/(TM.speed-1))}s`}
let catching=false,catchFrom=0;
function advance(Y){meteorStep(Y-simY);
 if(simY<-70000){const prev=simY;if(Y<-70000){simY=Y;if(prev<-66.04e6&&Y>=-66.04e6&&!catching&&Y-prev<5e6)startImpact();
   while(discI<DISC.length&&DISC[discI][0]<=Y){const d=DISC[discI++];addEv(d[0],d[1],d[2],!catching&&Y-prev<1e6)}return}
  simY=-70000;while(discI<DISC.length&&DISC[discI][0]<-70000){const d=DISC[discI++];addEv(d[0],d[1],d[2],false)}genesis();discI=DISC.findIndex(d=>d[0]>=-70000);tally();rebuildAll()}
 const gap=Y-simY;if(gap<=0)return;
 if(!catching&&gap>30){catching=true;catchFrom=simY}
 const t0=performance.now();let n=0;
 while(Y-simY>=1/12){const g=Y-simY,dt=g>3000?2:g>40?1:1/12;step(Math.min(dt,g),catching);n++;if(catching?performance.now()-t0>26:n>=14)break}
 if(catching){const tot=Y-catchFrom,done=simY-catchFrom;$('catch').style.display='block';$('catchT').textContent='Catching up on history…';$('catchB').style.width=clamp(done/tot*100,0,100)+'%';$('catchS').textContent=`${fmtY(simY)} → ${fmtY(Y)} · ${A.length.toLocaleString('en-US')} people alive`;
  if(Y-simY<1/12){catching=false;$('catch').style.display='none';tally();rebuildAll()}}}
