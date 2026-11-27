# Builds public/index.html from tools/tpl.html (run from the repo root: python3 tools/build.py)
t=open('tools/tpl.html').read(); m=open('tools/mask.b64').read().strip()
open('public/index.html','w').write(t.replace('__MASK__',m).replace('__THREE__','https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'))
