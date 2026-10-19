from pathlib import Path
import json,sys
import numpy as np
from PIL import Image

R=Path(__file__).resolve().parents[1];encoded='--encoded'in sys.argv
keys=['chased-metal','miniature-puppet','building-blocks','optical-glass','ceramic-objects','liquid-chrome','isometric-maquette','inflatable-sculpture','viscous-gel','holographic-volume']
read=lambda p:json.loads(p.read_text());plan=read(R/'edit-plan.json')
frames=sorted(set([0,567,plan['frameCount']-1]+[round(t*30)for t in plan['qaTimes']]+[s['startFrame']+d for s in plan['scenes'][1:]for d in [-1,0,1]]))
records=[]
for key in keys:
 sha=None
 if encoded:
  proof=read(R/'qa'/f'{key}-verification.json');assert proof['ok'];sha=proof['sha256'];file=R/'qa'/f'proof-{key}-{sha[:10]}'/f'{frames.index(732)+1:03d}.png'
 else:file=R/'variants'/key/'qa/design-frames/frame-0732.png'
 # Sample a known blank point outside the risk object, below the volume canvas.
 # The puppet uses its inner stage background, others the root reading surface.
 # Both keyword and material are read from the actual image. A blank row
 # must span this whole art band; text boxes are not used as ink bounds.
 a=np.asarray(Image.open(file).convert('RGB')).astype(int)
 bg=a[1100,900];band=a[940:1232,150:930]
 occupied=np.max(abs(band-bg),axis=2).max(axis=1)>12
 runs=[];start=None
 for i,ink in enumerate(occupied):
  if not ink and start is None:start=i
  if ink and start is not None:
   if start>0:runs.append((start,i))
   start=None
 # The object occupies the top portion; the keyword occupies the bottom.
 # Locate the end of the blank separator at the keyword's reading band.
 # Search begins at y940 to include even the smaller, settled gel envelope.
 # The minimum clear gap remains16pixels; not a DOM-box distance.
 runs=[(x,y)for x,y in runs if 1135<=y+940<=1195]
 assert runs,(key,'No complete empty separator found')
 x,y=max(runs,key=lambda v:v[1]-v[0]);gap=y-x
 assert gap>=16,(key,'Visible material and keyword too close',gap)
 records.append(dict(key=key,time=24.4,emptyFromY=x+940,firstNextInkY=y+940,visibleGapPixels=gap,sha256=sha))
name='batch09-clearance-'+('encoded'if encoded else'native')+'.json'
(R/'qa'/name).write_text(json.dumps(dict(ok=True,encoded=encoded,records=records,scope='实际像素相对同帧空底色差超过12的可见边界，取主材料与风险重点词之间横跨780px的完整空行，不是DOM行盒；细微低对比纸边不等于有信息墨迹。代表帧抽样，不声称全帧碰撞证明'),ensure_ascii=False,indent=2)+'\n')
print('Actual visible separators:',[(s['key'],s['visibleGapPixels'])for s in records])
