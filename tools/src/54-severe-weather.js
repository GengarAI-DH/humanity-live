// ================== severe weather you can watch ==================
const EF=[[0,105,137],[1,138,177],[2,178,217],[3,218,266],[4,267,322],[5,323,480]];
function efPick(){const r=rnd();return r<.6?0:r<.85?1:r<.95?2:r<.985?3:r<.997?4:5}
// tornado: rotating funnel, wall cloud, debris cloud, damage path, lightning
function tornado(U,o){specInit();o=o||{};const T=tanOf(U),ef=o.ef!=null?o.ef:efPick(),w=EF[ef],wind=Math.round(w[1]+rnd()*(w[2]-w[1])),ang=o.dir!=null?o.dir:.6+rnd()*.5,dir=T.N.clone().multiplyScalar(Math.cos(ang)).addScaledVector(T.E,Math.sin(ang));
 const len=[3,8,15,30,45,80][ef],wid=[.04,.1,.2,.4,.8,1.2][ef];// km path, km width
 const sc={k:'torn',U,T,o,t:0,dur:o.dur||45,ef,wind,dir,pos:-.12,w:.006+ef*.003,len,wid,trk:[]};SCN.list.push(sc);slabel(U,o.label||`EF${ef} tornado · ${wind} km/h winds`,sc.dur);
 if(near_(U,.2)&&!o.quiet)toast(`<b>Tornado!</b> EF${ef} · winds ${wind} km/h · path about ${len} km long, ${wid>=1?wid+' km':Math.round(wid*1000)+' m'} wide`,6000);return sc}
function updTorn(sc,dt){const{U,T,dir}=sc,t=sc.t,life=sc.dur-6,H=.16+sc.ef*.02;if(t<life)sc.pos+=dt*.006*(1+sc.ef*.25);const base=U.clone().multiplyScalar(R+gnd(U)).addScaledVector(dir,sc.pos),up=base.clone().normalize(),side=new THREE.Vector3().crossVectors(up,dir);
 const grow=Math.min(1,t/5)*(t>life?Math.max(0,1-(t-life)/5):1),lite=LITE?.5:1;
 // wall cloud
 if(rnd()<dt*12*lite){const a=rnd()*Math.PI*2,r=.03+rnd()*.12;emit('n',base.clone().addScaledVector(up,H+rnd()*.02).addScaledVector(dir,Math.cos(a)*r).addScaledVector(side,Math.sin(a)*r),side.clone().multiplyScalar(-Math.sin(a)*.01).addScaledVector(dir,Math.cos(a)*.01),4,.05,.08,[.2,.21,.24,.75],[.25,.26,.28,0],0,0)}
 // funnel: particles spiralling up a narrowing-to-the-ground cone
 const n=Math.round(18*lite*grow)+2;for(let i=0;i<n;i++){const h=Math.pow(rnd(),1.4)*H*grow,r=(sc.w*(.25+(h/H)*2.2))*(1+rnd()*.25),a=rnd()*Math.PI*2+t*8;const p=base.clone().addScaledVector(up,h).addScaledVector(dir,Math.cos(a)*r).addScaledVector(side,Math.sin(a)*r);
  const v=dir.clone().multiplyScalar(-Math.sin(a)*r*14).addScaledVector(side,Math.cos(a)*r*14).addScaledVector(up,.02);emit('n',p,v,.7,sc.w*1.1,sc.w*1.6,[.62,.6,.58,.85],[.5,.48,.46,0],0,.5)}
 // debris & dust at the ground
 if(grow>.3){for(let i=0;i<Math.round(3*lite)+1;i++){const a=rnd()*Math.PI*2,r=sc.w*(.6+rnd()*1.2);const p=base.clone().addScaledVector(dir,Math.cos(a)*r).addScaledVector(side,Math.sin(a)*r);const v=dir.clone().multiplyScalar(-Math.sin(a)*.08).addScaledVector(side,Math.cos(a)*.08).addScaledVector(up,.02+rnd()*.06);
   emit('n',p,v,1.5,sc.w*.6,sc.w*2.5,[.5,.4,.3,.7],[.5,.45,.4,0],0,.6);if(sc.ef>=2&&rnd()<.3)emit('n',p,v.clone().multiplyScalar(1.5),2.5,.003,.003,[.3,.22,.15,1],[.3,.22,.15,1],.05,.2)}}
 // damage path left behind
 if(t<life&&(!sc.lt||t-sc.lt>.5)&&sc.ef>=1){sc.lt=t;const m=new THREE.Mesh(new THREE.CircleGeometry(1,12),new THREE.MeshBasicMaterial({color:0x4a3a2a,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide}));m.position.copy(base.clone().addScaledVector(up,.003));m.lookAt(0,0,0);m.scale.setScalar(sc.w*(1.2+sc.ef*.3));scene.add(m);SPEC.push({m,t:0,life:90,up:(m,k)=>{m.material.opacity=.55*(1-k)}})}
 // lightning in the storm
 if(rnd()<dt*.8)bolt(base.clone().addScaledVector(up,H).addScaledVector(dir,(rnd()-.3)*.12).addScaledVector(side,(rnd()-.5)*.1),up,H)}
