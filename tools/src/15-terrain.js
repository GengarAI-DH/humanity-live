// ================== terrain ==================
const mb=atob(window.MASK64),LAND=new Uint8Array(GW*GH);
for(let i=0;i<GW*GH;i++)LAND[i]=(mb.charCodeAt(i>>3)>>(7-(i&7)))&1;
const MT=[[[[35,72],[30,81],[27.8,88],[28,97]],3,2.2],[[[34,80],[33,96]],5,1.4],[[[10,-73],[0,-78],[-10,-76.5],[-18,-69.5],[-30,-69.8],[-40,-71.5],[-52,-73]],2.2,1.6],[[[62,-140],[55,-125],[48,-114],[40,-106],[33,-106]],4,1],[[[49,-121],[42,-122],[37,-119],[35,-118]],1.5,.8],[[[47,-68],[41,-77],[35,-83]],2,.4],[[[44,7],[46.5,10],[47,14]],1.2,1],[[[42.8,-1.5],[42.6,2.5]],.8,.6],[[[43.5,40],[41.5,48]],1,1],[[[37,44],[32,49],[28,55]],2,.8],[[[36,68],[36.5,72]],2,1.4],[[[42,72],[43,86]],2,1.2],[[[50,86],[48,95]],2,.8],[[[67,64],[58,59],[51,58]],1.5,.4],[[[13,38],[7,39]],3,1],[[[4,36],[-3,36.5],[-9,34]],2,.8],[[[30.5,-9],[33,-4],[36,4],[36.5,9]],1.5,.7],[[[-27,29.5],[-31,28]],1.5,.6],[[[-15,145],[-25,151],[-37,148]],2,.35],[[[69,20],[62,9],[59,7]],2,.6],[[[41,141],[35,137],[33,131]],1,.5],[[[30,-108],[22,-104],[18,-99],[16.5,-95]],2,.8]];
const DESERT=[[23,12,9,25,1],[23,47,8,10,1],[27,71,4,5,.8],[42,103,5,12,.8],[39,83,3,8,1],[-23,19,7,7,.8],[-25,133,8,15,.9],[34,-113,6,6,.8],[-23,-69,8,2.5,1],[-45,-68,5,5,.5],[32,57,6,6,.8],[42,62,7,8,.7]];
const SAH=[[23,12,9,25],[23,47,8,10]];
const WET=[[-4,-62,13,16],[0,22,9,11],[3,110,12,15],[-6,145,6,8],[25,90,5,8]];
const SHELF=[[64,-170,7,14],[2,108,9,9],[-10,138,6,9],[54.5,3,3.5,5],[27,51,4,5],[36,123,5,5],[-40,146,2.5,3]];
const ICE=[[60,-88,18,38],[57,-126,9,10],[63,18,9,22],[56,-4,4,4],[46.5,10,1.5,4],[-47,-73,6,3],[68,95,4,10]];
const RIVERS=[[[31.5,31],[30,31.2],[27,31],[25,32.8],[22,31.5],[19.5,33],[15.6,32.5],[12,32.7],[9,30],[4,31.6],[2,31.5],[-1,33]],[[37.5,38.5],[36,38.2],[34.5,40.9],[33,43.5],[31,46],[30.5,47.6]],[[37.5,42.5],[35.5,43.3],[33.3,44.4],[31,47.4]],[[35,75.5],[33.5,72.2],[31,71],[28,69],[25,68.2],[24,67.5]],[[30,78.5],[27,80.5],[25.3,83],[25.5,87],[23,89],[22,90.5]],[[35.5,96],[36,103.8],[40.5,107],[39.5,111],[35,110.5],[34.7,113.6],[35,116],[37.7,118.9]],[[33,92],[28,98.5],[26.5,101.5],[29,106.5],[30.7,111.3],[30.5,114.3],[31.8,117.5],[31.4,121.6]],[[47.2,-95.2],[44.9,-93.2],[41.5,-90.6],[38.6,-90.2],[35,-90],[32.3,-91],[30,-90.5],[29.2,-89.3]],[[45.9,-111.5],[47.5,-104],[46.8,-100.8],[41.3,-96],[39,-94.6],[38.8,-90.1]],[[-10.5,-75],[-4.5,-73.2],[-3.2,-68],[-3.1,-60],[-2.2,-56],[-1.9,-52],[-0.2,-50]],[[-11.5,27.5],[-5,26.5],[0.5,25.2],[2,22],[0,17.8],[-4.3,15.3],[-6,12.3]],[[48,8.5],[48.3,13],[48.2,16.4],[47.5,19],[44.8,20.5],[44,22.5],[43.7,25],[45.2,29.7]],[[57,33],[57.6,39.9],[56.3,44],[55.8,49.1],[53.2,50.1],[48.7,44.5],[46.3,48]],[[33,94],[27,99],[20.2,100.4],[17.9,102.6],[15,105.8],[11.6,104.9],[10,106.5]],[[9.2,-10.5],[12.6,-8],[14.5,-4.2],[16.8,-3],[16.3,0],[13.5,2.1],[9,5.5],[5.3,6.3]],[[-20,30],[-17.9,25.9],[-15.6,30.4],[-16.5,33.6],[-18.5,36.2]],[[56,-2],[52,4]]];
const TOPO8=Uint8Array.from(atob('__TOPO__'),c=>c.charCodeAt(0)),TOPOM=new Float32Array(TOPO8.length);for(let k=0;k<TOPO8.length;k++){const v=TOPO8[k];TOPOM[k]=v>=128?Math.pow((v-128)/127,2)*8850:-Math.pow((127-v)/127,2)*11000}
const N=GW*GH,BIX=new Uint8Array(N),E0=new Float32Array(N),DIST=new Uint8Array(N),MO=new Float32Array(N),TE=new Float32Array(N),SHS=new Float32Array(N),INSH=new Uint8Array(N),HG=new Float32Array(N),BI=new Uint8Array(N);
const latOf=j=>90-(j+.5)/2,lonOf=i=>-180+(i+.5)/2;
let ICEG=null,ICEK2=-1;function iceAt(lat,lon){const ic=CLIM.ice||0;if(ic<=0&&ICEK2<0)return false;if(ICEG){const j=clamp(Math.floor((90-lat)*2),0,GH-1),i=((Math.floor((lon+180)*2)%GW)+GW)%GW,q=ICEG[j*GW+i];if(q>1&&q-1<=ICEK2)return true;return ic>0&&ell(lat,lon,ICE[4])<Math.pow(ic,.6)}const e=Math.pow(ic,.6);return ic>0&&ICE.some(b=>ell(lat,lon,b)<e)}
function ell(lat,lon,b){let dl=lon-b[1];if(dl>180)dl-=360;if(dl<-180)dl+=360;const a=(lat-b[0])/b[2],c=dl/b[3];return Math.sqrt(a*a+c*c)}
function segD(lat,lon,a,b){const cl=Math.cos(lat*DEG),ax=a[1]*cl,ay=a[0],bx=b[1]*cl,by=b[0],px=lon*cl,py=lat;const dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(px-ax-dx*t,py-ay-dy*t)}
function initTerrain(){
 // distance from coast (ocean cells), BFS
 const q=new Int32Array(N);let h=0,t=0;
 for(let k=0;k<N;k++){if(LAND[k]){DIST[k]=0;q[t++]=k}else DIST[k]=255}
 while(h<t){const k=q[h++],i=k%GW,j=(k/GW)|0,d=DIST[k];if(d>=40)continue;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const jj=j+b;if(jj<0||jj>=GH)continue;const ii=(i+a+GW)%GW,kk=jj*GW+ii;if(DIST[kk]>d+1){DIST[kk]=d+1;q[t++]=kk}}}
 for(let j=0;j<GH;j++){const lat=latOf(j),al=Math.abs(lat);for(let i=0;i<GW;i++){const k=j*GW+i,lon=lonOf(i);
  let inS=0;for(const s of SHELF)if(ell(lat,lon,s)<1){inS=1;break}INSH[k]=inS;
  let m=al<12?.75:al<20?.75-(al-12)/8*.4:al<32?.3:al<45?.3+(al-32)/13*.3:al<65?.6:.45;
  m+=(fbm(lon/14+40,lat/14+40)-.5)*.6;
  let sh=0;for(const d of DESERT){const e=ell(lat,lon,d);if(e<1.25){const f=Math.pow(clamp(1.25-e,0,1),.7)*d[4];m-=.6*f}}
  for(const s of SAH){const e=ell(lat,lon,s);if(e<1.2)sh=Math.max(sh,Math.pow(1.2-e,.6))}
  for(const w of WET){const e=ell(lat,lon,w);if(e<1)m+=.3*(1-e)}
  MO[k]=m;SHS[k]=sh;TE[k]=1-Math.pow(al/68,1.35);
  const km=TOPOM[k]/1000;
  if(LAND[k]){const e=.1+Math.max(0,km)*.27+(fbm(lon*1.3,lat*1.3)-.5)*(.04+Math.max(0,km)*.05);E0[k]=Math.max(.02,e)}else E0[k]=Math.min(-.02,km>0?-.05:km*2.2)}}}
