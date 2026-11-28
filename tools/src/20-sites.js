// ================== sites ==================
const S=SITES_RAW.map((r,i)=>{const s={i,k:r[0],names:r[1],lat:r[2],lon:r[3],c:r[4],arr:r[5],sch:r[6],lm:r[7]||[],x:r[8]||{},tier:-2,pop:0,built:null,bkey:'',homes:[],fields:[],work:[],rad:.2,pend:0};
 s.nm=s.x.nm||MK[s.c]||s.c;return s});
const SK={};S.forEach(s=>SK[s.k]=s);
const nameAt=(s,y)=>{let n=s.names[0][1];for(const e of s.names)if(y>=e[0])n=e[1];return n};
const tierAt=(s,y)=>{if(y<s.arr)return -2;let t=0;for(const e of s.sch)if(y>=e[0])t=e[1];if(t===7&&y>=2038+(s.i*7)%22)t=8;return t};
const ruinTier=s=>{let t=0;for(const e of s.sch)if(e[1]>=0&&e[0]<=simY)t=e[1];return t};
function frameSite(s){const u=v3(s.lat,s.lon,1),n=new THREE.Vector3(0,1,0).addScaledVector(u,-u.y).normalize(),e=new THREE.Vector3().crossVectors(n,u);
 s.U=u;s.E=e;s.So=n.clone().negate();s.hc=Math.max(hAt(s.lat,s.lon),.035);s.O=u.clone().multiplyScalar(R+s.hc);
 s.u=[u.x,u.y,u.z];s.e=[e.x,e.y,e.z];s.so=[s.So.x,s.So.y,s.So.z];s.o=[s.O.x,s.O.y,s.O.z];
 s.M=new THREE.Matrix4().makeBasis(s.E,s.U,s.So).setPosition(s.O);}
// wild places (no settlement tier) treat every painted lake and river as water, so trees don't grow in it and land animals walk around it;
// settlements keep building along their rivers as real towns do
let WMASK=null;function wetXYZ(X,Y,Z){if(!WMASK)return 0;const p=ll(X,Y,Z),x=((Math.floor((p[1]+180)/360*TW)%TW)+TW)%TW,y=clamp(Math.floor((90-p[0])/180*TH),0,TH-1);return WMASK[y*TW+x]}
function gH(s,x,z){const X=s.o[0]+s.e[0]*x+s.so[0]*z,Y=s.o[1]+s.e[1]*x+s.so[1]*z,Z=s.o[2]+s.e[2]*x+s.so[2]*z,h=hDir(X,Y,Z);return h>=0&&s.tier===undefined&&wetXYZ(X,Y,Z)?-.001:h}
function gY(s,x,z){const X=s.o[0]+s.e[0]*x+s.so[0]*z,Y=s.o[1]+s.e[1]*x+s.so[1]*z,Z=s.o[2]+s.e[2]*x+s.so[2]*z,l=Math.hypot(X,Y,Z),h=hDir(X,Y,Z);
 if(h<0||(s.tier===undefined&&wetXYZ(X,Y,Z)))return null;const r=R+h;return r*((X*s.u[0]+Y*s.u[1]+Z*s.u[2])/l)-(R+s.hc)}
function homeStyle(s,t){const c=s.c,col=(s.x.col||COLC.has(c))&&t>=5;
 if(t>=7)return'tower';if(t===6)return'brick';
 if(t===5)return col?'colonial':(c==='cn'||c==='jp'||c==='sea')?'eastern':(c==='me'||c==='eg'||c==='in')?'flatstone':'timber';
 if(t===4)return(c==='cn'||c==='jp'||c==='sea')?'eastern':(c==='me'||c==='eg'||c==='in'||c==='st')?'flatstone':c==='mes'?'adobe':c==='af'?'roundhut':c==='pol'?'fale':'stonegable';
 if(t===3)return({me:'mudbrick',eg:'mudbrick',in:'mudbrick',cn:'rammed',mes:'adobe',and:'stonegable',nae:'thatchsq',nasw:'pueblo',af:'roundhut',eu:'thatchsq',eun:'longhouse'})[c]||'mudbrick';
 if(t===2)return({me:'mudbrick',eg:'mudbrick',in:'mudbrick',cn:'pithouse',jp:'pithouse',sea:'stilt',eu:'longhouse',eun:'longhouse',nae:'barklong',nap:'tipi',nasw:'pueblo',mes:'adobe',and:'adobe',amz:'maloca',pol:'fale',af:'roundhut',st:'yurt',arc:'igloo',aus:'gunyah'})[c]||'roundhut';
 if(t===1)return c==='arc'?'igloo':c==='nap'?'tipi':c==='jp'?'pithouse':c==='me'?'roundhut':'mammoth';
 return c==='arc'?'igloo':c==='aus'?'gunyah':c==='nap'?'tipi':'leanto'}

// ---- site builder ----
let PL,BS,G=0,RF=1,RUIN=0,brng;
const _q=new THREE.Quaternion(),_ax=new THREE.Vector3(0,1,0),_s=new THREE.Vector3(),_p=new THREE.Vector3(),GRAY=new THREE.Color(0x8d8a84);
function vary(h,a){const c=new THREE.Color(h);c.offsetHSL((brng()-.5)*.02,(brng()-.5)*.08,(brng()-.5)*(a||.08));return c}
const _eu=new THREE.Euler();function P(type,x,dy,z,sx,sy,sz,ry,col,rz){if(RUIN){sy*=RF;dy*=RF}if(rz)_q.setFromEuler(_eu.set(0,ry||0,rz));else _q.setFromAxisAngle(_ax,ry||0);const m=new THREE.Matrix4().compose(_p.set(x,G+dy,z),_q,_s.set(sx,sy,sz));let c=col&&col.isColor?col:new THREE.Color(col);if(RUIN)c=c.clone().lerp(GRAY,.55);PL.push({g:BASE[type],m,c})}
function setG(x,z){const y=gY(BS,x,z);if(y===null)return false;G=y;return true}
function posts(x,z,w,d,h){for(const a of[-1,1])for(const b of[-1,1])P('cyl6',x+a*w,0,z+b*d,.004,h,.004,0,0x5a4630)}
function house(st,x,z,ry){if(!setG(x,z))return false;const k=.85+brng()*.35,s=BS;
 switch(st){
 case'leanto':P('cone',x,0,z,.045*k,.034*k,.045*k,ry,vary(0x7d6447));break;
 case'gunyah':P('prism',x,0,z,.05*k,.026*k,.035*k,ry,vary(0x6e5a44));break;
 case'mammoth':P('dome',x,0,z,.06*k,.032*k,.06*k,ry,vary(0x8c7b63));P('cyl6',x,.03*k,z,.006,.012,.006,0,0xe8e0cc);break;
 case'igloo':P('dome',x,0,z,.05*k,.028*k,.05*k,ry,0xeef3f6);break;
 case'tipi':P('cone',x,0,z,.045*k,.075*k,.045*k,ry,vary(0xd9c7a3));P('cone',x,.062*k,z,.012,.03,.012,ry,0x4a3a28);break;
 case'roundhut':P('cyl',x,0,z,.05*k,.024,.05*k,ry,vary(0xa47c52));P('cone',x,.024,z,.066*k,.034*k,.066*k,ry,vary(0xb89a5a));break;
 case'mudbrick':P('box',x,0,z,.05*k,.03,.045*k,ry,vary(0xc8a77a));if(brng()<.4)P('box',x+.008,.03,z,.028,.02,.026,ry,vary(0xc09e70));break;
 case'longhouse':case'barklong':{const c=st==='longhouse'?0x7b5b3a:0x6e5a44,rc=st==='longhouse'?0xa08a55:0x5d4d3c;P('box',x,0,z,.11*k,.024,.042,ry,vary(c));P('prism',x,.024,z,.115*k,.028,.048,ry,vary(rc));break}
 case'pueblo':P('box',x,0,z,.08,.026,.06,ry,vary(0xc49a6c));P('box',x-.01,.026,z+.006,.05,.024,.04,ry,vary(0xc8a070));if(brng()<.5)P('box',x-.016,.05,z+.01,.025,.02,.022,ry,vary(0xc49a6c));break;
 case'pithouse':P('cone',x,0,z,.065*k,.03*k,.065*k,ry,vary(0x9c8350));break;
 case'stilt':posts(x,z,.018,.014,.02);P('box',x,.02,z,.05,.018,.038,ry,vary(0x8a6a44));P('prism',x,.038,z,.058,.03,.046,ry,vary(0xa89060));break;
 case'fale':posts(x,z,.022,.016,.018);P('prism',x,.016,z,.062,.03,.05,ry,vary(0xa38a58));break;
 case'adobe':P('box',x,0,z,.046*k,.028,.04*k,ry,vary(s.c==='mes'?0xd9cbb4:0xc9a27c));break;
 case'maloca':P('dome',x,0,z,.1,.055,.1,ry,vary(0xa08850));break;
 case'yurt':P('cyl',x,0,z,.05*k,.022,.05*k,0,vary(0xe6e0d0));P('cone',x,.022,z,.053*k,.016,.053*k,0,vary(0xd8d0bc));break;
 case'rammed':P('box',x,0,z,.05,.03,.04,ry,vary(0xb59a74));P('prism',x,.03,z,.056,.022,.046,ry,vary(0x8f8064));break;
 case'thatchsq':P('box',x,0,z,.046,.026,.04,ry,vary(0xa88c62));P('prism',x,.026,z,.05,.026,.046,ry,vary(0xa89060));break;
 case'stonegable':{const an=s.c==='and';P('box',x,0,z,.052*k,.034,.045,ry,vary(an?0x8f877a:0xc9c0ae));P('prism',x,.034,z,.056*k,.026,.05,ry,vary(an?0x9c8350:s.c==='eun'?0x5a4a3a:0xa5523a));break}
 case'flatstone':{const h=.035+brng()*.02;P('box',x,0,z,.05*k,h,.05,ry,vary(0xdcceb2));if(brng()<.2)P('dome',x,h,z,.03,.02,.03,0,0xe8e0d0);break}
 case'eastern':P('box',x,0,z,.05*k,.03,.044,ry,vary(0x8a5a3c));P('prism',x,.03,z,.066*k,.026,.06,ry,vary(0x4a4f5a));break;
 case'timber':P('box',x,0,z,.046*k,.055,.04,ry,vary(0xe3d9c4));P('prism',x,.055,z,.05*k,.03,.044,ry,vary(0x5c3b2a));break;
 case'colonial':P('box',x,0,z,.05*k,.045,.045,ry,vary([0xe8d5b0,0xd7a77a,0xf0e6d2,0xc9d6c2,0xe0b8a0][(brng()*5)|0]));P('prism',x,.045,z,.054*k,.024,.05,ry,vary(0x8a4a35));break;
 case'brick':{const h=.06+brng()*.07;P('box',x,0,z,.06,h,.05,ry,vary(0x8b4a36));if(brng()<.3)P('box',x,h,z,.02,.02,.02,ry,0x5a3a2a);break}
 case'suburb':P('box',x,0,z,.05,.03,.045,ry,vary([0xe8e2d6,0xc9d1d6,0xd9c3a6,0xb5c4b1][(brng()*4)|0]));P('prism',x,.03,z,.055,.022,.05,ry,vary(0x5b5e66));break;
 }return true}