function bolt(top,up,H){const pts=[];let p=top.clone();const s=new THREE.Vector3().crossVectors(up,new THREE.Vector3(0,1,0)).normalize(),s2=new THREE.Vector3().crossVectors(up,s);for(let i=0;i<=10;i++){pts.push(p.clone());p=p.clone().addScaledVector(up,-H/10).addScaledVector(s,(rnd()-.5)*H*.12).addScaledVector(s2,(rnd()-.5)*H*.12)}
 const g=new THREE.BufferGeometry().setFromPoints(pts),m=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xe8f0ff,transparent:true,opacity:1}));scene.add(m);SPEC.push({m,t:0,life:.25,up:(m,k)=>{m.material.opacity=k<.3||(k>.5&&k<.7)?1:0}});emit('a',top,new THREE.Vector3(),.15,H*.6,H*.9,[.8,.85,1,.8],[.6,.7,1,0],0,0);
 if(typeof boom==='function'&&top.angleTo?.length&&false)boom(.1);if(SND.on&&AC&&top.clone().normalize().angleTo(cam.t)<.05)setTimeout(()=>boom(.15),400+rnd()*1200)}
// thunderstorm cell
function thunder(U,o){specInit();const T=tanOf(U),sc={k:'tstorm',U,T,o:o||{},t:0,dur:40};SCN.list.push(sc);if(!o||!o.label)slabel(U,'⛈ Thunderstorm',40);return sc}
function updTstorm(sc,dt){const{U,T}=sc,t=sc.t;const H=.13;if(rnd()<dt*14*(LITE?.5:1)){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.18;emit('n',at(U,T,Math.cos(a)*r,Math.sin(a)*r,H+rnd()*.03),rv().multiplyScalar(.003),6,.06,.1,[.24,.25,.29,.75],[.3,.31,.34,0],0,0)}
 if(t<sc.dur-8){for(let i=0;i<(LITE?2:5);i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.15;emit('n',at(U,T,Math.cos(a)*r,Math.sin(a)*r,H-.01),U.clone().multiplyScalar(-.15),.85,.004,.004,[.7,.8,1,.6],[.7,.8,1,.3],0,0)}if(rnd()<dt*.9){const a=rnd()*Math.PI*2,r=rnd()*.14;bolt(at(U,T,Math.cos(a)*r,Math.sin(a)*r,H),U,H)}}}
// blizzard: whiteout, sideways snow
function blizzard(U,o){specInit();const T=tanOf(U),sc={k:'bliz',U,T,o:o||{},t:0,dur:45};SCN.list.push(sc);slabel(U,(o&&o.label)||'Blizzard · winds over 56 km/h, visibility under 400 m',45);return sc}
function updBliz(sc,dt){const{U,T}=sc;for(let i=0;i<(LITE?6:16);i++){const p=at(U,T,(rnd()-.5)*.4,-.25+rnd()*.1,rnd()*.1);emit('n',p,T.E.clone().multiplyScalar(.12+rnd()*.05).addScaledVector(U,-.01),3.5,.004,.006,[1,1,1,.85],[1,1,1,.4],0,0)}if(rnd()<dt*4){const a=rnd()*.3-.15;emit('n',at(U,T,a,-.2,.02),T.E.clone().multiplyScalar(.08),5,.06,.12,[.95,.96,1,.35],[1,1,1,0],0,0)}}
// dust storm / haboob: a wall of dust rolling in
function haboob(U,o){specInit();const T=tanOf(U),sc={k:'dust',U,T,o:o||{},t:0,dur:50,x:-.4};SCN.list.push(sc);slabel(U,(o&&o.label)||'Dust storm (haboob) · a wall of dust up to 1.5 km high',50);return sc}
function updDust(sc,dt){const{U,T}=sc;sc.x+=dt*.016;for(let i=0;i<(LITE?6:14);i++){const dn=(rnd()-.5)*.6,h=Math.pow(rnd(),1.5)*.05;emit('n',at(U,T,dn,sc.x+rnd()*.04,h),T.E.clone().multiplyScalar(.02).addScaledVector(U,.004),4,.03,.07,[.72,.55,.36,.75],[.7,.58,.42,0],0,.2)}}
// heatwave: shimmering haze
function heatwave(U,o){specInit();const T=tanOf(U),m=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:0xff6a20,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));m.position.copy(at(U,T,0,0,.01));m.lookAt(0,0,0);m.scale.setScalar(.5);scene.add(m);SPEC.push({m,t:0,life:45,up:(m,k)=>{m.material.opacity=.22*Math.sin(Math.PI*k)*(.8+.2*Math.sin(k*60))}});const sc={k:'heat',U,T,o:o||{},t:0,dur:45};SCN.list.push(sc);slabel(U,(o&&o.label)||'Heatwave',45);return sc}
function updHeat(sc,dt){const{U,T}=sc;if(rnd()<dt*10){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.4;emit('a',at(U,T,Math.cos(a)*r,Math.sin(a)*r,.005),U.clone().multiplyScalar(.01),3,.03,.06,[.25,.1,0,.3],[.2,.05,0,0],0,0)}}
// river / flash flood with rain
function floodScene(U,o){specInit();floodAt(U,(o&&o.r)||.25);const sc=thunder(U,o||{label:'Flood'});sc.dur=35;if(o&&o.label)slabel(U,o.label,35);return sc}
// hurricane landfall: surge, wind damage, rain bands
function landfall(st,s){if(catching)return;specInit();const U=st.U,T=tanOf(U),surge=s.cat*1.3;floodAt(U,Math.min(.45,.12+s.cat*.06));const sc={k:'hland',U,T,o:{},t:0,dur:50,cat:s.cat,b:[]};for(let i=0;i<30;i++){const a=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.08;sc.b.push({dn:Math.cos(a)*r,de:Math.sin(a)*r,h:.006+rnd()*.012,down:rnd()<s.cat*.12})}SCN.list.push(sc);slabel(U,`${s.name} makes landfall · Category ${s.cat} · ${s.wind} km/h · ${surge.toFixed(1)} m surge`,50)}
function updLand(sc,dt){const{U,T}=sc,t=sc.t,W=T.E.clone().multiplyScalar(.15+sc.cat*.04);for(const b of sc.b){const fallen=b.down&&t>3+rnd()*.1&&t>b.dn*40+5;putI(SBld,at(U,T,b.dn,b.de),U,T.N,fallen?0x4a4038:0x9a8a74,1,fallen?b.h*.3:b.h,.008,.008);if(fallen&&!b.d){b.d=1;dustAt(at(U,T,b.dn,b.de,.004),U,.008,6)}}
 for(let i=0;i<(LITE?4:10);i++)emit('n',at(U,T,(rnd()-.5)*.3,-.2+rnd()*.05,.02+rnd()*.08),W.clone().addScaledVector(U,-.04),2,.004,.004,[.75,.85,1,.6],[.75,.85,1,.3],0,0);if(rnd()<dt*3)emit('n',at(U,T,(rnd()-.5)*.2,(rnd()-.5)*.2,.005),W.clone().multiplyScalar(1.5).addScaledVector(U,.03),2,.003,.003,[.35,.3,.22,1],[.35,.3,.22,1],.05,0)}
