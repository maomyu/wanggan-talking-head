from pathlib import Path
import json,sys
import numpy as np
from PIL import Image

R=Path(__file__).resolve().parents[1];encoded='--encoded'in sys.argv
read=lambda p:json.loads(p.read_text());plan=read(R/'edit-plan.json')
frames=sorted(set([0,567,plan['frameCount']-1]+[round(t*30)for t in plan['qaTimes']]+[s['startFrame']+d for s in plan['scenes'][1:]for d in [-1,0,1]]))
records=[]
for key,t,box,color,edge,side in [('folk-woodblock',14.4,(100,1045,1000,1160),(52,48,37),1062.5,'after'),('folk-woodblock',11.5,(100,1000,1000,1070),(52,48,37),1077.5,'before'),('porcelain-painting',24.4,(150,1142,950,1235),(42,66,100),1135,'after')]:
 sha=None
 if encoded:
  proof=read(R/'qa'/f'{key}-verification.json');assert proof['ok'];sha=proof['sha256'];file=R/'qa'/f'proof-{key}-{sha[:10]}'/f'{frames.index(round(t*30))+1:03d}.png'
 else:file=R/'variants'/key/'qa/design-frames'/f'frame-{round(t*30):04d}.png'
 a=np.asarray(Image.open(file).convert('RGB')).astype(int);x0,y0,x1,y1=box;pixels=a[y0:y1,x0:x1];mask=np.max(abs(pixels-np.array(color)),axis=2)<8;yy,xx=np.where(mask);assert len(yy)>80,(key,'No actual keyword ink in expected band')
 first=float(yy.min()+y0);last=float(yy.max()+y0);gap=first-edge if side=='after'else edge-last;assert gap>=16,(key,'Material boundary and word too close',gap)
 records.append(dict(key=key,time=t,actualFirstInkY=first,actualLastInkY=last,edgeY=edge,wordSide=side,gapPixels=gap,sha256=sha))
name='batch07-clearance-'+('encoded'if encoded else'native')+'.json'
(R/'qa'/name).write_text(json.dumps(dict(ok=True,encoded=encoded,records=records,scope='实际PNG字形墨迹至画屏边线的空白；瓷绘风险段已删除无作用横线，以完整盘图600px下界作保守边界。非DOM文字框，普通读字与实际成片另查'),ensure_ascii=False,indent=2)+'\n')
print('Actual keyword gaps:',[(r['key'],r['gapPixels'])for r in records])
