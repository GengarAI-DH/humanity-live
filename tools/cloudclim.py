# Usage: python3 cloudclim.py tcdc.eatm.mon.ltm.1991-2020.nc ../public/tex/clouds.jpg /tmp/preview
# Source file: https://psl.noaa.gov/thredds/fileServer/Datasets/ncep.reanalysis.derived/other_gauss/tcdc.eatm.mon.ltm.1991-2020.nc
# (NCEP/NCAR Reanalysis 1, Kalnay et al. 1996; NOAA PSL, free to use with credit). Output: 180x1080 grey JPEG, month m in rows 90m..90m+89,
# value/255 = mean total cloud fraction, 2-degree cells from 90N, from 180W; smoothed 1 cell to remove the spectral ringing.
# NCEP/NCAR Reanalysis 1 total cloud cover, long-term monthly mean 1991-2020 (NOAA PSL) -> 2-degree grid, 12 months stacked.
import h5py,numpy as np,sys
from PIL import Image
f=h5py.File(sys.argv[1],'r');a=f['tcdc'][:].astype(np.float64);lat=f['lat'][:];lon=f['lon'][:]
W,H=180,90;out=np.zeros((12,H,W))
la=90-(np.arange(H)+.5)*2;lo=-180+(np.arange(W)+.5)*2
# lat index (lat descending) interpolation
li=np.interp(-la,-lat,np.arange(len(lat)));lj=((lo%360)/1.875)
i0=np.floor(li).astype(int);fi=li-i0;i1=np.minimum(i0+1,len(lat)-1)
j0=np.floor(lj).astype(int)%192;fj=lj-np.floor(lj);j1=(j0+1)%192
for m in range(12):
  g=a[m];r0=g[i0][:,j0]*(1-fj)+g[i0][:,j1]*fj;r1=g[i1][:,j0]*(1-fj)+g[i1][:,j1]*fj
  out[m]=r0*(1-fi[:,None])+r1*fi[:,None]
from scipy.ndimage import gaussian_filter
for m in range(12):
  out[m]=gaussian_filter(out[m],sigma=(1.0,1.0),mode=('nearest','wrap'))
img=np.clip(np.round(out*2.55),0,255).astype(np.uint8).reshape(12*H,W)
Image.fromarray(img,'L').save(sys.argv[2],quality=92)
for m in (0,6):Image.fromarray(img[m*H:(m+1)*H]).resize((720,360)).save(sys.argv[3]+f'_m{m}.png')
print(out.mean(), img.shape)
