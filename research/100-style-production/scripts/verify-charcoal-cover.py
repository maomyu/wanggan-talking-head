from pathlib import Path
import json,hashlib,subprocess,io
from PIL import Image
import numpy as np
R=Path(__file__).resolve().parents[1];v=R/'variants/charcoal/outputs/final.mp4';proof=json.loads((R/'qa/charcoal-verification.json').read_text());assert proof['ok']and hashlib.sha256(v.read_bytes()).hexdigest()==proof['sha256']
frames=[387,388,460,461,615,616,855,856];rows=[]
plan=json.loads((R/'edit-plan.json').read_text());indices=sorted(set([0,567,plan['frameCount']-1]+[round(t*30)for t in plan['qaTimes']]+[s['startFrame']+d for s in plan['scenes'][1:]for d in [-1,0,1]]));folder=R/'qa'/('proof-charcoal-'+proof['sha256'][:10]);cached={n:folder/f'{i+1:03d}.png'for i,n in enumerate(indices)}
for n in frames:
 if cached[n].exists():im=Image.open(cached[n]).convert('RGB')
 else:
  data=subprocess.check_output(['ffmpeg','-threads','2','-filter_threads','2','-v','error','-i',str(v),'-vf',f'select=eq(n\\,{n})','-frames:v','1','-f','image2pipe','-vcodec','png','pipe:1']);im=Image.open(io.BytesIO(data)).convert('RGB')
 region=np.asarray(im.crop((68,539,1012,1231))).astype(float);delta=np.abs(region-np.array([212,212,202]));coverage=float((delta.max(axis=2)<12).mean());mae=float(delta.mean());assert coverage>.995 and mae<4,(n,coverage,mae)
 rows.append(dict(frame=n,artColorCoverage=coverage,colorMAE=mae))
(R/'qa/charcoal-encoded-cover.json').write_text(json.dumps(dict(ok=True,sha256=proof['sha256'],target='actual encoded art region; full cut neighbours after presenter settles outside region',results=rows),indent=2)+'\n');print('Encoded transition colour coverage verified at eight cut-neighbour frames')