// ---- plate tectonics (rough reconstruction, Africa-centred) ----
const PLP={af:[[2,20],[-8,10],0],sa:[[-15,-58],[-24,-24],-40],na:[[48,-100],[38,-50],-22],eu:[[52,80],[48,62],-10],in:[[20,79],[-32,50],60],md:[[-19,47],[-15,33],20],an:[[-82,60],[-62,48],-10],au:[[-25,134],[-50,96],25]};
const PLW={na:[195,5],sa:[135,5],af:[200,5],eu:[200,5],in:[130,40],md:[160,90],an:[150,30],au:[100,5]};
const PORDER=['af','na','sa','eu','in','md','an','au'],PIDX={};PORDER.forEach((k,i)=>PIDX[k]=i);
function plateOf(la,lo){let p='eu';if(lo<-30&&la>7)p='na';if(la>59&&lo>-75&&lo<-10)p='na';if(lo<-30&&la<=8&&lo>-82)p='sa';if(lo<-82&&la<=8&&la>-60)p='sa';if(lo>-20&&lo<52&&la<37&&la>-40)p='af';if(la>12&&la<32&&lo>36&&lo<60)p='af';if(la>-26&&la<-11&&lo>42&&lo<51)p='md';if(la>5&&la<28&&lo>66&&lo<92)p='in';if(la>-48&&la<-9&&lo>112)p='au';if(la>-11&&la<0&&lo>130&&lo<151)p='au';if(la<-60)p='an';return p}
const PLC=new Uint8Array(GW*GH);
const vg=(la,lo)=>new THREE.Vector3(Math.cos(la*DEG)*Math.cos(lo*DEG),Math.cos(la*DEG)*Math.sin(lo*DEG),Math.sin(la*DEG));
const PQ={},QID=new THREE.Quaternion();
function initPlates(){for(let j=0;j<GH;j++)for(let i=0;i<GW;i++)PLC[j*GW+i]=PIDX[plateOf(latOf(j),lonOf(i))];
 for(const k in PLP){const p=PLP[k],a=vg(p[0][0],p[0][1]),b=vg(p[1][0],p[1][1]);const qm=new THREE.Quaternion().setFromUnitVectors(a,b),qs=new THREE.Quaternion().setFromAxisAngle(b,p[2]*DEG);PQ[k]=qs.multiply(qm)}}
function plateFrac(k,my){const w=PLW[k];let f=clamp((w[0]-my)/(w[0]-w[1]),0,1);return f*f*(3-2*f)}
// Plate positions at 70 Ma fitted to the Scotese & Wright (2018) PALEOMAP PaleoDEM for 70 Ma (Zenodo doi:10.5281/zenodo.5460860, CC BY 4.0):
// each plate's modern land rotated to best cover the PaleoDEM's continental area (tools/paleofit.py). Greater India sits at 10-35 S, Africa
// and South America 10-14 degrees from the old guess, Australia 20. Before 70 Ma the old path is bent onto these; after, they ease to today.
const Q70D={af:[-0.1014,0.0852,-0.0670,0.9889],eu:[-0.0178,0.0723,-0.0256,0.9969],na:[-0.0524,0.1052,0.1240,0.9853],sa:[0.0070,0.0350,0.1384,0.9897],an:[-0.0225,0.0083,-0.0606,0.9979],au:[-0.2042,-0.1064,-0.0877,0.9692],md:[-0.0822,0.0929,-0.0742,0.9895],in:[-0.4417,-0.1463,-0.1193,0.8771]},Q70={},Q70C={};
function plateQ0(k,my){return PQ[k].clone().slerp(QID,plateFrac(k,my))}
function plateQ(k,Y){const my=-Y/1e6;if(!Q70[k]){const d=Q70D[k];if(!d)return plateQ0(k,my);Q70[k]=new THREE.Quaternion(d[0],d[1],d[2],d[3]).normalize();Q70C[k]=Q70[k].clone().multiply(plateQ0(k,70).invert())}
 if(my<=70){const e=PLW[k][1]<70?PLW[k][1]:5;let g=clamp((70-my)/(70-e),0,1);g=g*g*(3-2*g);return Q70[k].clone().slerp(QID,g)}
 return Q70C[k].clone().slerp(QID,clamp((my-70)/40,0,1)).multiply(plateQ0(k,my))}
// PaleoDEM land and sea (public/paleodem.json, 65/70/75 Ma, int8 = metres/5), loaded lazily in deep time; null until then.
let PDEM=null,PDEMP=false;async function loadPaleoDEM(){if(PDEM||PDEMP)return;PDEMP=true;try{const r=await fetch('paleodem.json');if(!r.ok)return;const d=await r.json(),m={};for(const a in d.m){const b=atob(d.m[a]),u=new Int8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i)<<24>>24;m[a]=u}PDEM={w:d.w,h:d.h,m};if(simY<-5e6){CLIM.sig=null;applyClimate(simY,true)}}catch(e){}}
function pdemAt(la,lo,my){if(!PDEM||my<60||my>80)return null;const a=my<=70?(my<65?[65,65,0]:[65,70,(my-65)/5]):[70,75,Math.min(1,(my-70)/5)],W=PDEM.w;
 const fi=clamp(la+90,0,179.999),fj=clamp(lo+180,0,359.999),i=fi|0,j=fj|0,ti=fi-i,tj=fj-j,f=M=>(M[i*W+j]*(1-ti)*(1-tj)+M[(i+1)*W+j]*ti*(1-tj)+M[i*W+j+1]*(1-ti)*tj+M[(i+1)*W+j+1]*ti*tj)*5;
 const A=PDEM.m[a[0]],B=PDEM.m[a[1]];return a[2]?f(A)*(1-a[2])+f(B)*a[2]:f(A)}