const CROP={me:[0xc8b061,0x8aa04e],eg:[0xc8b061,0x6f9a48],in:[0xb9ab5a,0x7d9a48],eu:[0xc8b061,0x7d9a4a],eun:[0xb8a25a,0x6f8f48],st:[0xbfae6a,0x8a9a58],af:[0xa8a05a,0x7a8f45],cn:[0x6fa65a,0x5f8f9a],jp:[0x6fa65a,0x5f8f9a],sea:[0x6fa65a,0x5f8f9a],mes:[0x9aa84c,0x7f9a44],nae:[0x9aa84c,0x7f9a44],nasw:[0xa8a050,0x8f9a4c],nap:[0x9aa84c,0xb8a85a],and:[0x7a9450,0x8aa058],amz:[0x6c8f45,0x7a9a4a],pol:[0x5f8a4a,0x6f9a50],aus:[0xa8a05a,0x8a9a58],arc:[0x8a9a58,0x8a9a58]};
// landmarks: each returns nothing, places prims; offsets are local (x east, z south)
function LM(type,s,t){const Rd=s.rad,ok=(x,z)=>setG(x,z);
 switch(type){
 case'pyramids':{const P3=[[-Rd-.38,.05,.3,.19],[-Rd-.62,.28,.28,.18],[-Rd-.8,.48,.15,.09]];for(const p of P3)if(ok(p[0],p[1])){P('pyr',p[0],-.005,p[1],p[2],p[3],p[2],0,0xd8c08a)}if(ok(-Rd-.3,-.22))P('box',-Rd-.3,0,-.22,.04,.018,.012,0,0xc8b07a);break}
 case'ziggurat':if(ok(.02,-.04)){P('box',.02,0,-.04,.2,.05,.15,0,0xb8936a);P('box',.02,.05,-.04,.14,.04,.1,0,0xb08a60);P('box',.02,.09,-.04,.08,.035,.06,0,0xa8825a);P('box',.02,0,.05,.03,.06,.06,0,0xa8825a)}break;
 case'tower':if(ok(-.07,.02))P('cyl',-.07,0,.02,.04,.05,.04,0,0xa89a84);break;
 case'gobekli':if(ok(0,0)){for(let i=0;i<12;i++){const a=i/12*6.28,x=Math.cos(a)*.07,z=Math.sin(a)*.07;P('box',x,0,z,.008,.035,.016,-a,0xcfc2a4);P('box',x,.035,z,.022,.006,.016,-a,0xcfc2a4)}P('box',-.012,0,0,.01,.05,.02,0,0xd8ccae);P('box',.012,0,0,.01,.05,.02,0,0xd8ccae)}break;
 case'mosque':case'mosque_mud':case'hagia':{const mud=type==='mosque_mud',x=.05,z=-.05;if(!ok(x,z))break;const c=mud?0xb5895a:0xe6dcc6;P('box',x,0,z,.14,.05,.12,0,c);
  if(!mud)P('dome',x,.05,z,type==='hagia'?.11:.08,type==='hagia'?.07:.06,type==='hagia'?.11:.08,0,type==='hagia'?0x9aa4a0:0x3f7f8f);
  if(mud){P('box',x+.05,0,z,.03,.11,.03,0,0xa87d50);P('pyr',x+.05,.11,z,.02,.02,.02,0,0xa87d50)}
  else if(type!=='hagia'||simY>=1453){const mm=type==='hagia'?[[-1,-1],[1,-1],[-1,1],[1,1]]:[[1,1]];for(const m of mm){P('cyl',x+m[0]*.08,0,z+m[1]*.07,.012,.15,.012,0,0xeae4d6);P('cone',x+m[0]*.08,.15,z+m[1]*.07,.016,.03,.016,0,0x8a8f96)}}break}
 case'burj':if(ok(.12,.1)){let h=0;[[.07,.25],[.055,.25],[.04,.22],[.028,.18],[.016,.12]].forEach(p=>{P('cyl',.12,h,.1,p[0],p[1],p[0],0,0xc8d3dc);h+=p[1]});P('cone',.12,h,.1,.01,.12,.01,0,0xdde4ea)}break;
 case'bath':if(ok(.05,-.06)){P('box',.05,0,-.06,.2,.035,.15,0,0xb37c52);P('box',.04,.035,-.06,.06,.002,.04,0,0x4f8aa0);P('box',.1,.035,-.09,.05,.03,.04,0,0xa8704a)}break;
 case'qutub':if(ok(.1,-.08)){let h=0,w=.04;for(let i=0;i<5;i++){P('cyl',.1,h,-.08,w,.045,w,0,i%2?0xb06a44:0xa85d3a);h+=.045;w*=.85}}break;
 case'stupa':if(ok(-.1,.05)){P('cyl',-.1,0,.05,.13,.012,.13,0,0xd8d0c0);P('dome',-.1,.012,.05,.11,.06,.11,0,0xf0ece2);P('box',-.1,.068,.05,.02,.012,.02,0,0xc8b88a);P('cone',-.1,.08,.05,.012,.03,.012,0,0xc8a040)}break;
 case'pagoda':if(ok(.08,-.08)){let h=0,w=.07;for(let i=0;i<5;i++){P('box',.08,h,-.08,w,.03,w,0,0x7a3b2a);P('box',.08,h+.03,-.08,w*1.45,.006,w*1.45,0,0x3d3f46);h+=.036;w*=.85}P('cyl6',.08,h,-.08,.004,.04,.004,0,0xc8a040)}break;
 case'greatwall':{let tw=0;for(let i=0;i<18;i++){const x=-.8+i*.13,z=-Rd-.45+Math.sin(i*.9)*.12;if(!ok(x,z))continue;P('box',x,0,z,.14,.028,.022,Math.cos(i*.9)*.6,0x9a8f7a);if(i%4===0)P('box',x,0,z,.034,.05,.034,0,0x8f846f)}break}
 case'forbidden':{const cx=0,cz=.02;for(const[a,b,w,d]of[[0,-.15,.42,.02],[0,.15,.42,.02],[-.21,0,.02,.3],[.21,0,.02,.3]])if(ok(cx+a,cz+b))P('box',cx+a,0,cz+b,w,.03,d,0,0x8b2f2a);
  for(const z of[-.08,0,.08])if(ok(cx,cz+z)){P('box',cx,0,cz+z,.16,.03,.05,0,0x9b3a2a);P('prism',cx,.03,cz+z,.18,.025,.065,0,0xd4a017)}break}
 case'angkor':{const x=-.1-Rd,z=0;if(!ok(x,z))break;for(const[a,b,w,d]of[[0,-.26,.56,.04],[0,.26,.56,.04],[-.26,0,.04,.56],[.26,0,.04,.56]])P('box',x+a,-.004,z+b,w,.004,d,0,0x4f8aa0);
  P('box',x,0,z,.3,.03,.3,0,0x8f8b7e);P('box',x,.03,z,.22,.03,.22,0,0x8a8678);P('box',x,.06,z,.15,.03,.15,0,0x85817a);P('cone',x,.09,z,.06,.16,.06,0,0x8f8b7e);for(const m of[[-1,-1],[1,-1],[-1,1],[1,1]])P('cone',x+m[0]*.055,.09,z+m[1]*.055,.04,.1,.04,0,0x8f8b7e);break}
 case'uluru':{const x=Rd+.55,z=-.2;if(ok(x,z))P('dome',x,-.01,z,.62,.11,.3,.4,0xb4502c);break}
 case'opera':{const x=.15,z=-Rd*.9;if(!ok(x,z))break;P('box',x,0,z,.16,.012,.08,.3,0xd8c8b0);for(let i=0;i<4;i++)P('dome',x-.05+i*.033,.012,z,.05,.07-i*.008,.07,.3,0xf4f1ea);break}
 case'moai':{for(let i=0;i<7;i++){const x=-.12+i*.04,z=.25;if(!ok(x,z))continue;P('box',x,0,z,.035,.012,.04,0,0x777068);P('box',x,.012,z,.014,.032,.012,0,0x5d564f);P('box',x,.044,z,.016,.024,.014,0,0x57514a)}break}
 case'colosseum':if(ok(.12,.1)){P('cyl',.12,0,.1,.22,.06,.22,0,0xcbb89a);P('cyl',.12,0,.1,.15,.062,.15,0,0xb59e78)}break;
 case'dome':{const x=-.1,z=.12;if(!ok(x,z))break;P('box',x,0,z,.16,.06,.08,0,0xe0d6c4);P('cyl',x,.06,z,.06,.03,.06,0,0xe0d6c4);P('dome',x,.09,z,.07,.06,.07,0,0x8fa0a3);P('cyl6',x,.15,z,.01,.02,.01,0,0xe0d6c4);break}
 case'parthenon':{const x=.12,z=-.15;if(!ok(x,z))break;P('box',x,0,z,.32,.045,.2,.2,0xa59a85);G+=.045;P('box',x,0,z,.13,.008,.065,0,0xe9e2d0);for(let i=0;i<8;i++)for(const zz of[-.028,.028])P('cyl6',x-.056+i*.016,.008,z+zz,.006,.03,.006,0,0xeee8d8);P('prism',x,.038,z,.13,.014,.068,0,0xe2dac6);break}
 case'stonehenge':{const x=.25,z=-.1;if(!ok(x,z))break;for(let i=0;i<20;i++){const a=i/20*6.28;P('box',x+Math.cos(a)*.055,0,z+Math.sin(a)*.055,.009,.024,.006,-a,0x8c8a83);if(i%2===0)P('box',x+Math.cos(a+.157)*.055,.024,z+Math.sin(a+.157)*.055,.018,.005,.006,-a-1.57,0x86847d)}for(let i=0;i<5;i++){const a=i/5*3.4+1.5;P('box',x+Math.cos(a)*.025,0,z+Math.sin(a)*.025,.012,.034,.008,-a,0x7f7d76)}break}
 case'cathedral':{const x=-.12,z=.08;if(!ok(x,z))break;const c=0xa8a296;P('box',x,0,z,.15,.06,.05,0,c);P('prism',x,.06,z,.15,.04,.055,0,0x6f6c66);for(const d of[-1,1]){P('box',x+.085,0,z+d*.02,.026,.12,.026,0,c);P('pyr',x+.085,.12,z+d*.02,.024,.04,.024,0,0x6f6c66)}break}
 case'eiffel':{const x=.3,z=.25;if(!ok(x,z))break;P('pyr',x,0,z,.07,.2,.07,0,0x6a5a4a);P('pyr',x,.15,z,.025,.17,.025,0,0x6a5a4a);break}
 case'onion':{const x=.1,z=.12;if(!ok(x,z))break;const cs=[0xc23b22,0x2a8f5a,0x2a6f97,0xe0a526,0xc23b22];P('box',x,0,z,.12,.03,.12,0,0xb5543c);[[0,0,.09],[-.04,-.04,.06],[.04,-.04,.06],[-.04,.04,.06],[.04,.04,.06]].forEach((p,i)=>{P('cyl',x+p[0],.03,z+p[1],.024,p[2],.024,0,0xd8c8a8);P('ball',x+p[0],.03+p[2],z+p[1],.034,.034,.034,0,cs[i]);P('cone',x+p[0],.06+p[2],z+p[1],.01,.02,.01,0,0xd4a017)});break}
 case'zimbabwe':{const x=.05,z=.05;if(!ok(x,z))break;for(let i=0;i<26;i++){const a=i/26*6.28;P('box',x+Math.cos(a)*.11,0,z+Math.sin(a)*.08,.03,.04,.012,-a-1.57,0x7d7466)}P('cyl',x+.03,0,z,.035,.06,.035,0,0x7a7062);P('cone',x+.03,.06,z,.03,.02,.03,0,0x7a7062);break}
 case'mound':case'platform':{const x=.05,z=-.05;if(!ok(x,z))break;const c=type==='mound'?0x6f7d48:0xc2a878;P('box',x,0,z,.26,.05,.2,0,c);P('box',x-.02,.05,z,.17,.04,.13,0,c);if(type==='mound')house('thatchsq',x,z-0,0)||0;break}
 case'pueblo':{const x=0,z=0;if(!ok(x,z))break;for(let i=0;i<14;i++){const a=Math.PI+i/13*Math.PI,r=.13;for(let l=0;l<3;l++)P('box',x+Math.cos(a)*(r-l*.02),l*.02,z+Math.sin(a)*(r-l*.02)*.8,.03,.02,.02,-a,0xc49a6c)}P('box',x,0,z-.1,.26,.02,.02,0,0xc49a6c);for(const k of[[-.04,-.02],[.04,-.04],[0,-.06]])P('cyl',x+k[0],0,z+k[1],.03,.006,.03,0,0xa88a62);break}
 case'sunpyramid':{const x=.15,z=0;if(ok(x,z)){let w=.3;for(let i=0;i<5;i++){P('box',x,i*.028,z,w,.028,w,0,0x9b8b78);w-=.045}}if(ok(0,-.3)){let w=.2;for(let i=0;i<4;i++){P('box',0,i*.024,-.3,w,.024,w,0,0x968672);w-=.04}}for(let i=0;i<6;i++)if(ok(-.05,-.2+i*.1))P('box',-.05,0,-.2+i*.1,.04,.002,.1,0,0xa89a86);break}
 case'templomayor':{const x=0,z=0;if(!ok(x,z))break;let w=.2;for(let i=0;i<4;i++){P('box',x,i*.026,z,w,.026,w*.85,0,0xd7cfc0);w-=.035}P('box',x-.025,.104,z,.04,.03,.04,0,0x3a6fa0);P('box',x+.025,.104,z,.04,.03,.04,0,0xb33a2a);break}
 case'mayatemple':{const x=.05,z=-.05;if(!ok(x,z))break;let w=.13;for(let i=0;i<8;i++){P('box',x,i*.018,z,w,.018,w,0,0xcfc6b0);w-=.011}P('box',x,.144,z,.04,.03,.03,0,0xcfc6b0);P('box',x,.174,z,.036,.04,.01,0,0xc2b89f);break}
 case'terraces':{for(let i=0;i<7;i++){const z=.16-i*.045;if(!ok(0,z))continue;P('box',0,0,z,.36-i*.02,.012+i*.003,.05,0,0x5f7a3a)}if(ok(0,-.42))P('cone',0,0,-.42,.3,.38,.3,0,0x4f6b3a);break}
 case'liberty':{const x=Rd+.3,z=.3;const y=gY(s,x,z);G=y===null?0:y;P('box',x,0,z,.03,.02,.03,0,0x9a8f7a);P('cyl',x,.02,z,.014,.04,.014,0,0x6fa68d);P('ball',x,.06,z,.012,.012,.012,0,0x6fa68d);P('cyl6',x+.006,.07,z,.003,.012,.003,0,0x6fa68d);break}
 }}
