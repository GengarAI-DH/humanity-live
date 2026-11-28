# Model sheet: renders every instanced shape in the world (animals, people, vehicles,
# trees, sea life) on its own in daylight, from the side, front three-quarter and top,
# with its triangle count and height next to a person. Much faster than finding the
# thing in the world (Cretaceous views are often at night) and shows exact proportions.
#   python3 models.py                       all shapes -> shots/models/sheet.png
#   python3 models.py thero cera sauro      only names containing these words
#   python3 models.py --js new.js thero     also render shapes from new.js next to the
#                                           live ones, without touching tpl.html
#   python3 models.py --save m.json         save triangle counts; --compare m.json shows
#                                           the change per shape
#   python3 models.py --list                just print names, triangles, max instances
# new.js is page code that evaluates to {name: geometry or [geometries]}; THREE, mergeG,
# BASE and every page global are in scope, e.g.
#   ({thero2: [new THREE.SphereGeometry(.5,6,4).scale(.012,.015,.03).translate(0,.031,0)]})
# Shapes face +z (forward) with +y up, as setInst places them.
# Flags (printed with !, exit 1): an animal over 300 triangles, any other shape over 600.
import asyncio, base64, json, os, re, sys, argparse
from harness import browser, open_year, ROOT

ANIMALS = {'thero', 'sauro', 'cera', 'stego', 'ankylo', 'spino', 'ptero', 'plesio', 'fish',
           'whale', 'bird', 'horse', 'body', 'head', 'hum', 'fig', 'swarm'}


def names_from_tpl():
    src = open(os.path.join(ROOT, 'tpl.html'), encoding='utf-8').read()
    return sorted(set(re.findall(r'\b([A-Za-z_]\w*)=mkI?\(', src)))


GATHER = r"""([globals_, extra])=>{
 if(typeof specInit==='function'){try{specInit()}catch(e){}}
 const out={};const add=(n,o)=>{if(!o)return;const g=o.isBufferGeometry?o:o.geometry;if(!g||!g.attributes||!g.attributes.position)return;
   out[n]={g,max:o.isInstancedMesh?o.instanceMatrix.count:1}};
 for(const n of globals_){let o;try{o=eval(n)}catch(e){continue}if(o&&o.isInstancedMesh)add(n,o)}
 if(typeof WMESH!=='undefined')for(const k in WMESH)add('WMESH.'+k,WMESH[k]);
 if(typeof treeM!=='undefined')for(const k in treeM)add('treeM.'+k,treeM[k]);
 if(extra){const X=eval(extra);for(const k in X){const v=X[k];add('new.'+k,Array.isArray(v)?mergeG(v):v)}}
 // drop duplicates (WMESH.hum is homB etc.)
 const seen=new Map();for(const k of Object.keys(out)){const u=out[k].g.uuid;if(seen.has(u)){const a=seen.get(u);if(k.length<a.length){delete out[a];seen.set(u,k)}else delete out[k]}else seen.set(u,k)}
 window.__MODELS=out;
 const tri=g=>(g.index?g.index.count:g.attributes.position.count)/3;
 return Object.keys(out).sort().map(k=>{const g=out[k].g;g.computeBoundingBox();const b=g.boundingBox;
   return {name:k,tris:Math.round(tri(g)),max:out[k].max,size:[b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z]}})}"""

RENDER = r"""([names,T,human])=>{
 const W=T*3,H=T+34,cv=document.createElement('canvas');cv.width=W;cv.height=T;
 const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true});r.setSize(W,T,false);r.setClearColor(0xdfe6ec);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x6b6455,.75));const d=new THREE.DirectionalLight(0xffffff,.7);d.position.set(.6,1,.8);sc.add(d);
 const mat=new THREE.MeshLambertMaterial({color:0xb08a62}),wire=new THREE.MeshBasicMaterial({color:0x3a2a1a,wireframe:true,transparent:true,opacity:.18});
 const out=[];
 for(const n of names){const M=window.__MODELS[n];if(!M)continue;const g=M.g.clone();
   if(g.attributes.color)g.deleteAttribute('color');if(!g.attributes.normal)g.computeVertexNormals();
   g.computeBoundingBox();const b=g.boundingBox,c=new THREE.Vector3();b.getCenter(c);const sz=new THREE.Vector3();b.getSize(sz);const R=Math.max(sz.x,sz.y,sz.z)*.62||1;
   const m=new THREE.Mesh(g,mat),w=new THREE.Mesh(g,wire);sc.add(m);sc.add(w);
   const gr=new THREE.Mesh(new THREE.PlaneGeometry(R*6,R*6).rotateX(-Math.PI/2).translate(c.x,b.min.y-R*.002,c.z),new THREE.MeshLambertMaterial({color:0xc9c2b2}));sc.add(gr);
   const cam=new THREE.OrthographicCamera(-R,R,R,-R,-R*20,R*20);
   const views=[[1,0,0],[.75,.45,.9],[0,1,0.0001]];
   const c2=document.createElement('canvas');c2.width=W;c2.height=H;const x=c2.getContext('2d');
   views.forEach((v,i)=>{r.setViewport(i*T,0,T,T);r.setScissor(i*T,0,T,T);r.setScissorTest(true);
     cam.position.set(c.x+v[0]*R*5,c.y+v[1]*R*5,c.z+v[2]*R*5);cam.up.set(0,i==2?0:1,i==2?1:0);cam.lookAt(c);cam.updateProjectionMatrix();gr.visible=i!=2;r.render(sc,cam)});
   x.fillStyle='#fff';x.fillRect(0,0,W,H);x.drawImage(cv,0,0);
   x.strokeStyle='#888';for(let i=1;i<3;i++){x.beginPath();x.moveTo(i*T,0);x.lineTo(i*T,T);x.stroke()}
   const tri=Math.round((g.index?g.index.count:g.attributes.position.count)/3);
   x.fillStyle='#111';x.font='bold 15px sans-serif';x.fillText(n,6,T+16);
   x.font='13px sans-serif';x.fillStyle=tri>600?'#c00':'#333';
   x.fillText(tri+' tris  x'+M.max+'  h '+(sz.y/human).toFixed(2)+' person  L '+(sz.z/human).toFixed(2),6,T+31);
   x.fillStyle='#555';x.font='11px sans-serif';['side','front 3/4','top'].forEach((t,i)=>x.fillText(t,i*T+T-62,12));
   out.push([n,c2.toDataURL('image/png')]);sc.remove(m);sc.remove(w);sc.remove(gr);g.dispose()}
 r.dispose();return out}"""