function paleoPos(lat,lon,Y){if(Y>=-5e6)return[lat,lon];const k=plateOf(lat,lon),v=vg(lat,lon).applyQuaternion(plateQ(k,Y));return[Math.asin(clamp(v.z,-1,1))/DEG,Math.atan2(v.y,v.x)/DEG]}
const SRC=new Int32Array(GW*GH),LDIST=new Uint8Array(GW*GH);
function bfs(isSrc,out){const q=new Int32Array(N);let h=0,t=0;for(let k=0;k<N;k++){if(isSrc(k)){out[k]=0;q[t++]=k}else out[k]=255}
 while(h<t){const k=q[h++],i=k%GW,j=(k/GW)|0,d=out[k];if(d>=40)continue;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const jj=j+b;if(jj<0||jj>=GH)continue;const kk=jj*GW+(i+a+GW)%GW;if(out[kk]>d+1){out[kk]=d+1;q[t++]=kk}}}}
// Young water: seas and lakes that did not exist before the ice ages or the Red Sea rift, drawn as land in deep time.
// Hudson Bay, James Bay, Foxe Basin and the Great Lakes were scoured and pressed down by the Pleistocene ice sheets; the Baltic,
// Bothnia, Ladoga and Onega basins likewise (Baltic amber forests stood there in the Eocene). The Red Sea and Gulf of Aden opened
// from about 25-30 Ma. Late Cretaceous maps (Scotese PALEOMAP 70 Ma; Blakey, Colorado Plateau Geosystems) show these as land.
// The Great Lakes are land cells in the mask, with their lake-bed heights, so they are marked too (bed below the 185 m lake level).
// value = age in Ma before which the cell counts as land; e = elevation factor for its colour and height.
let YW=null;const YWE=[0,.22,.2,.19,.17];
function youngWater(){YW=new Uint8Array(N);const YB=[[51,69.5,-96,-76,-500,1],[41,49.5,-93,-75.5,-9e3,2],[53.5,66,10.5,30.5,-300,3],[59.5,63,29,36.5,-9e3,3],[12.5,29.9,32,44,-9e3,4],[10.5,15,42.5,51.5,-9e3,4]];
 for(let k=0;k<N;k++){const la=latOf((k/GW)|0),lo=lonOf(k%GW);if(LAND[k]){if(la>=41&&la<=49.5&&lo>=-93&&lo<=-75.5&&TOPOM[k]<185)YW[k]=2;continue}for(const b of YB)if(la>=b[0]&&la<=b[1]&&lo>=b[2]&&lo<=b[3]&&TOPOM[k]>b[4]){YW[k]=b[5];break}}}
// Western Interior Seaway shores in present-day coordinates, every 5 degrees of latitude from 30N to 60N (west, east longitude),
// read from Late Cretaceous (Campanian-Maastrichtian) maps: Blakey/Colorado Plateau Geosystems 75 and 70 Ma, Scotese PALEOMAP 70 Ma,
// Slattery et al. 2015 (Wyoming Geol. Assoc. Guidebook). About 1,000 km wide; plus the Mississippi Embayment to 37N.
const WIS=[[-103,-93],[-105.5,-96],[-107.5,-97],[-108.5,-97],[-109.5,-97.5],[-111.5,-99],[-115,-103]];
function wisSea(la,lo){if(la<37&&la>30&&lo>-92&&lo<-88)return true;if(la<30||la>60)return false;const f=(la-30)/5,i=Math.min(5,Math.floor(f)),t=f-i,a=WIS[i],b=WIS[i+1];return lo>lerp(a[0],b[0],t)+(fbm(la/2.5,1.7)-.5)*5&&lo<lerp(a[1],b[1],t)+(fbm(la/2.5,6.3)-.5)*5}
function ywAge(t){return t===4?25:2.6}
function paleoMap(Y){const my=-Y/1e6,QI={};if(!YW)youngWater();const eS=kk=>YW[kk]?YWE[YW[kk]]:E0[kk];for(const k of PORDER)QI[k]=plateQ(k,Y).invert();
 const v=new THREE.Vector3(),cret=my<145&&my>66,seaway=my<100&&my>70;
 for(let j=0;j<GH;j++){const la=latOf(j),cl=Math.cos(la*DEG),sl=Math.sin(la*DEG);for(let i=0;i<GW;i++){const lo=lonOf(i)*DEG,k=j*GW+i;let src=-1;
  for(const pk of PORDER){v.set(cl*Math.cos(lo),cl*Math.sin(lo),sl).applyQuaternion(QI[pk]);const la0=Math.asin(clamp(v.z,-1,1))/DEG,lo0=Math.atan2(v.y,v.x)/DEG,kk=clamp(Math.floor((90-la0)*2),0,GH-1)*GW+((Math.floor((lo0+180)*2))%GW+GW)%GW;if((LAND[kk]||(YW[kk]&&my>ywAge(YW[kk])))&&PLC[kk]===PIDX[pk]){src=kk;break}}
  const pz=src>=0?pdemAt(la,lonOf(i),my):null;if(pz!==null){if(pz<-15||(seaway&&wisSea(latOf((src/GW)|0),lonOf(src%GW))))src=-1}else if(src>=0&&cret){const sla=latOf((src/GW)|0),slo=lonOf(src%GW);if(eS(src)<.15)src=-1;else if(seaway&&(wisSea(sla,slo)||ell(sla,slo,[15,3,8,7])<1||ell(sla,slo,[50,12,6,14])<1))src=-1}
  SRC[k]=src}}
 bfs(k=>SRC[k]>=0,DIST);bfs(k=>SRC[k]<0,LDIST);
 for(let k=0;k<N;k++){const j=(k/GW)|0,lat=latOf(j),al=Math.abs(lat),src=SRC[k];
  if(src>=0){const E=.1+(eS(src)-.12)*(my>45?.35:1),sla=latOf((src/GW)|0),slo=lonOf(src%GW);EC[k]=Math.max(.03,E);
   const t=1-Math.pow(al/80,1.6);let m=.92-LDIST[k]*.045+(fbm(slo/12+3,sla/12+5)-.5)*.5-(al>14&&al<32?.18:0);
   const iceA=(PLC[src]===PIDX.an&&my<34)||(ell(sla,slo,[73,-41,10,22])<1&&my<2.7);let c,b;
   if(iceA||t<.04){c=[236,240,245];b=1}else if(m<.22){c=my>200?[186,112,72]:[206,168,118];b=6}else if(m<.42){c=my>23?[150,138,82]:[176,160,98];b=5}else if(t<.3){c=[48,78,56];b=3}else if(t>.75&&m>.7){c=[34,88,40];b=8}else{c=my>125?[52,86,46]:[62,104,50];b=my>125?3:4}
   const nz=.88+.24*fbm(k%GW/9,j/9);LC[k*3]=c[0]*nz;LC[k*3+1]=c[1]*nz;LC[k*3+2]=c[2]*nz;BI[k]=b;HG[k]=.035+Math.max(E,0)*.32+(iceA?.1:0)}
  else{EC[k]=-DIST[k]*.25;BI[k]=0;HG[k]=-.025}
  SDP[k]=SRC[k]>=0?0:Math.min(DIST[k]*350,4500)*KMU/1000;
  const dd=clamp(DIST[k]/4,0,1);OC[k*3]=lerp(66,14,dd);OC[k*3+1]=lerp(150,48,dd);OC[k*3+2]=lerp(170,92,dd)}}