function buildSite(s,key){
 if(s.built){scene.remove(s.built);s.built.geometry.dispose();s.built=null}
 const t=tierAt(s,simY);s.bkey=key;if(t<-1)return;
 frameSite(s);s.hs=siteHS(s);if(hAt(s.lat,s.lon)<0){s.homes=[];return}
 RUIN=t===-1?1:0;RF=.45;const tt=RUIN?ruinTier(s):t;s.rt=tt;s.rad=RAD[tt]*(s.k==='omo'&&tt<=1?1.7:1);const Rd=s.rad;
 PL=[];BS=s;brng=srng(s.i*977+tt*31+7);
 const st=homeStyle(s,tt);s.style=st;s.feat=[];s.homes=[];s.fields=[];s.work=[];s.lights=[];s.fires=[];
 // trampled ground / paved town floor
 if(setG(0,0)){const gc=RUIN?0x8a8270:tt>=7?0x6a6c70:tt>=6?0x7a7068:tt>=4?({cn:0x9a8e78,jp:0x9a8e78,me:0xc8b48c,eg:0xc8b48c,in:0xb89a74,mes:0xb8ab92,and:0x8a8270}[s.c]||0x9a8c72):({af:0x9a7a58,eg:0xb8a078,me:0xb8a078,aus:0xa86a44,arc:0xdde4ea}[s.c]||0x7d6b52);G=0;const n=24;for(let i=0;i<2;i++){const rr=Rd*(i?1.06:.55)+.02;P('cyl',0,-.004-i*.0005,0,rr*2,.0045+i*.0006,rr*2,0,vary(gc,.04))}}
 // fire / centre
 if(tt<=2&&!RUIN&&setG(0,0)){for(let i=0;i<7;i++){const a=i/7*6.28;P('box',Math.cos(a)*.014,0,Math.sin(a)*.014,.006,.004,.006,a,0x6a6460)}s.fires.push([0,G+.006,0])}
 // landmarks
 const lms=s.lm.filter(l=>simY>=l[0]&&(!l[2]||simY<l[2])).map(l=>l[1]);
 const excl=[];
 // lake (Tenochtitlan)
 if(s.x.lake&&simY<1900){const outer=lerp(Rd*2.3,Rd*1.05,clamp((simY-1600)/300,0,1));if(outer>Rd*1.1){G=-.004;const g=new THREE.RingGeometry(Rd*1.02,outer,56).rotateX(-Math.PI/2).toNonIndexed();const m=new THREE.Matrix4().makeTranslation(0,.003,0);PL.push({g,m,c:new THREE.Color(0x4f8aa0)});
  for(const a of[0,1.57,3.14])P('box',Math.cos(a)*(Rd+outer)/2,.005,Math.sin(a)*(Rd+outer)/2,outer-Rd,.004,.02,-a,0xb0a080);
  if(tt>=4&&tt<6)for(let i=0;i<26;i++){const a=brng()*6.28,r=Rd*1.06+brng()*(outer-Rd)*.5;P('box',Math.cos(a)*r,.004,Math.sin(a)*r,.05,.003,.018,-a,0x6f9a4a)}}}
 // houses
 const nh=[6,7,14,22,34,44,46,40,40][tt];
 for(let i=0,tries=0;i<nh&&tries<nh*4;tries++){let x,z,ry;
  if(tt>=4){const g=.075*(tt>=6?1.15:1),gx=Math.round((brng()*2-1)*Rd/g),gz=Math.round((brng()*2-1)*Rd/g);x=gx*g;z=gz*g;ry=0;if(Math.hypot(x,z)>Rd||s.homes.some(h=>Math.abs(h[0]-x)<.01&&Math.abs(h[1]-z)<.01))continue}
  else{const r=.06+Math.sqrt(brng())*(Rd-.06),a=brng()*6.28;x=Math.cos(a)*r;z=Math.sin(a)*r;ry=tt<=1?a:brng()*6.28}
  if(Math.hypot(x,z)<(tt>=3?.11:.05))continue;
  const styleHere=tt>=7?(Math.hypot(x,z)<Rd*.55?'tower':Math.hypot(x,z)<Rd*.8?'brick':'suburb'):st;
  if(styleHere==='tower'){if(!setG(x,z))continue;const cf=1-Math.hypot(x,z)/(Rd*.55);const h=.1+(brng()**2)*.35+cf*.25,w=.045+brng()*.03;P('box',x,0,z,w,h,w,0,vary([0x7f93a6,0xa9b8c6,0x5d6f82,0xc7ccd1,0x8a9aa0][(brng()*5)|0],.06));if(brng()<.35)P('box',x,h,z,w*.5,.03,w*.5,0,0x9aa3ad);if(tt===8){P('box',x,h,z,w*.92,.01,w*.92,0,0x5a9a48);if(brng()<.4)P('ball',x,h+.008,z,w*.6,w*.35,w*.6,0,0x4f8a3a)}
   for(let l=.03;l<h;l+=.05)s.lights.push([x+w*.51,G+l,z]);}
  else if(!house(styleHere,x,z,ry))continue;
  s.homes.push([x,z]);s.work.push([x,z]);if(tt>=5&&styleHere!=='tower')s.lights.push([x,G+.03,z]);
  if(tt<=1&&i%3===0)s.fires.push([x*1.25,G+.006,z*1.25]);i++}
 // walls
 if((tt===3||tt===4)&&!['nae','nasw','pol','mes','af','aus'].includes(s.c)&&!RUIN){const Rw=Rd*1.02,n=30;for(let i=0;i<n;i++){const a=i/n*6.28,x=Math.cos(a)*Rw,z=Math.sin(a)*Rw;if(!setG(x,z))continue;P('box',x,0,z,6.28*Rw/n*1.05,s.c==='cn'?.045:.032,.014,-a-1.5708,s.c==='cn'?0x9a8f7a:0xb5a284);if(i%6===0)P('box',x,0,z,.03,.05,.03,0,0xa89878)}}
 // roads
 if(tt>=4&&!RUIN){const rc=tt>=7?0x55585c:tt>=6?0x6e6a64:0x9a8c72;const lines=tt>=6?[-2,-1,0,1,2]:[0];for(const l of lines){if(setG(l*.15,0))P('box',l*.15,.0005,0,.012,.002,Rd*2,0,rc);if(setG(0,l*.15))P('box',0,.0005,l*.15,Rd*2,.002,.012,0,rc)}}
 // factories
 if(tt===6&&!RUIN)for(let i=0;i<4;i++){const a=i*1.6+.5,x=Math.cos(a)*Rd*.7,z=Math.sin(a)*Rd*.7;if(!setG(x,z))continue;P('box',x,0,z,.12,.05,.08,a,0x6d5a4e);P('cyl',x+.04,0,z,.016,.17,.016,0,0x7a4a3a);s.work.push([x,z]);s.smoke=(s.smoke||[]);s.smoke.push([x+.04,G+.17,z])}
 // wind turbines and solar farms
 if(!RUIN&&tt>=6&&simY>2000){const nt=1+Math.round(clamp((simY-2000)/35,0,1)*5);for(let i=0;i<nt;i++){const a=i*1.3+2.2,x=Math.cos(a)*Rd*1.75,z=Math.sin(a)*Rd*1.75;if(!setG(x,z))continue;P('cyl',x,0,z,.007,.2,.007,0,0xeef0f2);P('box',x,.2,z+.004,.009,.009,.018,0,0xeef0f2);for(let b=0;b<3;b++)P('box',x,.204,z+.014,.005,.085,.002,0,0xf6f6f8,b*2.094+i)}
  if(simY>2010){const ns=Math.round(clamp((simY-2010)/40,0,1)*14)+2;for(let i=0;i<ns;i++){const a=4.4+i*.11,r=Rd*1.42+(i%2)*.06,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!setG(x,z))continue;P('box',x,.004,z,.05,.004,.032,-a,0x1d3557);P('box',x,0,z,.004,.004,.004,0,0x777777)}}}
 // fields
 const nf=[0,0,9,12,14,12,6,0,0][tt],crop=CROP[s.c]||CROP.eu;
 if(!RUIN)for(let i=0;i<nf;i++){const r=Rd*(1.08+brng()*.75),a=brng()*6.28,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!setG(x,z))continue;const w=.08+brng()*.08,d=.06+brng()*.07;P('box',x,.0008,z,w,.002,d,-a,vary(crop[i%2],.06));s.fields.push([x,z,w,d])}
 // port
 s.cd=null;for(let i=0;i<16;i++){const a=i/16*6.28;if(gH(s,Math.cos(a)*Rd*1.7,Math.sin(a)*Rd*1.7)<0){s.cd=a;break}}
 if(s.cd!==null&&tt>=4&&!RUIN){const x=Math.cos(s.cd)*Rd*1.15,z=Math.sin(s.cd)*Rd*1.15;G=Math.max(0,gY(s,x,z)||0);P('box',x,0,z,.14,.008,.03,-s.cd,0x7a6040)}
 if(!RUIN){const FE=(name,x,z,top,fn)=>{if(!setG(x,z))return;fn(x,z);s.feat.push([x,G+top,z,name])},pos=(a,r)=>[Math.cos(a)*Rd*r,Math.sin(a)*Rd*r],Y=simY;let p,q;
  if(tt>=6&&Y>2000){const a=2.2;s.feat.push([Math.cos(a)*Rd*1.75,(gY(s,Math.cos(a)*Rd*1.75,Math.sin(a)*Rd*1.75)||0)+.25,Math.sin(a)*Rd*1.75,'Wind turbines']);if(Y>2010)s.feat.push([Math.cos(4.4)*Rd*1.42,(gY(s,Math.cos(4.4)*Rd*1.42,Math.sin(4.4)*Rd*1.42)||0)+.02,Math.sin(4.4)*Rd*1.42,'Solar farm'])}
  if(tt>=2&&tt<=5&&s.c!=='arc'&&s.c!=='aus'){[p,q]=pos(.9,.55);FE('Granary',p,q,.07,(x,z)=>{P('cyl',x,0,z,.035,.04,.035,0,0xb59a6a);P('cone',x,.04,z,.042,.025,.042,0,0x9a8350)});[p,q]=pos(2.6,.3);FE('Well',p,q,.02,(x,z)=>{P('cyl',x,0,z,.02,.012,.02,0,0x8a8070);P('cyl',x,.012,z,.014,.001,.014,0,0x2f4f6f)})}
  if(tt>=2&&tt<=6&&['me','eg','in','cn','nasw','and'].includes(s.c)&&s.fields.length){const f=s.fields[0];FE('Irrigation canal',f[0]*.9,f[1]*.9,.01,(x,z)=>P('box',x,.001,z,.012,.002,Rd*1.1,Math.atan2(x,z),0x3f7fa0))}
  if(tt>=3&&tt<=6){[p,q]=pos(4.1,.28);FE(tt>=6?'Market hall':'Market',p,q,.04,(x,z)=>{for(let i=0;i<6;i++){const xx=x+(i%3-1)*.022,zz=z+((i/3|0)-.5)*.024;P('box',xx,0,zz,.016,.014,.016,0,[0xc0392b,0xe0a526,0x2a6f97,0x3b7a4a,0xd8c8a8,0x8a3b6a][i]);P('prism',xx,.014,zz,.018,.008,.018,0,0xe8dcc0)}})}
  if(tt>=2&&tt<=6&&['me','eg','eu','eun','af','cn'].includes(s.c)&&Y>-7000){[p,q]=pos(5.3,1.25);FE('Beehives',p,q,.02,(x,z)=>{for(let i=0;i<4;i++)P('box',x+i*.01,0,z,.007,.01,.007,0,0xd8b070)})}
  if(tt>=4&&tt<=6&&((['eu','eun'].includes(s.c)&&Y>1180)||(s.c==='me'&&Y>650)||(COLC.has(s.c)&&Y>1650&&tt>=5))){[p,q]=pos(3.3,1.15);FE('Windmill',p,q,.11,(x,z)=>{P('cyl',x,0,z,.024,.06,.024,0,0xd8d0c0);P('cone',x,.06,z,.028,.02,.028,0,0x6a4a3a);for(let b=0;b<4;b++)P('box',x,.066,z+.014,.006,.05,.001,0,0xe8e0d0,b*1.571+.4)})}
  if(tt>=4&&tt<=5&&['eu','cn','jp','me'].includes(s.c)&&Y>100){[p,q]=pos(1.9,1.05);FE('Water mill',p,q,.04,(x,z)=>{P('box',x,0,z,.03,.025,.025,0,0x8a6a4a);P('cyl',x+.018,.015,z,.03,.006,.03,0,0x6a5038,1.571)})}
  if(tt>=4&&((s.k==='rome'&&Y>-312)||(s.k==='istanbul'&&Y>368))&&Y<1900){for(let i=0;i<8;i++){const x=-Rd-.05-i*.06,z=-.2+i*.01;if(!setG(x,z))continue;P('box',x,0,z,.012,.05,.012,0,0xc8b89a);P('box',x-.03,.05,z,.072,.012,.014,0,0xc8b89a)}s.feat.push([-Rd-.2,G+.07,-.17,'Aqueduct'])}
  if(s.cd!==null&&tt>=4&&Y>-280){const x=Math.cos(s.cd+.35)*Rd*1.3,z=Math.sin(s.cd+.35)*Rd*1.3,y=gY(s,x,z);if(y!==null){G=y;P('cyl',x,0,z,.018,.1,.018,0,Y>1800?0xf2f2f2:0xcfc2a4);P('cyl',x,.1,z,.022,.015,.022,0,0xffd27a);if(Y>1800)P('cyl',x,.05,z,.0185,.015,.0185,0,0xc0392b);s.feat.push([x,G+.12,z,'Lighthouse']);s.lights.push([x,G+.108,z])}}
  if(tt>=6&&Y>1850){[p,q]=pos(.4,.62);FE('School',p,q,.06,(x,z)=>{P('box',x,0,z,.07,.035,.045,0,0xb5543c);P('cyl6',x+.04,0,z,.002,.06,.002,0,0xdddddd);P('box',x+.046,.05,z,.012,.008,.001,0,0xc0392b)});[p,q]=pos(1.4,.6);FE('Hospital',p,q,.07,(x,z)=>{P('box',x,0,z,.08,.06,.05,0,0xeeeeee);P('box',x,.061,z,.03,.002,.008,0,0xd62828);P('box',x,.061,z,.008,.002,.03,0,0xd62828)})}
  if(tt>=6&&Y>1882){[p,q]=pos(2.9,1.25);const nuke=(Y>1956&&['eu','eun','nae','jp','cn'].includes(s.c))||s.k==='moscow';FE(nuke&&Y>1970?'Nuclear power plant':Y>2050?'Gas power plant':'Coal power plant',p,q,.12,(x,z)=>{P('box',x,0,z,.08,.04,.05,0,0x6a6a6a);if(nuke&&Y>1970)P('cyl',x+.06,0,z,.07,.11,.07,0,0xc8c8c4);else{P('cyl',x-.02,0,z,.012,.13,.012,0,0x7a4a3a);P('cyl',x+.02,0,z,.012,.13,.012,0,0x7a4a3a)}})}
  if(tt>=6&&Y>1830){[p,q]=pos(5.9,.75);FE('Railway station',p,q,.04,(x,z)=>{P('box',x,0,z,.12,.03,.035,.3,0x8a6a5a);P('prism',x,.03,z,.13,.015,.04,.3,0x4a4a52)})}
  if(tt>=6&&s.cd!==null){const x=Math.cos(s.cd-.3)*Rd*1.12,z=Math.sin(s.cd-.3)*Rd*1.12,y=gY(s,x,z);if(y!==null){G=y;for(let i=0;i<3;i++){P('box',x+i*.03,0,z,.006,.09,.006,0,0xd8a020);P('box',x+i*.03,.09,z+.015,.006,.006,.05,0,0xd8a020)}s.feat.push([x,G+.1,z,Y>1960?'Container cranes':'Harbour cranes'])}}
  if(tt>=7&&Y>1930){const a=s.cd!==null?s.cd+3.14:1,x=Math.cos(a)*Rd*2.3,z=Math.sin(a)*Rd*2.3;if(setG(x,z)){P('box',x,.001,z,.04,.002,.36,a,0x4a4c50);P('box',x+.06,0,z,.08,.025,.04,a,0xb8c0c8);s.feat.push([x,G+.03,z,'Airport'])}}
  if(tt>=7&&Y>1900){[p,q]=pos(3.7,.85);FE('Stadium',p,q,.04,(x,z)=>{P('cyl',x,0,z,.14,.035,.1,0,0xc8c8c8);P('cyl',x,.0005,z,.1,.036,.065,0,0x3f8a3a)})}
  if(tt>=6&&Y>1990){[p,q]=pos(2.2,.95);FE('Cell tower',p,q,.14,(x,z)=>{P('cyl6',x,0,z,.004,.13,.004,0,0xaaaaaa);P('box',x,.12,z,.012,.01,.003,0,0x888888)})}
  if(tt>=7&&Y>2010){[p,q]=pos(5.1,1.3);FE(tt>=8?'AI data centre':'Data centre',p,q,.03,(x,z)=>{P('box',x,0,z,.12,.025,.07,.2,0x9aa0a8);for(let i=0;i<4;i++)P('box',x-.04+i*.026,.025,z,.012,.006,.012,.2,0x6a7078)})}
  if(tt>=8){[p,q]=pos(.9,.45);FE('Vertical farm',p,q,.2,(x,z)=>{P('box',x,0,z,.05,.18,.05,0,0x8ad08a);for(let l=.03;l<.18;l+=.035)P('box',x,l,z,.054,.004,.054,0,0x3f7a3a)})}
  if(tt>=7&&s.cd!==null&&Y>2040){for(let i=-3;i<=3;i++){const a=s.cd+i*.08,x=Math.cos(a)*Rd*1.08,z=Math.sin(a)*Rd*1.08;if(setG(x,z))P('box',x,0,z,.09,.03,.012,-a-1.5708,0x8a8a88)}s.feat.push([Math.cos(s.cd)*Rd*1.08,G+.04,Math.sin(s.cd)*Rd*1.08,'Sea wall (projected)'])}
  if(tt>=7&&s.c==='me'&&s.cd!==null&&Y>1970){const x=Math.cos(s.cd+.7)*Rd*1.05,z=Math.sin(s.cd+.7)*Rd*1.05;FE('Desalination plant',x,z,.04,(x,z)=>{P('box',x,0,z,.07,.025,.04,0,0xd0d4d8);P('cyl',x+.04,0,z,.025,.03,.025,0,0xe8eef2)})}
  if(tt===6&&['eu','eun','nae','cn','in','af'].includes(s.c)&&Y<2030){[p,q]=pos(.2,1.9);FE('Coal mine',p,q,.07,(x,z)=>{P('cyl',x,-.003,z,.08,.004,.08,0,0x2a2622);P('box',x+.05,0,z,.01,.06,.01,0,0x5a4a3a);P('box',x+.04,.06,z,.03,.008,.008,0,0x5a4a3a)})}
  if(tt===2&&!['arc','aus'].includes(s.c)){[p,q]=pos(5.6,.4);FE('Shrine',p,q,.03,(x,z)=>P('box',x,0,z,.02,.025,.02,0,0x8a7a68))}
  if(tt<=1&&s.c!=='arc'){[p,q]=pos(1.2,.9);FE('Drying rack',p,q,.03,(x,z)=>{P('cyl6',x-.01,0,z,.002,.025,.002,0,0x5a4630);P('cyl6',x+.01,0,z,.002,.025,.002,0,0x5a4630);P('box',x,.022,z,.024,.002,.002,0,0x5a4630);P('box',x,.012,z,.012,.01,.002,0,0x8a6a4a)});[p,q]=pos(3.9,.55);FE('Flint-knapping spot',p,q,.015,(x,z)=>{for(let i=0;i<5;i++)P('box',x+(i-2)*.005,0,z+(i%2)*.004,.004,.003,.004,i,0x8a8a88)})}}
 s.lmk=[];RF=.9;for(const l of lms){const i0=PL.length;LM(l,s,tt);if(PL.length>i0){let x=0,z=0,y=-1;for(let i=i0;i<PL.length;i++){const e=PL[i].m.elements;x+=e[12];z+=e[14];y=Math.max(y,e[13]+e[5])}const k=PL.length-i0;s.lmk.push([x/k,y+.012,z/k,LMN[s.k+':'+l]||LMN[l]||l])}}RF=.45;
 if(!PL.length){RUIN=0;return}
 const mesh=new THREE.Mesh(merge(PL),bMat);mesh.matrixAutoUpdate=false;mesh.matrix.copy(s.M);mesh.frustumCulled=true;mesh.geometry.computeBoundingSphere();
 scene.add(mesh);s.built=mesh;RUIN=0;
 buildTrees(s,tt);
}
// ---- real body sizes (m: length, height for upright animals, wingspan for fliers) and diets ----
const LEN={mammoth:5.5,elephant:6,bison:3,deer:1.8,antelope:1.5,zebra:2.4,horse:2.4,cattle:2.5,sheep:1.3,goat:1.3,llama:1.8,dog:1,kangaroo:1.4,diprotodon:3,emu:1.6,moa:3.6,caribou:2,guanaco:2,pig:1.5,camel:3,boar:1.5,yak:3,buffalo:2.8,wildebeest:2.2,giraffe:4.5,lion:2.5,hyena:1.5,hippo:4,rhino:3.7,woollyrhino:3.8,wolf:1.5,bear:2.2,polarbear:2.5,aurochs:3,saiga:1.3,tiger:2.8,oryx:2,muskox:2.2,sloth:6,mastodon:4.5,jaguar:2,tapir:2,rhea:1.4,vicuna:1.6,dodo:1,gazelle:1.2,panda:1.7,elk:2.4,robot:1.75,
chicken:.4,cat:.5,donkey:2,turkey:1,duck:.5,alpaca:1.6,reindeer:2,cheetah:2,leopard:1.8,warthog:1.5,baboon:1,gorilla:1.7,chimpanzee:1.2,okapi:2.3,ostrich:2.5,crocodile:5,komodo:2.6,orangutan:1.4,macaque:.6,snowleopard:1.7,redpanda:.6,moose:3,beaver:1,raccoon:.7,coyote:1.2,cougar:2,pronghorn:1.4,prairiedog:.35,alligator:4,armadillo:.8,capybara:1.2,koala:.75,wombat:1,platypus:.5,tasdevil:.7,dingo:1.4,thylacine:1.6,arcticfox:.7,walrus:3.2,penguin:1.1,lynx:1.1,redfox:.9,rabbit:.45,ibex:1.5,chamois:1.3,bactrian:3.2,przewalski:2.2,lemur:.9,fossa:1.6,elephantbird:3,tortoise:1.3,marineiguana:1.2,quagga:2.4,flamingo:1.4,meerkat:.3,peafowl:2,kiwi:.45,marmot:.6,sealland:3,greatauk:.8,eagle:2.2,vulture:2.6,condor:3,albatross:3.4,pelican:3,stork:2,crane:2.2,baldeagle:2.1,dolphin:2.5,orca:8,shark:5,seaturtle:1.2,tuna:2.5,manta:7,humpback:15,bluewhale:28,seal:1.8,reeffish:.8,seacow:8,whale:14,
coelo:3,herrera:5,plateo:8,postosuchus:5,placerias:3.5,eudi:1,ichthyo:8,dilopho:7,cryolo:6.5,massos:5,brachio:22,diplo:26,stego:9,allo:9.5,archaeo:.5,ptero:4,plesio:5,iguano:10,spino:15,argentino:35,giganoto:13,titano:20,mutta:8,carno:8,veloci:1.8,proto:1.8,trex:12.3,trice:9,ankylo:7,edmonto:12,parasaur:9.5,pteranodon:6.5,quetzal:10.5,mosa:14,emammal:.3,gastornis:2,eohippus:.6,arsino:3,indrico:7.5,basilo:18,entelo:2,hipparion:1.6,deino:6,gompho:5,megalodon:16,sabre:2,glypto:3.3,glyptodon:3.3,antel2:1.5,rhino2:3.7,hyena2:1.5,camel2:3,mammoth2:5.5,whale2:14,kanga2:1.4,dipro2:3,lion2:2.6,bison2:3,horse2:2.4,eleph2:6,giraffe2:4.5,deer2:1.8,
pachy:4.5,dakota:5.5,alamo:26,saltasaur:12,tarbo:10,therizino:10,deinocheirus:11,gallimimus:6,majunga:7,rajasaurus:6.6,hatzego:11,vegavis:.6,didelpho:.9,croc2:4,turtle2:1.5,titanoboa:13,plesiadapis:.8,pantolambda:1,andrews:3.5,uinta:4,pakicetus:1.5,ambulo:3,moeri:3,megacerops:5,hyaenodon:1.4,bats:1,gpenguin:1.6,mesohippus:.6,aegypto:.6,chalico:2.6,amphicyon:2.5,phorus:2.5,thylaco:1.5,sivapith:1.2,dryopith:1,gigantopith:3,livyatan:15,platybelodon:3,merychippus:1,megatherium:6,arctodus:3,direwolf:1.5,cavebear:2.7,megaloceros:3,macrauchenia:3,toxodon:2.7,megalania:6,thylacoleo:1.5,procoptodon:2,genyornis:2,elasmotherium:4.5,cavelion:2.6,hom_australo:1.2,hom_habilis:1.3,hom_erectus:1.7,hom_heidel:1.75,hom_neander:1.65,hom_deniso:1.7,hom_flores:1.06,hom_sapiens:1.7,car:4.5,cart:3,bike:1.8,bus:12,pod:3.5};
const MESHLEN={quad:1.9,thero:5,sauro:9.5,cera:3.2,stego:4.4,ankylo:4.7,spino:5,ptero:5,plesio:5.7,fish:3.2,whale:6.3,hum:1.7,car:1.65,swarm:1};
const CARN=new Set(['lion','hyena','wolf','bear','polarbear','tiger','jaguar','cheetah','leopard','crocodile','komodo','snowleopard','coyote','cougar','alligator','tasdevil','dingo','thylacine','arcticfox','lynx','redfox','fossa','sealland','eagle','vulture','condor','albatross','pelican','stork','baldeagle','dolphin','orca','shark','tuna','seal','penguin','greatauk','sabre','lion2','hyena2','entelo','basilo','megalodon','mosa','dakota','tarbo','majunga','rajasaurus','hatzego','croc2','titanoboa','andrews','pakicetus','ambulo','hyaenodon','amphicyon','phorus','thylaco','livyatan','arctodus','direwolf','megalania','thylacoleo','cavelion','bats','plesio','ichthyo','coelo','herrera','postosuchus','dilopho','cryolo','allo','spino','giganoto','carno','veloci','trex','eudi','ptero','pteranodon','quetzal','archaeo','cat','dog','mosquitoes']);
const OMNI=new Set(['bear','boar','boarw','pig','baboon','chimpanzee','raccoon','macaque','ostrich','emu','rhea','chicken','turkey','duck','crane','flamingo','kiwi','armadillo','meerkat','marmot','redpanda','gastornis','emammal','entelo','deinocheirus','gallimimus','didelpho','plesiadapis','aegypto','sivapith','dryopith','cavebear','vegavis','turtle2','orangutan','hom_australo','hom_habilis','hom_erectus','hom_heidel','hom_neander','hom_deniso','hom_flores','hom_sapiens','prairiedog','peafowl','reeffish','seaturtle','manta','humpback','bluewhale','whale','whale2','bees','fireflies','butterflies','monarchs','parrots','passengerpigeon','locusts','robot']);
const PACK=new Set(['wolf','lion','hyena','dingo','orca','veloci','lion2','hyena2','coyote','dolphin']);
const XDIET={},UPX=new Set();
const dietOf=k=>XDIET[k]||(VEH.has(k)?'':k==='locals'||k.startsWith('hom_')||k==='bear'||k==='robot'?'omnivore':CARN.has(k)?(k==='vulture'||k==='condor'?'scavenger':'carnivore'):OMNI.has(k)?'omnivore':'herbivore');
const lenOf=k=>LEN[k]||null;
function sizeTxt(k){const L=LEN[k];if(!L||VEH.has(k))return '';const up=['ostrich','emu','rhea','moa','flamingo','penguin','gorilla','elephantbird','giraffe','giraffe2','robot','phorus','gpenguin','genyornis','gigantopith','procoptodon'].includes(k)||UPX.has(k)||k.startsWith('hom_'),wing=['eagle','vulture','condor','albatross','pelican','stork','crane','baldeagle','pteranodon','quetzal','ptero','eudi','archaeo'].includes(k);return (L<1?Math.round(L*100)+' cm':L.toFixed(L<10?1:0)+' m')+(wing?' wingspan':up?' tall':' long')}
function realScale(k,mesh,fallback){const L=LEN[k];if(!L)return fallback;return Math.max(L/(MESHLEN[mesh]||1.9),mesh==='swarm'?1:.14)}
// ---- plant names ----
function treeName(type,b,lat,lon,Y){const r=hash(Math.round(lat*40),Math.round(lon*40)),P_=a=>a[(r*a.length)|0];
 if(Y<-2.6e6&&PLDB.length){const t=type==='tuft'?'fern':type==='palm'?'palm':type==='con'?'con':'broad';const nm=plantPick(t,lat,lon,Y,r);if(nm)return nm}
 const NA=lon<-50&&lat>14,SA=lon<-30&&lat<=14,AF=lon>-20&&lon<52&&lat<35,AU=lon>110&&lat<-10,EA=lon>100&&lat>20,IN=lon>66&&lon<92&&lat>5&&lat<30,SEA=lon>92&&lat<20&&lat>-11,MED=lat>30&&lat<46&&lon>-10&&lon<42,ME=lat>12&&lat<38&&lon>34&&lon<62;
 if(Y<-66e6){if(type==='con')return P_(['Araucaria conifer','Ginkgo','Podocarp']);if(type==='tuft')return P_(['Ferns','Horsetails']);if(type==='flower')return Y>-125e6?'Early flowering plants':'Ferns';return Y<-125e6?P_(['Cycad','Tree fern','Bennettitalean']):P_(['Early magnolia','Cycad','Tree fern'])}
 if(Y<-3e6){if(type==='con')return P_(['Dawn redwood','Pine']);if(type==='tuft')return Y<-20e6?'Ferns & shrubs':'Early grasses';return P_(Y<-56e6?['Laurel tree','Palm']:['Laurel tree','Oak','Palm'])}
 if(type==='tuft'){if(b===7)return 'Elephant grass';if(b===5)return NA?'Prairie bluestem grass':AU?'Spinifex':'Feather grass';if(b===2)return 'Sedge & lichen';if(b===6)return AU?'Spinifex':'Desert grass';if(b===8)return 'Ferns & undergrowth';if(b===3)return 'Moss & blueberry';return 'Meadow grass'}
 if(type==='flower')return NA?'Prairie wildflowers':MED?'Poppies':AF?'Savanna flowers':AU?'Wattle blossom':EA?'Wild chrysanthemums':'Wildflowers';
 if(type==='snag')return NA&&lat<36?'Saguaro cactus':'Dead tree';
 if(type==='shrub')return b===2?'Dwarf willow':NA?P_(['Creosote bush','Sagebrush']):AU?'Saltbush':'Desert shrub';
 if(type==='palm')return SA?'Açaí palm':ME||AF&&lat>10?'Date palm':AF||SEA?P_(['Oil palm','Coconut palm']):'Coconut palm';
 if(type==='con'){if(lat>25&&lat<36&&lon>70&&lon<100)return 'Himalayan cedar';if(lat>34&&lat<42&&lon>-125&&lon<-118)return P_(['Coast redwood','Giant sequoia']);if(NA)return P_(['Black spruce','Balsam fir','Jack pine','Douglas fir']);if(SA)return 'Monkey puzzle tree';return P_(['Scots pine','Siberian larch','Norway spruce'])}
 if(b===7)return AF?P_(['Acacia','Baobab','Marula']):AU?'Eucalyptus':'Acacia';if(AU)return P_(['Eucalyptus','Gum tree','Wattle']);
 if(b===8)return SA?P_(['Kapok','Brazil nut tree','Rubber tree']):AF?P_(['Mahogany','Iroko']):IN?P_(['Banyan','Teak']):P_(['Dipterocarp','Teak','Banyan']);
 if(MED)return P_(['Olive tree','Holm oak','Cypress']);if(IN)return P_(['Banyan','Neem','Sal']);if(NA)return P_(['Sugar maple','White oak','Hickory','Tulip tree']);if(SA)return 'Southern beech';if(EA)return P_(['Ginkgo','Japanese maple','Camphor tree']);if(lat>12&&lat<25&&lon<-80)return P_(['Ceiba','Mahogany']);
 return P_(['English oak','European beech','Birch','Linden'])}
