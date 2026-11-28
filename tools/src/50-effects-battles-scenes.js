// ================== spectacle: particles, explosions, tsunamis, battles, scenes ==================
const PSV=`attribute float aS;attribute vec4 aC;uniform float sc;varying vec4 vC;void main(){vC=aC;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=clamp(aS*sc/max(.001,-mv.z),1.,256.);gl_Position=projectionMatrix*mv;}`,
 PSF=`varying vec4 vC;void main(){vec2 d=gl_PointCoord-.5;float r=length(d);if(r>.5)discard;gl_FragColor=vec4(vC.rgb,vC.a*smoothstep(.5,.05,r));}`;
function PSys(max,add){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(max*3),3));g.setAttribute('aC',new THREE.BufferAttribute(new Float32Array(max*4),4));g.setAttribute('aS',new THREE.BufferAttribute(new Float32Array(max),1));
 const m=new THREE.ShaderMaterial({uniforms:{sc:{value:600}},vertexShader:PSV,fragmentShader:PSF,transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});const p=new THREE.Points(g,m);p.frustumCulled=false;p.renderOrder=add?6:5;scene.add(p);return{p,g,max,L:[]}}
let PSA=null,PSN=null;
// emit: p position, v velocity (units/s), life s, s0->s1 size (world units), c0->c1 rgba, g gravity toward planet centre, dr drag
function emit(sys,p,v,life,s0,s1,c0,c1,g,dr){if(!PSA)return;if(PSCALE<1&&Math.random()>PSCALE)return;const S_=sys==='a'?PSA:PSN;if(S_.L.length>=S_.max)S_.L.shift();S_.L.push({x:p.x,y:p.y,z:p.z,vx:v.x,vy:v.y,vz:v.z,life,age:0,s0,s1,c0,c1,g:g||0,dr:dr||0})}
const _psv=new THREE.Vector2();
function stepPS(S_,dt){if(!S_.L.length&&!S_.n0){S_.p.visible=false;return}const P=S_.g.attributes.position.array,C=S_.g.attributes.aC.array,Z=S_.g.attributes.aS.array;let n=0;const keep=[];
 for(const q of S_.L){q.age+=dt;if(q.age>=q.life)continue;if(q.g){const l=Math.hypot(q.x,q.y,q.z);q.vx-=q.x/l*q.g*dt;q.vy-=q.y/l*q.g*dt;q.vz-=q.z/l*q.g*dt}if(q.dr){const f=Math.max(0,1-q.dr*dt);q.vx*=f;q.vy*=f;q.vz*=f}
  q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;const l2=Math.hypot(q.x,q.y,q.z);if(q.g&&l2<R+.001){continue}keep.push(q);const k=q.age/q.life;
  P[n*3]=q.x;P[n*3+1]=q.y;P[n*3+2]=q.z;for(let j=0;j<4;j++)C[n*4+j]=q.c0[j]+(q.c1[j]-q.c0[j])*k;Z[n]=q.s0+(q.s1-q.s0)*k;n++}
 S_.L=keep;S_.g.setDrawRange(0,n);S_.n0=n;S_.p.visible=n>0;const GA=S_.g.attributes;if(n){GA.position.updateRange.count=n*3;GA.aC.updateRange.count=n*4;GA.aS.updateRange.count=n;GA.position.needsUpdate=GA.aC.needsUpdate=GA.aS.needsUpdate=true}
 const hb=renderer.getDrawingBufferSize(_psv).y;S_.p.material.uniforms.sc.value=hb*.5/Math.tan(camera.fov*DEG/2)}
function tanOf(U){const N=new THREE.Vector3(0,1,0).addScaledVector(U,-U.y);if(N.lengthSq()<1e-6)N.set(1,0,0).addScaledVector(U,-U.x);N.normalize();return{N,E:new THREE.Vector3().crossVectors(N,U)}}
const V_=(x,y,z)=>new THREE.Vector3(x,y,z),rv=()=>V_(rnd()-.5,rnd()-.5,rnd()-.5).normalize();
function gnd(U){return Math.max(0,hDir(U.x,U.y,U.z))}
function at(U,T,dn,de,h){return U.clone().multiplyScalar(R+gnd(U)+(h||0)).addScaledVector(T.N,dn).addScaledVector(T.E,de)}
const near_=(U,a)=>U.angleTo(cam.t)<(a||.25)||cam.alt>30;
// ---- explosion: fireball, flash, shockwave, debris, smoke or mushroom cloud, scorch ----
function blast(U,rad,o){o=o||{};if(!PSA)return;const T=tanOf(U),c=at(U,T,0,0,o.alt||0),up=U.clone(),lite=LITE?.5:1;
 const fl=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:o.flashC||0xfff4d0,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false}));fl.position.copy(c);scene.add(fl);SPEC.push({m:fl,t:0,life:1.4,up:(m,k)=>{m.scale.setScalar(rad*(.3+2.2*k));m.material.opacity=1-k}});
 if(!o.alt||o.ring){const ring=new THREE.Mesh(new THREE.RingGeometry(.92,1,72),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));ring.position.copy(at(U,T,0,0,.003));ring.lookAt(0,0,0);scene.add(ring);SPEC.push({m:ring,t:0,life:o.ringLife||3.5,up:(m,k)=>{m.scale.setScalar(rad*(.2+(o.ringR||7)*Math.sqrt(k)));m.material.opacity=.8*(1-k)}})}
 const nF=Math.round((o.fire||70)*lite);for(let i=0;i<nF;i++){const d=rv().multiplyScalar(rad*(1+rnd()*1.5));d.addScaledVector(up,Math.abs(d.dot(up))*.6);emit('a',c,d,.6+rnd()*1.2,rad*.5,rad*(1.2+rnd()),[1,.95,.7,1],[.8,.15,.02,0],0,2.5)}
 const nD=Math.round((o.debris||40)*lite),dc=o.debrisC||[1,.55,.15,1];for(let i=0;i<nD;i++){const h=rv();h.addScaledVector(up,-h.dot(up));h.normalize();const sp=rad*(2+rnd()*(o.debrisV||5));const v=h.multiplyScalar(sp).addScaledVector(up,sp*(.6+rnd()));emit('a',c,v,2+rnd()*3*(o.debrisT||1),rad*.08,rad*.04,dc,[dc[0]*.5,dc[1]*.2,0,.3],sp*.9,0)}
 if(o.mushroom){const H=o.H||rad*6;for(let i=0;i<Math.round(160*lite);i++){const stem=i<60,a=rnd()*Math.PI*2,rr=stem?rad*.3*rnd():rad*(.6+rnd()*1.6);const dir=T.N.clone().multiplyScalar(Math.cos(a)).addScaledVector(T.E,Math.sin(a));
   const tgt=stem?c.clone().addScaledVector(up,H*rnd()).addScaledVector(dir,rr):c.clone().addScaledVector(up,H*(.85+rnd()*.3)).addScaledVector(dir,rr);const life=14+rnd()*8,v=tgt.sub(c).multiplyScalar(1/5);
   emit('n',c.clone().addScaledVector(dir,rad*.2*rnd()),v,life,rad*.9,rad*(stem?1.6:2.8),stem?[.95,.6,.3,.9]:[.98,.8,.6,.95],[.42,.38,.36,0],0,.2)}}
 else{const nS=Math.round((o.smoke||40)*lite),sc=o.smokeC||[.35,.32,.3,.8];for(let i=0;i<nS;i++){const v=rv().multiplyScalar(rad*.6);v.addScaledVector(up,rad*(.4+rnd()*.8)*(o.smokeUp||1));emit('n',c,v,6+rnd()*8,rad*.8,rad*2.5,sc,[sc[0],sc[1],sc[2],0],0,.3)}}
 if(!o.alt&&rad>.01){const sd=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:0x140c08,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide}));sd.position.copy(at(U,T,0,0,.002));sd.lookAt(0,0,0);sd.scale.setScalar(rad*(o.scorch||1.2));scene.add(sd);SPEC.push({m:sd,t:0,life:o.scorchLife||60,up:(m,k)=>{m.material.opacity=.7*(1-k*k)}})}
 if(U.angleTo(cam.t)<.15)shake=Math.max(shake,Math.min(4,.8+rad*8));if(typeof boom==='function')boom(Math.min(.7,.1+rad));}
