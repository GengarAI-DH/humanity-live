// ================== play as an animal: steer a real wild animal of this era and place, and live its day ==================
// It stays the same simulated animal: other animals still hunt, flee from or ignore it by the same sourced interaction rules.
let PLAY=null,PLAYC=null,PIN={x:0,y:0,run:false},PHUN=1,PT0=0,pKeys={};
function playable(a){return !!(a&&a.zo&&a.sp&&a.sp.hab==='l'&&!a.sp.hom&&!a.dom&&!a.dead&&WA.includes(a))}
function playAs(){const a=PLAYC;if(!playable(a))return toast('That animal has wandered off. Tap another one.');closeTip();closeSheets();PLAY=a;followAni=a;followId=null;cam.fly=null;cam.tour=false;
 const L=lenOf(a.type)||2;cam.alt=clamp(.18+L*.05,.22,1.6);PHUN=a.fed>simT()?1:.7;PT0=performance.now();a.prey=null;a.flee=null;a.sleep=false;
 document.body.classList.add('playing');playUI();track&&track('play_animal')}
function simT(){return performance.now()/1000}
function playStop(msg){if(!PLAY)return;const a=PLAY;PLAY=null;if(followAni===a)followAni=null;a.run=0;document.body.classList.remove('playing');const u=$('playUI');if(u)u.remove();if(msg)toast(msg,6000)}
function playUI(){let u=$('playUI');if(u)u.remove();u=document.createElement('div');u.id='playUI';const sp=PLAY.sp,pred=!!sp.pred;
 u.innerHTML=`<div class="pTop"><b>${esc(sp.n)}</b><span class="sm">${esc([dietOf(PLAY.type),sizeTxt(PLAY.type)].filter(Boolean).join(' · '))}</span>${eatsOf(PLAY.type)?`<span class="sm">${esc(eatsOf(PLAY.type).t)}</span>`:''}<div class="pBar"><i id="pHun"></i></div><span class="sm" id="pMsg">Hunger</span></div>
 <div id="pStick"><i></i></div><div class="pBtns"><button id="pEat">${pred?'🦷 Attack':'🌿 Graze'}</button><button id="pRun">🏃 Run</button><button id="pExit">✕ Stop</button></div>`;document.body.appendChild(u);
 const st=$('pStick'),kn=st.firstChild;let tid=null;const mv=(cx,cy)=>{const r=st.getBoundingClientRect(),dx=cx-(r.left+r.width/2),dy=cy-(r.top+r.height/2),m=Math.hypot(dx,dy),R0=r.width/2-14,k=m>R0?R0/m:1;kn.style.transform=`translate(${dx*k}px,${dy*k}px)`;PIN.x=dx*k/R0;PIN.y=-dy*k/R0};
 const end=()=>{tid=null;PIN.x=PIN.y=0;kn.style.transform=''};
 st.addEventListener('pointerdown',e=>{tid=e.pointerId;st.setPointerCapture(e.pointerId);mv(e.clientX,e.clientY);e.preventDefault();e.stopPropagation()});
 st.addEventListener('pointermove',e=>{if(e.pointerId===tid){mv(e.clientX,e.clientY);e.preventDefault()}});st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);
 $('pRun').onclick=()=>{PIN.run=!PIN.run;$('pRun').classList.toggle('on',PIN.run)};$('pExit').onclick=()=>playStop();$('pEat').onclick=playEat}
