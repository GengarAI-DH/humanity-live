# Fit the 8 deep-time plates (tools/src/15-terrain.js Q70D) to the Scotese & Wright (2018) PALEOMAP PaleoDEM for 70 Ma
# (Zenodo doi:10.5281/zenodo.5460860, CC BY 4.0). Inputs: plates.json (PLC/LAND/plateQ(k,-70e6) dumped from the page with HS.X)
# and Map17_PALEOMAP_1deg_Late_Cretaceous_70Ma.nc from the 1-degree zip. Each plate is rotated to best cover the PaleoDEM area above -300 m,
# big plates first, then Madagascar from Africa and India from a grid search near 22S 62E. Prints the quaternions for Q70D (q70.json).
import json,numpy as np,h5py
from scipy.spatial.transform import Rotation as R
from scipy.ndimage import gaussian_filter
from scipy.optimize import minimize
d=json.load(open('plates.json')); GW,GH=720,360
P=np.array(list(d['p']),int).reshape(GH,GW); L=np.array(list(d['l']))=='1'; L=L.reshape(GH,GW)
z=h5py.File('Map17_PALEOMAP_1deg_Late_Cretaceous_70Ma.nc','r')['z'][:]
T=gaussian_filter((z>-300).astype(float),1.2,mode='wrap')  # rows lat -90..90, cols lon -180..180
lat=89.75-np.arange(GH)*.5; lon=-179.75+np.arange(GW)*.5
LA,LO=np.meshgrid(lat,lon,indexing='ij')
def vec(la,lo):
    la=np.radians(la);lo=np.radians(lo);return np.stack([np.cos(la)*np.cos(lo),np.cos(la)*np.sin(lo),np.sin(la)],-1)
def samp(v,T=None):
    T=TT if T is None else T
    la=np.degrees(np.arcsin(np.clip(v[:,2],-1,1)));lo=np.degrees(np.arctan2(v[:,1],v[:,0]))
    fi=la+90; fj=lo+180; i0=np.clip(np.floor(fi).astype(int),0,179); j0=np.clip(np.floor(fj).astype(int),0,359); ti=fi-i0; tj=fj-j0
    return (T[i0,j0]*(1-ti)*(1-tj)+T[i0+1,j0]*ti*(1-tj)+T[i0,j0+1]*(1-ti)*tj+T[i0+1,j0+1]*ti*tj)
out={}
OCC=np.zeros_like(T)
for k in ['af','eu','na','sa','an','au','md','in']:
    idx=d['PORDER'].index(k); TT=np.clip(T-OCC,0,1)
    m=(P==idx)&L
    # subsample
    ys,xs=np.nonzero(m); sel=np.arange(len(ys))[::3]; ys,xs=ys[sel],xs[sel]
    V=vec(LA[ys,xs],LO[ys,xs]); w=np.cos(np.radians(LA[ys,xs])); Q0=R.from_quat(d['q'][k])
    if k=='md': Q0=R.from_quat(out['af'])
    if k=='in':
        a=vec(np.array([20.]),np.array([79.]))[0]; b=vec(np.array([-22.]),np.array([62.]))[0]; bestg=None
        for dla in range(-10,11,3):
            for dlo in range(-10,11,3):
                b=vec(np.array([-22.+dla]),np.array([62.+dlo]))[0]; ax=np.cross(a,b); Qm=R.from_rotvec(ax/np.linalg.norm(ax)*np.arccos(np.dot(a,b)))
                for sp in range(-90,91,10):
                    Qc=R.from_rotvec(b*np.radians(sp))*Qm; sc=(samp(Qc.apply(V))*w).sum()/w.sum()
                    if bestg is None or sc>bestg[0]: bestg=(sc,Qc,dla,dlo,sp)
        print('grid',bestg[0],bestg[2:]); Q0=bestg[1]
    f=lambda x:-(samp((R.from_rotvec(x)*Q0).apply(V))*w).sum()/w.sum()
    best=None
    for st in [np.zeros(3)]+([] if k in('in','md') else [np.random.RandomState(s).normal(0,.06 if k!="in" else .25,3) for s in range(16)]):
        r=minimize(f,st,method='Nelder-Mead',options={'xatol':1e-4,'fatol':1e-5,'maxiter':3000})
        if np.degrees(np.linalg.norm(r.x))<(12 if k=='md' else 25 if k=='in' else 40) and (best is None or r.fun<best.fun): best=r
    Q=R.from_rotvec(best.x)*Q0
    print(k,'before',round(-f(np.zeros(3)),3),'after',round(-best.fun,3),'moved deg',round(np.degrees(np.linalg.norm(best.x)),1))
    out[k]=list(Q.as_quat())
    # mark occupied (paleo cells of this plate's land), all its cells
    ys,xs=np.nonzero(m); V2=Q.apply(vec(LA[ys,xs],LO[ys,xs])); la=np.degrees(np.arcsin(np.clip(V2[:,2],-1,1)));lo=np.degrees(np.arctan2(V2[:,1],V2[:,0]))
    O=np.zeros_like(T); O[np.clip(np.round(la+90).astype(int),0,180),np.clip(np.round(lo+180).astype(int),0,360)]=1; OCC=np.maximum(OCC,gaussian_filter(O,1.0)*2)
json.dump(out,open('q70.json','w'))
