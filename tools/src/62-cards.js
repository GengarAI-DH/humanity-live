// ================== collectible cards: earned while each era plays, gone when its season ends, tradeable once signed in ==================
let CARDS=null,CME=null,CINFO=null,cTab='album',cOpen={},GSI=false;
const C_RC=['','#a3a3a3','#4caf50','#3b82f6','#a855f7','#f59e0b'],C_RN=['','Common','Uncommon','Rare','Epic','Legendary'];
const C_E={an:m=>({thero:'🦖',sauro:'🦕',cera:'🦕',stego:'🦕',ankylo:'🦕',spino:'🦖',ptero:'🪽',plesio:'🐉',fish:'🐟',whale:'🐋',swarm:'🐜',quad:'🦣',hum:'🧍'}[m]||'🐾'),pl:()=>'🌿',ev:()=>'💥',ms:()=>'📜',wo:()=>'🏛️',jr:()=>'🧭',ex:()=>'🪦',st:()=>'🌪️',lf:()=>'⛰️'};
const C_K={an:'Animal',pl:'Plant',ev:'Live event',ms:'Milestone',wo:'Wonder',jr:'Journey',ex:'Extinction',st:'Disaster',lf:'Landform',iv:'Invention'};
const cslug=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
function cKey(){let k=LS.get('hl_ck');if(!k||!/^[a-f0-9]{32}$/.test(k)){k=[...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,'0')).join('');LS.set('hl_ck',k)}return k}
async function cApi(op,body){const r=await fetch('/api/cards/'+op,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({k:cKey(),...body})}:{cache:'no-store'});return r.json()}
async function cLoad(){if(!LIVE)return;try{if(!CARDS){CARDS=await (await fetch('cards.json')).json();CARDS.by={};for(const c of CARDS.cards)CARDS.by[c[0]]=c}CINFO=await cApi('catalog');CME=await cApi('me',{});$('cDot').classList.toggle('on',!!(CME&&CME.daily))}catch(e){}}
function cSeason(id){return CARDS.seasons.find(s=>s[0]===id)}
function cSeasonNow(){const y=simY;for(const s of CARDS.seasons)if(y>=s[2]&&y<s[3])return s;return CARDS.seasons[CARDS.seasons.length-1]}
function cLeft(s){const d=dayAt(s[3])-curDay();if(d<=0)return'ended';if(d<1)return Math.max(1,Math.round(d*24))+' hours left';return Math.round(d)+' days left'}
const C_NE=[[/turtle|tortoise|stupendemys/i,'🐢'],[/croc|caiman|gharial|alligator|suchus|champso/i,'🐊'],[/frog|beelzebufo/i,'🐸'],[/snake|sanajeh|gigantophis/i,'🐍'],[/shark|otodus|megalodon/i,'🦈'],[/whale|cetus|dorudon/i,'🐋'],[/bird|ornis|condor|vegavis|kelenken|titanis|argentavis|pelagornis/i,'🦅'],[/ant\b|ants\b|termite/i,'🐜'],[/bee|wasp/i,'🐝'],[/moth|butterfl/i,'🦋'],[/beetle|cockroach|mantis|cicada|dragonfl|mosquito/i,'🪲'],[/mammoth|mastodon/i,'🦣'],[/rhino|teleoceras/i,'🦏'],[/\bcat\b|smilodon|\blion|hoplophoneus/i,'🐈'],[/dog|borophagus|epicyon|wolf|hyena/i,'🐺'],[/bear/i,'🐻'],[/rodent|beaver|squirrel|ischyromys|josephoartigasia|phoberomys/i,'🐀'],[/primate|purgatorius|notharctus|darwinius|\bape\b|homo|lucy/i,'🐒'],[/camel/i,'🐪'],[/horse/i,'🐎'],[/sloth/i,'🦥'],[/marsupial|wakaleo|nimbadon|diprot|kangaroo/i,'🦘'],[/hedgehog/i,'🦔'],[/platypus|obdurodon/i,'🦆'],[/mosasaur|plesiosaur|elasmo|aristonectes|kaikaifilu|prognathodon/i,'🐉'],[/pterosaur|quetzal|hatzegopteryx/i,'🪽']];
const cEmo=c=>{if(c[2]==='an'){for(const [r,e] of C_NE)if(r.test(c[3]))return e}return C_E[c[2]](c[8])};
const cSn=s=>s>=1e6?(s/1e6).toFixed(1)+'M':s>=1e4?Math.round(s/1e3)+'K':s.toLocaleString('en-US');
function cSer(cid){const a=CME&&CME.ser&&CME.ser[cid];return a&&a.length?a[0]:0}
function cTile(c,n,dl){const s=cSeason(c[1]),sn=n?cSer(c[0]):0,st=n?cState(c[0]):'';return`<div class="card r${c[4]}${n?'':' no'}${st==='done'?' done':st?' half':''}${dl!=null?' flip':''}" data-cid="${c[0]}" style="--rc:${C_RC[c[4]]};--sc:${s[5]}${dl!=null?';animation-delay:'+dl+'s':''}">${n>1?`<span class="q">×${n}</span>`:''}${sn?`<span class="sn">#${cSn(sn)}</span>`:''}${st==='done'?'<span class="ck">✓</span>':st==='quiz'?'<span class="ck">?</span>':''}<div class="e">${cEmo(c)}</div><div><div class="n">${esc(c[3])}</div><div class="r">${C_RN[c[4]]}</div></div></div>`}
function cBig(cid){const c=CARDS.by[cid];if(!c)return;const s=cSeason(c[1]),n=(CME&&CME.cards[cid])||0,st=n?cState(cid):'none',yr=c[5]<-1e6?(-c[5]/1e6).toFixed(1)+' million years ago':c[5]<-9999?Math.round(-c[5]).toLocaleString('en-US')+' years ago':c[5]<0?-c[5]+' BC':c[5]+'';
 const quest=st==='done'?'<div class="cqs ok">✓ Card complete</div>':st==='quiz'?'<div class="cqs">Found! Answer its questions to finish this card.</div>':st==='find'?`<div class="cqs">Half a card: ${cFindHint(c)}</div>`:'';
 const how=c[2]==='ev'?'Earned only by watching this event live.':['an','pl'].includes(c[2])?'Spot it: tap one in the world while its season is on, or find it in a pack.':'Found in packs while its season is on.';
 $('cardBig').querySelector('.inner').innerHTML=`<div class="card r${c[4]} flip" style="--rc:${C_RC[c[4]]};--sc:${s[5]}"><div class="r" style="text-align:left">${s[4]} ${esc(s[1])} · ${C_K[c[2]]}</div><div class="e">${cEmo(c)}</div><div><div class="n">${esc(c[3])}</div><div class="r">${C_RN[c[4]]} · ${yr}</div><div class="f">${esc(c[6]||'')}</div><div class="f" style="opacity:.7;margin-top:6px">${how}</div></div></div>${quest}
 <div class="btns">${st==='quiz'?'<button class="go" id="cbQuiz">Answer the questions</button>':''}${n?`<span class="sm">You have ${n} · serial ${CME.ser[cid].map(x=>'#'+x.toLocaleString('en-US')).join(', ')} of 71,250,000 · ${(CME.minted[cid]||n).toLocaleString('en-US')} found by everyone so far</span>`:'<span class="sm">Not collected yet</span>'}<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(c[7])}" target="_blank" rel="noopener">Wikipedia ↗</a>${n&&CME.signedIn?`<button id="cbTrade">Offer in a trade</button>`:''}</div>`;
 $('cardBig').classList.add('on');const qb=$('cbQuiz');if(qb)qb.onclick=()=>cQuiz(cid);const tb=$('cbTrade');if(tb)tb.onclick=()=>{$('cardBig').classList.remove('on');cTab='trade';cDraw(cid)}}
function cPack(got,title){const o=$('cardBig').querySelector('.inner');o.innerHTML=`<div class="n" style="font:800 20px Archivo;color:#fff;margin-bottom:10px">${esc(title)}</div><div class="cgrid" style="grid-template-columns:repeat(${Math.min(3,got.length)},1fr)">${got.map((id,i)=>{const c=CARDS.by[id];return c?cTile(c,1,i*.45):''}).join('')}</div><div class="btns"><button onclick="document.getElementById('cardBig').classList.remove('on')">Add to album</button></div>`;$('cardBig').classList.add('on');
 o.querySelectorAll('.card').forEach(el=>el.onclick=()=>cBig(el.dataset.cid));sfx&&sfx('pop')}
function sfx(){}
async function openCards(){openSheet('shCards');if(!LIVE){$('cardsBody').innerHTML=`<h2>Trading cards</h2><div class="sm">Collect and trade cards on the website: <a class="p" href="${SITE}" target="_blank" rel="noopener">${SITE.replace('https://','')}</a></div>`;return}
 $('cardsBody').innerHTML='<h2>Trading cards</h2><div class="sm">Loading…</div>';await cLoad();cDraw()}
function cDraw(preGive){if(!CARDS||!CME){$('cardsBody').innerHTML='<h2>Trading cards</h2><div class="sm">Cards are unavailable right now.</div>';return}
 const s=cSeasonNow(),mine=CME.cards,tot=CARDS.cards.filter(c=>c[1]===s[0]).length,have=CARDS.cards.filter(c=>c[1]===s[0]&&mine[c[0]]).length;
 let h=`<h2>Trading cards</h2><div class="cseason" style="background:linear-gradient(120deg,${s[5]},#120d0a)"><h3>${s[4]} ${esc(s[1])}</h3><div class="sm">This season's cards can only be earned while it lasts · <b>${cLeft(s)}</b></div><div class="sm">You have ${have} of ${tot}</div></div>
 <div class="cbtns"><button class="go" id="cDaily" ${CME.daily?'':'disabled'}>${CME.daily?'Open free daily pack':'Next free pack tomorrow'}</button><button id="cShop">Buy packs</button></div>
 <div class="sm">Spot animals: tap one in the world for a chance at its card (${CME.spotsLeft} tries left today). Event cards come only from watching the event live.</div>
 <div class="ctabs"><button data-t="album" class="${cTab==='album'?'on':''}">Album</button><button data-t="trade" class="${cTab==='trade'?'on':''}">Trade</button><button data-t="top" class="${cTab==='top'?'on':''}">Top</button><button data-t="acct" class="${cTab==='acct'?'on':''}">Account</button></div><div id="cPane"></div>
 <div class="sm" style="margin-top:12px;opacity:.75">Pack odds per card: Common 60% · Uncommon 25% · Rare 11% · Epic 3.5% · Legendary 0.5%. Ages 13+.</div>`;
 $('cardsBody').innerHTML=h;
 $('cDaily').onclick=async()=>{$('cDaily').disabled=true;const r=await cApi('daily',{});if(r.ok){CME=r;$('cDot').classList.remove('on');cPack(r.got,'Your daily pack');cDraw()}else{toast(esc(r.error||'Try again later'));cDraw()}};
 $('cShop').onclick=()=>toast(CINFO&&CINFO.shop?'Opening the shop…':'Card packs go on sale soon. For now, open your free pack every day.');
 $('cardsBody').querySelectorAll('.ctabs button').forEach(b=>b.onclick=()=>{cTab=b.dataset.t;cDraw()});
 const P=$('cPane');
 if(cTab==='album'){let a='';const cur=cSeasonNow()[0];for(const se of CARDS.seasons){const list=CARDS.cards.filter(c=>c[1]===se[0]),n=list.filter(c=>mine[c[0]]).length,past=se[3]<=simY,fut=se[2]>simY,open=cOpen[se[0]]??(se[0]===cur);
   a+=`<div class="csec" data-s="${se[0]}"><b>${se[4]} ${esc(se[1])}</b><span class="sm">${n}/${list.length} · ${past?'season over':fut?'coming later':'now'} ${open?'▾':'▸'}</span></div>`;
   if(open)a+=`<div class="cgrid">${list.sort((x,y)=>(mine[y[0]]?1:0)-(mine[x[0]]?1:0)||y[4]-x[4]).map(c=>cTile(c,mine[c[0]]||0)).join('')}</div>`}
  P.innerHTML=a;P.querySelectorAll('.csec').forEach(el=>el.onclick=()=>{const k=el.dataset.s;cOpen[k]=!(cOpen[k]??(k===cur));cDraw()});P.querySelectorAll('.card').forEach(el=>el.onclick=()=>cBig(el.dataset.cid))}
 else if(cTab==='top'){P.innerHTML='<div class="sm">Loading…</div>';cApi('top').then(r=>{if(!r||!r.ok){P.innerHTML='<div class="sm">Leaderboard unavailable.</div>';return}const nm=id=>CARDS.by[id]?esc(CARDS.by[id][3]):'?',s=cSeasonNow();
  const row=(i,a,b)=>`<div class="toff"><div style="width:22px;opacity:.7">${i}</div><div class="mid">${a}</div><div>${b}</div></div>`;
  let x=`<div class="sm" style="margin:6px 0">${(r.found&&r.found.n||0).toLocaleString('en-US')} cards found by everyone so far.</div><h3>${s[4]} Top collectors this season</h3>`+(r.season.length?r.season.map((e,i)=>row(i+1,esc(e.name),e.uniq+' cards')).join(''):'<div class="sm">Nobody yet. Open your free pack!</div>');
  x+='<h3>All-time collectors</h3>'+(r.all.length?r.all.map((e,i)=>row(i+1,esc(e.name),e.uniq+' kinds · '+e.total+' cards')).join(''):'<div class="sm">Nobody yet.</div>');
  x+='<h3>Lowest serial numbers</h3><div class="sm">Serials are random from 1 to 71,250,000, so low numbers are rare luck.</div>'+r.low.map((e,i)=>row(i+1,`${nm(e.cid)} · ${esc(e.name)}`,'#'+e.serial.toLocaleString('en-US'))).join('');
  x+='<h3>First to find</h3>'+r.first.map(e=>row('🥇',`${nm(e.cid)}`,esc(e.name))).join('');
  P.innerHTML=x})}
 else if(cTab==='trade'){P.innerHTML='<div class="sm">Loading trades…</div>';cApi('offers').then(r=>{const L=(r.offers||[]);const nm=id=>CARDS.by[id]?esc(CARDS.by[id][3]):'?';const rr=id=>CARDS.by[id]?`<span style="color:${C_RC[CARDS.by[id][4]]}">${C_RN[CARDS.by[id][4]]}</span>`:'';
   let x='';if(!CME.signedIn)x+=`<div class="sm" style="margin:6px 0">Sign in with Google (Account tab) to post and accept trades. Your cards stay safe even if you switch phones.</div>`;
   else{const own=Object.keys(mine).filter(k=>CARDS.by[k]).sort((a,b)=>CARDS.by[a][3].localeCompare(CARDS.by[b][3]));
    x+=`<h3>Post a trade</h3><select id="tGive"><option value="">Card you give…</option>${own.map(k=>`<option value="${k}" ${k===preGive?'selected':''}>${esc(CARDS.by[k][3])} (${C_RN[CARDS.by[k][4]]}, ×${mine[k]})</option>`).join('')}</select>
    <input id="tWantQ" placeholder="Search a card you want…" autocomplete="off"><select id="tWant"><option value="">Card you want…</option></select><div class="cbtns"><button class="go" id="tPost">Post trade</button></div>`}
   x+=`<h3>Open trades</h3>`+(L.length?L.map(o=>`<div class="toff"><div class="mid"><b>${esc(o.name||'Collector')}</b> gives ${nm(o.give)} ${rr(o.give)}<br>wants ${nm(o.want)} ${rr(o.want)}</div>${o.who===CME.id?`<button data-cancel="${o.id}">Cancel</button>`:CME.signedIn&&mine[o.want]?`<button data-acc="${o.id}">Trade</button>`:''}<button data-view="${o.give}">View</button></div>`).join(''):'<div class="sm">No open trades yet.</div>');
   P.innerHTML=x;
   const q=$('tWantQ');if(q){const fill=()=>{const v=q.value.trim().toLowerCase();const m=CARDS.cards.filter(c=>!v||c[3].toLowerCase().includes(v)).slice(0,60);$('tWant').innerHTML='<option value="">Card you want…</option>'+m.map(c=>`<option value="${c[0]}">${esc(c[3])} · ${C_RN[c[4]]} · ${esc(cSeason(c[1])[1])}</option>`).join('')};q.oninput=fill;fill();
    $('tPost').onclick=async()=>{const r=await cApi('offer',{give:$('tGive').value,want:$('tWant').value});if(r.ok){CME=r;toast('Trade posted');cDraw()}else toast(esc(r.error||'Could not post'))}}
   P.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=async()=>{const r=await cApi('cancel',{id:+b.dataset.cancel});if(r.ok){CME=r;cDraw()}else toast(esc(r.error))});
   P.querySelectorAll('[data-acc]').forEach(b=>b.onclick=async()=>{if(!confirm('Trade your card for theirs?'))return;const r=await cApi('accept',{id:+b.dataset.acc});if(r.ok){CME=r;cPack(r.got,'Trade complete!');cDraw()}else toast(esc(r.error))});
   P.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>cBig(b.dataset.view))})}
 else{P.innerHTML=`<div class="sm" style="margin:6px 0">Collector name (shown on your trades)</div><div class="row2"><input id="cName" maxlength="18" value="${esc(CME.name||LS.get('hl_name')||'')}" placeholder="Your name"><button id="cNameB">Save</button></div>
  ${CME.signedIn?`<div class="sm" style="margin:10px 0">Signed in with Google. Your cards are saved to your account on every device.</div><div class="cbtns"><button id="cOut">Sign out on this device</button></div>`:CINFO&&CINFO.googleClient?`<div class="sm" style="margin:10px 0">Sign in to save your cards to your account and to trade.</div><div id="gBtn"></div>`:`<div class="sm" style="margin:10px 0">Google sign-in is coming soon. Until then your cards are saved on this device.</div>`}`;
  $('cNameB').onclick=async()=>{const r=await cApi('name',{name:$('cName').value});if(r.ok){CME=r;toast('Saved')}else toast(esc(r.error))};
  const so=$('cOut');if(so)so.onclick=async()=>{const r=await cApi('signout',{});if(r.ok){CME=r;cDraw()}};
  if($('gBtn'))gsiButton($('gBtn'))}}
