// ---- per-frame agent movement ----
let sunDir=new THREE.Vector3(1,0,0);
function pickTarget(a,s){const t=s.rt!==undefined&&s.tier<0?s.rt:Math.max(0,s.tier),Rd=s.rad,day=s.day,age=simY-a.b;let x=0,z=0,w=2+rnd()*8;
 const home=s.homes.length?s.homes[a.id%s.homes.length]:[0,0];a.hid=false;
 if(day<-.06){if(t<=1||!s.homes.length){const an=rnd()*6.28,r=.03+rnd()*.035;x=Math.cos(an)*r;z=Math.sin(an)*r;w=15+rnd()*30}else{x=home[0]+(rnd()-.5)*.02;z=home[1]+.03+(rnd()-.5)*.01;a.hid=rnd()<.85;w=30+rnd()*40}}
 else if(day<.06){const an=rnd()*6.28,r=.03+rnd()*.05;if(t<=2){x=Math.cos(an)*r;z=Math.sin(an)*r}else{x=home[0]+Math.cos(an)*.03;z=home[1]+Math.sin(an)*.03}w=6+rnd()*10}
 else{const ring=(a0,a1)=>{const r=Rd*(a0+rnd()*(a1-a0)),an=rnd()*6.28;x=Math.cos(an)*r;z=Math.sin(an)*r};
  switch(a.jc){
  case'kid':{const an=rnd()*6.28,r=rnd()*Rd*.5;x=Math.cos(an)*r;z=Math.sin(an)*r;w=1+rnd()*3;break}
  case'elder':case'fire':{const an=rnd()*6.28,r=.02+rnd()*.04;x=(t>2?home[0]:0)+Math.cos(an)*r;z=(t>2?home[1]:0)+Math.sin(an)*r;w=10+rnd()*25;break}
  case'hunt':{const r=Rd*(1.8+rnd()*1.8),an=a.hb+(rnd()-.5)*.8;x=Math.cos(an)*r;z=Math.sin(an)*r;w=3+rnd()*6;break}
  case'field':if(s.fields.length){const f=pick(s.fields);x=f[0]+(rnd()-.5)*f[2]*.8;z=f[1]+(rnd()-.5)*f[3]*.8;w=4+rnd()*10}else ring(.8,2.2);break;
  case'herd':ring(1.2,2.2);w=6+rnd()*10;break;
  case'fish':if(s.cd!==null){const an=s.cd+(rnd()-.5)*.6,r=Rd*(1.1+rnd()*.5);x=Math.cos(an)*r;z=Math.sin(an)*r}else ring(1,2);break;
  case'craft':case'build':{const b=s.work.length?pick(s.work):home;x=b[0]+(rnd()-.5)*.04;z=b[1]+.03;w=5+rnd()*10;break}
  case'center':case'temple':{const an=rnd()*6.28,r=rnd()*Rd*.25;x=Math.cos(an)*r;z=Math.sin(an)*r;break}
  case'patrol':{const an=rnd()*6.28;x=Math.cos(an)*Rd*.95;z=Math.sin(an)*Rd*.95;w=2;break}
  case'work':case'drive':{const b=s.work.length?pick(s.work):home;x=b[0]+.03;z=b[1]+(rnd()-.5)*.04;w=5+rnd()*12;break}
  default:ring(.7,2.3)}}
 let g=0;while(gH(s,x,z)<0&&g++<4){x*=.5;z*=.5}
 a.tx=x;a.tz=z;a.ty=gY(s,x,z)||0;a.w0=w}
