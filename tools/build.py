import subprocess
subprocess.run(['node','cards.js'],check=False)
t=open('tpl.html').read(); m=open('mask.b64').read(); tp=open('topo.b64').read()
open('index.html','w').write(t.replace('__MASK__',m).replace('__TOPO__',tp).replace('__THREE__','https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'))
open('test.html','w').write(t.replace('__MASK__',m).replace('__TOPO__',tp).replace('<script src="__THREE__"></script>','<script>window.__TEST=1;if(location.hash)window.__TESTY=+location.hash.slice(1)</script><script src="node_modules/three/build/three.min.js"></script>'))