// continuous fire at a point
function fireAt(p,up,s,dt,rate){const n=Math.random()<rate*dt?1:0;for(let i=0;i<n;i++){const v=up.clone().multiplyScalar(s*(1.5+rnd()*2)).add(rv().multiplyScalar(s*.6));emit('a',p,v,.5+rnd()*.7,s*1.1,s*.3,[1,.8,.3,.9],[.9,.2,.02,0],0,1)}if(Math.random()<rate*dt*.5){const v=up.clone().multiplyScalar(s*(1+rnd()))/*rise*/;emit('n',p.clone().addScaledVector(up,s*2),v.add(rv().multiplyScalar(s*.3)),5+rnd()*4,s*1.5,s*5,[.2,.18,.17,.7],[.35,.33,.32,0],0,.1)}}
function dustAt(p,up,s,n,col){col=col||[.62,.55,.45,.6];for(let i=0;i<n;i++){const h=rv();h.addScaledVector(up,-h.dot(up));const v=h.multiplyScalar(s*(1+rnd()*2)).addScaledVector(up,s*rnd());emit('n',p,v,2+rnd()*3,s*.8,s*3,col,[col[0],col[1],col[2],0],0,.8)}}
let SPEC=[];
// ---- tsunami: a real wave front racing across the ocean, crashing on coasts ----
let TSU=[];
function tsunami(U,h,reach,label){if(!PSA)return;const T=tanOf(U),SEG=160,g=new THREE.BufferGeometry(),pos=new Float32Array(SEG*3*3),col=new Float32Array(SEG*3*3),idx=[];
 for(let i=0;i<SEG;i++){const a=i,b=(i+1)%SEG;for(const r of[0,1]){idx.push(a*3+r,b*3+r,a*3+r+1,b*3+r,b*3+r+1,a*3+r+1)}}g.setIndex(idx);g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.92,side:THREE.DoubleSide,depthWrite:false}));m.frustumCulled=false;scene.add(m);
 const coasts=S.filter(s=>s.U&&s.cd!==null&&s.pop>0&&s.U.angleTo(U)<reach*DEG).map(s=>({s,a:s.U.angleTo(U),hit:false}));
 if(near_(U,.6))slabel(U,`🌊 Tsunami · up to ${Math.round(h)} m waves`,Math.min(60,20+reach));TSU.push({U,T,h,reach:reach*DEG,m,g,t:0,coasts,label,spd:reach*DEG/Math.max(18,reach*.9),hitLand:new Uint8Array(SEG)})}
function updTsunami(dt){for(const w of TSU){w.t+=dt;const th=Math.min(w.reach,.004+w.spd*w.t),P=w.g.attributes.position.array,C=w.g.attributes.color.array,SEG=P.length/9,fade=Math.max(0,1-(th/w.reach)*.6);
  const amp=Math.max(.012,Math.min(1.2,(.02+w.h*.006)*Math.pow(Math.max(.02,Math.sin(th)/Math.sin(Math.min(w.reach,.03))),-.5)))*fade,wd=Math.max(.01,Math.min(.25,th*R*.12));
  for(let i=0;i<SEG;i++){const ph=i/SEG*Math.PI*2,dir=w.T.N.clone().multiplyScalar(Math.cos(ph)).addScaledVector(w.T.E,Math.sin(ph));
   for(let r=0;r<3;r++){const tt=th-(r===0?-wd*.15:r===1?0:wd)/R;const q=w.U.clone().multiplyScalar(Math.cos(tt)).addScaledVector(dir,Math.sin(tt));const gh=hDir(q.x,q.y,q.z),land=gh>.0005;
    if(r===1&&land)w.hitLand[i]=1;const blocked=w.hitLand[i];const hh=r===1?(blocked?Math.max(0,gh)+.005:amp):0.004;const rr=R+Math.max(0,land?gh:0)+hh;P[(i*3+r)*3]=q.x*rr;P[(i*3+r)*3+1]=q.y*rr;P[(i*3+r)*3+2]=q.z*rr;
    const cc=r===1?(blocked?[.9,.95,1]:[.93,.97,1]):r===0?[.15,.45,.7]:[.08,.3,.55];C[(i*3+r)*3]=cc[0];C[(i*3+r)*3+1]=cc[1];C[(i*3+r)*3+2]=cc[2];
    if(r===1&&!blocked&&Math.random()<.04*(LITE?.5:1)&&near_(q,.2)){const p=q.clone().multiplyScalar(rr);emit('n',p,q.clone().multiplyScalar(amp*(.3+rnd()*.5)).add(rv().multiplyScalar(amp*.2)),1.2,amp*.3,amp*.8,[1,1,1,.8],[.8,.9,1,0],amp*1.2,0)}}}
  w.g.attributes.position.needsUpdate=w.g.attributes.color.needsUpdate=true;w.m.material.opacity=.92*Math.min(1,(w.reach-th)/(w.reach*.15)+.05);
  for(const c of w.coasts)if(!c.hit&&th>=c.a){c.hit=true;const s=c.s,T=tanOf(s.U),hh=Math.round(w.h*Math.pow(Math.max(.02,Math.sin(c.a)/.03),-.5)*1.4);floodAt(s.U,Math.max(.06,Math.min(.4,hh*.006)));
   if(near_(s.U,.15)){shake=Math.max(shake,1.5);toast(`<b>Tsunami hits ${esc(nameAt(s,simY))}</b> · waves about ${Math.max(1,hh)} m high`,5000)}
   if(s.tier>=0&&!catching){s.mm=Math.max(s.mm||1,1+Math.min(1.5,hh/20));s.mu=simY+1}}}
 TSU=TSU.filter(w=>{if(w.t*w.spd>w.reach+.02){scene.remove(w.m);w.g.dispose();return false}return true})}