addEventListener('keydown',e=>{if(!PLAY||/INPUT|TEXTAREA/.test(document.activeElement&&document.activeElement.tagName))return;pKeys[e.key.toLowerCase()]=1;if(e.key===' '){playEat();e.preventDefault()}if(e.key==='Escape')playStop()});
addEventListener('keyup',e=>{pKeys[e.key.toLowerCase()]=0});
// turn the joystick (relative to the camera) into a target point in the animal's local ground frame
const _plF=new THREE.Vector3(),_plR=new THREE.Vector3(),_plU=new THREE.Vector3();
function playSteer(a,z,T){a.sleep=false;a.flee=null;a.prey=null;a.ixB=null;a.eat=a.eat>T&&a.pGraze?a.eat:0;
 let jx=PIN.x+(pKeys.d||pKeys.arrowright?1:0)-(pKeys.a||pKeys.arrowleft?1:0),jy=PIN.y+(pKeys.w||pKeys.arrowup?1:0)-(pKeys.s||pKeys.arrowdown?1:0);const m=Math.hypot(jx,jy);
 if(m<.15||a.eat>T){a.tx=a.x;a.tz=a.zz;a.w=.15;a.run=0;return}if(m>1){jx/=m;jy/=m}
 _plU.set(a.wx||z.o[0],a.wy||z.o[1],a.wz||z.o[2]).normalize();_plF.copy(cam.t).multiplyScalar(R).sub(camera.position);_plF.addScaledVector(_plU,-_plF.dot(_plU));if(_plF.lengthSq()<1e-9)_plF.set(z.so[0],z.so[1],z.so[2]);_plF.normalize();_plR.crossVectors(_plF,_plU);
 const wx=_plF.x*jy+_plR.x*jx,wy=_plF.y*jy+_plR.y*jx,wz=_plF.z*jy+_plR.z*jx,ex=wx*z.e[0]+wy*z.e[1]+wz*z.e[2],sz=wx*z.so[0]+wy*z.so[1]+wz*z.so[2],l=Math.hypot(ex,sz)||1;
 let tx=a.x+ex/l*.05,tz=a.zz+sz/l*.05;if(Math.hypot(tx,tz)>1.9){tx=a.x;tz=a.zz}
 const g=gY(z,tx,tz);if(g===null||gH(z,tx,tz)<0){a.tx=a.x;a.tz=a.zz;a.w=.15;$('pMsg')&&($('pMsg').textContent='Water ahead: this animal stays on land');return}
 a.tx=tx;a.tz=tz;a.ty=g;a.w=0;a.run=(PIN.run||pKeys.shift)&&PHUN>.08?1:0}
function playEat(){const a=PLAY;if(!a)return;const z=a.zo,T=performance.now()/1000;
 if(!a.sp.pred){a.eat=T+6;a.pGraze=1;PHUN=Math.min(1,PHUN+.25);return playMsg('Grazing…')}
 const L=lenOf(a.type)||2;let best=null,bd=.035;for(const b of WA){if(b===a||b.zo!==z||b.dead||b.sp.hab!=='l')continue;const d=Math.hypot(b.x-a.x,b.zz-a.zz);if(d<bd&&(lenOf(b.type)||1)<L*1.1){bd=d;best=b}}
 if(!best)return playMsg('Nothing close enough. Get right next to an animal smaller than you.');
 const df=typeof DEFEND==='function'&&DEFEND(best);if(df&&Math.random()<.6){a.hurt=T+8;best.fight=T+5;return playMsg(`The ${best.sp.n.toLowerCase()} fights back!`)}
 if(Math.random()<.45){best.dead=1;best.deadAt=T;best.respawn=T+90;a.eat=T+8;a.pGraze=1;a.fed=T+120;PHUN=1;return playMsg(`You caught ${art(best.sp.n)} ${best.sp.n.toLowerCase()}!`)}
 best.flee=a;best.w=0;playMsg(`The ${best.sp.n.toLowerCase()} got away. Chase it!`)}
function playMsg(t){const m=$('pMsg');if(m){m.textContent=t;clearTimeout(playMsg.t);playMsg.t=setTimeout(()=>{if($('pMsg'))$('pMsg').textContent='Hunger'},3500)}}
function updPlay(dt){if(!PLAY)return;const a=PLAY;if(a.dead){const k=WA.find(b=>b.eat>performance.now()/1000&&b.sp.pred&&b.zo===a.zo&&Math.hypot(b.x-a.x,b.zz-a.zz)<.05);return playStop(k?`Your ${a.sp.n.toLowerCase()} was caught by ${art(k.sp.n)} ${k.sp.n.toLowerCase()}. Nature is hard.`:`Your ${a.sp.n.toLowerCase()} didn't make it.`)}
 if(a.wx===undefined&&performance.now()-PT0>3000)return playStop('You wandered out of the area. Tap another animal to play again.');
 PHUN=Math.max(0,PHUN-dt/(a.run?150:300));const h=$('pHun');if(h){h.style.width=(PHUN*100).toFixed(1)+'%';h.style.background=PHUN<.25?'#ef5350':PHUN<.5?'#f5c542':'#4caf50'}
 if(PHUN<=0&&!playMsg.starve){playMsg.starve=1;playMsg(a.sp.pred?'Starving: you are too weak to run. Hunt!':'Starving: find a quiet spot and graze.')}if(PHUN>.1)playMsg.starve=0}
