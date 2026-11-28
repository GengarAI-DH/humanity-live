// ---- planes & ships ----
let PLANES=[],SHIPS=[],LBOATS=[],TRAINS=[],RAILP=[];
function boatName(s,t,Y){const c=s.c;if(t<=1)return c==='pol'?'Outrigger canoe':c==='arc'?'Kayak':c==='aus'?'Bark canoe':['and','amz'].includes(c)?'Reed boat':'Dugout canoe';
 if(t<=3)return c==='eg'?'Papyrus reed boat':c==='me'?'Reed boat':['cn','jp'].includes(c)?'Sampan':c==='pol'?'Voyaging canoe':c==='eun'&&Y>700?'Longship':c==='nae'?'Birchbark canoe':'Plank boat';
 if(t===4)return ['athens','rome','istanbul'].includes(s.k)&&Y<500?'Trireme':c==='eun'&&Y<1100?'Longship':['cn','jp','sea'].includes(c)?'Junk':['me','af','in','eg'].includes(c)?'Dhow':c==='and'?'Balsa raft':c==='mes'?'Dugout canoe':'Cog';
 if(t===5)return ['cn','sea'].includes(c)?'Junk':Y<1700?'Galleon':'Sailing ship';if(t===6)return Y<1900?'Steamship':'Fishing trawler';return Y>2035?'Electric ferry':'Ferry'}