function floodAt(U,r){const T=tanOf(U),m=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:0x3a7fb8,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));m.position.copy(at(U,T,0,0,.006));m.lookAt(0,0,0);scene.add(m);
 SPEC.push({m,t:0,life:25,up:(m,k)=>{m.scale.setScalar(r*Math.min(1,k*8));m.material.opacity=k<.15?.65:.65*(1-(k-.15)/.85)}});const c=at(U,T,0,0,.01);for(let i=0;i<(LITE?30:70);i++){const v=U.clone().multiplyScalar(r*(.6+rnd()*1.2)).add(rv().multiplyScalar(r*.6));emit('n',c,v,1.5+rnd(),r*.15,r*.5,[1,1,1,.9],[.7,.85,1,0],r*1.4,0)}}
function updSpec(dt){for(const f of SPEC){f.t+=dt;f.up(f.m,Math.min(1,f.t/f.life))}SPEC=SPEC.filter(f=>{if(f.t>=f.life){scene.remove(f.m);if(f.m.geometry)f.m.geometry.dispose();return false}return true})}

// ---- figures & machines for scenes ----
const SCN={on:false,list:[],lab:[]};let SFig,SHorse,SVeh,SPlane,SBld,SBoat;
function mkI(g,n){const x=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial(),n);x.frustumCulled=false;x.count=0;x.instanceMatrix.setUsage(THREE.DynamicDrawUsage);x.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3),3);scene.add(x);return x}
function specInit(){if(PSA)return;PSA=PSys(5000,true);PSN=PSys(4000,false);const Bx=(w,h,d,x,y,z)=>new THREE.BoxGeometry(w,h,d).translate(x,y,z);
 SFig=mkI(mergeG([new THREE.CylinderGeometry(.0055,.0078,.017,7).translate(0,.0085,0),new THREE.SphereGeometry(.0046,7,5).translate(0,.0214,0)]),1400);
 SHorse=mkI(mergeG([Bx(.009,.01,.03,0,.016,0),Bx(.006,.012,.008,0,.026,.018),Bx(.0025,.012,.0025,-.003,.006,.011),Bx(.0025,.012,.0025,.003,.006,.011),Bx(.0025,.012,.0025,-.003,.006,-.011),Bx(.0025,.012,.0025,.003,.006,-.011)]),400);
 SVeh=mkI(mergeG([Bx(.022,.011,.036,0,.0075,0),Bx(.014,.008,.016,0,.017,-.002),Bx(.003,.003,.024,0,.017,.016)]),80);
 SPlane=mkI(mergeG([Bx(.01,.01,.06,0,0,0),Bx(.08,.002,.016,0,0,.005),Bx(.03,.002,.01,0,0,-.026),Bx(.002,.012,.01,0,.006,-.026)]),60);
 SBld=mkI(new THREE.BoxGeometry(1,1,1).translate(0,.5,0),60);SBoat=mkI(mergeG([Bx(.02,.008,.05,0,.004,0),Bx(.012,.01,.012,0,.012,-.012)]),80)}
const _sc=new THREE.Color();let IB={};
function putI(M,p,up,fw,hex,sc,sy,sx,sz){const k=IB[M.uuid]=(IB[M.uuid]||0);if(k>=M.instanceMatrix.count)return;setInst(M.instanceMatrix.array,k*16,p.x,p.y,p.z,up.x,up.y,up.z,fw.x,fw.y,fw.z,sc,sy);
 if(sx||sz){const a=M.instanceMatrix.array,o=k*16;if(sx){a[o]*=sx;a[o+1]*=sx;a[o+2]*=sx}if(sz){a[o+8]*=sz;a[o+9]*=sz;a[o+10]*=sz}}_sc.setHex(hex);M.instanceColor.setXYZ(k,_sc.r,_sc.g,_sc.b);IB[M.uuid]=k+1}
function flushI(){for(const M of[SFig,SHorse,SVeh,SPlane,SBld,SBoat]){if(!M)continue;M.count=IB[M.uuid]||0;M.instanceMatrix.needsUpdate=true;if(M.instanceColor)M.instanceColor.needsUpdate=true}IB={}}
// figure helper: U centre, T tangent, (dn,de) offsets, facing vector f, fall 0..1 toward direction fd
function fig(sc,F,col,crouch){const U=sc.U,T=sc.T,p=at(U,T,F.dn,F.de,F.h||0);let up=U,fw=F.f||T.E;if(F.fall>0){const a=Math.min(1,F.fall)*Math.PI/2,fd=F.fd||fw;up=U.clone().multiplyScalar(Math.cos(a)).addScaledVector(fd,Math.sin(a));fw=fd.clone().multiplyScalar(Math.cos(a)).addScaledVector(U,-Math.sin(a))}
 putI(SFig,p,up,fw,col,sc.s,crouch?.55:1)}
function slabel(U,txt,life){const d=document.createElement('div');d.className='geo s';const cur=[...BIG].reverse().find(b=>b.y<=simY+1&&SC_[b.t]&&(SC_[b.t][1].label===txt))||null;d.onclick=()=>{if(cur)showEvent(cur.y,cur.t,cur.lat,cur.lon);else showEvent(Math.round(simY),txt,...(()=>{const p=ll(U.x,U.y,U.z);return p})())};d.style.cssText='position:absolute;left:0;top:0;pointer-events:auto;cursor:pointer;font:600 12px Archivo,system-ui;color:#fff;background:rgba(20,14,10,.75);border:1px solid rgba(255,138,61,.6);padding:3px 7px;border-radius:7px;white-space:nowrap;transform:translate(-50%,-140%);z-index:2';d.textContent=txt+' ⓘ';document.body.appendChild(d);SCN.lab.push({d,U,t:0,life})}
function updLabelsS(dt){const w=innerWidth,h=innerHeight;for(const L of SCN.lab){L.t+=dt;const v=L.U.clone().multiplyScalar(R+gnd(L.U)+.05),vis=L.U.dot(camera.position.clone().normalize())>.2;v.project(camera);if(!vis||v.z>1){L.d.style.display='none';continue}L.d.style.display='';L.d.style.left=((v.x+1)/2*w)+'px';L.d.style.top=((1-v.y)/2*h)+'px';L.d.style.opacity=Math.min(1,(L.life-L.t)/2)}
 SCN.lab=SCN.lab.filter(L=>{if(L.t>L.life){L.d.remove();return false}return true})}