// earning: spotting animals, and being there when an event happens
let cSpotT=0;async function cardSpot(type){try{if(CARDS&&CME){const id='an-'+cslug(type)+'-'+cSeasonNow()[0];if(CARDS.by[id])cardFound(id)}}catch(e){}if(!LIVE||!CARDS||!CME||!CME.spotsLeft||performance.now()-cSpotT<4000)return;const se=cSeasonNow()[0],cid='an-'+cslug(type)+'-'+se;if(!CARDS.by[cid]||CME.cards[cid])return;cSpotT=performance.now();
 const r=await cApi('spot',{cid});if(r.ok){CME=r;if(r.got&&r.got.length)cNote(r.got[0],'You spotted a card')}}
function cNote(cid,what){$('cDot').classList.add('on');if(LS.get('hl_cpop')==='0')return;const c=CARDS.by[cid];if(!c)return;toast(`🃏 ${what}: <b>${esc(c[3])}</b> · ${C_RN[c[4]]} #${cSer(cid).toLocaleString('en-US')}<br><span class="sm">Tap to see it</span>`,4000,()=>cBig(cid))}
async function cardWitness(title){if(!LIVE)return;if(!CARDS)await cLoad();if(!CARDS)return;const cid='ev-'+cslug(title);if(!CARDS.by[cid]||(CME&&CME.cards[cid]))return;
 setTimeout(async()=>{const r=await cApi('witness',{cid});if(r.ok){CME=r;CFOUND[cid]=1;cSaveFound();cNote(cid,'You were there')}},8000)}

// ---- compact screen: details and extra buttons fold away ----
(function(){const hm=LS.get('hl_mini'),rm=LS.get('hl_rmini');document.body.classList.toggle('mini',hm===null?MOBILE:hm==='1');document.body.classList.toggle('rmini',rm===null?true:rm==='1');
 const sync=()=>{$('hudT').textContent=document.body.classList.contains('mini')?'▸':'▾';$('rotT').textContent=document.body.classList.contains('rmini')?'⋯':'×'};sync();
 $('hudT').onclick=e=>{e.stopPropagation();const on=!document.body.classList.contains('mini');document.body.classList.toggle('mini',on);LS.set('hl_mini',on?'1':'0');sync()};
 $('rotT').onclick=()=>{const on=!document.body.classList.contains('rmini');document.body.classList.toggle('rmini',on);LS.set('hl_rmini',on?'1':'0');sync()}})();
// ---- continent, ocean and region names when zoomed out, as they were at the time ----
let BIGL=[],bigEl=null;(async()=>{try{const j=await (await fetch('regions.json')).json();BIGL=j.labels||[]}catch(e){}})();
const _bl=new THREE.Vector3(),_bc=new THREE.Vector3();
function updBigLabels(){if(!bigEl){bigEl=document.createElement('div');bigEl.id='bigL';document.body.appendChild(bigEl)}
 const show=cam.alt>28&&BIGL.length&&!document.body.classList.contains('stream')&&LS.get('hl_bigl')!=='0';if(!show){if(bigEl.childElementCount)bigEl.innerHTML='';bigEl._k='';return}
 const op=Math.min(1,(cam.alt-28)/20),Y=simY,live=BIGL.filter(l=>Y>=l[3]&&Y<l[4]),key=live.map(l=>l[0]).join('|');
 if(bigEl._k!==key){bigEl._k=key;bigEl.innerHTML=live.map(l=>`<span class="${l[5]}" title="${esc(l[6]||'')}">${esc(l[0])}</span>`).join('')}
 _bc.copy(camera.position).normalize();const kids=bigEl.children;
 for(let i=0;i<live.length;i++){const l=live[i],el=kids[i];if(!el)continue;const p=Y<-5e6?paleoPos(l[1],l[2],Y):[l[1],l[2]],v=v3(p[0],p[1],R+1.5);_bl.copy(v).normalize();const f=_bl.dot(_bc);
  if(f<.25){el.style.opacity=0;continue}v.project(camera);el.style.left=((v.x+1)/2*innerWidth)+'px';el.style.top=((1-v.y)/2*innerHeight)+'px';el.style.opacity=(op*Math.min(1,(f-.25)/.25)).toFixed(2)}
 bigEl._live=live;const bx=[];for(const kd of 'cor')for(let i=0;i<live.length;i++){const el=kids[i];if(!el||live[i][5]!==kd||el.style.opacity==='0')continue;const r=el.getBoundingClientRect();if(bx.some(b=>r.left<b.right+6&&r.right>b.left-6&&r.top<b.bottom+2&&r.bottom>b.top-2)){el.style.opacity=0;continue}bx.push(r)}}