// climate
const SEA=[[-70000,.06],[-60000,.07],[-30000,.07],[-26000,.1],[-19000,.1],[-14000,.075],[-11000,.042],[-8000,.012],[-6000,0]];
const ICEF=[[-70000,.45],[-60000,.6],[-40000,.6],[-29000,.85],[-26000,1],[-19000,1],[-15000,.7],[-12000,.45],[-10000,.22],[-8000,.06],[-6500,0]];
function ICEY(f){if(f>=1)return -19000;for(let i=ICEF.length-1;i>0;i--){const a=ICEF[i-1],b=ICEF[i];if(a[0]>=-19000&&f<=a[1]&&f>=b[1])return lerp(a[0],b[0],(a[1]-f)/Math.max(1e-6,a[1]-b[1]))}return -6500}
const GRN=[[-11000,0],[-9000,1],[-4500,1],[-3000,0]];
let CLIM={sea:-1,ice:-1,g:-1},climT=0;
const RELK=34;const tex=document.createElement('canvas'),TW=2048,TH=1024;const SNL=new Float32Array(TH),RELR=new Float32Array(TW*TH),RELF=new Float32Array(TW*TH),RELT=new Float32Array(TW*TH);tex.width=TW;tex.height=TH;const tctx=tex.getContext('2d');
const spc=document.createElement('canvas');spc.width=1024;spc.height=512;const sctx=spc.getContext('2d');
const LC=new Float32Array(N*3),OC=new Float32Array(N*3);
function biomeCol(k,lat,E,ice,g,land){
 const al=Math.abs(lat);let m=MO[k]+SHS[k]*g*.75,t=TE[k]-Math.max(E,0)*.3;
 let iceCover=0;if(ICEG){const q=ICEG[k];if(q>1&&q-1<=ICEK2)iceCover=1;else if(ice>0&&ell(lat,(k%GW)/2-180+.25,ICE[4])<Math.pow(ice,.6))iceCover=1}else for(const b of ICE){const e=ell(lat,(k%GW)/2-180+.25,b);if(e<Math.pow(ice,.6))iceCover=1}
 const nz=.88+.24*fbm(k%GW/9,(k/GW|0)/9);let b,c;
 if(iceCover||lat<-62||(E>1.15&&ell(lat,(k%GW)/2-180,[73,-41,10,22])<1)||t<.06){b=1;c=[236,240,245]}
 else if(E>2.6){b=9;c=[235,236,238]}else if(E>1.05){b=9;c=[120,110,98]}
 else if(t<.2){b=2;c=[128,124,100]}else if(m<.2){b=6;c=[214,184,130]}
 else if(t<.42){if(m>.45){b=3;c=[42,72,48]}else{b=5;c=[158,150,98]}}
 else if(t>.72){if(m>.62){b=8;c=[30,82,38]}else if(m>.36){b=7;c=[160,148,78]}else{b=5;c=[190,168,110]}}
 else{if(m>.5){b=4;c=[66,106,54]}else{b=5;c=[170,160,100]}}
 let x=b;if(land&&b!==1&&b!==9){const lon=(k%GW)/2-180+.25;
  if(b===6&&t<.45){x=16;c=[168,152,122]}
  else if(MEDR.some(r=>ell(lat,lon,r)<1)&&b!==8&&b!==6){x=10;c=[148,138,82]}
  else if(WETL.some(r=>ell(lat,lon,r)<1)){x=15;c=[72,112,78]}
  else if(al<26&&coastal(k)&&(b===8||b===7||b===4)){x=11;c=[26,70,48]}
  else if(E>.75&&t>.25&&(b===5||b===7||b===2||b===6)){x=14;c=[146,132,94]}
  else if(b===7&&m>.5){x=12;c=[108,118,56]}
  else if((b===4&&(m>.7||E>.55))){x=13;c=[34,64,44]}}
 BIX[k]=land?x:0;
 if(E>.7&&b!==1&&b!==9){const f=clamp((E-.7)/.4,0,.6);c=[lerp(c[0],120,f),lerp(c[1],110,f),lerp(c[2],98,f)]}
 BI[k]=land?b:0;return[c[0]*nz,c[1]*nz,c[2]*nz]}