// ---- battle ----
function weaponOf(Y,w){if(w)return w;return Y>=1914?'mod':Y>=1840?'rifle':Y>=1500?'gun':'bow'}
function battle(U,o){specInit();const T=tanOf(U),Y=simY,n=Math.round((o.n||110)*(LITE?.6:1)),W=o.W||.5,mk=(side,info)=>{const L=[],cav=info[2]||0,wp=weaponOf(Y,info[3]),cols=Math.ceil(Math.sqrt(n*2.2)),rows=Math.ceil(n/cols);
  for(let i=0;i<n;i++){const r=Math.floor(i/cols),c=i%cols,sg=side?1:-1;L.push({side,dn:((c+.5)/cols-.5)*W+(rnd()-.5)*.01,de:sg*(o.gap||.4)+sg*r*.022+(rnd()-.5)*.008,r,alive:true,fall:0,cav:rnd()<cav,wp,fire:rnd()*3,col:info[1]})}return L};
 const sc={k:'battle',U,T,o,t:0,s:o.s||1.6,F:[...mk(0,o.a),...mk(1,o.b)],dur:o.dur||80,tanks:[],planes:[],boats:[]};
 if(Y>=1916&&(o.tanks!==0)&&weaponOf(Y,o.a[3])==='mod')for(const side of[0,1])for(let i=0;i<(o.tanks||5);i++)sc.tanks.push({side,dn:((i+.5)/(o.tanks||5)-.5)*W,de:(side?1:-1)*(o.gap||.4)*1.3,alive:true,fire:rnd()*4});
 if(o.landing){for(const f of sc.F)if(f.side===0){f.de-=.35;f.boat=true}for(let i=0;i<10;i++)sc.boats.push({dn:((i+.5)/10-.5)*W,de:-(o.gap||.4)-.4})}
 SCN.list.push(sc);slabel(U,o.label||`${o.a[0]} vs ${o.b[0]}`,sc.dur);return sc}