function gsiButton(el){const go=()=>{google.accounts.id.initialize({client_id:CINFO.googleClient,callback:async res=>{const r=await cApi('google',{cred:res.credential});if(r.ok){CME=r;toast('Signed in. Your cards are safe.');cDraw()}else toast(esc(r.error||'Sign-in failed'))}});google.accounts.id.renderButton(el,{theme:'filled_black',size:'large',shape:'pill',text:'signin_with'})};
 if(window.google&&google.accounts)return go();if(GSI)return;GSI=true;const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.onload=go;document.head.appendChild(s)}
// ---- finishing a card: the pack gives half; find the real thing in the world, then answer its questions ----
let CFOUND={};try{CFOUND=JSON.parse(LS.get('hl_cfound')||'{}')||{}}catch(e){}
function cSaveFound(){LS.set('hl_cfound',JSON.stringify(CFOUND))}
let cNameIx=null;const CQZ={};
function cByName(t){if(!CARDS||!CME)return null;if(!cNameIx){cNameIx={};for(const c of CARDS.cards)for(const k of new Set([c[3],c[7]]))if(k)(cNameIx[k]=cNameIx[k]||[]).push(c[0])}const L=cNameIx[t];if(!L)return null;return L.find(id=>CME.cards[id]&&!CME.done?.[id])||null}
// plants can't be tapped one by one yet, and an era that has ended can't be visited until open time travel, so those go straight to the questions
function cState(cid){if(!CME||!CME.cards[cid])return 'none';if(CME.done&&CME.done[cid])return 'done';const c=CARDS.by[cid];if(CFOUND[cid]||c[2]==='pl'||c[1]!==cSeasonNow()[0])return 'quiz';return 'find'}
function cFindHint(c){return c[2]==='an'?`find a living ${esc(c[3])} in the world and tap it.`:c[2]==='ev'?'be watching when it happens, or open it in the timeline.':'find it in the world or the timeline and open its info card.'}
function cardFound(cid){if(!CARDS||!CME||cState(cid)!=='find')return;CFOUND[cid]=1;cSaveFound();$('cDot').classList.add('on');if(LS.get('hl_cpop')==='0')return;const c=CARDS.by[cid];toast(`🔎 You found <b>${esc(c[3])}</b>! Answer its questions to finish the card.<br><span class="sm">Tap to start</span>`,5000,()=>cQuiz(cid))}
async function cQuiz(cid){const c=CARDS.by[cid];if(!c||cState(cid)!=='quiz')return cBig(cid);
 const wait=+(LS.get('hl_cqw_'+cid)||0)-Date.now();if(wait>0){toast(`Try ${esc(c[3])} again in ${Math.ceil(wait/60000)} min`);return}
 let Q=CQZ[c[1]];if(!Q){try{Q=CQZ[c[1]]=await (await fetch('quiz/'+c[1]+'.json')).json()}catch(e){toast('Questions are unavailable right now');return}}
 const fin=async()=>{const r=await cApi('done',{cid});if(r.ok){CME=r;toast(`🏅 <b>${esc(c[3])}</b> card complete!`);cBig(cid);try{cDraw()}catch(e){}}else toast(esc(r.error||'Try again'))};
 const qs=Q[cid];if(!qs||!qs.length)return fin();
 const o=$('cardBig').querySelector('.inner');let i=0;
 const step=()=>{const q=qs[i];o.innerHTML=`<div class="cquiz"><div class="sm">${cEmo(c)} ${esc(c[3])} · question ${i+1} of ${qs.length}</div><h3>${esc(q[0])}</h3>${q[1].map((a,j)=>`<button class="qa" data-j="${j}">${esc(a)}</button>`).join('')}<div class="btns"><button id="cqX">Close</button></div></div>`;$('cardBig').classList.add('on');
  $('cqX').onclick=()=>$('cardBig').classList.remove('on');
  o.querySelectorAll('.qa').forEach(b=>b.onclick=()=>{const j=+b.dataset.j;o.querySelectorAll('.qa').forEach(x=>{x.disabled=true;if(+x.dataset.j===q[2])x.classList.add('ok')});
   if(j!==q[2]){b.classList.add('bad');LS.set('hl_cqw_'+cid,String(Date.now()+5*60000));o.querySelector('.btns').insertAdjacentHTML('afterbegin','<div class="sm" style="width:100%">Not quite. The right answer is in green. You can try this card again in 5 minutes.</div>');return}
   i++;setTimeout(()=>i<qs.length?step():fin(),650)})};
 step()}
