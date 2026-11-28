// ================== languages & main faiths (coarse, by era) ==================
const LANG={af:[[-1e5,'unwritten African languages'],[-2000,'Bantu & other African languages'],[1900,'local languages, English & French']],eg:[[-1e5,'unwritten Afroasiatic'],[-3200,'Ancient Egyptian'],[300,'Coptic & Greek'],[700,'Arabic']],me:[[-1e5,'unwritten Afroasiatic'],[-3500,'Sumerian & Akkadian'],[-600,'Aramaic'],[650,'Arabic']],in:[[-1e5,'unwritten'],[-3000,'Harappan (undeciphered)'],[-1500,'Vedic Sanskrit'],[-300,'Prakrit'],[1200,'Hindustani'],[1850,'Hindi, Urdu & English']],cn:[[-1e5,'unwritten'],[-1200,'Old Chinese'],[600,'Middle Chinese'],[1400,'Mandarin']],jp:[[-1e5,'unwritten'],[-300,'Proto-Japonic'],[700,'Old Japanese'],[1600,'Japanese']],sea:[[-1e5,'unwritten Austroasiatic'],[800,'Old Khmer & Malay']],aus:[[-1e5,'Aboriginal languages']],pol:[[-1e5,'Polynesian']],eu:[[-1e5,'unwritten'],[-3000,'Proto-Indo-European'],[-500,'Celtic & Italic languages']],eun:[[-1e5,'unwritten'],[-500,'Proto-Norse'],[800,'Old Norse'],[1250,'Swedish']],st:[[-1e5,'unwritten'],[-1000,'Turkic & Iranian languages']],arc:[[-1e5,'unwritten Arctic languages']],nap:[[-1e5,'unwritten'],[1000,'Siouan (Lakota)'],[1880,'English']],nae:[[-1e5,'unwritten'],[1000,'Algonquian & Iroquoian']],nasw:[[-1e5,'unwritten'],[900,'Ancestral Puebloan & Uto-Aztecan']],mes:[[-1e5,'unwritten'],[-800,'Maya & Mixe-Zoque']],and:[[-1e5,'unwritten'],[1200,'Quechua']],amz:[[-1e5,'Tupian & Arawakan']]};
const LANGS={blombos:[[-1e5,'Khoisan click languages'],[1652,'Dutch & Khoekhoe'],[1925,'Afrikaans, English & Xhosa']],lagos:[[-1e5,'Niger–Congo'],[-500,'Yoruba'],[1900,'Yoruba & English']],timbuktu:[[-1e5,'Nilo-Saharan'],[1100,'Songhay & Arabic']],zimbabwe:[[-1e5,'Khoisan'],[300,'Shona']],congo:[[-1e5,'forest languages'],[-1000,'Kikongo'],[1900,'Lingala & French']],omo:[[-1e5,'unwritten Afroasiatic'],[-500,"Ge'ez"],[1270,'Amharic']],madagascar:[[-1e5,'Malagasy'],[1900,'Malagasy & French']],istanbul:[[-1e5,'unwritten'],[-660,'Greek'],[1453,'Turkish']],tehran:[[-1e5,'unwritten'],[-2000,'Old Iranian'],[-550,'Old Persian'],[900,'Persian']],jericho:[[-1e5,'unwritten'],[-2000,'Canaanite'],[-500,'Aramaic'],[650,'Arabic'],[1948,'Hebrew & Arabic']],dubai:[[-1e5,'unwritten'],[0,'Old Arabic'],[650,'Arabic']],mohenjo:[[-1e5,'unwritten'],[-2600,'Harappan (undeciphered)']],mumbai:[[-1e5,'unwritten'],[-300,'Prakrit'],[1200,'Marathi'],[1850,'Marathi, Hindi & English']],shanghai:[[-1e5,'unwritten'],[-1200,'Old Chinese'],[1300,'Wu Chinese'],[1950,'Wu & Mandarin']],angkor:[[-1e5,'unwritten Austroasiatic'],[600,'Old Khmer']],singapore:[[-1e5,'unwritten'],[1300,'Malay'],[1819,'Malay, English, Chinese & Tamil']],newguinea:[[-1e5,'Papuan languages']],sydney:[[-1e5,'Aboriginal languages (Dharug)'],[1788,'English']],uluru:[[-1e5,'Pitjantjatjara']],hawaii:[[-1e5,'Hawaiian'],[1900,'English & Hawaiian']],auckland:[[-1e5,'Māori'],[1840,'English & Māori']],rapanui:[[-1e5,'Rapa Nui']],tonga:[[-1e5,'Tongan']],paris:[[-1e5,'unwritten'],[-3000,'Proto-Indo-European'],[-500,'Gaulish'],[-50,'Latin'],[800,'Old French'],[1400,'French']],rome:[[-1e5,'unwritten'],[-3000,'Proto-Indo-European'],[-700,'Latin'],[800,'Italian dialects'],[1861,'Italian']],athens:[[-1e5,'unwritten'],[-1600,'Mycenaean Greek'],[-800,'Ancient Greek'],[600,'Medieval Greek'],[1830,'Modern Greek']],london:[[-1e5,'unwritten'],[-1000,'Celtic (Brittonic)'],[47,'Latin & Brittonic'],[500,'Old English'],[1100,'Middle English'],[1500,'English']],stonehenge:[[-1e5,'unwritten'],[-1000,'Celtic (Brittonic)']],kyiv:[[-1e5,'unwritten'],[-3000,'Proto-Indo-European'],[500,'Early Slavic'],[880,'Old East Slavic'],[1500,'Ukrainian']],moscow:[[-1e5,'unwritten'],[500,'Early Slavic'],[1147,'Old East Slavic'],[1500,'Russian']],samarkand:[[-1e5,'unwritten'],[-700,'Sogdian'],[900,'Persian & Turkic'],[1500,'Uzbek & Tajik']],ulaanbaatar:[[-1e5,'unwritten'],[-1000,'Turkic & Mongolic'],[1200,'Mongolian']],yakutsk:[[-1e5,'unwritten'],[1300,'Sakha'],[1632,'Sakha & Russian']],nuuk:[[-1e5,'Paleo-Eskimo'],[1200,'Greenlandic'],[1728,'Greenlandic & Danish']],fairbanks:[[-1e5,'Athabaskan'],[1901,'English']],la:[[-1e5,'Tongva (Uto-Aztecan)'],[1781,'Spanish'],[1850,'English & Spanish']],cahokia:[[-1e5,'unwritten'],[1050,'Mississippian languages'],[1764,'French'],[1804,'English']],nyc:[[-1e5,'Lenape (Algonquian)'],[1625,'Dutch'],[1664,'English']],iroquois:[[-1e5,'unwritten'],[1000,'Iroquoian'],[1800,'English']],teotihuacan:[[-1e5,'unwritten'],[-100,'unknown (perhaps Totonac)']],tenochtitlan:[[-1e5,'unwritten'],[1325,'Nahuatl'],[1521,'Spanish & Nahuatl']],tikal:[[-1e5,'unwritten'],[-800,'Classic Maya']],caral:[[-1e5,'unknown']],cusco:[[-1e5,'unwritten'],[1200,'Quechua'],[1533,'Spanish & Quechua']],machupicchu:[[-1e5,'Quechua']],monteverde:[[-1e5,'unwritten'],[1853,'Spanish']],belem:[[-1e5,'Tupian'],[1616,'Portuguese']],saopaulo:[[-1e5,'Tupí'],[1554,'Portuguese']],buenosaires:[[-1e5,'unwritten'],[1580,'Spanish']],ushuaia:[[-1e5,'Yaghan'],[1884,'Spanish']]};
const FAITH={af:[[-1e5,'ancestor spirits & animism']],eg:[[-1e5,'animism'],[-3100,'Egyptian gods'],[400,'Coptic Christianity'],[700,'Islam']],me:[[-1e5,'animism'],[-3500,'Mesopotamian gods'],[700,'Islam']],in:[[-1e5,'animism'],[-1500,'Vedic religion'],[-300,'Hinduism, Buddhism & Jainism'],[1200,'Hinduism & Islam']],cn:[[-1e5,'animism'],[-1600,'ancestor worship'],[-500,'Confucianism & Taoism'],[400,'Confucianism, Taoism & Buddhism'],[1950,'mostly non-religious; Buddhism & folk religion']],jp:[[-1e5,'animism'],[-300,'Shinto'],[600,'Shinto & Buddhism']],sea:[[-1e5,'animism'],[800,'Hinduism'],[1200,'Buddhism']],aus:[[-1e5,'the Dreaming']],pol:[[-1e5,'Polynesian gods'],[1830,'Christianity']],eu:[[-1e5,'animism'],[-3000,'Indo-European gods'],[400,'Christianity'],[1960,'Christianity, increasingly secular']],eun:[[-1e5,'animism'],[-500,'Norse gods'],[1100,'Christianity'],[1960,'mostly secular']],st:[[-1e5,'animism'],[-1000,'Tengrism']],arc:[[-1e5,'animism & shamanism']],nap:[[-1e5,'animism'],[1000,'Lakota spirituality'],[1890,'Christianity & Lakota spirituality']],nae:[[-1e5,'animism'],[1625,'Christianity']],nasw:[[-1e5,'animism'],[900,'Puebloan religion']],mes:[[-1e5,'animism'],[-1500,'Mesoamerican gods'],[1521,'Catholic Christianity']],and:[[-1e5,'animism'],[-3000,'Andean gods'],[1200,'Inca sun worship (Inti)'],[1533,'Catholic Christianity']],amz:[[-1e5,'animism'],[1600,'Catholic Christianity']]};
const FAITHS={jericho:[[-1e5,'animism'],[-1000,'Canaanite religion & Judaism'],[400,'Christianity'],[700,'Islam'],[1948,'Judaism & Islam']],istanbul:[[-1e5,'animism'],[-660,'Greek gods'],[330,'Orthodox Christianity'],[1453,'Islam']],tehran:[[-1e5,'animism'],[-1000,'Zoroastrianism'],[700,'Islam']],patna:[[-1e5,'animism'],[-500,'Buddhism, Jainism & Hinduism'],[1200,'Hinduism & Islam']],rome:[[-1e5,'animism'],[-753,'Roman gods'],[380,'Christianity'],[1960,'Christianity, increasingly secular']],athens:[[-1e5,'animism'],[-1600,'Greek gods'],[380,'Orthodox Christianity']],kyiv:[[-1e5,'animism'],[500,'Slavic gods'],[988,'Orthodox Christianity'],[1922,'officially atheist (Soviet)'],[1991,'Orthodox Christianity']],moscow:[[-1e5,'animism'],[500,'Slavic gods'],[1000,'Orthodox Christianity'],[1922,'officially atheist (Soviet)'],[1991,'Orthodox Christianity']],samarkand:[[-1e5,'animism'],[-500,'Zoroastrianism'],[750,'Islam']],ulaanbaatar:[[-1e5,'animism'],[-1000,'Tengrism'],[1580,'Tibetan Buddhism']],omo:[[-1e5,'animism'],[330,'Ethiopian Orthodox Christianity']],timbuktu:[[-1e5,'animism'],[1100,'Islam']],lagos:[[-1e5,'animism'],[-500,'Yoruba religion'],[1850,'Christianity, Islam & Yoruba religion']],blombos:[[-1e5,'animism'],[1652,'Christianity']],sydney:[[-1e5,'the Dreaming'],[1788,'Christianity'],[1990,'Christianity & no religion']],dubai:[[-1e5,'animism'],[700,'Islam']],mumbai:[[-1e5,'animism'],[-1500,'Vedic religion'],[-300,'Hinduism & Buddhism'],[1200,'Hinduism & Islam']],singapore:[[-1e5,'animism'],[1819,'Buddhism, Islam, Christianity & Hinduism']],la:[[-1e5,'animism'],[1781,'Catholic Christianity'],[1950,'many faiths']],nyc:[[-1e5,'animism'],[1625,'Christianity'],[1900,'many faiths']]};
const tl=(L,y)=>{let v=L[0][1];for(const e of L)if(y>=e[0])v=e[1];return v};
const langOf=(s,y)=>tl(LANGS[s.k]||LANG[s.c]||LANG.af,y),faithOf=(s,y)=>tl(FAITHS[s.k]||FAITH[s.c]||FAITH.af,y);
// ---- personalities & leaders ----
const TRAITS=['brave','curious','kind','ambitious','patient','stubborn','creative','shy','cheerful','wise','restless','loyal'];
function leaderTitle(s,a){const t=sT(s),Y=simY,F=a.sx==='F';if(t<=1)return 'band elder';if(t===2)return F?'chieftess':'chief';
 if(s.k==='cairo'&&Y>-3100&&Y<-30)return 'pharaoh';if(s.k==='tenochtitlan'&&Y<1521)return 'tlatoani';if(s.k==='cusco'&&Y>1438&&Y<1533)return 'Sapa Inca';if(['xian','beijing'].includes(s.k)&&Y>-221&&Y<1912)return F?'empress':'emperor';if(s.k==='rome'&&Y>-509&&Y<-27)return 'consul';if(s.k==='rome'&&Y>=-27&&Y<476)return F?'empress':'emperor';if(['athens'].includes(s.k)&&Y>-508&&Y<-322)return 'elected archon';if(s.k==='tokyo'&&Y>1603&&Y<1868)return 'shogun';if(s.k==='kyoto'&&Y>600&&Y<1868)return F?'empress':'emperor';
 if(t>=6||(Y>1800&&['nyc','la','paris'].includes(s.k)))return 'mayor';if(t===5&&COLC.has(s.c))return 'governor';return F?'queen':'king'}
