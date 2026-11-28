// ================== three setup ==================
const canvas=$('c');(()=>{let ok=false;try{const c=document.createElement('canvas');ok=!!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')))}catch(e){}if(!ok){$('load').innerHTML='Humanity, Live needs 3D graphics (WebGL), and this browser has it turned off.<br>Try Safari or Chrome on your phone or computer.';throw new Error('no webgl')}})();
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();scene.background=new THREE.Color(0x03050a);if(window.__TEST)window.__R={renderer,scene};
const camera=new THREE.PerspectiveCamera(55,1,.01,4000);
const sun=new THREE.DirectionalLight(0xfff1dc,1.15);scene.add(sun);scene.add(sun.target);
const amb=new THREE.AmbientLight(0x9aaad0,.46);scene.add(amb);const AMB_NIGHT=new THREE.Color(0x6a7fc0);
// Sunlight never reaches things on the night side of the planet: trees, animals and buildings near the surface lose direct sun
// as their spot passes the terminator (no shadow maps needed; costs a few vertex ops).
THREE.ShaderChunk.lights_lambert_vertex+=`
#if NUM_DIR_LIGHTS > 0
{vec4 hlW=vec4(transformed,1.0);
#ifdef USE_INSTANCING
hlW=instanceMatrix*hlW;
#endif
hlW=modelMatrix*hlW;
if(length(hlW.xyz)<115.0){float hlD=smoothstep(-0.10,0.08,dot(normalize(mat3(viewMatrix)*hlW.xyz),directionalLights[0].direction));vLightFront*=hlD;
#ifdef DOUBLE_SIDED
vLightBack*=hlD;
#endif
}}
#endif
`;
let globeTex,specTex,globeGeo,globe,DIRS;
function detailTex(){const S=256,d=new Uint8Array(S*S*4),oct=(f,ch)=>{const g=new Float32Array(f*f);for(let i=0;i<f*f;i++)g[i]=rnd();return(x,y)=>{const X=x/S*f,Y=y/S*f,i0=Math.floor(X),j0=Math.floor(Y),fx=X-i0,fy=Y-j0,a=g[(j0%f)*f+i0%f],b=g[(j0%f)*f+(i0+1)%f],c=g[((j0+1)%f)*f+i0%f],e=g[((j0+1)%f)*f+(i0+1)%f],sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);return a+(b-a)*sx+(c-a)*sy+(a-b-c+e)*sx*sy}};
 const n1=oct(8),n2=oct(16),n3=oct(32),n4=oct(64),n5=oct(128);for(let y=0;y<S;y++)for(let x=0;x<S;x++){const p=(y*S+x)*4,v=n1(x,y)*.3+n2(x,y)*.25+n3(x,y)*.2+n4(x,y)*.15+n5(x,y)*.1;d[p]=v*255;d[p+1]=(n2(x+31,y+17)*.5+n4(x,y)*.3+n5(x+7,y)*.2)*255;d[p+2]=(n4(x+11,y+5)*.5+n5(x,y+3)*.5)*255;d[p+3]=255}
 const t=new THREE.DataTexture(d,S,S,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;return t}
function makeGlobe(){
 globeTex=new THREE.CanvasTexture(tex);globeTex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 specTex=new THREE.CanvasTexture(spc);
 globeGeo=new THREE.SphereGeometry(R,512,256);
 const uv=globeGeo.attributes.uv.array,n=uv.length/2;DIRS=new Float32Array(n*3);
 for(let i=0;i<n;i++){const lon=uv[i*2]*360-180,lat=uv[i*2+1]*180-90,v=v3(lat,lon,1);DIRS[i*3]=v.x;DIRS[i*3+1]=v.y;DIRS[i*3+2]=v.z}
 updGlobeHeights();
 // water is a mirror for the sun: a sharp, bright glint on open water only (the specular map is dark on land and sea ice)
 const gm=new THREE.MeshPhongMaterial({map:globeTex,specularMap:specTex,specular:0x262c34,shininess:150});
 // close-up ground detail: a fine tiling grain on land that fades in as the camera gets low, so the ground stays crisp instead of blurry
 const DT=detailTex();gm.onBeforeCompile=sh=>{sh.uniforms.detailMap={value:DT};sh.fragmentShader='uniform sampler2D detailMap;\n'+sh.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
  { float land=1.-smoothstep(.12,.3,specularStrength); float dist=length(vViewPosition);
    vec4 d1=texture2D(detailMap,vUv*vec2(1536.,768.)),d2=texture2D(detailMap,vUv*vec2(192.,96.));
    float nearF=1.-smoothstep(2.,14.,dist),midF=1.-smoothstep(10.,90.,dist);
    float g=mix(1.,.78+.44*d1.r,nearF*.75)*mix(1.,.86+.28*d2.g,midF*.6);
    diffuseColor.rgb*=mix(1.,g,land); diffuseColor.rgb+=land*nearF*(d1.b-.5)*.05; }`)};
 globe=new THREE.Mesh(globeGeo,gm);scene.add(globe);
 seaWater=new THREE.Mesh(new THREE.SphereGeometry(R-.01,256,128),new THREE.MeshPhongMaterial({color:0x1d5486,transparent:true,opacity:.32,specular:0x44556a,shininess:70,depthWrite:false}));seaWater.renderOrder=1;seaWater.visible=SEAFLOOR;scene.add(seaWater);
 // atmosphere
 // Light scatters in the air: short (blue) wavelengths scatter most, so the sunlit limb glows blue; where sunlight crosses the long path
 // through the air at the terminator, blue is scattered away and the light left is orange-red; the night side has only faint airglow.
 const ATMU={uSun:{value:new THREE.Vector3(1,0,0)},uCam:{value:new THREE.Vector3()},uAlt:{value:1}};
 const atm=new THREE.Mesh(new THREE.SphereGeometry(R*1.03,96,48),new THREE.ShaderMaterial({uniforms:ATMU,transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:'varying vec3 vN;varying vec3 vW;void main(){vN=normalize(normalMatrix*normal);vW=normalize((modelMatrix*vec4(position,1.)).xyz);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 uSun;varying vec3 vN;varying vec3 vW;void main(){float i=pow(clamp(.72-dot(vN,vec3(0,0,1.)),0.,1.),3.);float s=dot(vW,uSun);float day=smoothstep(-.3,.3,s);float tw=exp(-pow((s+.06)/.17,2.));vec3 c=mix(vec3(.30,.56,1.),vec3(1.,.48,.18),tw*.8)*(day*1.35+tw*.55)+vec3(.015,.02,.045);gl_FragColor=vec4(c*i*1.45,1.);}'}));
 scene.add(atm);
 // horizon haze over the surface: the thicker air seen edge-on near the limb looks pale blue in daylight (fades out close to the ground)
 const haze=new THREE.Mesh(new THREE.SphereGeometry(R*1.004,128,64),new THREE.ShaderMaterial({uniforms:ATMU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:'varying vec3 vW;void main(){vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 uSun;uniform vec3 uCam;uniform float uAlt;varying vec3 vW;void main(){vec3 n=normalize(vW),v=normalize(uCam-vW);float f=pow(1.-max(dot(n,v),0.),3.5);float s=dot(n,uSun);float day=smoothstep(-.15,.35,s);float tw=exp(-pow((s+.02)/.16,2.));vec3 c=mix(vec3(.42,.62,1.),vec3(1.,.55,.3),tw*.7);gl_FragColor=vec4(c*f*(day*.55+tw*.25)*uAlt,1.);}'}));
 haze.renderOrder=2;scene.add(haze);window.__ATMU=ATMU;
 // clouds
 const cc=document.createElement('canvas');cc.width=1024;cc.height=512;const cx=cc.getContext('2d'),ci=cx.createImageData(1024,512);
 // mean cloud cover by latitude follows the real belts (NASA MODIS/ISCCP climatology): a cloudy band at the Intertropical Convergence Zone
 // (~5°N), clear subtropical highs (15–30°, where the big deserts are), cloudy mid-latitude storm tracks (45–65°, cloudiest over the Southern Ocean),
 // and fewer clouds over the poles; mid-latitude clouds are stretched east-west along the westerlies
 const G_=(x,m,w)=>Math.exp(-(((x-m)/w)**2)),CB=lat=>.22+.42*G_(lat,5,7)-.17*G_(Math.abs(lat),23,8)+.34*G_(Math.abs(lat),55,11)*(lat<0?1.15:1)-.12*clamp((Math.abs(lat)-72)/12,0,1);
 for(let y=0;y<512;y++)for(let x=0;x<1024;x++){const lat=90-y/512*180,ml=clamp((Math.abs(lat)-30)/20,0,1),sx_=1+ml*1.8;let v=fbm(x/(60*sx_),y/52)*.7+fbm(x/(18*sx_),y/16)*.4+(CB(lat)-.4)*.9-.6;const p=(y*1024+x)*4;ci.data[p]=ci.data[p+1]=ci.data[p+2]=255;ci.data[p+3]=clamp(v*600,0,230)}
 cx.putImageData(ci,0,0);
 clouds=new THREE.Mesh(new THREE.SphereGeometry(R+3.2,128,64),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(cc),transparent:true,depthWrite:false,opacity:.5}));scene.add(clouds);
 // cloud formations drift with the real wind belts (trade winds blow west in the tropics, westerlies blow east in mid-latitudes) and slowly form and break up (flow-map blend of two drifting copies)
 clouds.material.onBeforeCompile=sh=>{sh.uniforms.uCT={value:0};clouds.userData.u=sh.uniforms.uCT;sh.fragmentShader='uniform float uCT;\n'+sh.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
 float la=abs(vUv.y-.5);float w=mix(-1.,1.,smoothstep(.1,.18,la))*(1.-smoothstep(.36,.45,la)*.6);
 float p1=fract(uCT/150.),p2=fract(uCT/150.+.5);
 vec4 c1=texture2D(map,vec2(vUv.x+w*p1*.035,vUv.y+sin(vUv.x*25.+uCT*.01)*.004*p1));
 vec4 c2=texture2D(map,vec2(vUv.x+w*p2*.035+.31,vUv.y));
 vec4 texelColor=mix(c1,c2,abs(2.*p1-1.));texelColor=mapTexelToLinear(texelColor);diffuseColor*=texelColor;
#endif`)};
 // stars
 const sg=new THREE.BufferGeometry(),sp=new Float32Array(4500);for(let i=0;i<1500;i++){const v=new THREE.Vector3(rnd()-.5,rnd()-.5,rnd()-.5).normalize().multiplyScalar(2500);sp.set([v.x,v.y,v.z],i*3)}
 sg.setAttribute('position',new THREE.BufferAttribute(sp,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false})));
}
let clouds;
// ground height samples around a site; a site is rebuilt only when these change (they rarely do: sea level, ice, seafloor toggles)
function siteHS(s){const o=[];for(const a of[-.4,0,.4])for(const c of[-.4,0,.4])o.push(hAt0(s.lat+a,s.lon+c));return o}
function siteHMoved(s){const h=siteHS(s),o=s.hs;s.hs=h;if(!o)return true;for(let i=0;i<9;i++)if(Math.abs(h[i]-o[i])>1e-5)return true;return false}
function updGlobeHeights(){const p=globeGeo.attributes.position.array;for(let i=0;i<p.length/3;i++){const x=DIRS[i*3],y=DIRS[i*3+1],z=DIRS[i*3+2];const q=ll(x,y,z);let r=R+hAt0(q[0],q[1]);if(SEAFLOOR&&r<R){r-=sdAt(q[0],q[1])}p[i*3]=x*r;p[i*3+1]=y*r;p[i*3+2]=z*r}globeGeo.attributes.position.needsUpdate=true;globeGeo.computeVertexNormals();
 for(const s of S)if(s.built&&siteHMoved(s))s.dirty=true;if(HRP){const P=HRP;HRP=null;hrBuild(P.c,P.ci,P.cj)}}