// keep the page itself at 100%: iOS Safari and Chrome ignore user-scalable=no, so a pinch could shrink the whole interface
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(e.touches.length>1&&!(e.target&&e.target.closest&&e.target.closest('.sheet,#cardBig,#wiki')))e.preventDefault()},{passive:false});
let _lastTap=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-_lastTap<300&&!(e.target&&e.target.closest&&(e.target.closest('input,textarea,button,a')&&!e.target.closest('#playUI'))))e.preventDefault();_lastTap=n},{passive:false});
// ---- one bottom bar (Explore, Time, Follow, Cards, More); the older buttons stay in the page, hidden, and do the work ----
(function(){const go=id=>{const b=$(id);if(b)b.click()};
 $('nExplore').onclick=()=>openSheet('shExplore');$('nTime').onclick=()=>go('bInfo');$('nFollow').onclick=()=>go('bFollow');$('nChat').onclick=()=>{$('nChatDot').classList.remove('on');go('pChat')};$('nMore').onclick=()=>{$('nDot').classList.remove('on');openSheet('shMore')};
 document.querySelector('#shExplore [data-home]').onclick=()=>openHome();document.querySelector('#shExplore [data-search]').onclick=()=>openSearch();document.querySelectorAll('#shExplore [data-go],#shMore [data-go]').forEach(b=>b.onclick=()=>{if(!b.dataset.keep)closeSheets();setTimeout(()=>go(b.dataset.go),b.dataset.keep?0:60)});
 $('live2').onclick=()=>go('pNow');
 setInterval(()=>{const w=$('pWatch'),t=w&&w.textContent.replace(/[^0-9]/g,'');$('live2T').textContent=LIVE?('Live'+(t?' · '+t+' watching':'')):'This device';const d=$('cDot');if(d&&d.classList.contains('on'))$('nDot').classList.add('on')},1500)})();
