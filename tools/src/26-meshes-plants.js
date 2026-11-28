// ================== visuals: instanced meshes ==================
let caravM,trainM,homB,homH,droneM,wildM,whaleM,birdM,bodyM,headM,aniM,carM,planeM,shipM,boatM,treeM={},fireP,lightP,railL,pin;
let colorsDirty=true;
function body(){const b=new THREE.CylinderGeometry(.0055,.0078,.017,7).translate(0,.0085,0);return b}
function quad(){const RX=(g,a)=>g.rotateX(a),parts=[new THREE.SphereGeometry(.5,6,5).scale(.0118,.0128,.029).translate(0,.0168,0),RX(new THREE.CylinderGeometry(.0028,.0042,.012,4,1,true).rotateY(.785),.75).translate(0,.0225,.0155),RX(new THREE.CylinderGeometry(.0018,.0036,.011,4).rotateY(.785),Math.PI/2+.35).translate(0,.027,.0235),RX(new THREE.ConeGeometry(.0013,.011,3),Math.PI+.35).translate(0,.0145,-.0162)];for(const a of[-1,1]){for(const b of[-1,1])parts.push(new THREE.CylinderGeometry(.002,.0013,.0128,3,1,true).translate(a*.0045,.0064,b*.0105))}return mergeG(parts).scale(.92,.92,.92)}
const GU={uT:{value:0}};
function GAIT(M,lt,sw,bi,tz,ta,mode,k,rate,idle){const n=M.instanceMatrix.count,A=new THREE.InstancedBufferAttribute(new Float32Array(n*2),2);A.setUsage(THREE.DynamicDrawUsage);M.geometry.setAttribute('aGt',A);M.userData.gr=rate;M.userData.idle=idle||0;
 const G=new THREE.Vector4(lt,sw,bi,0),H=new THREE.Vector4(tz,ta,mode,k);
 M.material.onBeforeCompile=sh=>{sh.uniforms.uT=GU.uT;sh.uniforms.uG={value:G};sh.uniforms.uH={value:H};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec2 aGt;uniform float uT;uniform vec4 uG,uH;').replace('#include <begin_vertex>',`#include <begin_vertex>
{float ga=aGt.y,ph=aGt.x,h0=0.;
#ifdef USE_INSTANCING
h0=dot(instanceMatrix[3].xyz,vec3(1.7,2.3,3.1))*900.;
#endif
if(uH.z<.5){float sd=sign(position.x+1e-5)*(uG.z>.5?1.:sign(position.z+1e-5));
 if(position.y<uG.x)transformed.z+=sin(ph+(sd>0.?0.:3.1416))*uG.y*(uG.x-position.y)*ga;else transformed.y+=abs(sin(ph))*uG.x*.05*ga;
 if(position.z<uH.x)transformed.x+=sin(uT*1.6+h0+ph*.5)*uH.y*(uH.x-position.z);
}else if(uH.z<1.5)transformed.x+=sin(ph-position.z*uH.w)*uG.y*max(0.,uG.x-position.z)*(.4+ga);
else transformed.y+=sin(ph)*uG.y*max(0.,abs(position.x)-uH.w)*(.4+ga);}`).replace('#include <color_vertex>',`#include <color_vertex>
#ifdef USE_INSTANCING_COLOR
vColor.xyz*=uH.z<.5?(position.y<uG.x?1.:mix(1.14,.9,clamp((position.y-uG.x)/uG.x,0.,1.))):mix(1.22,.9,smoothstep(-.004,.004,position.y));
#endif`)};M.material.customProgramCacheKey=()=>'gait1';M.material.needsUpdate=true}
function gaitSet(M,i,a,dt,mv,sc){const G=M.geometry.attributes.aGt;if(!G)return;const g=a.ga||0;a.ga=g+(Math.min(1,mv)-g)*Math.min(1,dt*4);if(a.gp===undefined)a.gp=Math.random()*6.28;a.gp+=dt*M.userData.gr*Math.max(mv,M.userData.idle)/Math.sqrt(Math.max(.4,sc||1));G.setXY(i,a.gp%6283.2,a.ga);G.needsUpdate=true}
function mergeG(parts){const list=parts.map(g=>({g:g.index?g.toNonIndexed():g,m:new THREE.Matrix4(),c:new THREE.Color(1,1,1)}));const g=merge(list);g.deleteAttribute('color');return g}
function initMeshes(){const lam=(o)=>new THREE.MeshLambertMaterial(o||{});
 const mk=(g,n,m)=>{const x=new THREE.InstancedMesh(g,m||lam(),n);x.frustumCulled=false;x.count=0;x.instanceMatrix.setUsage(THREE.DynamicDrawUsage);x.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(n*3),3);scene.add(x);return x};
 bodyM=mk(body(),3400);headM=mk(new THREE.SphereGeometry(.0046,7,5).translate(0,.0214,0),3400);
 aniM=mk(quad(),1400);
 carM=mk(mergeG([new THREE.BoxGeometry(.013,.007,.026).translate(0,.0045,0),new THREE.BoxGeometry(.011,.006,.013).translate(0,.011,-.002)]),900);
 planeM=mk(mergeG([new THREE.BoxGeometry(.012,.012,.09),new THREE.BoxGeometry(.11,.003,.022).translate(0,0,.005),new THREE.BoxGeometry(.04,.003,.012).translate(0,0,-.038),new THREE.BoxGeometry(.002,.02,.014).translate(0,.01,-.038)]),80);
 caravM=mk(mergeG([new THREE.BoxGeometry(.012,.012,.022).translate(0,.012,0),new THREE.BoxGeometry(.004,.012,.004).translate(-.004,.003,.007),new THREE.BoxGeometry(.004,.012,.004).translate(.004,.003,-.007),new THREE.BoxGeometry(.008,.01,.016).translate(0,.01,-.03)]),60);
 trainM=mk(mergeG([new THREE.BoxGeometry(.012,.012,.03).translate(0,.006,.036),new THREE.BoxGeometry(.012,.01,.028).translate(0,.005,0),new THREE.BoxGeometry(.012,.01,.028).translate(0,.005,-.032)]),80);
 shipM=mk(mergeG([new THREE.BoxGeometry(.03,.014,.1).translate(0,.007,0),new THREE.BoxGeometry(.002,.07,.002).translate(0,.04,0),new THREE.BoxGeometry(.001,.045,.04).translate(0,.04,.005),new THREE.BoxGeometry(.018,.012,.02).translate(0,.02,-.03)]),140);
 boatM=mk(mergeG([new THREE.BoxGeometry(.012,.005,.038).translate(0,.0025,0)]),400);
 wildM=mk(quad(),1400);
 const B=(w,h,d,x,y,z)=>new THREE.BoxGeometry(w,h,d).translate(x,y,z),RX=(g,a)=>g.rotateX(a);
 const thero=[new THREE.SphereGeometry(.5,6,4).scale(.012,.015,.03).translate(0,.031,.001),RX(new THREE.BoxGeometry(.007,.01,.011),-.55).translate(0,.036,.017),RX(new THREE.CylinderGeometry(.0026,.005,.016,4).rotateY(Math.PI/4),Math.PI/2).scale(.75,1.3,1).translate(0,.04,.029),RX(new THREE.BoxGeometry(.005,.0025,.012),.12).translate(0,.0335,.027),RX(new THREE.ConeGeometry(.0058,.044,5),-Math.PI/2-.08).translate(0,.031,-.035)];
 for(const a of[-1,1])thero.push(RX(new THREE.BoxGeometry(.0055,.017,.009),.32).translate(a*.0055,.023,-.001),RX(new THREE.BoxGeometry(.0035,.016,.004),-.38).translate(a*.0055,.009,-.003),B(.0045,.002,.008,a*.0055,.001,.002),RX(new THREE.BoxGeometry(.0014,.006,.0014),.7).translate(a*.004,.027,.016));
 const sauro=[B(.022,.02,.042,0,.042,0),RX(new THREE.BoxGeometry(.007,.007,.05),-.9).translate(0,.07,.036),B(.008,.007,.012,0,.09,.054),RX(new THREE.BoxGeometry(.007,.007,.055),-.2).translate(0,.04,-.046)];for(const a of[-1,1])for(const b of[-1,1])sauro.push(B(.008,.034,.008,a*.008,.017,b*.013));
 const cera=[RX(new THREE.SphereGeometry(.5,7,5).scale(.023,.019,.036),.1).translate(0,.022,-.002),RX(new THREE.CylinderGeometry(.0035,.0078,.019,5),Math.PI/2+.4).scale(1,1.15,1).translate(0,.018,.025),RX(new THREE.SphereGeometry(.5,8,4).scale(.036,.03,.004),-.85).translate(0,.031,.013),RX(new THREE.ConeGeometry(.0055,.02,5),-Math.PI/2-.12).translate(0,.021,-.028)];
 for(const a of[-1,1]){cera.push(RX(new THREE.ConeGeometry(.0017,.017,4),Math.PI/2-.55).translate(a*.0045,.03,.031));for(const b of[-1,1])cera.push(B(.0062,b>0?.012:.015,.0068,a*.0075,b>0?.006:.0075,b*.012))}
 cera.push(RX(new THREE.ConeGeometry(.0014,.005,4),.4).translate(0,.0175,.0365),RX(new THREE.ConeGeometry(.0022,.006,4),Math.PI/2+.7).translate(0,.0105,.036));
 const stego=[B(.014,.017,.032,0,.022,0),B(.006,.006,.01,0,.014,.022),B(.005,.005,.026,0,.02,-.028)];for(const a of[-1,1])for(const b of[-1,1])stego.push(B(.005,.016,.005,a*.005,.008,b*.01));for(let i=0;i<6;i++)stego.push(B(.002,.012,.008,(i%2?.002:-.002),.036,-.014+i*.0055));
 const anky=[B(.024,.011,.03,0,.015,0),B(.012,.008,.01,0,.014,.02),B(.004,.004,.024,0,.015,-.026),B(.01,.006,.008,0,.015,-.039)];for(const a of[-1,1])for(const b of[-1,1])anky.push(B(.006,.01,.006,a*.009,.005,b*.01));
 const spino=thero.map(g=>g.clone());spino.push(B(.002,.024,.024,0,.046,0));
 const ptero=[B(.005,.005,.018,0,0,0),B(.08,.001,.016,0,.001,.002),B(.003,.006,.014,0,.004,.014)];
 const plesio=[new THREE.SphereGeometry(.5,8,6).scale(.02,.01,.034),RX(new THREE.BoxGeometry(.004,.004,.04),-.3).translate(0,.008,.034),B(.006,.005,.008,0,.014,.054),B(.03,.001,.006,0,0,.008),B(.026,.001,.006,0,0,-.01)];
 const fish=[new THREE.SphereGeometry(.5,8,6).scale(.012,.012,.05),B(.001,.016,.008,0,0,-.026),B(.001,.01,.008,0,.008,.002)];
 const MK2=(arr,n)=>mk(mergeG(arr),n);
 try{loadModels()}catch(e){}WMESH={quad:wildM,thero:MK2(thero,300),sauro:MK2(sauro,200),cera:MK2(cera,160),stego:MK2(stego,120),ankylo:MK2(anky,160),spino:MK2(spino,60),ptero:MK2(ptero,160),plesio:MK2(plesio,80),fish:MK2(fish,120)};
 const TAU=6.283;GAIT(wildM,.0101,.4,0,-.0145,.3,0,0,TAU*1.4);GAIT(aniM,.0101,.4,0,-.0145,.3,0,0,TAU*1.4);GAIT(WMESH.thero,.022,.45,1,-.015,.12,0,0,TAU*.9);GAIT(WMESH.spino,.022,.45,1,-.015,.12,0,0,TAU*.8);GAIT(WMESH.sauro,.032,.3,0,-.022,.12,0,0,TAU*.45);GAIT(WMESH.cera,.011,.4,0,-.016,.15,0,0,TAU*.8);GAIT(WMESH.stego,.012,.4,0,-.02,.15,0,0,TAU*.75);GAIT(WMESH.ankylo,.009,.4,0,-.02,.12,0,0,TAU*.8);GAIT(WMESH.ptero,0,.45,0,0,0,2,.003,TAU*1.3,.6);GAIT(WMESH.plesio,0,.5,0,0,0,2,.01,TAU*.5,.5);GAIT(WMESH.fish,.012,.2,0,0,0,1,90,TAU*1.1,.6);
 WMESH.swarm=mk(mergeG([B(.003,.002,.003,0,0,0)]),1600);homB=mk(body(),400);homH=mk(new THREE.SphereGeometry(.0046,7,5).translate(0,.0214,0),400);WMESH.hum=homB;WMESH.whale=null;
 droneM=mk(mergeG([B(.014,.002,.002,0,0,0),B(.002,.002,.014,0,0,0),B(.004,.003,.004,0,-.002,0)]),80);for(let i=0;i<80;i++)droneM.instanceColor.setXYZ(i,.92,.93,.95);whaleM=mk(mergeG([new THREE.SphereGeometry(.5,8,6).scale(.025,.016,.1),new THREE.BoxGeometry(.05,.003,.012).translate(0,0,-.055)]),40);
 birdM=mk(mergeG([new THREE.BoxGeometry(.016,.001,.004).rotateZ(.35).translate(-.007,.002,0),new THREE.BoxGeometry(.016,.001,.004).rotateZ(-.35).translate(.007,.002,0)]),120);
 for(let i=0;i<120;i++)birdM.instanceColor.setXYZ(i,.12,.12,.14);WMESH.whale=whaleM;
 const con=mergeG([new THREE.CylinderGeometry(.003,.003,.012,5).translate(0,.006,0),new THREE.ConeGeometry(.02,.06,7).translate(0,.04,0)]),
  br=mergeG([new THREE.CylinderGeometry(.003,.004,.02,5).translate(0,.01,0),new THREE.SphereGeometry(.02,7,5).translate(0,.033,0)]),
  palm=mergeG([new THREE.CylinderGeometry(.0025,.003,.05,5).translate(0,.025,0),new THREE.SphereGeometry(.018,6,4).scale(1.4,.45,1.4).translate(0,.052,0)]),
  sh=mergeG([new THREE.SphereGeometry(.01,6,4).translate(0,.006,0)]);
 const tuft=mergeG([new THREE.ConeGeometry(.0025,.014,3).translate(0,.007,0),new THREE.ConeGeometry(.0022,.011,3).rotateZ(.35).translate(.003,.005,0),new THREE.ConeGeometry(.0022,.012,3).rotateZ(-.35).translate(-.003,.005,.001)]),
  flw=mergeG([new THREE.CylinderGeometry(.0005,.0005,.01,3).translate(0,.005,0),new THREE.SphereGeometry(.0022,5,4).translate(0,.011,0)]),
  dead=mergeG([new THREE.CylinderGeometry(.002,.003,.03,5).translate(0,.015,0),new THREE.CylinderGeometry(.001,.0015,.016,4).rotateZ(.8).translate(.005,.022,0)]);
 treeM={con:mk(con,9000),broad:mk(br,9000),palm:mk(palm,5000),shrub:mk(sh,3000),tuft:mk(tuft,30000),flower:mk(flw,6000),snag:mk(dead,1500)};
 const gt=document.createElement('canvas');gt.width=gt.height=64;const g2=gt.getContext('2d'),gr=g2.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g2.fillStyle=gr;g2.fillRect(0,0,64,64);
 const glow=new THREE.CanvasTexture(gt);
 const pm=(sz)=>new THREE.PointsMaterial({size:sz,map:glow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,sizeAttenuation:true});
 fireP=new THREE.Points(new THREE.BufferGeometry(),pm(.06));fireP.frustumCulled=false;scene.add(fireP);
 lightP=new THREE.Points(new THREE.BufferGeometry(),pm(.035));lightP.frustumCulled=false;scene.add(lightP);
 railL=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x6b4b2e}));railL.frustumCulled=false;scene.add(railL);
 pin=new THREE.Mesh(new THREE.ConeGeometry(.5,1,10).rotateX(Math.PI).translate(0,.5,0),new THREE.MeshBasicMaterial({color:0xff8a3d}));pin.visible=false;scene.add(pin);
}
const _c=new THREE.Color();
function setInst(arr,k,px,py,pz,ux,uy,uz,fx,fy,fz,sc,sy){const sv=sc*(sy||1);const xx=(uy*fz-uz*fy),xy=(uz*fx-ux*fz),xz=(ux*fy-uy*fx);
 arr[k]=xx*sc;arr[k+1]=xy*sc;arr[k+2]=xz*sc;arr[k+3]=0;arr[k+4]=ux*sv;arr[k+5]=uy*sv;arr[k+6]=uz*sv;arr[k+7]=0;arr[k+8]=fx*sc;arr[k+9]=fy*sc;arr[k+10]=fz*sc;arr[k+11]=0;arr[k+12]=px;arr[k+13]=py;arr[k+14]=pz;arr[k+15]=1}