const hereditary=s=>{const t=sT(s);return t>=3&&t<=5&&!['nap','aus','arc'].includes(s.c)&&!(s.k==='rome'&&simY>-509&&simY<-27)&&!(s.k==='athens'&&simY>-508&&simY<-322)};
function leaders(s,l,Y,instant){const cur=AM.get(s.lead);if(cur&&cur.s===s.i&&!cur.dead&&Y-cur.b<80&&!(sT(s)>=6&&Y-s.leadY>8))return;
 let next=null;if(cur&&hereditary(s)){next=cur.k.map(i=>AM.get(i)).filter(x=>x&&!x.dead&&x.s===s.i&&Y-x.b>=16).sort((a,b)=>a.b-b.b)[0]}
 if(!next&&s.lead&&!cur&&hereditary(s)){const d=D.get(s.lead);if(d)next=(d.k||[]).map(i=>AM.get(i)).filter(x=>x&&x.s===s.i&&Y-x.b>=16).sort((a,b)=>a.b-b.b)[0]}
 if(!next){const c=l.filter(a=>!a.dead&&Y-a.b>=25&&Y-a.b<70);if(!c.length)return;next=c.sort((a,b)=>sc(b)-sc(a))[0]}
 function sc(a){return(Y-a.b)*.3+(a.tr2||[]).filter(x=>x==='ambitious'||x==='wise'||x==='brave').length*8+(a.sk||0)*.1+rnd()*6}
 const inherit=cur&&next&&(next.mo===cur.id||next.fa===cur.id);s.lead=next.id;s.leadY=Y;if(!inherit||!s.dyn)s.dyn=next.n;const tt=leaderTitle(s,next);
 lifeEv(next,`Became ${tt} of ${nameAt(s,Y)}`);if(!instant&&sT(s)>=3)addEv(Y,`${next.n} becomes ${tt} of ${nameAt(s,Y)}${hereditary(s)?` (${s.dyn} dynasty)`:''}`,s.k,nearCam(s))}