// ---- opening: tiny builders of the current era carry the interface into place, wave and leave (once per visit, tap to skip) ----
function builderKind(Y){return Y<-66.04e6?'raptor':Y<-2.6e6?'mammal':Y<-10000?'cave':Y<1500?'farmer':Y<1900?'worker':'modern'}
function builderSVG(k){const P={raptor:['#7a5c3a','#c9a46a'],mammal:['#6b5440','#a88b6a'],cave:['#8a6a4a','#5a3d24'],farmer:['#a8865a','#e6d3a8'],worker:['#3e4a5c','#5a3d24'],modern:['#2f6fb0','#f5c542']}[k],b=P[0],a=P[1];
 if(k==='raptor')return`<svg viewBox="0 0 40 26" width="60" height="39" aria-hidden="true"><path d="M4 14 Q14 9 22 11 L30 8 L36 9 L33 12 L27 13 Q24 17 20 17 L10 16 Z" fill="${b}"/><path d="M14 11 Q18 7 22 11" fill="${a}"/><circle cx="32" cy="9.5" r="0.9" fill="#111"/><g class="bl"><path d="M17 17 L15 25 M21 17 L23 25" stroke="${b}" stroke-width="2.2" stroke-linecap="round"/></g></svg>`;
 if(k==='mammal')return`<svg viewBox="0 0 34 24" width="50" height="35" aria-hidden="true"><ellipse cx="16" cy="13" rx="10" ry="6" fill="${b}"/><circle cx="27" cy="10" r="4.5" fill="${b}"/><path d="M6 12 Q0 6 3 2" stroke="${a}" stroke-width="2" fill="none"/><circle cx="28.5" cy="9" r="0.9" fill="#111"/><g class="bl"><path d="M10 18 L9 23 M21 18 L22 23" stroke="${b}" stroke-width="2.4" stroke-linecap="round"/></g></svg>`;
 const hat=k==='modern'?`<path d="M9 5 Q14 0 19 5 Z" fill="${a}"/><rect x="8" y="4.5" width="12" height="1.6" fill="${a}"/>`:k==='worker'?`<rect x="9" y="3" width="10" height="3" rx="1" fill="${a}"/>`:k==='farmer'?`<ellipse cx="14" cy="5" rx="7" ry="1.6" fill="${a}"/>`:'';
 const body=k==='cave'?`<path d="M9 12 L19 12 L20 22 L8 22 Z" fill="${b}"/><path d="M9 12 L20 22" stroke="${a}" stroke-width="1"/>`:`<rect x="9" y="12" width="10" height="10" rx="2.5" fill="${b}"/>`;
 return`<svg viewBox="0 0 28 34" width="32" height="39" aria-hidden="true"><circle cx="14" cy="8" r="4.2" fill="#e0b48a"/>${hat}${body}<g class="ba"><path d="M9 14 L5 9 M19 14 L23 9" stroke="#e0b48a" stroke-width="2.2" stroke-linecap="round"/></g><g class="bl"><path d="M12 22 L11 32 M16 22 L17 32" stroke="#3a2c20" stroke-width="2.4" stroke-linecap="round"/></g></svg>`}