function updBattle(sc,dt){const{U,T,o}=sc,t=sc.t,F=sc.F,win=o.win==='b'?1:0,FW=[T.E.clone().negate(),T.E],end=t>sc.dur-12,rout=t>sc.dur*.55;
 const alive=s=>F.filter(f=>f.side===s&&f.alive);
 for(const f of F){if(!f.alive){f.fall=Math.min(1,f.fall+dt*1.5);continue}const sg=f.side?1:-1,ranged=f.wp!=='bow'||(f.wp==='bow'&&f.r>2&&!f.cav),melee=!ranged||(f.wp==='bow'&&!f.cav&&f.r<=2);
  if(f.boat){if(t<8){f.de+=dt*.04;continue}else f.boat=false}
  let target=ranged&&f.wp!=='bow'?sg*.16:melee?sg*.012:sg*.12;if(rout&&f.side!==win)target=sg*1.2;if(rout&&f.side===win&&melee)target=-sg*.05;
  const sp=(f.cav?.09:.035)*(rout&&f.side!==win?1.6:1);if(t>2){const d=target-f.de;f.de+=Math.sign(d)*Math.min(Math.abs(d),sp*dt)}
  if(Math.abs(f.de)<.03&&!rout){f.de+=(rnd()-.5)*.004;f.dn+=(rnd()-.5)*.004;if(rnd()<.02&&near_(U,.2))dustAt(at(U,T,f.dn,f.de),U,.006,1)}
  const front=Math.abs(f.de)<.05;if(front&&t>3&&!end&&rnd()<dt*(f.side===win?.025:.06)){f.alive=false;f.fd=FW[f.side].clone().negate().addScaledVector(T.N,rnd()-.5).normalize()}
  // ranged fire
  f.fire-=dt;if(t>3&&!end&&f.fire<=0&&ranged&&!(rout&&f.side!==win)){const en=F.filter(e=>e.side!==f.side&&e.alive);if(!en.length)continue;const e=pick(en),p0=at(U,T,f.dn,f.de,.02*sc.s),p1=at(U,T,e.dn,e.de,.01);
   if(f.wp==='bow'){f.fire=2+rnd()*3;const TT=1.6,v=p1.clone().sub(p0).multiplyScalar(1/TT).addScaledVector(U,.5*.25*TT);emit('n',p0,v,TT,.006,.006,[.15,.1,.05,1],[.15,.1,.05,1],.25,0);if(rnd()<.18)setTimeout(()=>{if(e.alive){e.alive=false;e.fd=FW[e.side].clone().negate()}},TT*1000)}
   else{f.fire=(f.wp==='gun'?4:f.wp==='rifle'?2.5:1.2)+rnd()*2;const fd=FW[f.side],mz=p0.clone().addScaledVector(fd,.006);emit('a',mz,fd.clone().multiplyScalar(.02),.09,.012,.004,[1,.9,.5,1],[1,.5,.1,0],0,0);
    if(f.wp==='gun'||f.wp==='rifle')emit('n',mz,U.clone().multiplyScalar(.006).addScaledVector(fd,.01),4+rnd()*3,.01,.035,[.95,.95,.95,.55],[.85,.85,.85,0],0,.4);
    if(f.wp==='mod')emit('a',mz,p1.clone().sub(mz).multiplyScalar(4),.25,.003,.003,[1,.9,.4,1],[1,.6,.2,.6],0,0);
    if(rnd()<(f.wp==='gun'?.12:f.wp==='rifle'?.15:.18)){e.alive=false;e.fd=fd.clone()}}}
  const p=at(U,T,f.dn,f.de);if(f.cav&&!f.boat){putI(SHorse,p,U,FW[f.side],o.horse||0x5a3a22,sc.s,1);fig(sc,{dn:f.dn,de:f.de,h:.017*sc.s,f:FW[f.side],fall:f.fall,fd:f.fd},f.col)}else if(!f.boat)fig(sc,{dn:f.dn,de:f.de,f:FW[f.side],fall:f.fall,fd:f.fd},f.alive?f.col:shade(f.col))}
 for(const b of sc.boats){if(t<8)b.de+=dt*.04;if(t<12)putI(SBoat,at(U,T,b.dn,b.de),U,T.E,0x6a6a62,sc.s*1.4)}
 // cannons / artillery
 const Y=simY,art=Y>=1450&&(o.a[3]!=='bow'||o.b[3]!=='bow');sc.art=(sc.art||2)-dt;if(art&&t>4&&!end&&sc.art<=0){sc.art=(Y>=1914?.7:2.2)+rnd()*(Y>=1914?1:2);const side=rnd()<.5?0:1,sg=side?1:-1,dn=(rnd()-.5)*(o.W||.5),de=sg*(.05+rnd()*.25),q=at(U,T,dn,de);const L=q.clone().normalize();
  blast(L,Y>=1914?.03:.018,{fire:25,debris:20,smoke:14,ringR:3,ringLife:1.2,scorch:1.5,scorchLife:40,debrisC:[.55,.42,.3,1]});for(const f of F)if(f.alive&&f.side===side&&Math.hypot(f.dn-dn,f.de-de)<.03&&rnd()<.7){f.alive=false;f.fd=rv().addScaledVector(U,0).normalize();f.fd.addScaledVector(U,-f.fd.dot(U)).normalize()}
  const back=at(U,T,dn*.5,-sg*(o.gap||.4)*1.4,.01);emit('a',back,U.clone().multiplyScalar(.02),.15,.03,.01,[1,.9,.6,1],[1,.4,.1,0],0,0);emit('n',back,U.clone().multiplyScalar(.01),5,.02,.06,[.9,.9,.9,.6],[.8,.8,.8,0],0,.3)}
 for(const k of sc.tanks){if(!k.alive)continue;const sg=k.side?1:-1;if(t>3&&!end)k.de-=sg*dt*.01*(rout&&k.side!==win?-2:1);k.fire-=dt;if(k.fire<=0&&t>4&&!end){k.fire=3+rnd()*3;const mz=at(U,T,k.dn,k.de,.02*sc.s);emit('a',mz,FW[k.side].clone().multiplyScalar(.05),.12,.02,.006,[1,.9,.5,1],[1,.4,.1,0],0,0);const en=F.filter(e=>e.side!==k.side&&e.alive);if(en.length){const e=pick(en);blast(at(U,T,e.dn,e.de).normalize(),.02,{fire:15,debris:12,smoke:8,ringR:2,ringLife:1,scorchLife:30});e.alive=false;e.fd=FW[k.side].clone()}}
  if(rnd()<dt*.01&&t>10){k.alive=false;blast(at(U,T,k.dn,k.de).normalize(),.025,{fire:20,debris:16})}putI(SVeh,at(U,T,k.dn,k.de),U,FW[k.side],k.side?(o.tankB||0x4a5038):(o.tankA||0x56603e),sc.s*1.2)}
 for(const k of sc.tanks)if(!k.alive){putI(SVeh,at(U,T,k.dn,k.de),U,FW[k.side],0x1c1a18,sc.s*1.2);fireAt(at(U,T,k.dn,k.de,.015),U,.006,dt,8)}
 if(Y>=1915&&weaponOf(Y,o.a[3])==='mod'&&o.planes!==0){sc.pl=(sc.pl||1)-dt;if(sc.pl<=0&&!end){sc.pl=4+rnd()*4;const side=rnd()<.5?0:1;sc.planes.push({side,dn:(rnd()-.5)*(o.W||.5),de:-(side?-1:1)*.9,t:0,drop:rnd()*.6-.3})}
  for(const p of sc.planes){p.t+=dt;const sg=p.side?-1:1;p.de+=sg*dt*.12;const pos=at(U,T,p.dn,p.de,.12+.03*Math.sin(p.t));putI(SPlane,pos,U,T.E.clone().multiplyScalar(sg),Y>=1940?0x6a7060:0x9a8a60,sc.s*1.4);if(!p.dropped&&Math.abs(p.de-p.drop)<.02){p.dropped=true;const tgt=at(U,T,p.dn,p.drop).normalize();setTimeout(()=>blast(tgt,.035,{fire:30,debris:25,smoke:16}),900);for(const f of F)if(f.alive&&Math.hypot(f.dn-p.dn,f.de-p.drop)<.035&&rnd()<.6){f.alive=false;f.fd=rv();f.fd.addScaledVector(U,-f.fd.dot(U)).normalize()}}}
  sc.planes=sc.planes.filter(p=>Math.abs(p.de)<1)}}
function shade(h){_sc.setHex(h);_sc.multiplyScalar(.55);return _sc.getHex()}

// ---- assassination: crowd, target, shot or stabbing, panic ----
function assassination(U,o){specInit();const T=tanOf(U),sc={k:'assn',U,T,o,t:0,s:1.5,dur:o.dur||60,crowd:[],tgt:{dn:0,de:0,fall:0},killer:{dn:.05,de:.05}};
 const nC=Math.round((o.crowd||70)*(LITE?.6:1));for(let i=0;i<nC;i++){let dn,de;if(o.car){dn=(rnd()-.5)*.6;de=(rnd()<.5?-1:1)*(.035+rnd()*.03)}else{const a=rnd()*Math.PI*2,r=(o.stab?.05:.07)+rnd()*.12;dn=Math.cos(a)*r;de=Math.sin(a)*r}sc.crowd.push({dn,de,hd:0,col:pick(o.cols||[0x6b4a3a,0x3a4a6b,0x7a6a5a,0x2e2e34,0x8a7a6a,0x5a6a4a])})}
 if(o.stab)for(let i=0;i<(o.attackers||20);i++){const a=i/(o.attackers||20)*Math.PI*2;sc.crowd.push({dn:Math.cos(a)*.045,de:Math.sin(a)*.045,att:true,a,col:0xeeeae0})}
 if(o.car){sc.tgt={dn:-.3,de:0,fall:0};sc.car=-.3}
 if(o.bld)sc.bld=o.bld;SCN.list.push(sc);slabel(U,o.label,sc.dur);return sc}