function skillWord(v){return v>=80?'master':v>=55?'expert':v>=30?'skilled':v>=12?'apprentice':'novice'}
function moodOf(a){const s=S[a.s],cap=capRaw(s)*capF;let m=0;if(a.ill)m-=2;if(s.pop>cap*1.05)m-=2;if(AM.has(a.p))m+=1;if((a.k||[]).some(i=>AM.has(i)))m+=1;if((a.tr2||[]).includes('cheerful'))m+=1;if(a.fr&&a.fr.length>1)m+=1;if(s.mu>simY)m-=1;return m>=2?'content':m>=0?'getting by':m>=-2?'struggling':'desperate'}
// ================== people ==================
let A=[],AM=new Map(),D=new Map(),NID=1,simY=-230e6,EV=[],discI=0,followId=0,selId=0,started=0;const live=true,tlSpeed=1;
const skinCol=v=>{const st=[[0,0x3b2417],[.35,0x8d5a3b],[.65,0xc89a72],[1,0xf1cfb4]];for(let i=1;i<st.length;i++)if(v<=st[i][0]){const a=new THREE.Color(st[i-1][1]),b=new THREE.Color(st[i][1]);return a.lerp(b,(v-st[i-1][0])/(st[i][0]-st[i-1][0]))}return new THREE.Color(st[3][1])};
function nameFor(s,sx){const t=Math.max(0,s.tier<0?(s.rt||0):s.tier);
 if(t>=5){const L=MN[s.nm]||MN.eu;return pick(L[sx==='F'?0:1])}
 const sy=CS[s.c]||CS.af;let n='';const k=2+(rnd()<.35?1:0);for(let i=0;i<k;i++)n+=pick(sy);
 if(s.c==='mes'&&rnd()<.35)n+=pick(['tl','tzin','coatl']);n=n.replace(/(.)\1\1/g,'$1$1');return n[0].toUpperCase()+n.slice(1)}