// real giant trees where they actually grow
const GIANTS=[[[41.2,-124,3,.8],'con',2.4,2.6,'Coast redwood · the tallest trees on Earth, up to 116 m',0x3a5a34,.7],[[37.2,-118.8,1.3,.8],'con',2.6,2,'Giant sequoia · the most massive trees on Earth',0x4a6a3a,.5],[[-37.8,146,1.5,2],'broad',1.8,2.4,'Mountain ash · eucalyptus up to 100 m tall',0x5a7a4a,.5],[[-42,146.5,1.2,1.2],'broad',1.8,2.3,'Mountain ash · eucalyptus up to 100 m tall',0x5a7a4a,.5],[[-35.6,173.8,1.2,1.5],'con',2,1.5,'Kauri · ancient giants of New Zealand',0x3f6a3a,.5],[[-5,25,20,22],'broad',1.6,.9,'Baobab · stores water in its huge trunk',0x8a7a4a,.07],[[-20,45,6,3],'broad',1.6,1,'Baobab · stores water in its huge trunk',0x8a7a4a,.15],[[-3,-62,12,16],'broad',1.6,1.9,'Kapok (ceiba) · a rainforest giant towering over the canopy',0x3a7a3a,.06],[[2,113,6,8],'broad',1.5,1.9,'Dipterocarp · Borneo’s 90 m rainforest giants',0x3a7a3a,.08],[[49,-123.5,3,1.5],'con',1.8,2,'Douglas fir and western red cedar · old-growth giants',0x2f5a36,.4],[[37.4,-118.2,.6,.6],'con',.9,.9,'Bristlecone pine · some are over 4,800 years old',0x5a6a4a,.4],[[33.9,35.9,1,.8],'con',1.3,1.2,'Cedar of Lebanon',0x3a5a3a,.3],[[28,-16.6,1,1.5],'broad',1.2,1,'Dragon tree',0x5a7a3a,.2]];
function giantTree(lat,lon,b,r){for(const g of GIANTS){if(ell(lat,lon,g[0])<1&&r()<g[6])return[g[1],g[2]*(.85+r()*.3),g[3],g[4],g[5]]}return null}
function wildPlants(){for(const z of WZ){if(z.type==='ocean'||!z.U){z.trees=[];continue}const r=srng(z.i*71+5),list=[];for(let i=0;i<120;i++){const rr=Math.sqrt(r())*1.4,a=r()*6.28,x=Math.cos(a)*rr,zz=Math.sin(a)*rr,X=z.o[0]+z.e[0]*x+z.so[0]*zz,Y=z.o[1]+z.e[1]*x+z.so[1]*zz,Z=z.o[2]+z.e[2]*x+z.so[2]*zz,p=ll(X,Y,Z),b=biomeAt(p[0],p[1]);const y=gY(z,x,zz);if(y===null||b<=1)continue;
 const dens={3:.6,4:.5,8:.7,7:.18,5:.05,6:.02,2:.02,9:.2}[b]||0;if(r()<dens){const ty=b===3||b===9||b===2?'con':b===8?'palm':'broad';const G=simY>-3e6?giantTree(p[0],p[1],b,r):null;if(G)list.push([G[0],x,y,zz,G[1],b,G[4],G[2],G[3]]);else list.push([ty,x,y,zz,.8+r()*.5,b,undefined,b===7?.55:1,treeName(ty,b,z.lat,z.lon,simY)])}else list.push(['tuft',x,y,zz,.9+r()*.7,b,[0x9a9a50,0x6f9a48,0xb0a050][(r()*3)|0],1,treeName('tuft',b,z.lat,z.lon,simY)])}z.trees=list;z.built=true}treesDirty=true}