// spiral rain bands & lightning under a hurricane when the drone is low
function stormBands(s,dt){if(!s.U||cam.alt>25||s.U.angleTo(cam.t)>.12||!PSA)return;const T=tanOf(s.U);for(let i=0;i<(LITE?4:10);i++){const r=.3+rnd()*3.5,a=Math.log(r)*2.2+rnd()*.5+s.rot,arm=Math.floor(rnd()*3)*2.09;const ang=a+arm;const p=at(s.U,T,Math.cos(ang)*r,Math.sin(ang)*r,.25+rnd()*.15);
  const v=T.N.clone().multiplyScalar(-Math.sin(ang)).addScaledVector(T.E,Math.cos(ang)).multiplyScalar((s.lat>0?1:-1)*.6/(r*.4+.3));emit('n',p,v,3,.2,.35,[.93,.94,.97,.6],[.9,.9,.93,0],0,.1)}
 if(rnd()<dt*1.5){const r=.3+rnd()*2,a=rnd()*Math.PI*2;bolt(at(s.U,T,Math.cos(a)*r,Math.sin(a)*r,.3),s.U,.3)}}
// natural spawning near the drone: tornado alley, thunderstorms, haboobs, blizzards, heat
let wxEvT=40;
function wxEvents(dt){wxEvT-=dt;if(wxEvT>0||catching||cam.alt>8||simY<-66.04e6+1)return;wxEvT=50+rnd()*60;const c=cam.t,p=ll(c.x,c.y,c.z),mo=new Date().getUTCMonth()+1,b=biomeAt(p[0],p[1]);if(hAt(p[0],p[1])<0)return;
 const T=tanOf(c),U=at(c,T,(rnd()-.5)*.3,(rnd()-.5)*.3).normalize();
 const alley=p[0]>28&&p[0]<46&&p[1]>-104&&p[1]<-84,spring=mo>=3&&mo<=7;if(alley&&spring&&rnd()<.6)return tornado(U);if(((p[0]>20&&p[0]<26&&p[1]>88&&p[1]<92)||(p[0]>-40&&p[0]<-28&&p[1]>-66&&p[1]<-56))&&rnd()<.25)return tornado(U);if((b===5||b===4)&&!(p[0]>-10&&p[0]<10)&&spring&&rnd()<.08)return tornado(U);
 if(b===6&&rnd()<.15)return floodScene(U,{label:'Flash flood · a dry wash fills with water in minutes',r:.12});if(b===6&&rnd()<.35)return haboob(U);const win=p[0]>0?(mo>=11||mo<=3):(mo>=5&&mo<=9);if(win&&Math.abs(p[0])>38&&rnd()<.35)return blizzard(U);if(!win&&Math.abs(p[0])<45&&rnd()<.15&&simY>1900)return heatwave(U);if(b!==6&&b!==1&&rnd()<.45)thunder(U)}