const MEDR=[[39,10,6,16],[36,-120.5,4.5,3],[-34,-71,3.5,1.8],[-33.8,19.5,1.8,3],[-32.5,116.5,3,3.5],[-35,138.5,2,3]],WETL=[[-17.5,-57,4,3],[7.5,30.5,2.5,2],[-19.3,22.9,1.2,1.4],[25.8,-80.8,.9,.8],[31,47,1,1.2],[7,-68,2,4],[-3.5,-73.5,1.5,2],[61,73,4,8],[50,-95,3,6]];
function coastal(k){const i=k%GW,j=(k/GW)|0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const jj=j+b;if(jj<0||jj>=GH)continue;if(!LAND[jj*GW+(i+a+GW)%GW])return true}return false}
let SEAS=0,SEASM=-1;function season(){const d=new Date(),doy=(d-Date.UTC(d.getUTCFullYear(),0,0))/864e5;SEAS=Math.cos(2*Math.PI*(doy-15)/365);return d.getUTCMonth()}
const EC=new Float32Array(N),REEFS=[[-18,147,8,4],[18,-78,5,12],[22,37.5,8,2.5],[-2,125,9,13],[4,73.3,4,1.5],[-17,-150,4,8]];
function applyClimate(Y,force){
 const paleo=Y<-3e6,warm=clamp((Y-2000)/100,0,1);let sea=0,ice=0,g=0;
 if(paleo){const sig='p'+Math.floor(Y/4e5);if(!force&&CLIM.sig===sig)return false;if(!PDEM&&typeof loadPaleoDEM==='function'&&simY<-5e6)setTimeout(loadPaleoDEM,0);ICEK2=-1;CLIM={sig,sea:0,ice:0,g:0};paleoMap(Y)}
 else{if(Y<-70000){const ph=Math.sin(2*Math.PI*(Y+20000)/100000);ice=clamp(.45+.5*ph,0,1)*clamp((Y+3e6)/4e5,0,1);sea=ice*.1}else{sea=pw(SEA,Y);ice=pw(ICEF,Y);g=pw(GRN,Y)}
  const ls=lakeSig(Y);if(!force&&!CLIM.sig&&Math.abs(sea-CLIM.sea)<.004&&Math.abs(ice-CLIM.ice)<.04&&Math.abs(g-CLIM.g)<.08&&Math.abs(warm-(CLIM.w||0))<.05&&ls===CLIM.ls)return false;
  ICEK2=Y>-23050?((1950-Y)/500):ice>.001?(1950-ICEY(ice))/500:-1;
  CLIM={sea,ice,g,w:warm,ls};EC.set(E0);bfs(k=>!!LAND[k],DIST);
  for(let k=0;k<N;k++){const j=(k/GW)|0,lat=latOf(j),E=E0[k],land=E>-sea;
   const c=biomeCol(k,lat,Math.max(E,0),ice,g,land);LC[k*3]=c[0];LC[k*3+1]=c[1];LC[k*3+2]=c[2];
   const dd=clamp(DIST[k]/4,0,1),dm=land?0:Math.max(0,-TOPOM[k]-sea*455);SDP[k]=land?0:Math.min(dm,11000)*KMU/1000;let o=dm>0?oceanCol(dm):[lerp(70,14,dd),lerp(146,44,dd),lerp(168,86,dd)];
   if(lat>76-ice*9+warm*9||lat<-(72-ice*6+warm*2))o=[222,230,236];
   else if(ICEG&&!land&&ICEK2>=1){const j0=(k/GW)|0,i0=k%GW;let n=0;for(let dj=-1;dj<=1;dj++){const jj=clamp(j0+dj,0,GH-1);for(let di=-1;di<=1;di++){const q=ICEG[jj*GW+(i0+di+GW)%GW];if(q>1&&q-1<=ICEK2)n++}}if(n){const f=clamp(n/7,0,1);o=[lerp(o[0],222,f),lerp(o[1],230,f),lerp(o[2],236,f)]}}
   if(!land&&DIST[k]<=3&&REEFS.some(r=>ell(lat,lonOf(k%GW),r)<1)){const bl=clamp((Y-2030)/50,0,.7);o=[lerp(60,215,bl),lerp(196,226,bl),lerp(190,214,bl)]}
   OC[k*3]=o[0];OC[k*3+1]=o[1];OC[k*3+2]=o[2];
   let ih=0;if(BI[k]===1&&lat>-60&&land)ih=.12*ice;
   if(land&&BI[k]!==6&&BI[k]!==1&&BI[k]!==0){const up=clamp((E-.35)/.6,0,1)*14,sl=lat>0?60-18*Math.max(0,SEAS)-up:-(60-18*Math.max(0,-SEAS))+up,f=clamp((lat>0?lat-sl:sl-lat)/4+.25,0,1)*.8;if(f>0){LC[k*3]=lerp(LC[k*3],236,f);LC[k*3+1]=lerp(LC[k*3+1],240,f);LC[k*3+2]=lerp(LC[k*3+2],245,f)}}
   HG[k]=land?.035+Math.max(E,0)*.32+ih:-.025}}
 // soften the 0.5° colour grid so biomes, snow and mountains blend instead of showing as blocks
 {const T2=new Float32Array(LC);for(let j=1;j<GH-1;j++)for(let i=0;i<GW;i++){const k=j*GW+i;if(!(paleo?SRC[k]>=0:EC[k]>-CLIM.sea))continue;let r=0,g=0,b=0,w=0;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const kk=(j+dj)*GW+(i+di+GW)%GW;if(!(paleo?SRC[kk]>=0:EC[kk]>-CLIM.sea))continue;const ww=dj||di?(dj&&di?.5:1):2;r+=LC[kk*3]*ww;g+=LC[kk*3+1]*ww;b+=LC[kk*3+2]*ww;w+=ww}
  if(w){T2[k*3]=r/w;T2[k*3+1]=g/w;T2[k*3+2]=b/w}}LC.set(T2)}
 const img=tctx.createImageData(TW,TH),D=img.data,simg=sctx.createImageData(1024,512),SD=simg.data;
 const sx=GW/TW,sy=GH/TH;
 // deep time: the reconstructed coastlines are coarse (half-degree cells), so soften the elevation field and add natural, fractal
 // coastline detail at several scales instead of square-edged islands (today's coastlines keep the measured elevation)
 let ES=EC;if(paleo){ES=new Float32Array(EC.length);for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){let t=0,w=0;for(let dj=-1;dj<=1;dj++){const jj=clamp(j+dj,0,GH-1);for(let di=-1;di<=1;di++){const ww=(dj?1:2)*(di?1:2);t+=EC[jj*GW+(i+di+GW)%GW]*ww;w+=ww}}ES[j*GW+i]=EC[j*GW+i]*.45+t/w*.55}}
 for(let y=0;y<TH;y++){const gy=y*sy+sy/2-.5,j0=clamp(Math.floor(gy),0,GH-1),j1=Math.min(GH-1,j0+1),fy=clamp(gy-j0,0,1);
  for(let x=0;x<TW;x++){const gx=x*sx+sx/2-.5,i0f=Math.floor(gx),fx=gx-i0f,i0=(i0f+GW)%GW,i1=(i0+1)%GW;
   const a=j0*GW+i0,b=j0*GW+i1,c=j1*GW+i0,d=j1*GW+i1,w0=(1-fx)*(1-fy),w1=fx*(1-fy),w2=(1-fx)*fy,w3=fx*fy;
   const eb=ES[a]*w0+ES[b]*w1+ES[c]*w2+ES[d]*w3,e=eb+(hash(x,y)-.5)*.012+(vn(x/6,y/6)-.5)*.05+(paleo?(vn(x/17+40,y/17)-.5)*.07+(vn(x/2.6,y/2.6)-.5)*.025:0);
   const land=e>-sea,C=land?LC:OC,p=(y*TW+x)*4;RELF[y*TW+x]=land?Math.max(eb,0)+(vn(x/3,y/3)-.5)*.02*Math.min(1,eb*2):-1;
   D[p]=C[a*3]*w0+C[b*3]*w1+C[c*3]*w2+C[d*3]*w3;D[p+1]=C[a*3+1]*w0+C[b*3+1]*w1+C[c*3+1]*w2+C[d*3+1]*w3;D[p+2]=C[a*3+2]*w0+C[b*3+2]*w1+C[c*3+2]*w2+C[d*3+2]*w3;D[p+3]=255;
   if(paleo&&land&&BAT){let r=0,g=0,bb=0,ws=0,lc=-2,lr=0,lg=0,lb=0;const hx=gx+(vn(x/11,y/11)-.5)*2.4+(vn(x/3.5+7,y/3.5)-.5)*.8,hy=gy+(vn(x/11+5,y/11+3)-.5)*2.4+(vn(x/3.5,y/3.5+7)-.5)*.8,hi=Math.floor(hx),hj=clamp(Math.floor(hy),0,GH-2),ux=hx-hi,uy=clamp(hy-hj,0,1),h0=(hi%GW+GW)%GW,h1=(h0+1)%GW;const cs=[hj*GW+h0,hj*GW+h1,(hj+1)*GW+h0,(hj+1)*GW+h1],cw=[(1-ux)*(1-uy),ux*(1-uy),(1-ux)*uy,ux*uy];for(let n=0;n<4;n++){const q=cs[n],w=cw[n];if(SRC[q]<0||w<=0)continue;const cl=BCP[BI[q]];if(cl<0){r+=LC[q*3]*w;g+=LC[q*3+1]*w;bb+=LC[q*3+2]*w}else{if(cl!==lc){const t=batCol(cl,x,y);lc=cl;lr=t[0];lg=t[1];lb=t[2]}r+=lr*w;g+=lg*w;bb+=lb*w}ws+=w}
    if(ws>0){const f=.9/ws;D[p]=D[p]*.1+r*f;D[p+1]=D[p+1]*.1+g*f;D[p+2]=D[p+2]*.1+bb*f}}
   if(!(x&1)&&!(y&1)){const q=((y>>1)*1024+(x>>1))*4,v=land?8:(D[p]>200?30:100);SD[q]=SD[q+1]=SD[q+2]=v;SD[q+3]=255}}}
 // snow line by latitude (about 5 km near the equator, 3 km in the Alps, 1.5 km in Norway), lower in winter and ice ages, higher as it warms
 for(let y=0;y<TH;y++){const lat=90-(y+.5)/TH*180,al=Math.abs(lat),w=lat>0?SEAS:-SEAS;const sb=Math.exp(-(al-31)*(al-31)/72);SNL[y]=Math.max(.15,5.0-Math.max(0,al-22)*.105+1.3*sb-(w>0?.75*w:.35*w)*(1-.6*sb)-(CLIM.ice||0)*1.1+(CLIM.w||0)*.5)}
 // shaded relief: light from the north-west so mountains, ridges and valleys stand out at every height
 RELR.set(RELF);{const W=TW,H=TH,src=RELF,tmp=RELT,rr=4;for(let pass=0;pass<2;pass++){for(let y=0;y<H;y++){let s=0;const o=y*W;for(let x=-rr;x<=rr;x++)s+=Math.max(0,src[o+(x+W)%W]);for(let x=0;x<W;x++){tmp[o+x]=s/(2*rr+1);s+=Math.max(0,src[o+(x+rr+1)%W])-Math.max(0,src[o+(x-rr+W)%W])}}
  for(let x=0;x<W;x++){let s=0;for(let y=-rr;y<=rr;y++)s+=tmp[clamp(y,0,H-1)*W+x];for(let y=0;y<H;y++){const k=y*W+x;const v=s/(2*rr+1);src[k]=src[k]<0?-1:v;s+=tmp[Math.min(H-1,y+rr+1)*W+x]-tmp[Math.max(0,y-rr)*W+x]}}}}
 for(let y=1;y<TH-1;y++){const cl=Math.max(.2,Math.cos((90-(y+.5)/TH*180)*DEG));for(let x=0;x<TW;x++){const k=y*TW+x,h=RELF[k];if(h<0)continue;const xl=x?k-1:k+TW-1,xr=x<TW-1?k+1:k-TW+1;
  const hl=RELF[xl]<0?h:RELF[xl],hr=RELF[xr]<0?h:RELF[xr],hu=RELF[k-TW]<0?h:RELF[k-TW],hd=RELF[k+TW]<0?h:RELF[k+TW];
  const gx=(hr-hl)/cl,gy=hd-hu,s=clamp(1+(-gx*.7-gy*.7)*-RELK+h*.04,.66,1.38),p=k*4;
  const hr0=RELR[k];if(hr0>.45){const km=(hr0-.1)/.27*.92+Math.max(0,hr0-h)/.27*2.2,sf=clamp((km-SNL[y])/.4+(vn(x/2.5,y/2.5)-.5)*.9,0,1)*.92;if(sf>0){D[p]=lerp(D[p],242,sf);D[p+1]=lerp(D[p+1],245,sf);D[p+2]=lerp(D[p+2],250,sf)}}D[p]=Math.min(255,D[p]*s);D[p+1]=Math.min(255,D[p+1]*s);D[p+2]=Math.min(255,D[p+2]*s)}}
 // recent millennia: land colours from NASA's Blue Marble: Next Generation satellite mosaic (public domain), blended over the climate model;
 // seasonal snow in the mosaic is left to the model, which puts snow where and when it really falls
 // Ice Age and Holocene: the same mosaic wherever the land looked as it does now, fading as the ice grows (glacial steppe and tundra are the
 // model's); never on ice sheets, exposed shelves (Doggerland, Beringia, Sunda) or the green Sahara; elsewhere the mosaic's real texture
 // (its local brightness pattern) is kept under the model colour so ice-age land is not flat
 {const wb0=BMD&&!paleo?.82*clamp(1-CLIM.ice*.75,0,1)*clamp(1-(-Y-130000)/5.7e6,.5,1):0;if(wb0>0){if(!BML)bmlMake();const gS=CLIM.g||0,shelf=CLIM.sea>.003,old=Y<-4000;for(let y=0;y<TH;y++){const cy=Math.min(GH-1,(y*sy)|0)*GW;for(let x=0;x<TW;x++){const k=y*TW+x,p=k*4,r=BMD[p],g=BMD[p+1],b=BMD[p+2],ck=cy+Math.min(GW-1,(x*sx)|0);const wat=b>r+12||(b>25&&r<30&&g<b+20);if(RELF[k]<0){if(wat){D[p]=D[p]*(1-wb0)+r*wb0;D[p+1]=D[p+1]*(1-wb0)+g*wb0;D[p+2]=D[p+2]*(1-wb0)+b*wb0}continue}
  if(old&&BI[ck]===1)continue;if(wat&&shelf&&E0[ck]<0){const cl=BAT?BCM[BI[ck]]:-1;if(cl>=0){const t=batCol(cl,x,y),w=wb0*.95;D[p]=D[p]*(1-w)+t[0]*w;D[p+1]=D[p+1]*(1-w)+t[1]*w;D[p+2]=D[p+2]*(1-w)+t[2]*w}continue}let wb=wb0;if(gS>0)wb*=1-clamp(SHS[ck]*gS*1.5,0,1);if(old&&((r>135&&r>b+35&&g>b)!==(BI[ck]===6||BI[ck]===16)))wb*=.2;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(!wat&&mx>185&&mx-mn<40)continue;
  if(!wat&&old){const f=(BML[k]/128-1)*(1-wb)*.85;if(f){const m=1+f;D[p]=Math.min(255,D[p]*m);D[p+1]=Math.min(255,D[p+1]*m);D[p+2]=Math.min(255,D[p+2]*m)}}
  if(wat&&old)continue; // today's lakes on land are not painted into older eras (Lake Victoria was dry at the glacial maximum); dated lakes come from the water layer
  const w2=wat?1:wb;D[p]=D[p]*(1-w2)+r*w2;D[p+1]=D[p+1]*(1-w2)+g*w2;D[p+2]=D[p+2]*(1-w2)+b*w2}}}}
 tctx.putImageData(img,0,0);sctx.putImageData(simg,0,0);
 if(!paleo){tctx.strokeStyle='rgba(58,112,150,.95)';tctx.lineCap=tctx.lineJoin='round';
  {const gk=clamp((simY+5.5e6)/(3.5e6),0,1);if(gk>0&&simY>-6e6){const GC=[[36.87,-111.6],[36.6,-111.85],[36.25,-111.95],[36.1,-112.1],[36.2,-112.6],[36.3,-113.1],[36.05,-113.8]];tctx.strokeStyle=`rgba(120,52,30,${.4+.5*gk})`;tctx.lineWidth=1+gk*3.5;tctx.beginPath();GC.forEach((p,i)=>{const X=(p[1]+180)/360*TW,Yp=(90-p[0])/180*TH;i?tctx.lineTo(X,Yp):tctx.moveTo(X,Yp)});tctx.stroke();tctx.strokeStyle='rgba(58,112,150,.95)'}}
  if(WATER){const P=(c)=>[(c[0]+180)/360*TW,(90-c[1])/180*TH];tctx.fillStyle='rgb(52,104,146)';for(const h of WATER.h||[]){const a=lakeH(h,Y);if(a<=0)continue;tctx.globalAlpha=a;tctx.beginPath();h[3].forEach((c,i)=>{const[X,Yp]=P(c);i?tctx.lineTo(X,Yp):tctx.moveTo(X,Yp)});tctx.closePath();tctx.fill()}
   for(const l of WATER.l){const a=l[0]>8?0:lakeA(l[1],Y);if(a<=0||lakeIce(l[2]))continue;tctx.globalAlpha=a;tctx.beginPath();let px=null;l[2].forEach((c,i)=>{const[X,Yp]=P(c);if(i&&Math.abs(X-px)>TW/2){tctx.moveTo(X,Yp)}else i?tctx.lineTo(X,Yp):tctx.moveTo(X,Yp);px=X});tctx.closePath();tctx.fill()}tctx.globalAlpha=1;
   for(const r of WATER.r){tctx.strokeStyle='rgba(74,140,196,.95)';tctx.lineWidth=Math.max(.8,2.6-r[0]*.24);tctx.beginPath();let px=null;const ri=ICEK2>=0||(CLIM.ice||0)>0;r[1].forEach((c,i)=>{const[X,Yp]=P(c);if(ri&&iceAt(c[1],c[0])){px=null;return}if(px===null||Math.abs(X-px)>TW/2)tctx.moveTo(X,Yp);else tctx.lineTo(X,Yp);px=X});tctx.stroke()}}
  else for(const r of RIVERS){tctx.lineWidth=1.4;tctx.beginPath();r.forEach((p,i)=>{const X=(p[1]+180)/360*TW,Yp=(90-p[0])/180*TH;i?tctx.lineTo(X,Yp):tctx.moveTo(X,Yp)});tctx.stroke()}}
 // water mask for the ground scenes: whatever is painted as lake or river on land counts as water down there too
 try{const id=tctx.getImageData(0,0,TW,TH).data;if(!WMASK)WMASK=new Uint8Array(TW*TH);for(let k=0;k<TW*TH;k++){const p=k*4,r=id[p],g=id[p+1],b=id[p+2];WMASK[k]=RELF[k]>=0&&b>r+20&&b>=g&&b>45?1:0}}catch(e){}
 if(globeTex){globeTex.needsUpdate=true;specTex.needsUpdate=true}
 if(globeGeo)updGlobeHeights();
 placeZones(Y);
 return true}