const TREE_LIM={con:46,broad:46,palm:40,shrub:26,tuft:13,flower:11,snag:24};let TCP=new THREE.Vector3(1e9,0,0),TCA=0,tcT=0;
function treeCull(dt){tcT-=dt;if(tcT>0)return;tcT=.35;const p=camera.position,d=p.distanceTo(TCP);if(d>Math.max(.6,TCA*.12)||Math.abs(cam.alt-TCA)>TCA*.15)treesDirty=true}
function rebuildTrees(){const CP=camera.position;TCP.copy(CP);TCA=cam.alt;const qf=QG.lvl===2||LITE?.6:QG.lvl===1?.8:1;const cnt={con:0,broad:0,palm:0,shrub:0,tuft:0,flower:0,snag:0},col={con:[0x2f5a36,0x3a6a3c,0x264d30],broad:[0x4a7a3a,0x5a8a40,0x3f6e34,0x6b8a3a],palm:[0x3f7a34,0x4f8a3a],shrub:[0x7a7a4a,0x8a8050]};
 for(const s of [...S,...WZ]){if(!s.built||!s.trees)continue;const sd=Math.hypot(s.o[0]-CP.x,s.o[1]-CP.y,s.o[2]-CP.z);if(sd>60*qf)continue;for(const t of s.trees){const m=treeM[t[0]];const i=cnt[t[0]];if(i>=m.instanceMatrix.count)continue;
  const x=t[1],y=t[2],z=t[3],sc=t[4],px=s.o[0]+s.e[0]*x+s.so[0]*z+s.u[0]*y,py=s.o[1]+s.e[1]*x+s.so[1]*z+s.u[1]*y,pz=s.o[2]+s.e[2]*x+s.so[2]*z+s.u[2]*y;
  if(Math.hypot(px-CP.x,py-CP.y,pz-CP.z)>TREE_LIM[t[0]]*qf*Math.max(1,sc*(t[7]||1)*.8))continue;cnt[t[0]]++;
  const ra=(i*2.39996)%6.283,fx=s.so[0]*Math.cos(ra)+s.e[0]*Math.sin(ra),fy=s.so[1]*Math.cos(ra)+s.e[1]*Math.sin(ra),fz=s.so[2]*Math.cos(ra)+s.e[2]*Math.sin(ra);setInst(m.instanceMatrix.array,i*16,px,py,pz,s.u[0],s.u[1],s.u[2],fx,fy,fz,sc,t[7]);
  if(t[6]!==undefined)_c.setHex(t[6]);else{_c.setHex(col[t[0]][(i*7)%col[t[0]].length]);if(t[5]===7)_c.setHex(0x7a8a3a);if(t[0]==='broad'&&t[5]===4&&simY>-3e6){const lat=s.lat,mo=new Date().getUTCMonth(),aut=lat>0?(mo===9||mo===10):(mo===3||mo===4),bare=lat>0?(mo===11||mo<=2):(mo>=5&&mo<=7);if(aut)_c.setHex([0xd2691e,0xc0392b,0xe0a526,0xb8860b][i%4]);else if(bare)_c.setHex(0x6b5a4a)}}m.instanceColor.setXYZ(i,_c.r,_c.g,_c.b)}}
 for(const k in treeM){treeM[k].count=cnt[k]||0;treeM[k].instanceMatrix.needsUpdate=true;treeM[k].instanceColor.needsUpdate=true}treesDirty=false}