const BLD_ROW={raptor:0,mammal:1,cave:2,farmer:3,worker:4,modern:5};let BLDIMG=null;
(()=>{if(window.__TEST)return;const i=new Image();i.onload=()=>{BLDIMG=i};i.src='/a/builders.webp'})();
function builderEl(k){const f=document.createElement('div');f.className='bF';if(BLDIMG){const H=k==='raptor'||k==='mammal'?44:58,s=H/160,r=BLD_ROW[k];f.classList.add('spr');f.style.cssText=`width:${(220*s)|0}px;height:${H}px;background:url(/a/builders.webp) no-repeat;background-size:${(440*s)|0}px ${(960*s)|0}px;--x0:0px;--x1:${-(220*s)|0}px;background-position:0 ${-(r*160*s)|0}px;--y:${-(r*160*s)|0}px;margin-left:${-(110*s)|0}px`}else f.innerHTML=builderSVG(k);return f}
let BUILT=false;
function builders(){if(BUILT||window.__TEST||PV!==null)return;BUILT=true;setTimeout(builders2,500)}
function builders2(){try{if(sessionStorage.getItem('hl_built'))return;sessionStorage.setItem('hl_built','1')}catch(e){}
 if(matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const k=builderKind(simY),T=[['yearbox',-1,-1],['live2',1,1],['nav2',1,1]].map(([id,dx,dy])=>[$(id),dx,dy]).filter(t=>t[0]&&t[0].getClientRects().length&&getComputedStyle(t[0]).display!=='none'),lay=document.createElement('div');lay.id='bld';document.body.appendChild(lay);
 const done=()=>{if(!lay.parentNode)return;for(const[el]of T){el.style.transition='';el.style.transform=''}lay.remove()};
 lay.addEventListener('pointerdown',done);
 T.forEach(([el,dx,dy],i)=>{const r=el.getBoundingClientRect(),off=`translate(${dx*(innerWidth*.7)}px,${dy*120}px)`;el.style.transition='none';el.style.transform=off;
  const n=k==='raptor'||k==='mammal'?2:3,crew=[];for(let j=0;j<n;j++){const f=builderEl(k);const x=r.left+(j+.5)/n*r.width,y=(dy>0?r.top:r.bottom)-(dy>0?24:0);f.style.left=x+'px';f.style.top=(dy>0?r.top-(f.style.height?parseInt(f.style.height)-4:38):r.bottom-8)+'px';f.style.transform=off+(dx>0?' scaleX(-1)':'');lay.appendChild(f);crew.push([f,dx])}
  setTimeout(()=>{el.style.transition='transform 1.1s cubic-bezier(.2,.8,.3,1)';el.style.transform='';crew.forEach(([f,d])=>{f.style.transition='transform 1.1s cubic-bezier(.2,.8,.3,1)';f.style.transform=d>0?'scaleX(-1)':''})},120+i*220);
  setTimeout(()=>crew.forEach(([f])=>f.classList.add('wave')),1300+i*220);
  setTimeout(()=>crew.forEach(([f,d])=>{f.classList.remove('wave');f.style.transition='transform .8s ease-in,opacity .8s';f.style.transform=`translate(${-d*(innerWidth*.8)||innerWidth*.8}px,0)`+(d>0?'':' scaleX(-1)');f.style.opacity='0'}),2200+i*220)});
 setTimeout(done,3900)}
// ---- My home: a pin on the user's town in every era (it rides the drifting continents in deep time), a timeline of what
// happened near it, and a quiet note when something happens there. Saved on this device only.
let HOME=null;try{HOME=JSON.parse(LS.get('hl_home')||'null')}catch(e){}
const kmBetween=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 12742*Math.asin(Math.sqrt(x))};
function homeSet(lat,lon,name){HOME={lat:+lat,lon:+lon,name:String(name||'My home').slice(0,60)};LS.set('hl_home',JSON.stringify(HOME));openHome();toast(`🏠 Home set: <b>${esc(HOME.name)}</b>`)}
function homeNear(km){if(!HOME)return[];const L=[];const seen=new Set();for(const t in EVLOC){const p=EVLOC[t];if(!p)continue;const d=kmBetween(HOME.lat,HOME.lon,p[0],p[1]);if(d>km)continue;const e=DISC.find(e=>e[1]===t)||BIG.find(b=>b.t===t||b[1]===t);const y=e?(e[0]!==undefined?e[0]:e.y):null;if(y==null||seen.has(t))continue;seen.add(t);L.push([y,t,Math.round(d)])}
 if(CITY){for(let i=0;i<CITY.n;i++){const fy=CITY.fy[i];if(fy!==fy)continue;const d=kmBetween(HOME.lat,HOME.lon,CITY.lat[i],CITY.lon[i]);if(d<=Math.min(km,60))L.push([fy,(CITY.fr[i]?'First record of ':'Founding of ')+CITY.name[i],Math.round(d)])}}
 return L.sort((a,b)=>a[0]-b[0])}
