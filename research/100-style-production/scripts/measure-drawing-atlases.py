from pathlib import Path
import json
import numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[1]
keys=['pencil-sketch','colored-pencil','charcoal','pen-hatching','wax-crayon','soft-pastel','marker-sketch']
for key in keys:
 suffix='-v2'if key in ['charcoal','pen-hatching']else'';p=R/'shared/rasters'/f'{key}-atlas{suffix}.png';im=Image.open(p);assert im.mode=='RGBA';a=np.asarray(im)[:,:,3];h,w=a.shape
 # Locate the actual empty valley between upper and lower drawings separately
 # in each column. This reads original alpha only; no pixels are altered.
 cuts=[];boxes={};separations={'pencil-sketch':[650,610],'colored-pencil':[632,606],'charcoal':[653,635],'pen-hatching':[663,625],'wax-crayon':[662,659],'soft-pastel':[620,625],'marker-sketch':[635,610]}
 for col in [0,1]:
  x0=0 if col==0 else w//2;x1=w//2 if col==0 else w
  strength=(a[:,x0:x1]>80).sum(axis=1);lo,hi=int(h*.43),int(h*.58);best=separations[key][col];cuts.append(best)
  for upper,kind in [(True,'bag'if col==0 else'coin'),(False,'shield'if col==0 else'weight')]:
   y0,y1=(0,best)if upper else(best,h);ys,xs=np.where(a[y0:y1,x0:x1]>12);assert len(xs)>1000
   bx=max(x0,x0+int(xs.min())-3);by=max(y0,y0+int(ys.min())-3);ex=min(x1,x0+int(xs.max())+4);ey=min(y1,y0+int(ys.max())+4);boxes[kind]=[bx,by,ex-bx,ey-by]
 data=dict(width=w,height=h,boxes=boxes,regionBoundaries=cuts,method='Read original alpha inside author-selected separation valleys; preserve silhouettes and nearby construction marks. SVG regional clips isolate drawings; source pixels unchanged.')
 (R/'shared/rasters'/f'{key}-geometry{suffix}.json').write_text(json.dumps(data,indent=2)+'\n');print(key,'split',cuts,'boxes',boxes)
