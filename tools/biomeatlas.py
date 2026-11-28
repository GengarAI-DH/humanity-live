# Builds public/tex/biomes.jpg: 64x32-pixel samples of NASA Blue Marble: Next Generation (public domain, NASA Earth Observatory,
# Stockli et al. 2005), cut from public/tex/bluemarble.jpg at the same scale (2048x1024, 5.69 px per degree), one row per biome class,
# 4 samples per row (fewer repeat). Rows: 0 rainforest, 1 temperate broadleaf, 2 boreal, 3 dry woodland/savanna, 4 desert, 5 steppe.
# Used by applyClimate to "paint by biome": deep-time land and exposed ice-age shelves get real satellite texture from a present-day
# area of the same biome instead of flat model colours.
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
P=2048/360;TW,TH=64,32
ROWS=[[(-6.5,-63),(-1,21.5),(-9,-66),(1.5,24)],          # Amazon, Congo basin (south of the main rivers)
 [(50.5,20),(37.5,-84),(28.5,113),(47,21)],               # Poland/Slovakia, Appalachians, southern China hills, Hungary
 [(51.8,-73.5),(63.5,29),(50.5,-86),(61.5,27)],           # Quebec, Karelia, northern Ontario, southern Finland (lakes filled in)
 [(-30,-63),(-13.5,-47),(-12,22),(-21,133)],              # Chaco seco, Brazilian cerrado, Zambezian miombo, Australian savanna
 [(23.5,9),(20.5,48),(25,14),(19,49)],                      # Sahara, Rub' al Khali
 [(50,64),(50.5,74),(40,-99),(49.5,69)]]                  # Kazakh steppe, Great Plains
im=Image.open('../public/tex/bluemarble.jpg').convert('RGB');A=Image.new('RGB',(TW*4,TH*len(ROWS)))
for r,row in enumerate(ROWS):
  for c,(la,lo) in enumerate(row):
    x=int(round((lo+180)*P-TW/2));y=int(round((90-la)*P-TH/2));t=np.asarray(im.crop((x,y,x+TW,y+TH))).astype(float)
    R_,G_,B_=t[...,0],t[...,1],t[...,2];mx=t.max(2);mn=t.min(2)
    bad=(B_>R_+12)|((B_>25)&(R_<30)&(G_<B_+20))|((mx>150)&(mx-mn<45))|(mx<14)   # lakes, sea, snow, cloud, deep shadow
    ok=(~bad).astype(float);bad=np.repeat(bad[...,None],3,2)
    num=ndi.gaussian_filter(t*ok[...,None],(4,4,0),mode='wrap');den=ndi.gaussian_filter(ok,4,mode='wrap')[...,None]
    t=np.where(bad,num/np.maximum(den,1e-3),t);A.paste(Image.fromarray(np.clip(t,0,255).astype('uint8')),(c*TW,r*TH))
A.save('../public/tex/biomes.jpg',quality=90);A.resize((A.width*4,A.height*4),Image.NEAREST).save('/tmp/claude-0/s/atlas_big.png')