function updAssn(sc,dt){const{U,T,o}=sc,t=sc.t,hitT=o.hitT||9,c=sc.tgt;
 if(o.car){if(t<hitT)sc.car+=dt*.032;else sc.car+=dt*(t<hitT+2?.03:.12);c.dn=sc.car;const cp=at(U,T,sc.car,0);putI(SVeh,cp,U,T.N,o.carC||0x1a1a2a,1.6,.8);if(o.lead)for(const k of[-.05,-.09])putI(SVeh,at(U,T,sc.car+k+.14,0),U,T.N,0x222226,1.4,.8)}
 for(const b of(sc.bld||[]))putI(SBld,at(U,T,b[0],b[1]),U,T.N,b[4]||0xa0522d,1,b[3],b[2],b[2]);
 const hit=t>=hitT;if(hit&&!sc.shot){sc.shot=true;const from=o.stab?null:(o.from?at(U,T,o.from[0],o.from[1],o.from[2]):at(U,T,c.dn+.04,.03,.02));
  if(from){for(let i=0;i<(o.shots||1);i++)setTimeout(()=>{emit('a',from,rv().multiplyScalar(.01),.12,.02,.005,[1,.95,.6,1],[1,.5,.1,0],0,0);emit('n',from,U.clone().multiplyScalar(.004),3,.008,.03,[.9,.9,.9,.6],[.8,.8,.8,0],0,.3);if(typeof chirp==='function')chirp(180,60,.25,.4)},i*900)}
  if(near_(U,.2))shake=Math.max(shake,.4)}
 if(hit)c.fall=Math.min(1,c.fall+dt*(o.stab?.6:1.2));
 for(const p of sc.crowd){let dn=p.dn,de=p.de;if(p.att){const r=t<hitT-3?.045:t<hitT+3?.012:.012+(t-hitT-3)*.02;dn=c.dn+Math.cos(p.a)*r;de=c.de+Math.sin(p.a)*r}
  else if(t>hitT+.8){const dx=p.dn-c.dn,dy=p.de-c.de,l=Math.hypot(dx,dy)||1,run=Math.min(.18,(t-hitT)*.03)*(o.car?.4:1);dn=p.dn+dx/l*run;de=p.de+dy/l*run}
  const f=V_(0,0,0).addScaledVector(T.N,c.dn-dn).addScaledVector(T.E,c.de-de);if(f.lengthSq()<1e-9)f.copy(T.N);f.normalize();fig(sc,{dn,de,f},p.col,o.car&&t>hitT&&t<hitT+6)}
 const tf=T.N.clone();fig(sc,{dn:c.dn,de:c.de,h:o.car?.012:(o.tgtH||0),f:tf,fall:c.fall,fd:T.E},o.tgtC||0xf0d060);
 if(!o.stab&&o.killer!==false&&!o.from)fig(sc,{dn:c.dn+.04,de:.03,f:T.E.clone().negate()},0x1a1a1a)}

// ---- other scenes ----
function attack911(U,o){specInit();const T=tanOf(U),sc={k:'911',U,T,o,t:0,dur:90,tw:[{dn:0,de:-.012,h:1,hit:4,fall:45},{dn:-.03,de:.012,h:1,hit:11,fall:34}]};SCN.list.push(sc);slabel(U,o.label,90);return sc}
function upd911(sc,dt){const{U,T}=sc,t=sc.t,H=.07;for(const w of sc.tw){if(t>w.fall)w.h=Math.max(0,w.h-dt*.12);const top=at(U,T,w.dn,w.de,H*w.h);putI(SBld,at(U,T,w.dn,w.de),U,T.N,0x9aa0a8,1,H*w.h,.012,.012);
  if(t<w.hit){const k=t/w.hit,pp=at(U,T,w.dn-.6*(1-k),w.de+.05*(1-k),H*.85);putI(SPlane,pp,U,T.N,0xd0d4d8,1.5)}
  if(t>=w.hit&&!w.done){w.done=true;blast(at(U,T,w.dn,w.de,H*.85).normalize(),.025,{alt:H*.85,fire:60,debris:40,smoke:30,ring:false})}
  if(t>w.hit&&w.h>0){const fp=at(U,T,w.dn,w.de,H*.85*w.h);fireAt(fp,U,.006,dt,30);if(Math.random()<dt*6)emit('n',fp,U.clone().multiplyScalar(.01).addScaledVector(T.N,-.008).addScaledVector(T.E,.008),14,.015,.08,[.12,.11,.1,.85],[.3,.3,.3,0],0,0)}
  if(t>w.fall&&w.h>0&&Math.random()<dt*30)dustAt(at(U,T,w.dn,w.de,.01),U,.02,2,[.75,.72,.66,.8])}
 for(let i=0;i<16;i++){const a=i*2.4,r=.05+(i%4)*.03;putI(SBld,at(U,T,Math.cos(a)*r,Math.sin(a)*r),U,T.N,0x7a7f88,1,.02+(i%5)*.006,.012,.012)}}
function sinking(U,o){specInit();const T=tanOf(U),sc={k:'ship',U,T,o,t:0,dur:80};const g=new THREE.Group(),hull=new THREE.Mesh(new THREE.BoxGeometry(.018,.012,.13),new THREE.MeshLambertMaterial({color:0x1a1a1a}));hull.position.y=.006;g.add(hull);const top=new THREE.Mesh(new THREE.BoxGeometry(.016,.008,.09),new THREE.MeshLambertMaterial({color:0xeeeeea}));top.position.y=.016;g.add(top);for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.014,8),new THREE.MeshLambertMaterial({color:0xd8a040}));f.position.set(0,.026,-.03+i*.02);g.add(f)}
 const ice=new THREE.Mesh(new THREE.ConeGeometry(.03,.04,6),new THREE.MeshLambertMaterial({color:0xf2f8ff}));scene.add(g,ice);sc.g=g;sc.ice=ice;SCN.list.push(sc);slabel(U,o.label,80);return sc}
function updShip(sc,dt){const{U,T}=sc,t=sc.t,g=sc.g;const z=Math.min(t,8)*.02-.08,tilt=t>10?Math.min(.9,(t-10)*.02+(t>45?(t-45)*.05:0)):0,sink=t>40?(t-40)*.003:0;
 const p=at(U,T,z,0,-.004-sink);g.position.copy(p);const q=new THREE.Quaternion().setFromUnitVectors(V_(0,1,0),U);g.quaternion.copy(q);g.rotateY(Math.atan2(T.N.dot(V_(0,0,1).applyQuaternion(q)),0));g.rotateX(tilt);g.visible=t<70;sc.ice.position.copy(at(U,T,.1,.02,.01));sc.ice.quaternion.copy(q);
 if(t>8&&t<9.2&&!sc.hit){sc.hit=true;toast('<b>Titanic</b> strikes an iceberg at 11:40 PM',4000);dustAt(at(U,T,.07,0,.005),U,.01,30,[1,1,1,.8])}
 if(t>12)for(let i=0;i<Math.min(14,Math.floor((t-12)/3));i++)putI(SBoat,at(U,T,z+((i*37)%10-5)*.02,(i%2?1:-1)*(.03+(t-12)*.0015*(1+i%3))),U,T.N,0xf0f0e8,.5)}
