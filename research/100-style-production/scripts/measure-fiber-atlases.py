from pathlib import Path
import json,argparse
import numpy as np
from PIL import Image

R=Path(__file__).resolve().parents[1];rows=[]
parser=argparse.ArgumentParser()
parser.add_argument('--keys',nargs='+',default=['patchwork','silk-layers','folk-woodblock','porcelain-painting'])
parser.add_argument('--report',default='batch07-atlas-regions.json')
options=parser.parse_args()
for key in options.keys:
 p=R/'shared/rasters'/f'{key}-atlas.png';im=Image.open(p);assert im.mode=='RGBA';a=np.asarray(im)[:,:,3];h,w=a.shape
 occupied=a>80
 x0,x1=round(w*.45),round(w*.57);y0,y1=round(h*.45),round(h*.57)
 xs=np.where(occupied[:,x0:x1].sum(axis=0)==0)[0]+x0
 ys=np.where(occupied[y0:y1,:].sum(axis=1)==0)[0]+y0
 assert len(xs)>3 and len(ys)>3,(key,'No clear common gutter; review the original atlas')
 cx=int(np.median(xs));cy=int(np.median(ys));assert not occupied[:,cx].any()and not occupied[cy,:].any()
 boxes={}
 for kind,(lx,ly,rx,ry)in zip(['bag','coin','shield','weight'],[(0,0,cx,cy),(cx,0,w,cy),(0,cy,cx,h),(cx,cy,w,h)]):
  yy,xx=np.where(a[ly:ry,lx:rx]>12);assert len(xx)>1000
  left=max(lx,lx+int(xx.min())-3);top=max(ly,ly+int(yy.min())-3);right=min(rx,lx+int(xx.max())+4);bottom=min(ry,ly+int(yy.max())+4)
  boxes[kind]=[left,top,right-left,bottom-top]
 data=dict(width=w,height=h,boxes=boxes,regionBoundaries=[cx,cy],method='Read the actual shared zero-alpha valleys above threshold 80, then isolate four whole regions with low-alpha edge padding. No production pixels altered.')
 (p.parent/f'{key}-geometry.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 rows.append(dict(key=key,cuts=[cx,cy],verticalGutter=[int(xs.min()),int(xs.max())],horizontalGutter=[int(ys.min()),int(ys.max())],boxes=boxes,opaquePixelsOnBothCuts=0))
 print(key,'measured gutters',[cx,cy],flush=True)
(R/'qa'/options.report).write_text(json.dumps(dict(ok=True,records=rows,scope='测原始透明图集的实际间隙；避免简单四等分切掉完整对象或带入邻区碎片，保留全部原始像素。原图区域测量不代表已完成视频。'),ensure_ascii=False,indent=2)+'\n')