const jobsFor=(s,t)=>(CJ[s.c]&&CJ[s.c][t])||J[t];
function clothFor(s,t){if(t<=1)return pick(s.c==='arc'||((s.c==='eu'||s.c==='st'||s.c==='eun')&&simY<-12000)?CL.fur:CL.hide);if(t<=4)return pick(s.c==='cn'||s.c==='jp'?CL.cn:['mes','and','pol','af','in'].includes(s.c)?CL.anc.concat(CL.bright):CL.anc);return pick(CL['e'+t])}
const ageOf=a=>simY-a.b;
const sT=s=>Math.max(0,s.tier<0?(s.rt||0):s.tier);
function lifeEv(a,txt){a.ev.push([Math.floor(simY),txt]);if(a.ev.length>14)a.ev.shift();if(a.id===followId&&!quiet)toast(`<b>${esc(a.n)}</b>: ${esc(txt)}`)}
function setJob(a,s,q){const t=sT(s),age=ageOf(a);let j;
 if(age<14)j=['child','kid','toys of wood, bone or plastic'];else if(age>=(t>=6?66:55))j=[t>=6?'retired':'elder','elder',t>=6?'reading glasses':'walking staff'];else j=pick(jobsFor(s,t));
 a.jtr=t;if(a.j!==j[0]){const had=a.j;a.j=j[0];a.jc=j[1];a.tl=j[2];if(had&&!q&&j[0]!=='child'&&j[0]!==had)lifeEv(a,`Became ${art(j[0])} ${j[0]}`)}else{a.jc=j[1];a.tl=j[2]}
 a.cl=clothFor(s,t)}
function mkAgent(o){const a={id:NID++,n:o.n,sx:o.sx,b:o.b,s:o.s,p:0,mo:o.mo||0,fa:o.fa||0,k:[],fr:[],j:'',jc:'',tl:'',jtr:-1,skin:o.skin,cl:0x7a5a3a,ev:[],lb:-1e9,sk:0,tr2:(()=>{const P_=[AM.get(o.mo),AM.get(o.fa)].filter(Boolean).flatMap(x=>x.tr2||[]);const r=[];while(r.length<2){const t=P_.length&&rnd()<.4?pick(P_):pick(TRAITS);if(!r.includes(t))r.push(t)}return r})()};A.push(a);AM.set(a.id,a);initVis(a);return a}
function initVis(a){const s=S[a.s],r=(s.rad||.2)*Math.sqrt(rnd()),an=rnd()*6.28;a.x=Math.cos(an)*r;a.z=Math.sin(an)*r;a.y=0;a.tx=a.x;a.tz=a.z;a.ty=0;a.w=rnd()*4;a.h=rnd()*6.28;a.hb=rnd()*6.28;a.hid=false;a.tr=null;a.mv=0}
const skinT=s=>clamp(SKT[s.c]+(rnd()-.5)*.08,0,1);
function genPop(s,n,Y){const made=[];let g=0;while(made.length<n&&g++<300){
  const ma=17+rnd()*25,mom=mkAgent({sx:'F',b:Y-ma,s:s.i,n:nameFor(s,'F'),skin:skinT(s)}),dad=mkAgent({sx:'M',b:Y-ma-rnd()*7,s:s.i,n:nameFor(s,'M'),skin:skinT(s)});
  mom.p=dad.id;dad.p=mom.id;made.push(mom,dad);const nk=Math.floor(rnd()*Math.min(5,(ma-16)/2.5));
  for(let i=0;i<nk;i++){const age=rnd()*Math.min(ma-16,17),c=mkAgent({sx:rnd()<.5?'F':'M',b:Y-age,s:s.i,mo:mom.id,fa:dad.id,n:nameFor(s,rnd()<.5?'F':'M'),skin:(mom.skin+dad.skin)/2});mom.k.push(c.id);dad.k.push(c.id);made.push(c)}
  if(rnd()<.18){made.push(mkAgent({sx:rnd()<.6?'F':'M',b:Y-52-rnd()*18,s:s.i,n:nameFor(s,'F'),skin:skinT(s)}))}}
 for(const a of made){a.n=nameFor(s,a.sx);setJob(a,s,true);a.ev.push([Math.floor(a.b),`Born in ${nameAt(s,a.b)}`])}
 for(const a of made)if(a.p){const p=AM.get(a.p);if(p&&!a.ev.some(e=>e[1].includes(p.n)))a.ev.push([Math.floor(Math.max(a.b,p.b)+18),(sT(s)<=1?'Bonded with ':'Married ')+p.n])}
 return made}
// ---- infectious diseases: [name, cultures(null=all), from, to, minTier, case fatality, spread, years ill, tropicsOnly]
const DIS=[['influenza',null,-3000,1e9,2,.004,.9,.05],['the common cold',null,-1e9,1e9,0,0,1.2,.03],['malaria',['af','in','sea','amz','mes','eg'],-8000,1e9,0,.03,.5,.2],['dysentery',null,-1e9,1950,2,.04,.6,.08],['measles',['me','eg','in','cn','eu','eun','st','jp','sea','af'],-500,1e9,4,.02,1.3,.05],['measles',['nap','nae','nasw','mes','and','amz','pol','aus','arc'],1520,1e9,0,.2,1.4,.05],['smallpox',['me','eg','in','cn','eu','eun','st','jp','sea','af'],-1000,1980,3,.3,1,.08],['smallpox',['nap','nae','nasw','mes','and','amz','pol','aus','arc'],1520,1980,0,.6,1.2,.08],['tuberculosis',null,-3000,1e9,3,.15,.25,1.5],['cholera',null,1817,1e9,5,.3,.9,.03],['yellow fever',['mes','and','amz','nae','af'],1648,1e9,4,.2,.6,.05],['polio',null,1880,1990,6,.05,.6,.1],['HIV',['af'],1981,1e9,6,.6,.12,8],['COVID-19',null,2020,2023.5,6,.01,1.6,.05],['dengue',['sea','in','mes','amz','af'],1950,1e9,6,.01,.6,.04],['plague',['eu','eun','me','eg','cn','st'],1347,1352,3,.5,1.4,.05],['plague',['eu','me','eg'],541,549,3,.5,1.2,.05],['cocoliztli',['mes'],1545,1548,4,.6,1.2,.05]];
function cfrNow(d,Y,age){let f=d[5];if(Y>1940)f*=d[0]==='HIV'?(Y>2000?.15:1):.15;if(Y>1980)f*=.5;if(age<5||age>65)f*=2;return Math.min(.95,f)}
function diseases(s,l,dt,Y,instant){const t=sT(s);const ill=l.filter(a=>a.ill&&!a.dead);const pop=l.length||1;
 for(const d of DIS){if(Y<d[2]||Y>=d[3]||t<d[4]||(d[1]&&!d[1].includes(s.c)))continue;
  const n=ill.filter(a=>a.ill===d[0]).length,intro=(d[0]==='the common cold'?.6:d[0]==='malaria'?.3:.03)*dt,spread=d[6]*n/pop*dt*(t>=4?1.5:1)*(Y>1960&&['measles','smallpox','polio'].includes(d[0])?.05:1);
  if(n===0&&rnd()>intro)continue;
  for(const a of l){if(a.dead||a.ill||a.tr)continue;if(rnd()<(n?spread:.02)*(1+(a.imm&&a.imm.includes(d[0])?-1:0))){a.ill=d[0];a.illY=Y+d[7]*(.6+rnd()*.8);if(d[0]!=='the common cold')lifeEv(a,'Fell ill with '+d[0])}}
  if(n>pop*.25&&d[5]>.05&&!s.outbreakY||(s.outbreakY&&Y-s.outbreakY>5&&n>pop*.25&&d[5]>.05)){s.outbreakY=Y;addEv(Y,`${nameAt(s,Y)}: an outbreak of ${d[0]}`,s.k,!instant&&nearCam(s))}}
 for(const a of l){if(!a.ill||a.dead||Y<a.illY)continue;const d=DIS.find(x=>x[0]===a.ill);const age=Y-a.b;if(d&&rnd()<cfrNow(d,Y,age)){die(a,a.ill)}else{if(d&&d[0]!=='the common cold'){lifeEv(a,'Recovered from '+a.ill);a.imm=(a.imm||[]);if(!['influenza','malaria','dengue','the common cold'].includes(a.ill))a.imm.push(a.ill)}a.ill=null}}}
