from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image, ImageFilter

R=Path(__file__).resolve().parents[1]
P=R/'variants/natural-history'
read=lambda p:json.loads(p.read_text())
proof=read(R/'qa/natural-history-verification.json')
assert proof['ok'] and proof['sha256']==hashlib.sha256((P/'outputs/final.mp4').read_bytes()).hexdigest()
old=read(P/'qa/revisions/observation-before/natural-history-verification.json')
assert proof['sha256']!=old['sha256'], 'The revised encode must differ from the old file'
plan=read(R/'edit-plan.json')
g=json.loads((P/'assets/atlas-geometry.js').read_text().removeprefix('export default ').strip().removesuffix(';'))
atlas=Image.open(P/'assets/atlas.png').convert('RGBA')
background=Image.new('RGBA',atlas.size,'#fcfaf1')
background.alpha_composite(atlas)
source=background.convert('RGB')
indices=sorted(set([0,567,plan['frameCount']-1]+[round(t*30)for t in plan['qaTimes']]+[s['startFrame']+d for s in plan['scenes'][1:]for d in [-1,0,1]]))

def measure(check_sha):
 rows=[]
 for t,kind in [(18.9,'bag'),(24.4,'shield')]:
  im=Image.open(R/'qa'/('proof-natural-history-'+check_sha[:10])/f'{indices.index(round(t*30))+1:03d}.png').convert('RGB')
  b=g['boxes'][kind];ms=455/max(b[2:]);k=900/max(b[2:]);cx=b[0]+b[2]*.53;cy=b[1]+b[3]*.38
  ax=64+45+(455-b[2]*ms)/2+b[2]*.53*ms
  ay=535+90+(455-b[3]*ms)/2+b[3]*.38*ms
  metrics=[]
  for label,s,x,y in [('main',ms,ax,ay),('inset',k,794,775)]:
   x0=round(x-32);y0=round(y-32)
   ref=source.transform((64,64),Image.Transform.AFFINE,(1/s,0,cx+(x0-x)/s,0,1/s,cy+(y0-y)/s),Image.Resampling.BICUBIC)
   actual=im.crop((x0,y0,x0+64,y0+64))
   delta=np.asarray(actual).astype(float)-np.asarray(ref).astype(float)
   # Chromium and Pillow resample fine grain differently. Use the same 1px
   # analysis-only blur on both ROIs to test shape alignment; retain raw errors.
   structural=np.asarray(actual.filter(ImageFilter.GaussianBlur(1))).astype(float)-np.asarray(ref.filter(ImageFilter.GaussianBlur(1))).astype(float)
   mae=float(abs(structural).mean());mean=delta.mean(axis=(0,1))
   metrics.append(dict(role=label,meanAbsoluteRGBError=float(abs(delta).mean()),structuralMAE=mae,meanRGBError=mean.tolist(),ok=bool(mae<6 and max(abs(mean))<6)))
  rows.append(dict(time=t,kind=kind,sourceCenter=[cx,cy],mainCenter=[ax,ay],insetCenter=[794,775],magnification=k/ms,sourceCircleRadius=122*ms/k,metrics=metrics))
 return rows

rows=measure(proof['sha256']);negative=measure(old['sha256'])
assert all(m['ok']for row in rows for m in row['metrics']), rows
assert all(not next(m for m in row['metrics']if m['role']=='inset')['ok']for row in negative), 'Known wrong magnification must fail'
report=dict(ok=True,sha256=proof['sha256'],results=rows,negativeControl=dict(sha256=old['sha256'],bothOldInsetsRejected=True,results=negative),scope='两次完整显现的实际编码，主图与局部各取64px内区，与同一源图区域的独立仿射映射比较；1px分析滤波抑制不同重采样核的细颗粒差异，同时约束原始均色，旧版两处局部均必须拒绝。仅QA数值分析，不修改生产图片。')
(R/'qa/batch06-observation-region-encoded.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('New main/inset source regions agree; both old inset negative controls rejected')