function updAgents(dt,T){const ba=bodyM.instanceMatrix.array,ha=headM.instanceMatrix.array,CP=camera.position,cx=CP.x,cy=CP.y,cz=CP.z,FAR2=(QG.lvl===2||LITE?16:22)**2,bc=bodyM.instanceColor,hc=headM.instanceColor;let n=0;
 for(const a of A){const s=S[a.s];let px,py,pz,ux,uy,uz,fx,fy,fz,sc,hide=false;const age=simY-a.b;sc=age<16?.5+age/16*.5:1;
  if(a.tr){const tr=a.tr,f=S[tr.f];tr.t+=dt/tr.dur;if(tr.t>=1){a.tr=null;s.pend=Math.max(0,s.pend-1);initVis(a);if(!s.pend&&!quiet&&s.pop>0){const nm=nameAt(s,simY);addEv(simY,`${nm} is settled`,s.k,true)}continue}
   const tt=clamp(tr.t-tr.lag,0,1),u=f.U.clone().lerp(s.U,tt).normalize(),u2=f.U.clone().lerp(s.U,Math.min(1,tt+.002)).normalize(),fw=u2.sub(u);fw.addScaledVector(u,-fw.dot(u));if(fw.lengthSq()<1e-12)fw.set(1,0,0);fw.normalize();
   const side=new THREE.Vector3().crossVectors(u,fw);u.addScaledVector(side,tr.off/R).normalize();
   const h=hDir(u.x,u.y,u.z),r=R+Math.max(h,0)+(h<0?.004:0);px=u.x*r;py=u.y*r;pz=u.z*r;ux=u.x;uy=u.y;uz=u.z;fx=fw.x;fy=fw.y;fz=fw.z;
   const bob=Math.abs(Math.sin(T*9+a.id))*.002;px+=ux*bob;py+=uy*bob;pz+=uz*bob;
   if(h<0&&boatN<boatM.instanceMatrix.count){setInst(boatM.instanceMatrix.array,boatN*16,px,py-uy*.003,pz,ux,uy,uz,fx,fy,fz,1);boatM.instanceColor.setXYZ(boatN,.42,.3,.2);boatN++}}
  else{if(!s.built&&s.homes.length===0&&!s.U){hide=true}
   if(a.w>0)a.w-=dt;else{const dx=a.tx-a.x,dz=a.tz-a.z,d=Math.hypot(dx,dz);
    if(d<.003){pickTarget(a,s);a.mv=0;a.w=a.w0||3}
    else{const sp=(a.ill&&a.ill!=='the common cold'?.4:1)*(age<12?.026:.018)*(a.jc==='drive'&&simY>1910?3:1)*(a.jc==='hunt'||a.jc==='herd'?1.3:1),st=Math.min(d,sp*dt);a.x+=dx/d*st;a.z+=dz/d*st;a.y+=(a.ty-a.y)*Math.min(1,st/d);a.h=Math.atan2(dx,dz);a.mv=1;if(st>=d-1e-9)a.w=a.w0||3}}
   const dx=a.tx-a.x,dz=a.tz-a.z;if(a.hid&&Math.hypot(dx,dz)<.004)hide=true;
   const sh=Math.sin(a.h),ch=Math.cos(a.h),o=s.o,e=s.e,u=s.u,so=s.so,bob=a.mv?Math.abs(Math.sin(T*10+a.id))*.0016:0;
   px=o[0]+e[0]*a.x+so[0]*a.z+u[0]*(a.y+bob);py=o[1]+e[1]*a.x+so[1]*a.z+u[1]*(a.y+bob);pz=o[2]+e[2]*a.x+so[2]*a.z+u[2]*(a.y+bob);
   ux=u[0];uy=u[1];uz=u[2];fx=e[0]*sh+so[0]*ch;fy=e[1]*sh+so[1]*ch;fz=e[2]*sh+so[2]*ch}
  a.wx=px;a.wy=py;a.wz=pz;if(!hide&&(px-cx)*(px-cx)+(py-cy)*(py-cy)+(pz-cz)*(pz-cz)>FAR2)hide=true;a.vis=!hide;if(hide){a.wi=-1;continue}
  setInst(ba,n*16,px,py,pz,ux,uy,uz,fx,fy,fz,sc);
  for(let k=0;k<16;k++)ha[n*16+k]=ba[n*16+k];_c.setHex(a.cl);bc.setXYZ(n,_c.r,_c.g,_c.b);const sk=a.skc||(a.skc=skinCol(a.skin));hc.setXYZ(n,sk.r,sk.g,sk.b);a.wi=n;n++}
 bodyM.count=headM.count=n;bodyM.instanceMatrix.needsUpdate=headM.instanceMatrix.needsUpdate=true;
 bc.needsUpdate=hc.needsUpdate=true;colorsDirty=false}
let boatN=0;
function updAnimals(dt,T){GU.uT.value=T%1000;const aa=aniM.instanceMatrix.array,ca=carM.instanceMatrix.array;let na=0,nc=0;
 for(const a of ANIMS){const s=S[a.s];if(!s.built)continue;
  if(a.w>0)a.w-=dt;else{const dx=a.tx-a.x,dz=a.tz-a.z,d=Math.hypot(dx,dz);if(d<.003)pickAT(a,s);else{const sp=a.dom===2?(a.type==='cart'?.02:a.type==='bike'?.035:.07):.012,st=Math.min(d,sp*dt);a.x+=dx/d*st;a.z+=dz/d*st;a.y+=(a.ty-a.y)*Math.min(1,st/d);a.h=Math.atan2(dx,dz)}}
  const sh=Math.sin(a.h),ch=Math.cos(a.h),o=s.o,e=s.e,u=s.u,so=s.so;
  const px=o[0]+e[0]*a.x+so[0]*a.z+u[0]*a.y,py=o[1]+e[1]*a.x+so[1]*a.z+u[1]*a.y,pz=o[2]+e[2]*a.x+so[2]*a.z+u[2]*a.y;
  a.wx=px;a.wy=py;a.wz=pz;
  if(a.type==='robot'){if(HUMN<homB.instanceMatrix.count){setInst(homB.instanceMatrix.array,HUMN*16,px,py,pz,u[0],u[1],u[2],e[0]*sh+so[0]*ch,e[1]*sh+so[1]*ch,e[2]*sh+so[2]*ch,1);for(let k=0;k<16;k++)homH.instanceMatrix.array[HUMN*16+k]=homB.instanceMatrix.array[HUMN*16+k];homB.instanceColor.setXYZ(HUMN,.86,.89,.92);homH.instanceColor.setXYZ(HUMN,.7,.74,.78);HUMN++}continue}
  if(VEH.has(a.type))setInst(ca,(nc++)*16,px,py,pz,u[0],u[1],u[2],e[0]*sh+so[0]*ch,e[1]*sh+so[1]*ch,e[2]*sh+so[2]*ch,realScale(a.type,'car',ANI[a.type][1]));
  else{gaitSet(aniM,na,a,dt,a.w>0?0:1,1);setInst(aa,(na++)*16,px,py,pz,u[0],u[1],u[2],e[0]*sh+so[0]*ch,e[1]*sh+so[1]*ch,e[2]*sh+so[2]*ch,realScale(a.type,'quad',ANI[a.type][1]),ANI[a.type][2]||1)}}
 aniM.count=na;carM.count=nc;aniM.instanceMatrix.needsUpdate=carM.instanceMatrix.needsUpdate=true}

