// ---- UNESCO World Heritage: every inscribed site appears on its inscription year; cultural sites with a known Wikidata inception date also appear (dimmer) from when they were built or founded (heritage.json: UNESCO World Heritage List; Wikidata, CC0) ----
let WHX=0,WH=[],WHE=[],whI=0,whP=null,WHL=0;const WHW={};const WHC={c:'Cultural',n:'Natural',m:'Mixed (cultural and natural)'};
function whOrd(n){const v=n%100;return n+(v>10&&v<14?'th':['th','st','nd','rd'][n%10]||'th')}
function whDate(s){const y=s.by,p=s.bp;if(p>=9)return fmtY(y);const b=y<1?' BCE':'';if(p===8)return y<1?'about '+fmtY(y):'the '+(Math.floor(y/10)*10)+'s';if(p===7)return 'the '+whOrd(Math.max(1,Math.ceil(Math.abs(y)/100)))+' century'+b;return 'the '+whOrd(Math.max(1,Math.ceil(Math.abs(y)/1000)))+' millennium'+b}
function whRows(s){const L=[['UNESCO World Heritage',`${WHC[s.c]||'Cultural'} site, inscribed ${s.y}`]];if(s.st)L.push(['Countries',s.st]);if(s.d)L.push(['What it is',s.d]);if(s.by!=null)L.push(['Built or founded',whDate(s)+' (Wikidata inception date)']);if(s.cr)L.push(['Criteria',s.cr+' of UNESCO\'s ten selection criteria']);if(s.dg)L.push(['Status','On the List of World Heritage in Danger']);if(s.k>1)L.push(['Parts',s.k+(s.k>=40?'+':'')+' separate places']);L.push(['Source','UNESCO World Heritage List'+(s.by!=null?'; Wikidata':'')]);return L}
async function loadHeritage(){if(WHL)return;WHL=1;try{const r=await fetch('heritage.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1]).concat(BIG.map(b=>b.t)));
 for(const e of j.wh||[]){if(!e||typeof e[0]!=='number'||e[3]==null||e[4]==null||!e[1])continue;const s={y:e[0],n:e[1],c:e[2],lat:e[3],lon:e[4],st:e[5],d:e[6],cr:e[7],dg:e[8],k:e[9],by:e[10],bp:e[11],wk:e[12]};
  s.f=s.c!=='n'&&s.by!=null?s.by:s.y;s.U=v3(s.lat,s.lon,1);WH.push(s);WHX++;
  const t=`${s.n} becomes a UNESCO World Heritage Site`;if(!have.has(t)){have.add(t);WHW[t]=s;WHE.push([s.y+.5,t,s,0])}
  if(s.by!=null&&!WONDERS.some(w=>Math.abs(w.lat-s.lat)<.15&&Math.abs(w.lon-s.lon)<.15)){const b=`${s.n}: built or founded`;if(!have.has(b)&&!DISC.some(d=>Math.abs(d[0]-s.by)<60&&d[1].includes(s.n))){have.add(b);WHW[b]=s;WHE.push([s.by,b,s,1])}}}
 WHE.sort((a,b)=>a[0]-b[0]);whI=0;while(whI<WHE.length&&simY>=WHE[whI][0])whI++;
 const n=WH.length,pos=new Float32Array(n*3),col=new Float32Array(n*3),yr=new Float32Array(n*2);
 WH.forEach((s,i)=>{const r=R+Math.max(0,hAt(s.lat,s.lon))+.035;pos[i*3]=s.U.x*r;pos[i*3+1]=s.U.y*r;pos[i*3+2]=s.U.z*r;const c=s.dg?[1,.38,.3]:s.c==='n'?[.45,.95,.5]:s.c==='m'?[.4,.85,1]:[1,.8,.35];col.set(c,i*3);yr[i*2]=s.f;yr[i*2+1]=s.y});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('yr',new THREE.BufferAttribute(yr,2));
 whP=new THREE.Points(g,new THREE.ShaderMaterial({uniforms:{map:{value:DOTT()},Yn:{value:simY},pr:{value:1},al:{value:1}},transparent:true,depthWrite:false,
  vertexShader:'attribute vec3 color;attribute vec2 yr;uniform float Yn,pr,al;varying vec4 vC;void main(){if(Yn<yr.x||al<.01){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}vC=vec4(color,al*(Yn<yr.y?.45:1.));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=(Yn<yr.y?4.:6.)*pr;}',
  fragmentShader:'uniform sampler2D map;varying vec4 vC;void main(){float a=texture2D(map,gl_PointCoord).a;if(a<.05)discard;gl_FragColor=vec4(vC.rgb,a*vC.a);}'}));
 whP.frustumCulled=false;whP.onBeforeRender=rr=>{const u=whP.material.uniforms;u.Yn.value=simY;u.pr.value=rr.getPixelRatio();u.al.value=clamp((45-cam.alt)/25,0,1)};scene.add(whP)}catch(e){}}
function fireHeritage(e){const s=e[2],t=e[1];EVLOC[t]=[s.lat,s.lon];addEv(Math.floor(e[0]),t,null,false);const near=s.U.angleTo(cam.t)<.35&&cam.alt<30;
 if(e[3]&&(s.wk||near))toast(`<b>🏛 ${esc(t)}</b><br><small>Today a UNESCO World Heritage Site · date from Wikidata</small>`,5000);else if(near||s.dg)toast(`<b>🏛 ${esc(t)}</b>${s.dg?' · now on the List of World Heritage in Danger':''}<br><small>UNESCO World Heritage List</small>`,4500);
 if(near)slabel(s.U,'🏛 '+s.n,12)}
function whFacts(title,L){const s=WHW[title];if(s)for(const r of whRows(s))L.push(r)}
function whTap(x,y){if(!whP||!WH.length||cam.alt>=45)return false;const cp=camera.position.clone().normalize();let b=null,bd=24*24;for(const s of WH){if(simY<s.f||s.U.dot(cp)<.1)continue;_v.copy(s.U).multiplyScalar(R+.05).project(camera);if(_v.z>1)continue;const sx=(_v.x+1)/2*innerWidth,sy=(1-_v.y)/2*innerHeight,dd=(sx-x)**2+(sy-y)**2;if(dd<bd){bd=dd;b=s}}
 if(!b)return false;const L=whRows(b);if(simY<b.y)L[0]=['UNESCO World Heritage',`Will be inscribed in ${b.y} (${WHC[b.c]||'Cultural'} site)`];showWikiThing(b.n,L,b.wk||b.n);return true}
// ---- Tall buildings and towers: every building and tower 150 m or taller that Wikidata gives a height, place and date (skyline.json; Wikidata, CC0). One merged mesh; the shader hides what isn't built yet or was pulled down, so nothing loops per frame ----
let TB=[],TBE=[],tbI=0,tbM=null,tbU=null,TBL=0;const TBW={};const TBX=10,TBF=4;
function tbRows(s){const L=[['What it is',(s.k==='t'?'Tower':s.k==='m'?'Radio or TV mast':'Building')],...(s.c?[['Nearest big city',s.c+(s.cc&&CC[s.cc]?', '+CC[s.cc].n:'')]]:[]),['Height',`${Math.round(s.h)} m (${Math.round(s.h/.3048).toLocaleString('en-US')} ft); the tallest figure Wikidata gives, which can include a spire or antenna`]];if(s.fl)L.push(['Floors',String(s.fl)]);
 L.push([s.y>2026?'Planned':s.dk==='o'?'Opened':'Built',fmtY(s.y)+(s.dk==='o'?'':' (Wikidata inception date; for some buildings this is when work began)')]);if(s.d)L.push(['Pulled down',fmtY(s.d)]);
 L.push(['In the sim',`Drawn ${TBX} times taller and ${TBF} times wider than real so skylines show from the air; it rises over its last year of building (real building times vary)`]);L.push(['Source','Wikidata (height, coordinates, opening or inception date)']);return L}
async function loadTall(){if(TBL)return;TBL=1;try{for(let i=0;i<40&&!WONL;i++)await new Promise(r=>setTimeout(r,250));const r=await fetch('skyline.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1]).concat(BIG.map(b=>b.t)));
 for(const e of j.tb||[]){if(!e||typeof e[0]!=='number'||!e[1]||typeof e[2]!=='number'||typeof e[3]!=='number'||!(e[4]>0))continue;
  const s={y:e[0],n:e[1],lat:e[2],lon:e[3],h:e[4],d:e[5]||0,fl:e[6],c:e[7],cc:e[8],k:e[9],dk:e[10],wk:e[11]};
  if(WONDERS.some(w=>w.n===s.n||(s.wk&&w.w===s.wk)||(Math.abs(w.lat-s.lat)<.0008&&Math.abs(w.lon-s.lon)<.0008)))continue;s.U=v3(s.lat,s.lon,1);TB.push(s);
  if(s.h>=300&&s.y<=2026){const t=`${s.n} is ${s.dk==='o'?'finished':'built'}, ${Math.round(s.h)} m tall`;if(!have.has(t)&&!DISC.some(d=>Math.abs(d[0]-s.y)<3&&d[1].includes(s.n))){have.add(t);TBW[t]=s;TBE.push([s.y+.5,t,s])}}}
 TBE.sort((a,b)=>a[0]-b[0]);tbI=0;while(tbI<TBE.length&&simY>=TBE[tbI][0])tbI++;
 const n=TB.length,P=[],N=[],C=[],Y=[],O=[],I=[];const up=new THREE.Vector3(),ea=new THREE.Vector3(),no=new THREE.Vector3(),B=new THREE.Vector3(),q=new THREE.Vector3();
 const box=(s,c,y0,y1,w,H)=>{const corner=[[-1,-1],[1,-1],[1,1],[-1,1]];const pt=(cx,cz,y)=>{q.copy(B).addScaledVector(ea,cx*w).addScaledVector(no,cz*w).addScaledVector(up,y);return q};
  const face=(pts,nr)=>{const b0=P.length/3;for(const p of pts){P.push(p.x,p.y,p.z);N.push(nr.x,nr.y,nr.z);C.push(c[0],c[1],c[2]);Y.push(s.y,s.d||9999);const o=p.clone().sub(B);O.push(o.x,o.y,o.z)}I.push(b0,b0+1,b0+2,b0,b0+2,b0+3)};
  for(let k=0;k<4;k++){const a=corner[k],b=corner[(k+1)%4],nr=new THREE.Vector3().addScaledVector(ea,(a[0]+b[0])/2).addScaledVector(no,(a[1]+b[1])/2).normalize();face([pt(a[0],a[1],y0).clone(),pt(b[0],b[1],y0).clone(),pt(b[0],b[1],y1).clone(),pt(a[0],a[1],y1).clone()],nr)}
  face([pt(-1,-1,y1).clone(),pt(-1,1,y1).clone(),pt(1,1,y1).clone(),pt(1,-1,y1).clone()],up)};
 for(const s of TB){up.copy(s.U);ea.set(0,1,0).cross(up).normalize();no.copy(up).cross(ea);B.copy(up).multiplyScalar(R+Math.max(0,hAt(s.lat,s.lon))+.002);
  const H=s.h*R*TBX/6.371e6,m=R*TBF/6.371e6,hs=((s.n.length*7+Math.round(s.h))%10)/10;
  if(s.k==='m'){const w=4*m;box(s,[.8,.45,.4],0,H,w,H)}else if(s.k==='t'){const w=clamp(s.h*.05,12,30)*m/2;box(s,[.78,.78,.76],0,H*.97,w,H);box(s,[.85,.85,.82],H*.68,H*.75,w*3.2,H);box(s,[.7,.7,.7],H*.97,H,w*.25,H)}
  else{const w=clamp(s.h*.16,30,80)*m/2,c=[.52+hs*.12,.6+hs*.1,.68+hs*.06];if(s.h>=250){box(s,c,0,H*.72,w,H);box(s,[c[0]*1.06,c[1]*1.06,c[2]*1.06],H*.72,H*.94,w*.68,H);box(s,[.75,.75,.75],H*.94,H,w*.18,H)}else box(s,c,0,H,w,H)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setAttribute('yr',new THREE.Float32BufferAttribute(Y,2));g.setAttribute('off',new THREE.Float32BufferAttribute(O,3));g.setIndex(I);
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});mat.onBeforeCompile=sh=>{sh.uniforms.Yn={value:simY};tbU=sh.uniforms;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 yr;attribute vec3 off;uniform float Yn;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat tbg=clamp(Yn-yr.x+1.,0.,1.);transformed-=off*(1.-tbg);').replace('#include <project_vertex>','#include <project_vertex>\nif(Yn<yr.x-1.||Yn>=yr.y)gl_Position=vec4(2.,2.,2.,1.);')};
 tbM=new THREE.Mesh(g,mat);tbM.frustumCulled=false;tbM.visible=false;tbM.onBeforeRender=()=>{if(tbU)tbU.Yn.value=simY};scene.add(tbM)}catch(e){console.warn('skyline',e)}}
function fireTall(e){const s=e[2],t=e[1];EVLOC[t]=[s.lat,s.lon];addEv(Math.floor(e[0]),t,null,false);const near=s.U.angleTo(cam.t)<.35&&cam.alt<30;
 if(near)toast(`<b>🏙 ${esc(t)}</b><br><small>${s.c?esc(s.c)+' · ':''}Tall buildings from Wikidata</small>`,4500);if(near)slabel(s.U,'🏙 '+s.n,12)}
function tbFacts(title,L){const s=TBW[title];if(s)for(const r of tbRows(s))L.push(r)}
function tbTap(x,y){if(!tbM||!tbM.visible||cam.alt>=20)return false;const cp=camera.position.clone().normalize();let b=null,bd=22*22;for(const s of TB){if(simY<s.y-1||(s.d&&simY>=s.d)||s.U.dot(cp)<.1)continue;_v.copy(s.U).multiplyScalar(R+Math.max(0,hAt(s.lat,s.lon))+s.h*R*TBX/6.371e6*.6).project(camera);if(_v.z>1)continue;const sx=(_v.x+1)/2*innerWidth,sy=(1-_v.y)/2*innerHeight,dd=(sx-x)**2+(sy-y)**2;if(dd<bd){bd=dd;b=s}}
 if(!b)return false;const L=tbRows(b);if(simY<b.y)L.unshift(['Now','Under construction']);showWikiThing(b.n,L,b.wk||b.n);return true}
// ---- shipwrecks: famous wrecks from the Bronze Age to today at their real sites, sinking on their real dates, and the day each was found or raised (wrecks.json: NOAA, US Navy NHHC, Parks Canada, Institute of Nautical Archaeology, museums, heritage and accident boards; sources on each card) ----
let WRX=0,WR=[],wrP=null;const WRW={},WRK={anc:'Ancient or medieval ship',sail:'Sailing ship',iron:'Steam ironclad',steam:'Steamship or motor ship',sub:'Submarine',tanker:'Oil tanker'};
function wrRows(e,t){const L=[['Ship',WRK[e[4]]||'Ship'],['Lost',fmtY(e[0],1)]];if(t&&t===e[14])L.unshift(['Found',fmtY(e[8],1)]);if(e[10])L.push(['What happened',e[10]]);if(e[6])L.push(['Lives lost',e[6]]);if(e[7])L.push(['Depth',Math.round(e[7]).toLocaleString('en-US')+' m']);if(e[9])L.push([e[8]!=null?'Found or raised':'Since',(e[8]!=null?fmtY(e[8],1)+': ':'')+e[9]]);
 L.push(['Position',e[15]?'Approximate, within about 20 km'+(/secret/.test(e[9]||'')?' (the exact site is kept secret)':''):'The wreck site']);if(t&&t===e[13])L.push(['Drawn','The sinking ship is drawn many times its real size so it can be seen']);if(e[12])L.push(['Source',e[12]]);return L}
async function loadWrecks(){try{const r=await fetch('wrecks.json');if(!r.ok)return;const j=await r.json();const have=new Set(DISC.map(d=>d[1]));
 const add=(y,t,e)=>{if(!t||have.has(t))return;have.add(t);WRW[t]=e;EVLOC[t]=[e[2],e[3]];if(e[11])WIKI[t]=e[11];let q=DISC.length;while(q>0&&DISC[q-1][0]>y)q--;DISC.splice(q,0,[y,t]);if(q<discI||(q===discI&&y<=simY))discI++};
 for(const e of j.w||[]){if(!e||typeof e[0]!=='number'||e[2]==null||e[3]==null||!e[1])continue;e.U=v3(e[2],e[3],1);WR.push(e);WRX++;add(e[0],e[13],e);if(e[8]!=null)add(e[8],e[14],e)}
 const n=WR.length,pos=new Float32Array(n*3),col=new Float32Array(n*3),yr=new Float32Array(n*2);
 WR.forEach((e,i)=>{const r=R+.015;pos[i*3]=e.U.x*r;pos[i*3+1]=e.U.y*r;pos[i*3+2]=e.U.z*r;col.set(e[5]>=500?[.85,.85,1]:e[4]==='tanker'?[.75,.55,.35]:[.45,.9,1],i*3);yr[i*2]=e[0];yr[i*2+1]=e[8]!=null?e[8]:e[0]});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('yr',new THREE.BufferAttribute(yr,2));
 wrP=new THREE.Points(g,new THREE.ShaderMaterial({uniforms:{map:{value:DOTT()},Yn:{value:simY},pr:{value:1},al:{value:1}},transparent:true,depthWrite:false,
  vertexShader:'attribute vec3 color;attribute vec2 yr;uniform float Yn,pr,al;varying vec4 vC;void main(){if(Yn<yr.x||al<.01){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}vC=vec4(color,al*(Yn<yr.y?.4:.9));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=(Yn<yr.y?3.5:5.)*pr;}',
  fragmentShader:'uniform sampler2D map;varying vec4 vC;void main(){float a=texture2D(map,gl_PointCoord).a;if(a<.05)discard;gl_FragColor=vec4(vC.rgb,a*vC.a);}'}));
 wrP.frustumCulled=false;wrP.onBeforeRender=rr=>{const u=wrP.material.uniforms;u.Yn.value=simY;u.pr.value=rr.getPixelRatio();u.al.value=clamp((40-cam.alt)/25,0,1)};scene.add(wrP)}catch(e){}}
function wrFacts(title,L){const e=WRW[title];if(e)for(const r of wrRows(e,title))L.push(r)}
function wrTap(x,y){if(!wrP||!WR.length||cam.alt>=40)return false;const cp=camera.position.clone().normalize();let b=null,bd=22*22;for(const e of WR){if(simY<e[0]||e.U.dot(cp)<.1)continue;_v.copy(e.U).multiplyScalar(R+.015).project(camera);if(_v.z>1)continue;const sx=(_v.x+1)/2*innerWidth,sy=(1-_v.y)/2*innerHeight,dd=(sx-x)**2+(sy-y)**2;if(dd<bd){bd=dd;b=e}}
 if(!b)return false;const L=wrRows(b);if(b[8]!=null&&simY<b[8])L.push(['Today','Not found yet']);showWikiThing('Wreck of '+b[1],L,b[11]||b[1]);return true}
// a small scene: the ship settles and sinks (drawn larger than life), or a sonar ring where a lost wreck is found
function wreckScene(U,e,title){specInit();const T=tanOf(U),found=title===e[14],sc={k:'wreck',U,T,o:{label:title},t:0,dur:found?30:45};
 if(found){const d=new THREE.Mesh(new THREE.RingGeometry(.8,1,40),new THREE.MeshBasicMaterial({color:0x66d0ff,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));d.position.copy(at(U,T,0,0,.003));d.lookAt(0,0,0);scene.add(d);SPEC.push({m:d,t:0,life:30,up:(m,k)=>{const f=(k*6)%1;m.scale.setScalar(.005+f*.06);m.material.opacity=.7*(1-f)}})}
 else{const k=e[4],g=new THREE.Group(),Lh=k==='anc'?.02:k==='sail'?.032:k==='sub'?.03:.05,W=Lh*(k==='sub'?.12:.2),M=c=>new THREE.MeshLambertMaterial({color:c}),B=(w,h,d,x,y,z,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);g.add(m)};
  if(k==='sub'){const m=new THREE.Mesh(new THREE.CylinderGeometry(W/2,W/2,Lh,8),M(0x2a2c30));m.rotation.x=Math.PI/2;m.position.y=W*.2;g.add(m);B(W*.5,W*.9,Lh*.12,0,W*.7,Lh*.1,0x2a2c30)}
  else{B(W,W*.5,Lh,0,W*.25,0,k==='anc'?0x7a5a36:k==='sail'?0x4a3420:k==='tanker'?0x8a2a22:0x26262a);B(W*.9,W*.08,Lh*.96,0,W*.52,0,k==='tanker'?0x6a6a62:0x8a6a48);
   if(k==='anc'||k==='sail'){const nm=k==='anc'?1:3;for(let i=0;i<nm;i++){B(W*.06,Lh*.7,W*.06,0,W*.5+Lh*.35,(i-(nm-1)/2)*Lh*.28,0x5a4630);B(W*1.4,Lh*.32,W*.02,0,W*.5+Lh*.42,(i-(nm-1)/2)*Lh*.28,0xe8e0cc)}}
   else if(k==='iron')B(W*.5,W*.4,W*.5,0,W*.7,0,0x3a3a3a);else{B(W*.7,W*.5,Lh*.3,0,W*.8,k==='tanker'?-Lh*.38:0,0xe8e8e2);if(k==='steam')B(W*.25,W*.9,W*.25,0,W*1.4,0,0xb08a40)}}
  g.position.copy(at(U,T,0,0,0));g.lookAt(0,0,0);g.rotateX(-Math.PI/2);g.rotateY(rnd()*6.28);scene.add(g);sc.g=g;sc.p0=g.position.clone()}
 SCN.list.push(sc);slabel(U,(found?'🔎 ':'')+title,sc.dur);return sc}
function updWreck(sc,dt){const g=sc.g;if(!g)return;const t=sc.t,{U,T}=sc,s=t<8?0:Math.min(1,(t-8)/30);g.position.copy(sc.p0).addScaledVector(U,-s*.03);g.visible=s<.97;if(t>8&&s<.97){g.rotateZ(dt*.006);if(rnd()<dt*6)dustAt(at(U,T,(rnd()-.5)*.02,(rnd()-.5)*.02,.001),U,.003,2,[.95,.97,1,.7])}}
function fireQuake(q){const M=q[4],U=v3(q[2],q[3],1),t=`The ${q[1]} (M${M.toFixed(1)})${q[5]?', '+q[5]+' killed':''}`;EVLOC[t]=[q[2],q[3]];addEv(Math.floor(q[0]),t,null,false);
 toast(`<b>Earthquake: ${esc(q[1])}</b> · magnitude ${M.toFixed(1)}${q[5]?' · '+esc(q[5])+' killed':''}${q[6]?'<br>'+esc(q[6]):''}`,7000);if(U.angleTo(cam.t)<.5||cam.alt>30)quakeScene(U,{M,label:`${q[1]} · magnitude ${M.toFixed(1)}`,dur:50})}
function startPlume(v){boom(.25);try{if(v.U||v.lat!==undefined){const U=v.U||v3(v.lat,v.lon,1);if(U.angleTo(cam.t)<.5||cam.alt>30)eruptScene(U,{vei:VEI[v.n]||5,dur:50,name:v.n})}}catch(e){}const g=new THREE.BufferGeometry(),n=60+((VEI[v.n]||5)*15),pos=new Float32Array(n*3);g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.Points(g,new THREE.PointsMaterial({map:DOTT(),alphaTest:.02,color:0x8a8078,size:.35,transparent:true,opacity:.8,depthWrite:false}));m.frustumCulled=false;scene.add(m);
 PLUMES.push({v,m,t:0,dir:v3(v.lat,v.lon,1),seed:Array.from({length:n},()=>[rnd(),rnd(),rnd()])});{const vei=VEI[v.n]||5,km3=v.km3||[.01,.01,.01,.1,.1,1,10,100,1000][vei];toast(`<b>Eruption: ${esc(v.n)}</b> · VEI ${vei} · ${km3>=1?'~'+km3+' km³':'~'+km3*1000+' million m³'} of rock and ash${v.note?'<br>'+esc(v.note):''}`,7000)}}
function updPlumes(dt){for(const v of VOLC){if(!v.done&&simY>=v.y){v.done=true;if(simY-v.y<3&&!catching)startPlume(v)}}
 while(qkI<QK.length&&simY>=QK[qkI][0]){const q=QK[qkI++];if(simY-q[0]<1&&!catching)try{if(q.nc)fireNCEI(q);else fireQuake(q)}catch(e){}}
 while(hzI<HZ.length&&simY>=HZ[hzI].y){const h=HZ[hzI++];if(simY-h.y<1&&!catching)try{fireHazard(h)}catch(e){}}
 if(!WHL&&simY>-12000)loadHeritage();
 if(!TBL&&simY>1850)loadTall();if(tbM)tbM.visible=simY>=1880&&cam.alt<40;
 while(tbI<TBE.length&&simY>=TBE[tbI][0]){const e=TBE[tbI++];if(simY-e[0]<1&&!catching)try{fireTall(e)}catch(x){}}
 while(whI<WHE.length&&simY>=WHE[whI][0]){const e=WHE[whI++];if(simY-e[0]<1&&!catching)try{fireHeritage(e)}catch(x){}}
 while(btI<BT.length&&simY>=BT[btI][0]){const e=BT[btI++];if(simY-e[0]<1&&!catching)try{fireBattle(e)}catch(x){}}
 while(fdI<FD.length&&simY>=FD[fdI][0]){const e=FD[fdI++];if(simY-e[0]<1&&!catching)try{fireFounding(e)}catch(x){}}
 for(const p of PLUMES){p.t+=dt;const a=p.m.geometry.attributes.position.array,U=p.dir,base=U.clone().multiplyScalar(R+Math.max(0,hDir(U.x,U.y,U.z))),side=new THREE.Vector3(0,1,0).cross(U).normalize(),side2=U.clone().cross(side);
  p.seed.forEach((s,i)=>{const h=((s[0]+p.t*.08)%1)*4,sp=h*.35;const q=base.clone().addScaledVector(U,h).addScaledVector(side,(s[1]-.5)*sp).addScaledVector(side2,(s[2]-.5)*sp);a[i*3]=q.x;a[i*3+1]=q.y;a[i*3+2]=q.z});p.m.geometry.attributes.position.needsUpdate=true;p.m.material.opacity=Math.max(0,.8-p.t/120)}
 PLUMES=PLUMES.filter(p=>{if(p.t>120){scene.remove(p.m);return false}return true})}

// ---- great migrations: herds, flocks, swarms, pods and schools travel their real yearly routes (migrations.json: tracking studies and wildlife agencies; sources on each card) ----
let MGX=0,MG=[],mgT=0,mgClock=0,mgTT=-1e9;const MGW={},mgSeen=new Set();
// kind: colour, height above ground (world units), dots, spread
const MGC={herd:[0xe0c090,.01,90,.35],flock:[0xf4f1e8,.07,70,.3],swarm:[0xff8a2a,.04,110,.3],bats:[0xc0a090,.05,90,.2],crabs:[0xff3a22,.004,90,.04],pod:[0xe8f2ff,.004,12,.25],school:[0x9fe0ff,.004,40,.25],turtle:[0xa8e090,.004,10,.2]};
async function loadMigrations(){try{const r=await fetch('migrations.json');if(!r.ok)return;const j=await r.json();
 for(const m of j.mig||[]){if(!m||!m.n||!Array.isArray(m.p)||m.p.length<2||MGW[m.n]||!MGC[m.k])continue;m.P=m.p.map(q=>v3(q[0],q[1],1));if(m.a==null)m.a=-4000;MGW[m.n]=m;if(m.w)WIKI[m.n]=m.w;MG.push(m);MGX++}}catch(e){}}
function migActive(m,y){return y>=m.a&&(m.end==null||y<m.end)}
function migPos(m,mo){const p=m.p;let i=0;while(i<p.length-2&&p[i+1][2]<=mo)i++;const a=p[i],b=p[i+1],f=b[2]>a[2]?clamp((mo-a[2])/(b[2]-a[2]),0,1):0,A=m.P[i],B=m.P[i+1],ang=A.angleTo(B);let U;
 if(ang<1e-6)U=A.clone();else{const sn=Math.sin(ang);U=A.clone().multiplyScalar(Math.sin((1-f)*ang)/sn).addScaledVector(B,Math.sin(f*ang)/sn)}U.normalize();
 let d=null;if(ang>1e-6&&f<1){d=B.clone().addScaledVector(U,-B.dot(U));if(d.lengthSq()<1e-12)d=null;else d.normalize()}return{U,i,d,moving:!!d&&f>0}}
function migNow(m){return migPos(m,(((simY%1)+1)%1)*12)}
function migMesh(m){const c=MGC[m.k],n=c[2],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));
 const pm=new THREE.Points(g,new THREE.PointsMaterial({map:DOTT(),alphaTest:.02,color:c[0],size:m.k==='pod'||m.k==='turtle'?4.5:3.5,sizeAttenuation:false,transparent:true,opacity:.95,depthWrite:false}));pm.frustumCulled=false;pm.visible=false;scene.add(pm);m.mesh=pm;m.seed=Array.from({length:n},()=>[rnd()*2-1,rnd()*2-1,rnd()]);return pm}
function migLine(m){const pts=[];for(let k=0;k<=96;k++){const q=migPos(m,k/8).U;pts.push(q.multiplyScalar(R+gnd(q)+.03))}const g=new THREE.BufferGeometry().setFromPoints(pts);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:MGC[m.k][0],transparent:true,opacity:.35,depthWrite:false}));l.frustumCulled=false;l.visible=false;scene.add(l);m.line=l;return l}
function updMig(dt){mgT-=dt;mgClock+=dt;if(mgT>0||!MG.length)return;mgT=.1;const cd=camera.position.clone().normalize(),far=Math.max(1,cam.alt/18);
 for(const m of MG){const on=!catching&&migActive(m,simY)&&cam.alt<160;let st=null,vis=false;if(on){st=migNow(m);vis=st.U.dot(cd)>.35}
  if(!vis){if(m.mesh)m.mesh.visible=false;if(m.line)m.line.visible=false;continue}
  const c=MGC[m.k],pm=m.mesh||migMesh(m),U=st.U,a=pm.geometry.attributes.position.array,h=c[1]+gnd(U),sp=c[3]*Math.min(far,6);
  let e1=st.d;if(!e1){e1=new THREE.Vector3(0,1,0).cross(U);if(e1.lengthSq()<1e-6)e1.set(1,0,0);e1.normalize()}const e2=U.clone().cross(e1),base=U.clone().multiplyScalar(R+h);
  for(let i=0;i<m.seed.length;i++){const q=m.seed[i],w=Math.sin(mgClock*(.6+q[2])+q[2]*6.28)*.12,x=(q[0]*1.7+w)*sp,y=(q[1]+w*.5)*sp*(st.moving?.6:1),z=m.k==='flock'||m.k==='swarm'||m.k==='bats'?q[2]*c[1]*.8:0;
   a[i*3]=base.x+e1.x*x+e2.x*y+U.x*z;a[i*3+1]=base.y+e1.y*x+e2.y*y+U.y*z;a[i*3+2]=base.z+e1.z*x+e2.z*y+U.z*z}
  pm.geometry.attributes.position.needsUpdate=true;pm.visible=true;const near=U.angleTo(cam.t)<.3&&cam.alt<35;(m.line||(near?migLine(m):null))&&(m.line.visible=near);
  if(near&&!mgSeen.has(m.n)){mgSeen.add(m.n);slabel(U.clone(),m.n,25);const tn=performance.now();if(tn-mgTT>90000&&(mgTT=tn))toast(`<b>🐾 ${esc(m.n)}</b> · ${esc(m.p[st.i][3])}${m.num?'<br><small>'+esc(m.num)+'</small>':''}`,6000)}}}
function migFacts(title,L){const m=MGW[title];if(!m)return;const st=migNow(m);L.push(['Who',m.sp]);L.push(['Right now',m.p[st.i][3]]);if(m.km)L.push(['Distance',m.km]);if(m.num)L.push(['How many',m.num]);if(m.f)L.push(['What makes it special',m.f]);
 L.push(['Route in the sim',m.lc===1?'This journey really takes years; the sim shows it as one loop a year':m.lc===2?'The return trip is not well recorded, so the sim draws a simple path back':'Follows the tracked route through the real seasons of each sim year']);L.push(['Source',m.s||'Tracking studies'])}