const LBLK={c:'Landmass',o:'Ocean or sea',r:'Region'};
function showRegion(l){const rows=[['What it is',LBLK[l[5]]||'Place'],['When',`${fmtY(Math.max(l[3],-71.25e6))} to ${l[4]>=2100?'today and beyond':fmtY(l[4])}`]];if(l[6])rows.push(['About',l[6]]);if(simY<-5e6)rows.push(['Today',placeName(v3(l[1],l[2],1))||'—']);showWikiThing(l[0],rows,l[7]||l[0]);
 const b=document.createElement('button');b.textContent='Fly closer';b.onclick=()=>{stopAuto();const p=simY<-5e6?paleoPos(l[1],l[2],simY):[l[1],l[2]];flyTo(v3(p[0],p[1],1),Math.max(8,cam.alt/3));closeSheets()};$('wiki').querySelector('.btns').prepend(b)}
function labelAt(x,y){const hit=el=>{const r=el.getBoundingClientRect();if(!r.width)return 1e9;const dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom);return dx*dx+dy*dy};
 if(bigEl&&bigEl._live&&cam.alt>28){let bl=null,bd=20*20;const k=bigEl.children;for(let i=0;i<k.length;i++){if(+k[i].style.opacity<.3)continue;const d=hit(k[i]);if(d<bd){bd=d;bl=bigEl._live[i]}}if(bl){showRegion(bl);return true}}
 for(const c in KLBL){const d=KLBL[c].d;if(d.style.display==='none')continue;if(hit(d)<16*16){const o=CC[c];showWikiThing(countryName(c,simY),[['What it is','A country'],['Continent',{AF:'Africa',AS:'Asia',EU:'Europe',NA:'North America',SA:'South America',OC:'Oceania',AN:'Antarctica'}[o.ct]||'—'],['Year',fmtY(Math.round(simY))]],countryName(c,simY));return true}}
 if(moon&&cam.alt>28){_v.copy(moon.position).project(camera);if(_v.z<1){const sx=(_v.x+1)/2*innerWidth,sy=(1-_v.y)/2*innerHeight,rr=Math.max(26,6.8/moon.position.distanceTo(camera.position)*innerHeight*1.1);if((sx-x)**2+(sy-y)**2<rr*rr){showWikiThing('The Moon',[['Distance','about 384,400 km (shown closer here so it fits on screen)'],['Size','3,474 km across, about a quarter of Earth'],['Orbit','once around Earth every 27.3 days; it sits where the real Moon is right now'],['Fact',simY<-5e6?'The Moon was a little closer back then: it drifts away about 3.8 cm a year':'The same side always faces Earth']],'Moon');return true}}
  const hitP=(v,rr)=>{if(!v||hidByEarth(v))return false;_v.copy(v).project(camera);if(_v.z>1)return false;return(((_v.x+1)/2*innerWidth)-x)**2+(((1-_v.y)/2*innerHeight)-y)**2<rr*rr};
  if(sunSpr&&hitP(sunSpr.position,40)){showWikiThing('The Sun',[['Distance','about 150 million km (light takes 8 minutes 20 seconds to reach Earth)'],['Size','109 times as wide as Earth'],['Where','Shown where the real Sun is right now; it lights the globe the same way'],['Fact',simY<-5e6?'The Sun was about 0.5% dimmer back then; stars slowly brighten as they age':'It holds 99.8% of all the mass in the solar system']],'Sun');return true}
  for(const k in PLAN){const P=PLAN[k];if(hitP(P.m.position,26)){showWikiThing(k,[['What it is','A planet, shown where it really is in the sky right now'],['Distance from Earth now',`about ${Math.round(P.au*149.6).toLocaleString('en-US')} million km`],['Fact',PLE[k][13]],['Note','Planets are drawn much brighter and closer than real so you can find them']],k==='Mercury'?'Mercury (planet)':k==='Venus'?'Venus':k==='Mars'?'Mars':k==='Jupiter'?'Jupiter':'Saturn');return true}}}
 return false}

