from pathlib import Path
import json,sys,hashlib,numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[1];encoded='--encoded'in sys.argv;f=R/'qa/silhouette-fable-24.4s.jpg'if encoded else R/'variants/silhouette-fable/qa/design-frames/frame-0732.png'
a=np.asarray(Image.open(f).convert('RGB')).astype(int);part=a[1116:1235,100:1000];m=np.max(abs(part-np.array([244,231,200])),axis=2)<20;y,x=np.where(m);assert len(y)>100;gap=int(y.min()+1116-1115);assert gap>=16,('Shadow word overlaps light stage',gap)
d=dict(ok=True,encoded=encoded,measuredGapPixels=gap,scope='实际图像中亮幕底边y1115至下方关键词墨迹的垂直距离，非DOM边框')
if encoded:d['sha256']=hashlib.sha256((R/'variants/silhouette-fable/outputs/final.mp4').read_bytes()).hexdigest()
(R/'qa'/('batch06-shadow-clearance-'+('encoded'if encoded else'native')+'.json')).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print('Shadow word clearance:',gap,'pixels')