function openHome(){const B=$('homeBody');if(!HOME){B.innerHTML=`<h2>My home</h2><div class="sm">Pin your town to watch it change from the dinosaurs to 2100. It stays on this device.</div>
 <label class="sm" style="display:block;margin-top:12px">Your town or city<input id="homeQ" placeholder="Las Vegas" autocomplete="off" style="display:block;width:100%;margin-top:6px"></label><div id="homeHits" class="mlist" style="margin-top:8px"></div>
 <div class="btns" style="margin-top:10px"><button id="homeHere">Use where I'm looking</button></div>`;
 const q=$('homeQ'),hits=$('homeHits');q.oninput=()=>{const v=q.value.trim().toLowerCase();if(!CITY||v.length<2){hits.innerHTML=v.length>=2?'<div class="sm">City list still loading…</div>':'';return}const m=[];for(let i=0;i<CITY.n&&m.length<6;i++)if(CITY.name[i].toLowerCase().startsWith(v))m.push(i);
  hits.innerHTML=m.map(i=>`<button data-i="${i}"><b>${esc(CITY.name[i])}</b><span>${esc((CC[CITY.cc[i]]||{}).n||CITY.cc[i]||'')}</span></button>`).join('')||'<div class="sm">No match yet. Try the nearest bigger city, or use where you\'re looking.</div>';hits.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;homeSet(CITY.lat[i],CITY.lon[i],CITY.name[i])})};
 $('homeHere').onclick=()=>{const p=ll(cam.t.x,cam.t.y,cam.t.z);homeSet(p[0].toFixed(3),p[1].toFixed(3),placeName(cam.t)||'My spot')};openSheet('shHome');return}
 const L=homeNear(300),past=L.filter(e=>e[0]<=simY).slice(-12).reverse(),next=L.find(e=>e[0]>simY),pp=paleoPos(HOME.lat,HOME.lon,simY);
 const drift=simY<-5e6?`<div class="sm" style="margin:6px 0">Right now your spot sits at about ${Math.abs(pp[0]).toFixed(0)}°${pp[0]>=0?'N':'S'}, ${Math.abs(pp[1]).toFixed(0)}°${pp[1]>=0?'E':'W'}: the continent has drifted since.</div>`:'';
 B.innerHTML=`<h2>🏠 ${esc(HOME.name)}</h2>${drift}<div class="btns"><button class="go" id="homeGo">Go home</button><button id="homeChange">Change</button><button id="homeDel">Remove</button></div>
 ${next?`<h3>Next here</h3><div class="toff"><div class="mid">${esc(next[1])}<br><span class="sm">${esc(fmtY(next[0]))} · ${next[2]} km away</span></div></div>`:''}
 <h3>Already happened near you</h3>${past.length?past.map(e=>`<div class="toff"><div class="mid">${esc(e[1])}<br><span class="sm">${esc(fmtY(e[0]))} · ${e[2]} km away</span></div></div>`).join(''):'<div class="sm">Nothing recorded within 300 km yet in this era. Keep watching.</div>'}`;
 $('homeGo').onclick=()=>{closeSheets();const p=paleoPos(HOME.lat,HOME.lon,simY);flyTo(v3(p[0],p[1],1),2.5)};$('homeChange').onclick=()=>{HOME=null;openHome()};$('homeDel').onclick=()=>{HOME=null;LS.del('hl_home');closeSheets();toast('Home removed')};openSheet('shHome')}