function mort(age,Y,s,pop,cap){const h=Y<1800?0:Math.pow(clamp((Y-1800)/220,0,1),.7);let q;
 if(age<1)q=lerp(.18,.004,h);else if(age<5)q=lerp(.03,.0004,h);else{let A0=lerp(.008,.0005,h);for(const e of EPI)if(Y>=e.a&&Y<e.b&&(!e.c||e.c.includes(s.c)))A0*=e.m;q=A0+lerp(6e-5,2e-5,h)*Math.exp(.088*age)}
 if(pop>cap*1.05)q+=(pop/cap-1.05)*.08;return Math.min(q,.95)}
function deathCause(a,age,s,Y){const t=sT(s);for(const e of EPI)if(Y>=e.a&&Y<e.b&&(!e.c||e.c.includes(s.c))&&rnd()<.6)return e.n;
 if(age<1)return pick(['a fever in infancy','an infection','a hard winter']);if(Y>2040&&age>60&&['af','in','me','sea','mes','eg'].includes(s.c)&&rnd()<.2)return 'a heatwave';if(age<10)return pick(['a fever','dysentery','an infection','a fall']);
 if(t<=1){if(a.jc==='hunt'&&rnd()<.4)return pick(Y<-10000?['a mammoth hunt gone wrong','a hunting accident','a wounded bison']:['a hunting accident','a predator attack']);return age>50?'old age':pick(['an infection','a fever','a fall','a predator','a hungry winter'])}
 if(t<=4)return age>55?'old age':pick(['a fever','an infection','a broken bone','dysentery','a winter illness']);
 if(t===5)return age>60?'old age':pick(['smallpox','tuberculosis','a fever','an accident']);
 if(t===6)return age>65?pick(['old age','heart failure','a stroke']):pick(['tuberculosis','an industrial accident','influenza','pneumonia']);
 return age>72?pick(['old age','heart disease','cancer','a stroke']):pick(['a car accident','cancer','heart disease'])}
let quiet=false;
function die(a,cause){a.dead=1;AM.delete(a.id);const s=S[a.s];
 D.set(a.id,{id:a.id,n:a.n,sx:a.sx,b:a.b,d:simY,c:cause,s:a.s,p:a.p,mo:a.mo,fa:a.fa,k:a.k.slice(),j:a.j});if(D.size>4000)D.delete(D.keys().next().value);
 const word=x=>x.sx==='F'?'mother':'father';
 const p=AM.get(a.p);if(p)lifeEv(p,`Lost their partner ${a.n}`);
 for(const id of a.k){const c=AM.get(id);if(c)lifeEv(c,`Lost their ${word(a)} ${a.n}`)}
 if(a.id===followId){const succ=a.k.map(i=>AM.get(i)).filter(Boolean).sort((x,y)=>x.b-y.b)[0]||p||A.find(x=>!x.dead&&x.s===a.s&&(x.mo===a.mo&&a.mo))||A.find(x=>!x.dead&&x.s===a.s);
  if(!quiet)toast(`<b>${esc(a.n)}</b> died at ${Math.floor(ageOf(a))} (${esc(cause)}).`+(succ?` Now following ${succ.mo===a.id||succ.fa===a.id?'their child':''} <b>${esc(succ.n)}</b>.`:''),7000);
  followId=succ?succ.id:0;if(selId===a.id)selId=followId;if($('shPerson').classList.contains('on'))showPerson(selId)}}