let fireSite=[],lightSite=[];
function rebuildPoints(){const fp=[],ls=[];fireSite=[];lightSite=[];
 for(const z of WZ)if(z.fire&&z.U&&!z.water){const y=gY(z,0,0)||0;fp.push(z.o[0]+z.u[0]*(y+.01),z.o[1]+z.u[1]*(y+.01),z.o[2]+z.u[2]*(y+.01));fireSite.push(z)}
 for(const s of S){if(!s.built)continue;const w=(x,y,z,arr,ss)=>{arr.push(s.o[0]+s.e[0]*x+s.so[0]*z+s.u[0]*y,s.o[1]+s.e[1]*x+s.so[1]*z+s.u[1]*y,s.o[2]+s.e[2]*x+s.so[2]*z+s.u[2]*y);ss.push(s)};
  if(s.tier>=0)for(const f of s.fires)w(f[0],f[1]+.004,f[2],fp,fireSite);if(s.tier>=5)for(const l of s.lights)w(l[0],l[1],l[2],ls,lightSite)}
 fireP.geometry.dispose();fireP.geometry=new THREE.BufferGeometry();fireP.geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(fp),3));fireP.geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(fp.length),3));
 lightP.geometry.dispose();lightP.geometry=new THREE.BufferGeometry();lightP.geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(ls),3));lightP.geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(ls.length),3));}