async def main(a):
    extra = open(a.js).read() if a.js else None
    async with browser() as (b, base):
        pg, errs = await open_year(b, base, a.year, wait=4000)
        await pg.wait_for_function("()=>window.HS&&HS.X(\"typeof WMESH!=='undefined'&&!!WMESH.thero\")", timeout=60000)
        # the page's code sits in a block, so run inside it through the test hook HS.X (eval)
        info = await pg.evaluate("([s,a])=>HS.X('('+s+')')(a)", [GATHER, [names_from_tpl(), extra]])
        human = next((i['size'][1] for i in info if i['name'] == 'bodyM'), .026)
        want = [i for i in info if not a.names or any(w in i['name'] for w in a.names)
                or i['name'].startswith('new.')]
        old = json.load(open(a.compare)) if a.compare else {}
        bad = 0
        for i in want:
            lim = 300 if any(k in i['name'].lower() for k in ANIMALS) else 600
            flag = ' !' if i['tris'] > lim else ''
            bad += bool(flag)
            d = ''
            if i['name'] in old:
                o = old[i['name']]
                d = f"  was {o:5d} ({(i['tris'] - o) / max(o, 1) * 100:+.0f}%)" if o != i['tris'] else '  same'
            print(f"{i['name']:>16}  {i['tris']:5d} tris  x{i['max']:<6d} h {i['size'][1] / human:5.2f} person"
                  f"  L {i['size'][2] / human:5.2f}{d}{flag}")
        if a.save:
            json.dump({i['name']: i['tris'] for i in info}, open(a.save, 'w'), indent=1)
        if errs:
            print('page errors:', *errs[:3], sep='\n  ')
        if a.list:
            return bad
        tiles = await pg.evaluate(RENDER, [[i['name'] for i in want], a.tile, human])
        os.makedirs(a.out, exist_ok=True)
        files = []
        for n, url in tiles:
            f = os.path.join(a.out, re.sub(r'\W', '_', n) + '.png')
            open(f, 'wb').write(base64.b64decode(url.split(',', 1)[1]))
            files.append(f)
        await pg.close()
    sheet(files, os.path.join(a.out, 'sheet.png'), a.cols)
    print(f'{len(files)} shapes -> {os.path.join(a.out, "sheet.png")}')
    return bad


def sheet(files, out, cols):
    from PIL import Image
    ims = [Image.open(f) for f in files]
    if not ims:
        return
    w, h = ims[0].size
    rows = (len(ims) + cols - 1) // cols
    S = Image.new('RGB', (w * cols, h * rows), 'white')
    for k, im in enumerate(ims):
        S.paste(im, ((k % cols) * w, (k // cols) * h))
    S.save(out)


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('names', nargs='*', help='only shapes whose name contains one of these')
    ap.add_argument('--js', help='file of page code returning {name: geometry or [geometries]} to preview')
    ap.add_argument('--year', default='-70000000', help='year to open (default Cretaceous)')
    ap.add_argument('--out', default=os.path.join(ROOT, 'shots', 'models'))
    ap.add_argument('--tile', type=int, default=220, help='pixels per view')
    ap.add_argument('--cols', type=int, default=2)
    ap.add_argument('--save'); ap.add_argument('--compare')
    ap.add_argument('--list', action='store_true')
    a = ap.parse_args()
    sys.exit(1 if asyncio.run(main(a)) else 0)