// ---- lakes on their real dates: reservoirs fill from the year their dam closed (to full), Natural Earth historic outlines
// (Aral Sea, Lake Chad, Lake Texcoco, Lop Nur; public domain) shrink to today's lakes, lakes under ice-age ice sheets are hidden ----
const RESV={'Lake Mead':[1935,1938],'Lake Powell':[1963,1980],'Lake Nasser':[1964,1976],'Lake Volta':[1964,1967],'Lake Kariba':[1958,1963],'Itaipú Reservoir':[1982,1983],'Rybinsk Reservoir':[1941,1947],'Samara Reservoir':[1955,1957],'Kremenchuk Reservoir':[1959,1961],'Kakhovka Reservoir':[1955,1958,2023.43],'Bratsk Reservoir':[1961,1967],'Vilyuy Reservoir':[1967,1972],'Smallwood Reservoir':[1970,1974],'Rés. de La Grande 2':[1978,1979],'Rés. de La Grande 3':[1981,1982],'Réservoir de Caniapiscau':[1981,1985],'Réservoir Gouin':[1917,1918],'Réservoir Baskatong':[1927,1928],'Cabonga Reservoir':[1928,1929],'Réservoir Pipmuacan':[1953,1956],'Kainji Reservoir':[1968,1969],'Represa de Sobradinho':[1977,1979],'Represa de Tucuruí':[1984,1985],'Represa Três Marias':[1960,1962],'Lago Gatun':[1912,1914],'Van Blommestein Meer':[1964,1967],'Nam Ngum Reservoir':[1971,1972],'Toktogul Res.':[1974,1978],'Shardara Bögeni':[1965,1968],'Lake Argyle':[1971,1974],'Williston Lake':[1968,1972],'Kinbasket Lake':[1973,1976],'Ft. Peck Lake':[1937,1940],'Fort Peck Lake':[1937,1940],'Lake Sakakawea':[1953,1956],'Lake Oahe':[1958,1962],'Lake Francis Case':[1952,1955],'Amistad Reservoir':[1968,1969],'Falcon Lake':[1953,1954],'Kentucky Lake':[1944,1945],'J. Strom Thurmond Lake':[1951,1954],'Lake Havasu':[1938,1939],'Shasta Lake':[1944,1948],'Millerton Lake':[1944,1945],'Wheeler Lake':[1936,1937],'Lake Tharthar':[1956,1958],'Salton Sea':[1905,1907]};
function lakeA(n,Y){const r=RESV[n];if(!r)return 1;if(r[2]&&Y>=r[2])return clamp(1-(Y-r[2])*12,0,1);return clamp((Y-r[0])/(r[1]-r[0]),0,1)}
function lakeH(h,Y){return clamp((h[2]-Y)/(h[2]-h[1]),0,1)}
function lakeIce(c){const p=c[c.length>>1];return iceAt(p[1],p[0])}
function lakeSig(Y){if(Y<1590||Y>2030)return 0;let s=0;for(const n in RESV)s=s*7+Math.round(lakeA(n,Y)*4)|0;if(WATER&&WATER.h)for(const h of WATER.h)s=s*7+Math.round(lakeH(h,Y)*8)|0;return s}
function hAt0(lat,lon){let gx=(lon+180)*2-.5,gy=(90-lat)*2-.5;const i0f=Math.floor(gx),fx=gx-i0f,j0=clamp(Math.floor(gy),0,GH-1),j1=Math.min(GH-1,j0+1),fy=clamp(gy-j0,0,1),i0=(i0f+GW)%GW,i1=(i0+1)%GW;
 return HG[j0*GW+i0]*(1-fx)*(1-fy)+HG[j0*GW+i1]*fx*(1-fy)+HG[j1*GW+i0]*(1-fx)*fy+HG[j1*GW+i1]*fx*fy}