const ROUTES=[['london','nyc'],['blombos','mumbai'],['lagos','saopaulo'],['tokyo','la'],['sydney','auckland'],['hawaii','la'],['shanghai','singapore'],['singapore','mumbai'],['buenosaires','blombos'],['nyc','lagos'],['dubai','mumbai'],['hawaii','tokyo'],['london','blombos'],['singapore','sydney']];
// Airliner behaviour by era. Cruise height: unpressurized airliners flew no higher than about 3,000 m; the pressurized
// Boeing 307 (1940) could cruise at 7,500 m (Smithsonian NASM); jets cruise near FL350, about 10,700 m. Descent follows the
// 3-to-1 rule (3 NM per 1,000 ft, about a 3 degree path) and the climb mirrors it. Speed from real trip times: DC-3 coast to
// coast in under 16 h (NASM), 707 New York-Paris in 8 h 41 min with a stop (Britannica); the Boeing 247 flew 50% faster than the Ford Tri-Motor.
function planeEra(Y){return Y<1933?{kmh:165,cm:3000}:Y<1946?{kmh:250,cm:3000}:Y<1958?{kmh:250,cm:7500}:{kmh:670,cm:10700}}
function newFlight(a,b,pe,t){const ang=a.U.angleTo(b.U);return{a,b,t,ang,park:0,cm:pe.cm,dur:40+ang*60*670/pe.kmh,ga:Math.max(0,hDir(a.U.x,a.U.y,a.U.z)),gb:Math.max(0,hDir(b.U.x,b.U.y,b.U.z))}}
// ocean ships by era: sail vs steam share, speed in knots, days in port (sources in tools/BEHAVIOR.md). Voyages run at SHK seconds per real hour, port stays at SHP.
const SHK=1.2,SHP=.3;
function shipSteamP(Y){return Y<1840?0:Y<1860?lerp(0,.155,(Y-1840)/20):Y<1870?lerp(.155,.24,(Y-1860)/10):Y<1880?lerp(.24,.47,(Y-1870)/10):Y<1910?lerp(.47,.8,(Y-1880)/30):Y<1930?lerp(.8,1,(Y-1910)/20):1}
function shipKn(Y,sail){return sail?(Y<1818?4:5):Y<1950?9:Y<1968?lerp(9,22.5,(Y-1950)/18):Y<2008?22.5:18}
function shipPortH(Y,sail){return sail?288:Math.max(22,lerp(288,22,clamp((Y-1850)/150,0,1)))}
function shipName(s,Y){return s.sail?'Sailing ship':Y<1950?'Steamship':Y<2008?'Cargo ship':'Container ship'}
function shipLeg(s){const A1=s.dir>0?s.a:s.b,B1=s.dir>0?s.b:s.a;s.sail=rnd()>=shipSteamP(simY);s.kn=shipKn(simY,s.sail)*(.85+rnd()*.3);const hrs=A1.U.angleTo(B1.U)*6371/(s.kn*1.852);s.dur=Math.max(30,hrs*SHK);s.days=hrs/24;s.ak=''}
function nightCurfew(s,uh){if(s.lon===undefined)s.lon=ll(s.U.x,s.U.y,s.U.z)[1];const h=((uh+s.lon/15)%24+24)%24;return h>=23||h<6}
const _pu=new THREE.Vector3(),_pu2=new THREE.Vector3();let _tbig=[],_tbT=0,_shT=0;
function updTransport(dt){
 _tbT-=dt;if(_tbT<=0){_tbT=.5;_tbig=S.filter(s=>s.built&&s.tier>=6)}
 const big=_tbig,want=simY<1919?0:Math.round(lerp(2,55,clamp((simY-1919)/95,0,1)));
 const pe=planeEra(simY),uh=(Date.now()/36e5)%24;
 while(PLANES.length<want&&big.length>1){const a=pick(big);let b=pick(big);if(a===b)continue;PLANES.push(newFlight(a,b,pe,rnd()*.5))}
 if(PLANES.length>want)PLANES.length=want;
 let n=0;const arr=planeM.instanceMatrix.array;
 for(const p of PLANES){
  // turnaround at the gate, and no short-haul departures in the local night (curfew 11pm-6am, e.g. Sydney Airport)
  if(p.park>0){p.park-=dt;p.wx=undefined;if(p.park<=0){const b=pick(big);if(b===p.a){p.park=1;continue}if(p.a.U.angleTo(b.U)*6371<4000&&nightCurfew(p.a,uh)){p.park=5;continue}Object.assign(p,newFlight(p.a,b,pe,0))}continue}
  p.t+=dt/p.dur;if(p.t>=1){p.a=p.b;p.park=6+rnd()*8;p.wx=undefined;continue}
  const Dk=p.ang*6371,x=p.t*Dk,dd=p.cm*.01823,c1=x<dd,d1=Dk-x<dd,fr=Math.min(1,x/dd,(Dk-x)/dd),h=fr*(2-fr),V=p.cm/10700*1.3;
  const u=_pu.copy(p.a.U).lerp(p.b.U,p.t).normalize(),u2=_pu2.copy(p.a.U).lerp(p.b.U,Math.min(1,p.t+.01)).normalize(),alt=R+p.ga+(p.gb-p.ga)*p.t+.04+V*h;
  const f=u2.sub(u);f.addScaledVector(u,-f.dot(u)).normalize();
  const sl=fr<1?(c1?1:-1)*Math.atan(V*(2-2*fr)/dd*6371/R)*.6:0,cs=Math.cos(sl),sn=Math.sin(sl),fx=f.x*cs+u.x*sn,fy=f.y*cs+u.y*sn,fz=f.z*cs+u.z*sn,ux=u.x*cs-f.x*sn,uy=u.y*cs-f.y*sn,uz=u.z*cs-f.z*sn;
  const ph=fr<1&&c1&&d1?0:c1?1:d1?2:3;if(p.ph!==ph||p.phA!==p.a||p.phB!==p.b){p.ph=ph;p.phA=p.a;p.phB=p.b;
  p.act=fr<1&&c1&&d1?'short hop, climbing and descending':c1?'climbing out of '+nameAt(p.a,simY):d1?'descending into '+nameAt(p.b,simY):'cruising at about '+(Math.round(p.cm/100)*100).toLocaleString('en-US')+' m to '+nameAt(p.b,simY)}
  p.wx=u.x*alt;p.wy=u.y*alt;p.wz=u.z*alt;setInst(arr,n*16,p.wx,p.wy,p.wz,ux,uy,uz,fx,fy,fz,1.6);planeM.instanceColor.setXYZ(n,.95,.95,.97);n++}
 planeM.count=n;planeM.instanceMatrix.needsUpdate=true;planeM.instanceColor.needsUpdate=true;
 // ships
 _shT-=dt;if(simY>=1500){if(_shT<=0){_shT=1;for(const r of ROUTES){const a=SK[r[0]],b=SK[r[1]];if(!a.built||!b.built||a.tier<5||b.tier<5)continue;const id=r.join();if(!SHIPS.some(s=>s.id===id)){const sh={id,a,b,t:rnd(),dir:1,park:0};shipLeg(sh);SHIPS.push(sh)}}}}else SHIPS=[];
 n=0;const sa=shipM.instanceMatrix.array;
 for(const s of SHIPS){if(!s.a.built||!s.b.built){continue}if(!s.kn)shipLeg(s);
  // at sea: slow near ports, full speed in open water; on arrival wait in port, then sail back (a new ship type may be chosen as steam replaces sail)
  if(s.park>0){s.park-=dt;if(s.park<=0)shipLeg(s)}else{const e0=Math.min(s.t,1-s.t);s.t+=dt/s.dur*s.dir*(.35+.65*Math.min(1,e0/.02));if(s.t>1||s.t<0){s.dir*=-1;s.t=clamp(s.t,0,1);s.park=shipPortH(simY,s.sail)*SHP;s.ph=shipPortH(simY,s.sail)}}
  const A1=s.dir>0?s.a:s.b,B1=s.dir>0?s.b:s.a,tt=s.dir>0?s.t:1-s.t;
  {const dd=s.park>0?-1:Math.floor(tt*s.days);const k=dd+'|'+(A1.i||0);if(s.ak!==k){s.ak=k;const kn=Math.round(s.kn);s.act=s.park>0?`in port at ${nameAt(A1,simY)}, loading and unloading (about ${Math.max(1,Math.round(s.ph/24))} day${Math.round(s.ph/24)>1?'s':''})`:`${s.sail?'under sail':simY<1950?'steaming':simY<2008?'cruising':'slow steaming to save fuel'} at about ${kn} knots, ${nameAt(A1,simY)} to ${nameAt(B1,simY)}, day ${dd+1} of about ${Math.max(1,Math.round(s.days))}`}}
  const u=_pu.copy(A1.U).lerp(B1.U,tt).normalize(),u2=_pu2.copy(A1.U).lerp(B1.U,Math.min(1,tt+.005)).normalize(),f=u2.sub(u);f.addScaledVector(u,-f.dot(u)).normalize();const r_=R+Math.max(0,hDir(u.x,u.y,u.z))+.005;
  s.wx=u.x*r_;s.wy=u.y*r_;s.wz=u.z*r_;setInst(sa,n*16,u.x*r_,u.y*r_,u.z*r_,u.x,u.y,u.z,f.x,f.y,f.z,1.4);_c.setHex(s.sail?0x6b4a2e:0x3a3f48);shipM.instanceColor.setXYZ(n,_c.r,_c.g,_c.b);n++}
 LBOATS=[];const T=performance.now()/1000;
 for(const s of S){if(!s.built||s.cd===null||s.tier<0||!s.U||s.U.angleTo(cam.t)>.08)continue;const t=s.tier;
  for(let i=0;i<2;i++){const a=s.cd+Math.sin(T*.03+i*2+s.i)*.5,r=s.rad*1.65+.08+i*.06,x=Math.cos(a)*r,z=Math.sin(a)*r;if(gH(s,x,z)>=0)continue;
   const w=locW(s,x,-.03,z),hd=a+1.57*(Math.cos(T*.03+i*2+s.i)>0?1:-1),f=[s.e[0]*Math.cos(hd)+s.so[0]*Math.sin(hd),s.e[1]*Math.cos(hd)+s.so[1]*Math.sin(hd),s.e[2]*Math.cos(hd)+s.so[2]*Math.sin(hd)];
   if(t<=3){if(boatN<boatM.instanceMatrix.count){setInst(boatM.instanceMatrix.array,boatN*16,w[0],w[1],w[2],s.u[0],s.u[1],s.u[2],f[0],f[1],f[2],1.2);boatM.instanceColor.setXYZ(boatN,.45,.32,.2);boatN++}}
   else if(n<shipM.instanceMatrix.count){setInst(sa,n*16,w[0],w[1],w[2],s.u[0],s.u[1],s.u[2],f[0],f[1],f[2],t>=6?.9:.6);_c.setHex(t>=6?0x3a4f6a:0x6b4a2e);shipM.instanceColor.setXYZ(n,_c.r,_c.g,_c.b);n++}
   LBOATS.push([w[0],w[1],w[2],boatName(s,t,simY)])}}
 boatM.count=boatN;boatM.instanceMatrix.needsUpdate=boatM.instanceColor.needsUpdate=true;
 shipM.count=n;shipM.instanceMatrix.needsUpdate=true;shipM.instanceColor.needsUpdate=true;
 // trains
 const ta=trainM.instanceMatrix.array;let nt=0;
 if(simY>1830)for(const tr of TRAINS){tr.t+=dt/tr.dur*tr.d;if(tr.t>1||tr.t<0){tr.d*=-1;tr.t=clamp(tr.t,0,1)}const P_=tr.p,f=tr.t*(P_.length-1),k=Math.min(P_.length-2,Math.floor(f)),fr=f-k,a=P_[k],b=P_[k+1];
  const px=a.x+(b.x-a.x)*fr,py=a.y+(b.y-a.y)*fr,pz=a.z+(b.z-a.z)*fr,l=Math.hypot(px,py,pz),ux=px/l,uy=py/l,uz=pz/l;let fx=(b.x-a.x)*tr.d,fy=(b.y-a.y)*tr.d,fz=(b.z-a.z)*tr.d;const dp=fx*ux+fy*uy+fz*uz;fx-=ux*dp;fy-=uy*dp;fz-=uz*dp;const fl=Math.hypot(fx,fy,fz)||1;
  tr.wx=px;tr.wy=py;tr.wz=pz;setInst(ta,nt*16,px,py,pz,ux,uy,uz,fx/fl,fy/fl,fz/fl,1.2);_c.setHex(tr.hs?0xf2f2f2:simY<1950?0x222222:0x8a2a2a);trainM.instanceColor.setXYZ(nt,_c.r,_c.g,_c.b);nt++;if(nt>=trainM.instanceMatrix.count)break}
 trainM.count=nt;trainM.instanceMatrix.needsUpdate=trainM.instanceColor.needsUpdate=true;
 updSpace(dt)}