function cropName(s,Y){const c=s.c;if(s.tier>=8)return 'Vertical farm crops';
 if(c==='me')return Y<1500?'Wheat & barley':'Wheat, barley & cotton';if(c==='eg')return Y<1820?'Wheat & flax':'Cotton & wheat';
 if(c==='eu')return Y<1600?'Wheat, rye & barley':Y<1900?'Wheat & potatoes':'Wheat & sugar beet';if(c==='eun')return Y<1700?'Barley & oats':'Potatoes & barley';
 if(c==='in')return Y>1960?'High-yield wheat & rice':'Wheat, rice & lentils';if(['cn','jp','sea'].includes(c))return 'Rice paddy';
 if(c==='af')return Y<1550?'Sorghum & millet':'Maize & cassava';if(c==='mes')return Y<1550?'Maize, beans & squash':'Maize & sugarcane';
 if(['nae','nasw','nap'].includes(c))return Y<1600?'Maize, beans & squash':Y<1850?'Corn & tobacco':'Wheat & corn';
 if(c==='and')return 'Potatoes & quinoa';if(c==='amz')return Y<1600?'Manioc':Y<1970?'Sugarcane':'Soybeans';
 if(c==='pol')return s.k==='hawaii'&&Y>1850?'Pineapples & sugarcane':'Taro & breadfruit';if(c==='aus')return 'Wheat & sheep pasture';if(c==='st')return Y>1950?'Wheat':'Barley';return 'Field'}