let homeEl=null;const _hv=new THREE.Vector3();
function updHome(){if(!HOME){if(homeEl)homeEl.style.display='none';return}if(!homeEl){homeEl=document.createElement('div');homeEl.id='homePin';homeEl.innerHTML='<i></i><span>Home</span>';homeEl.onclick=()=>openHome();document.body.appendChild(homeEl)}
 const p=paleoPos(HOME.lat,HOME.lon,simY);_hv.copy(v3(p[0],p[1],R+Math.max(0,hAt(p[0],p[1]))+.06));const cp=camera.position;if((_hv.x-cp.x)*_hv.x+(_hv.y-cp.y)*_hv.y+(_hv.z-cp.z)*_hv.z>0||document.body.classList.contains('playing')){homeEl.style.display='none';return}
 _hv.project(camera);if(_hv.z>1||Math.abs(_hv.x)>1.05||Math.abs(_hv.y)>1.05){homeEl.style.display='none';return}homeEl.style.display='flex';homeEl.style.transform=`translate(${((_hv.x+1)/2*innerWidth)|0}px,${((1-_hv.y)/2*innerHeight)|0}px) translate(-50%,-100%)`}
function homeEvent(title){if(!HOME||!EVLOC[title])return;const p=EVLOC[title],d=kmBetween(HOME.lat,HOME.lon,p[0],p[1]);if(d<=300)toastW(`🏠 Near your home (${Math.round(d)} km): <b>${esc(title)}</b>`,5000)}
// ---- Search: animals, places, events and wonders; takes you to the right spot (fossil sites ride the drifting plates)
function srchAll(q){q=q.trim().toLowerCase();if(q.length<2)return[];const R_=[],Y=simY,has=t=>String(t).toLowerCase().includes(q);
 for(const k in SP){const v=SP[k];if(!has(v[0]))continue;const fr=v[4],to=v[5]||0,alive=Y>=-fr*1e6&&Y<=-to*1e6+1,live=WA.find(a=>a.type===k&&!a.dead&&a.zo&&a.zo.U),fs=FOSSIL[k]&&FOSSIL[k][0];
  R_.push({s:alive?(live?0:1):3,n:v[0],k:'Animal',w:`${fmtMa2(fr)} to ${to>0?fmtMa2(to):'today'}`+(alive?'':' · not alive in this era'),go:live?()=>{flyTo(live.zo.U,1.2);followAni=null;setTimeout(()=>toast(`Look for the <b>${esc(v[0])}</b> here`),2600)}:fs?()=>{const p=paleoPos(fs[0],fs[1],Y);flyTo(v3(p[0],p[1],1),3);setTimeout(()=>toast(`<b>${esc(v[0])}</b> fossils: ${esc(fs[2])}`),2600)}:null})}
 for(const d of DISC){if(!has(d[1]))continue;const p=EVLOC[d[1]];R_.push({s:d[0]<=Y?2:2.5,n:d[1],k:d[0]<=Y?'Happened':'Coming',w:fmtY(d[0]),go:p?()=>{const q2=paleoPos(p[0],p[1],Y);flyTo(v3(q2[0],q2[1],1),4)}:()=>showEvent(d[0],d[1])})}
 for(const b of BIG){const t=b.t||b[1],y=b.y!==undefined?b.y:b[0],la=b.lat!==undefined?b.lat:b[2],lo=b.lon!==undefined?b.lon:b[3];if(!has(t))continue;R_.push({s:y<=Y?2:2.5,n:t,k:y<=Y?'Happened':'Coming',w:fmtY(y),go:la!=null?()=>{const q2=paleoPos(la,lo,Y);flyTo(v3(q2[0],q2[1],1),6)}:null})}
 if(typeof WONDERS!=='undefined')for(const w of WONDERS){if(!has(w.n))continue;R_.push({s:w.y0<=Y?1.5:3,n:w.n,k:'Wonder',w:fmtY(w.y0),go:()=>flyTo(v3(w.lat,w.lon,1),.8)})}
 for(const l of BIGL){if(!has(l[0]))continue;const now=Y>=l[3]&&Y<l[4];R_.push({s:now?1:3,n:l[0],k:'Region',w:now?'Exists now':'Not in this era',go:now?()=>{const p=Y<-5e6?paleoPos(l[1],l[2],Y):[l[1],l[2]];flyTo(v3(p[0],p[1],1),40)}:null})}
 if(CITY){let c=0;for(let i=0;i<CITY.n&&c<6;i++){if(!CITY.name[i].toLowerCase().startsWith(q))continue;c++;R_.push({s:1.8,n:CITY.name[i],k:'Place',w:(CC[CITY.cc[i]]||{}).n||'',go:()=>{const p=paleoPos(CITY.lat[i],CITY.lon[i],Y);flyTo(v3(p[0],p[1],1),2.5)}})}}
 return R_.sort((a,b)=>a.s-b.s).slice(0,20)}
function fmtMa2(m){return m>=1?(+m.toFixed(1))+' million years ago':Math.round(m*1000).toLocaleString('en-US')+' thousand years ago'}
function openSearch(){openSheet('shSearch');const q=$('srchQ'),H=$('srchHits');q.value='';H.innerHTML='<div class="sm">Animals, places, events and wonders. Results this era come first.</div>';setTimeout(()=>{try{q.focus()}catch(e){}},250);
 q.oninput=()=>{const L=srchAll(q.value);H.innerHTML=L.length?L.map((r,i)=>`<button data-i="${i}" ${r.go?'':'disabled'}><b>${esc(r.n)}</b><span>${esc(r.k)} · ${esc(r.w)}</span></button>`).join(''):(q.value.trim().length>1?'<div class="sm">Nothing found. Try a shorter word.</div>':'');H.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{const r=L[+b.dataset.i];if(!r.go)return;closeSheets();cam.tour=false;r.go()})}}