function capRaw(s){const t=sT(s);return s.k==='omo'&&t<=1?115:CAP[t]}
let capF=1;
function step(dt,instant){
 const Y=simY+dt;quiet=instant;
 // site tiers
 for(const s of S){const t=tierAt(s,Y);if(t!==s.tier){const old=s.tier;s.tier=t;if(t===-1)s.rt=ruinTier(s);onTier(s,old,t,Y,instant)}}
 // tally
 const by=new Map();for(const a of A){let l=by.get(a.s);if(!l)by.set(a.s,l=[]);l.push(a)}
 let tot=0;for(const s of S){s.pop=(by.get(s.i)||[]).length;if(s.pop||s.pend)tot+=capRaw(s)}capF=Math.min(1,MAXA/Math.max(1,tot));
 const fert=Y<1800?.3:Y<2000?lerp(.3,.075,clamp((Y-1850)/150,0,1)):lerp(.075,.062,clamp((Y-2000)/100,0,1)),spacing=Y<-9500?3:Y<1900?2:1.6;
 const born=[];
 for(const [si,l] of by){const s=S[si],cap=capRaw(s)*capF*(s.fu>Y?s.fm:1),pop=l.length,food=clamp(1.6-pop/cap,0,1.1),t=sT(s);
  if(s.tier===-1&&!s.pend){evacuate(s,l,instant);continue}
  localEvents(s,l,dt,Y,instant);diseases(s,l,dt,Y,instant);leaders(s,l,Y,instant);const smm=s.mu>Y?s.mm:1,sfm=s.fu>Y?s.fm:1;
  const singlesM=[];
  for(const a of l){if(a.dead)continue;const age=Y-a.b;
   const q=Math.min(.95,mort(age,Y,s,pop,cap)*(age>=5?smm:1));if(rnd()<1-Math.pow(1-q,dt)){die(a,deathCause(a,age,s,Y));continue}
   if(age>=14&&a.jc!=='kid'&&a.jc!=='elder')a.sk=Math.min(100,(a.sk||0)+dt*((a.tr2||[]).includes('creative')||(a.tr2||[]).includes('patient')?3:2));
   if((age>=14&&a.j==='child')||(age>=(t>=6?66:55)&&a.jc!=='elder')||a.jtr!==t)setJob(a,s,instant);
   if(a.sx==='M'&&age>=17&&age<60&&!AM.has(a.p))singlesM.push(a)}
  for(const a of l){if(a.dead)continue;const age=Y-a.b;
   if(a.sx==='F'&&age>=15&&age<46&&!AM.has(a.p)&&singlesM.length&&rnd()<1-Math.pow(.4,dt)){
    const c=singlesM.filter(m=>!m.dead&&!AM.has(m.p)&&(Y-m.b)-age>-5&&(Y-m.b)-age<15&&!(m.mo&&m.mo===a.mo)&&m.id!==a.fa);
    if(c.length){const m=pick(c);a.p=m.id;m.p=a.id;const w=t<=1?'Bonded with ':'Married ';lifeEv(a,w+m.n);lifeEv(m,w+a.n)}}
   const p=a.sx==='F'?AM.get(a.p):null;
   if(p&&p.s===a.s&&age>=16&&age<45&&Y-a.lb>spacing&&rnd()<1-Math.pow(1-fert*food,dt)){born.push([a,p])}
   if(age>=6&&a.fr.length<4&&rnd()<.15*dt){const f=pick(l);if(f&&f!==a&&!f.dead&&Math.abs(f.b-a.b)<9&&f.id!==a.p&&f.mo!==a.id&&a.mo!==f.id&&!a.fr.includes(f.id)&&!(a.mo&&a.mo===f.mo)){a.fr.push(f.id);f.fr.push(a.id);lifeEv(a,'Became friends with '+f.n);if(f.fr.length>5)f.fr.shift()}}}}
 for(const[m,f]of born){if(m.dead)continue;const s=S[m.s],sx=rnd()<.51?'M':'F';
  const c=mkAgent({sx,b:Y-rnd()*dt*.5,s:m.s,mo:m.id,fa:f.id,n:nameFor(s,sx),skin:clamp((m.skin+f.skin)/2+(SKT[s.c]-(m.skin+f.skin)/2)*.04+(rnd()-.5)*.03,0,1)});
  setJob(c,s,true);c.x=m.x;c.z=m.z;c.ev.push([Math.floor(Y),`Born in ${nameAt(s,Y)} to ${m.n} & ${f.n}`]);m.k.push(c.id);f.k.push(c.id);m.lb=Y;
  lifeEv(m,`Gave birth to ${sx==='F'?'a daughter':'a son'}, ${c.n}`);lifeEv(f,`Became father to ${c.n}`);
  if(rnd()<(Y<1900?.012:.0003))die(m,'complications in childbirth')}
 A=A.filter(a=>!a.dead);simY=Y;tradeStep(dt,Y,instant);
 migrations(Y,instant);
 while(discI<DISC.length&&DISC[discI][0]<=Y){const d=DISC[discI++];let t=d[1];if(!instant)playDisc(d[0],d[1],d[2]);const s=d[2]&&SK[d[2]];if(s&&s.pop>0&&d[0]>=-70000&&!t.startsWith('Projected')&&!t.startsWith('Speculative')){const c=A.filter(a=>a.s===s.i&&Y-a.b>16);if(c.length){const a=pick(c);lifeEv(a,'Was there: '+t);t+=` (${a.n} of ${nameAt(s,Y)} was there)`}}addEv(d[0],t,d[2],!instant)}
 quiet=false;colorsDirty=true}