// ---- trees ----
const TREE={};
function buildTrees(s,tt){const r=srng(s.i*131+3),list=[];const Rd=s.rad;const n=tt>=6?30:110;
 for(let i=0;i<n;i++){const rr=Rd*(tt>=4?1.25:.75)+r()*Rd*2.6+.12,a=r()*6.28,x=Math.cos(a)*rr,z=Math.sin(a)*rr;
  const X=s.o[0]+s.e[0]*x+s.so[0]*z,Y=s.o[1]+s.e[1]*x+s.so[1]*z,Z=s.o[2]+s.e[2]*x+s.so[2]*z,p=ll(X,Y,Z),b=biomeAt(p[0],p[1]);
  const dens={3:.95,4:.8,8:1,7:.25,5:.07,6:.03,2:.03,9:.25}[b]||0;if(r()>dens)continue;
  const y=gY(s,x,z);if(y===null)continue;
  if(s.fields.some(f=>Math.abs(f[0]-x)<f[2]*.6&&Math.abs(f[1]-z)<f[3]*.6))continue;
  const type=b===3||b===9||b===2?'con':b===8?(r()<.5?'palm':'broad'):b===6?'shrub':'broad';
  list.push([type,x,y,z,(.75+r()*.6)*(b===7?.9:1),b,undefined,b===7?.55:1,treeName(type,b,p[0],p[1],simY)])}
 const GC={2:[0x8a8458,0x7a7050],3:[0x4f6a3a,0x5a7440],4:[0x5f8a40,0x6f9a48,0x4f7a38],5:[0xa8a060,0x98985a,0xb8a868],6:[0xb8a070,0xa89060],7:[0xb0a050,0x9a9a48,0xc0a860],8:[0x3f7a34,0x4a8a3a],9:[0x7a7a60]};
 const FL=[0xe8d84a,0xf0f0f0,0xd04a6a,0x8a6ad0,0xf08a3a];
 for(let i=0;i<(tt>=6?60:240);i++){const rr=(tt>=6?Rd*1.1:.06)+Math.sqrt(r())*Rd*3,a=r()*6.28,x=Math.cos(a)*rr,z=Math.sin(a)*rr;
  const X=s.o[0]+s.e[0]*x+s.so[0]*z,Y=s.o[1]+s.e[1]*x+s.so[1]*z,Z=s.o[2]+s.e[2]*x+s.so[2]*z,p=ll(X,Y,Z),b=biomeAt(p[0],p[1]);if(b===1||b===0)continue;if(b===6&&r()<.7)continue;
  const y=gY(s,x,z);if(y===null)continue;const g=GC[b]||GC[4];
  if((b===4||b===5||b===7)&&r()<.12&&tt<6)list.push(['flower',x,y,z,.8+r()*.5,b,FL[(r()*5)|0],1,treeName('flower',b,p[0],p[1],simY)]);
  else if(b===6&&r()<.3)list.push(['snag',x,y,z,.6+r()*.5,b,0x8a7458,1,treeName('snag',b,p[0],p[1],simY)]);
  else list.push(['tuft',x,y,z,.8+r()*.8,b,g[(r()*g.length)|0],1,treeName('tuft',b,p[0],p[1],simY)])}
 const crop=CROP[s.c]||CROP.eu,tallC=['mes','nae','nasw','nap'].includes(s.c);
 for(const f of s.fields){for(let k=0;k<12;k++){const x=f[0]+(r()-.5)*f[2]*.85,z=f[1]+(r()-.5)*f[3]*.85,y=gY(s,x,z);if(y===null)continue;list.push(['tuft',x,y+.001,z,tallC?1.6:1.1,4,crop[k%2],tallC?1.8:1,cropName(s,simY)])}}
 s.trees=list;treesDirty=true}
let treesDirty=false;