function hAt(lat,lon){const b=hAt0(lat,lon);return HRP?b+hrW(lat,lon):b}
const hDir=(x,y,z)=>{const p=ll(x,y,z);return hAt(p[0],p[1])};
// ---- sharper mountains up close: 4 arc-minute NOAA ETOPO1 tiles (public domain; Amante & Eakins 2009) for the big mountain regions,
// fetched only when the camera is low over one, shown on a fine ground patch that blends into the 0.5-degree globe at its edges ----
const HRT=[['himalaya',26,40,68,98,35],['alps',43,49,4,17,20],['andes_n',-18,8,-82,-62,30],['andes_s',-45,-18,-76,-62,30],['eafrica',-12,15,28,44,25],['rockies',32,50,-118,-104,20]],HRC={},HRN=10,HRS=12,HRST=180/256;
let HRP=null,hrMesh=null,hrT=0;
function hrTile(lat,lon){for(const t of HRT)if(lat>t[1]+1.5&&lat<t[2]-1.5&&lon>t[3]+1.5&&lon<t[4]-1.5)return t;return null}
function hrLoad(t){if(HRC[t[0]]!==undefined)return;HRC[t[0]]=null;fetch('topo/'+t[0]+'.bin').then(r=>r.ok?r.arrayBuffer():null).then(b=>{if(!b)return;const W=(t[4]-t[3])*15+1,H=(t[2]-t[1])*15+1;if(b.byteLength!==W*H)return;HRC[t[0]]={t,W,H,z:new Uint8Array(b)}}).catch(()=>{})}
function hrM(c,lat,lon){const t=c.t,x=(lon-t[3])*15,y=(lat-t[1])*15,i=Math.min(c.W-2,Math.max(0,Math.floor(x))),j=Math.min(c.H-2,Math.max(0,Math.floor(y))),fx=clamp(x-i,0,1),fy=clamp(y-j,0,1),z=c.z,W=c.W,k=j*W+i;
 return((z[k]*(1-fx)+z[k+1]*fx)*(1-fy)+(z[k+W]*(1-fx)+z[k+W+1]*fx)*fy)*t[5]}