const QUAKE=new Set(['istanbul','tokyo','kyoto','la','tehran','cusco','tenochtitlan','athens','rome','delhi','xian']);
function nearCam(s){return(s.U&&s.U.angleTo(cam.t)<.08&&cam.alt<15)||(followId&&AM.get(followId)&&AM.get(followId).s===s.i)}
function localEvents(s,l,dt,Y,instant){const t=sT(s),n=nameAt(s,Y),show=!instant&&nearCam(s);if(s.tier<0||!l.length)return;
 const ev=(txt,mm,fm,yrs)=>{if(mm){s.mm=mm;s.mu=Y+yrs}if(fm){s.fm=fm;s.fu=Y+yrs}addEv(Y,txt,s.k,show)};
 const r=p=>rnd()<1-Math.pow(1-p,dt);const dry=['af','me','eg','in','nasw','mes','aus','st'].includes(s.c);
 if(t>=2&&r(dry?.02:.01))ev(`${n}: drought withers the ${t>=6?'crops':'harvest'}`,1.3,.6,1+rnd()*2);
 else if(t>=2&&r(.025))ev(`${n}: a bumper harvest`,0,1.3,1);
 if(s.cd!==null&&r(.01+(Y>2035?.04:0)))ev(Y>2035?`${n}: rising seas and a storm surge flood the coast`:`${n}: floodwaters sweep through`,1.2,.85,1);
 if(t>=3&&r(.006))ev(`${n}: a fire sweeps through the ${t>=6?'district':'town'}`,1.15,.9,1);
 if(QUAKE.has(s.k)&&r(.006)){const M=Math.min(9.5,5+(-Math.log10(rnd()+1e-9)));if(M>=5.5){const big=M>=7,ts=s.cd!==null&&M>=7.5?Math.max(1,Math.round(Math.pow(10,.5*M-3.3))):0;
  ev(`${n}: a magnitude ${M.toFixed(1)} earthquake${ts?` and a ${ts} m tsunami`:''}${big?(t>=6?' topples buildings':' flattens homes'):' rattles the '+(t>=3?'city':'camp')}`,1+Math.max(0,M-6)*(t>=6?.12:.25)+(ts?.3:0),big?.85:.97,1);if(show){shake=Math.max(1,M-4.5);try{if(M>=6.5)quakeScene(s.U,{M,dur:40,fire:t>=3&&M>=7.5});if(ts)tsunami(s.U,ts,Math.min(25,4+ts))}catch(e){}}}}
 if(['plains','cahokia','nyc'].includes(s.k)&&t>=0&&r(.02))ev(`${n}: a tornado tears across the ${t>=5?'county':'plains'}`,1.05,.95,.1);
 if(['stockholm','moscow','kyiv','yakutsk','nuuk','fairbanks','ulaanbaatar'].includes(s.k)&&r(.03))ev(`${n}: a deadly blizzard`,1.1,.9,.2);

 if(t>=3&&t<7&&r(.006))ev(`${n}: sickness spreads through the ${t>=4?'city':'town'}`,2,0,1);
 if(t<=1&&r(.01))ev(`${n}: the herds move away; a hungry season`,1.2,.6,1);
 if(Y>2030&&['af','in','me','sea','mes','eg'].includes(s.c)&&r(.15))ev(`${n}: a record heatwave`,1.15,.9,.3);
 if(r(.04)){const ppl=l.filter(a=>!a.dead).slice(0,6);const w=t<=1?'a gathering with dancing and stories':t<=4?'a harvest festival':t<=6?'a fair in the square':'a street festival';for(const a of ppl)lifeEv(a,'Celebrated '+w);if(show)addEv(Y,`${n}: ${w}`,s.k,true)}
 if(t>=2&&t<7&&r(.008)){const nb=nearest(s,o=>o.pop>0&&o.tier>=1&&o!==s);if(nb&&nb.U.angleTo(s.U)<.25){const vic=l.filter(a=>!a.dead&&Y-a.b>16&&Y-a.b<45&&a.sx==='M').slice(0,1+(rnd()*3|0));for(const v of vic)die(v,t<=4?'a raid by people from '+nameAt(nb,Y):'fighting with '+nameAt(nb,Y));
   const txt=t<=2?`Raiders from ${nameAt(nb,Y)} attack ${n}`:t<=4?`War: ${nameAt(nb,Y)} attacks ${n}`:`Fighting breaks out between ${nameAt(nb,Y)} and ${n}`;for(const a of l)if(!a.dead&&rnd()<.3)lifeEv(a,'Lived through '+txt.toLowerCase().replace(/^war: /,'a war as '));addEv(Y,txt,s.k,show)}}}
// ---- trade: settlements trade with neighbours; goods raise food, ideas travel along the routes ----
let TRADE=[],tradeT=0,CARAV=[];
function tradeNet(Y){TRADE=[];const L=S.filter(s=>s.pop>0&&s.tier>=2&&s.U);for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j],d=a.U.angleTo(b.U)/DEG,t=Math.min(a.tier,b.tier),reach=t>=6?180:t>=5?(Y>1500?180:40):t>=4?28:t>=3?18:9;if(d>reach)continue;const sea=a.cd!==null&&b.cd!==null&&d>8;TRADE.push({a,b,sea,d})}}
function tradeStep(dt,Y,instant){if(Y<-9000)return;tradeT-=dt;if(tradeT>0)return;tradeT=10;tradeNet(Y);
 for(const r of TRADE){for(const s of[r.a,r.b]){if(!(s.fu>Y)||s.fm<1.1){s.fm=Math.max(s.fm&&s.fu>Y?s.fm:1,1.08);s.fu=Y+10}}
  if(rnd()<.05*Math.min(10,dt*10)){const from=rnd()<.5?r.a:r.b,to=from===r.a?r.b:r.a;const known=EV.slice(0,40).filter(e=>e.k===from.k&&e.y>Y-200&&!/abandoned|drought|flood|fire|sickness|outbreak|earthquake|tornado|blizzard|tsunami|raid|attack|war|fighting/i.test(e.t));
   if(known.length){const e=pick(known),c=A.filter(a=>a.s===to.i&&Y-a.b>16);if(c.length){const a=pick(c);lifeEv(a,`Heard from ${r.sea?'sailors':'traders'} of ${nameAt(from,Y)}: ${e.t.replace(/^.*?: /,'')}`)}}}}}
function updCaravans(dt){if(simY<-9000||!TRADE.length){CARAV.length=0;caravM.count=0;return}const want=Math.min(40,TRADE.length);while(CARAV.length<want){const r=pick(TRADE);CARAV.push({r,t:rnd(),d:rnd()<.5?1:-1})}
 const arr=caravM.instanceMatrix.array;let n=0;LCAR=[];for(const c of CARAV){const r=c.r;if(!r.a.U||!r.b.U||!TRADE.includes(r)){c.r=pick(TRADE);continue}if(r.a.U.angleTo(cam.t)>.2&&r.b.U.angleTo(cam.t)>.2&&cam.alt<20)continue;c.t+=dt/(r.d*6)*c.d;if(c.t>1||c.t<0){c.d*=-1;c.t=clamp(c.t,0,1)}
  const u=r.a.U.clone().lerp(r.b.U,c.t).normalize(),u2=r.a.U.clone().lerp(r.b.U,Math.min(1,c.t+.01)).normalize(),f=u2.sub(u).multiplyScalar(c.d);f.addScaledVector(u,-f.dot(u));if(f.lengthSq()<1e-12)continue;f.normalize();const h=hDir(u.x,u.y,u.z),sea=h<0,rr=R+Math.max(0,h)+.004;
  setInst(arr,n*16,u.x*rr,u.y*rr,u.z*rr,u.x,u.y,u.z,f.x,f.y,f.z,sea?1.6:1);_c.setHex(sea?0x6b4a2e:simY>1900?0x5a5a62:0xb08a5a);caravM.instanceColor.setXYZ(n,_c.r,_c.g,_c.b);
  LCAR.push([u.x*rr,u.y*rr,u.z*rr,sea?(simY>1850?'Cargo ship':'Trading ship'):simY>1910?'Freight trucks':['me','eg','st','af'].includes(r.a.c)&&simY<1900?'Camel caravan':simY<1830?'Trade caravan':'Freight train',`${nameAt(r.a,simY)} ↔ ${nameAt(r.b,simY)}`]);n++;if(n>=caravM.instanceMatrix.count)break}
 caravM.count=n;caravM.instanceMatrix.needsUpdate=caravM.instanceColor.needsUpdate=true}
