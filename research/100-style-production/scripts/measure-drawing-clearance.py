from pathlib import Path
import json,re,hashlib,sys
import numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[1];encoded='--encoded'in sys.argv;keys=['pencil-sketch','colored-pencil','charcoal','pen-hatching','wax-crayon','soft-pastel','marker-sketch','brush-lettering'];rows=[]
def palette(key):
 s=(R/'variants'/key/'assets/look.js').read_text();return json.loads(re.search(r'export const LOOK=(\{.*\});',s).group(1))['palette']
def rgb(value):return np.array([int(value[i:i+2],16)for i in [1,3,5]])
def gap(path,colors,brush=False):
 im=np.asarray(Image.open(path).convert('RGB')).astype(int);x0,y0,x1,y1=(180,1000,920,1150)if brush else(410,1040,660,1200);part=im[y0:y1,x0:x1];ink=np.max(abs(part-rgb(colors['fg'])),axis=2)<18;line=np.max(abs(part-rgb(colors['accent'])),axis=2)<18;
 # These overlapping vertical windows isolate the known target glyph and
 # curve. The gray curve color also occurs on antialiased dark glyph edges.
 # The shared 1080..1090 band remains measurable for any actual collision.
 if not brush:
  ink[:40]=False;line[50:]=False
 iy=np.where(ink)[0];ly=np.where(line)[0];assert len(iy)>100 and len(ly)>100,(path,'missing ink or line')
 return int(ly.min()-iy.max()-1)if brush else int(iy.min()-ly.max()-1)
for key in keys:
 brush=key=='brush-lettering';time=24.4 if brush else 11.5;path=R/'qa'/f'{key}-{time:g}s.jpg'if encoded else R/'variants'/key/'qa/design-frames'/('frame-0732.png'if brush else'frame-0345.png');distance=gap(path,palette(key),brush);assert distance>=10,(key,distance)
 row=dict(key=key,time=time,separationPixels=distance,scope='实际像素中强调线与字形的垂直留白；不以DOM框代替字形')
 if encoded:row['sha256']=hashlib.sha256((R/'variants'/key/'outputs/final.mp4').read_bytes()).hexdigest()
 rows.append(row)
report=dict(ok=True,encoded=encoded,results=rows)
(R/'qa'/('batch05-encoded-clearance.json'if encoded else'batch05-native-clearance.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps([(r['key'],r['separationPixels'])for r in rows]))