function topoAt(lat,lon){let gx=(lon+180)*2-.5,gy=(90-lat)*2-.5;const i0f=Math.floor(gx),fx=gx-i0f,j0=clamp(Math.floor(gy),0,GH-1),j1=Math.min(GH-1,j0+1),fy=clamp(gy-j0,0,1),i0=(i0f+GW)%GW,i1=(i0+1)%GW;
 return Math.max(0,TOPOM[j0*GW+i0])*(1-fx)*(1-fy)+Math.max(0,TOPOM[j0*GW+i1])*fx*(1-fy)+Math.max(0,TOPOM[j1*GW+i0])*(1-fx)*fy+Math.max(0,TOPOM[j1*GW+i1])*fx*fy}
// extra height (globe units) the fine data adds at a point: fades out at the patch edge, the tile edge, the coast and around towns (they stand on the flat site plane)
function hrD(lat,lon,b){const P=HRP,c=P.c,t=c.t,sm=v=>{v=clamp(v,0,1);return v*v*(3-2*v)};
 const w=sm(Math.min(lat-P.s,P.n-lat,lon-P.w,P.e-lon)/(HRST*1.6))*sm(Math.min(lat-t[1],t[2]-lat,lon-t[3],t[4]-lon)/.5)*sm((b-.035)/.03);if(w<=0)return 0;
 let d=(hrM(c,lat,lon)-topoAt(lat,lon))*KMU/1000;for(const s of P.st){const q=Math.hypot(lat-s[0],(lon-s[1])*s[2]);if(q<.24)d=lerp(s[3],d,sm((q-.08)/.16))}return w*d}
function hrW(lat,lon){const P=HRP;if(lat<=P.s||lat>=P.n||lon<=P.w||lon>=P.e)return 0;return hrD(lat,lon,hAt0(lat,lon))}
function hrGlobeR(ix,iy){const p=globeGeo.attributes.position.array,k=(iy*513+ix)*3,o=HRP&&HRP.sv&&HRP.sv.get(iy*513+ix);return o!==undefined?o:Math.hypot(p[k],p[k+1],p[k+2])}
function hrDrop(){if(!HRP)return;const p=globeGeo.attributes.position.array;for(const[k,r]of HRP.sv){const l=Math.hypot(p[k*3],p[k*3+1],p[k*3+2])||1;p[k*3]*=r/l;p[k*3+1]*=r/l;p[k*3+2]*=r/l}
 globeGeo.attributes.position.needsUpdate=true;const P=HRP;HRP=null;if(hrMesh)hrMesh.visible=false;hrRefit(P)}
function hrRefit(P){for(const z of[...S,...WZ])if(z.U&&z.lat>P.s-.5&&z.lat<P.n+.5&&z.lon>P.w-.5&&z.lon<P.e+.5){if(z.homes){frameSite(z);if(z.built)z.dirty=true}else frameSite(z)}treesDirty=true}
function hrBuild(c,ci,cj){if(HRP)hrDrop();
 const P={c,ci,cj,w:-180+ci*HRST,e:-180+(ci+HRN)*HRST,n:90-cj*HRST,s:90-(cj+HRN)*HRST,sv:new Map(),st:[]};
 for(const s of S)if((s.built||s.tier>=0)&&s.lat>P.s-.5&&s.lat<P.n+.5&&s.lon>P.w-.5&&s.lon<P.e+.5)P.st.push([s.lat,s.lon,Math.cos(s.lat*DEG),0]);
 const M=HRN*HRS+1,pos=new Float32Array(M*M*3),uv=new Float32Array(M*M*2),gp=globeGeo.attributes.position.array;
 HRP=P;for(const s of P.st)s[3]=0;for(const s of P.st){const b=hAt0(s[0],s[1]);const st=P.st;P.st=[];s[3]=hrD(s[0],s[1],b);P.st=st}
 for(let b=0;b<M;b++)for(let a=0;a<M;a++){const gi=a/HRS,gj=b/HRS,i0=Math.min(HRN-1,Math.floor(gi)),j0=Math.min(HRN-1,Math.floor(gj)),fx=gi-i0,fy=gj-j0,
  r00=hrGlobeR(ci+i0,cj+j0),r10=hrGlobeR(ci+i0+1,cj+j0),r01=hrGlobeR(ci+i0,cj+j0+1),r11=hrGlobeR(ci+i0+1,cj+j0+1),lon=P.w+gi*HRST,lat=P.n-gj*HRST;
  let r=(r00*(1-fx)+r10*fx)*(1-fy)+(r01*(1-fx)+r11*fx)*fy;if(a&&b&&a<M-1&&b<M-1&&r>R)r+=hrD(lat,lon,hAt0(lat,lon));const v=v3(lat,lon,r),k=b*M+a;
  pos[k*3]=v.x;pos[k*3+1]=v.y;pos[k*3+2]=v.z;uv[k*2]=(lon+180)/360;uv[k*2+1]=(lat+90)/180}
 // sink the coarse globe under the patch so the finer ground shows (edges stay shared, so there is no seam)
 for(let j=cj+1;j<cj+HRN;j++)for(let i=ci+1;i<ci+HRN;i++){const k=j*513+i,l=Math.hypot(gp[k*3],gp[k*3+1],gp[k*3+2]);P.sv.set(k,l);const f=(l-1.2)/l;gp[k*3]*=f;gp[k*3+1]*=f;gp[k*3+2]*=f}
 globeGeo.attributes.position.needsUpdate=true;
 if(!hrMesh){const g=new THREE.BufferGeometry(),idx=[];for(let b=0;b<M-1;b++)for(let a=0;a<M-1;a++){const k=b*M+a;idx.push(k,k+M,k+1,k+1,k+M,k+M+1)}g.setIndex(idx);
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));hrMesh=new THREE.Mesh(g,globe.material);hrMesh.frustumCulled=false;scene.add(hrMesh)}
 else{hrMesh.geometry.attributes.position.array.set(pos);hrMesh.geometry.attributes.uv.array.set(uv);hrMesh.geometry.attributes.position.needsUpdate=hrMesh.geometry.attributes.uv.needsUpdate=true}
 hrMesh.geometry.computeVertexNormals();hrMesh.geometry.computeBoundingSphere();hrMesh.visible=true;hrRefit(P)}
function hrTick(dt){if(!globeGeo||(hrT-=dt)>0)return;hrT=.5;const c=cam.t,q=ll(c.x,c.y,c.z),t=simY>-3e6&&cam.alt<14?hrTile(q[0],q[1]):null;
 if(!t){if(HRP)hrDrop();return}const C=HRC[t[0]];if(!C){hrLoad(t);return}
 const ci=Math.round((q[1]+180)/HRST-HRN/2),cj=Math.round((90-q[0])/HRST-HRN/2);if(HRP&&HRP.c===C&&Math.abs(ci-HRP.ci)<=2&&Math.abs(cj-HRP.cj)<=2)return;hrBuild(C,ci,cj)}
const biomeAt=(lat,lon)=>BI[clamp(Math.floor((90-lat)*2),0,GH-1)*GW+((Math.floor((lon+180)*2))%GW+GW)%GW];