let LCAR=[];
function onTier(s,old,t,Y,instant){if(old===-2&&t>=0)return;if(t<-1)return;const n=nameAt(s,Y);
 if(t===-1){addEv(Y,`${n}: abandoned`,s.k,!instant)}
 else if(old>=0&&t>old)addEv(Y,`${n} grows into ${art(TIERN[t])} ${TIERN[t].toLowerCase()}`,s.k,!instant&&t>=3);
 else if(old===-1&&t>=0)addEv(Y,`${n} is founded on the old site`,s.k,!instant);
 for(const a of A)if(a.s===s.i)setJob(a,s,true)}
function nearest(s,f){let best=null,bd=1e9;for(const o of S){if(o===s||!f(o))continue;const d=s.U?s.U.angleTo(o.U):1;if(d<bd){bd=d;best=o}}return best}
function travel(a,from,to,instant){const old=a.s;a.s=to.i;if(instant){initVis(a);return}a.tr={f:from.i,t:0,dur:clamp(from.U.angleTo(to.U)/DEG*1.3,25,150)/(live?1:Math.max(1,Math.sqrt(tlSpeed)/6)),off:(rnd()-.5)*.08,lag:rnd()*.04};to.pend++}
function migrations(Y,instant){
 for(const s of S){if(s.arr>Y||s.tier<0||s.pop>0||s.pend||hAt(s.lat,s.lon)<0)continue;
  const par=s.x.from&&SK[s.x.from].pop>=14?SK[s.x.from]:nearest(s,o=>o.pop>=16&&o.tier>=0);if(!par)continue;
  const pool=A.filter(a=>a.s===par.i&&!a.tr),grp=[];
  for(const a of pool){if(grp.length>=12)break;const age=Y-a.b;if(a.sx==='F'&&age>16&&age<38&&AM.has(a.p)){const p=AM.get(a.p);if(p.s===par.i&&!grp.includes(p)){grp.push(a,p);for(const k of a.k){const c=AM.get(k);if(c&&Y-c.b<12&&c.s===par.i&&grp.length<14)grp.push(c)}}}}
  if(grp.length<4||par.pop-grp.length<8)continue;
  for(const a of grp){travel(a,par,s,instant);lifeEv(a,`Left ${nameAt(par,Y)} with a band of ${grp.length} for ${nameAt(s,Y)}`)}
  par.pop-=grp.length;s.pop+=grp.length;
  addEv(Y,`A band of ${grp.length} sets out from ${nameAt(par,Y)} for ${nameAt(s,Y)}`,s.k,!instant&&!started);
  if(instant)addEv(Y,`${nameAt(s,Y)} is settled`,s.k,false)}}
function evacuate(s,l,instant){const d=nearest(s,o=>o.tier>=0&&o.pop>0&&o!==s);if(!d){return}for(const a of l){travel(a,s,d,instant);lifeEv(a,`Left the abandoned ${nameAt(s,simY)} for ${nameAt(d,simY)}`)}addEv(simY,`Survivors from ${nameAt(s,simY)} resettle in ${nameAt(d,simY)}`,d.k,false)}
function addEv(y,t,k,show){EV.unshift({y,t,k});if(EV.length>400)EV.pop();if(show){toast(esc(t),5500,k);if(k&&SK[k]&&/raid|war\b|battle|attack|fighting|siege|invade|revolt|uprising/i.test(t)&&!/abandoned/i.test(t))try{localFight(SK[k],t)}catch(e){}
  if(k&&SK[k]&&SK[k].U&&!catching)try{const s=SK[k],U=s.U,T=tanOf(U),off=at(U,T,(rnd()-.5)*.15,(rnd()-.5)*.15).normalize();if(/tornado/i.test(t))tornado(off);else if(/blizzard/i.test(t))blizzard(U);else if(/floodwaters|flood/i.test(t))floodScene(U,{label:t.replace(/^.*?: /,'')});else if(/heatwave/i.test(t))heatwave(U);else if(/drought/i.test(t))famine(U,{label:t.replace(/^.*?: /,''),R:.5});else if(/fire sweeps/i.test(t))fireCity(U,{label:t.replace(/^.*?: /,''),r:.05,spd:300,dur:50});else if(/sickness spreads/i.test(t))sickScene(U,{label:t.replace(/^.*?: /,''),R:.4,cfr:.1})}catch(e){}}}
function regen(Y){A=[];AM.clear();D.clear();quiet=true;simY=Y;
 for(const s of S){s.tier=tierAt(s,Y);if(s.tier===-1)s.rt=ruinTier(s);frameSite(s);s.pop=0;s.pend=0}
 const live_=S.filter(s=>s.tier>=0&&hAt(s.lat,s.lon)>=0);let tot=0;for(const s of live_)tot+=capRaw(s);capF=Math.min(1,MAXA/tot);
 for(const s of live_)genPop(s,Math.max(10,Math.round(capRaw(s)*capF*.72)),Y);
 discI=0;while(discI<DISC.length&&DISC[discI][0]<=Y)discI++;
 EV=DISC.slice(0,discI).reverse().slice(0,60).map(d=>({y:d[0],t:d[1],k:d[2]}));quiet=false;colorsDirty=true}
function tally(){for(const s of S)s.pop=0;for(const a of A)if(!a.tr)S[a.s].pop++}
function genesis(){NID=Math.max(NID,1);A=[];AM.clear();D.clear();simY=-70000;for(const s of S){s.tier=tierAt(s,simY);frameSite(s);s.pop=0;s.pend=0}genPop(SK.omo,100,simY);A.length>100&&(A.length=100);AM.clear();A.forEach(a=>AM.set(a.id,a));discI=0;EV=[];colorsDirty=true}

