// ================== utilities ==================
const $=id=>document.getElementById(id);
const DEG=Math.PI/180,R=100,GW=720,GH=360;
// ---- real ocean depth (ETOPO-based topo grid): seafloor colour by depth and a 3D seafloor under see-through water ----
var SEAFLOOR=true,seaWater=null;const SDP=new Float32Array(GW*GH),KMU=.0864;
const OSTOP=[[0,[98,182,188]],[120,[66,152,172]],[600,[38,108,152]],[2500,[22,68,122]],[4500,[14,44,92]],[6500,[8,28,68]],[9000,[4,15,44]],[11000,[2,9,30]]];
function oceanCol(d){let i=1;while(i<OSTOP.length-1&&d>OSTOP[i][0])i++;const a=OSTOP[i-1],b=OSTOP[i],f=clamp((d-a[0])/(b[0]-a[0]),0,1);return[lerp(a[1][0],b[1][0],f),lerp(a[1][1],b[1][1],f),lerp(a[1][2],b[1][2],f)]}
function sdAt(lat,lon){let gx=(lon+180)*2-.5,gy=(90-lat)*2-.5;const i0f=Math.floor(gx),fx=gx-i0f,j0=clamp(Math.floor(gy),0,GH-1),j1=Math.min(GH-1,j0+1),fy=clamp(gy-j0,0,1),i0=(i0f+GW)%GW,i1=(i0+1)%GW;return SDP[j0*GW+i0]*(1-fx)*(1-fy)+SDP[j0*GW+i1]*fx*(1-fy)+SDP[j1*GW+i0]*(1-fx)*fy+SDP[j1*GW+i1]*fx*fy}
const rnd=Math.random,pick=a=>a[(rnd()*a.length)|0],clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
function srng(s){let x=(Math.imul(s|0,2654435761)>>>0)||7;return()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296}}
function hash(x,y){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function vn(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y){return vn(x,y)*.5+vn(x*2.1+5,y*2.1+3)*.25+vn(x*4.3+11,y*4.3+7)*.125+vn(x*8.7+2,y*8.7+19)*.0625}
function pw(t,y){if(y<=t[0][0])return t[0][1];for(let i=1;i<t.length;i++)if(y<=t[i][0]){const a=t[i-1],b=t[i];return a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0])}return t[t.length-1][1]}
const fmtN=n=>n>=1e9?(n/1e9).toFixed(2)+' bn':n>=1e6?(n/1e6).toFixed(n>=1e7?0:1)+' m':n>=1e4?Math.round(n/1e3)+'k':Math.round(n).toLocaleString('en-US');
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtY(y,full){if(y<-1e6){const m=-y/1e6;return m.toFixed(m<10?2:m<100?1:0)+' million years ago'}if(y<-100000)return Math.round(-y/1000).toLocaleString('en-US')+',000 years ago';if(y<1){const b=Math.max(1,Math.ceil(-y));return b.toLocaleString('en-US')+' BCE'}const f=Math.floor(y);if(full&&y>=1500)return MON[Math.min(11,Math.floor((y-f)*12))]+' '+f;return f+' CE'}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const art=w=>/^[aeiou]/i.test(w)?'an':'a';
function v3(lat,lon,r){const ph=(lon+180)*DEG,th=(90-lat)*DEG;return new THREE.Vector3(-Math.cos(ph)*Math.sin(th)*r,Math.cos(th)*r,Math.sin(ph)*Math.sin(th)*r)}
function ll(x,y,z){const l=Math.hypot(x,y,z);let lon=Math.atan2(z/l,-x/l)/DEG-180;if(lon<-180)lon+=360;return[Math.asin(clamp(y/l,-1,1))/DEG,lon]}
const LS={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}},del(k){try{localStorage.removeItem(k)}catch(e){}}};