function nightCols(){const f=fireP.geometry.attributes.color,l=lightP.geometry.attributes.color;if(!f||!l)return;
 for(let i=0;i<fireSite.length;i++){const s=fireSite[i],n=clamp(.15-s.day*3,.25,1)*(.85+rnd()*.3);f.setXYZ(i,1*n,.55*n,.18*n)}if(fireSite.length){f.updateRange.count=fireSite.length*3;f.needsUpdate=true}
 for(let i=0;i<lightSite.length;i++){const s=lightSite[i],n=clamp(-s.day*5+.1,0,1)*(s.tier>=6?1:.6);l.setXYZ(i,1*n,.82*n,.5*n)}if(lightSite.length){l.updateRange.count=lightSite.length*3;l.needsUpdate=true}}
function rebuildRails(){RAILP=[];const pts=[],c6=S.filter(s=>s.built&&s.tier>=6);
 for(let i=0;i<c6.length;i++)for(let j=i+1;j<c6.length;j++){const a=c6[i],b=c6[j],ang=a.U.angleTo(b.U)/DEG;if(ang>26)continue;let ok=true;const seg=24,P=[];
  for(let k=0;k<=seg;k++){const v=a.U.clone().lerp(b.U,k/seg).normalize(),h=hDir(v.x,v.y,v.z);if(h<0){ok=false;break}P.push(v.multiplyScalar(R+h+.004))}
  if(!ok)continue;RAILP.push({p:P,hs:(['jp'].includes(a.c)&&simY>1964)||(a.c==='cn'&&simY>2008)||(['eu','eun'].includes(a.c)&&simY>1981)});for(let k=0;k<seg;k++)pts.push(P[k].x,P[k].y,P[k].z,P[k+1].x,P[k+1].y,P[k+1].z)}
 TRAINS=RAILP.map(r=>({p:r.p,hs:r.hs,t:rnd(),d:1,dur:(r.hs?40:90)*(r.p[0].distanceTo(r.p[r.p.length-1])+1),name:r.hs?'High-speed train':simY<1950?'Steam train':simY>2030?'Electric train':'Diesel train'}));
 railL.geometry.dispose();railL.geometry=new THREE.BufferGeometry();railL.geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pts),3));railL.material.color.setHex(simY>1950?0x5a5e63:0x6b4b2e)}