// geometry library
const BASE={};
function prismGeo(){const A0=[-.5,0,.5],B0=[-.5,0,-.5],C0=[-.5,1,0],A1=[.5,0,.5],B1=[.5,0,-.5],C1=[.5,1,0];const t=[A0,B0,C0,A1,C1,B1,A0,C0,C1,A0,C1,A1,B0,B1,C1,B0,C1,C0];const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(t.flat()),3));g.computeVertexNormals();return g}
function initGeo(){const L={box:new THREE.BoxGeometry(1,1,1).translate(0,.5,0),cyl:new THREE.CylinderGeometry(.5,.5,1,12).translate(0,.5,0),cyl6:new THREE.CylinderGeometry(.5,.5,1,6).translate(0,.5,0),cone:new THREE.ConeGeometry(.5,1,10).translate(0,.5,0),pyr:new THREE.ConeGeometry(Math.SQRT1_2,1,4).rotateY(Math.PI/4).translate(0,.5,0),dome:new THREE.SphereGeometry(.5,12,6,0,Math.PI*2,0,Math.PI/2).scale(1,2,1),ball:new THREE.SphereGeometry(.5,10,8).translate(0,.5,0),prism:prismGeo(),plane:new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2)};
 for(const k in L){const g=L[k].index?L[k].toNonIndexed():L[k];if(!g.attributes.normal)g.computeVertexNormals();BASE[k]=g}}
function merge(list){let n=0;for(const p of list)n+=p.g.attributes.position.count;
 const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),nm=new THREE.Matrix3();let o=0;
 for(const p of list){const P=p.g.attributes.position.array,Nn=p.g.attributes.normal.array,c=p.c,e=p.m.elements;nm.getNormalMatrix(p.m);const ne=nm.elements;
  for(let i=0;i<P.length;i+=3){const x=P[i],y=P[i+1],z=P[i+2];pos[o]=e[0]*x+e[4]*y+e[8]*z+e[12];pos[o+1]=e[1]*x+e[5]*y+e[9]*z+e[13];pos[o+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
   const a=Nn[i],b=Nn[i+1],d=Nn[i+2];let nx=ne[0]*a+ne[3]*b+ne[6]*d,ny=ne[1]*a+ne[4]*b+ne[7]*d,nz=ne[2]*a+ne[5]*b+ne[8]*d;const l=Math.hypot(nx,ny,nz)||1;
   nor[o]=nx/l;nor[o+1]=ny/l;nor[o+2]=nz/l;col[o]=c.r;col[o+1]=c.g;col[o+2]=c.b;o+=3}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeBoundingSphere();return g}
const bMat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});