// ---- settings ----
function openSettings(){const B=document.body.classList,rows=[
 ['Name tags','Labels on people, animals and places',()=>$('tags').classList.contains('on'),()=>$('tags').click()],
 ['Map names','Continent, ocean and region names when zoomed out',()=>LS.get('hl_bigl')!=='0',()=>LS.set('hl_bigl',LS.get('hl_bigl')==='0'?'1':'0')],
 ['Wildlife moments','A short note when an animal near you hunts or fights (at most every 90 s)',()=>LS.get('hl_wpop')!=='0',()=>LS.set('hl_wpop',LS.get('hl_wpop')==='0'?'1':'0')],
 ['Spin the globe','Earth slowly turns when zoomed out and nobody is touching it',()=>LS.get('hl_spin')!=='0',()=>LS.set('hl_spin',LS.get('hl_spin')==='0'?'1':'0')],
 ['Clouds','',()=>$('cld').classList.contains('on'),()=>$('cld').click()],
 ['Sound','Wind, sea, city sounds and music',()=>$('snd').textContent!=='🔇',()=>$('snd').click()],
 ['Battery saver','Simpler graphics so phones stay cool',()=>LITE,()=>{LITE=!LITE;LS.set('hl_lite',LITE?'1':'0');applyLite()}],
 ['Card pop-ups','Show a note when you find a new card',()=>LS.get('hl_cpop')!=='0',()=>LS.set('hl_cpop',LS.get('hl_cpop')==='0'?'1':'0')],
 ['Compact date panel','Hide the extra lines under the date',()=>B.contains('mini'),()=>$('hudT').click()],
 ['All side buttons','Show rotate, favorite, clouds and sound buttons',()=>!B.contains('rmini'),()=>$('rotT').click()],
 ['Temperature in °F','Off shows °C',()=>UNIT()==='F',()=>LS.set('hl_unit',UNIT()==='F'?'C':'F')]];
 $('setBody').innerHTML=rows.map((r,i)=>`<div class="setrow"><div>${esc(r[0])}${r[1]?`<span class="sm">${esc(r[1])}</span>`:''}</div><button data-i="${i}" class="${r[2]()?'on':''}">${r[2]()?'On':'Off'}</button></div>`).join('')+`<div class="btns" style="margin-top:12px"><button id="setTour">Show me around again</button>${LS.get('hl_admin')?'<button id="setTM">⏳ Time machine</button>':''}<button id="setPriv">Privacy</button></div><div class="sm" style="margin-top:10px"><a class="p" href="/privacy" target="_blank" rel="noopener">Privacy policy</a> · <a class="p" href="/terms" target="_blank" rel="noopener">Terms of use</a></div>`;
 $('setBody').querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{rows[+b.dataset.i][3]();setTimeout(openSettings,60)});$('setTour').onclick=()=>{closeSheets();runTour(0)};$('setPriv').onclick=showPrivacy;if($('setTM'))$('setTM').onclick=openTimeMachine;openSheet('shSet')}

// ---- share the exact view: a link that opens at this spot and height ----
function shareView(){const p=ll(cam.t.x,cam.t.y,cam.t.z),pl=placeName(cam.t)||'',url=`${SITE}/?v=${p[0].toFixed(3)},${p[1].toFixed(3)},${cam.alt.toFixed(2)}`,text=`${$('year').textContent}${pl?' · '+pl:''}, live in Humanity, Live`;
 track('share_view');if(navigator.share)navigator.share({title:'Humanity, Live',text,url}).catch(()=>{});else{try{navigator.clipboard.writeText(text+' '+url);toast('Link copied')}catch(e){toast(esc(url),8000)}}}
(function(){const m=/[?&]v=(-?[\d.]+),(-?[\d.]+),([\d.]+)/.exec(location.search);if(!m)return;const go=()=>{try{cam.t.copy(v3(+m[1],+m[2],1));cam.alt=Math.min(420,Math.max(.12,+m[3]));cam.fly=null}catch(e){}};setTimeout(go,1500);setTimeout(go,6000)})();
function updLive(dt){govern(dt);updRealWx(dt);fxCheck(dt);try{updWonders(dt)}catch(e){}updWxPill(dt);if(HEAT)HEAT.visible=cam.alt>15;updMusic(dt);director(dt);if(Math.random()<dt)checkBadges()}