// ================== time ==================
const SEG=[[0,-230e6],[40,-66e6],[52,-3e6],[60,-70000],[210,-12000],[345,-4000],[455,-500],[575,1500],[655,1900],[700,2026.9],[730,2100]];
const Y0=-71.25e6,YEND=2100,KN=[[0,-71.25e6],[5.21e6/86400,-66.04e6],[455,-70000],[575,-3000],[695,1800],[825,2100]],TOTDAYS=825;
const yearAt=d=>{d=Math.max(0,d);if(d>=TOTDAYS)return YEND+(d-TOTDAYS)/365.25;for(let i=1;i<KN.length;i++)if(d<=KN[i][0]){const a=KN[i-1],b=KN[i];return a[1]+(b[1]-a[1])*(d-a[0])/(b[0]-a[0])}return YEND};
const SEGI=SEG.map(s=>[s[1],s[0]]);const dayAt=y=>{if(y>YEND)return TOTDAYS+(y-YEND)*365.25;if(y<=Y0)return 0;for(let i=1;i<KN.length;i++)if(y<=KN[i][1]){const a=KN[i-1],b=KN[i];return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1])}return TOTDAYS};
const yps=d=>{if(d>=TOTDAYS)return 1/31557600;for(let i=1;i<KN.length;i++)if(d<KN[i][0]){const a=KN[i-1],b=KN[i];return(b[1]-a[1])/((b[0]-a[0])*86400)}return 1/31557600};
function rateText(d){const r=yps(d);if(r>=.95)return `1 second ≈ ${r<1.05?'1 year':r.toFixed(1)+' years'}`;const s=1/r;return s<3600?`1 year ≈ ${Math.round(s/60)} min`:s<86400*2?`1 year ≈ ${(s/3600).toFixed(s<36000?1:0)} hours`:'real time'}
function ratePerDay_old(d){for(let i=1;i<SEG.length;i++)if(d<SEG[i][0])return(SEG[i][1]-SEG[i-1][1])/(SEG[i][0]-SEG[i-1][0]);return 1/365.25}
const ERAS=[[-230e6,'Late Triassic','Pangea: one supercontinent, and the first dinosaurs'],[-201.3e6,'Jurassic','Giant sauropods; Pangea starts to split apart'],[-145e6,'Cretaceous','Flowering plants, T. rex and Triceratops; warm seas flood the land'],[-66e6,'Paleogene','After the asteroid: mammals and birds take over'],[-23e6,'Neogene','Grasslands spread; apes appear'],[-2.58e6,'Pleistocene','Ice ages come and go; early humans make stone tools'],[-300000,'Middle Stone Age','Homo sapiens appears in Africa'],[-70000,'Upper Paleolithic','Small bands of hunter-gatherers spread out of Africa'],[-26000,'Last Glacial Maximum','Ice sheets bury the north; seas fall and land bridges open'],[-12000,'Mesolithic','The ice retreats; people settle by rivers and coasts'],[-9500,'Neolithic Revolution','Farming, herding and the first villages'],[-3300,'Bronze Age','Cities, writing, kings and the wheel'],[-1200,'Iron Age','Iron tools, alphabets and empires'],[-500,'Classical Antiquity','Rome, Han China, Maurya India, Maya cities'],[500,'Middle Ages','Kingdoms and trade routes on every continent'],[1450,'Age of Exploration','Printing, ocean voyages and colonial empires'],[1760,'Industrial Revolution','Steam, factories and railways'],[1914,'Modern Era','World wars, electricity, cars and flight'],[1970,'Information Age','Computers, the internet and globalisation'],[2007,'Smartphone & AI Era','Almost everyone online, everywhere'],[2027,'Age of AI & Climate (projected)','Projected from today\'s trends: automation, clean energy, a warming planet'],[2060,'Late 21st century (projected)','Projected: population peaks; cities adapt to heat and rising seas']];
const eraAt=y=>{let e=ERAS[0];for(const x of ERAS)if(y>=x[0])e=x;return e};
const WP=[[-70000,1.5e5],[-50000,3e5],[-30000,8e5],[-10000,4e6],[-5000,1.5e7],[-3000,4.5e7],[-1000,5e7],[1,2.3e8],[1000,3.1e8],[1340,4.4e8],[1400,3.7e8],[1500,4.6e8],[1700,6e8],[1804,1e9],[1900,1.65e9],[1950,2.5e9],[1975,4.1e9],[2000,6.1e9],[2026.9,8.2e9],[2050,9.66e9],[2084,10.3e9],[2100,10.2e9]];
const WPL=WP.map(p=>[p[0],Math.log(p[1])]);const worldPop=y=>Math.exp(pw(WPL,Math.min(y,2100)));

// ================== planet vitals ==================
const CO2T=[[-230e6,1500],[-200e6,1300],[-150e6,1100],[-100e6,1000],[-66e6,900],[-56e6,1300],[-50e6,1000],[-34e6,700],[-20e6,400],[-3e6,350],[-2.6e6,280],[1750,280],[1850,285],[1900,296],[1958,315],[1980,339],[2000,370],[2015,401],[2026.9,428],[2050,500],[2100,600]];
const TMPT=[[-230e6,8],[-100e6,9],[-66e6,7],[-56e6,12],[-50e6,9],[-34e6,4],[-15e6,4],[-3e6,2.5],[-2.6e6,0],[1850,0],[1950,.2],[1980,.4],[2000,.7],[2026.9,1.4],[2050,2],[2100,2.7]];
const SEAT=[[-230e6,60],[-150e6,120],[-90e6,250],[-66e6,150],[-34e6,60],[-3e6,25],[-2.6e6,0],[-6000,0],[1900,-.2],[2026.9,0],[2050,.2],[2100,.55]];
const FORT=[[-10000,57],[1700,50],[1900,45],[2000,38],[2026.9,37],[2100,35]];
function vitals(Y){let co2=pw(CO2T,Y),tmp=pw(TMPT,Y),sea=pw(SEAT,Y);if(Y>-2.6e6&&Y<1750){const ice=CLIM.ice||0;co2=280-100*ice;tmp=-6*ice;sea=-120*ice}return{co2:Math.round(co2),tmp,sea,forest:Y>-10000?pw(FORT,Y):null}}