function fireCity(U,o){specInit();const T=tanOf(U),sc={k:'fire',U,T,o,t:0,dur:o.dur||75,pts:[]};for(let i=0;i<70;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*(o.r||.09);sc.pts.push({dn:Math.cos(a)*r,de:Math.sin(a)*r,on:r<.01?0:1e9,bld:.008+rnd()*.012})}sc.pts[0].on=0;SCN.list.push(sc);slabel(U,o.label,sc.dur);return sc}
function updFire(sc,dt){const{U,T,o}=sc,t=sc.t;for(const p of sc.pts){if(p.on>t&&p.on===1e9){const d=Math.hypot(p.dn+.01,p.de);p.on=d*(o.spd||500)+rnd()*4}const burning=t>p.on&&t<p.on+30,burnt=t>p.on+30;
  putI(SBld,at(U,T,p.dn,p.de),U,T.N,burnt?0x1a1410:burning?0x5a3020:0x8a6a4a,1,burnt?p.bld*.3:p.bld,.01,.01);if(burning&&t<sc.dur-10)fireAt(at(U,T,p.dn,p.de,p.bld),U,.006,dt,5)}}
function crowdScene(U,o){specInit();const T=tanOf(U),sc={k:'crowd',U,T,o,t:0,dur:70,P:[],wall:[]};for(let i=0;i<(LITE?100:180);i++){const side=i%2?1:-1;sc.P.push({dn:(rnd()-.5)*.5,de:side*(.03+rnd()*.15),side,col:pick([0x3a4a6b,0x6b3a3a,0x4a4a4a,0x7a6a5a,0x2e5a4a])})}for(let i=0;i<24;i++)sc.wall.push({dn:(i/23-.5)*.5,h:1});SCN.list.push(sc);slabel(U,o.label,70);return sc}
function updCrowd(sc,dt){const{U,T}=sc,t=sc.t;for(const w of sc.wall){if(t>15&&rnd()<dt*.08)w.h=Math.max(0,w.h-.5);if(w.h>0)putI(SBld,at(U,T,w.dn,0),U,T.N,0xb8b4aa,1,.012*w.h,.02,.004)}
 for(const p of sc.P){const k=Math.min(1,Math.max(0,(t-8)/30));const de=p.de*(1-k*.9)+(k>.5?(rnd()-.5)*.003:0);fig(sc,{dn:p.dn+(k>.7?(rnd()-.5)*.003:0),de,f:T.E.clone().multiplyScalar(-p.side)},p.col)}
 if(t>18&&rnd()<dt*1.5){const c=at(U,T,(rnd()-.5)*.4,(rnd()-.5)*.2,.08+rnd()*.06),col=pick([[1,.3,.3,1],[.3,1,.4,1],[.4,.6,1,1],[1,.9,.3,1],[1,.5,1,1]]);for(let i=0;i<40;i++)emit('a',c,rv().multiplyScalar(.03),1.5,.006,.002,col,[col[0],col[1],col[2],0],.02,1)}sc.s=1.3}
function launchScene(U,o){specInit();const T=tanOf(U),sc={k:'launch',U,T,o,t:0,dur:60};const g=mergeG([new THREE.CylinderGeometry(.006,.006,.08,10).translate(0,.04,0),new THREE.CylinderGeometry(.0045,.006,.03,10).translate(0,.095,0),new THREE.ConeGeometry(.0045,.02,10).translate(0,.12,0)]);sc.m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xf4f4f0}));scene.add(sc.m);SCN.list.push(sc);slabel(U,o.label,60);return sc}
function updLaunch(sc,dt){const{U,T}=sc,t=sc.t,lift=t<5?0:Math.pow(t-5,2)*.004;const p=at(U,T,0,0,lift).addScaledVector(T.E,t>12?Math.pow(t-12,2)*.0006:0);sc.m.position.copy(p);sc.m.quaternion.setFromUnitVectors(V_(0,1,0),U.clone().addScaledVector(T.E,t>12?Math.min(.8,(t-12)*.03):0).normalize());sc.m.visible=lift<6;
 if(t>3&&lift<6){emit('a',p,U.clone().multiplyScalar(-.04).add(rv().multiplyScalar(.01)),.4,.012,.004,[1,.95,.7,1],[1,.4,.1,0],0,0);if(lift<.1)for(let i=0;i<3;i++){const h=rv();h.addScaledVector(U,-h.dot(U));emit('n',at(U,T,0,0,.005),h.multiplyScalar(.03),6,.015,.06,[.96,.95,.94,.8],[.9,.9,.9,0],0,.4)}else emit('n',p,rv().multiplyScalar(.003),5,.01,.03,[.95,.95,.95,.6],[.9,.9,.9,0],0,.2)}
 if(t>45&&!sc.ann){sc.ann=1;toast('<b>July 20, 1969:</b> Neil Armstrong and Buzz Aldrin walk on the Moon',6000)}}
function raidScene(U,o){specInit();const T=tanOf(U),sc={k:'raid',U,T,o,t:0,dur:75,ships:[],planes:[]};for(let i=0;i<8;i++)sc.ships.push({dn:(i%4-1.5)*.05,de:(i<4?-.03:.03),hit:0,sink:0});SCN.list.push(sc);slabel(U,o.label,75);return sc}
function updRaid(sc,dt){const{U,T}=sc,t=sc.t;sc.pt=(sc.pt||0)-dt;if(sc.pt<=0&&t<50){sc.pt=1.5+rnd()*2;const s=pick(sc.ships);sc.planes.push({s,dn:s.dn+.6,de:s.de+(rnd()-.5)*.2,t:0})}
 for(const p of sc.planes){p.t+=dt;p.dn-=dt*.15;const h=.08-Math.max(0,.06*(1-Math.abs(p.dn-p.s.dn)/.3));putI(SPlane,at(U,T,p.dn,p.de,h),U,T.N.clone().negate(),0xc8c0a0,1.4);if(!p.drop&&p.dn<p.s.dn+.02){p.drop=true;const s=p.s;s.hit++;setTimeout(()=>blast(at(U,T,s.dn,s.de).normalize(),.03,{fire:40,debris:20,smoke:20,ringR:2,scorch:.01}),500)}}
 sc.planes=sc.planes.filter(p=>p.dn>-.6);for(const s of sc.ships){if(s.hit>=2)s.sink=Math.min(1,s.sink+dt*.02);const p=at(U,T,s.dn,s.de,-.01*s.sink);putI(SVeh,p,U,T.N,s.hit?0x3a3a3a:0x6a7078,2.4,.6);if(s.hit)fireAt(at(U,T,s.dn,s.de,.01),U,.006,dt,12)}}
function nukeScene(U,o){specInit();blast(U,.1,{mushroom:true,H:.6,fire:160,debris:80,ringR:9,ringLife:5,scorch:1.6,scorchLife:120,flashC:0xffffff});const T=tanOf(U),sc={k:'nuke',U,T,o,t:0,dur:70};SCN.list.push(sc);slabel(U,o.label,60);if(cam.alt<1.5)flyTo(U,4);
 if(o.second)setTimeout(()=>{const V=v3(o.second[0],o.second[1],1);blast(V,.09,{mushroom:true,H:.55,fire:120,debris:60,ringR:8,scorch:1.5,scorchLife:120,flashC:0xffffff});slabel(V,o.second[2],40);toast(`<b>${esc(o.second[2])}</b>`,5000)},o.second[3]*1000);return sc}
function updNuke(sc,dt){const{U,T}=sc,t=sc.t;if(t>2&&t<50)for(let i=0;i<3;i++){const a=rnd()*Math.PI*2,r=.02+rnd()*.06;fireAt(at(U,T,Math.cos(a)*r,Math.sin(a)*r),U,.005,dt,2)}}
function eruptScene(U,o){specInit();const vei=o.vei||6,rad=.015*Math.pow(1.6,vei-4);blast(U,rad,{mushroom:vei>=6,H:rad*10,fire:80,debris:120,debrisV:8,debrisT:1.5,debrisC:[1,.45,.08,1],smoke:60,smokeUp:3,smokeC:[.3,.27,.25,.85],flashC:0xffb070});const T=tanOf(U),sc={k:'erupt',U,T,o,t:0,dur:o.dur||70,rad};SCN.list.push(sc);slabel(U,o.label||`🌋 ${o.name?o.name+' erupts':'Eruption'} · VEI ${vei}`,sc.dur);if(o.ts)setTimeout(()=>tsunami(U,o.ts,o.tsR||20),2500);return sc}
function updErupt(sc,dt){const{U,T}=sc,t=sc.t,r=sc.rad;if(t>sc.dur-15)return;const top=at(U,T,0,0,.005);
 if(rnd()<dt*25*(LITE?.5:1))emit('n',top,U.clone().multiplyScalar(r*(2+rnd()*3)).add(rv().multiplyScalar(r*.6)),10+rnd()*8,r*1.2,r*4,[.28,.25,.23,.85],[.45,.42,.4,0],0,.15);
 if(rnd()<dt*20){const h=rv();emit('a',top,h.multiplyScalar(r*3).addScaledVector(U,r*5),2+rnd()*2,r*.25,r*.12,[1,.6,.1,1],[.8,.2,0,.4],r*4,0)}
 if(t<25&&rnd()<dt*10){const h=rv();h.addScaledVector(U,-h.dot(U)).normalize();emit('n',top,h.multiplyScalar(r*1.5),6,r*.8,r*2.5,[.55,.5,.46,.85],[.5,.48,.45,0],0,.25)}
 if(rnd()<dt*1.2){const p=top.clone().addScaledVector(U,r*(3+rnd()*5)).add(rv().multiplyScalar(r*2));emit('a',p,V_(0,0,0),.12,r*.8,r*.2,[.8,.85,1,1],[.6,.7,1,0],0,0)}}
function quakeScene(U,o){specInit();const T=tanOf(U),sc={k:'quake',U,T,o,t:0,dur:o.dur||70,b:[]};for(let i=0;i<40;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.08;sc.b.push({dn:Math.cos(a)*r,de:Math.sin(a)*r,h:.008+rnd()*.012,down:rnd()<(o.M>=8?.55:.3),fire:o.fire&&rnd()<.3})}
 if(near_(U,.3))shake=Math.max(shake,Math.min(5,(o.M||7)-4));SCN.list.push(sc);slabel(U,o.label||`Earthquake · magnitude ${(o.M||6.5).toFixed(1)}`,sc.dur);if(o.ts){const S0=o.tsAt?v3(o.tsAt[0],o.tsAt[1],1):U;setTimeout(()=>{tsunami(S0,o.ts,o.tsR||25);if(o.tsFly)flyTo(S0,o.tsFly)},o.tsDelay||5000)}return sc}
function updQuake(sc,dt){const{U,T,o}=sc,t=sc.t;if(t<6&&near_(U,.3))shake=Math.max(shake,1.5);for(const b of sc.b){const fallen=b.down&&t>2+b.dn*20;const h=fallen?b.h*.25:b.h;putI(SBld,at(U,T,b.dn+(t<6?(rnd()-.5)*.002:0),b.de),U,T.N,fallen?0x5a5048:0x9a8a74,1,h,.01,.01);if(fallen&&!b.dusted){b.dusted=1;dustAt(at(U,T,b.dn,b.de,.004),U,.01,8)}if(b.fire&&t>8&&t<sc.dur-10)fireAt(at(U,T,b.dn,b.de,h),U,.005,dt,4)}}
function updScenes(dt){for(const sc of SCN.list){sc.t+=dt;const f={jrn:updJrn,cine:updCine,torn:updTorn,tstorm:updTstorm,bliz:updBliz,dust:updDust,heat:updHeat,hland:updLand,sky:updSky,sick:updSick,mem:updMem,fam:updFam,storm:updStorm,chern:updChern,battle:updBattle,assn:updAssn,'911':upd911,ship:updShip,wreck:updWreck,fire:updFire,crowd:updCrowd,launch:updLaunch,raid:updRaid,nuke:updNuke,erupt:updErupt,quake:updQuake}[sc.k];if(f)f(sc,dt)}
 SCN.list=SCN.list.filter(sc=>{if(sc.t>sc.dur){if(sc.m)scene.remove(sc.m);if(sc.g)scene.remove(sc.g);if(sc.ice)scene.remove(sc.ice);return false}return true})}
function updSpectacle(dt){if(!PSA){specInit();if(!PSA)return}dt=Math.min(dt,.1);try{wxEvents(dt);for(const s of STORMS)stormBands(s,dt)}catch(e){}updScenes(dt);flushI();updSpec(dt);updTsunami(dt);stepPS(PSA,dt);stepPS(PSN,dt);updLabelsS(dt)}
